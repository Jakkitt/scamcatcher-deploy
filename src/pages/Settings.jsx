// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileSidebar from "../components/ProfileSidebar";

import { t } from "../i18n/strings";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../services/auth";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);

  useEffect(() => {
    if (user?.settings?.emailNotifications !== undefined) {
      setEmailNotif(user.settings.emailNotifications);
    }
  }, [user]);

  const handleToggleEmail = async (checked) => {
    // Optimistic update
    setEmailNotif(checked);
    
    try {
      // Auto-save
      console.log('Updating settings...', { settings: { emailNotifications: checked } });
      const result = await updateUser({ settings: { emailNotifications: checked } });
      console.log('Update result:', result);
      
      // Update local user context
      if (result) {
        updateProfile(result);
        console.log('Profile updated successfully');
      }
      
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error("บันทึกไม่สำเร็จ: " + (err.message || 'Unknown error'));
      // Revert on error
      setEmailNotif(!checked);
    }
  };

  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black dark:text-gray-100">
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl" style={{ left: '8%', top: '15%' }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl" style={{ right: '8%', bottom: '20%' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <main className="container mx-auto px-4 md:px-6 py-10 relative z-10 grid md:grid-cols-3 gap-8">
        <ProfileSidebar />

        <section className="md:col-span-2">
          {/* Tabs เหมือนหน้า Profile */}
          <div className="mb-6">
            <div className="w-full flex items-center gap-2 rounded-2xl p-2 bg-white/95 border border-slate-200/80 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur
                            dark:bg-slate-900/80 dark:border-white/10 dark:shadow-[0_20px_60px_rgba(15,23,42,0.9)]">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex-1 text-center h-11 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* การ์ด Settings */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white/95 text-slate-900 border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                          dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:text-white dark:border-white/10 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              {t("settingsPage.title")}
            </h1>

            <div className="space-y-5">
              <div className="font-medium text-slate-700 dark:text-sky-200">
                การแจ้งเตือน
              </div>

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-900 dark:text-white font-medium group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    รับการแจ้งเตือนทางอีเมล
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    แจ้งเตือนเมื่อรายงานของคุณได้รับการอนุมัติหรือปฏิเสธ
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotif}
                    onChange={(e) => handleToggleEmail(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                </div>
              </label>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
