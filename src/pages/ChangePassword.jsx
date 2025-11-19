// src/pages/ChangePassword.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { changePassword } from "../services/auth";
import { t } from "../i18n/strings";

const schema = z
  .object({
    email: z.string().email(),
    currentPassword: z.string().min(6, t("auth.changePassword.schema.currentMin6")),
    currentPasswordConfirm: z.string().min(6, t("auth.changePassword.schema.currentConfirmMin6")),
    newPassword: z.string().min(6, t("auth.changePassword.schema.newMin6")),
    newPasswordConfirm: z.string().min(6, t("auth.changePassword.schema.newConfirmMin6")),
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

  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];

  const onSubmit = async (data) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }, token);
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
      } else {
        toast.error(e?.message || t("auth.changePassword.errors.generic"));
      }
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

          <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:bg-[#061427]/90 dark:text-white dark:border-cyan-400/30 dark:shadow-[0_25px_80px_rgba(6,182,212,0.25)]">
            <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t("auth.changePassword.title")}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">{t("auth.changePassword.emailLabel")}</label>
                <input
                  {...register("email")}
                  disabled
                  className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-300 text-gray-900 dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">{t("auth.changePassword.currentLabel")}</label>
                  <input
                    {...register("currentPassword")}
                    type="password"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white"
                  />
                  {renderError("currentPassword")}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">{t("auth.changePassword.currentConfirmLabel")}</label>
                  <input
                    {...register("currentPasswordConfirm")}
                    type="password"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white"
                  />
                  {renderError("currentPasswordConfirm")}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">{t("auth.changePassword.newLabel")}</label>
                  <input
                    {...register("newPassword")}
                    type="password"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white"
                  />
                  {renderError("newPassword")}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1">{t("auth.changePassword.newConfirmLabel")}</label>
                  <input
                    {...register("newPasswordConfirm")}
                    type="password"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white"
                  />
                  {renderError("newPasswordConfirm")}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-12 flex-1 rounded-xl border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {t("auth.changePassword.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 flex-1 rounded-xl bg-black text-white font-semibold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gradient-to-r dark:from-cyan-400 dark:via-sky-500 dark:to-blue-500 dark:shadow-cyan-500/30 dark:hover:shadow-cyan-500/50 dark:hover:from-cyan-300 dark:hover:via-sky-400 dark:hover:to-blue-400"
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
