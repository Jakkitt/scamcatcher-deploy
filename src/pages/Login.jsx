import React, { useEffect, useState } from 'react'
import { Lock, Mail, LogIn, UserPlus } from 'lucide-react'
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
    <div className="min-h-[70vh] pt-16 relative overflow-hidden flex items-start justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black">
      {/* Animated Background (dark only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4">

        <div className="rounded-3xl p-8 shadow-2xl 
                        bg-white border border-gray-200 text-gray-900 
                        dark:bg-gradient-to-br dark:from-gray-900/70 dark:to-gray-950/70 dark:text-white dark:border-cyan-400/20 dark:backdrop-blur-xl dark:shadow-cyan-500/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2 dark:text-white">
              เข้าสู่ระบบ
            </h2>
            <p className="text-gray-500 dark:text-gray-400">กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl transition-all outline-none 
                             bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 
                             dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl transition-all outline-none 
                             bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 
                             dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20"
                />
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-gray-800 hover:text-black transition-colors dark:text-cyan-300 dark:hover:text-cyan-200">
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2 
                         bg-black text-white 
                         dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 dark:hover:from-cyan-400 dark:hover:to-blue-400 dark:shadow-xl dark:shadow-cyan-500/30"
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
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 dark:bg-gray-900/50">หรือ</span>
              </div>
            </div>

            {/* ไปหน้าสมัครสมาชิก */}
            <Link
              to="/register"
              className="w-full h-12 rounded-lg bg-white text-gray-900 font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 
                         dark:bg-transparent dark:text-white dark:border-cyan-400/30 dark:hover:bg-cyan-400/10"
            >
              <UserPlus className="w-5 h-5" />
              สมัครสมาชิก
            </Link>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            การเข้าสู่ระบบหมายความว่าคุณยอมรับ<br />
            <button className="text-gray-800 hover:underline dark:text-cyan-300">เงื่อนไขการใช้งาน</button> และ{' '}
            <button className="text-gray-800 hover:underline dark:text-cyan-300">นโยบายความเป็นส่วนตัว</button>
          </p>
        </div>
      </div>
    </div>
  )
}
