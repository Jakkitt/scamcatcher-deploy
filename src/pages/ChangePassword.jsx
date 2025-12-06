// src/pages/ChangePassword.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  ShieldCheck,
  KeyRound,
  ArrowRightCircle,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { changePassword, requestChangePasswordPin } from "../services/auth";
import { t } from "../i18n/strings";

const schema = z
  .object({
    email: z.string().email(),
    currentPassword: z.string().min(6, t("auth.changePassword.schema.currentMin6")),
    currentPasswordConfirm: z
      .string()
      .min(6, t("auth.changePassword.schema.currentConfirmMin6")),
    newPassword: z.string().min(6, t("auth.changePassword.schema.newMin6")),
    newPasswordConfirm: z
      .string()
      .min(6, t("auth.changePassword.schema.newConfirmMin6")),
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
      await changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          pin: data.pin,
        },
        token,
      );
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
          setError("currentPassword", {
            type: "server",
            message: mapMsg(fields.currentPassword),
          });
        }
        if (fields.newPassword) {
          setError("newPassword", {
            type: "server",
            message: mapMsg(fields.newPassword),
          });
        }
        toast.error(t("auth.changePassword.invalid"));
      } else if (e?.status === 401 && e?.message?.includes("PIN")) {
        setError("pin", {
          type: "server",
          message: t("auth.changePassword.errors.pinInvalid"),
        });
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
    errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{errors[field]?.message}</p>
    ) : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black dark:text-gray-100">
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl" style={{ left: '8%', top: '15%' }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl" style={{ right: '8%', bottom: '20%' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <main className="container mx-auto px-4 md:px-6 py-10 relative z-10 grid md:grid-cols-3 gap-8">
        <ProfileSidebar />

        <section className="md:col-span-2">
          {/* Tabs เหมือนหน้า Settings */}
          <div className="mb-6">
            <div
              className="w-full flex items-center gap-2 rounded-2xl p-2 bg-white/95 border border-slate-200/80
                         shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur
                         dark:bg-slate-900/80 dark:border-white/10 dark:shadow-[0_20px_60px_rgba(15,23,42,0.9)]"
            >
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex-1 text-center h-11 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* การ์ดเปลี่ยนรหัสผ่าน – ธีมเดียวกับ Settings card */}
          <div
            className="rounded-3xl p-6 sm:p-8 bg-white/95 text-slate-900 border border-slate-200/80
                       shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                       dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950
                       dark:text-white dark:border-white/10 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
          >
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              {t("auth.changePassword.title")}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-sky-200 mb-2">
                  {t("auth.changePassword.emailLabel")}
                </label>
                <div className="relative h-12">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 dark:text-emerald-300" />
                  <input
                    {...register("email")}
                    disabled
                    className="w-full h-full pl-12 pr-12 rounded-xl
                               bg-slate-100 border border-slate-300 text-slate-600
                               placeholder-slate-400 outline-none cursor-not-allowed opacity-90
                               focus:ring-0 focus:border-slate-300
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Current password */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-sky-200 mb-2">
                    {t("auth.changePassword.currentLabel")}
                  </label>
                  <div className="relative h-12">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                    <input
                      {...register("currentPassword")}
                      type={show.current ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl
                                 bg-white border border-slate-300 text-slate-900 placeholder-slate-400
                                 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none
                                 dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"
                      onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                    >
                      {show.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {renderError("currentPassword")}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-sky-200 mb-2">
                    {t("auth.changePassword.currentConfirmLabel")}
                  </label>
                  <div className="relative h-12">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                    <input
                      {...register("currentPasswordConfirm")}
                      type={show.currentConfirm ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl
                                 bg-white border border-slate-300 text-slate-900 placeholder-slate-400
                                 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none
                                 dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"
                      onClick={() =>
                        setShow((s) => ({ ...s, currentConfirm: !s.currentConfirm }))
                      }
                    >
                      {show.currentConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {renderError("currentPasswordConfirm")}
                </div>
              </div>

              {/* New password */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-sky-200 mb-2">
                    {t("auth.changePassword.newLabel")}
                  </label>
                  <div className="relative h-12">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                    <input
                      {...register("newPassword")}
                      type={show.next ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl
                                 bg-white border border-slate-300 text-slate-900 placeholder-slate-400
                                 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none
                                 dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"
                      onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                    >
                      {show.next ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {renderError("newPassword")}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-sky-200 mb-2">
                    {t("auth.changePassword.newConfirmLabel")}
                  </label>
                  <div className="relative h-12">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                    <input
                      {...register("newPasswordConfirm")}
                      type={show.nextConfirm ? "text" : "password"}
                      className="w-full h-full pl-12 pr-10 rounded-xl
                                 bg-white border border-slate-300 text-slate-900 placeholder-slate-400
                                 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none
                                 dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"
                      onClick={() =>
                        setShow((s) => ({ ...s, nextConfirm: !s.nextConfirm }))
                      }
                    >
                      {show.nextConfirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {renderError("newPasswordConfirm")}
                </div>
              </div>

              {/* PIN / OTP box */}
              <div
                className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4
                           dark:border-sky-500/40 dark:bg-slate-900/70"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-300">
                    <ArrowRightCircle className="w-5 h-5" />
                  </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t("auth.changePassword.pinLabel")}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 dark:text-slate-300">
                      {t("auth.changePassword.pinPlaceholder")} • กรุณากรอกรหัส OTP ที่ได้รับทางอีเมลเพื่อยืนยันการเปลี่ยนรหัสผ่าน
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 h-12">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500 dark:text-sky-300" />
                    <input
                      {...register("pin")}
                      inputMode="numeric"
                      maxLength={6}
                      type="text"
                      onInput={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                        e.target.value = digits;
                      }}
                      className="w-full h-full pl-12 pr-4 rounded-xl
                                 bg-white border border-slate-300 text-slate-900 placeholder-slate-400
                                 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none
                                 dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                      placeholder={t("auth.changePassword.pinPlaceholder")}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onSendPin}
                    disabled={sendingPin}
                    className="h-12 px-4 min-w-[160px] rounded-xl
                               bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-semibold
                               shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                               disabled:opacity-60 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sendingPin
                      ? t("auth.changePassword.sendingPin")
                      : t("auth.changePassword.sendPin")}
                  </button>
                </div>
                {renderError("pin")}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-12 flex-1 rounded-xl border border-slate-300 text-slate-700 bg-white
                             hover:bg-slate-50 transition
                             dark:bg-transparent dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                >
                  {t("auth.changePassword.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 flex-1 rounded-xl font-semibold
                             bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                             text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t("auth.changePassword.submitting")
                    : t("auth.changePassword.submit")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
