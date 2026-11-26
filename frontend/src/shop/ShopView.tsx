import { useState, useEffect, useMemo } from 'react'
import {
  api,
  type AuthUser,
  type ApiShop,
  type ApiProduct,
  type ApiOrder,
  type ApiMerchantOrder,
  type ApiMerchantAnalytics,
} from '../api/client'

// --- Professional SVG Icons (Clean Vector Outlines) ---
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

function IconTruck({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
      <circle cx="17" cy="18.5" r="2.5" />
      <circle cx="7" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconDollar({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function IconClock({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconTrendingUp({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

export interface Product {
  id: string
  name: string
  category: 'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets' | string
  price: number
  originalPrice?: number
  rating: number
  reviewsCount: number
  badge?: string
  description: string
  image: string
  inStock: boolean
  shopId?: string | number
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
  status: 'Processing' | 'Shipped' | 'Delivered' | string
}

export interface UserShop {
  id: string
  ownerId: number | string
  ownerUsername: string
  name: string
  tagline: string
  category: 'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets' | 'All Categories' | string
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
  status: 'active' | 'verified' | string
  productsCount: number
}

export interface MerchantOrderItem {
  id: number
  productId: number | null
  productName: string
  price: number
  quantity: number
  imageUrl: string | null
}

export interface MerchantOrder {
  id: number
  orderCode: string
  userId: number
  totalAmount: number
  merchantSubtotal: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  paymentMethod: string
  status: string
  createdAt: string
  items: MerchantOrderItem[]
}

export interface MerchantAnalytics {
  totalOrders: number
  totalRevenue: number
  processingCount: number
  onTheWayCount: number
  deliveredCount: number
  totalProducts: number
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
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
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
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700',
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
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700',
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
    description: 'Haptic feedback, dynamic adaptive triggers, built-in microphone and signature comfort grip.',
    image: 'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=700',
    inStock: true,
  },
  {
    id: 'prod-5',
    name: 'Apple Watch Ultra 2 Titanium Case',
    category: 'Gadgets',
    price: 799,
    originalPrice: 849,
    rating: 4.9,
    reviewsCount: 780,
    badge: 'Flagship',
    description: '49mm aerospace titanium case, precision dual-frequency GPS, up to 72 hours battery in low-power.',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700',
    inStock: true,
  },
  {
    id: 'prod-6',
    name: 'Razer BlackShark V2 Pro Wireless Headset',
    category: 'Gaming',
    price: 149,
    originalPrice: 179,
    rating: 4.7,
    reviewsCount: 530,
    badge: 'Esports Pro',
    description: 'HyperClear super wideband mic, TriForce titanium 50mm drivers, ultra-soft breathable memory foam cushions.',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700',
    inStock: true,
  },
  {
    id: 'prod-7',
    name: 'Nomad Rugged Horween Leather iPhone Case',
    category: 'Gadgets',
    price: 59,
    originalPrice: 69,
    rating: 4.6,
    reviewsCount: 320,
    badge: 'Handcrafted',
    description: 'Full-grain Horween leather that patinas with time, 10ft drop protection, MagSafe neodymium array.',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700',
    inStock: true,
  },
  {
    id: 'prod-8',
    name: 'Marshall Stanmore III Bluetooth Speaker',
    category: 'Electronics',
    price: 379,
    originalPrice: 420,
    rating: 4.8,
    reviewsCount: 610,
    badge: 'Premium Sound',
    description: 'Iconic vintage styling, wider stereo soundstage, dynamic loudness, Bluetooth 5.2 connectivity.',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700',
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
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=700',
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
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700',
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
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=700',
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
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700',
    inStock: true,
  },
]

// Preset logo options for quick store setup
const LOGO_PRESETS = [
  { label: 'Cyber Tech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' },
  { label: 'Pro Gamer', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150' },
  { label: 'Minimalist', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150' },
  { label: 'Gadget Lab', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150' },
]

// Preset banner gradients
const BANNER_PRESETS = [
  { id: 'blue', label: 'Deep Blue', css: 'linear-gradient(135deg, #1e3a8a, #0284c7)' },
  { id: 'dark', label: 'Obsidian Slate', css: 'linear-gradient(135deg, #0f172a, #334155)' },
  { id: 'violet', label: 'Cyber Violet', css: 'linear-gradient(135deg, #312e81, #7c3aed)' },
  { id: 'emerald', label: 'Emerald Sleek', css: 'linear-gradient(135deg, #064e3b, #059669)' },
]

interface ShopViewProps {
  token?: string | null
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
  token,
  user,
  cart,
  onCartChange,
  userShop: userShopProp,
  onUserShopChange,
  openShopTrigger,
  onOpenShopTriggerHandled,
}: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'orders' | 'myshop' | 'publicShop'>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured')
  const [publicShopStore, setPublicShopStore] = useState<UserShop | null>(null)

  // Checkout & Order modal states
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart')
  const [shippingName, setShippingName] = useState(user.nickname || user.first_name || user.username)
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingCity, setShippingCity] = useState('Dhaka')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'mfs'>('cod')
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null)

  // User-scoped storage keys
  const userOrderKey = `gather_shop_orders_${user.id}`

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(userOrderKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // User Shop state
  const [userShop, setUserShop] = useState<UserShop | null>(userShopProp || null)

  // STRICT OWNERSHIP VERIFICATION:
  // A user can ONLY manage/edit a shop if their user.id matches the shop's ownerId
  const isShopOwner = Boolean(
    userShop &&
    Number(userShop.ownerId) === Number(user.id)
  )

  // Products from backend
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Open Shop Modal states
  const [isOpenShopModal, setIsOpenShopModal] = useState(false)
  const [shopName, setShopName] = useState('')
  const [shopTagline, setShopTagline] = useState('')
  const [shopCategory, setShopCategory] = useState<'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets' | 'All Categories'>('Electronics')
  const [shopEmail, setShopEmail] = useState(`${user.username}@merchant.gather`)
  const [shopPhone, setShopPhone] = useState('+880 1700-000000')
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
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700')

  // Edit Product Modal states (Shop Owner only)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editProdName, setEditProdName] = useState('')
  const [editProdCategory, setEditProdCategory] = useState<'Electronics' | 'Gaming' | 'Apparel' | 'Gadgets'>('Electronics')
  const [editProdPrice, setEditProdPrice] = useState('')
  const [editProdOriginalPrice, setEditProdOriginalPrice] = useState('')
  const [editProdBadge, setEditProdBadge] = useState('')
  const [editProdDescription, setEditProdDescription] = useState('')
  const [editProdImage, setEditProdImage] = useState('')
  const [editProdInStock, setEditProdInStock] = useState(true)

  // Merchant Dashboard, Analytics & Orders states
  const [merchantSubTab, setMerchantSubTab] = useState<'dashboard' | 'orders' | 'inventory' | 'settings'>('dashboard')
  const [merchantOrders, setMerchantOrders] = useState<MerchantOrder[]>([])
  const [merchantAnalytics, setMerchantAnalytics] = useState<MerchantAnalytics | null>(null)
  const [isLoadingMerchantOrders, setIsLoadingMerchantOrders] = useState(false)
  const [merchantOrderStatusFilter, setMerchantOrderStatusFilter] = useState<'all' | 'Processing' | 'On the Way' | 'Delivered'>('all')
  const [merchantOrderSearch, setMerchantOrderSearch] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  // Filtered merchant orders
  const filteredMerchantOrders = useMemo(() => {
    return merchantOrders.filter((order: MerchantOrder) => {
      if (merchantOrderStatusFilter !== 'all' && order.status !== merchantOrderStatusFilter) {
        return false
      }
      if (merchantOrderSearch.trim()) {
        const query = merchantOrderSearch.toLowerCase()
        const matchesCode = order.orderCode.toLowerCase().includes(query)
        const matchesCustomer =
          order.shippingName.toLowerCase().includes(query) ||
          order.shippingPhone.toLowerCase().includes(query) ||
          order.shippingAddress.toLowerCase().includes(query)
        const matchesProduct = order.items.some((it: MerchantOrderItem) =>
          it.productName.toLowerCase().includes(query)
        )
        return matchesCode || matchesCustomer || matchesProduct
      }
      return true
    })
  }, [merchantOrders, merchantOrderStatusFilter, merchantOrderSearch])

  // Synchronize internal userShop with prop
  useEffect(() => {
    if (userShopProp !== undefined) {
      setUserShop(userShopProp)
    }
  }, [userShopProp])

  // Fetch products from backend
  const fetchProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const data = await api.getProducts()
      if (data && data.length > 0) {
        setProducts(
          data.map((p: ApiProduct) => ({
            id: String(p.id),
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.original_price ?? undefined,
            rating: p.rating,
            reviewsCount: p.reviews_count,
            badge: p.badge ?? undefined,
            description: p.description || '',
            image: p.image_url,
            inStock: p.in_stock,
            shopId: p.shop_id ?? undefined,
            shopName: p.shop_name ?? undefined,
          }))
        )
      }
    } catch {
      // Keep sample products if offline
    } finally {
      setIsLoadingProducts(false)
    }
  }

  // Fetch user orders from backend
  const fetchOrders = async () => {
    if (!token) return
    try {
      const data = await api.getMyOrders(token)
      if (data) {
        const mappedOrders: Order[] = data.map((o: ApiOrder) => ({
          id: o.order_code,
          date: new Date(o.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          items: o.items.map(item => ({
            product: {
              id: item.product_id ? String(item.product_id) : 'custom',
              name: item.product_name,
              category: 'General',
              price: item.price,
              rating: 5.0,
              reviewsCount: 1,
              description: '',
              image: item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700',
              inStock: true,
            },
            quantity: item.quantity,
          })),
          total: o.total_amount,
          shippingAddress: {
            fullName: o.shipping_name,
            phone: o.shipping_phone,
            address: o.shipping_address,
            city: o.shipping_city,
          },
          paymentMethod:
            o.payment_method === 'cod'
              ? 'Cash on Delivery'
              : o.payment_method === 'card'
              ? 'Credit / Debit Card'
              : 'Mobile Banking (bKash / Nagad)',
          status: o.status,
        }))
        setOrders(mappedOrders)
        try {
          localStorage.setItem(userOrderKey, JSON.stringify(mappedOrders))
        } catch {}
      }
    } catch {}
  }

  // Fetch shop for current authenticated user
  const fetchMyShop = async () => {
    if (!token) return
    try {
      const shop = await api.getMyShop(token)
      if (shop) {
        const mappedShop: UserShop = {
          id: String(shop.id),
          ownerId: shop.owner_id,
          ownerUsername: shop.owner_username,
          name: shop.name,
          tagline: shop.tagline || 'Official Gather Verified Merchant',
          category: shop.category,
          email: shop.email || '',
          phone: shop.phone || '',
          address: shop.address || '',
          city: shop.city || 'Dhaka',
          description: shop.description || '',
          returnPolicy: shop.return_policy || '7 Days Replacement Warranty',
          logoUrl: shop.logo_url || LOGO_PRESETS[0].url,
          bannerGradient: shop.banner_gradient || BANNER_PRESETS[0].css,
          rating: shop.rating,
          reviewsCount: shop.reviews_count,
          createdAt: new Date(shop.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          status: shop.status,
          productsCount: shop.products_count,
        }
        setUserShop(mappedShop)
        onUserShopChange?.(mappedShop)
      } else {
        setUserShop(null)
        onUserShopChange?.(null)
      }
    } catch {
      // Keep state untouched if network error
    }
  }

  // Fetch merchant orders received by the store
  const fetchMerchantOrders = async () => {
    if (!token || !isShopOwner) return
    setIsLoadingMerchantOrders(true)
    try {
      const data = await api.getMerchantOrders(token)
      if (data) {
        setMerchantOrders(
          data.map((o: ApiMerchantOrder) => ({
            id: o.id,
            orderCode: o.order_code,
            userId: o.user_id,
            totalAmount: o.total_amount,
            merchantSubtotal: o.merchant_subtotal,
            shippingName: o.shipping_name,
            shippingPhone: o.shipping_phone,
            shippingAddress: o.shipping_address,
            shippingCity: o.shipping_city,
            paymentMethod: o.payment_method,
            status: o.status,
            createdAt: new Date(o.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            items: o.items.map(it => ({
              id: it.id,
              productId: it.product_id,
              productName: it.product_name,
              price: it.price,
              quantity: it.quantity,
              imageUrl: it.image_url,
            })),
          }))
        )
      }
    } catch {
    } finally {
      setIsLoadingMerchantOrders(false)
    }
  }

  // Fetch merchant analytics
  const fetchMerchantAnalytics = async () => {
    if (!token || !isShopOwner) return
    try {
      const data = await api.getMerchantAnalytics(token)
      if (data) {
        setMerchantAnalytics({
          totalOrders: data.total_orders,
          totalRevenue: data.total_revenue,
          processingCount: data.processing_count,
          onTheWayCount: data.on_the_way_count,
          deliveredCount: data.delivered_count,
          totalProducts: data.total_products,
        })
      }
    } catch {}
  }

  // Handle order status update (Processing -> On the Way -> Delivered)
  const handleUpdateOrderStatus = async (orderId: number, nextStatus: string) => {
    if (!token || !isShopOwner) return
    setUpdatingOrderId(orderId)

    // 1. Instant optimistic update for merchant orders & counters
    setMerchantOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: nextStatus } : o))
    )

    // 2. If viewing a strict status filter that is no longer matching, reset filter to 'all' so order remains visible
    if (merchantOrderStatusFilter !== 'all' && merchantOrderStatusFilter !== nextStatus) {
      setMerchantOrderStatusFilter('all')
    }

    try {
      const updated = await api.updateMerchantOrderStatus(token, orderId, nextStatus)
      setMerchantOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: updated.status } : o))
      )
      // 3. Synchronize customer orders view if user has active orders
      setOrders(prev =>
        prev.map(o => (o.id === updated.order_code || Number(o.id.replace(/\D/g, '')) === orderId ? { ...o, status: updated.status } : o))
      )
      fetchMerchantAnalytics()
      fetchOrders()
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.')
      fetchMerchantOrders()
    } finally {
      setUpdatingOrderId(null)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchOrders()
    fetchMyShop()
    if (isShopOwner) {
      fetchMerchantOrders()
      fetchMerchantAnalytics()
    }
  }, [token, user.id, isShopOwner])

  useEffect(() => {
    if (activeTab === 'myshop' && isShopOwner) {
      fetchMerchantOrders()
      fetchMerchantAnalytics()
    }
  }, [activeTab, isShopOwner])

  // Handle trigger from Settings button
  useEffect(() => {
    if (openShopTrigger) {
      if (!isShopOwner) {
        setIsOpenShopModal(true)
      } else {
        setActiveTab('myshop')
      }
      onOpenShopTriggerHandled?.()
    }
  }, [openShopTrigger, isShopOwner, onOpenShopTriggerHandled])

  // Pre-fill form when userShop exists and modal is opened for editing
  function openShopModalForEdit() {
    if (isShopOwner && userShop) {
      setShopName(userShop.name)
      setShopTagline(userShop.tagline)
      setShopCategory(userShop.category as any)
      setShopEmail(userShop.email)
      setShopPhone(userShop.phone)
      setShopCity(userShop.city)
      setShopAddress(userShop.address)
      setShopDescription(userShop.description)
      setShopReturnPolicy(userShop.returnPolicy)
      setShopLogoUrl(userShop.logoUrl || LOGO_PRESETS[0].url)
      setShopBannerGradient(userShop.bannerGradient || BANNER_PRESETS[0].css)
    } else {
      setShopName('')
      setShopTagline('')
      setShopEmail(`${user.username}@merchant.gather`)
      setShopPhone('+880 1700-000000')
      setShopCity('Dhaka')
      setShopAddress('')
      setShopDescription('')
    }
    setShopSuccessBanner(false)
    setIsOpenShopModal(true)
  }

  // Handle Open/Create Shop form submit
  async function handleOpenShopSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!shopName.trim()) return

    if (token) {
      try {
        let resp: ApiShop
        if (isShopOwner && userShop) {
          resp = await api.updateMyShop(token, {
            name: shopName.trim(),
            tagline: shopTagline.trim(),
            category: shopCategory,
            email: shopEmail.trim(),
            phone: shopPhone.trim(),
            address: shopAddress.trim(),
            city: shopCity.trim(),
            description: shopDescription.trim(),
            return_policy: shopReturnPolicy.trim(),
            logo_url: shopLogoUrl,
            banner_gradient: shopBannerGradient,
          })
        } else {
          resp = await api.createShop(token, {
            name: shopName.trim(),
            tagline: shopTagline.trim(),
            category: shopCategory,
            email: shopEmail.trim(),
            phone: shopPhone.trim(),
            address: shopAddress.trim(),
            city: shopCity.trim(),
            description: shopDescription.trim(),
            return_policy: shopReturnPolicy.trim(),
            logo_url: shopLogoUrl,
            banner_gradient: shopBannerGradient,
          })
        }

        const updatedShop: UserShop = {
          id: String(resp.id),
          ownerId: resp.owner_id,
          ownerUsername: resp.owner_username,
          name: resp.name,
          tagline: resp.tagline || '',
          category: resp.category,
          email: resp.email || '',
          phone: resp.phone || '',
          address: resp.address || '',
          city: resp.city || '',
          description: resp.description || '',
          returnPolicy: resp.return_policy || '7 Days Replacement Warranty',
          logoUrl: resp.logo_url || LOGO_PRESETS[0].url,
          bannerGradient: resp.banner_gradient || BANNER_PRESETS[0].css,
          rating: resp.rating,
          reviewsCount: resp.reviews_count,
          createdAt: new Date(resp.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          status: resp.status,
          productsCount: resp.products_count,
        }
        setUserShop(updatedShop)
        onUserShopChange?.(updatedShop)
        setShopSuccessBanner(true)
        fetchProducts()
        return
      } catch (err: any) {
        alert(err.message || 'Failed to save shop. Please check your inputs.')
      }
    }
  }

  // Handle Add Product submit
  async function handleAddProductSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newProdName.trim() || !newProdPrice || !isShopOwner) return

    const parsedPrice = parseFloat(newProdPrice)
    const parsedOrig = newProdOriginalPrice ? parseFloat(newProdOriginalPrice) : undefined

    if (token) {
      try {
        const created = await api.createProduct(token, {
          name: newProdName.trim(),
          category: newProdCategory,
          price: isNaN(parsedPrice) ? 49 : parsedPrice,
          original_price: parsedOrig && !isNaN(parsedOrig) ? parsedOrig : undefined,
          badge: 'Merchant Official',
          description: newProdDescription.trim() || 'Verified quality product from official Gather merchant.',
          image_url: newProdImage.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=700',
          in_stock: true,
        })

        const mapped: Product = {
          id: String(created.id),
          name: created.name,
          category: created.category,
          price: created.price,
          originalPrice: created.original_price ?? undefined,
          rating: created.rating,
          reviewsCount: created.reviews_count,
          badge: created.badge ?? undefined,
          description: created.description || '',
          image: created.image_url,
          inStock: created.in_stock,
          shopId: created.shop_id ?? userShop?.id,
          shopName: created.shop_name ?? userShop?.name,
        }
        setProducts(prev => [mapped, ...prev.filter(p => p.id !== mapped.id)])
        setUserShop(prev => prev ? { ...prev, productsCount: (prev.productsCount || 0) + 1 } : null)
        setIsAddProductModal(false)
        setNewProdName('')
        setNewProdPrice('')
        setNewProdOriginalPrice('')
        setNewProdDescription('')
        setNewProdImage('')

        // Synchronize backend data across shop views
        fetchProducts()
        fetchMyShop()
        fetchMerchantAnalytics()
        return
      } catch (err: any) {
        alert(err.message || 'Failed to publish product.')
      }
    }
  }

  // Pre-fill form and open Edit Product modal (Owner-only)
  function openEditProductModal(product: Product) {
    if (!isShopOwner) return
    setEditingProduct(product)
    setEditProdName(product.name)
    setEditProdCategory((product.category as any) || 'Electronics')
    setEditProdPrice(String(product.price))
    setEditProdOriginalPrice(product.originalPrice ? String(product.originalPrice) : '')
    setEditProdBadge(product.badge || '')
    setEditProdDescription(product.description || '')
    setEditProdImage(product.image || '')
    setEditProdInStock(product.inStock !== false)
  }

  // Handle Edit Product submit (Owner-only)
  async function handleEditProductSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProduct || !isShopOwner || !editProdName.trim() || !editProdPrice) return

    const parsedPrice = parseFloat(editProdPrice)
    const parsedOrig = editProdOriginalPrice ? parseFloat(editProdOriginalPrice) : undefined
    const numericId = parseInt(editingProduct.id, 10)

    if (token && !isNaN(numericId)) {
      try {
        const updated = await api.updateProduct(token, numericId, {
          name: editProdName.trim(),
          category: editProdCategory,
          price: isNaN(parsedPrice) ? editingProduct.price : parsedPrice,
          original_price: parsedOrig,
          badge: editProdBadge.trim() || undefined,
          description: editProdDescription.trim(),
          image_url: editProdImage.trim() || editingProduct.image,
          in_stock: editProdInStock,
        })

        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: updated.name,
                  category: updated.category,
                  price: updated.price,
                  originalPrice: updated.original_price ?? undefined,
                  badge: updated.badge ?? undefined,
                  description: updated.description || '',
                  image: updated.image_url,
                  inStock: updated.in_stock,
                }
              : p
          )
        )
        setEditingProduct(null)
        return
      } catch (err: any) {
        alert(err.message || 'Failed to update product details.')
      }
    }
  }

  // Handle Delete Product (Owner-only)
  async function handleDeleteProduct(productId: string) {
    if (!isShopOwner) return
    const numericId = parseInt(productId, 10)
    if (token && !isNaN(numericId)) {
      try {
        await api.deleteProduct(token, numericId)
        setProducts(prev => prev.filter(p => p.id !== productId))
        setUserShop(prev => prev ? { ...prev, productsCount: Math.max(0, (prev.productsCount || 1) - 1) } : null)
        fetchProducts()
        fetchMyShop()
        fetchMerchantAnalytics()
        return
      } catch (err: any) {
        alert(err.message || 'Could not delete product.')
      }
    }
  }

  // Handle viewing another merchant's public store
  async function handleViewPublicStore(shopId?: string | number, shopNameFallback?: string) {
    if (!shopId) return
    try {
      const publicShop = await api.getPublicShop(String(shopId))
      setPublicShopStore({
        id: String(publicShop.id),
        ownerId: publicShop.owner_id,
        ownerUsername: publicShop.owner_username,
        name: publicShop.name,
        tagline: publicShop.tagline || '',
        category: publicShop.category,
        description: publicShop.description || '',
        email: publicShop.email || '',
        phone: publicShop.phone || '',
        address: publicShop.address || '',
        city: publicShop.city || '',
        logoUrl: publicShop.logo_url || LOGO_PRESETS[0].url,
        bannerGradient: publicShop.banner_gradient || BANNER_PRESETS[0].css,
        returnPolicy: publicShop.return_policy || '7 Days Replacement Warranty',
        rating: publicShop.rating,
        reviewsCount: publicShop.reviews_count,
        createdAt: new Date(publicShop.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        status: publicShop.status,
        productsCount: publicShop.products_count,
      })
      setActiveTab('publicShop')
    } catch {
      // Fallback
      if (shopNameFallback) {
        setSearchQuery(shopNameFallback)
        setActiveTab('browse')
      }
    }
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

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) return

    if (token) {
      try {
        const orderReq = {
          shipping_name: shippingName.trim(),
          shipping_phone: shippingPhone.trim(),
          shipping_address: shippingAddress.trim(),
          shipping_city: shippingCity.trim(),
          payment_method: paymentMethod,
          items: cart.map(i => ({
            product_id: !isNaN(Number(i.product.id)) ? Number(i.product.id) : undefined,
            product_name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            image_url: i.product.image,
          })),
        }

        const resp = await api.createOrder(token, orderReq)
        const placedOrder: Order = {
          id: resp.order_code,
          date: new Date(resp.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          items: [...cart],
          total: resp.total_amount,
          shippingAddress: {
            fullName: resp.shipping_name,
            phone: resp.shipping_phone,
            address: resp.shipping_address,
            city: resp.shipping_city,
          },
          paymentMethod:
            resp.payment_method === 'cod'
              ? 'Cash on Delivery'
              : resp.payment_method === 'card'
              ? 'Credit / Debit Card'
              : 'Mobile Banking (bKash / Nagad)',
          status: resp.status,
        }

        setOrders(prev => [placedOrder, ...prev])
        setLastPlacedOrder(placedOrder)
        onCartChange([])
        setCheckoutStep('success')
        return
      } catch (err: any) {
        alert(err.message || 'Could not place order. Please try again.')
      }
    }
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase()
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
      return 0
    })
  }, [products, selectedCategory, searchQuery, sortBy])

  // Products belonging to the logged-in user's shop (Strict Ownership)
  const myShopProducts = useMemo(() => {
    if (!isShopOwner || !userShop) return []
    return products.filter(p => String(p.shopId) === String(userShop.id))
  }, [products, isShopOwner, userShop])

  // Real-time reactive merchant statistics (KPIs & counters)
  const merchantStats = useMemo(() => {
    let processing = 0
    let onTheWay = 0
    let delivered = 0
    let revenue = 0

    merchantOrders.forEach(o => {
      revenue += o.merchantSubtotal
      const st = (o.status || '').toLowerCase().trim()
      if (st === 'processing') {
        processing++
      } else if (st === 'on the way' || st === 'shipped') {
        onTheWay++
      } else if (st === 'delivered') {
        delivered++
      }
    })

    const computedTotalProducts = Math.max(
      myShopProducts.length,
      userShop?.productsCount ?? 0,
      merchantAnalytics?.totalProducts ?? 0
    )

    return {
      totalRevenue: merchantOrders.length > 0 ? revenue : (merchantAnalytics?.totalRevenue ?? 0),
      totalOrders: Math.max(merchantOrders.length, merchantAnalytics?.totalOrders ?? 0),
      processingCount: merchantOrders.length > 0 ? processing : (merchantAnalytics?.processingCount ?? 0),
      onTheWayCount: merchantOrders.length > 0 ? onTheWay : (merchantAnalytics?.onTheWayCount ?? 0),
      deliveredCount: merchantOrders.length > 0 ? delivered : (merchantAnalytics?.deliveredCount ?? 0),
      totalProducts: computedTotalProducts,
    }
  }, [merchantOrders, merchantAnalytics, myShopProducts.length, userShop?.productsCount])

  // Products belonging to the public merchant store currently being viewed
  const publicStoreProducts = useMemo(() => {
    if (!publicShopStore) return []
    return products.filter(p => String(p.shopId) === String(publicShopStore.id))
  }, [products, publicShopStore])

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

          {/* Strict Ownership:
              If authenticated user owns a shop -> Show 'My Shop' merchant toggle
              If authenticated user does NOT own a shop -> Show 'Open a Shop' button */}
          {isShopOwner ? (
            <button
              type="button"
              className={`shop-tab-toggle shop-myshop-toggle ${activeTab === 'myshop' ? 'active' : ''}`}
              onClick={() => setActiveTab(activeTab === 'myshop' ? 'browse' : 'myshop')}
              title="Manage your official storefront"
            >
              <IconStore size={15} />
              <span>My Shop</span>
              <span className="shop-verified-dot">●</span>
            </button>
          ) : (
            <button
              type="button"
              className="shop-tab-toggle shop-open-new-toggle"
              onClick={openShopModalForEdit}
              title="Open your own shop on Gather"
            >
              <IconPlus size={14} />
              <span>Open a Shop</span>
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
          VIEW 1: MY SHOP STOREFRONT & MERCHANT DASHBOARD (OWNER ONLY)
          ========================================================= */}
      {activeTab === 'myshop' && isShopOwner && userShop ? (
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
                  <span>Owner: <strong>@{userShop.ownerUsername} (You)</strong></span>
                </div>
              </div>

              {/* Administrative Actions: STRICTLY FOR THE OWNER */}
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

          {/* Merchant Navigation Subtabs */}
          <div className="merchant-subtabs-nav">
            <button
              type="button"
              className={`merchant-subtab-btn ${merchantSubTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setMerchantSubTab('dashboard')}
            >
              <IconTrendingUp size={15} />
              <span>Overview & Analytics</span>
            </button>
            <button
              type="button"
              className={`merchant-subtab-btn ${merchantSubTab === 'orders' ? 'active' : ''}`}
              onClick={() => setMerchantSubTab('orders')}
            >
              <IconPackage size={15} />
              <span>Customer Orders</span>
              {merchantOrders.length > 0 && (
                <span className="merchant-subtab-badge">{merchantOrders.length}</span>
              )}
            </button>
            <button
              type="button"
              className={`merchant-subtab-btn ${merchantSubTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setMerchantSubTab('inventory')}
            >
              <IconGrid size={15} />
              <span>Inventory & Catalog</span>
              <span className="merchant-subtab-badge secondary">{myShopProducts.length}</span>
            </button>
            <button
              type="button"
              className={`merchant-subtab-btn ${merchantSubTab === 'settings' ? 'active' : ''}`}
              onClick={() => setMerchantSubTab('settings')}
            >
              <IconShieldCheck size={15} />
              <span>Store Policies & Info</span>
            </button>
          </div>

          {/* =========================================================
              SUB-TAB 1: MERCHANT DASHBOARD OVERVIEW & ANALYTICS
              ========================================================= */}
          {merchantSubTab === 'dashboard' && (
            <div className="merchant-dashboard-view">
              {/* Top Key Performance Indicators (KPIs) */}
              <div className="merchant-kpi-grid">
                <div className="merchant-kpi-card kpi-revenue">
                  <div className="kpi-icon-bubble bubble-emerald">
                    <IconDollar size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Total Net Revenue</span>
                    <strong className="kpi-value">${merchantStats.totalRevenue.toFixed(2)}</strong>
                    <small className="kpi-helper">Net sales generated from your items</small>
                  </div>
                </div>

                <div className="merchant-kpi-card kpi-orders">
                  <div className="kpi-icon-bubble bubble-blue">
                    <IconPackage size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Total Orders</span>
                    <strong className="kpi-value">{merchantStats.totalOrders}</strong>
                    <small className="kpi-helper">Customer purchases received</small>
                  </div>
                </div>

                <div className="merchant-kpi-card kpi-processing">
                  <div className="kpi-icon-bubble bubble-amber">
                    <IconClock size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">In Processing (Packing)</span>
                    <strong className="kpi-value">{merchantStats.processingCount}</strong>
                    <small className="kpi-helper">Orders ready for dispatch</small>
                  </div>
                </div>

                <div className="merchant-kpi-card kpi-transit">
                  <div className="kpi-icon-bubble bubble-sky">
                    <IconTruck size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">On the Way (In Transit)</span>
                    <strong className="kpi-value">{merchantStats.onTheWayCount}</strong>
                    <small className="kpi-helper">Packages with courier</small>
                  </div>
                </div>

                <div className="merchant-kpi-card kpi-delivered">
                  <div className="kpi-icon-bubble bubble-teal">
                    <IconCheckSuccess size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Delivered & Complete</span>
                    <strong className="kpi-value">{merchantStats.deliveredCount}</strong>
                    <small className="kpi-helper">Completed handovers</small>
                  </div>
                </div>

                <div className="merchant-kpi-card kpi-catalog">
                  <div className="kpi-icon-bubble bubble-violet">
                    <IconGrid size={20} />
                  </div>
                  <div className="kpi-data">
                    <span className="kpi-label">Active Store Catalog</span>
                    <strong className="kpi-value">{merchantStats.totalProducts}</strong>
                    <small className="kpi-helper">Products live on Gather</small>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview Card */}
              <div className="merchant-recent-orders-card">
                <div className="recent-orders-header">
                  <div>
                    <h3>Recent Customer Orders ({merchantOrders.length})</h3>
                    <small>Latest transactions placed by Gather users for your products</small>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setMerchantSubTab('orders')}
                  >
                    View All Orders & Position Details →
                  </button>
                </div>

                {merchantOrders.length === 0 ? (
                  <div className="shop-empty-state" style={{ padding: '36px 20px' }}>
                    <span className="empty-icon">
                      <IconPackage size={40} />
                    </span>
                    <h4>No customer orders yet</h4>
                    <p>When Gather community members buy your items, your orders and payout analytics will appear here.</p>
                  </div>
                ) : (
                  <div className="recent-orders-table-wrapper">
                    <table className="merchant-table">
                      <thead>
                        <tr>
                          <th>Order Code</th>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Destination</th>
                          <th>Items</th>
                          <th>Your Earnings</th>
                          <th>Current Position</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {merchantOrders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td>
                              <strong className="order-code-pill">{o.orderCode}</strong>
                            </td>
                            <td>{o.createdAt}</td>
                            <td>
                              <strong>{o.shippingName}</strong>
                            </td>
                            <td>{o.shippingCity}</td>
                            <td>
                              <span className="item-count-chip">{o.items.reduce((s, it) => s + it.quantity, 0)} pcs</span>
                            </td>
                            <td>
                              <strong className="payout-highlight">${o.merchantSubtotal.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={`order-status-badge status-${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {o.status === 'Processing' && <IconClock size={12} />}
                                {o.status === 'On the Way' && <IconTruck size={12} />}
                                {o.status === 'Delivered' && <IconCheckSuccess size={12} />}
                                <span>{o.status}</span>
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="button button-secondary table-action-btn"
                                onClick={() => setMerchantSubTab('orders')}
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Order Fulfillment Flow Explanation */}
              <div className="merchant-flow-card">
                <h4>Package Fulfillment & Position Guide</h4>
                <div className="flow-steps-grid">
                  <div className="flow-step-item">
                    <div className="flow-step-icon step-amber">
                      <IconClock size={18} />
                    </div>
                    <div>
                      <strong>1. Processing (Packing)</strong>
                      <p>Verify customer address & phone, pack items carefully with warranty slips.</p>
                    </div>
                  </div>

                  <div className="flow-step-item">
                    <div className="flow-step-icon step-blue">
                      <IconTruck size={18} />
                    </div>
                    <div>
                      <strong>2. On the Way (In Transit)</strong>
                      <p>Hand over to courier or shipping partner. Package is en route to customer city.</p>
                    </div>
                  </div>

                  <div className="flow-step-item">
                    <div className="flow-step-icon step-emerald">
                      <IconCheckSuccess size={18} />
                    </div>
                    <div>
                      <strong>3. Delivered (Completed)</strong>
                      <p>Customer receives parcel and completes payment. Order marked as finalized.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              SUB-TAB 2: CUSTOMER ORDERS MANAGEMENT & POSITION TRACKER
              ========================================================= */}
          {merchantSubTab === 'orders' && (
            <div className="merchant-orders-view">
              <div className="merchant-orders-top-bar">
                <div>
                  <h3>Customer Orders & Delivery Positions</h3>
                  <small>Manage package status, inspect payment details, and view customer shipping information</small>
                </div>

                <div className="merchant-order-search">
                  <IconSearch size={15} />
                  <input
                    type="text"
                    placeholder="Search by order code, customer name, city, or product..."
                    value={merchantOrderSearch}
                    onChange={e => setMerchantOrderSearch(e.target.value)}
                  />
                  {merchantOrderSearch && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setMerchantOrderSearch('')}
                    >
                      <IconClose size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="merchant-order-filter-pills">
                <button
                  type="button"
                  className={`order-filter-pill ${merchantOrderStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMerchantOrderStatusFilter('all')}
                >
                  All Orders ({merchantOrders.length})
                </button>
                <button
                  type="button"
                  className={`order-filter-pill pill-processing ${merchantOrderStatusFilter === 'Processing' ? 'active' : ''}`}
                  onClick={() => setMerchantOrderStatusFilter('Processing')}
                >
                  <IconClock size={13} />
                  <span>Processing ({merchantStats.processingCount})</span>
                </button>
                <button
                  type="button"
                  className={`order-filter-pill pill-transit ${merchantOrderStatusFilter === 'On the Way' ? 'active' : ''}`}
                  onClick={() => setMerchantOrderStatusFilter('On the Way')}
                >
                  <IconTruck size={13} />
                  <span>On the Way ({merchantStats.onTheWayCount})</span>
                </button>
                <button
                  type="button"
                  className={`order-filter-pill pill-delivered ${merchantOrderStatusFilter === 'Delivered' ? 'active' : ''}`}
                  onClick={() => setMerchantOrderStatusFilter('Delivered')}
                >
                  <IconCheckSuccess size={13} />
                  <span>Delivered ({merchantStats.deliveredCount})</span>
                </button>
              </div>

              {/* Orders List */}
              {filteredMerchantOrders.length === 0 ? (
                <div className="shop-empty-state">
                  <span className="empty-icon">
                    <IconPackage size={44} />
                  </span>
                  <h3>No customer orders found</h3>
                  <p>
                    {merchantOrderSearch
                      ? 'No orders matched your search query. Try clearing your filters.'
                      : 'There are no customer orders in this delivery position right now.'}
                  </p>
                  {(merchantOrderSearch || merchantOrderStatusFilter !== 'all') && (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => {
                        setMerchantOrderSearch('')
                        setMerchantOrderStatusFilter('all')
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="merchant-orders-list">
                  {filteredMerchantOrders.map((order: MerchantOrder) => (
                    <div key={order.id} className="merchant-order-card">
                      {/* Order Card Header */}
                      <div className="merchant-order-card-header">
                        <div className="header-left">
                          <strong className="merchant-order-code">{order.orderCode}</strong>
                          <span className="merchant-order-date">Placed on {order.createdAt}</span>
                        </div>

                        <div className="header-right">
                          {/* Order Position Badge */}
                          <div className={`order-status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status === 'Processing' && <IconClock size={14} />}
                            {order.status === 'On the Way' && <IconTruck size={14} />}
                            {order.status === 'Delivered' && <IconCheckSuccess size={14} />}
                            <span>Position: {order.status}</span>
                          </div>

                          {/* Order Position Controller Dropdown */}
                          <div className="order-position-controller">
                            <span className="position-label">Update Position:</span>
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`order-status-select select-${order.status.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <option value="Processing">Processing (Packing)</option>
                              <option value="On the Way">On the Way (In Transit)</option>
                              <option value="Delivered">Delivered (Completed)</option>
                            </select>
                            {updatingOrderId === order.id && (
                              <span className="updating-spinner" title="Updating position...">●</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Visual Order Position Lifecycle Stepper */}
                      <div className="order-position-stepper">
                        <div
                          className={`stepper-step ${order.status === 'Processing' || order.status === 'On the Way' || order.status === 'Delivered' ? 'active' : ''} ${order.status === 'On the Way' || order.status === 'Delivered' ? 'completed' : ''}`}
                          onClick={() => handleUpdateOrderStatus(order.id, 'Processing')}
                          title="Click to set position to Processing"
                        >
                          <div className="stepper-dot">
                            {order.status === 'On the Way' || order.status === 'Delivered' ? '✓' : '1'}
                          </div>
                          <div className="stepper-label">
                            <strong>Processing</strong>
                            <span>Packing & Verification</span>
                          </div>
                        </div>

                        <div className={`stepper-connector ${order.status === 'On the Way' || order.status === 'Delivered' ? 'filled' : ''}`} />

                        <div
                          className={`stepper-step ${order.status === 'On the Way' || order.status === 'Delivered' ? 'active' : ''} ${order.status === 'Delivered' ? 'completed' : ''}`}
                          onClick={() => handleUpdateOrderStatus(order.id, 'On the Way')}
                          title="Click to set position to On the Way"
                        >
                          <div className="stepper-dot">
                            {order.status === 'Delivered' ? '✓' : '2'}
                          </div>
                          <div className="stepper-label">
                            <strong>On the Way</strong>
                            <span>Courier In Transit</span>
                          </div>
                        </div>

                        <div className={`stepper-connector ${order.status === 'Delivered' ? 'filled' : ''}`} />

                        <div
                          className={`stepper-step ${order.status === 'Delivered' ? 'active completed' : ''}`}
                          onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                          title="Click to set position to Delivered"
                        >
                          <div className="stepper-dot">
                            {order.status === 'Delivered' ? '✓' : '3'}
                          </div>
                          <div className="stepper-label">
                            <strong>Delivered</strong>
                            <span>Customer Handover</span>
                          </div>
                        </div>
                      </div>

                      {/* Information Grid: Customer Shipping, Payment, Financials */}
                      <div className="merchant-order-info-grid">
                        <div className="info-block">
                          <span className="info-block-label">
                            <IconPin size={13} />
                            <span>Customer & Delivery Details</span>
                          </span>
                          <strong className="customer-name">{order.shippingName}</strong>
                          <span className="customer-contact">Phone: {order.shippingPhone}</span>
                          <span className="customer-address">
                            Address: {order.shippingAddress}, {order.shippingCity}
                          </span>
                        </div>

                        <div className="info-block">
                          <span className="info-block-label">
                            <IconCard size={13} />
                            <span>Payment & Transaction</span>
                          </span>
                          <strong>Payment Method: {order.paymentMethod}</strong>
                          <span className="payment-status-chip">
                            {order.paymentMethod.toLowerCase().includes('cash')
                              ? '● Due on Delivery'
                              : '● Paid Online'}
                          </span>
                          <span className="total-order-label">Total Customer Bill: ${order.totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="info-block earnings-block">
                          <span className="info-block-label">
                            <IconDollar size={13} />
                            <span>Your Store Earnings</span>
                          </span>
                          <strong className="merchant-payout-value">${order.merchantSubtotal.toFixed(2)}</strong>
                          <small className="payout-note">Payout for products fulfilled by your shop</small>
                        </div>
                      </div>

                      {/* Products Ordered Breakdown */}
                      <div className="merchant-order-items-section">
                        <span className="items-heading">Products Ordered from Your Store:</span>
                        <div className="merchant-items-grid">
                          {order.items.map((item: MerchantOrderItem, idx: number) => (
                            <div key={idx} className="merchant-item-row">
                              <img
                                src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700'}
                                alt={item.productName}
                                className="item-thumbnail"
                              />
                              <div className="item-main-info">
                                <strong className="item-title">{item.productName}</strong>
                                <span className="item-qty-tag">Quantity: <strong>{item.quantity}</strong></span>
                              </div>
                              <div className="item-pricing">
                                <span className="item-unit-price">${item.price.toFixed(2)} each</span>
                                <strong className="item-line-total">${(item.price * item.quantity).toFixed(2)}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Status Advance Actions */}
                      <div className="merchant-order-actions-bar">
                        {order.status === 'Processing' && (
                          <button
                            type="button"
                            className="button button-primary advance-status-btn"
                            disabled={updatingOrderId === order.id}
                            onClick={() => handleUpdateOrderStatus(order.id, 'On the Way')}
                          >
                            <IconTruck size={15} />
                            <span>Dispatch & Mark On the Way →</span>
                          </button>
                        )}
                        {order.status === 'On the Way' && (
                          <button
                            type="button"
                            className="button button-primary advance-status-btn btn-delivered"
                            disabled={updatingOrderId === order.id}
                            onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                          >
                            <IconCheckSuccess size={15} />
                            <span>Confirm Delivery to Customer ✓</span>
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <span className="delivery-completed-tag">
                            <IconCheckSuccess size={14} />
                            <span>Order Fully Fulfilled & Closed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SUB-TAB 3: STORE INVENTORY & CATALOG
              ========================================================= */}
          {merchantSubTab === 'inventory' && (
            <div className="merchant-inventory-view">
              <div className="myshop-products-header">
                <div>
                  <h3>Products in Your Store ({myShopProducts.length})</h3>
                  <small>Items live and purchasable by all Gather community members</small>
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
                  <p>Your shop is live on Gather! Add your first item to start selling to community members.</p>
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

                        <div className="product-actions-row" style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="button button-secondary"
                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            onClick={() => openEditProductModal(product)}
                          >
                            <IconEdit size={14} />
                            <span>Edit Details</span>
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            style={{ color: '#ef4444', padding: '0 12px' }}
                            onClick={() => handleDeleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SUB-TAB 4: STORE INFO, POLICIES & STORY
              ========================================================= */}
          {merchantSubTab === 'settings' && (
            <div className="merchant-settings-view">
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

              {userShop.description && (
                <div className="myshop-story-box">
                  <h4>About This Store</h4>
                  <p>{userShop.description}</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={openShopModalForEdit}
                >
                  <IconEdit size={15} /> Edit Store Info & Theme
                </button>
              </div>
            </div>
          )}
        </section>
      ) : activeTab === 'publicShop' && publicShopStore ? (
        /* =========================================================
           VIEW 2: PUBLIC MERCHANT STOREFRONT (CUSTOMER BROWSING VIEW)
           ========================================================= */
        <section className="myshop-section">
          <div className="myshop-hero-card" style={{ background: publicShopStore.bannerGradient || BANNER_PRESETS[0].css }}>
            <div className="myshop-banner-overlay" />
            <div className="myshop-hero-inner">
              <div className="myshop-avatar-col">
                <img src={publicShopStore.logoUrl || LOGO_PRESETS[0].url} alt={publicShopStore.name} className="myshop-logo-img" />
                <span className="myshop-verified-badge" title="Verified Merchant">
                  <IconShieldCheck size={16} />
                </span>
              </div>

              <div className="myshop-info-col">
                <div className="myshop-title-row">
                  <h2>{publicShopStore.name}</h2>
                  <span className="myshop-category-chip">{publicShopStore.category}</span>
                  <span className="myshop-status-chip">● VERIFIED STORE</span>
                </div>
                <p className="myshop-tagline">{publicShopStore.tagline}</p>
                <div className="myshop-meta-row">
                  <span>
                    <IconStar size={13} /> <strong>{publicShopStore.rating.toFixed(1)}</strong> rating
                  </span>
                  <span>•</span>
                  <span><strong>{publicStoreProducts.length}</strong> items available</span>
                  <span>•</span>
                  <span>Merchant: <strong>@{publicShopStore.ownerUsername}</strong></span>
                </div>
              </div>

              <div className="myshop-actions-col">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setActiveTab('browse')}
                >
                  ← Back to Marketplace
                </button>
              </div>
            </div>
          </div>

          <div className="myshop-details-grid">
            <div className="myshop-detail-card">
              <span className="detail-label">Support Email</span>
              <strong>{publicShopStore.email || 'N/A'}</strong>
            </div>
            <div className="myshop-detail-card">
              <span className="detail-label">Helpline</span>
              <strong>{publicShopStore.phone || 'N/A'}</strong>
            </div>
            <div className="myshop-detail-card">
              <span className="detail-label">Location</span>
              <strong>{publicShopStore.city}, {publicShopStore.address || 'Central'}</strong>
            </div>
            <div className="myshop-detail-card">
              <span className="detail-label">Warranty / Policy</span>
              <strong>{publicShopStore.returnPolicy}</strong>
            </div>
          </div>

          <div className="myshop-products-header">
            <div>
              <h3>Products by {publicShopStore.name} ({publicStoreProducts.length})</h3>
              <small>Authentic merchandise sold directly by this seller</small>
            </div>
          </div>

          {publicStoreProducts.length === 0 ? (
            <div className="shop-empty-state">
              <span className="empty-icon">
                <IconPackage size={44} />
              </span>
              <h3>No products listed in this store</h3>
              <p>Check back later or browse other items in the marketplace.</p>
            </div>
          ) : (
            <div className="shop-products-grid">
              {publicStoreProducts.map(product => (
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
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'orders' ? (
        /* =========================================================
           VIEW 3: ORDER HISTORY (AUTHENTICATED USER ONLY)
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
           VIEW 4: PUBLIC MARKETPLACE BROWSE GRID
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
                      <button
                        type="button"
                        className="merchant-seller-link"
                        onClick={() => handleViewPublicStore(product.shopId, product.shopName)}
                        title={`View ${product.shopName} Storefront`}
                      >
                        by {product.shopName}
                      </button>
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
                <h3>{isShopOwner && userShop ? 'Edit Your Shop Details' : 'Open Your Shop on Gather'}</h3>
                <small>{isShopOwner && userShop ? 'Update your merchant information' : 'Launch your official store & start selling'}</small>
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
                <h3>{isShopOwner ? 'Storefront Updated Successfully!' : 'Congratulations! Your Store is Now Live'}</h3>
                <p>
                  Your storefront is registered and published on Gather Marketplace.
                </p>

                <div className="shop-card-preview" style={{ background: userShop?.bannerGradient || BANNER_PRESETS[0].css }}>
                  <img src={userShop?.logoUrl || LOGO_PRESETS[0].url} alt="Logo" className="preview-logo" />
                  <div>
                    <h4>{userShop?.name}</h4>
                    <p>{userShop?.tagline}</p>
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
                    + Add Product
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
                    <span>{isShopOwner && userShop ? 'Save Changes' : 'Open Shop Now'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ADD PRODUCT TO MY SHOP (OWNER ONLY)
          ========================================================= */}
      {isAddProductModal && isShopOwner && (
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
          MODAL 3: EDIT PRODUCT DETAILS (OWNER ONLY)
          ========================================================= */}
      {editingProduct && isShopOwner && (
        <div className="shop-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="shop-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="shop-modal-header">
              <div>
                <h3>Edit Product Details</h3>
                <small>Update information for "{editingProduct.name}"</small>
              </div>
              <button
                type="button"
                className="shop-modal-close"
                onClick={() => setEditingProduct(null)}
                title="Close"
              >
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="checkout-form-scroll">
              <div className="checkout-input-row">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={e => setEditProdName(e.target.value)}
                  placeholder="e.g. Wireless RGB Mechanical Keyboard"
                />
              </div>

              <div className="checkout-input-grid">
                <div>
                  <label>Category *</label>
                  <select
                    className="shop-select-field"
                    value={editProdCategory}
                    onChange={e => setEditProdCategory(e.target.value as any)}
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
                    value={editProdPrice}
                    onChange={e => setEditProdPrice(e.target.value)}
                    placeholder="99.00"
                  />
                </div>
              </div>

              <div className="checkout-input-grid">
                <div>
                  <label>Original / Cut Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProdOriginalPrice}
                    onChange={e => setEditProdOriginalPrice(e.target.value)}
                    placeholder="129.00 (optional discount)"
                  />
                </div>
                <div>
                  <label>Badge / Highlight Tag</label>
                  <input
                    type="text"
                    value={editProdBadge}
                    onChange={e => setEditProdBadge(e.target.value)}
                    placeholder="e.g. Hot Deal, Best Seller"
                  />
                </div>
              </div>

              <div className="checkout-input-row">
                <label>Product Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editProdDescription}
                  onChange={e => setEditProdDescription(e.target.value)}
                  placeholder="Specs, features, materials, and warranty information..."
                />
              </div>

              <div className="checkout-input-row">
                <label>Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={editProdImage}
                  onChange={e => setEditProdImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="checkout-input-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="editProdInStock"
                  checked={editProdInStock}
                  onChange={e => setEditProdInStock(e.target.checked)}
                />
                <label htmlFor="editProdInStock" style={{ cursor: 'pointer', margin: 0, fontWeight: 600 }}>
                  Item is In Stock & Available for Purchase
                </label>
              </div>

              <div className="checkout-actions-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary place-order-btn">
                  <IconEdit size={14} />
                  <span>Save Product Changes</span>
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
