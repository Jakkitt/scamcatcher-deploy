// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { Lock, Mail, LogIn, UserPlus } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { t } from "../i18n/strings";

export default function Login() {
  const loginCopy = t("auth.login") || {};
  const errorCopy = loginCopy.errors || {};
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/profile";

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const normalizeError = (err) => {
    const raw = String(err?.message || "");
    if (!raw && !err?.status) return errorCopy.generic;
    if (/invalid\s*credentials/i.test(raw) || /unauthorized/i.test(raw)) return errorCopy.invalidCredentials;
    if (raw.includes("VITE_API_BASE_URL")) return errorCopy.notReady || t("common.notReady");
    return raw || errorCopy.generic;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
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
        if (fields.email) setError(fieldMap[fields.email] || errorCopy.invalidInput);
        else if (fields.password) setError(fieldMap[fields.password] || errorCopy.invalidInput);
        else setError(errorCopy.invalidInput);
        return;
      }
      setError(normalizeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          style={{ left: `${mousePos.x / 20}px`, top: `${mousePos.y / 20}px`, transition: "all 0.3s ease-out" }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl"
          style={{ right: `${mousePos.x / 30}px`, bottom: `${mousePos.y / 30}px`, transition: "all 0.4s ease-out" }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-3xl p-10 sm:p-12 border-4 border-cyan-400/20 bg-gradient-to-b from-gray-950/80 via-gray-950 to-black shadow-[0_20px_80px_rgba(6,182,212,0.25)]">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-3">{loginCopy.title || t("auth.login.title")}</h1>
            <p className="text-sm text-gray-400">{loginCopy.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="h-5 text-center text-sm">
              <span className={error ? "text-red-400" : "opacity-0"}>{error || "placeholder"}</span>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-cyan-300">{loginCopy.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-cyan-300">{loginCopy.passwordLabel}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
                {loginCopy.forgot}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/60"
            >
              {isSubmitting ? loginCopy.submitting : (
                <>
                  <LogIn className="w-5 h-5" />
                  {loginCopy.submit}
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cyan-400/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/70 text-gray-300">{loginCopy.divider}</span>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full h-12 rounded-xl font-semibold border-2 border-cyan-400/40 hover:border-cyan-300/60 text-white flex items-center justify-center gap-2 transition-all hover:bg-cyan-400/10"
            >
              <UserPlus className="w-5 h-5" />
              {loginCopy.registerCta}
            </Link>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            {loginCopy.terms}
            <br />
            <button className="text-cyan-300 hover:underline">{loginCopy.termsLink}</button> and{" "}
            <button className="text-cyan-300 hover:underline">{loginCopy.privacyLink}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
