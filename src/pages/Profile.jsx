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
      dob: user?.dob ? (() => { try { return new Date(user.dob).toISOString().slice(0, 10); } catch { return ""; } })() : "",
    },
  });

  React.useEffect(() => {
    reset({
      username: user?.username || "",
      gender: user?.gender || "",
      dob: user?.dob ? (() => { try { return new Date(user.dob).toISOString().slice(0, 10); } catch { return ""; } })() : "",
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
            <div className="w-full flex items-center gap-2 bg-white border border-gray-200 shadow-lg dark:bg-[#08162c]/80 dark:border-cyan-400/30 rounded-2xl p-2">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex-1 text-center h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-black text-white shadow-lg shadow-black/30 font-semibold dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 dark:shadow-cyan-500/30"
                        : "text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-800/50"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:bg-[#061427]/90 dark:text-white dark:border-cyan-400/30 dark:shadow-[0_25px_80px_rgba(6,182,212,0.25)]">
            <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t("profilePage.title")}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{t("profilePage.usernameLabel")}</label>
                <input
                  {...register("username")}
                  placeholder={t("profilePage.usernamePlaceholder")}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{t("profilePage.genderLabel")}</label>
                <select
                  {...register("gender")}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none appearance-none pr-10 bg-no-repeat bg-[length:16px_16px] bg-[right_1rem_center] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%2306b6d4%22 stroke-width=%222%22%3E%3Cpath d=%22M6 8l4 4 4-4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E')] dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
                >
                  <option value="">{t("profilePage.genderPlaceholder")}</option>
                  <option value="male">{t("profilePage.genderOptions.male")}</option>
                  <option value="female">{t("profilePage.genderOptions.female")}</option>
                  <option value="other">{t("profilePage.genderOptions.other")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{t("profilePage.dobLabel")}</label>
                <input
                  type="date"
                  {...register("dob")}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-black text-white font-semibold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gradient-to-r dark:from-cyan-400 dark:via-sky-500 dark:to-blue-500 dark:shadow-cyan-500/30 dark:hover:shadow-cyan-500/50 dark:hover:from-cyan-300 dark:hover:via-sky-400 dark:hover:to-blue-400"
                >
                  {isSubmitting ? t("profilePage.saving") : t("profilePage.save")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
