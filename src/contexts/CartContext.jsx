import React, { createContext, useContext, useState, useEffect } from 'react'
import { guestCartAPI, userCartAPI, getImageUrl } from '../utils/api'
import { STORAGE_KEYS } from '../utils/constants'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

// Backend guestCartController only accepts a positive integer (not UUIDs).
function isValidApiGuestCartId(value) {
  if (value == null || typeof value !== 'string') return false
  const s = value.trim()
  if (!/^\d+$/.test(s)) return false
  const n = Number(s)
  return Number.isInteger(n) && n > 0
}

// Helper to get or create guest cart ID
const getGuestCartId = () => {
  let guestCartId = localStorage.getItem(STORAGE_KEYS.GUEST_CART_ID)
  if (!isValidApiGuestCartId(guestCartId)) {
    if (guestCartId) {
      localStorage.removeItem(STORAGE_KEYS.GUEST_CART_ID)
    }
    guestCartId = Math.floor(100000 + Math.random() * 900000).toString()
    localStorage.setItem(STORAGE_KEYS.GUEST_CART_ID, guestCartId)
  }
  return guestCartId
}

// Helper to check if user is logged in
const isLoggedIn = () => {
  return !!localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wasLoggedIn, setWasLoggedIn] = useState(isLoggedIn())
  const [isMerging, setIsMerging] = useState(false)
  const [hasMerged, setHasMerged] = useState(false)

  const mergeGuestCart = async () => {
    if (!isLoggedIn()) return
    
    // Prevent duplicate merges
    if (isMerging || hasMerged) {
      console.log('Cart merge already in progress or completed')
      return
    }
    
    try {
      setIsMerging(true)
      const guestCartId = localStorage.getItem(STORAGE_KEYS.GUEST_CART_ID)
      if (isValidApiGuestCartId(guestCartId)) {
        await userCartAPI.mergeGuestCart(guestCartId)
        localStorage.removeItem(STORAGE_KEYS.GUEST_CART_ID)
        setHasMerged(true)
        await loadCart()
      } else {
        if (guestCartId) localStorage.removeItem(STORAGE_KEYS.GUEST_CART_ID)
        setHasMerged(true)
        await loadCart()
      }
    } catch (error) {
      console.error('Error merging cart:', error)
      // Reset merge state on error so it can be retried
      setIsMerging(false)
      setHasMerged(false)
      throw error
    } finally {
      setIsMerging(false)
    }
  }

  // Load cart on mount and when auth status changes
  useEffect(() => {
    loadCart()
  }, [])

  // Listen for token changes to reload cart (only when auth state actually changes)
  useEffect(() => {
    const handleAuthChange = () => {
      const hasToken = !!localStorage.getItem(STORAGE_KEYS.TOKEN)

      // No change in auth state – do nothing
      if (hasToken === wasLoggedIn) {
        return
      }

      if (hasToken && !wasLoggedIn) {
        // User just logged in - merge cart first (it will load cart after merge)
        setWasLoggedIn(true)
        mergeGuestCart().catch((error) => {
          console.error('Merge failed, loading cart anyway:', error)
          loadCart()
        })
      } else if (!hasToken && wasLoggedIn) {
        // User logged out - reset merge state
        setHasMerged(false)
        setWasLoggedIn(false)
        loadCart()
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.TOKEN) {
        handleAuthChange()
      }
    }

    const handleLoginStatusChanged = () => {
      handleAuthChange()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('loginStatusChanged', handleLoginStatusChanged)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('loginStatusChanged', handleLoginStatusChanged)
    }
  }, [wasLoggedIn])

  const loadCart = async (shouldMergeFirst = false) => {
    try {
      setLoading(true)
      
      if (isLoggedIn()) {
        // Load user cart
        try {
          const cartData = await userCartAPI.get()
          if (cartData && cartData.products) {
            setCart(cartData)
            setCartItems(cartData.products.map(p => {
              const imagePath = p.images?.[0]?.imageUrl || p.thumbnailImage
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                price: parseFloat(p.price),
                discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null,
                thumbnailImage: p.thumbnailImage,
                image: getImageUrl(imagePath),
                quantity: p.cartItem.quantity,
                category: p.category?.name || '',
                caseDetails: p.caseDetails || null,
              }
            }))
          } else {
            setCartItems([])
            setCart(null)
          }
        } catch (error) {
          // If token is invalid/expired, fall back to guest cart
          if (error.isTokenError || (error.message && error.message.includes('Invalid or expired token'))) {
            console.warn('Token expired or invalid, falling back to guest cart')
            // Token already cleared in api.js, update login state
            setWasLoggedIn(false)
            // Now load guest cart
            const guestCartId = getGuestCartId()
            try {
              const cartData = await guestCartAPI.get(guestCartId)
              if (cartData && cartData.products) {
                setCart(cartData)
                setCartItems(cartData.products.map(p => {
                  const imagePath = p.images?.[0]?.imageUrl || p.thumbnailImage
                  return {
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    price: parseFloat(p.price),
                    discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null,
                    thumbnailImage: p.thumbnailImage,
                    image: getImageUrl(imagePath),
                    quantity: p.cartItem.quantity,
                    category: p.category?.name || '',
                    caseDetails: p.caseDetails || null,
                  }
                }))
              } else {
                await guestCartAPI.create(guestCartId)
                setCartItems([])
                setCart(null)
              }
            } catch (guestError) {
              // Create guest cart if not found
              try {
                await guestCartAPI.create(guestCartId)
                setCartItems([])
                setCart(null)
              } catch (e) {
                console.error('Error creating guest cart:', e)
                setCartItems([])
                setCart(null)
              }
            }
          } else {
            // Other errors, just log and set empty cart
            console.error('Error loading user cart:', error)
            setCartItems([])
            setCart(null)
          }
        }
      } else {
        // Load guest cart
        const guestCartId = getGuestCartId()
        try {
          const cartData = await guestCartAPI.get(guestCartId)
          if (cartData && cartData.products) {
            setCart(cartData)
            setCartItems(cartData.products.map(p => {
              const imagePath = p.images?.[0]?.imageUrl || p.thumbnailImage
              return {
                id: p.id,
                slug: p.slug,
                title: p.title,
                price: parseFloat(p.price),
                discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null,
                thumbnailImage: p.thumbnailImage,
                image: getImageUrl(imagePath),
                quantity: p.cartItem.quantity,
                category: p.category?.name || '',
                caseDetails: p.caseDetails || null,
              }
            }))
          } else {
            // Create guest cart if it doesn't exist
            await guestCartAPI.create(guestCartId)
            setCartItems([])
            setCart(null)
          }
        } catch (error) {
          // Create guest cart if not found
          try {
            await guestCartAPI.create(guestCartId)
            setCartItems([])
            setCart(null)
          } catch (e) {
            console.error('Error creating guest cart:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isLoggedIn()) {
        await userCartAPI.addItem(product.id, quantity)
      } else {
        const guestCartId = getGuestCartId()
        await guestCartAPI.addItem(guestCartId, product.id, quantity)
      }
      await loadCart()
      return true
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert(error.message || 'Failed to add item to cart')
      return false
    }
  }

  const removeFromCart = async (productId) => {
    try {
      if (isLoggedIn()) {
        await userCartAPI.removeItem(productId)
      } else {
        const guestCartId = getGuestCartId()
        await guestCartAPI.removeItem(guestCartId, productId)
      }
      await loadCart()
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      alert(error.message || 'Failed to remove item from cart')
      return false
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }
    
    try {
      if (isLoggedIn()) {
        await userCartAPI.updateItem(productId, quantity)
      } else {
        const guestCartId = getGuestCartId()
        await guestCartAPI.updateItem(guestCartId, productId, quantity)
      }
      await loadCart()
      return true
    } catch (error) {
      console.error('Error updating cart quantity:', error)
      alert(error.message || 'Failed to update quantity')
      return false
    }
  }

  const clearCart = async () => {
    try {
      if (isLoggedIn()) {
        await userCartAPI.clear()
      } else {
        // For guest cart, remove items one by one
        const itemsToRemove = [...cartItems]
        for (const item of itemsToRemove) {
          const guestCartId = getGuestCartId()
          await guestCartAPI.removeItem(guestCartId, item.id)
        }
      }
      await loadCart()
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert(error.message || 'Failed to clear cart')
      return false
    }
  }

  /**
   * Buy Now: Clear cart, add product, and mark for buy-now checkout
   * Returns true if successful, allowing caller to navigate to checkout
   */
  const buyNow = async (product, quantity = 1) => {
    try {
      // Clear existing cart first
      await clearCart()
      
      // Add the product
      const success = await addToCart(product, quantity)
      
      if (success) {
        // Mark as buy-now mode (checkout will detect this)
        localStorage.setItem('buyNowMode', 'true')
        localStorage.setItem('buyNowProductId', product.id.toString())
        return true
      }
      return false
    } catch (error) {
      console.error('Error in buy now:', error)
      alert(error.message || 'Failed to process buy now')
      return false
    }
  }


  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId)
  }

  const value = {
    cartItems,
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    buyNow,
    mergeGuestCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    loadCart,
    // Auth flag is always computed from current token so redirects see up-to-date state
    isLoggedIn: isLoggedIn(),
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
