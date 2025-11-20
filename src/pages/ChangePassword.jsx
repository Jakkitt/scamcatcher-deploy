// src/pages/ChangePassword.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ShieldCheck, KeyRound, ArrowRightCircle, Send, CheckCircle2, Eye, EyeOff } from "lucide-react";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { changePassword, requestChangePasswordPin } from "../services/auth";
import { t } from "../i18n/strings";

const schema = z
  .object({
    email: z.string().email(),
    currentPassword: z.string().min(6, t("auth.changePassword.schema.currentMin6")),
    currentPasswordConfirm: z.string().min(6, t("auth.changePassword.schema.currentConfirmMin6")),
    newPassword: z.string().min(6, t("auth.changePassword.schema.newMin6")),
    newPasswordConfirm: z.string().min(6, t("auth.changePassword.schema.newConfirmMin6")),
    pin: z
      .string()
      .min(6, t("auth.changePassword.errors.pinInvalid"))
      .max(6, t("auth.changePassword.errors.pinInvalid"))
      .regex(/^\d+$/, t("auth.changePassword.errors.pinInvalid")),
  })
  .refine((v) => v.currentPassword === v.currentPasswordConfirm, {
    path: ["currentPasswordConfirm"],
    message: t("auth.changePassword.errors.mismatchCurrent"),
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: t("auth.changePassword.errors.mismatchNew"),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ["newPassword"],
    message: t("auth.changePassword.errors.samePassword"),
  });

export default function ChangePassword() {
  const { user, token } = useAuth();
  const [sendingPin, setSendingPin] = React.useState(false);
  const [show, setShow] = React.useState({
    current: false,
    currentConfirm: false,
    next: false,
    nextConfirm: false,
  });
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
      pin: "",
    },
  });

  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];

  const onSubmit = async (data) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword, pin: data.pin }, token);
      toast.success(t("auth.changePassword.success"));
      navigate("/settings");
    } catch (e) {
      const fields = e?.data?.error?.fields || {};
      const mapMsg = (code) =>
        ({
          min_8: t("auth.changePassword.errors.min8"),
          max_72: t("auth.changePassword.errors.max72"),
          max_bytes_72: t("auth.changePassword.errors.maxBytes72"),
        }[code] || t("auth.changePassword.invalid"));
      if (e?.status === 400 && fields) {
        if (fields.currentPassword) {
          setError("currentPassword", { type: "server", message: mapMsg(fields.currentPassword) });
        }
        if (fields.newPassword) {
          setError("newPassword", { type: "server", message: mapMsg(fields.newPassword) });
        }
        toast.error(t("auth.changePassword.invalid"));
      } else if (e?.status === 401 && e?.message?.includes("PIN")) {
        setError("pin", { type: "server", message: t("auth.changePassword.errors.pinInvalid") });
        toast.error(t("auth.changePassword.errors.pinInvalid"));
      } else {
        toast.error(e?.message || t("auth.changePassword.errors.generic"));
      }
    }
  };

  const onSendPin = async () => {
    try {
      setSendingPin(true);
      await requestChangePasswordPin();
      toast.success(t("auth.changePassword.pinSent"));
    } catch (err) {
      toast.error(err?.message || t("auth.changePassword.pinSendError"));
    } finally {
      setSendingPin(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]?.message}</p> : null;

  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ left: "10%", top: "20%" }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl animate-pulse" style={{ right: "10%", bottom: "20%", animationDelay: "1s" }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-950 via-transparent opacity-70" />
      </div>
      <main className="container relative z-10 py-8 grid md:grid-cols-3 gap-8">
        <ProfileSidebar />

        <section className="md:col-span-2">
          <div className="mb-6">
            <div className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-lg dark:bg-[#08162c]/80 dark:border-cyan-400/30">
              {tabs.map((tab) => (
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

          <div className="bg-[#0d1b2f]/90 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-cyan-400/25 dark:shadow-[0_25px_80px_rgba(6,182,212,0.25)]">
            <h1 className="text-xl font-bold mb-6">{t("auth.changePassword.title")}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm text-cyan-200 mb-2">{t("auth.changePassword.emailLabel")}</label>
                <div className="relative h-12">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  <input
                    {...register("email")}
                    disabled
                    className="w-full h-full pl-12 pr-12 rounded-xl bg-[#0b1525] border border-gray-600 text-gray-300 placeholder-gray-500 outline-none cursor-not-allowed opacity-90 focus:ring-0 focus:border-gray-600"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cyan-200 mb-2">{t("auth.changePassword.currentLabel")}</label>
                  <div className="relative h-12">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                    <input
                      {...register("currentPassword")}
                      type={show.current ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl bg-[#11233c] border border-cyan-400/40 text-white placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                      onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                    >
                      {show.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {renderError("currentPassword")}
                </div>
                <div>
                  <label className="block text-sm text-cyan-200 mb-2">{t("auth.changePassword.currentConfirmLabel")}</label>
                  <div className="relative h-12">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                    <input
                      {...register("currentPasswordConfirm")}
                      type={show.currentConfirm ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl bg-[#11233c] border border-cyan-400/40 text-white placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                      onClick={() => setShow((s) => ({ ...s, currentConfirm: !s.currentConfirm }))}
                    >
                      {show.currentConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {renderError("currentPasswordConfirm")}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cyan-200 mb-2">{t("auth.changePassword.newLabel")}</label>
                  <div className="relative h-12">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                    <input
                      {...register("newPassword")}
                      type={show.next ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl bg-[#11233c] border border-cyan-400/40 text-white placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                      onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                    >
                      {show.next ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {renderError("newPassword")}
                </div>
                <div>
                  <label className="block text-sm text-cyan-200 mb-2">{t("auth.changePassword.newConfirmLabel")}</label>
                  <div className="relative h-12">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                    <input
                      {...register("newPasswordConfirm")}
                      type={show.nextConfirm ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl bg-[#11233c] border border-cyan-400/40 text-white placeholder-gray-400 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                      onClick={() => setShow((s) => ({ ...s, nextConfirm: !s.nextConfirm }))}
                    >
                      {show.nextConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {renderError("newPasswordConfirm")}
                </div>
              </div>

              <div className="rounded-xl border border-cyan-400/40 bg-[#0f223a] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-400/15 flex items-center justify-center text-cyan-300">
                    <ArrowRightCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t("auth.changePassword.pinLabel")}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {t("auth.changePassword.pinPlaceholder")} • กรุณากรอกรหัสที่ได้รับทางอีเมลเพื่อยืนยันการเปลี่ยนรหัสผ่าน
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 h-12">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                    <input
                      {...register("pin")}
                      inputMode="numeric"
                      maxLength={6}
                      type="text"
                      onInput={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                        e.target.value = digits;
                      }}
                      className="w-full h-full pl-12 pr-4 rounded-xl bg-[#11233c] border border-cyan-400/40 text-white placeholder-gray-400 outline-none"
                      placeholder={t("auth.changePassword.pinPlaceholder")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onSendPin}
                    disabled={sendingPin}
                    className="h-12 px-4 min-w-[160px] rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sendingPin ? t("auth.changePassword.sendingPin") : t("auth.changePassword.sendPin")}
                  </button>
                </div>
                {renderError("pin")}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-12 flex-1 rounded-xl border border-gray-600 text-gray-200"
                >
                  {t("auth.changePassword.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 flex-1 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t("auth.changePassword.submitting") : t("auth.changePassword.submit")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
