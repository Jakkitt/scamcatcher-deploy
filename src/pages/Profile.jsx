// src/pages/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

function CapsuleTab({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-6 py-2 rounded-full text-sm transition-colors font-medium",
          isActive
            ? "bg-white text-gray-900 shadow"
            : "text-gray-600 hover:text-gray-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { username: "", gender: "", dob: "" },
  });

  // คลิกรูปเพื่อเปลี่ยน
  const fileRef = useRef(null);
  const onPick = () => fileRef.current?.click();
  const onAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("โปรดเลือกรูปภาพเท่านั้น");
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: reader.result });
      toast.success("อัปเดตรูปโปรไฟล์แล้ว");
    };
    reader.readAsDataURL(f);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      if (user) {
        reset({
          username: user.username || "",
          gender: user.gender || "",
          dob: user.dob || "",
        });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [user, reset]);

  if (!user) {
    return (
      <div className="container py-12 text-center">กรุณาเข้าสู่ระบบก่อน</div>
    );
  }

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 400));
    updateUser({
      username: data.username?.trim() || user.username || "",
      gender: data.gender || "",
      dob: data.dob || "",
    });
    toast.success("บันทึกข้อมูลโปรไฟล์แล้ว");
  };

  const displayName = user.username || user.email || "ผู้ใช้";

  const handleChangePassword = () => toast("ฟังก์ชันเปลี่ยนรหัสยังไม่เปิดใช้งาน");
  const handleDeleteAccount = () => {
    if (confirm("คุณต้องการลบบัญชีใช่ไหม?")) {
      toast.success("บัญชีถูกลบ (จำลอง)");
    }
  };

  return (
    <main className="container py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* ✅ ฝั่งซ้าย */}
        <aside className="border rounded-xl bg-white dark:bg-gray-900 p-6 flex flex-col items-center">
          <button
            type="button"
            onClick={onPick}
            className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:opacity-90 transition"
            title="คลิกเพื่อเปลี่ยนรูป"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                รูปภาพ
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
          />

          <h2 className="mt-4 font-bold text-lg">{displayName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </p>

          {/* 🔹 การตั้งค่าบัญชี */}
          <div className="mt-8 w-full text-center space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
              การตั้งค่าบัญชี
            </h3>
            <button
              onClick={handleChangePassword}
              className="w-full border rounded-lg py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              เปลี่ยนรหัสผ่าน
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 text-white rounded-lg py-2 text-sm hover:bg-red-700"
            >
              ลบบัญชี
            </button>
          </div>
        </aside>

        {/* ✅ ฝั่งขวา */}
        <section className="lg:col-span-2">
          {/* เมนูแคปซูลด้านบน */}
          <div className="w-full flex justify-center mb-5">
            <div className="w-full max-w-2xl bg-gray-100 rounded-full p-1 flex items-center justify-center">
              <CapsuleTab to="/profile" label="โปรไฟล์" />
              <CapsuleTab to="/reports" label="รายงานของฉัน" />
              <CapsuleTab to="/settings" label="การตั้งค่า" />
            </div>
          </div>

          {/* ฟอร์มโปรไฟล์ */}
          <div className="border rounded-xl bg-white dark:bg-gray-900 p-6">
            <h1 className="text-xl font-bold mb-4">แก้ไขข้อมูลส่วนตัว</h1>

            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    ชื่อผู้ใช้
                  </label>
                  <input {...register("username")} placeholder="เช่น สมชาย ใจดี" />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">เพศ</label>
                  <select {...register("gender")}>
                    <option value="">เลือกเพศ</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่น ๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    วันเกิด
                  </label>
                  <input type="date" {...register("dob")} />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
                  >
                    {isSubmitting ? "กำลังบันทึก…" : "บันทึก"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
