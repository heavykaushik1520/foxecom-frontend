// Import product images
import productItem1 from '../assest/images/product-item1.jpg'
import productItem2 from '../assest/images/product-item2.jpg'
import productItem3 from '../assest/images/product-item3.jpg'
import productItem4 from '../assest/images/product-item4.jpg'
import productItem5 from '../assest/images/product-item5.jpg'
import productItem6 from '../assest/images/product-item6.jpg'
import productItem7 from '../assest/images/product-item7.jpg'
import productItem8 from '../assest/images/product-item8.jpg'
import productItem9 from '../assest/images/product-item9.jpg'
import productItem10 from '../assest/images/product-item10.jpg'
import singleImage1 from '../assest/images/single-image1.png'
import singleImage2 from '../assest/images/single-image2.jpg'

// Product data
export const products = [
  // Mobile Phones
  {
    id: 1,
    name: 'Iphone 10',
    category: 'mobile',
    price: 980,
    originalPrice: 1200,
    image: productItem1,
    images: [productItem1, singleImage1, singleImage2],
    description: 'The iPhone 10 features a stunning 5.8-inch Super Retina display, A11 Bionic chip, and dual 12MP cameras. Experience the future of smartphones with Face ID and wireless charging.',
    features: [
      '5.8-inch Super Retina HD display',
      'A11 Bionic chip with Neural Engine',
      'Dual 12MP cameras with OIS',
      'Face ID for secure authentication',
      'Wireless charging support',
      'Water and dust resistant (IP67)'
    ],
    inStock: true,
    stock: 15,
    rating: 4.5,
    reviews: 128
  },
  {
    id: 2,
    name: 'Iphone 11',
    category: 'mobile',
    price: 1100,
    originalPrice: 1300,
    image: productItem2,
    images: [productItem2, singleImage1, singleImage2],
    description: 'The iPhone 11 comes with a 6.1-inch Liquid Retina display, A13 Bionic chip, and dual-camera system. Perfect for capturing stunning photos and videos.',
    features: [
      '6.1-inch Liquid Retina HD display',
      'A13 Bionic chip',
      'Dual 12MP Ultra Wide and Wide cameras',
      'Face ID',
      'All-day battery life',
      'Water resistant up to 2 meters'
    ],
    inStock: true,
    stock: 22,
    rating: 4.7,
    reviews: 256
  },
  {
    id: 3,
    name: 'Iphone 8',
    category: 'mobile',
    price: 780,
    originalPrice: 900,
    image: productItem3,
    images: [productItem3, singleImage1, singleImage2],
    description: 'The iPhone 8 features a 4.7-inch Retina HD display, A11 Bionic chip, and a 12MP camera. Classic design with modern performance.',
    features: [
      '4.7-inch Retina HD display',
      'A11 Bionic chip',
      '12MP camera with OIS',
      'Touch ID',
      'Wireless charging',
      'Water and dust resistant'
    ],
    inStock: true,
    stock: 8,
    rating: 4.3,
    reviews: 89
  },
  {
    id: 4,
    name: 'Iphone 13',
    category: 'mobile',
    price: 1500,
    originalPrice: 1700,
    image: productItem4,
    images: [productItem4, singleImage1, singleImage2],
    description: 'The iPhone 13 features a 6.1-inch Super Retina XDR display, A15 Bionic chip, and advanced dual-camera system with Cinematic mode.',
    features: [
      '6.1-inch Super Retina XDR display',
      'A15 Bionic chip',
      'Dual 12MP camera system',
      'Face ID',
      'Up to 19 hours video playback',
      'Ceramic Shield front cover'
    ],
    inStock: true,
    stock: 30,
    rating: 4.8,
    reviews: 512
  },
  {
    id: 5,
    name: 'Iphone 12',
    category: 'mobile',
    price: 1300,
    originalPrice: 1500,
    image: productItem5,
    images: [productItem5, singleImage1, singleImage2],
    description: 'The iPhone 12 features a 6.1-inch Super Retina XDR display, A14 Bionic chip, and dual-camera system. 5G capable for ultra-fast speeds.',
    features: [
      '6.1-inch Super Retina XDR display',
      'A14 Bionic chip',
      'Dual 12MP camera system',
      '5G capable',
      'Face ID',
      'MagSafe accessories support'
    ],
    inStock: true,
    stock: 18,
    rating: 4.6,
    reviews: 342
  },
  // Smart Watches
  {
    id: 6,
    name: 'Pink watch',
    category: 'watch',
    price: 870,
    originalPrice: 1000,
    image: productItem6,
    images: [productItem6, singleImage1, singleImage2],
    description: 'Elegant pink smartwatch with fitness tracking, heart rate monitoring, and smartphone notifications. Perfect for active lifestyles.',
    features: [
      '1.4-inch AMOLED display',
      'Heart rate monitoring',
      'GPS tracking',
      'Water resistant (5ATM)',
      '7-day battery life',
      'Sleep tracking'
    ],
    inStock: true,
    stock: 12,
    rating: 4.4,
    reviews: 167
  },
  {
    id: 7,
    name: 'Heavy watch',
    category: 'watch',
    price: 680,
    originalPrice: 850,
    image: productItem7,
    images: [productItem7, singleImage1, singleImage2],
    description: 'Durable heavy-duty smartwatch designed for extreme conditions. Built to last with premium materials and advanced features.',
    features: [
      'Rugged design',
      'Military-grade durability',
      'Advanced fitness tracking',
      'Water resistant (10ATM)',
      'Long battery life',
      'Multiple sport modes'
    ],
    inStock: true,
    stock: 9,
    rating: 4.5,
    reviews: 94
  },
  {
    id: 8,
    name: 'Spotted watch',
    category: 'watch',
    price: 750,
    originalPrice: 900,
    image: productItem8,
    images: [productItem8, singleImage1, singleImage2],
    description: 'Stylish spotted design smartwatch with premium features. Track your fitness, receive notifications, and stay connected.',
    features: [
      'Unique spotted design',
      'Fitness tracking',
      'Smart notifications',
      'Water resistant',
      'Customizable watch faces',
      'Music control'
    ],
    inStock: true,
    stock: 14,
    rating: 4.3,
    reviews: 123
  },
  {
    id: 9,
    name: 'Black watch',
    category: 'watch',
    price: 650,
    originalPrice: 800,
    image: productItem9,
    images: [productItem9, singleImage1, singleImage2],
    description: 'Classic black smartwatch with essential features. Sleek design meets functionality for everyday use.',
    features: [
      'Classic black design',
      'Basic fitness tracking',
      'Notification support',
      'Water resistant',
      'Long battery life',
      'Affordable price'
    ],
    inStock: true,
    stock: 20,
    rating: 4.2,
    reviews: 201
  },
  {
    id: 10,
    name: 'Black watch Pro',
    category: 'watch',
    price: 750,
    originalPrice: 950,
    image: productItem10,
    images: [productItem10, singleImage1, singleImage2],
    description: 'Premium black smartwatch with advanced features. The perfect companion for your active lifestyle.',
    features: [
      'Premium black design',
      'Advanced fitness tracking',
      'ECG monitoring',
      'Water resistant (5ATM)',
      'Extended battery life',
      'Premium materials'
    ],
    inStock: true,
    stock: 16,
    rating: 4.6,
    reviews: 278
  }
]

// Helper functions
export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id))
}

export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category)
}

export const getAllProducts = () => {
  return products
}

