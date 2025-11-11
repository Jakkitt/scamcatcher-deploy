import React from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertTriangle } from 'lucide-react'

export default function Home1(){
  return (
    <div className="relative overflow-hidden min-h-[70vh] dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black bg-gray-50">
      {/* Dark-only animated backdrop */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl left-16 top-24" />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl right-24 bottom-16" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <main className='container relative z-10 text-center py-16'>
        {/* Heading */}
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4'>
          <span className='dark:bg-gradient-to-r dark:from-cyan-300 dark:via-blue-300 dark:to-indigo-300 dark:text-transparent dark:bg-clip-text text-gray-900'>
            ตรวจสอบและรายงาน
          </span>
          <br />
          <span className='text-gray-900 dark:text-white'>มิจฉาชีพออนไลน์</span>
        </h1>

        <p className='mt-4 text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto'>
          <strong className='dark:text-cyan-300'>ScamCatcher</strong> ช่วยให้คุณตรวจสอบข้อมูลผู้ที่มีประวัติการโกงและรายงานมิจฉาชีพเพื่อป้องกันผู้อื่น
        </p>

        {/* Actions */}
        <div className='mt-10 flex justify-center gap-4 flex-wrap'>
          <Link to='/search/detail' className='group flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition dark:bg-gradient-to-r dark:from-[#2AD8E6] dark:to-[#4E80FF] dark:hover:from-[#1FD0DF] dark:hover:to-[#3C71FF]'>
            <Search className='w-5 h-5 group-hover:rotate-12 transition-transform'/> ค้นหาข้อมูลมิจฉาชีพ
          </Link>
          <Link to='/report' className='group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-gray-900 font-medium border hover:bg-gray-50 transition dark:bg-transparent dark:text-white dark:border-cyan-400/30 dark:hover:bg-cyan-400/10'>
            <AlertTriangle className='w-5 h-5 group-hover:rotate-12 transition-transform'/> รายงานมิจฉาชีพ
          </Link>
        </div>
      </main>
    </div>
  )
}
