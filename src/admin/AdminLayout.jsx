import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Users, Settings } from 'lucide-react';
import { t } from '../i18n/strings';

function Item({ to, children, icon }){
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 whitespace-nowrap ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-medium' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
        }`
      }
    >
      <div className="shrink-0">{icon}</div>
      <span className="truncate">{children}</span>
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
      <div className="container max-w-[1600px] relative z-10 py-6 min-h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-fit shrink-0">
          <div className="sticky top-6 space-y-2 border rounded-xl p-4 bg-white/90 dark:bg-gray-900/90 dark:border-gray-800">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
              {t('admin.menu.mainMenu') || 'เมนูหลัก'}
            </div>
            <Item to="/admin" icon={<LayoutDashboard size={18} />}>
              {t('admin.menu.dashboard')}
            </Item>
            <Item to="/admin/reports" icon={<AlertCircle size={18} />}>
              {t('admin.menu.reports')}
            </Item>
            <Item to="/admin/users" icon={<Users size={18} />}>
              {t('admin.menu.users')}
            </Item>

            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('admin.menu.systemSettings') || 'ตั้งค่าระบบ'}
            </div>
            <Item to="/admin/settings" icon={<Settings size={18} />}>
              {t('admin.menu.generalSettings') || 'การตั้งค่าทั่วไป'}
            </Item>
          </div>
        </aside>
        <section className="flex-1 min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
