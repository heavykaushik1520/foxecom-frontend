import React, { createContext, useContext, useState, useEffect } from 'react'

const SearchPopupContext = createContext()

export const useSearchPopup = () => {
  const context = useContext(SearchPopupContext)
  if (!context) {
    throw new Error('useSearchPopup must be used within SearchPopupProvider')
  }
  return context
}

export const SearchPopupProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('.search-button')) {
        setIsVisible(prev => !prev)
      } else if (
        e.target.closest('.search-popup-close') || 
        (e.target.closest('.search-popup') && !e.target.closest('.search-popup-container'))
      ) {
        setIsVisible(false)
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false)
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [isVisible])

  return (
    <SearchPopupContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </SearchPopupContext.Provider>
  )
}

