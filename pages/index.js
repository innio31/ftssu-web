import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
    const [idNumber, setIdNumber] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!idNumber.trim() || !password.trim()) {
            setError('Please enter ID and password')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/verify_member.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_number: idNumber.toUpperCase(),
                    password
                }),
            })

            const data = await response.json()

            if (data.success && data.member) {
                localStorage.setItem('ftssu_member', JSON.stringify(data.member))
                router.push('/dashboard')
            } else {
                setError(data.message || 'Invalid credentials')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-red-900 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">FTSSU</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-2">Faith Tabernacle Security Service Unit</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">ID Card Number</label>
                        <input
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., FTSSU001"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login →'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Default password is your last name (lowercase)
                </p>
            </div>
        </div>
    )
}