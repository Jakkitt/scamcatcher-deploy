import React, { useEffect, useState } from 'react'
import { Lock, Mail, LogIn, UserPlus, Shield } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const from = location.state?.from?.pathname || '/profile'

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await login({ email: formData.email, password: formData.password })
      navigate(from, { replace: true }) // ✅ เปลี่ยนหน้าเมื่อ login สำเร็จ
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl"
          style={{
            left: `${mousePos.x / 20}px`,
            top: `${mousePos.y / 20}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          style={{
            right: `${mousePos.x / 30}px`,
            bottom: `${mousePos.y / 30}px`,
            transition: 'all 0.4s ease-out'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-blue-400/30 border border-cyan-400/50 text-cyan-100 text-sm backdrop-blur-sm shadow-lg shadow-cyan-400/20">
            <Shield className="w-4 h-4" />
            ScamCatcher Security
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/70 to-gray-950/70 backdrop-blur-xl border border-cyan-400/20 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-cyan-300 to-blue-300 text-transparent bg-clip-text">
              เข้าสู่ระบบ
            </h2>
            <p className="text-gray-400">กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-cyan-300 mb-2 font-medium">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-cyan-300 mb-2 font-medium">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02] transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : (
                <>
                  <LogIn className="w-5 h-5" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/50 text-gray-500">หรือ</span>
              </div>
            </div>

            {/* ไปหน้าสมัครสมาชิก */}
            <Link
              to="/register"
              className="w-full h-12 rounded-xl bg-white/5 backdrop-blur-md text-white font-semibold border-2 border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              สมัครสมาชิก
            </Link>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            การเข้าสู่ระบบหมายความว่าคุณยอมรับ<br />
            <button className="text-cyan-400 hover:underline">เงื่อนไขการใช้งาน</button> และ{' '}
            <button className="text-cyan-400 hover:underline">นโยบายความเป็นส่วนตัว</button>
          </p>
        </div>
      </div>
    </div>
  )
}
