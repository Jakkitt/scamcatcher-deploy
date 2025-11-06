// src/pages/ChangePassword.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { changePassword } from "../services/auth";
import toast from "react-hot-toast";

const schema = z
  .object({
    email: z.string().email(),
    currentPassword: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
    currentPasswordConfirm: z.string().min(6, "ยืนยันรหัสผ่านอย่างน้อย 6 ตัวอักษร"),
    newPassword: z.string().min(6, "รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"),
    newPasswordConfirm: z.string().min(6, "ยืนยันรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"),
  })
  .refine((v) => v.currentPassword === v.currentPasswordConfirm, {
    path: ["currentPasswordConfirm"],
    message: "ยืนยันรหัสผ่านปัจจุบันไม่ตรงกัน",
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: "ยืนยันรหัสผ่านใหม่ไม่ตรงกัน",
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ["newPassword"],
    message: "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน",
  });

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email || "",
      currentPassword: "",
      currentPasswordConfirm: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      navigate("/settings");
    } catch (e) {
      toast.error(e?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
    }
  };

  return (
    <main className="container py-10 grid md:grid-cols-3 gap-8">
      {/* ซ้าย: การ์ดโปรไฟล์ (กดที่รูปเพื่อเปลี่ยนรูปได้) */}
      <ProfileSidebar />

      {/* ขวา */}
      <section className="md:col-span-2">
        {/* แท็บด้านบน */}
        <div className="mb-6">
          <div className="w-full flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              โปรไฟล์
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              รายงานของฉัน
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              การตั้งค่า
            </NavLink>
          </div>
        </div>

        {/* กล่องฟอร์มเปลี่ยนรหัส */}
        <div className="border rounded-xl bg-white p-6">
          <h1 className="text-xl font-bold mb-1">เปลี่ยนรหัสผ่าน</h1>
          <p className="text-sm text-gray-500 mb-4">
            จัดการรหัสผ่านของคุณ
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
            {/* อีเมล */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-500 mb-1">อีเมล</label>
              <input
                {...register("email")}
                readOnly
                className="w-full border rounded-lg h-10 px-3 bg-gray-100"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* รหัสปัจจุบัน / ยืนยันรหัสปัจจุบัน */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">รหัสปัจจุบัน</label>
              <input
                type="password"
                placeholder="********"
                {...register("currentPassword")}
                className="w-full border rounded-lg h-10 px-3"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                ยืนยันรหัสปัจจุบัน
              </label>
              <input
                type="password"
                placeholder="********"
                {...register("currentPasswordConfirm")}
                className="w-full border rounded-lg h-10 px-3"
              />
              {errors.currentPasswordConfirm && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentPasswordConfirm.message}
                </p>
              )}
            </div>

            {/* รหัสใหม่ / ยืนยันรหัสใหม่ */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">รหัสใหม่</label>
              <input
                type="password"
                placeholder="********"
                {...register("newPassword")}
                className="w-full border rounded-lg h-10 px-3"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                ยืนยันรหัสใหม่
              </label>
              <input
                type="password"
                placeholder="********"
                {...register("newPasswordConfirm")}
                className="w-full border rounded-lg h-10 px-3"
              />
              {errors.newPasswordConfirm && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPasswordConfirm.message}
                </p>
              )}
            </div>

            {/* ปุ่ม */}
            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 h-10 rounded-lg border"
              >
                ยกเลิก
              </button>
              <button
                disabled={isSubmitting}
                className="px-4 h-10 rounded-lg bg-black text-white disabled:opacity-60"
              >
                {isSubmitting ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
