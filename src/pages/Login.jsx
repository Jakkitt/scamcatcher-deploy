// src/pages/Login.jsx
import React, { useState } from "react";
import { Lock, Mail, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { t } from "../i18n/strings";

export default function Login() {
  const loginCopy = t("auth.login") || {};
  const errorCopy = loginCopy.errors || {};
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/profile";

  const validateField = (name, value) => {
    const trimmed = (value || "").trim();
    let message = "";
    if (!trimmed) {
      message =
        errorCopy[name === "email" ? "emailRequired" : "passwordRequired"] ||
        errorCopy.invalidInput;
    } else if (name === "email") {
      const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailPattern.test(trimmed)) message = errorCopy.emailInvalid;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
    return !message;
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const showFieldError = (name) => touched[name] && fieldErrors[name];

  const normalizeError = (err) => {
    const raw = String(err?.message || "");
    if (!raw && !err?.status) return errorCopy.generic;
    if (/invalid\s*credentials/i.test(raw) || /unauthorized/i.test(raw))
      return errorCopy.invalidCredentials;
    if (raw.includes("VITE_API_BASE_URL"))
      return errorCopy.notReady || t("common.notReady");
    return raw || errorCopy.generic;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const nextTouched = { email: true, password: true };
    setTouched(nextTouched);
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);
    if (!emailValid || !passwordValid) {
      setIsSubmitting(false);
      return;
    }
    try {
      await login({ email: formData.email, password: formData.password });
      navigate(from, { replace: true });
    } catch (err) {
      const fields = err?.data?.error?.fields || {};
      const fieldMap = {
        invalid_email: errorCopy.emailInvalid,
        min_8: errorCopy.min8,
        max_72: errorCopy.max72,
        max_bytes_72: errorCopy.maxBytes72,
      };
      if (err?.status === 400 && fields) {
        if (fields.email)
          setError(fieldMap[fields.email] || errorCopy.invalidInput);
        else if (fields.password)
          setError(fieldMap[fields.password] || errorCopy.invalidInput);
        else setError(errorCopy.invalidInput);
        setIsSubmitting(false);
        return;
      }
      setError(normalizeError(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* พื้นหลัง: โทนใกล้ Home1 + รองรับทั้ง light / dark */}
      <div className="absolute inset-0">
        {/* texture เบา ๆ */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] dark:opacity-5" />

        {/* แสงฟุ้งด้านบน (สว่างขึ้นใน light, เข้มขึ้นใน dark) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-400/20 blur-[110px] rounded-full pointer-events-none dark:bg-blue-600/25" />

        {/* แสงฟุ้งด้านล่าง */}
        <div className="absolute bottom-0 right-0 w-[700px] h-[520px] bg-cyan-300/15 blur-[100px] rounded-full pointer-events-none dark:bg-cyan-500/15" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
        <div className="w-full max-w-md mx-4 my-12">

          {/* การ์ดล็อกอิน: light = ขาว, dark = gradient เข้ม */}
          <div className="rounded-3xl p-10 sm:p-12 border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                          dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {loginCopy.title || t("auth.login.title")}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loginCopy.subtitle ||
                  "เข้าสู่ระบบเพื่อจัดการโปรไฟล์และติดตามรายงานของคุณ"}
              </p>
            </div>

            {/* แถบ error */}
            <div className="h-5 text-center text-sm mb-4">
              <span className={error ? "text-rose-500" : "opacity-0"}>
                {error || "placeholder"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-slate-200">
                  {loginCopy.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleFieldChange("email", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("email")}
                    placeholder="your@email.com"
                    required
                    className="w-full h-12 pl-12 pr-4 rounded-xl
                               bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                               focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                </div>
                <p className="text-xs text-rose-500 mt-1 min-h-[1rem]">
                  {showFieldError("email") ? fieldErrors.email : ""}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-slate-200">
                  {loginCopy.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("password")}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-12 pr-12 rounded-xl
                               bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                               focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-rose-500 mt-1 min-h-[1rem]">
                  {showFieldError("password") ? fieldErrors.password : ""}
                </p>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-300 dark:hover:text-sky-200 transition-colors"
                >
                  {loginCopy.forgot}
                </Link>
              </div>

              {/* ปุ่ม Login */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                           bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                           text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  loginCopy.submitting
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {loginCopy.submit}
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    {loginCopy.divider}
                  </span>
                </div>
              </div>

              {/* ปุ่มไป Register */}
              <Link
                to="/register"
                className="w-full h-12 rounded-xl font-semibold border border-slate-300 text-slate-800 hover:border-sky-500 hover:bg-sky-50
                           flex items-center justify-center gap-2 transition-all
                           dark:border-slate-600 dark:text-white dark:hover:border-sky-400 dark:hover:bg-slate-900/60"
              >
                <UserPlus className="w-5 h-5" />
                {loginCopy.registerCta}
              </Link>
            </form>

            {/* Terms */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">
              {loginCopy.terms}
              <br />
              <button className="text-sky-600 hover:underline dark:text-sky-300">
                {loginCopy.termsLink}
              </button>{" "}
              {t("common.and") || "and"}{" "}
              <button className="text-sky-600 hover:underline dark:text-sky-300">
                {loginCopy.privacyLink}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
