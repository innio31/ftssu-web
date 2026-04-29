import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
    const router = useRouter()
    const [member, setMember] = useState(null)
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('announcements')

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }
        const memberData = JSON.parse(stored)
        setMember(memberData)

        // Load announcements
        fetchAnnouncements()

        setLoading(false)
    }, [router])

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/get_announcements.php')
            const data = await response.json()
            if (data.success && data.announcements) {
                setAnnouncements(data.announcements)
            }
        } catch (error) {
            console.error('Error loading announcements:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('ftssu_member')
        router.push('/')
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} minutes ago`
        if (diffHours < 24) return `${diffHours} hours ago`
        return `${diffDays} days ago`
    }

    const getRoleColor = (role) => {
        const colors = {
            'Admin': '#cc0000',
            'IT Admin': '#2196F3',
            'Acct Admin': '#4CAF50',
            'Senior Commander I': '#FF9800',
            'Senior Commander II': '#FF9800',
            'Commander I': '#9C27B0',
            'Commander II': '#9C27B0',
            'Secretary': '#00BCD4',
        }
        return colors[role] || '#666'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-6 shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">FTSSU Portal</h1>
                        <p className="text-sm text-red-100 mt-2">
                            Welcome, {member?.designation} {member?.first_name} {member?.last_name}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{member?.command}</span>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{member?.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-800 px-4 py-2 rounded-lg text-sm hover:bg-red-900 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content - Announcements First */}
            <div className="p-4">
                {activeTab === 'announcements' && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📢</span> Announcements
                        </h2>
                        {announcements.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                                <p className="text-gray-500">No announcements yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {announcements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className={`bg-white rounded-xl shadow-md overflow-hidden ${announcement.is_pinned == 1 ? 'border-l-4 border-l-red-600' : ''
                                            }`}
                                    >
                                        {announcement.is_pinned == 1 && (
                                            <div className="bg-yellow-50 px-4 py-1 border-b border-yellow-200">
                                                <span className="text-xs text-red-600 font-semibold">📌 PINNED</span>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">{announcement.title}</h3>
                                            <p className="text-gray-600 leading-relaxed mb-3">{announcement.content}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                        style={{ backgroundColor: getRoleColor(announcement.author_role) }}
                                                    >
                                                        {announcement.author?.[0]}
                                                    </div>
                                                    <span className="text-gray-500">{announcement.author} ({announcement.author_role})</span>
                                                </div>
                                                <span className="text-gray-400 text-xs">{formatDate(announcement.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Store Tab - Full functionality */}
                {activeTab === 'store' && (
                    <StoreTab member={member} />
                )}

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">Profile coming soon...</p>
                        <button
                            onClick={() => window.location.href = '/profile'}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Go to Profile →
                        </button>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <OrdersTab member={member} />
                )}

                {activeTab === 'attendance' && (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-gray-500">Attendance coming soon...</p>
                        <button
                            onClick={() => window.location.href = '/attendance'}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Mark Attendance →
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex justify-around items-center">
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'announcements' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">📢</span>
                        <span className="text-xs mt-1 font-medium">News</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('store')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'store' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">🛍️</span>
                        <span className="text-xs mt-1 font-medium">Store</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'orders' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">📋</span>
                        <span className="text-xs mt-1 font-medium">Orders</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'attendance' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">📅</span>
                        <span className="text-xs mt-1 font-medium">Attendance</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'profile' ? 'text-red-600' : 'text-gray-500'
                            }`}
                    >
                        <span className="text-2xl">👤</span>
                        <span className="text-xs mt-1 font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Store Tab Component - Full functionality
function StoreTab({ member }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [quantities, setQuantities] = useState({})
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [orderSaved, setOrderSaved] = useState(false)
    const [orderNumber, setOrderNumber] = useState(null)

    useEffect(() => {
        fetchProducts()
        // Load cart from localStorage
        const savedCart = localStorage.getItem('ftssu_cart')
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/get_products.php')
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
                // Initialize quantities
                const initialQtys = {}
                data.products.forEach(product => {
                    initialQtys[product.id] = product.has_custom_price ? 0 : 0
                })
                setQuantities(initialQtys)
            }
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`

    const updateQuantity = (productId, newQuantity, isCustomPrice = false) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
        }))
    }

    const addToCart = (product) => {
        const quantity = quantities[product.id]
        if (quantity <= 0) {
            alert('Please enter a quantity or amount')
            return
        }

        const existingItem = cart.find(item => item.id === product.id)
        let newCart

        if (existingItem) {
            newCart = cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            )
        } else {
            newCart = [...cart, {
                ...product,
                quantity: product.has_custom_price ? 1 : quantity,
                customAmount: product.has_custom_price ? quantity : null
            }]
        }

        setCart(newCart)
        localStorage.setItem('ftssu_cart', JSON.stringify(newCart))

        // Reset quantity
        setQuantities(prev => ({
            ...prev,
            [product.id]: 0
        }))

        alert(`Added to cart!`)
    }

    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId)
        setCart(newCart)
        localStorage.setItem('ftssu_cart', JSON.stringify(newCart))
    }

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => {
            if (item.has_custom_price) {
                return sum + (item.customAmount || 0)
            }
            return sum + (item.price * item.quantity)
        }, 0)
    }

    const saveOrder = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty')
            return
        }

        if (!member.phone_number) {
            alert('Please update your phone number in profile first')
            return
        }

        const orderData = {
            customer_name: `${member.first_name} ${member.last_name}`,
            customer_phone: member.phone_number,
            customer_command: member.command,
            total_amount: getTotalPrice(),
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.has_custom_price ? 1 : item.quantity,
                customAmount: item.customAmount,
                has_custom_price: item.has_custom_price,
            }))
        }

        try {
            const response = await fetch('/api/save_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            const result = await response.json()

            if (result.success) {
                setOrderNumber(result.order_number)
                setOrderSaved(true)

                // Clear cart
                setCart([])
                localStorage.removeItem('ftssu_cart')

                // Open WhatsApp
                const itemsText = cart.map(item => {
                    if (item.has_custom_price) {
                        return `• ${item.name}: ₦${item.customAmount?.toLocaleString()}`
                    }
                    return `• ${item.name}: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}`
                }).join('%0A')

                const message = `Hello%20Faith%20Tabernacle%20Security%20Accounts%2C%0A%0A✅%20ORDER%20CONFIRMATION%0AOrder%20Number%3A%20${result.order_number}%0A%0A📋%20ORDER%20DETAILS%3A%0A${itemsText}%0A%0A💰%20TOTAL%20AMOUNT%3A%20${formatPrice(getTotalPrice())}%0A%0A👤%20CUSTOMER%20INFORMATION%3A%0AName%3A%20${encodeURIComponent(member.first_name + ' ' + member.last_name)}%0APhone%3A%20${member.phone_number}%0ACommand%3A%20${encodeURIComponent(member.command)}%0A%0A📷%20Payment%20Proof%3A%20(Attach%20screenshot)%0A%0AThank%20you!`

                window.open(`https://wa.me/2348037280183?text=${message}`, '_blank')

                setTimeout(() => {
                    setShowPayment(false)
                    setOrderSaved(false)
                    setOrderNumber(null)
                }, 3000)
            } else {
                alert('Error saving order: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error saving order. Please try again.')
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading products...</div>
    }

    if (showCart) {
        return (
            <div>
                <button
                    onClick={() => setShowCart(false)}
                    className="mb-4 text-red-600 font-semibold"
                >
                    ← Back to Store
                </button>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Your Cart ({cart.length} items)</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="border-b py-3 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        {item.has_custom_price ? (
                                            <p className="text-sm text-red-600">Amount: {formatPrice(item.customAmount)}</p>
                                        ) : (
                                            <p className="text-sm text-gray-600">{item.quantity} × {formatPrice(item.price)}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-red-600">
                                            {item.has_custom_price ? formatPrice(item.customAmount) : formatPrice(item.price * item.quantity)}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 text-xl"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between font-bold text-lg mb-4">
                                    <span>Total:</span>
                                    <span className="text-red-600">{formatPrice(getTotalPrice())}</span>
                                </div>
                                {!showPayment ? (
                                    <button
                                        onClick={() => setShowPayment(true)}
                                        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
                                    >
                                        Proceed to Payment →
                                    </button>
                                ) : (
                                    <div>
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <h3 className="font-bold mb-2">🏦 Payment Details</h3>
                                            <p><strong>Account Number:</strong> 0520007050</p>
                                            <p><strong>Bank:</strong> Covenant Microfinance Bank</p>
                                            <p><strong>Account Name:</strong> Faith Tabernacle Security Service Group</p>
                                        </div>
                                        <button
                                            onClick={saveOrder}
                                            disabled={orderSaved}
                                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
                                        >
                                            {orderSaved ? `Order #${orderNumber} Saved!` : 'Confirm Payment & Send on WhatsApp'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>🛍️</span> Store
                </h2>
                {cart.length > 0 && (
                    <button
                        onClick={() => setShowCart(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                        🛒 Cart ({cart.length})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-md p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                {!product.has_custom_price ? (
                                    <p className="text-red-600 font-bold text-xl mt-1">{formatPrice(product.price)}</p>
                                ) : (
                                    <p className="text-red-600 text-sm mt-1 italic">💝 Give what's in your heart</p>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <p className="text-gray-500 text-sm mb-3">{product.description}</p>
                        )}

                        <div className="flex gap-3">
                            {!product.has_custom_price ? (
                                <input
                                    type="number"
                                    value={quantities[product.id] || 0}
                                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                    placeholder="Qty"
                                />
                            ) : (
                                <input
                                    type="number"
                                    value={quantities[product.id] || 0}
                                    onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0, true)}
                                    min="0"
                                    step="100"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter amount (₦)"
                                />
                            )}
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No products available</p>
                </div>
            )}
        </div>
    )
}

// Add this new component after the StoreTab component
// Orders Tab Component - Full functionality
function OrdersTab({ member }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch(`/api/get_orders.php?phone=${member?.phone_number}`)
            const data = await response.json()
            if (data.success) {
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'Pending Payment', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⏳' }
            case 'payment_confirmed':
                return { text: 'Payment Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: '✅' }
            case 'goods_delivered':
                return { text: 'Delivered ✓', color: 'text-green-600', bg: 'bg-green-100', icon: '🚚' }
            case 'cancelled':
                return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' }
            default:
                return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: '📦' }
        }
    }

    const getOrderDetails = async (orderNumber) => {
        try {
            const response = await fetch(`/api/get_order_details.php?order_number=${orderNumber}`)
            const data = await response.json()
            if (data.success) {
                setSelectedOrder(data)
            }
        } catch (error) {
            console.error('Error fetching order details:', error)
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading orders...</div>
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
                <button
                    onClick={() => document.querySelector('[data-tab="store"]')?.click()}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-red-700"
                >
                    Browse Store
                </button>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span> My Orders ({orders.length})
            </h2>

            <div className="space-y-4">
                {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    return (
                        <div key={order.order_number} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{order.order_number}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className={`${statusConfig.bg} px-3 py-1 rounded-full flex items-center gap-1`}>
                                        <span>{statusConfig.icon}</span>
                                        <span className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Total Amount</p>
                                        <p className="font-bold text-red-600 text-lg">{formatPrice(order.total_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Items</p>
                                        <p className="font-semibold text-gray-700">{order.items_count || 'View details'}</p>
                                    </div>
                                </div>

                                {order.status === 'goods_delivered' && (
                                    <div className="bg-green-50 p-3 rounded-lg mb-3">
                                        <p className="text-green-700 text-sm flex items-center gap-2">
                                            <span>🚚</span> Delivered by: {order.delivered_by || 'N/A'} on {formatDate(order.delivered_at)}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => getOrderDetails(order.order_number)}
                                    className="w-full text-red-600 font-semibold py-2 border-t hover:bg-red-50 transition mt-2"
                                >
                                    View Order Details ↓
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-500 text-2xl">&times;</button>
                        </div>

                        <div className="p-5">
                            <div className="mb-4">
                                <p className="text-gray-500 text-sm">Order Number</p>
                                <p className="font-bold text-gray-800">{selectedOrder.order?.order_number}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-500 text-sm">Status</p>
                                <div className={`inline-flex px-3 py-1 rounded-full mt-1 ${getStatusConfig(selectedOrder.order?.status).bg}`}>
                                    <span className={`text-sm font-semibold ${getStatusConfig(selectedOrder.order?.status).color}`}>
                                        {getStatusConfig(selectedOrder.order?.status).text}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-500 text-sm">Order Date</p>
                                <p className="text-gray-800">{formatDate(selectedOrder.order?.created_at)}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-500 text-sm">Customer Information</p>
                                <div className="bg-gray-50 p-3 rounded-lg mt-1">
                                    <p><strong>Name:</strong> {selectedOrder.order?.customer_name}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.order?.customer_phone}</p>
                                    <p><strong>Command:</strong> {selectedOrder.order?.customer_command}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-500 text-sm mb-2">Order Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-red-600">{formatPrice(item.total_price)}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Unit Price: {formatPrice(item.unit_price)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-lg">GRAND TOTAL</p>
                                    <p className="font-bold text-2xl text-red-600">{formatPrice(selectedOrder.order?.total_amount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}