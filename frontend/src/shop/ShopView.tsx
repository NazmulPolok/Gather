import { useState, useEffect } from 'react'
import type { AuthUser } from '../api/client'

// --- Professional SVG Icons (Facebook & Modern E-Commerce Standard) ---
function IconSearch({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconStore({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function IconCart({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function IconPackage({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m16.5 9.4-9-5.16a1.78 1.78 0 0 0-2.5 1.55v12.4a1.78 1.78 0 0 0 .89 1.55l9 5.16a1.78 1.78 0 0 0 2.5-1.55V10.95a1.78 1.78 0 0 0-.89-1.55Z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}

function IconGrid({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="3" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </svg>
  )
}

function IconHeadphones({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

function IconGamepad({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <circle cx="18" cy="11" r="1" fill="currentColor" />
      <rect width="20" height="12" x="2" y="6" rx="6" />
    </svg>
  )
}

function IconShirt({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 2 1.67h.14L6 10v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10l.96.86h.18a2 2 0 0 0 2-1.67l.58-3.5a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}

function IconBolt({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconStar({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function IconTrash({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function IconClose({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconPin({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconCard({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function IconCash({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

function IconMobile({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
    </svg>
  )
}

function IconCheckSuccess({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function IconPlus({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconEdit({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconShieldCheck({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export interface Product {
  id: string
  name: string
  category: 'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets'
  price: number
  originalPrice?: number
  rating: number
  reviewsCount: number
  badge?: string
  description: string
  image: string
  inStock: boolean
  shopId?: string
  shopName?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  date: string
  items: CartItem[]
  total: number
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
  }
  paymentMethod: string
  status: 'Processing' | 'Shipped' | 'Delivered'
}

export interface UserShop {
  id: string
  ownerId: number | string
  ownerUsername: string
  name: string
  tagline: string
  category: 'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets' | 'All Categories'
  description: string
  email: string
  phone: string
  address: string
  city: string
  logoUrl?: string
  bannerGradient?: string
  returnPolicy: string
  rating: number
  reviewsCount: number
  createdAt: string
  status: 'active' | 'verified'
  productsCount: number
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    price: 349,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 1420,
    badge: 'Best Seller',
    description: 'Industry-leading noise cancellation, 30-hour battery life, ultra-comfortable lightweight design.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Keychron Q1 Pro Wireless Custom Keyboard',
    category: 'Gaming',
    price: 199,
    originalPrice: 229,
    rating: 4.8,
    reviewsCount: 856,
    badge: 'Popular',
    description: 'CNC aluminum body, QMK/VIA programmable, hot-swappable mechanical switches, RGB backlight.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Logitech MX Master 3S Ergonomic Mouse',
    category: 'Electronics',
    price: 99,
    originalPrice: 119,
    rating: 4.9,
    reviewsCount: 2310,
    badge: 'Top Rated',
    description: 'Quiet clicks, 8K DPI track-on-glass sensor, ultra-fast MagSpeed electromagnetic scrolling.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'PlayStation DualSense Wireless Controller',
    category: 'Gaming',
    price: 74,
    originalPrice: 89,
    rating: 4.8,
    reviewsCount: 1140,
    badge: 'Sale',
    description: 'Haptic feedback, dynamic adaptive triggers, built-in microphone and motion controls.',
    image: 'https://images.unsplash.com/photo-1606318801954-d468460920d0?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-5',
    name: 'Gather Minimalist Heavyweight Hoodie',
    category: 'Apparel',
    price: 59,
    originalPrice: 75,
    rating: 4.9,
    reviewsCount: 520,
    badge: 'Official Merch',
    description: 'Premium 450gsm organic cotton, deep double-lined hood, relaxed drop-shoulder modern fit.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-6',
    name: 'Apple Watch Series 10 Smartwatch',
    category: 'Gadgets',
    price: 399,
    originalPrice: 429,
    rating: 4.9,
    reviewsCount: 980,
    badge: 'New',
    description: 'Thinnest design ever, wide-angle OLED display, advanced sleep apnea detection, water resistant.',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-7',
    name: 'Waterproof Commuter Tech Backpack 24L',
    category: 'Apparel',
    price: 89,
    originalPrice: 115,
    rating: 4.7,
    reviewsCount: 380,
    badge: 'Trending',
    description: 'Weatherproof ballistic nylon, padded 16" laptop sleeve, hidden anti-theft passport pocket.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-8',
    name: 'Marshall Stanmore III Bluetooth Speaker',
    category: 'Electronics',
    price: 379,
    originalPrice: 429,
    rating: 4.8,
    reviewsCount: 610,
    badge: 'Premium Sound',
    description: 'Iconic vintage styling, wider stereo soundstage, dynamic loudness, Bluetooth 5.2 connectivity.',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-9',
    name: 'Anker Prime 20,000mAh 200W Power Bank',
    category: 'Gadgets',
    price: 129,
    originalPrice: 149,
    rating: 4.9,
    reviewsCount: 940,
    badge: 'Ultra Fast',
    description: '200W total output, smart digital display, charges a MacBook Pro to 50% in just 28 minutes.',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-10',
    name: 'Minimalist Polarized Titanium Sunglasses',
    category: 'Apparel',
    price: 65,
    originalPrice: 85,
    rating: 4.6,
    reviewsCount: 230,
    badge: 'Summer Drop',
    description: 'Ultra-light aerospace titanium frame, 100% UV400 anti-glare polarized lenses.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-11',
    name: 'Smart RGB Ambient Light Bar with Camera Sync',
    category: 'Gadgets',
    price: 49,
    originalPrice: 69,
    rating: 4.8,
    reviewsCount: 720,
    badge: 'RGB Sync',
    description: 'Screen color sampling camera, 16 million colors, voice control compatible with Alexa and Google.',
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
  {
    id: 'prod-12',
    name: 'Ergonomic Gas-Spring Dual Monitor Arm',
    category: 'Gaming',
    price: 119,
    originalPrice: 149,
    rating: 4.7,
    reviewsCount: 410,
    badge: 'Desk Setup',
    description: 'Heavy duty steel & aluminum, supports screens up to 32", built-in cable management channels.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=80',
    inStock: true,
  },
]

const ORDERS_STORAGE_KEY = 'gather_shop_orders'
const CUSTOM_PRODUCTS_STORAGE_KEY = 'gather_custom_products'

// Preset logo options for quick store setup
const LOGO_PRESETS = [
  { label: 'Cyber Tech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
  { label: 'Pro Gamer', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Minimalist', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop&q=80' },
  { label: 'Gadget Lab', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80' },
]

// Preset banner gradients
const BANNER_PRESETS = [
  { id: 'blue', label: 'Deep Blue', css: 'linear-gradient(135deg, #1e3a8a, #0284c7)' },
  { id: 'dark', label: 'Obsidian Slate', css: 'linear-gradient(135deg, #0f172a, #334155)' },
  { id: 'violet', label: 'Cyber Violet', css: 'linear-gradient(135deg, #312e81, #7c3aed)' },
  { id: 'emerald', label: 'Emerald Sleek', css: 'linear-gradient(135deg, #064e3b, #059669)' },
]

interface ShopViewProps {
  user: AuthUser
  onOpenChat?: () => void
  onOpenFeed?: () => void
  cart: CartItem[]
  onCartChange: (cart: CartItem[]) => void
  userShop?: UserShop | null
  onUserShopChange?: (shop: UserShop | null) => void
  openShopTrigger?: boolean
  onOpenShopTriggerHandled?: () => void
}

export function ShopView({
  user,
  cart,
  onCartChange,
  userShop: userShopProp,
  onUserShopChange,
  openShopTrigger,
  onOpenShopTriggerHandled,
}: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'myshop'>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured')
  
  // Checkout & Order modal states
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart')
  const [shippingName, setShippingName] = useState(user.nickname || user.first_name || user.username)
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'mfs'>('cod')
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null)
  
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // User Shop State
  const [userShop, setUserShop] = useState<UserShop | null>(() => {
    if (userShopProp !== undefined) return userShopProp
    try {
      const saved = localStorage.getItem('gather_active_user_shop')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sync internal userShop with prop
  useEffect(() => {
    if (userShopProp !== undefined) {
      setUserShop(userShopProp)
    }
  }, [userShopProp])

  // Custom Products added by merchants
  const [customProducts, setCustomProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Open Shop Modal states
  const [isOpenShopModal, setIsOpenShopModal] = useState(false)
  const [shopName, setShopName] = useState('')
  const [shopTagline, setShopTagline] = useState('')
  const [shopCategory, setShopCategory] = useState<'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets' | 'All Categories'>('Electronics')
  const [shopEmail, setShopEmail] = useState(`${user.username}@merchant.gather`)
  const [shopPhone, setShopPhone] = useState('+880 1700-')
  const [shopCity, setShopCity] = useState('Dhaka')
  const [shopAddress, setShopAddress] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [shopReturnPolicy, setShopReturnPolicy] = useState('7 Days Replacement Warranty & 100% Genuine Guarantee')
  const [shopLogoUrl, setShopLogoUrl] = useState(LOGO_PRESETS[0].url)
  const [shopBannerGradient, setShopBannerGradient] = useState(BANNER_PRESETS[0].css)
  const [shopSuccessBanner, setShopSuccessBanner] = useState(false)

  // Add Product Modal states
  const [isAddProductModal, setIsAddProductModal] = useState(false)
  const [newProdName, setNewProdName] = useState('')
  const [newProdCategory, setNewProdCategory] = useState<'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets'>('Electronics')
  const [newProdPrice, setNewProdPrice] = useState('')
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('')
  const [newProdDescription, setNewProdDescription] = useState('')
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700&auto=format&fit=crop&q=80')

  // Handle trigger from Settings button
  useEffect(() => {
    if (openShopTrigger) {
      if (!userShop) {
        setIsOpenShopModal(true)
      } else {
        setActiveTab('myshop')
      }
      onOpenShopTriggerHandled?.()
    }
  }, [openShopTrigger, userShop, onOpenShopTriggerHandled])

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    } catch {}
  }, [orders])

  // Save custom products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(customProducts))
    } catch {}
  }, [customProducts])

  // Pre-fill form when userShop exists and modal is opened for editing
  function openShopModalForEdit() {
    if (userShop) {
      setShopName(userShop.name)
      setShopTagline(userShop.tagline)
      setShopCategory(userShop.category)
      setShopEmail(userShop.email)
      setShopPhone(userShop.phone)
      setShopCity(userShop.city)
      setShopAddress(userShop.address)
      setShopDescription(userShop.description)
      setShopReturnPolicy(userShop.returnPolicy)
      setShopLogoUrl(userShop.logoUrl || LOGO_PRESETS[0].url)
      setShopBannerGradient(userShop.bannerGradient || BANNER_PRESETS[0].css)
    }
    setShopSuccessBanner(false)
    setIsOpenShopModal(true)
  }

  // Handle Open/Create Shop form submit
  function handleOpenShopSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!shopName.trim()) return

    const newShop: UserShop = {
      id: userShop?.id || `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: user.id,
      ownerUsername: user.username,
      name: shopName.trim(),
      tagline: shopTagline.trim() || 'Official Gather Verified Merchant',
      category: shopCategory,
      email: shopEmail.trim(),
      phone: shopPhone.trim(),
      address: shopAddress.trim(),
      city: shopCity.trim(),
      description: shopDescription.trim() || 'Welcome to our official store on Gather Marketplace!',
      returnPolicy: shopReturnPolicy.trim() || '7 Days Replacement Warranty',
      logoUrl: shopLogoUrl,
      bannerGradient: shopBannerGradient,
      rating: userShop?.rating || 5.0,
      reviewsCount: userShop?.reviewsCount || 1,
      createdAt: userShop?.createdAt || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'verified',
      productsCount: customProducts.filter(p => p.shopId === (userShop?.id || '')).length,
    }

    setUserShop(newShop)
    onUserShopChange?.(newShop)
    try {
      localStorage.setItem('gather_active_user_shop', JSON.stringify(newShop))
      localStorage.setItem(`gather_user_shop_${user.id}`, JSON.stringify(newShop))
    } catch {}

    setShopSuccessBanner(true)
  }

  // Handle Add Product submit
  function handleAddProductSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newProdName.trim() || !newProdPrice) return

    const parsedPrice = parseFloat(newProdPrice)
    const parsedOrig = newProdOriginalPrice ? parseFloat(newProdOriginalPrice) : undefined

    const product: Product = {
      id: `custom-${Date.now()}`,
      name: newProdName.trim(),
      category: newProdCategory,
      price: isNaN(parsedPrice) ? 49 : parsedPrice,
      originalPrice: parsedOrig && !isNaN(parsedOrig) ? parsedOrig : undefined,
      rating: 5.0,
      reviewsCount: 1,
      badge: 'Merchant Official',
      description: newProdDescription.trim() || 'Verified quality product from official Gather merchant.',
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700&auto=format&fit=crop&q=80',
      inStock: true,
      shopId: userShop?.id,
      shopName: userShop?.name,
    }

    setCustomProducts(prev => [product, ...prev])
    setIsAddProductModal(false)
    setNewProdName('')
    setNewProdPrice('')
    setNewProdOriginalPrice('')
    setNewProdDescription('')
  }

  function handleDeleteCustomProduct(productId: string) {
    setCustomProducts(prev => prev.filter(p => p.id !== productId))
  }

  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shippingFee = cartSubtotal > 50 || cartSubtotal === 0 ? 0 : 9.99
  const orderTotal = cartSubtotal + shippingFee

  function addToCart(product: Product, quantity = 1) {
    const existingIndex = cart.findIndex(item => item.product.id === product.id)
    let newCart: CartItem[]
    if (existingIndex > -1) {
      newCart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      )
    } else {
      newCart = [...cart, { product, quantity }]
    }
    onCartChange(newCart)
  }

  function updateQuantity(productId: string, delta: number) {
    const newCart = cart
      .map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      })
      .filter(Boolean) as CartItem[]
    onCartChange(newCart)
  }

  function removeFromCart(productId: string) {
    const newCart = cart.filter(item => item.product.id !== productId)
    onCartChange(newCart)
  }

  function buyNow(product: Product) {
    addToCart(product, 1)
    setCheckoutStep('shipping')
    setIsCartOpen(true)
  }

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) return

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: [...cart],
      total: orderTotal,
      shippingAddress: {
        fullName: shippingName,
        phone: shippingPhone,
        address: shippingAddress,
        city: shippingCity,
      },
      paymentMethod:
        paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : paymentMethod === 'card'
          ? 'Credit / Debit Card'
          : 'Mobile Banking (bKash / Nagad)',
      status: 'Processing',
    }

    setOrders(prev => [newOrder, ...prev])
    setLastPlacedOrder(newOrder)
    onCartChange([])
    setCheckoutStep('success')
  }

  // Combined product catalog
  const combinedCatalog = [...customProducts, ...SAMPLE_PRODUCTS]

  // Filter and sort products
  const filteredProducts = combinedCatalog.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesQuery =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.shopName && product.shopName.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesQuery
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return 0 // default featured
  })

  // User's own shop products
  const myShopProducts = customProducts.filter(p => userShop && p.shopId === userShop.id)

  return (
    <div className="shop-container">
      {/* Hero / Header Banner */}
      <section className="shop-hero">
        <div className="shop-hero-content">
          <div className="shop-hero-badge">
            <IconStore size={15} />
            <span>Gather Official Marketplace</span>
          </div>
          <h1 className="shop-hero-title">Discover, Shop & Elevate Your Setup</h1>
          <p className="shop-hero-subtitle">
            Premium tech, gaming essentials, ergonomic gear, and official merch — delivered right to your doorstep.
          </p>

          <div className="shop-search-bar">
            <span className="shop-search-icon">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products, merchants, gadgets, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="shop-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <IconClose size={13} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Controls: Categories, Sort, My Shop & Orders Tab */}
      <div className="shop-controls-bar">
        <div className="shop-category-pills">
          <button
            type="button"
            className={`shop-category-btn ${activeTab === 'browse' && selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('browse')
              setSelectedCategory('All')
            }}
          >
            <IconGrid size={14} />
            <span>All</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${activeTab === 'browse' && selectedCategory === 'Electronics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('browse')
              setSelectedCategory('Electronics')
            }}
          >
            <IconHeadphones size={14} />
            <span>Electronics</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${activeTab === 'browse' && selectedCategory === 'Gaming' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('browse')
              setSelectedCategory('Gaming')
            }}
          >
            <IconGamepad size={14} />
            <span>Gaming</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${activeTab === 'browse' && selectedCategory === 'Apparel' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('browse')
              setSelectedCategory('Apparel')
            }}
          >
            <IconShirt size={14} />
            <span>Apparel</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${activeTab === 'browse' && selectedCategory === 'Gadgets' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('browse')
              setSelectedCategory('Gadgets')
            }}
          >
            <IconBolt size={14} />
            <span>Gadgets</span>
          </button>
        </div>

        <div className="shop-actions-right">
          {activeTab === 'browse' && (
            <div className="shop-sort-wrapper">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="shop-sort-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          )}

          {/* My Shop Button (visible when user has an active store) */}
          {userShop && (
            <button
              type="button"
              className={`shop-tab-toggle shop-myshop-toggle ${activeTab === 'myshop' ? 'active' : ''}`}
              onClick={() => setActiveTab(activeTab === 'myshop' ? 'browse' : 'myshop')}
              title="Manage your storefront"
            >
              <IconStore size={15} />
              <span>My Shop</span>
              <span className="shop-verified-dot">●</span>
            </button>
          )}

          {/* My Orders Button */}
          <button
            type="button"
            className={`shop-tab-toggle ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'orders' ? 'browse' : 'orders')}
          >
            <IconPackage size={15} />
            <span>My Orders</span>
            {orders.length > 0 && <span className="orders-count-badge">{orders.length}</span>}
          </button>

          {/* Cart Button */}
          <button
            type="button"
            className={`shop-cart-header-btn ${totalCartItemsCount > 0 ? 'has-items' : ''}`}
            onClick={() => {
              setCheckoutStep('cart')
              setIsCartOpen(true)
            }}
            title="Open Shopping Cart"
          >
            <span className="cart-btn-icon">
              <IconCart size={16} />
            </span>
            <span className="cart-btn-label">Cart</span>
            {totalCartItemsCount > 0 && (
              <span className="cart-pill-badge">{totalCartItemsCount}</span>
            )}
            {cartSubtotal > 0 && (
              <span className="cart-subtotal-pill">${cartSubtotal.toFixed(2)}</span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================
          VIEW 1: MY SHOP STOREFRONT & MERCHANT DASHBOARD
          ========================================================= */}
      {activeTab === 'myshop' && userShop ? (
        <section className="myshop-section">
          {/* Shop Hero Storefront Banner */}
          <div className="myshop-hero-card" style={{ background: userShop.bannerGradient || BANNER_PRESETS[0].css }}>
            <div className="myshop-banner-overlay" />
            <div className="myshop-hero-inner">
              <div className="myshop-avatar-col">
                <img src={userShop.logoUrl || LOGO_PRESETS[0].url} alt={userShop.name} className="myshop-logo-img" />
                <span className="myshop-verified-badge" title="Verified Merchant">
                  <IconShieldCheck size={16} />
                </span>
              </div>

              <div className="myshop-info-col">
                <div className="myshop-title-row">
                  <h2>{userShop.name}</h2>
                  <span className="myshop-category-chip">{userShop.category}</span>
                  <span className="myshop-status-chip">● {userShop.status.toUpperCase()}</span>
                </div>
                <p className="myshop-tagline">{userShop.tagline}</p>
                <div className="myshop-meta-row">
                  <span>
                    <IconStar size={13} /> <strong>{userShop.rating.toFixed(1)}</strong> rating
                  </span>
                  <span>•</span>
                  <span><strong>{myShopProducts.length}</strong> items listed</span>
                  <span>•</span>
                  <span>Owner: <strong>@{userShop.ownerUsername}</strong></span>
                </div>
              </div>

              <div className="myshop-actions-col">
                <button
                  type="button"
                  className="button button-primary myshop-add-btn"
                  onClick={() => setIsAddProductModal(true)}
                >
                  <IconPlus size={15} />
                  <span>Add Product</span>
                </button>
                <button
                  type="button"
                  className="button button-secondary myshop-edit-btn"
                  onClick={openShopModalForEdit}
                >
                  <IconEdit size={14} />
                  <span>Edit Shop</span>
                </button>
              </div>
            </div>
          </div>

          {/* Shop Overview Details Grid */}
          <div className="myshop-details-grid">
            <div className="myshop-detail-card">
              <span className="detail-label">Business Email</span>
              <strong>{userShop.email || 'N/A'}</strong>
            </div>
            <div className="myshop-detail-card">
              <span className="detail-label">Helpline Phone</span>
              <strong>{userShop.phone || 'N/A'}</strong>
            </div>
            <div className="myshop-detail-card">
              <span className="detail-label">Location / City</span>
              <strong>{userShop.city}, {userShop.address || 'Central'}</strong>
            </div>
            <div className="myshop-detail-card">
              <span className="detail-label">Return Policy</span>
              <strong>{userShop.returnPolicy}</strong>
            </div>
          </div>

          {/* Shop Story Description */}
          {userShop.description && (
            <div className="myshop-story-box">
              <h4>About This Store</h4>
              <p>{userShop.description}</p>
            </div>
          )}

          {/* Listed Products Heading */}
          <div className="myshop-products-header">
            <div>
              <h3>Products in Your Store ({myShopProducts.length})</h3>
              <small>Items visible to all Gather users in the public marketplace</small>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setIsAddProductModal(true)}
            >
              <IconPlus size={15} /> Add New Product
            </button>
          </div>

          {myShopProducts.length === 0 ? (
            <div className="shop-empty-state myshop-empty">
              <span className="empty-icon">
                <IconPackage size={44} />
              </span>
              <h3>No products listed yet</h3>
              <p>Your shop is live! Add your first item to start selling to Gather community members.</p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setIsAddProductModal(true)}
              >
                <IconPlus size={15} /> Add Your First Product
              </button>
            </div>
          ) : (
            <div className="shop-products-grid myshop-grid">
              {myShopProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                    <span className="product-badge">Your Store</span>
                    <span className="product-category-tag">{product.category}</span>
                  </div>

                  <div className="product-details">
                    <div className="product-rating-row">
                      <span className="star-icon">
                        <IconStar size={13} />
                      </span>
                      <strong className="rating-score">{product.rating}</strong>
                      <small className="reviews-count">({product.reviewsCount})</small>
                    </div>

                    <h3 className="product-title" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-price-row">
                      <div className="price-block">
                        <span className="current-price">${product.price}</span>
                        {product.originalPrice && (
                          <span className="original-price">${product.originalPrice}</span>
                        )}
                      </div>
                      <span className="free-shipping-tag">In Stock</span>
                    </div>

                    <div className="product-actions-row">
                      <button
                        type="button"
                        className="button button-secondary myshop-del-btn"
                        onClick={() => handleDeleteCustomProduct(product.id)}
                        title="Remove from shop"
                      >
                        <IconTrash size={14} /> Remove
                      </button>
                      <button
                        type="button"
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        <IconCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'orders' ? (
        /* =========================================================
           VIEW 2: ORDER HISTORY
           ========================================================= */
        <section className="shop-orders-section">
          <div className="shop-section-header">
            <h2>Your Order History</h2>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setActiveTab('browse')}
            >
              ← Back to Shop
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="shop-empty-state">
              <span className="empty-icon">
                <IconPackage size={44} />
              </span>
              <h3>No orders yet</h3>
              <p>You haven't purchased any items yet. Browse our marketplace and place your first order!</p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setActiveTab('browse')}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <strong className="order-id">{order.id}</strong>
                      <span className="order-date">Placed on {order.date}</span>
                    </div>
                    <div className="order-status-wrap">
                      <span className={`order-status-pill status-${order.status.toLowerCase()}`}>
                        ● {order.status}
                      </span>
                      <strong className="order-total-price">${order.total.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="order-items-grid">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <img src={item.product.image} alt={item.product.name} className="order-item-thumb" />
                        <div className="order-item-info">
                          <strong>{item.product.name}</strong>
                          <small>
                            ${item.product.price} × {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <span>
                      <strong>Ship to:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.city}
                    </span>
                    <span>
                      <strong>Payment:</strong> {order.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* =========================================================
           VIEW 3: PUBLIC MARKETPLACE BROWSE GRID
           ========================================================= */
        <section className="shop-products-grid">

          {filteredProducts.length === 0 ? (
            <div className="shop-empty-state">
              <span className="empty-icon">
                <IconSearch size={44} />
              </span>
              <h3>No products found</h3>
              <p>Try searching for a different keyword or select another category.</p>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <span className="product-category-tag">{product.category}</span>
                </div>

                <div className="product-details">
                  <div className="product-rating-row">
                    <span className="star-icon">
                      <IconStar size={13} />
                    </span>
                    <strong className="rating-score">{product.rating}</strong>
                    <small className="reviews-count">({product.reviewsCount})</small>
                    {product.shopName && (
                      <span className="merchant-seller-tag" title={`Sold by ${product.shopName}`}>
                        by {product.shopName}
                      </span>
                    )}
                  </div>

                  <h3 className="product-title" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-price-row">
                    <div className="price-block">
                      <span className="current-price">${product.price}</span>
                      {product.originalPrice && (
                        <span className="original-price">${product.originalPrice}</span>
                      )}
                    </div>
                    <span className="free-shipping-tag">Free Delivery</span>
                  </div>

                  <div className="product-actions-row">
                    <button
                      type="button"
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      title="Add to cart"
                    >
                      <IconCart size={14} />
                      <span>Add</span>
                    </button>
                    <button
                      type="button"
                      className="buy-now-btn"
                      onClick={() => buyNow(product)}
                    >
                      <IconBolt size={14} />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Floating Quick-Access Cart Pill when items are in cart */}
      {totalCartItemsCount > 0 && !isCartOpen && (
        <button
          type="button"
          className="shop-floating-cart-pill"
          onClick={() => {
            setCheckoutStep('cart')
            setIsCartOpen(true)
          }}
          title="Open Shopping Cart"
        >
          <div className="floating-cart-left">
            <span className="floating-cart-icon">
              <IconCart size={20} />
            </span>
            <div className="floating-cart-info">
              <strong>{totalCartItemsCount} {totalCartItemsCount === 1 ? 'item' : 'items'} in cart</strong>
              <small>${cartSubtotal.toFixed(2)} total</small>
            </div>
          </div>
          <span className="floating-cart-arrow">View Cart →</span>
        </button>
      )}

      {/* =========================================================
          MODAL 1: OPEN SHOP / EDIT SHOP ONBOARDING MODAL
          ========================================================= */}
      {isOpenShopModal && (
        <div className="shop-modal-overlay" onClick={() => setIsOpenShopModal(false)}>
          <div className="shop-modal-dialog shop-wide-modal" onClick={e => e.stopPropagation()}>
            <div className="shop-modal-header">
              <div>
                <h3>{userShop ? 'Edit Your Shop Details' : 'Open Your Shop on Gather'}</h3>
                <small>{userShop ? 'Update your merchant information' : 'Launch your official store & start selling'}</small>
              </div>
              <button
                type="button"
                className="shop-modal-close"
                onClick={() => setIsOpenShopModal(false)}
                title="Close"
              >
                <IconClose size={16} />
              </button>
            </div>

            {shopSuccessBanner ? (
              <div className="shop-creation-success-pane">
                <div className="success-icon-bubble">
                  <IconCheckSuccess size={36} />
                </div>
                <h3>{userShop?.name} is Now Live!</h3>
                <p>Your shop has been registered and verified on Gather Marketplace. You can now add products and start making sales.</p>
                
                <div className="shop-preview-card">
                  <img src={userShop?.logoUrl || LOGO_PRESETS[0].url} alt={userShop?.name} className="preview-logo" />
                  <div>
                    <strong>{userShop?.name}</strong>
                    <small>{userShop?.tagline}</small>
                    <span className="preview-cat">{userShop?.category}</span>
                  </div>
                </div>

                <div className="shop-success-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      setIsOpenShopModal(false)
                      setActiveTab('myshop')
                    }}
                  >
                    Go to My Shop Dashboard
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setIsOpenShopModal(false)
                      setIsAddProductModal(true)
                    }}
                  >
                    + Add First Product
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOpenShopSubmit} className="open-shop-form-scroll">
                {/* Section 1: Store Identity */}
                <div className="form-section-title">
                  <IconStore size={16} />
                  <span>Store Identity & Branding</span>
                </div>

                <div className="checkout-input-row">
                  <label>Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder="e.g. Nexus Gaming & Electronics"
                  />
                </div>

                <div className="checkout-input-row">
                  <label>Tagline / Punchline *</label>
                  <input
                    type="text"
                    required
                    value={shopTagline}
                    onChange={e => setShopTagline(e.target.value)}
                    placeholder="e.g. Premium enthusiast desktop accessories & gear"
                  />
                </div>

                <div className="checkout-input-grid">
                  <div>
                    <label>Primary Niche / Category</label>
                    <select
                      className="shop-select-field"
                      value={shopCategory}
                      onChange={e => setShopCategory(e.target.value as any)}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Apparel">Apparel</option>
                      <option value="Gadgets">Gadgets</option>
                      <option value="All Categories">All Categories</option>
                    </select>
                  </div>
                  <div>
                    <label>City / Hub Location *</label>
                    <input
                      type="text"
                      required
                      value={shopCity}
                      onChange={e => setShopCity(e.target.value)}
                      placeholder="e.g. Dhaka"
                    />
                  </div>
                </div>

                {/* Section 2: Contact & Business Address */}
                <div className="form-section-title" style={{ marginTop: '16px' }}>
                  <IconPin size={16} />
                  <span>Business Contact & Warehouse</span>
                </div>

                <div className="checkout-input-grid">
                  <div>
                    <label>Business Email *</label>
                    <input
                      type="email"
                      required
                      value={shopEmail}
                      onChange={e => setShopEmail(e.target.value)}
                      placeholder="contact@yourshop.com"
                    />
                  </div>
                  <div>
                    <label>Support Helpline Phone *</label>
                    <input
                      type="tel"
                      required
                      value={shopPhone}
                      onChange={e => setShopPhone(e.target.value)}
                      placeholder="+880 1700 000000"
                    />
                  </div>
                </div>

                <div className="checkout-input-row">
                  <label>Warehouse / Pickup Address</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={e => setShopAddress(e.target.value)}
                    placeholder="e.g. Suite 4B, Road 11, Banani Commercial Area"
                  />
                </div>

                {/* Section 3: Policies & Description */}
                <div className="form-section-title" style={{ marginTop: '16px' }}>
                  <IconShieldCheck size={16} />
                  <span>Policies & About Us</span>
                </div>

                <div className="checkout-input-row">
                  <label>Store Description / Story</label>
                  <textarea
                    rows={2}
                    value={shopDescription}
                    onChange={e => setShopDescription(e.target.value)}
                    placeholder="Briefly describe what your shop sells, shipping speed, and commitment to quality..."
                  />
                </div>

                <div className="checkout-input-row">
                  <label>Warranty & Return Policy</label>
                  <input
                    type="text"
                    value={shopReturnPolicy}
                    onChange={e => setShopReturnPolicy(e.target.value)}
                    placeholder="e.g. 7 Days Replacement Warranty & 100% Genuine Guarantee"
                  />
                </div>

                {/* Section 4: Logo & Theme Previews */}
                <div className="form-section-title" style={{ marginTop: '16px' }}>
                  <IconStar size={16} />
                  <span>Store Logo & Cover Theme</span>
                </div>

                <div className="checkout-input-row">
                  <label>Pick a Store Logo Avatar</label>
                  <div className="logo-presets-row">
                    {LOGO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`logo-preset-btn ${shopLogoUrl === preset.url ? 'selected' : ''}`}
                        onClick={() => setShopLogoUrl(preset.url)}
                      >
                        <img src={preset.url} alt={preset.label} />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="checkout-input-row">
                  <label>Pick a Store Cover Banner Theme</label>
                  <div className="banner-presets-row">
                    {BANNER_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`banner-preset-btn ${shopBannerGradient === preset.css ? 'selected' : ''}`}
                        style={{ background: preset.css }}
                        onClick={() => setShopBannerGradient(preset.css)}
                      >
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="open-shop-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setIsOpenShopModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary submit-open-shop-btn">
                    <IconStore size={16} />
                    <span>{userShop ? 'Save Changes' : 'Open Shop Now'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ADD PRODUCT TO MY SHOP
          ========================================================= */}
      {isAddProductModal && (
        <div className="shop-modal-overlay" onClick={() => setIsAddProductModal(false)}>
          <div className="shop-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="shop-modal-header">
              <div>
                <h3>Add Product to Your Store</h3>
                <small>List a new item on Gather Marketplace</small>
              </div>
              <button
                type="button"
                className="shop-modal-close"
                onClick={() => setIsAddProductModal(false)}
                title="Close"
              >
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="checkout-form-scroll">
              <div className="checkout-input-row">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="e.g. Wireless RGB Mechanical Keyboard"
                />
              </div>

              <div className="checkout-input-grid">
                <div>
                  <label>Category *</label>
                  <select
                    className="shop-select-field"
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value as any)}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Gadgets">Gadgets</option>
                  </select>
                </div>
                <div>
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    placeholder="99.00"
                  />
                </div>
              </div>

              <div className="checkout-input-row">
                <label>Original / Cut Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProdOriginalPrice}
                  onChange={e => setNewProdOriginalPrice(e.target.value)}
                  placeholder="129.00 (optional discount tag)"
                />
              </div>

              <div className="checkout-input-row">
                <label>Product Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newProdDescription}
                  onChange={e => setNewProdDescription(e.target.value)}
                  placeholder="Specs, features, materials, and warranty information..."
                />
              </div>

              <div className="checkout-input-row">
                <label>Product Image URL</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={e => setNewProdImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="checkout-actions-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsAddProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary place-order-btn">
                  <IconPlus size={15} />
                  <span>Publish Item to Store</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SLIDE-OVER CART DRAWER / CHECKOUT MODAL
          ========================================================= */}
      {(isCartOpen || checkoutStep !== 'cart') && (
        <div className="shop-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="shop-modal-dialog" onClick={e => e.stopPropagation()}>
            {checkoutStep === 'cart' && (
              <>
                <div className="shop-modal-header">
                  <div>
                    <h3>Shopping Cart</h3>
                    <small>{totalCartItemsCount} {totalCartItemsCount === 1 ? 'item' : 'items'} in your bag</small>
                  </div>
                  <button
                    type="button"
                    className="shop-modal-close"
                    onClick={() => setIsCartOpen(false)}
                    title="Close"
                  >
                    <IconClose size={16} />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="shop-empty-cart">
                    <div className="empty-icon">
                      <IconCart size={48} />
                    </div>
                    <h4>Your cart is empty</h4>
                    <p>Looks like you haven't added anything yet.</p>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items-scroll">
                      {cart.map(item => (
                        <div key={item.product.id} className="cart-item-card">
                          <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                          <div className="cart-item-details">
                            <h4 className="cart-item-title">{item.product.name}</h4>
                            <span className="cart-item-unit-price">${item.product.price}</span>
                            <div className="quantity-controls">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.product.id, -1)}
                                title="Decrease"
                              >
                                -
                              </button>
                              <span className="qty-number">{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateQuantity(item.product.id, 1)}
                                title="Increase"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="cart-item-total-col">
                            <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
                            <button
                              type="button"
                              className="cart-item-remove-btn"
                              onClick={() => removeFromCart(item.product.id)}
                              title="Remove item"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-summary-footer">
                      <div className="summary-line">
                        <span>Subtotal</span>
                        <strong>${cartSubtotal.toFixed(2)}</strong>
                      </div>
                      <div className="summary-line">
                        <span>Shipping</span>
                        <span className="shipping-text">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                      </div>
                      <div className="summary-line summary-total">
                        <strong>Total Amount</strong>
                        <strong>${orderTotal.toFixed(2)}</strong>
                      </div>

                      <button
                        type="button"
                        className="proceed-checkout-btn"
                        onClick={() => setCheckoutStep('shipping')}
                      >
                        Proceed to Checkout →
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* STEP 2: SHIPPING & PAYMENT */}
            {checkoutStep === 'shipping' && (
              <form onSubmit={handlePlaceOrder}>
                <div className="shop-modal-header">
                  <div>
                    <h3>Delivery & Payment</h3>
                    <small>Complete your order securely</small>
                  </div>
                  <button
                    type="button"
                    className="shop-modal-close"
                    onClick={() => setCheckoutStep('cart')}
                    title="Back to Cart"
                  >
                    <IconClose size={16} />
                  </button>
                </div>

                <div className="checkout-form-scroll">
                  <h4 className="checkout-section-heading">
                    <IconPin size={16} />
                    <span>Shipping Details</span>
                  </h4>
                  <div className="checkout-input-row">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={e => setShippingName(e.target.value)}
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="checkout-input-grid">
                    <div>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={shippingPhone}
                        onChange={e => setShippingPhone(e.target.value)}
                        placeholder="+880 1700 000000"
                      />
                    </div>
                    <div>
                      <label>City</label>
                      <input
                        type="text"
                        required
                        value={shippingCity}
                        onChange={e => setShippingCity(e.target.value)}
                        placeholder="e.g. Dhaka"
                      />
                    </div>
                  </div>

                  <div className="checkout-input-row">
                    <label>Street Address</label>
                    <textarea
                      required
                      rows={2}
                      value={shippingAddress}
                      onChange={e => setShippingAddress(e.target.value)}
                      placeholder="House / Flat / Road number..."
                    />
                  </div>

                  <h4 className="checkout-section-heading" style={{ marginTop: '20px' }}>
                    <IconCard size={16} />
                    <span>Payment Method</span>
                  </h4>
                  <div className="payment-options-grid">
                    <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <span className="payment-icon">
                        <IconCash size={20} />
                      </span>
                      <div className="payment-copy">
                        <strong>Cash on Delivery</strong>
                        <small>Pay upon receiving goods</small>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'mfs' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mfs"
                        checked={paymentMethod === 'mfs'}
                        onChange={() => setPaymentMethod('mfs')}
                      />
                      <span className="payment-icon">
                        <IconMobile size={20} />
                      </span>
                      <div className="payment-copy">
                        <strong>bKash / Nagad / Wallet</strong>
                        <small>Instant mobile payment</small>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span className="payment-icon">
                        <IconCard size={20} />
                      </span>
                      <div className="payment-copy">
                        <strong>Credit / Debit Card</strong>
                        <small>Visa, MasterCard, Amex</small>
                      </div>
                    </label>
                  </div>

                  <div className="checkout-summary-box">
                    <div className="summary-line">
                      <span>Items ({totalCartItemsCount})</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                      <span>Shipping Delivery</span>
                      <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                    </div>
                    <div className="summary-line total-highlight">
                      <strong>Total to Pay</strong>
                      <strong>${orderTotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="checkout-actions-footer">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setCheckoutStep('cart')}
                  >
                    ← Back to Cart
                  </button>
                  <button type="submit" className="button button-primary place-order-btn">
                    Place Order (${orderTotal.toFixed(2)})
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: ORDER SUCCESS */}
            {checkoutStep === 'success' && lastPlacedOrder && (
              <div className="order-success-screen">
                <div className="success-icon-bubble">
                  <IconCheckSuccess size={34} />
                </div>
                <h3>Order Placed Successfully!</h3>
                <p>Thank you for shopping with Gather! Your order has been confirmed.</p>

                <div className="receipt-box">
                  <div className="receipt-row">
                    <span>Order Number:</span>
                    <strong>{lastPlacedOrder.id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Date & Time:</span>
                    <span>{lastPlacedOrder.date}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Payment:</span>
                    <span>{lastPlacedOrder.paymentMethod}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Delivering To:</span>
                    <span>{lastPlacedOrder.shippingAddress.fullName} ({lastPlacedOrder.shippingAddress.city})</span>
                  </div>
                  <div className="receipt-row receipt-total">
                    <strong>Total Paid:</strong>
                    <strong>${lastPlacedOrder.total.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="order-success-actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      setCheckoutStep('cart')
                      setIsCartOpen(false)
                      setActiveTab('orders')
                    }}
                  >
                    View My Orders
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setCheckoutStep('cart')
                      setIsCartOpen(false)
                      setActiveTab('browse')
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
