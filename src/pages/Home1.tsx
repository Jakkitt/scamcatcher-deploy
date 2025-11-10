import React, { useEffect, useState } from 'react'
import { Search, AlertTriangle, Shield, Eye, UserX } from 'lucide-react'

export default function Home1() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          style={{
            left: `${mousePos.x / 20}px`,
            top: `${mousePos.y / 20}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl"
          style={{
            right: `${mousePos.x / 30}px`,
            bottom: `${mousePos.y / 30}px`,
            transition: 'all 0.4s ease-out'
          }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      {/* Content */}
      <main className="container relative z-10 text-center py-20 px-4">
        {/* Alert Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400/30 to-blue-400/30 border border-cyan-400/50 text-cyan-100 text-sm mb-8 backdrop-blur-sm shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40 transition-all duration-300">
          <Shield className="w-4 h-4" />
          ป้องกันการถูกหลอกลวงออนไลน์
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 text-transparent bg-clip-text drop-shadow-[0_0_40px_rgba(6,182,212,0.8)]">
            ตรวจสอบและรายงาน
          </span>
          <br />
          <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            มิจฉาชีพออนไลน์
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          <strong className="text-cyan-300">ScamCatcher</strong> ช่วยให้คุณตรวจสอบข้อมูลผู้ที่มีประวัติการโกง<br className="hidden sm:block" />
          และรายงานมิจฉาชีพเพื่อป้องกันผู้อื่นจากการถูกหลอกลวง
        </p>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-center gap-4 flex-wrap">
          <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 hover:scale-105 transform">
            <Search className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            ค้นหาข้อมูลมิจฉาชีพ
          </button>
          
          <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/15 backdrop-blur-md text-white font-bold text-lg border-2 border-cyan-400/50 hover:bg-cyan-400/20 hover:border-cyan-300/70 transition-all duration-300 shadow-xl shadow-cyan-400/20 hover:shadow-2xl hover:shadow-cyan-400/40 hover:scale-105 transform">
            <AlertTriangle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            รายงานมิจฉาชีพ
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="group bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-md p-6 rounded-2xl border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/30 hover:-translate-y-1">
            <Eye className="w-10 h-10 text-cyan-300 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <h3 className="text-3xl font-bold text-white mb-2">10,000+</h3>
            <p className="text-gray-300 text-sm">รายการตรวจสอบ</p>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-md p-6 rounded-2xl border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-400/30 hover:-translate-y-1">
            <UserX className="w-10 h-10 text-blue-300 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            <h3 className="text-3xl font-bold text-white mb-2">5,000+</h3>
            <p className="text-gray-300 text-sm">มิจฉาชีพถูกรายงาน</p>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-md p-6 rounded-2xl border border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-400/30 hover:-translate-y-1">
            <Shield className="w-10 h-10 text-indigo-300 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            <h3 className="text-3xl font-bold text-white mb-2">50,000+</h3>
            <p className="text-gray-300 text-sm">ผู้ใช้ได้รับการปกป้อง</p>
          </div>
        </div>
      </main>
    </div>
  )
}