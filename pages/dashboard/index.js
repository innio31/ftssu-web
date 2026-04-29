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
                {activeTab === 'store' && <StoreTab member={member} />}
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
                    {(member?.role === 'Acct Admin' || member?.role === 'Accountant' || member?.role === 'Admin') && (
                        <button onClick={() => setActiveTab('acctadmin')} className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'acctadmin' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                            <span className="text-xl">💰</span>
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
function StoreTab({ member }) {
    const [products, setProducts] = useState([])
    const [quantities, setQuantities] = useState({})
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }
        const memberData = JSON.parse(stored)
        console.log('Member role:', memberData.role) // Add this line to debug
        console.log('Available roles for admin:', memberData.role === 'IT Admin', memberData.role === 'Golf Serial', memberData.role === 'Admin')
        setMember(memberData)
        fetchAnnouncements()
        setLoading(false)
    }, [router])

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
        } catch (error) { console.error(error) } finally { setLoading(false) }
    }

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`
    const updateQuantity = (productId, value) => setQuantities(prev => ({ ...prev, [productId]: value }))

    const addToCart = (product) => {
        const quantity = quantities[product.id]
        if (quantity <= 0) { alert('Please enter a quantity or amount'); return }
        const newCart = [...cart, { ...product, quantity: product.has_custom_price ? 1 : quantity, customAmount: product.has_custom_price ? quantity : null }]
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

    const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.has_custom_price ? (item.customAmount || 0) : (item.price * item.quantity)), 0)

    const saveOrder = async () => {
        if (cart.length === 0) { alert('Cart is empty'); return }
        if (!member.phone_number) { alert('Please update your phone number in profile'); return }

        const orderData = {
            customer_name: `${member.first_name} ${member.last_name}`,
            customer_phone: member.phone_number,
            customer_command: member.command,
            total_amount: getTotalPrice(),
            items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.has_custom_price ? 1 : item.quantity, customAmount: item.customAmount, has_custom_price: item.has_custom_price }))
        }

        try {
            const response = await fetch('/api/save_order.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) })
            const result = await response.json()
            if (result.success) {
                const itemsText = cart.map(item => item.has_custom_price ? `• ${item.name}: ₦${item.customAmount?.toLocaleString()}` : `• ${item.name}: ${item.quantity} × ₦${item.price.toLocaleString()} = ₦${(item.price * item.quantity).toLocaleString()}`).join('%0A')
                const message = `Hello%20Faith%20Tabernacle%20Security%20Accounts%2C%0A%0A✅%20ORDER%20CONFIRMATION%0AOrder%20Number%3A%20${result.order_number}%0A%0A📋%20ORDER%20DETAILS%3A%0A${itemsText}%0A%0A💰%20TOTAL%20AMOUNT%3A%20${formatPrice(getTotalPrice())}%0A%0A👤%20CUSTOMER%20INFORMATION%3A%0AName%3A%20${encodeURIComponent(member.first_name + ' ' + member.last_name)}%0APhone%3A%20${member.phone_number}%0ACommand%3A%20${encodeURIComponent(member.command)}%0A%0A📷%20Payment%20Proof%3A%20(Attach%20screenshot)%0A%0AThank%20you!`
                window.open(`https://wa.me/2348037280183?text=${message}`, '_blank')
                setCart([])
                localStorage.removeItem('ftssu_cart')
                setShowCart(false)
                setShowPayment(false)
                alert(`Order #${result.order_number} recorded!`)
            } else { alert(result.error || 'Failed to save order') }
        } catch (error) { alert('Network error') }
    }

    if (loading) return <div className="text-center py-8">Loading products...</div>

    if (showCart) {
        return (
            <div>
                <button onClick={() => setShowCart(false)} className="mb-4 text-red-600 font-semibold">← Back to Store</button>
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Your Cart ({cart.length} items)</h2>
                    {cart.length === 0 ? <p className="text-gray-500 text-center py-8">Your cart is empty</p> : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="border-b py-3 flex justify-between items-center">
                                    <div><h3 className="font-semibold">{item.name}</h3><p className="text-sm text-gray-600">{item.has_custom_price ? `Amount: ${formatPrice(item.customAmount)}` : `${item.quantity} × ${formatPrice(item.price)}`}</p></div>
                                    <div className="flex items-center gap-3"><p className="font-bold text-red-600">{item.has_custom_price ? formatPrice(item.customAmount) : formatPrice(item.price * item.quantity)}</p><button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xl">🗑️</button></div>
                                </div>
                            ))}
                            <div className="mt-4 pt-4 border-t"><div className="flex justify-between font-bold text-lg mb-4"><span>Total:</span><span className="text-red-600">{formatPrice(getTotalPrice())}</span></div>
                                {!showPayment ? <button onClick={() => setShowPayment(true)} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold">Proceed to Payment →</button> : (
                                    <div><div className="bg-gray-50 p-4 rounded-lg mb-4"><h3 className="font-bold mb-2">🏦 Payment Details</h3><p><strong>Account Number:</strong> 0520007050</p><p><strong>Bank:</strong> Covenant Microfinance Bank</p><p><strong>Account Name:</strong> Faith Tabernacle Security Service Group</p></div><button onClick={saveOrder} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">Confirm Payment & Send on WhatsApp</button></div>)}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">🛍️ Store</h2>{cart.length > 0 && <button onClick={() => setShowCart(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">🛒 Cart ({cart.length})</button>}</div>
            <div className="grid grid-cols-1 gap-4">{products.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-md p-5">
                    <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                    {!product.has_custom_price ? <p className="text-red-600 font-bold text-xl mt-1">{formatPrice(product.price)}</p> : <p className="text-red-600 text-sm mt-1 italic">💝 Give what's in your heart</p>}
                    {product.description && <p className="text-gray-500 text-sm mb-3">{product.description}</p>}
                    <div className="flex gap-3">
                        <input type="number" value={quantities[product.id] || 0} onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)} min="0" className="w-24 px-3 py-2 border rounded-lg text-center" placeholder={product.has_custom_price ? "Amount" : "Qty"} />
                        <button onClick={() => addToCart(product)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold">Add to Cart</button>
                    </div>
                </div>
            ))}</div>
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
        if (editedData.phone_number && editedData.phone_number.length !== 11) { alert('Phone number must be 11 digits'); return }
        const updateData = { id: member.id }
        if (editedData.phone_number !== profile?.phone_number && editedData.phone_number) updateData.phone_number = editedData.phone_number
        if (editedData.email !== profile?.email) updateData.email = editedData.email
        if (editedData.date_of_birth !== profile?.date_of_birth && editedData.date_of_birth) updateData.date_of_birth = editedData.date_of_birth
        if (Object.keys(updateData).length === 1) { alert('No changes to update'); setEditing(false); return }
        setLoading(true)
        try {
            const response = await fetch('/api/update_member.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) })
            const data = await response.json()
            if (data.success) {
                const updatedMember = { ...profile, ...updateData }
                setProfile(updatedMember)
                localStorage.setItem('ftssu_member', JSON.stringify(updatedMember))
                if (onUpdate) onUpdate(updatedMember)
                alert('Profile updated!')
                setEditing(false)
            } else { alert(data.error || 'Failed to update') }
        } catch (error) { alert('Network error') }
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
    const [loading, setLoading] = useState(true)
    const [selectedCommand, setSelectedCommand] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMember, setSelectedMember] = useState(null)
    const [showCreateService, setShowCreateService] = useState(false)

    // Announcements state
    const [announcements, setAnnouncements] = useState([])
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

    useEffect(() => { loadMembers(); loadServices(); loadAnnouncements() }, [])
    useEffect(() => { filterMembers() }, [members, selectedCommand, searchTerm])

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
                    alert('Service closed')
                    loadServices()
                } else { alert(data.error) }
            } catch (error) { alert('Network error') }
        }
    }

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
    const activeServicesCount = services.filter(s => s.is_active == 1).length

    // Announcement Modal Component
    const AnnouncementModal = () => {
        const allCommands = ['All Commands', 'UPPER ROOM', 'GOSHEN', 'YOUTH', 'OPERATION', 'HONOUR', 'G & G',
            'SPECIAL DUTY 1', 'SPECIAL DUTY 2', 'SPECIAL DUTY 3', 'SPECIAL DUTY 4', 'SPECIAL DUTY 5',
            'Command 1', 'Command 2', 'Command 3', 'Command 4', 'Command 5', 'Command 6', 'Command 7',
            'Command 8', 'Command 9', 'Command 10', 'Command 11', 'Command 12', 'Command 13', 'Command 14',
            'Command 15', 'Command 16', 'Command 17', 'Command 18', 'Command 19', 'Command 20', 'Command 21',
            'Command 22', 'VETERAN', 'KHMS', 'COVENANT DAY', 'RECRUITMENT & TRAINING', 'SID', 'PATROL',
            'IID', 'FORENSIC', 'FRENCH', 'VISION 1', 'VISION 2', 'VISION 3', 'SECURITY MEDICAL', 'SALES MONITORING']

        const handleSubmit = async () => {
            if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
                alert('Please enter both title and content')
                return
            }

            setSubmitting(true)
            try {
                const url = editingAnnouncement ? '/api/update_announcement.php' : '/api/add_announcement.php'
                const body = editingAnnouncement
                    ? {
                        id: editingAnnouncement.id,
                        title: announcementForm.title,
                        content: announcementForm.content,
                        target_command: announcementForm.target_command || null,
                        is_pinned: announcementForm.is_pinned ? 1 : 0
                    }
                    : {
                        title: announcementForm.title,
                        content: announcementForm.content,
                        author: `${member?.first_name} ${member?.last_name}`,
                        author_role: member?.role,
                        target_command: announcementForm.target_command || null,
                        is_pinned: announcementForm.is_pinned ? 1 : 0
                    }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
                const data = await response.json()

                if (data.success) {
                    alert(editingAnnouncement ? 'Announcement updated!' : 'Announcement posted!')
                    loadAnnouncements()
                    setShowAnnouncementModal(false)
                    setEditingAnnouncement(null)
                    setAnnouncementForm({ title: '', content: '', target_command: '', is_pinned: 0 })
                } else {
                    alert(data.error || 'Failed to save announcement')
                }
            } catch (error) {
                console.error('Error:', error)
                alert('Network error')
            }
            setSubmitting(false)
        }

        const handleDeleteAnnouncement = async (id) => {
            if (confirm('Delete this announcement? This action cannot be undone.')) {
                try {
                    const response = await fetch('/api/delete_announcement.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    })
                    const data = await response.json()
                    if (data.success) {
                        alert('Announcement deleted')
                        loadAnnouncements()
                    } else {
                        alert(data.error || 'Failed to delete')
                    }
                } catch (error) {
                    alert('Network error')
                }
            }
        }

        const handlePinAnnouncement = async (id, currentPinned) => {
            try {
                const response = await fetch('/api/pin_announcement.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, is_pinned: currentPinned ? 0 : 1 })
                })
                const data = await response.json()
                if (data.success) {
                    loadAnnouncements()
                } else {
                    alert(data.error || 'Failed to pin announcement')
                }
            } catch (error) {
                alert('Network error')
            }
        }

        return (
            <>
                {/* Announcement Modal */}
                {showAnnouncementModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                        setShowAnnouncementModal(false)
                        setEditingAnnouncement(null)
                        setAnnouncementForm({ title: '', content: '', target_command: '', is_pinned: 0 })
                    }}>
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                                </h2>
                                <button onClick={() => {
                                    setShowAnnouncementModal(false)
                                    setEditingAnnouncement(null)
                                }} className="text-gray-500 text-2xl hover:text-gray-700">&times;</button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={announcementForm.title}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                        placeholder="Announcement title"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label>
                                    <textarea
                                        value={announcementForm.content}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                        placeholder="Announcement content..."
                                        rows="5"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Target Command (Optional)</label>
                                    <select
                                        value={announcementForm.target_command}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, target_command: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {allCommands.map(cmd => (
                                            <option key={cmd} value={cmd === 'All Commands' ? '' : cmd}>{cmd}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to show to all commands</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={announcementForm.is_pinned === 1}
                                            onChange={(e) => setAnnouncementForm({ ...announcementForm, is_pinned: e.target.checked ? 1 : 0 })}
                                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">Pin this announcement</span>
                                    </label>
                                    <span className="text-xs text-gray-500">Pinned announcements appear at the top</span>
                                </div>
                            </div>

                            <div className="border-t p-4 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowAnnouncementModal(false)
                                        setEditingAnnouncement(null)
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Post Announcement')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    if (loading) return <div className="text-center py-8">Loading...</div>

    return (
        <div className="pb-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Admin Dashboard</h2>

            {/* Admin Subtabs */}
            <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
                <button
                    onClick={() => setAdminSubTab('services')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${adminSubTab === 'services'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    📅 Service Management
                </button>
                <button
                    onClick={() => setAdminSubTab('members')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${adminSubTab === 'members'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    👥 Members Management
                </button>
                <button
                    onClick={() => setAdminSubTab('announcements')}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${adminSubTab === 'announcements'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    📢 Announcements
                </button>
            </div>

            {/* Service Management Subtab */}
            {adminSubTab === 'services' && (
                <div>
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Service Management</h3>
                            <button
                                onClick={() => setShowCreateService(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
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
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(service.service_date)} | {service.start_time} - {service.end_time}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Created by: {service.created_by || 'IT Admin'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-300 text-gray-600'
                                                }`}>
                                                {service.is_active ? 'Active' : 'Closed'}
                                            </span>
                                            {service.is_active == 1 && (
                                                <button
                                                    onClick={() => closeService(service.id)}
                                                    className="text-red-600 text-sm hover:underline"
                                                >
                                                    Close
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Members Management Subtab */}
            {adminSubTab === 'members' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Members Management</h3>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <select
                            value={selectedCommand}
                            onChange={(e) => setSelectedCommand(e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {commands.map(cmd => (
                                <option key={cmd} value={cmd}>{cmd}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Members List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredMembers.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No members found</p>
                        ) : (
                            filteredMembers.map(memberItem => (
                                <div
                                    key={memberItem.id}
                                    onClick={() => setSelectedMember(memberItem)}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                                >
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
                                        <p className="font-semibold text-gray-800">
                                            {memberItem.designation} {memberItem.first_name} {memberItem.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">ID: {memberItem.id_number} | {memberItem.command}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {memberItem.role}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                        Total Members: {filteredMembers.length}
                    </div>
                </div>
            )}

            {/* Announcements Management Subtab */}
            {adminSubTab === 'announcements' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">Announcements Management</h3>
                        <button
                            onClick={() => {
                                setEditingAnnouncement(null)
                                setAnnouncementForm({ title: '', content: '', target_command: '', is_pinned: 0 })
                                setShowAnnouncementModal(true)
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            + New Announcement
                        </button>
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {announcements.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No announcements yet</p>
                        ) : (
                            announcements.map(announcement => (
                                <div key={announcement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-gray-800">{announcement.title}</h4>
                                                {announcement.is_pinned == 1 && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌 Pinned</span>
                                                )}
                                                {announcement.target_command && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                        Target: {announcement.target_command}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">{announcement.content}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                                                <span>By: {announcement.author || 'Unknown'}</span>
                                                <span>📅 {formatDate(announcement.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => handlePinAnnouncement(announcement.id, announcement.is_pinned == 1)}
                                                className={`text-sm px-2 py-1 rounded ${announcement.is_pinned == 1 ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-500 hover:text-yellow-600'}`}
                                                title={announcement.is_pinned == 1 ? 'Unpin' : 'Pin'}
                                            >
                                                📌
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingAnnouncement(announcement)
                                                    setAnnouncementForm({
                                                        title: announcement.title,
                                                        content: announcement.content,
                                                        target_command: announcement.target_command || '',
                                                        is_pinned: announcement.is_pinned == 1 ? 1 : 0
                                                    })
                                                    setShowAnnouncementModal(true)
                                                }}
                                                className="text-blue-600 text-sm hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                className="text-red-600 text-sm hover:underline"
                                            >
                                                Delete
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
            <MemberDetailsModal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                member={selectedMember}
                onUpdate={(updatedMember) => {
                    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m))
                    setSelectedMember(null)
                }}
            />

            <CreateServiceModal
                isOpen={showCreateService}
                onClose={() => setShowCreateService(false)}
                onSuccess={() => {
                    loadServices()
                    setShowCreateService(false)
                }}
                activeServicesCount={activeServicesCount}
            />

            {/* Announcement Modal */}
            <AnnouncementModal />
        </div>
    )
}

// ============= ACCT ADMIN TAB - Product Management =============
function AcctAdminTab({ member }) {
    const [products, setProducts] = useState([])
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
    const [sortableList, setSortableList] = useState(null)

    useEffect(() => {
        loadProducts()
    }, [])

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

    const formatPrice = (price) => `₦${Number(price).toLocaleString()}`

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

    // Initialize SortableJS after products load
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

    if (loading) {
        return <div className="text-center py-8">Loading products...</div>
    }

    return (
        <div className="pb-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Account Admin Dashboard</h2>

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">Product Management</h3>
                    <button
                        onClick={openAddModal}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        + Add Product
                    </button>
                </div>

                <div className="reorder-notice mb-4">
                    🔄 <strong>Drag and Drop to Reorder Products</strong> - Drag the ☰ icon to rearrange. Click "Save Order" when done.
                </div>

                {/* Sortable Products List */}
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
        </div>
    )
}