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

interface ShopViewProps {
  user: AuthUser
  onOpenChat?: () => void
  onOpenFeed?: () => void
  cart: CartItem[]
  onCartChange: (cart: CartItem[]) => void
}

export function ShopView({
  user,
  cart,
  onCartChange,
}: ShopViewProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse')
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

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    } catch {}
  }, [orders])

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

  // Filter and sort products
  const filteredProducts = SAMPLE_PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesQuery =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesQuery
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return 0 // default featured
  })

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
              placeholder="Search products by name, gadget, category..."
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

      {/* Navigation Controls: Categories, Sort & Orders Tab */}
      <div className="shop-controls-bar">
        <div className="shop-category-pills">
          <button
            type="button"
            className={`shop-category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            <IconGrid size={14} />
            <span>All</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${selectedCategory === 'Electronics' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Electronics')}
          >
            <IconHeadphones size={14} />
            <span>Electronics</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${selectedCategory === 'Gaming' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Gaming')}
          >
            <IconGamepad size={14} />
            <span>Gaming</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${selectedCategory === 'Apparel' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Apparel')}
          >
            <IconShirt size={14} />
            <span>Apparel</span>
          </button>
          <button
            type="button"
            className={`shop-category-btn ${selectedCategory === 'Gadgets' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Gadgets')}
          >
            <IconBolt size={14} />
            <span>Gadgets</span>
          </button>
        </div>

        <div className="shop-actions-right">
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

          <button
            type="button"
            className={`shop-tab-toggle ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab(activeTab === 'browse' ? 'orders' : 'browse')}
          >
            <IconPackage size={15} />
            <span>My Orders</span>
            {orders.length > 0 && <span className="orders-count-badge">{orders.length}</span>}
          </button>

          {/* Active & Effective Cart Button inside Shop */}
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

      {/* Main View Area */}
      {activeTab === 'orders' ? (
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
        /* Product Grid */
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
