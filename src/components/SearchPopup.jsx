import React, { useEffect } from 'react'
import { useSearchPopup } from '../contexts/SearchPopupContext'

const SearchPopup = () => {
  const { isVisible } = useSearchPopup()

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        const searchField = document.getElementById('search-form')
        if (searchField) {
          searchField.focus()
        }
      }, 350)
    }
  }, [isVisible])

  return (
    <div className={`search-popup ${isVisible ? 'is-visible' : ''}`}>
      <div className="search-popup-container">
        <form role="search" method="get" className="search-form" action="">
          <input 
            type="search" 
            id="search-form" 
            className="search-field" 
            placeholder="Type and press enter" 
            defaultValue="" 
            name="s" 
          />
          <button type="submit" className="search-submit">
            <svg className="search">
              <use xlinkHref="#search"></use>
            </svg>
          </button>
        </form>

        <h5 className="cat-list-title">Browse Categories</h5>
        
        <ul className="cat-list">
          <li className="cat-list-item">
            <a href="#" title="Mobile Phones">Mobile Phones</a>
          </li>
          <li className="cat-list-item">
            <a href="#" title="Smart Watches">Smart Watches</a>
          </li>
          <li className="cat-list-item">
            <a href="#" title="Headphones">Headphones</a>
          </li>
          <li className="cat-list-item">
            <a href="#" title="Accessories">Accessories</a>
          </li>
          <li className="cat-list-item">
            <a href="#" title="Monitors">Monitors</a>
          </li>
          <li className="cat-list-item">
            <a href="#" title="Speakers">Speakers</a>
          </li>
          <li className="cat-list-item">
            <a href="#" title="Memory Cards">Memory Cards</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SearchPopup

