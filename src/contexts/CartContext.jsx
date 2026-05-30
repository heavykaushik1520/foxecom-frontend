import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { guestCartAPI, userCartAPI, getImageUrl } from '../utils/api'
import { STORAGE_KEYS } from '../utils/constants'
import { isMultiModelProduct, getUnitPriceForLine } from '../utils/cartLinePrice'
import { getProductPathSegment } from '../utils/productPath'

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
  const [isMerging, setIsMerging] = useState(false)
  const [hasMerged, setHasMerged] = useState(false)
  /** Last token presence from localStorage — avoids stale React state vs real auth (e.g. logout without event). */
  const lastTokenRef = useRef(!!localStorage.getItem(STORAGE_KEYS.TOKEN))
  const mergeGuestCartRef = useRef(null)
  const loadCartRef = useRef(null)
  const mergeInProgressRef = useRef(false)
  const mergedGuestIdsRef = useRef(new Set())

  const [toast, setToast] = useState({
    open: false,
    message: '',
    variant: 'success',
  })

  const showToast = (message, variant = 'success') => {
    setToast({ open: true, message, variant })
  }

  const redirectToProductForModelSelection = (product) => {
    try {
      const segment = getProductPathSegment(product)
      if (!segment || typeof window === 'undefined') return
      setTimeout(() => {
        window.location.assign(`/product/${segment}`)
      }, 700)
    } catch {
      // keep UX safe even if routing segment generation fails
    }
  }

  useEffect(() => {
    if (!toast.open) return
    const t = setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 3000)
    return () => clearTimeout(t)
  }, [toast.open])

  const mergeGuestCart = async () => {
    if (!isLoggedIn()) return

    const guestCartId = localStorage.getItem(STORAGE_KEYS.GUEST_CART_ID)
    if (!isValidApiGuestCartId(guestCartId)) {
      if (guestCartId) localStorage.removeItem(STORAGE_KEYS.GUEST_CART_ID)
      setHasMerged(true)
      await loadCart()
      return
    }

    // Prevent duplicate merges (state + hard ref lock + per-guest-id guard)
    if (
      isMerging ||
      hasMerged ||
      mergeInProgressRef.current ||
      mergedGuestIdsRef.current.has(guestCartId)
    ) {
      return
    }

    try {
      mergeInProgressRef.current = true
      setIsMerging(true)
      await userCartAPI.mergeGuestCart(guestCartId)
      mergedGuestIdsRef.current.add(guestCartId)
      localStorage.removeItem(STORAGE_KEYS.GUEST_CART_ID)
      setHasMerged(true)
      await loadCart()
    } catch (error) {
      console.error('Error merging cart:', error)
      // Reset merge state on error so it can be retried
      setIsMerging(false)
      setHasMerged(false)
      throw error
    } finally {
      mergeInProgressRef.current = false
      setIsMerging(false)
    }
  }

  // Load cart on mount and when auth status changes
  useEffect(() => {
    loadCart()
  }, [])

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
              const selectedModelId = p.cartItem?.selectedModelId ?? null
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
                selectedModelId,
                availableModels: p.availableModels || null,
                productType: p.productType || null,
                stock: p.stock,
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
            lastTokenRef.current = false
            // Now load guest cart
            const guestCartId = getGuestCartId()
            try {
              const cartData = await guestCartAPI.get(guestCartId)
              if (cartData && cartData.products) {
                setCart(cartData)
                setCartItems(cartData.products.map(p => {
                  const imagePath = p.images?.[0]?.imageUrl || p.thumbnailImage
                  const selectedModelId = p.cartItem?.selectedModelId ?? null
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
                    selectedModelId,
                    availableModels: p.availableModels || null,
                    productType: p.productType || null,
                    stock: p.stock,
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
              const selectedModelId = p.cartItem?.selectedModelId ?? null
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
                selectedModelId,
                availableModels: p.availableModels || null,
                productType: p.productType || null,
                stock: p.stock,
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

  mergeGuestCartRef.current = mergeGuestCart
  loadCartRef.current = loadCart

  useEffect(() => {
    lastTokenRef.current = !!localStorage.getItem(STORAGE_KEYS.TOKEN)

    const handleAuthChange = () => {
      const hasToken = !!localStorage.getItem(STORAGE_KEYS.TOKEN)
      const hadToken = lastTokenRef.current

      if (hasToken === hadToken) return

      lastTokenRef.current = hasToken

      if (hasToken && !hadToken) {
        mergeGuestCartRef.current().catch((error) => {
          console.error('Merge failed, loading cart anyway:', error)
          loadCartRef.current()
        })
      } else if (!hasToken && hadToken) {
        setHasMerged(false)
        mergeInProgressRef.current = false
        mergedGuestIdsRef.current.clear()
        loadCartRef.current()
      }
    }

    const onStorage = (e) => {
      if (e.key === STORAGE_KEYS.TOKEN) handleAuthChange()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('loginStatusChanged', handleAuthChange)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('loginStatusChanged', handleAuthChange)
    }
  }, [])

  const addToCart = async (product, quantity = 1, selectedModelId = null) => {
    try {
      if (isMultiModelProduct(product)) {
        const sid =
          selectedModelId != null && selectedModelId !== ''
            ? parseInt(String(selectedModelId), 10)
            : NaN
        if (!Number.isFinite(sid)) {
          showToast('Please select your phone model before adding to cart.', 'warning')
          redirectToProductForModelSelection(product)
          return false
        }
      }

      const modelIdForApi = isMultiModelProduct(product)
        ? parseInt(String(selectedModelId), 10)
        : undefined

      if (isLoggedIn()) {
        await userCartAPI.addItem(product.id, quantity, modelIdForApi)
      } else {
        const guestCartId = getGuestCartId()
        await guestCartAPI.addItem(guestCartId, product.id, quantity, modelIdForApi)
      }
      await loadCart()
      showToast('product added', 'success')
      return true
    } catch (error) {
      console.error('Error adding to cart:', error)
      const msg = String(error?.message || '')
      const isModelSelectionError =
        msg.includes('Please select a phone model for this product') ||
        msg.includes('Selected phone model is not available for this product')

      if (isModelSelectionError) {
        showToast('Please select your phone model before adding to cart.', 'warning')
        redirectToProductForModelSelection(product)
        return false
      }

      showToast(error.message || 'Failed to add item to cart', 'danger')
      return false
    }
  }

  const removeFromCart = async (productId, selectedModelId = null) => {
    try {
      if (isLoggedIn()) {
        await userCartAPI.removeItem(productId, selectedModelId)
      } else {
        const guestCartId = getGuestCartId()
        await guestCartAPI.removeItem(guestCartId, productId, selectedModelId)
      }
      await loadCart()
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      alert(error.message || 'Failed to remove item from cart')
      return false
    }
  }

  const updateQuantity = async (productId, quantity, selectedModelId = null) => {
    if (quantity <= 0) {
      await removeFromCart(productId, selectedModelId)
      return
    }
    
    try {
      if (isLoggedIn()) {
        await userCartAPI.updateItem(productId, quantity, selectedModelId)
      } else {
        const guestCartId = getGuestCartId()
        await guestCartAPI.updateItem(guestCartId, productId, quantity, selectedModelId)
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
        const itemsToRemove = [...cartItems]
        for (const item of itemsToRemove) {
          const guestCartId = getGuestCartId()
          await guestCartAPI.removeItem(
            guestCartId,
            item.id,
            item.selectedModelId ?? null
          )
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
  const buyNow = async (product, quantity = 1, selectedModelId = null) => {
    try {
      // Clear existing cart first
      await clearCart()
      
      // Add the product
      const success = await addToCart(product, quantity, selectedModelId)
      
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
      const unit = getUnitPriceForLine(item, item.selectedModelId)
      return total + unit * item.quantity
    }, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const isInCart = (productId, selectedModelId) => {
    return cartItems.some((item) => {
      if (item.id !== productId) return false
      if (selectedModelId === undefined) return true
      const a = item.selectedModelId ?? null
      if (selectedModelId === null || selectedModelId === '') return a === null
      const b = parseInt(String(selectedModelId), 10)
      return Number.isFinite(b) && Number(a) === b
    })
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
    <>
      <CartContext.Provider value={value}>{children}</CartContext.Provider>

      {toast.open && (
        <div
          className="toast-container position-fixed top-0 start-50 translate-middle-x p-2 cart-toast-container"
          style={{ zIndex: 2000, pointerEvents: 'none' }}
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className={`toast show cart-toast align-items-center text-white border-0 bg-${toast.variant}`}
            role="status"
            style={{ pointerEvents: 'auto', position: 'relative' }}
          >
            <button
              type="button"
              className="cart-toast-close"
              aria-label="Close"
              onClick={() => setToast((prev) => ({ ...prev, open: false }))}
            >
              ×
            </button>
            <div className="toast-body text-white cart-toast-body">{toast.message}</div>
          </div>
        </div>
      )}
    </>
  )
}
