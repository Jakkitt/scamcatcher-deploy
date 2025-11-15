import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertTriangle } from 'lucide-react'
import { t } from '../i18n/strings'

export default function Home1(){
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-[70vh] relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black">
      {/* Animated Background Effects (dark only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        {/* Gradient Orbs */}
        <div
          className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          style={{ left: `${mousePos.x / 20}px`, top: `${mousePos.y / 20}px`, transition: 'all 0.3s ease-out' }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl"
          style={{ right: `${mousePos.x / 30}px`, bottom: `${mousePos.y / 30}px`, transition: 'all 0.4s ease-out' }}
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      {/* Content */}
      <main className='container relative z-10 text-center py-20 px-4'>
        {/* Alert Badge removed per request */}

        {/* Heading */}
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4'>
          <span className='dark:bg-gradient-to-r dark:from-cyan-300 dark:via-blue-300 dark:to-indigo-300 dark:text-transparent dark:bg-clip-text text-gray-900'>{t('home.titleLine1')}</span>
          <br />
          <span className='text-gray-900 dark:text-white'>{t('home.titleLine2')}</span>
        </h1>

        <p className='mt-4 text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto'>
          <strong className='dark:text-cyan-300'>{t('layout.brand')}</strong> {t('home.description')}
        </p>

        {/* Actions */}
        <div className='mt-10 flex justify-center gap-4 flex-wrap'>
          <Link to='/search/detail' className='group flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 dark:hover:from-cyan-400 dark:hover:to-blue-400 dark:shadow-xl dark:shadow-cyan-500/30'>
            <Search className='w-5 h-5 group-hover:rotate-12 transition-transform'/> {t('home.actions.search')}
          </Link>
          <Link to='/report' className='group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-gray-900 font-medium border hover:bg-gray-50 transition dark:bg-transparent dark:text-white dark:border-cyan-400/30 dark:hover:bg-cyan-400/10'>
            <AlertTriangle className='w-5 h-5 group-hover:rotate-12 transition-transform'/> {t('home.actions.report')}
          </Link>
        </div>

        {/* Stats Cards removed per request */}
      </main>
    </div>
  )
}
