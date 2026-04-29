import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ImageUploadModal from '../../components/ImageUploadModal'
import AttendanceModal from '../../components/AttendanceModal'
import AttendanceReportModal from '../../components/AttendanceReportModal'
import MemberDetailsModal from '../../components/MemberDetailsModal'
import CreateServiceModal from '../../components/CreateServiceModal'

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
            <div className="min-h-screen bg-gray-50 pb-24">  {/* Changed from pb-20 to pb-24 for more space */}
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
                    <button onClick={handleLogout} className="bg-red-800 px-4 py-2 rounded-lg text-sm hover:bg-red-900 transition">
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {activeTab === 'announcements' && <AnnouncementsTab announcements={announcements} formatDate={formatDate} getRoleColor={getRoleColor} />}
                {activeTab === 'store' && <StoreTab member={member} onNavigate={(path) => router.push(path)} />}
                {activeTab === 'orders' && <OrdersTab member={member} />}
                {activeTab === 'profile' && <ProfileTab member={member} onUpdate={(updatedMember) => {
                    setMember(updatedMember)
                    localStorage.setItem('ftssu_member', JSON.stringify(updatedMember))
                }} />}
                {activeTab === 'attendance' && <AttendanceTab member={member} />}
                {activeTab === 'itadmin' && <ITAdminTab member={member} />}
                {activeTab === 'acctadmin' && <AcctAdminTab member={member} />}
            </div>

            {/* Bottom Navigation - Flex Layout (better for variable button counts) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex flex-wrap justify-around gap-1 p-2">
                    <button onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'announcements' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                        <span className="text-xl">📢</span>
                        <span className="text-xs mt-1 font-medium">News</span>
                    </button>
                    <button onClick={() => setActiveTab('store')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'store' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                        <span className="text-xl">🛍️</span>
                        <span className="text-xs mt-1 font-medium">Store</span>
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'orders' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                        <span className="text-xl">📋</span>
                        <span className="text-xs mt-1 font-medium">Orders</span>
                    </button>
                    {(member?.role === 'IT Admin' || member?.role === 'Golf Serial' || member?.role === 'Secretary') && (
                        <button onClick={() => setActiveTab('attendance')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'attendance' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                            <span className="text-xl">📅</span>
                            <span className="text-xs mt-1 font-medium">Attendance</span>
                        </button>
                    )}
                    <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'profile' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                        <span className="text-xl">👤</span>
                        <span className="text-xs mt-1 font-medium">Profile</span>
                    </button>
                    {(member?.role === 'IT Admin' || member?.role === 'Golf Serial' || member?.role === 'Admin') && (
                        <button onClick={() => setActiveTab('itadmin')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'itadmin' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                            <span className="text-xl">⚙️</span>
                            <span className="text-xs mt-1 font-medium">Admin</span>
                        </button>
                    )}
                    {/* Acct Admin Tab - For Accountant and Acct Admin roles */}
                    {(member?.role === 'Acct Admin' || member?.role === 'Accountant' || member?.role === 'ITAdmin') && (
                        <button onClick={() => setActiveTab('acctadmin')} className={`flex flex-col items-center py-3 px-4 transition ${activeTab === 'acctadmin' ? 'text-red-600' : 'text-gray-500'}`}>
                            <span className="text-2xl">💰</span>
                            <span className="text-xs mt-1 font-medium">Accounts</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============= ANNOUNCEMENTS TAB =============
function AnnouncementsTab({ announcements, formatDate, getRoleColor }) {
    if (announcements.length === 0) {
        return <div className="bg-white rounded-xl shadow-md p-8 text-center"><p className="text-gray-500">No announcements yet</p></div>
    }
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📢</span> Announcements</h2>
            {announcements.map((announcement) => (
                <div key={announcement.id} className={`bg-white rounded-xl shadow-md overflow-hidden ${announcement.is_pinned == 1 ? 'border-l-4 border-l-red-600' : ''}`}>
                    {announcement.is_pinned == 1 && <div className="bg-yellow-50 px-4 py-1 border-b border-yellow-200"><span className="text-xs text-red-600 font-semibold">📌 PINNED</span></div>}
                    <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{announcement.title}</h3>
                        <p className="text-gray-600 leading-relaxed mb-3">{announcement.content}</p>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: getRoleColor(announcement.author_role) }}>
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
    )
}

// ============= STORE TAB =============
function StoreTab({ member, onNavigate }) {
    const [products, setProducts] = useState([])
    const [quantities, setQuantities] = useState({})
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
        const savedCart = localStorage.getItem('ftssu_cart')
        if (savedCart) setCart(JSON.parse(savedCart))
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/get_products.php')
            const data = await response.json()
            if (data.success) {
                setProducts(data.products)
                const initialQtys = {}
                data.products.forEach(product => { initialQtys[product.id] = 0 })
                setQuantities(initialQtys)
            }
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`

    const updateQuantity = (productId, value) => {
        setQuantities(prev => ({ ...prev, [productId]: value }))
    }

    const addToCart = (product) => {
        const quantity = quantities[product.id]
        if (quantity <= 0) {
            alert('Please enter a quantity or amount')
            return
        }

        let newCart
        const existingItem = cart.find(item => item.id === product.id)

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
        setQuantities(prev => ({ ...prev, [product.id]: 0 }))
        alert('Added to cart!')
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
            alert('Cart is empty')
            return
        }

        const storedMember = localStorage.getItem('ftssu_member')
        if (!storedMember) {
            alert('Please login to continue')
            if (onNavigate) onNavigate('/')
            return
        }

        const memberData = JSON.parse(storedMember)

        if (!memberData.phone_number) {
            alert('Please update your phone number in profile first')
            if (onNavigate) onNavigate('/profile')
            return
        }

        const orderData = {
            customer_name: `${memberData.first_name} ${memberData.last_name}`,
            customer_phone: memberData.phone_number,
            customer_command: memberData.command,
            total_amount: getTotalPrice(),
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.has_custom_price ? 1 : item.quantity,
                customAmount: item.customAmount,
                has_custom_price: item.has_custom_price
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
                const itemsText = cart.map(item =>
                    item.has_custom_price
                        ? `• ${item.name}: ₦${item.customAmount?.toLocaleString()}`
                        : `• ${item.name}: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}`
                ).join('%0A')

                const message = `Hello%20Faith%20Tabernacle%20Security%20Accounts%2C%0A%0A✅%20ORDER%20CONFIRMATION%0AOrder%20Number%3A%20${result.order_number}%0A%0A📋%20ORDER%20DETAILS%3A%0A${itemsText}%0A%0A💰%20TOTAL%20AMOUNT%3A%20${formatPrice(getTotalPrice())}%0A%0A👤%20CUSTOMER%20INFORMATION%3A%0AName%3A%20${encodeURIComponent(memberData.first_name + ' ' + memberData.last_name)}%0APhone%3A%20${memberData.phone_number}%0ACommand%3A%20${encodeURIComponent(memberData.command)}%0A%0A📷%20Payment%20Proof%3A%20(Attach%20screenshot)%0A%0AThank%20you!`

                window.open(`https://wa.me/2348037280183?text=${message}`, '_blank')
                setCart([])
                localStorage.removeItem('ftssu_cart')
                setShowCart(false)
                setShowPayment(false)
                alert(`Order #${result.order_number} recorded!`)
            } else {
                alert(result.error || 'Failed to save order')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Network error')
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading products...</div>
    }

    if (showCart) {
        return (
            <div>
                <button onClick={() => setShowCart(false)} className="mb-4 text-red-600 font-semibold">
                    ← Back to Store
                </button>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Your Cart ({cart.length} items)</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="border-b py-3 flex justify-between items-center flex-wrap gap-2">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {item.has_custom_price
                                                ? `Amount: ${formatPrice(item.customAmount)}`
                                                : `${item.quantity} × ${formatPrice(item.price)}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-red-600">
                                            {item.has_custom_price
                                                ? formatPrice(item.customAmount)
                                                : formatPrice(item.price * item.quantity)}
                                        </p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xl">
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
                                    <button onClick={() => setShowPayment(true)} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold">
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
                                        <button onClick={saveOrder} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">
                                            Confirm Payment & Send on WhatsApp
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
                <h2 className="text-xl font-bold text-gray-800">🛍️ Store</h2>
                {cart.length > 0 && (
                    <button onClick={() => setShowCart(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                        🛒 Cart ({cart.length})
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-md p-5">
                        <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                        {!product.has_custom_price ? (
                            <p className="text-red-600 font-bold text-xl mt-1">{formatPrice(product.price)}</p>
                        ) : (
                            <p className="text-red-600 text-sm mt-1 italic">💝 Give what's in your heart</p>
                        )}
                        {product.description && (
                            <p className="text-gray-500 text-sm mb-3">{product.description}</p>
                        )}
                        <div className="flex gap-3">
                            <input
                                type="number"
                                value={quantities[product.id] || 0}
                                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                                min="0"
                                step={product.has_custom_price ? "100" : "1"}
                                placeholder={product.has_custom_price ? "Amount" : "Qty"}
                                className="w-24 px-3 py-2 border rounded-lg text-center"
                            />
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

// ============= ORDERS TAB =============
function OrdersTab({ member }) {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => { fetchOrders() }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch(`/api/get_orders.php?phone=${member?.phone_number}`)
            const data = await response.json()
            if (data.success) setOrders(data.orders || [])
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { text: 'Pending Payment', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⏳' }
            case 'payment_confirmed': return { text: 'Payment Confirmed', color: 'text-blue-600', bg: 'bg-blue-100', icon: '✅' }
            case 'goods_delivered': return { text: 'Delivered ✓', color: 'text-green-600', bg: 'bg-green-100', icon: '🚚' }
            default: return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: '📦' }
        }
    }

    const getOrderDetails = async (orderNumber) => {
        const response = await fetch(`/api/get_order_details.php?order_number=${orderNumber}`)
        const data = await response.json()
        if (data.success) setSelectedOrder(data)
    }

    if (loading) return <div className="text-center py-8">Loading orders...</div>
    if (orders.length === 0) return <div className="bg-white rounded-xl shadow-md p-12 text-center"><div className="text-6xl mb-4">📋</div><h2 className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</h2><p className="text-gray-500 mb-6">You haven't placed any orders yet</p></div>

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 My Orders ({orders.length})</h2>
            <div className="space-y-4">
                {orders.map(order => {
                    const statusConfig = getStatusConfig(order.status)
                    return (
                        <div key={order.order_number} className="bg-white rounded-xl shadow-md p-5">
                            <div className="flex justify-between items-start mb-3"><div><h3 className="font-bold text-lg">{order.order_number}</h3><p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p></div><div className={`${statusConfig.bg} px-3 py-1 rounded-full flex items-center gap-1`}><span>{statusConfig.icon}</span><span className={`text-sm font-semibold ${statusConfig.color}`}>{statusConfig.text}</span></div></div>
                            <div className="mb-4"><p className="text-gray-500 text-xs">Total Amount</p><p className="font-bold text-red-600 text-lg">{formatPrice(order.total_amount)}</p></div>
                            <button onClick={() => getOrderDetails(order.order_number)} className="w-full text-red-600 font-semibold py-2 border-t hover:bg-red-50 transition mt-2">View Order Details ↓</button>
                        </div>
                    )
                })}
            </div>
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h2 className="text-xl font-bold">Order Details</h2><button onClick={() => setSelectedOrder(null)} className="text-gray-500 text-2xl">&times;</button></div>
                        <div className="p-5">
                            <div className="mb-4"><p className="text-gray-500 text-sm">Order Number</p><p className="font-bold">{selectedOrder.order?.order_number}</p></div>
                            <div className="mb-4"><p className="text-gray-500 text-sm">Status</p><div className={`inline-flex px-3 py-1 rounded-full mt-1 ${getStatusConfig(selectedOrder.order?.status).bg}`}><span className={`text-sm font-semibold ${getStatusConfig(selectedOrder.order?.status).color}`}>{getStatusConfig(selectedOrder.order?.status).text}</span></div></div>
                            <div className="mb-4"><p className="text-gray-500 text-sm">Order Date</p><p className="text-gray-800">{formatDate(selectedOrder.order?.created_at)}</p></div>
                            <div className="mb-4"><p className="text-gray-500 text-sm mb-2">Order Items</p>{selectedOrder.items?.map((item, idx) => (<div key={idx} className="bg-gray-50 p-3 rounded-lg mb-2"><div className="flex justify-between"><p className="font-semibold">{item.product_name}</p><p className="font-bold text-red-600">{formatPrice(item.total_price)}</p></div><p className="text-xs text-gray-500">Quantity: {item.quantity} × {formatPrice(item.unit_price)}</p></div>))}</div>
                            <div className="border-t pt-4 mt-4"><div className="flex justify-between"><p className="font-bold text-lg">GRAND TOTAL</p><p className="font-bold text-2xl text-red-600">{formatPrice(selectedOrder.order?.total_amount)}</p></div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============= PROFILE TAB =============
function ProfileTab({ member, onUpdate }) {
    const [profile, setProfile] = useState(member)
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showImageModal, setShowImageModal] = useState(false)
    const [editedData, setEditedData] = useState({ phone_number: member?.phone_number || '', email: member?.email || '', date_of_birth: member?.date_of_birth || '' })

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not set'

    const handleImageUpload = async (imageFile) => {
        const formData = new FormData()
        formData.append('member_id', member.id)
        formData.append('profile_picture', imageFile)
        try {
            const response = await fetch('/api/update_member.php', { method: 'POST', body: formData })
            const data = await response.json()
            if (data.success) {
                const updatedMember = { ...profile, profile_picture: data.member?.profile_picture }
                setProfile(updatedMember)
                localStorage.setItem('ftssu_member', JSON.stringify(updatedMember))
                if (onUpdate) onUpdate(updatedMember)
                alert('Profile picture updated!')
            } else { alert(data.error || 'Failed to upload') }
        } catch (error) { alert('Network error') }
    }

    const handleUpdateProfile = async () => {
        // Validate phone number only if it has content
        if (editedData.phone_number && editedData.phone_number.length !== 11 && editedData.phone_number.length > 0) {
            alert('Phone number must be exactly 11 digits')
            return
        }

        // Prepare update data - send all fields that could be updated
        const updateData = {
            id: member.id
        }

        // Only include fields that have changed
        if (editedData.phone_number !== profile?.phone_number && editedData.phone_number) {
            updateData.phone_number = editedData.phone_number
        }

        if (editedData.email !== profile?.email) {
            updateData.email = editedData.email
        }

        if (editedData.date_of_birth !== profile?.date_of_birth && editedData.date_of_birth) {
            updateData.date_of_birth = editedData.date_of_birth
        }

        if (Object.keys(updateData).length === 1) {
            alert('No changes to update')
            setEditing(false)
            return
        }

        console.log('Sending update data:', updateData)
        setLoading(true)

        try {
            const response = await fetch('/api/update_member.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            })

            const textResponse = await response.text()
            console.log('Raw response:', textResponse)

            let data
            try {
                data = JSON.parse(textResponse)
            } catch (e) {
                console.error('JSON parse error:', e)
                alert('Server returned invalid response. Check console for details.')
                setLoading(false)
                return
            }

            console.log('Parsed response:', data)

            if (data.success) {
                const updatedMember = { ...profile, ...updateData }
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
            alert('Network error: ' + error.message)
        }
        setLoading(false)
    }

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 4) { alert('Password must be at least 4 characters'); return }
        if (newPassword !== confirmPassword) { alert('Passwords do not match'); return }
        setLoading(true)
        try {
            const response = await fetch('/api/update_member.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: member.id, password: newPassword }) })
            const data = await response.json()
            if (data.success) { alert('Password changed!'); setShowPasswordForm(false); setNewPassword(''); setConfirmPassword('') }
            else { alert(data.error || 'Failed to change password') }
        } catch (error) { alert('Network error') }
        setLoading(false)
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 My Profile</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-red-700 to-red-600 p-6 text-center">
                    <div className="relative inline-block cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white mx-auto">
                            {profile?.profile_picture ? <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300 flex items-center justify-center"><span className="text-4xl text-gray-500">{profile?.first_name?.[0]}{profile?.last_name?.[0]}</span></div>}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg"><span className="text-xl">📷</span></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-3">{profile?.designation} {profile?.first_name} {profile?.last_name}</h3>
                    <p className="text-red-100 text-sm mt-1">{profile?.role}</p>
                    <p className="text-red-100 text-xs mt-1">ID: {profile?.id_number}</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-800">Personal Information</h3>{!editing && <button onClick={() => setEditing(true)} className="text-red-600 text-sm font-semibold">Edit Profile</button>}</div>
                    <div className="space-y-4">
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Designation</p><p className="text-gray-800 font-medium">{profile?.designation}</p></div>
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Command</p><p className="text-gray-800 font-medium">{profile?.command}</p></div>
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Gender</p><p className="text-gray-800 font-medium">{profile?.gender}</p></div>
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Date of Birth</p>{editing ? <input type="date" value={editedData.date_of_birth?.split('T')[0] || ''} onChange={(e) => setEditedData({ ...editedData, date_of_birth: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" /> : <p className="text-gray-800 font-medium">{formatDate(profile?.date_of_birth)}</p>}</div>
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Date Joined</p><p className="text-gray-800 font-medium">{formatDate(profile?.date_joined)}</p></div>
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>{editing ? <input type="tel" value={editedData.phone_number} onChange={(e) => setEditedData({ ...editedData, phone_number: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="08012345678" className="w-full mt-1 px-3 py-2 border rounded-lg" /> : <p className="text-gray-800 font-medium">{profile?.phone_number || 'Not set'}</p>}</div>
                        <div className="border-b pb-3"><p className="text-xs text-gray-500 uppercase font-semibold">Email</p>{editing ? <input type="email" value={editedData.email} onChange={(e) => setEditedData({ ...editedData, email: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg" /> : <p className="text-gray-800 font-medium">{profile?.email || 'Not set'}</p>}</div>
                    </div>
                    {editing && (<div className="flex gap-3 mt-6"><button onClick={() => { setEditing(false); setEditedData({ phone_number: profile?.phone_number || '', email: profile?.email || '', date_of_birth: profile?.date_of_birth || '' }) }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button><button onClick={handleUpdateProfile} disabled={loading} className="flex-1 bg-red-600 text-white py-2 rounded-lg disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button></div>)}
                    {!showPasswordForm ? <button onClick={() => setShowPasswordForm(true)} className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold">🔑 Change Password</button> : (<div className="mt-6 border-t pt-4"><h4 className="font-bold mb-3">Change Password</h4><div className="space-y-3"><input type="password" placeholder="New Password (min 4 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /><input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /><div className="flex gap-3"><button onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword('') }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button><button onClick={handleChangePassword} disabled={loading} className="flex-1 bg-red-600 text-white py-2 rounded-lg disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button></div></div></div>)}
                </div>
            </div>
            <ImageUploadModal isOpen={showImageModal} onClose={() => setShowImageModal(false)} onImageUpload={handleImageUpload} currentImage={profile?.profile_picture} />
        </div>
    )
}

// ============= ATTENDANCE TAB =============
function AttendanceTab({ member }) {
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [showAttendanceModal, setShowAttendanceModal] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [loading, setLoading] = useState(true)

    const canTakeAttendance = ['Secretary', 'Senior Commander I', 'Senior Commander II', 'Admin'].includes(member?.role)
    const canViewReports = ['Golf Charlie', 'Alpha Golf Charlie', 'Golf Serial', 'Alpha Golf Serial', 'Admin', 'IT Admin'].includes(member?.role)

    useEffect(() => { loadActiveServices() }, [])

    const loadActiveServices = async () => {
        try {
            const response = await fetch('/api/get_active_services.php')
            const data = await response.json()
            if (data.success) setServices(data.services || [])
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })

    if (loading) return <div className="text-center py-8">Loading...</div>

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Attendance</h2>
            {canTakeAttendance && (
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white mb-6">
                    <h3 className="text-lg font-bold mb-2">📝 Take Attendance</h3>
                    <p className="text-red-100 text-sm mb-4">Record attendance for members in {member.command} command</p>
                    <select value={selectedService?.id || ''} onChange={(e) => { const service = services.find(s => s.id === parseInt(e.target.value)); setSelectedService(service) }} className="w-full mb-3 px-3 py-2 rounded-lg text-gray-800"><option value="">Select Service</option>{services.map(service => (<option key={service.id} value={service.id}>{service.service_name} - {formatDate(service.service_date)}</option>))}</select>
                    <button onClick={() => setShowAttendanceModal(true)} disabled={!selectedService} className="w-full bg-white text-red-600 py-2 rounded-lg font-semibold disabled:opacity-50">Take Attendance</button>
                </div>
            )}
            {services.length > 0 && (<div className="bg-white rounded-xl shadow-md p-6 mb-6"><h3 className="font-bold text-gray-800 mb-3">Active Services</h3>{services.map(service => (<div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2"><div><p className="font-semibold">{service.service_name}</p><p className="text-xs text-gray-500">{formatDate(service.service_date)} at {service.start_time}</p></div><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span></div>))}</div>)}
            {canViewReports && (<div className="bg-white rounded-xl shadow-md p-6"><h3 className="font-bold text-gray-800 mb-2">📊 Attendance Reports</h3><p className="text-sm text-gray-500 mb-4">View and export attendance records</p><button onClick={() => setShowReportModal(true)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">View Reports</button></div>)}
            <AttendanceModal isOpen={showAttendanceModal} onClose={() => { setShowAttendanceModal(false); setSelectedService(null) }} member={member} service={selectedService} onSuccess={loadActiveServices} />
            <AttendanceReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} member={member} />
        </div>
    )
}

// ============= IT ADMIN TAB with Subtabs =============
function ITAdminTab({ member }) {
    const [adminSubTab, setAdminSubTab] = useState('services')
    const [members, setMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])
    const [services, setServices] = useState([])
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCommand, setSelectedCommand] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMember, setSelectedMember] = useState(null)
    const [showCreateService, setShowCreateService] = useState(false)
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState(null)
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        target_command: '',
        is_pinned: 0
    })
    const [submitting, setSubmitting] = useState(false)

    const commands = ['All', 'UPPER ROOM', 'GOSHEN', 'YOUTH', 'OPERATION', 'HONOUR', 'G & G']

    // Load data
    const loadMembers = async () => {
        try {
            const response = await fetch('/api/get_members.php')
            const data = await response.json()
            if (data.success) setMembers(data.members || [])
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const loadServices = async () => {
        try {
            const response = await fetch('/api/get_services.php')
            const data = await response.json()
            if (data.success) setServices(data.services || [])
        } catch (error) { console.error(error) }
    }

    const loadAnnouncements = async () => {
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

    // Service functions
    const closeService = async (serviceId) => {
        if (confirm('Close this service? Attendance can no longer be taken.')) {
            try {
                const response = await fetch('/api/update_service.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: serviceId, is_active: 0 })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Service closed successfully')
                    loadServices()
                } else {
                    alert(data.error || 'Failed to close service')
                }
            } catch (error) {
                console.error('Error closing service:', error)
                alert('Network error: ' + error.message)
            }
        }
    }

    const reopenService = async (serviceId) => {
        if (confirm('Reopen this service? Attendance can be taken again.')) {
            try {
                const response = await fetch('/api/update_service.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: serviceId, is_active: 1 })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Service reopened successfully')
                    loadServices()
                } else {
                    alert(data.error || 'Failed to reopen service')
                }
            } catch (error) {
                console.error('Error reopening service:', error)
                alert('Network error: ' + error.message)
            }
        }
    }

    // Member functions
    const filterMembers = () => {
        let filtered = [...members]
        if (selectedCommand !== 'All') filtered = filtered.filter(m => m.command === selectedCommand)
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(m =>
                m.first_name?.toLowerCase().includes(term) ||
                m.last_name?.toLowerCase().includes(term) ||
                m.id_number?.toLowerCase().includes(term)
            )
        }
        setFilteredMembers(filtered)
    }

    // Announcement functions
    const handleDeleteAnnouncement = async (id) => {
        if (confirm('Delete this announcement? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/delete_announcement.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Announcement deleted successfully!')
                    loadAnnouncements()
                } else {
                    alert(data.error || 'Failed to delete announcement')
                }
            } catch (error) {
                console.error('Error deleting announcement:', error)
                alert('Network error: ' + error.message)
            }
        }
    }

    const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement(announcement)
        setAnnouncementForm({
            title: announcement.title || '',
            content: announcement.content || '',
            target_command: announcement.target_command || '',
            is_pinned: announcement.is_pinned || 0
        })
        setShowAnnouncementModal(true)
    }

    const handlePinAnnouncement = async (id, currentPinned) => {
        try {
            const response = await fetch('/api/pin_announcement.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, is_pinned: currentPinned ? 0 : 1 })
            })
            const data = await response.json()
            if (data.success) {
                alert(currentPinned ? 'Announcement unpinned!' : 'Announcement pinned!')
                loadAnnouncements()
            } else {
                alert(data.error || 'Failed to update pin status')
            }
        } catch (error) {
            console.error('Error pinning announcement:', error)
            alert('Network error: ' + error.message)
        }
    }

    const handleSaveAnnouncement = async () => {
        if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
            alert('Please enter both title and content')
            return
        }

        setSubmitting(true)
        try {
            let url, body

            if (editingAnnouncement) {
                url = '/api/update_announcement.php'
                body = {
                    id: editingAnnouncement.id,
                    title: announcementForm.title,
                    content: announcementForm.content,
                    target_command: announcementForm.target_command || null,
                    is_pinned: announcementForm.is_pinned ? 1 : 0
                }
            } else {
                url = '/api/add_announcement.php'
                body = {
                    title: announcementForm.title,
                    content: announcementForm.content,
                    author: `${member?.first_name} ${member?.last_name}`,
                    author_role: member?.role,
                    target_command: announcementForm.target_command || null,
                    is_pinned: announcementForm.is_pinned ? 1 : 0
                }
            }

            console.log('Saving announcement to:', url)
            console.log('Request body:', body)

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            // Get the raw response text first
            const responseText = await response.text()
            console.log('Raw response:', responseText)

            // Try to parse as JSON
            let data
            try {
                data = JSON.parse(responseText)
            } catch (parseError) {
                console.error('JSON parse error:', parseError)
                alert('Server returned invalid response. Please check if the API endpoint exists.')
                setSubmitting(false)
                return
            }

            if (data && data.success) {
                alert(editingAnnouncement ? 'Announcement updated!' : 'Announcement posted!')
                loadAnnouncements()
                setShowAnnouncementModal(false)
                setEditingAnnouncement(null)
                setAnnouncementForm({ title: '', content: '', target_command: '', is_pinned: 0 })
            } else {
                alert(data?.error || 'Failed to save announcement')
            }
        } catch (error) {
            console.error('Error saving announcement:', error)
            alert('Network error: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
    const activeServicesCount = services.filter(s => s.is_active == 1).length

    useEffect(() => {
        loadMembers()
        loadServices()
        loadAnnouncements()
    }, [])

    useEffect(() => {
        filterMembers()
    }, [members, selectedCommand, searchTerm])

    if (loading) return <div className="text-center py-8">Loading...</div>

    return (
        <div className="pb-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Admin Dashboard</h2>

            {/* Admin Subtabs */}
            <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
                <button
                    onClick={() => setAdminSubTab('services')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${adminSubTab === 'services' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    📅 Service Management
                </button>
                <button
                    onClick={() => setAdminSubTab('members')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${adminSubTab === 'members' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    👥 Members Management
                </button>
                <button
                    onClick={() => setAdminSubTab('announcements')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${adminSubTab === 'announcements' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    📢 Announcements
                </button>
            </div>

            {/* Service Management Subtab */}
            {adminSubTab === 'services' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">Service Management</h3>
                        <button onClick={() => setShowCreateService(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            + Create Service
                        </button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-blue-800">Active Services: <strong>{activeServicesCount}</strong></p>
                        <p className="text-xs text-blue-600 mt-1">Only one service can be active at a time</p>
                    </div>

                    {services.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No services created yet</p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {services.map(service => (
                                <div key={service.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800">{service.service_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(service.service_date)} | {service.start_time} - {service.end_time}</p>
                                        <p className="text-xs text-gray-400 mt-1">Created by: {service.created_by || 'IT Admin'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {service.is_active == 1 ? '🟢 Active' : '🔴 Closed'}
                                        </span>
                                        {service.is_active == 1 ? (
                                            <button onClick={() => closeService(service.id)} className="text-red-600 text-sm hover:underline px-2 py-1">
                                                Close
                                            </button>
                                        ) : (
                                            <button onClick={() => reopenService(service.id)} className="text-green-600 text-sm hover:underline px-2 py-1">
                                                Reopen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Members Management Subtab */}
            {adminSubTab === 'members' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Members Management</h3>

                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <select value={selectedCommand} onChange={(e) => setSelectedCommand(e.target.value)} className="px-3 py-2 border rounded-lg">
                            {commands.map(cmd => (<option key={cmd} value={cmd}>{cmd}</option>))}
                        </select>
                        <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredMembers.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No members found</p>
                        ) : (
                            filteredMembers.map(memberItem => (
                                <div key={memberItem.id} onClick={() => setSelectedMember(memberItem)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                                        {memberItem.profile_picture ? (
                                            <img src={memberItem.profile_picture} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                                                {memberItem.first_name?.[0]}{memberItem.last_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{memberItem.designation} {memberItem.first_name} {memberItem.last_name}</p>
                                        <p className="text-xs text-gray-500">ID: {memberItem.id_number} | {memberItem.command}</p>
                                    </div>
                                    <div><span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{memberItem.role}</span></div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">Total Members: {filteredMembers.length}</div>
                </div>
            )}

            {/* Announcements Management Subtab */}
            {adminSubTab === 'announcements' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">Announcements Management</h3>
                        <button onClick={() => {
                            setEditingAnnouncement(null)
                            setAnnouncementForm({ title: '', content: '', target_command: '', is_pinned: 0 })
                            setShowAnnouncementModal(true)
                        }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            + New Announcement
                        </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {announcements.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No announcements yet</p>
                        ) : (
                            announcements.map(announcement => (
                                <div key={announcement.id} className={`border rounded-lg p-4 ${announcement.is_pinned == 1 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <h4 className="font-bold text-gray-800">{announcement.title}</h4>
                                                {announcement.is_pinned == 1 && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">📌 Pinned</span>}
                                                {announcement.target_command && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Target: {announcement.target_command}</span>}
                                            </div>
                                            <p className="text-gray-600 mb-3">{announcement.content}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>By: {announcement.author} ({announcement.author_role})</span>
                                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button onClick={() => handlePinAnnouncement(announcement.id, announcement.is_pinned == 1)} className={`p-2 rounded-lg transition ${announcement.is_pinned == 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title={announcement.is_pinned == 1 ? 'Unpin' : 'Pin'}>
                                                📌
                                            </button>
                                            <button onClick={() => handleEditAnnouncement(announcement)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" title="Edit">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Delete">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <MemberDetailsModal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} member={selectedMember} onUpdate={(updatedMember) => { setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m)); setSelectedMember(null) }} />
            <CreateServiceModal isOpen={showCreateService} onClose={() => setShowCreateService(false)} onSuccess={() => { loadServices(); setShowCreateService(false) }} activeServicesCount={activeServicesCount} />

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowAnnouncementModal(false); setEditingAnnouncement(null) } }}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h2>
                            <button onClick={() => { setShowAnnouncementModal(false); setEditingAnnouncement(null) }} className="text-gray-500 text-2xl hover:text-gray-700">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label><input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Announcement title" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label><textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} placeholder="Announcement content..." rows="5" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Target Command (Optional)</label>
                                <select value={announcementForm.target_command} onChange={(e) => setAnnouncementForm({ ...announcementForm, target_command: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">All Commands</option>
                                    {['UPPER ROOM', 'GOSHEN', 'YOUTH', 'OPERATION', 'HONOUR', 'G & G', 'SPECIAL DUTY 1', 'SPECIAL DUTY 2', 'SPECIAL DUTY 3', 'SPECIAL DUTY 4', 'SPECIAL DUTY 5'].map(cmd => (<option key={cmd} value={cmd}>{cmd}</option>))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={announcementForm.is_pinned === 1} onChange={(e) => setAnnouncementForm({ ...announcementForm, is_pinned: e.target.checked ? 1 : 0 })} className="w-4 h-4 text-red-600 rounded" /><span className="text-sm font-semibold text-gray-700">Pin this announcement</span></label><span className="text-xs text-gray-500">Pinned announcements appear at the top</span></div>
                        </div>
                        <div className="border-t p-4 flex gap-3">
                            <button onClick={() => { setShowAnnouncementModal(false); setEditingAnnouncement(null) }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSaveAnnouncement} disabled={submitting} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">{submitting ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Post Announcement')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============= ACCT ADMIN TAB - Full Management =============
function AcctAdminTab({ member }) {
    const [activeSubTab, setActiveSubTab] = useState('orders')
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [showProductModal, setShowProductModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        description: '',
        has_custom_price: 0,
        sort_order: 0
    })
    const [submitting, setSubmitting] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showDeliveryModal, setShowDeliveryModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [sortableList, setSortableList] = useState(null)

    useEffect(() => {
        loadProducts()
        loadOrders()
    }, [])

    // Reload orders when date filter changes
    useEffect(() => {
        loadOrders()
    }, [startDate, endDate])

    const loadProducts = async () => {
        try {
            const response = await fetch('/api/get_products.php')
            const data = await response.json()
            if (data.success) {
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadOrders = async () => {
        try {
            let url = '/api/get_all_orders.php'
            if (startDate && endDate) {
                url += `?start_date=${startDate}&end_date=${endDate}`
            } else if (startDate) {
                url += `?start_date=${startDate}`
            }
            const response = await fetch(url)
            const data = await response.json()
            if (data.success) {
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        }
    }

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⏳' }
            case 'payment_confirmed':
                return { text: 'Payment Confirmed', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' }
            case 'goods_delivered':
                return { text: 'Goods Delivered', color: 'text-blue-600', bg: 'bg-blue-100', icon: '🚚' }
            case 'cancelled':
                return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' }
            default:
                return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: '📦' }
        }
    }

    // Product Management Functions
    const handleSaveProduct = async () => {
        if (!productForm.name.trim()) {
            alert('Please enter product name')
            return
        }

        setSubmitting(true)
        try {
            const url = editingProduct ? '/api/update_product.php' : '/api/add_product.php'
            const body = editingProduct
                ? {
                    id: editingProduct.id,
                    name: productForm.name,
                    price: productForm.price,
                    description: productForm.description,
                    has_custom_price: productForm.has_custom_price ? 1 : 0,
                    sort_order: productForm.sort_order
                }
                : {
                    name: productForm.name,
                    price: productForm.price,
                    description: productForm.description,
                    has_custom_price: productForm.has_custom_price ? 1 : 0,
                    sort_order: productForm.sort_order
                }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const data = await response.json()

            if (data.success) {
                alert(editingProduct ? 'Product updated!' : 'Product added!')
                loadProducts()
                setShowProductModal(false)
                setEditingProduct(null)
                resetProductForm()
            } else {
                alert(data.error || 'Failed to save product')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Network error')
        }
        setSubmitting(false)
    }

    const handleDeleteProduct = async (id, name) => {
        if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
            try {
                const response = await fetch('/api/delete_product.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Product deleted')
                    loadProducts()
                } else {
                    alert(data.error || 'Failed to delete')
                }
            } catch (error) {
                alert('Network error')
            }
        }
    }

    // Order Management Functions
    const confirmPayment = async (orderId, orderNumber) => {
        if (confirm(`Confirm payment for order ${orderNumber}?`)) {
            try {
                const response = await fetch('/api/update_order_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId, status: 'payment_confirmed' })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Payment confirmed!')
                    loadOrders()
                } else {
                    alert(data.error || 'Failed to confirm payment')
                }
            } catch (error) {
                alert('Network error')
            }
        }
    }

    const markDelivered = async () => {
        if (!selectedOrder) return

        if (confirm(`Mark order ${selectedOrder.order_number} as delivered?`)) {
            try {
                const response = await fetch('/api/update_order_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: selectedOrder.id,
                        status: 'goods_delivered',
                        delivered_by: `${member?.first_name} ${member?.last_name}`
                    })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Order marked as delivered!')
                    setShowDeliveryModal(false)
                    setSelectedOrder(null)
                    loadOrders()
                } else {
                    alert(data.error || 'Failed to mark delivered')
                }
            } catch (error) {
                alert('Network error')
            }
        }
    }

    const cancelOrder = async (orderId, orderNumber) => {
        if (confirm(`Cancel order ${orderNumber}? This action cannot be undone.`)) {
            try {
                const response = await fetch('/api/update_order_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId, status: 'cancelled' })
                })
                const data = await response.json()
                if (data.success) {
                    alert('Order cancelled')
                    loadOrders()
                } else {
                    alert(data.error || 'Failed to cancel order')
                }
            } catch (error) {
                alert('Network error')
            }
        }
    }

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await fetch(`/api/get_order_details.php?id=${orderId}`)
            const data = await response.json()
            if (data.success) {
                alert(`Order ${data.order?.order_number}\nTotal: ${formatPrice(data.order?.total_amount)}\nItems: ${data.items?.length}`)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const resetProductForm = () => {
        setProductForm({
            name: '',
            price: '',
            description: '',
            has_custom_price: 0,
            sort_order: 0
        })
    }

    const openAddModal = () => {
        setEditingProduct(null)
        resetProductForm()
        setShowProductModal(true)
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setProductForm({
            name: product.name,
            price: product.price,
            description: product.description || '',
            has_custom_price: product.has_custom_price || 0,
            sort_order: product.sort_order || 0
        })
        setShowProductModal(true)
    }

    // Initialize SortableJS
    useEffect(() => {
        if (!loading && products.length > 0 && typeof Sortable !== 'undefined') {
            const list = document.getElementById('sortable-products-list')
            if (list && !sortableList) {
                const sortable = new Sortable(list, {
                    animation: 300,
                    handle: '.drag-handle',
                    ghostClass: 'dragging',
                    onEnd: () => updatePositionBadges()
                })
                setSortableList(sortable)
            }
        }
    }, [loading, products])

    const updatePositionBadges = () => {
        const items = document.querySelectorAll('#sortable-products-list .sortable-item')
        items.forEach((item, index) => {
            const badge = item.querySelector('.drag-badge')
            if (badge) {
                badge.textContent = '#' + (index + 1)
            }
        })
    }

    const saveProductOrder = async () => {
        const items = document.querySelectorAll('#sortable-products-list .sortable-item')
        const orderData = []
        items.forEach((item, index) => {
            orderData.push({
                id: parseInt(item.dataset.id),
                sort_order: index
            })
        })

        try {
            const response = await fetch('/api/update_product_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: orderData })
            })
            const data = await response.json()
            if (data.success) {
                alert('Product order saved!')
                loadProducts()
            } else {
                alert(data.error || 'Failed to save order')
            }
        } catch (error) {
            alert('Network error')
        }
    }

    // Calculate stats
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const paymentConfirmedOrders = orders.filter(o => o.status === 'payment_confirmed').length
    const goodsDeliveredOrders = orders.filter(o => o.status === 'goods_delivered').length
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
    const totalRevenue = orders
        .filter(o => o.status === 'payment_confirmed' || o.status === 'goods_delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)

    if (loading) {
        return <div className="text-center py-8">Loading...</div>
    }

    return (
        <div className="pb-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Accounts Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border-l-4 border-red-600">
                    <div className="text-2xl font-bold text-red-600">{orders.length}</div>
                    <div className="text-xs text-gray-500">Total Orders</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border-l-4 border-yellow-500">
                    <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border-l-4 border-green-500">
                    <div className="text-2xl font-bold text-green-600">{paymentConfirmedOrders}</div>
                    <div className="text-xs text-gray-500">Payment Confirmed</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border-l-4 border-blue-500">
                    <div className="text-2xl font-bold text-blue-600">{goodsDeliveredOrders}</div>
                    <div className="text-xs text-gray-500">Delivered</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border-l-4 border-purple-500">
                    <div className="text-xl font-bold text-purple-600">₦{totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Revenue</div>
                </div>
            </div>

            {/* Subtabs */}
            <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
                <button
                    onClick={() => setActiveSubTab('orders')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${activeSubTab === 'orders' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    📋 Orders Management
                </button>
                <button
                    onClick={() => setActiveSubTab('products')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${activeSubTab === 'products' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    📦 Products Management
                </button>
            </div>

            {/* Orders Management Subtab */}
            {activeSubTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
                        <div className="flex gap-2 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                            <button onClick={() => { setStartDate(''); setEndDate('') }} className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm">Clear</button>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No orders found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Order #</th>
                                        <th className="px-3 py-2 text-left">Customer</th>
                                        <th className="px-3 py-2 text-left">Phone</th>
                                        <th className="px-3 py-2 text-left">Command</th>
                                        <th className="px-3 py-2 text-left">Total</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Date</th>
                                        <th className="px-3 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status)
                                        return (
                                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-2 font-semibold">{order.order_number}</td>
                                                <td className="px-3 py-2">{order.customer_name || 'N/A'}</td>
                                                <td className="px-3 py-2">{order.customer_phone || 'N/A'}</td>
                                                <td className="px-3 py-2">{order.customer_command || 'N/A'}</td>
                                                <td className="px-3 py-2 font-semibold text-red-600">{formatPrice(order.total_amount)}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`${statusConfig.bg} ${statusConfig.color} px-2 py-1 rounded-full text-xs font-semibold`}>
                                                        {statusConfig.icon} {statusConfig.text}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-xs">{formatDate(order.created_at)}</td>
                                                <td className="px-3 py-2">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {order.status === 'pending' && (
                                                            <button onClick={() => confirmPayment(order.id, order.order_number)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                                                                Confirm Payment
                                                            </button>
                                                        )}
                                                        {order.status === 'payment_confirmed' && (
                                                            <button onClick={() => {
                                                                setSelectedOrder(order)
                                                                setShowDeliveryModal(true)
                                                            }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                                                                Mark Delivered
                                                            </button>
                                                        )}
                                                        {order.status === 'pending' && (
                                                            <button onClick={() => cancelOrder(order.id, order.order_number)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button onClick={() => viewOrderDetails(order.id)} className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700">
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Products Management Subtab */}
            {activeSubTab === 'products' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="font-bold text-gray-800 text-lg">Product Management</h3>
                        <button onClick={openAddModal} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                            + Add Product
                        </button>
                    </div>

                    <div className="reorder-notice mb-4">
                        🔄 <strong>Drag and Drop to Reorder Products</strong> - Drag the ☰ icon to rearrange. Click "Save Order" when done.
                    </div>

                    <ul id="sortable-products-list" className="space-y-2 mb-4">
                        {products.map((product, index) => (
                            <li key={product.id} className="sortable-item bg-gray-50 border rounded-lg p-4 flex flex-wrap justify-between items-center gap-3" data-id={product.id}>
                                <div className="flex items-center gap-3 flex-1 flex-wrap">
                                    <span className="drag-handle cursor-grab text-gray-400 text-xl">☰</span>
                                    <span className="drag-badge bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">#{index + 1}</span>
                                    <strong className="text-gray-800">{product.name}</strong>
                                    <span className="text-red-600 font-bold">{formatPrice(product.price)}</span>
                                    {product.has_custom_price == 1 && (
                                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">💝 Custom Price</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(product)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-yellow-600">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id, product.name)} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {products.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No products available. Add your first product!</p>
                    )}

                    {products.length > 0 && (
                        <div className="text-right">
                            <button onClick={saveProductOrder} className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700">
                                💾 Save Product Order
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                    setShowProductModal(false)
                    setEditingProduct(null)
                }}>
                    <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                            <button onClick={() => {
                                setShowProductModal(false)
                                setEditingProduct(null)
                            }} className="text-gray-500 text-2xl hover:text-gray-700">&times;</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    placeholder="e.g., Long Tie, Scarf"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₦)</label>
                                <input
                                    type="number"
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    rows="3"
                                    placeholder="Product description..."
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={productForm.has_custom_price === 1}
                                        onChange={(e) => setProductForm({ ...productForm, has_custom_price: e.target.checked ? 1 : 0 })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">Custom Price (Love Seed - user enters any amount)</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
                                <input
                                    type="number"
                                    value={productForm.sort_order}
                                    onChange={(e) => setProductForm({ ...productForm, sort_order: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="border-t p-4 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowProductModal(false)
                                    setEditingProduct(null)
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProduct}
                                disabled={submitting}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : (editingProduct ? 'Update' : 'Add Product')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Modal */}
            {showDeliveryModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                    setShowDeliveryModal(false)
                    setSelectedOrder(null)
                }}>
                    <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">📦 Confirm Delivery</h3>
                            <button onClick={() => {
                                setShowDeliveryModal(false)
                                setSelectedOrder(null)
                            }} className="text-gray-500 text-2xl hover:text-gray-700">&times;</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Order Number</label>
                                <input type="text" value={selectedOrder.order_number} readOnly className="w-full px-3 py-2 bg-gray-100 border rounded-lg font-semibold" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Customer</label>
                                <input type="text" value={selectedOrder.customer_name || 'N/A'} readOnly className="w-full px-3 py-2 bg-gray-100 border rounded-lg" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Amount</label>
                                <input type="text" value={formatPrice(selectedOrder.total_amount)} readOnly className="w-full px-3 py-2 bg-gray-100 border rounded-lg font-bold text-red-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Delivered By</label>
                                <input type="text" value={`${member?.first_name} ${member?.last_name}`} readOnly className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-lg font-semibold" />
                                <p className="text-xs text-green-600 mt-1">✓ Automatically recorded from your account</p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">⚠️ Confirmation: This action will mark the order as delivered and cannot be undone.</p>
                            </div>
                        </div>

                        <div className="border-t p-4 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeliveryModal(false)
                                    setSelectedOrder(null)
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={markDelivered}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                            >
                                ✅ Confirm Delivery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}