'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff } from '../Icons'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    bio: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
      })
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#004d00] via-[#003300] to-[#000000]">
      <Card className="w-full max-w-md border-[#66ff66]/20 bg-[#002200]/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#004d00] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#66ff66]/30">
            <UserPlus className="w-8 h-8 text-[#66ff66]" strokeWidth={2} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <p className="text-white/60 text-sm">Join the community and start sharing insights</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Bio (Optional)</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#003300] bg-[#001100] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#66ff66] focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#004d00] hover:bg-[#003300] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#66ff66]/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>

            <div className="text-center text-sm text-white/60">
              Already have an account?{' '}
              <a href="/login" className="text-[#66ff66] hover:text-[#66ff66]/80 font-semibold transition-colors">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


