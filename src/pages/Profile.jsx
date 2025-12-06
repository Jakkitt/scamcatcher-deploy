// src/pages/Profile.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { t } from "../i18n/strings";

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
      dob: user?.dob
        ? (() => {
            try {
              return new Date(user.dob).toISOString().slice(0, 10);
            } catch {
              return "";
            }
          })()
        : "",
    },
  });

  React.useEffect(() => {
    reset({
      username: user?.username || "",
      gender: user?.gender || "",
      dob: user?.dob
        ? (() => {
            try {
              return new Date(user.dob).toISOString().slice(0, 10);
            } catch {
              return "";
            }
          })()
        : "",
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 150));
    try {
      await updateUser?.(data);
      toast.success(t("profilePage.toastSaved"));
    } catch (e) {
      toast.error(e?.message || t("profilePage.toastError"));
    }
  };

  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];

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
          {/* Tabs การนำทางโปรไฟล์ */}
          <div className="mb-6">
            <div className="w-full flex items-center gap-2 rounded-2xl p-2 bg-white/95 border border-slate-200/80 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur
                            dark:bg-slate-900/80 dark:border-white/10 dark:shadow-[0_20px_60px_rgba(15,23,42,0.9)]">
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

          {/* การ์ดฟอร์มโปรไฟล์ */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white/95 text-slate-900 border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                          dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:text-white dark:border-white/10 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <h1 className="text-xl sm:text-2xl font-bold mb-5 text-slate-900 dark:text-white">
              {t("profilePage.title")}
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid md:grid-cols-2 gap-4 md:gap-6"
            >
              <div>
                <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                  {t("profilePage.usernameLabel")}
                </label>
                <input
                  {...register("username")}
                  placeholder={t("profilePage.usernamePlaceholder")}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                  {t("profilePage.genderLabel")}
                </label>
                <select
                  {...register("gender")}
                  className="w-full h-12 px-4 rounded-xl appearance-none pr-10
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             bg-no-repeat bg-[length:16px_16px] bg-[right_1rem_center]
                             bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%2306b6d4%22 stroke-width=%222%22%3E%3Cpath d=%22M6 8l4 4 4-4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')]
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                >
                  <option value="">
                    {t("profilePage.genderPlaceholder")}
                  </option>
                  <option value="male">
                    {t("profilePage.genderOptions.male")}
                  </option>
                  <option value="female">
                    {t("profilePage.genderOptions.female")}
                  </option>
                  <option value="other">
                    {t("profilePage.genderOptions.other")}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                  {t("profilePage.dobLabel")}
                </label>
                <input
                  type="date"
                  {...register("dob")}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl font-semibold flex items-center justify-center
                             bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                             text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t("profilePage.saving")
                    : t("profilePage.save")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
