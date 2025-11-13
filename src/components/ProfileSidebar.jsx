import React from "react";
import AvatarPicker from "./AvatarPicker";
import { useAuth } from "../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import { deleteAccount as deleteAccountApi } from "../services/auth";

export default function ProfileSidebar({
  showAccountActions = true,
}) {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.username || user?.email || "ผู้ใช้";
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const openConfirm = () => {
    setEmailInput("");
    setDeleteError("");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setDeleteError("");
  };

  const handleDelete = async () => {
    const expected = (user?.email || "").trim().toLowerCase();
    if (!emailInput.trim()) {
      setDeleteError("กรอกอีเมลเพื่อยืนยัน");
      return;
    }
    if (emailInput.trim().toLowerCase() !== expected) {
      setDeleteError("อีเมลไม่ตรงกับบัญชีของคุณ");
      return;
    }
    try {
      setSubmitting(true);
      await deleteAccountApi({ email: emailInput.trim() });
      logout?.();
      navigate("/login");
    } catch (err) {
      setDeleteError(err?.message || "ลบบัญชีไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="space-y-6">
      <div className="border rounded-xl p-6 text-center bg-white dark:bg-[#08162c]/90 dark:border-cyan-400/30 dark:text-white dark:shadow-[0_20px_60px_rgba(6,182,212,0.2)]">
        <AvatarPicker
          value={user?.avatarUrl}
          onChange={(img) => updateUser?.({ avatarUrl: img })}
          size={112}
        />
        <div className="mt-3 font-semibold">{displayName}</div>
        {user?.email && (
          <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">{user.email}</div>
        )}
      </div>

      {showAccountActions && (
        <div className="border rounded-xl p-6 bg-white dark:bg-[#08162c]/90 dark:border-cyan-400/30 dark:text-white dark:shadow-[0_20px_60px_rgba(6,182,212,0.2)]">
          <h3 className="font-semibold mb-3">การตั้งค่าบัญชี</h3>
          <NavLink
            to="/change-password"
            className="block text-center border rounded-lg h-10 leading-10 mb-3 dark:border-cyan-400/30 dark:text-white"
          >
            เปลี่ยนรหัสผ่าน
          </NavLink>
          <button className="w-full rounded-lg h-10 bg-red-600 text-white" onClick={openConfirm}>
            ลบบัญชี
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-[#061025] dark:text-white space-y-4">
            <h2 className="text-xl font-extrabold">คุณต้องลบบัญชี ScamCatcher ของคุณใช่ไหม</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี <span className="font-semibold">{user?.email}</span><br />
              ข้อมูลทั้งหมดของคุณจะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้หลังจากดำเนินการนี้
            </p>
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณเพื่อยืนยัน"
              className="w-full h-11 rounded-lg border px-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-400 focus:border-red-400 dark:bg-[#0f1f34] dark:border-cyan-400/30 dark:text-white"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={submitting}
            />
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-red-600 text-white font-semibold shadow-lg shadow-red-600/40 disabled:opacity-60"
              >
                {submitting ? "กำลังลบบัญชี..." : "ลบบัญชี"}
              </button>
              <button
                onClick={closeConfirm}
                className="w-full h-11 rounded-lg bg-gray-200 text-gray-800 font-semibold dark:bg-gray-700 dark:text-white"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
