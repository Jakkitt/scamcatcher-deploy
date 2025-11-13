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
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
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
      await changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        token
      );
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      navigate("/settings");
    } catch (e) {
      const fields = e?.data?.error?.fields || {};
      const mapMsg = (code) =>
        ({
          min_8: "อย่างน้อย 8 ตัวอักษร",
          max_72: "ไม่เกิน 72 ตัวอักษร",
          max_bytes_72: "ไม่เกิน 72 ไบต์",
        }[code] || "ข้อมูลไม่ถูกต้อง");
      if (e?.status === 400 && fields) {
        if (fields.currentPassword)
          setError("currentPassword", {
            type: "server",
            message: mapMsg(fields.currentPassword),
          });
        if (fields.newPassword)
          setError("newPassword", {
            type: "server",
            message: mapMsg(fields.newPassword),
          });
        toast.error("ข้อมูลไม่ถูกต้อง");
      } else {
        toast.error(e?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black py-10">
      {/* พื้นหลังเรืองแสง */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div
          className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse"
          style={{ left: "10%", top: "20%" }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl animate-pulse"
          style={{ right: "10%", bottom: "20%", animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-950 via-transparent opacity-70" />
      </div>

      <main className="container relative z-10 py-12 min-h-[calc(100vh-160px)] grid md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Content */}
        <section className="md:col-span-2">
          {/* Tabs */}
          <div className="mb-6">
            <div className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-lg dark:bg-[#08162c]/80 dark:border-cyan-400/30">
              {[
                { to: "/profile", label: "โปรไฟล์" },
                { to: "/reports", label: "รายงานของฉัน" },
                { to: "/settings", label: "การตั้งค่า" },
              ].map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex-1 text-center h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 font-semibold"
                        : "text-gray-500 hover:text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800/50"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* ฟอร์มเปลี่ยนรหัสผ่าน */}
          <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:bg-[#061427]/90 dark:text-white dark:border-cyan-400/30 dark:shadow-[0_25px_80px_rgba(6,182,212,0.25)]">
            <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-white dark:focus:border-cyan-300">เปลี่ยนรหัสผ่าน</h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid md:grid-cols-2 gap-5"
            >
              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">อีเมล</label>
                <input
                  {...register("email")}
                  readOnly
                className="w-full h-11 px-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-600 dark:bg-[#08162c]/70 dark:border-cyan-400/30 dark:text-gray-100"
                />
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">รหัสปัจจุบัน</label>
                <input
                  type="password"
                  placeholder="********"
                  {...register("currentPassword")}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/20 dark:text-white dark:focus:border-cyan-300"
                />
                {errors.currentPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm current password */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">ยืนยันรหัสปัจจุบัน</label>
                <input
                  type="password"
                  placeholder="********"
                  {...register("currentPasswordConfirm")}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/20 dark:text-white dark:focus:border-cyan-300"
                />
                {errors.currentPasswordConfirm && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.currentPasswordConfirm.message}
                  </p>
                )}
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">รหัสใหม่</label>
                <input
                  type="password"
                  placeholder="********"
                  {...register("newPassword")}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/20 dark:text-white dark:focus:border-cyan-300"
                />
                {errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm new password */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">ยืนยันรหัสใหม่</label>
                <input
                  type="password"
                  placeholder="********"
                  {...register("newPasswordConfirm")}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/20 dark:text-white dark:focus:border-cyan-300"
                />
                {errors.newPasswordConfirm && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.newPasswordConfirm.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 h-11 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all dark:border-cyan-400/20 dark:text-white dark:hover:bg-gray-800/60"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={isSubmitting}
                  className={`px-6 h-11 rounded-xl text-gray-900 dark:text-white font-bold transition-all duration-300 shadow-xl ${
                    isSubmitting
                      ? "bg-gradient-to-r from-cyan-700 to-blue-700 opacity-60 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50"
                  }`}
                >
                  {isSubmitting ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}













