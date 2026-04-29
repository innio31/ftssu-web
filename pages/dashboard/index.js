import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ImageUploadModal from '../../components/ImageUploadModal'

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
                    <ProfileTab member={member} onUpdate={(updatedMember) => {
                        setMember(updatedMember)
                        localStorage.setItem('ftssu_member', JSON.stringify(updatedMember))
                    }} />
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

                const message = `Hello%20Faith%20Tabernacle%20Security%20Accounts%2C%0A%0A✅%20ORDER%20CONFIRMATION%0AOrder%20Number%3A%20${result.order_number}%0A%0A📋%20ORDER%20DETAILS%3A%0A${itemsText}%0A%0A💰%20TOTAL%20AMOUNT%3A%20${formatPrice(getTotalPrice())}%0A%0A👤%20CUSTOMER%20INFORMATION%3A%0AName%3A%20${encodeURIComponent(member.first_name + ' ' + member.last_name)}%0APhone%3A%20${member.phone_number}%0ACommand%3A%20${encodeURIComponent(member.command)}%0A%0A📷%20Payment%20Proof%3A%20(Attach%20screenshot)%0A%0A⚠️%20IMPORTANT%3A%20Payment%20will%20NOT%20be%20confirmed%20if%20payment%20proof%20is%20not%20attached.%0A%0AThank%20you!`

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

function ProfileTab({ member, onUpdate }) {
    const [profile, setProfile] = useState(member)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showImageModal, setShowImageModal] = useState(false)
    const [editedData, setEditedData] = useState({
        phone_number: member?.phone_number || '',
        email: member?.email || '',
        date_of_birth: member?.date_of_birth || ''
    })

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not set'
        return new Date(dateStr).toLocaleDateString('en-NG', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return ''
        return dateStr.split('T')[0]
    }

    // Updated image upload handler
    const handleImageUpload = async (imageFile) => {
        setUploading(true)
        const formData = new FormData()
        formData.append('member_id', member.id)
        formData.append('profile_picture', imageFile)

        try {
            const response = await fetch('/api/update_member.php', {
                method: 'POST',
                body: formData,
            })
            const data = await response.json()

            if (data.success) {
                const updatedMember = { ...profile, profile_picture: data.member?.profile_picture }
                setProfile(updatedMember)
                localStorage.setItem('ftssu_member', JSON.stringify(updatedMember))
                if (onUpdate) onUpdate(updatedMember)
                alert('Profile picture updated successfully!')
            } else {
                alert(data.error || 'Failed to upload image')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Network error. Please try again.')
        }
        setUploading(false)
    }

    const handleUpdateProfile = async () => {
        if (editedData.phone_number && editedData.phone_number.length !== 11) {
            alert('Phone number must be exactly 11 digits')
            return
        }

        // Prepare data for update - only send fields that have changed
        const updateData = {
            id: member.id
        }

        if (editedData.phone_number !== profile?.phone_number && editedData.phone_number) {
            updateData.phone_number = editedData.phone_number
        }

        if (editedData.email !== profile?.email) {
            updateData.email = editedData.email
        }

        if (editedData.date_of_birth !== profile?.date_of_birth && editedData.date_of_birth) {
            updateData.date_of_birth = editedData.date_of_birth
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 1) {
            alert('No changes to update')
            setEditing(false)
            return
        }

        setLoading(true)

        try {
            console.log('Sending update data:', updateData)

            const response = await fetch('/api/update_member.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            const data = await response.json()
            console.log('Update response:', data)

            if (data.success) {
                // Update local profile with new data
                const updatedMember = {
                    ...profile,
                    ...updateData
                }
                setProfile(updatedMember)
                localStorage.setItem('ftssu_member', JSON.stringify(updatedMember))
                if (onUpdate) onUpdate(updatedMember)
                alert('Profile updated successfully!')
                setEditing(false)
            } else {
                alert(data.error || data.message || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Update error:', error)
            alert('Network error. Please try again.')
        }
        setLoading(false)
    }

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 4) {
            alert('Password must be at least 4 characters')
            return
        }
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            console.log('Sending password update for member:', member.id)

            const response = await fetch('/api/update_member.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: member.id,
                    password: newPassword
                }),
            })

            const data = await response.json()
            console.log('Password update response:', data)

            if (data.success) {
                alert('Password changed successfully!')
                setShowPasswordForm(false)
                setNewPassword('')
                setConfirmPassword('')
            } else {
                alert(data.error || data.message || 'Failed to change password')
            }
        } catch (error) {
            console.error('Password change error:', error)
            alert('Network error. Please try again.')
        }
        setLoading(false)
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>👤</span> My Profile
            </h2>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Profile Header with Image - Updated to use modal */}
                <div className="bg-gradient-to-r from-red-700 to-red-600 p-6 text-center">
                    <div className="relative inline-block cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white mx-auto">
                            {profile?.profile_picture ? (
                                <img
                                    src={profile.profile_picture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = ''
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-4xl text-gray-500">
                                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                            <span className="text-xl">📷</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-3">
                        {profile?.designation} {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-red-100 text-sm mt-1">{profile?.role}</p>
                    <p className="text-red-100 text-xs mt-1">ID: {profile?.id_number}</p>
                    <p className="text-red-100 text-xs mt-1 italic">Click on image to change</p>
                </div>

                {/* Profile Information */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Personal Information</h3>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-red-600 text-sm font-semibold hover:underline"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Designation (Read-only) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Designation</p>
                            <p className="text-gray-800 font-medium">{profile?.designation}</p>
                        </div>

                        {/* Command (Read-only) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Command</p>
                            <p className="text-gray-800 font-medium">{profile?.command}</p>
                        </div>

                        {/* Gender (Read-only) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Gender</p>
                            <p className="text-gray-800 font-medium">{profile?.gender}</p>
                        </div>

                        {/* Date of Birth (Editable) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>
                            {editing ? (
                                <input
                                    type="date"
                                    value={formatDateForInput(editedData.date_of_birth)}
                                    onChange={(e) => setEditedData({ ...editedData, date_of_birth: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium">{formatDate(profile?.date_of_birth)}</p>
                            )}
                        </div>

                        {/* Date Joined (Read-only) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Date Joined Unit</p>
                            <p className="text-gray-800 font-medium">{formatDate(profile?.date_joined)}</p>
                        </div>

                        {/* Phone Number (Editable) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                            {editing ? (
                                <div>
                                    <input
                                        type="tel"
                                        value={editedData.phone_number}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                                            setEditedData({ ...editedData, phone_number: value })
                                        }}
                                        placeholder="08012345678"
                                        maxLength={11}
                                        className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${editedData.phone_number && editedData.phone_number.length !== 11 && editedData.phone_number.length > 0
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                            }`}
                                    />
                                    {editedData.phone_number && editedData.phone_number.length !== 11 && editedData.phone_number.length > 0 && (
                                        <p className="text-xs text-red-500 mt-1">Phone number must be exactly 11 digits</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-800 font-medium">{profile?.phone_number || 'Not set'}</p>
                            )}
                        </div>

                        {/* Email (Editable) */}
                        <div className="border-b pb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                            {editing ? (
                                <input
                                    type="email"
                                    value={editedData.email}
                                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                                    placeholder="youremail@example.com"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium">{profile?.email || 'Not set'}</p>
                            )}
                        </div>
                    </div>

                    {/* Edit Mode Buttons */}
                    {editing && (
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setEditing(false)
                                    setEditedData({
                                        phone_number: profile?.phone_number || '',
                                        email: profile?.email || '',
                                        date_of_birth: profile?.date_of_birth || ''
                                    })
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateProfile}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {/* Change Password Section */}
                    {!showPasswordForm ? (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                        >
                            🔑 Change Password
                        </button>
                    ) : (
                        <div className="mt-6 border-t pt-4">
                            <h4 className="font-bold text-gray-800 mb-3">Change Password</h4>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    placeholder="New Password (min 4 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPasswordForm(false)
                                            setNewPassword('')
                                            setConfirmPassword('')
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loading}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Upload Modal - Make sure this component exists */}
            <ImageUploadModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onImageUpload={handleImageUpload}
                currentImage={profile?.profile_picture}
            />
        </div>
    )
}