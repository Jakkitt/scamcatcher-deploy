import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function Item({ to, children }){
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        `block px-4 py-2 rounded-lg text-sm whitespace-nowrap ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : 'text-gray-700 dark:text-gray-300'}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout(){
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black text-gray-900 dark:text-gray-100 py-10">
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl" style={{ left: '8%', top: '15%' }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl" style={{ right: '8%', bottom: '20%' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-950 via-transparent opacity-70" />
      </div>
      <div className="container max-w-[1600px] relative z-10 py-6 min-h-[calc(100vh-160px)] grid lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-2">
          <div className="sticky top-6 space-y-2 border rounded-xl p-4 bg-white/90 dark:bg-gray-900/90 dark:border-gray-800">
            <div className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">แอดมิน</div>
            <Item to="/admin">แดชบอร์ด</Item>
            <Item to="/admin/reports">รายงานมิจฉาชีพ</Item>
            <Item to="/admin/users">จัดการผู้ใช้งาน</Item>
          </div>
        </aside>
        <section className="lg:col-span-10">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
