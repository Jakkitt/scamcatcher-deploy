// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, LogIn, UserPlus } from "lucide-react";
import { t } from "../i18n/strings";
import { requestPasswordReset } from "../services/auth";

export default function ForgotPassword() {
  const copy = t("auth.forgot") || {};
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // '', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus("");

    if (!email.trim()) {
      setMessage(
        copy.emailRequired ||
          t("auth.login.errors.emailRequired", "กรุณากรอกอีเมล")
      );
      setStatus("error");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email });
      setStatus("success");
      setMessage(
        copy.success ||
          t(
            "auth.forgot.success",
            "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว โปรดตรวจสอบกล่องอีเมลหรือสแปม"
          )
      );
    } catch (err) {
      setStatus("error");
      const friendly =
        err?.message === "VITE_API_BASE_URL is not set"
          ? t(
              "auth.login.errors.notReady",
              "ระบบยังไม่พร้อมใช้งาน: โปรดตั้งค่า VITE_API_BASE_URL ในไฟล์ .env แล้วรันใหม่"
            )
          : err?.message;

      setMessage(
        friendly ||
          copy.genericError ||
          t("auth.forgot.genericError", "ไม่สามารถส่งคำขอรีเซ็ตได้")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageColor =
    status === "error"
      ? "text-rose-500"
      : status === "success"
      ? "text-emerald-500"
      : "opacity-0";

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/cyber_circuit_bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-10 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 dark:from-black/90 dark:via-black/50 dark:to-black/90" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
        <div className="w-full max-w-md mx-4 my-12">
          {/* การ์ดหลัก: สไตล์เดียวกับ Login */}
          <div className="rounded-3xl p-10 sm:p-12 border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                          dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {copy.title || "ลืมรหัสผ่าน"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {copy.subtitle ||
                  "กรอกอีเมลที่ใช้สมัครสมาชิก เพื่อรับลิงก์รีเซ็ตรหัสผ่าน"}
              </p>
            </div>

            {/* แถบแสดงข้อความผลลัพธ์ */}
            <div className="h-5 text-center text-sm mb-4">
              <span className={messageColor}>{message || "placeholder"}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-slate-200">
                  {copy.emailLabel || "อีเมล"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={copy.emailPlaceholder || "your@email.com"}
                    className="w-full h-12 pl-12 pr-4 rounded-xl
                               bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                               focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                </div>
              </div>

              {/* ปุ่มส่งลิงก์รีเซ็ต */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                           bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                           text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  copy.submitting || "กำลังส่ง..."
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {copy.submit || "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  {copy.divider || "ตัวเลือกอื่น"}
                </span>
              </div>
            </div>

            {/* ปุ่มลัด Login / Register */}
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full h-11 rounded-xl font-semibold border border-slate-300 text-slate-800 hover:border-sky-500 hover:bg-sky-50
                           flex items-center justify-center gap-2 transition-all
                           dark:border-slate-600 dark:text-white dark:hover:border-sky-400 dark:hover:bg-slate-900/60"
              >
                <LogIn className="w-5 h-5" />
                {copy.backToLogin || "ย้อนกลับไปเข้าสู่ระบบ"}
              </Link>
              <Link
                to="/register"
                className="w-full h-11 rounded-xl font-semibold border border-slate-300 text-slate-800 hover:border-sky-500 hover:bg-sky-50
                           flex items-center justify-center gap-2 transition-all
                           dark:border-slate-600 dark:text-white dark:hover:border-sky-400 dark:hover:bg-slate-900/60"
              >
                <UserPlus className="w-5 h-5" />
                {copy.registerCta || "สมัครสมาชิก"}
              </Link>
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">
              {copy.notice ||
                "หากไม่พบอีเมล กรุณาตรวจสอบสแปมหรือรอประมาณ 1–2 นาที"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
