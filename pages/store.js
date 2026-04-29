import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function StorePage() {
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [member, setMember] = useState(null)

    useEffect(() => {
        const stored = localStorage.getItem('ftssu_member')
        if (!stored) {
            router.push('/')
            return
        }
        setMember(JSON.parse(stored))

        // Fetch products
        fetch('/api/get_products.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) setProducts(data.products)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error loading products:', err)
                setLoading(false)
            })
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Loading products...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-red-600 text-white p-6">
                <button onClick={() => router.back()} className="mr-4">← Back</button>
                <h1 className="text-2xl font-bold inline">Store</h1>
            </div>
            <div className="p-6">
                <div className="mb-4 text-sm text-gray-600">
                    Welcome, {member?.first_name} {member?.last_name} ({member?.command})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                            {!product.has_custom_price ? (
                                <p className="text-red-600 font-bold text-xl mt-2">₦{Number(product.price).toLocaleString()}</p>
                            ) : (
                                <p className="text-red-600 text-sm mt-2 italic">💝 Give what's in your heart</p>
                            )}
                            {product.description && (
                                <p className="text-gray-500 text-sm mt-2">{product.description}</p>
                            )}
                            <button className="w-full bg-red-600 text-white py-2 rounded-lg mt-4 hover:bg-red-700">
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products available</p>
                    </div>
                )}
            </div>
        </div>
    )
}