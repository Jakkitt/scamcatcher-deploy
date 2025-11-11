// src/pages/Profile.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      gender: user?.gender || "",
      dob: user?.dob ? (()=>{ try{ return new Date(user.dob).toISOString().slice(0,10); }catch{ return "" } })() : "",
    },
  });

  React.useEffect(() => {
    reset({
      username: user?.username || "",
      gender: user?.gender || "",
      dob: user?.dob ? (()=>{ try{ return new Date(user.dob).toISOString().slice(0,10); }catch{ return "" } })() : "",
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 150));
    try{
      await updateUser?.(data);
      toast.success("บันทึกโปรไฟล์แล้ว");
    }catch(e){
      toast.error(e?.message || "บันทึกไม่สำเร็จ");
    }
  };

  return (
    <main className="container py-10 grid md:grid-cols-3 gap-8">
      {/* การ์ดซ้าย: คลิกรูปเพื่อเปลี่ยนรูปได้ */}
      <ProfileSidebar />

      {/* ด้านขวา */}
      <section className="md:col-span-2">
        {/* แท็บด้านบนให้เหมือนหน้าที่เหลือ */}
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

        {/* ฟอร์มแก้ไขข้อมูลส่วนตัว */}
        <div className="border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-800 p-6">
          <h1 className="text-xl font-bold mb-4">แก้ไขข้อมูลส่วนตัว</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">ชื่อผู้ใช้</label>
              <input
                {...register("username")}
                placeholder="ชื่อที่ใช้แสดง"
                className="w-full border rounded-lg h-10 px-3"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">เพศ</label>
              <select
                {...register("gender")}
                className="w-full border rounded-lg h-10 px-3 appearance-none pr-8 bg-no-repeat bg-[length:16px_16px] bg-[right_0.75rem_center] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%236B7280%22 stroke-width=%222%22%3E%3Cpath d=%22M6 8l4 4 4-4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%23D1D5DB%22 stroke-width=%222%22%3E%3Cpath d=%22M6 8l4 4 4-4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')]"
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">วันเกิด</label>
              <input
                type="date"
                {...register("dob")}
                className="w-full border rounded-lg h-10 px-3"
              />
            </div>

            <div className="md:col-span-2">
              <button
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-black text-white disabled:opacity-60"
              >
                {isSubmitting ? "กำลังบันทึก…" : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
