# MiniStore - React + Vite

This is a React.js conversion of the MiniStore HTML template, built with Vite for fast development and optimized production builds.

## Features

- ⚡️ Fast development with Vite
- ⚛️ React 18 with modern hooks
- 🎨 Bootstrap 5 for styling
- 📱 Swiper.js for carousels and sliders
- 🎯 Component-based architecture
- 📦 Optimized production builds

## Project Structure

```
MiniStore/
├── public/              # Static assets (images, etc.)
│   └── images/         # Image files
├── src/
│   ├── components/     # React components
│   │   ├── Header.jsx
│   │   ├── Billboard.jsx
│   │   ├── CompanyServices.jsx
│   │   ├── MobileProducts.jsx
│   │   ├── SmartWatches.jsx
│   │   ├── YearlySale.jsx
│   │   ├── LatestBlog.jsx
│   │   ├── Testimonials.jsx
│   │   ├── Subscribe.jsx
│   │   ├── Instagram.jsx
│   │   ├── Footer.jsx
│   │   ├── SearchPopup.jsx
│   │   └── SVGSymbols.jsx
│   ├── hooks/          # Custom React hooks
│   │   └── useSearchPopup.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── css/                # CSS files (Bootstrap, custom styles)
├── package.json
├── vite.config.js
└── index.html
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Components

### Main Components

- **Header**: Navigation bar with search, user, and cart icons
- **Billboard**: Hero section with Swiper carousel
- **CompanyServices**: Service features section
- **MobileProducts**: Product carousel for mobile phones
- **SmartWatches**: Product carousel for smart watches
- **YearlySale**: Promotional sale section
- **LatestBlog**: Blog posts grid
- **Testimonials**: Customer testimonials carousel
- **Subscribe**: Newsletter subscription form
- **Instagram**: Instagram feed section
- **Footer**: Footer with links and contact info

## Technologies Used

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Bootstrap 5**: CSS framework
- **Swiper**: Touch slider library
- **React Hooks**: useState, useEffect, useRef

## Notes

- Images should be placed in the `public/images/` directory
- CSS files are imported in `src/index.css`
- The original HTML file has been renamed to `index-original.html`
- All SVG symbols are defined in the `SVGSymbols` component

## Development

The project uses:
- React Fast Refresh for instant updates
- ES6+ JavaScript
- JSX for component syntax
- CSS modules support (if needed)

## License

Same as the original template.

