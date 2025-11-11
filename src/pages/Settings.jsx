// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [prefTheme, setPrefTheme] = useState(theme || "system");
  const [saving, setSaving] = useState(false);

  useEffect(() => setPrefTheme(theme || "system"), [theme]);

  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setTheme(prefTheme);
    toast.success("บันทึกธีมแล้ว");
    setSaving(false);
  };

  return (
    <main className="container py-10 grid md:grid-cols-3 gap-8">
      {/* การ์ดซ้าย – กดเปลี่ยนรูปได้ */}
      <ProfileSidebar />

      {/* ขวา */}
      <section className="md:col-span-2">
        {/* แท็บบน */}
        <div className="mb-6">
          <div className="w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              โปรไฟล์
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              รายงานของฉัน
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              การตั้งค่า
            </NavLink>
          </div>
        </div>

        <div className="border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-800 p-6">
          <h1 className="text-xl font-bold mb-6">การตั้งค่า</h1>

          {/* เปลี่ยนธีมเท่านั้น */}
          <div className="space-y-3">
            <div className="font-medium">ธีม</div>
            <div className="flex items-center gap-4">
              {["light", "dark", "system"].map((t) => (
                <label key={t} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={prefTheme === t}
                    onChange={() => setPrefTheme(t)}
                  />
                  <span className="whitespace-nowrap">
                    {t === "light" ? "สว่าง" : t === "dark" ? "มืด" : "ตามระบบ"}
                  </span>
                </label>
              ))}
            </div>
            <div className="pt-4">
              <button
                onClick={onSave}
                disabled={saving}
                className="px-5 h-10 rounded-xl bg-black text-white disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
