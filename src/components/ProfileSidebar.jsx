// src/components/ProfileSidebar.jsx
import React from "react";
import AvatarPicker from "./AvatarPicker";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileSidebar({
  showAccountActions = true, // แสดงปุ่ม เปลี่ยนรหัส/ลบบัญชี
}) {
  const { user, updateUser } = useAuth();
  const displayName = user?.username || user?.email || "ผู้ใช้";

  return (
    <aside className="space-y-6">
      <div className="border rounded-xl p-6 text-center bg-white">
        <AvatarPicker
          value={user?.avatar}
          onChange={(img) => updateUser?.({ avatar: img })}
          size={112}
        />
        <div className="mt-3 font-semibold">{displayName}</div>
        {user?.email && (
          <div className="text-xs text-gray-500 mt-1">{user.email}</div>
        )}
      </div>

      {showAccountActions && (
        <div className="border rounded-xl p-6 bg-white">
          <h3 className="font-semibold mb-3">การตั้งค่าบัญชี</h3>
          <a
            href="/change-password"
            className="block text-center border rounded-lg h-10 leading-10 mb-3"
          >
            เปลี่ยนรหัสผ่าน
          </a>
          <button className="w-full rounded-lg h-10 bg-red-600 text-white">
            ลบบัญชี
          </button>
        </div>
      )}
    </aside>
  );
}
