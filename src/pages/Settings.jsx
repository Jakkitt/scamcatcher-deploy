// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileSidebar from "../components/ProfileSidebar";
import { useTheme } from "../contexts/ThemeContext";
import { t } from "../i18n/strings";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [prefTheme, setPrefTheme] = useState(theme || "system");
  const [saving, setSaving] = useState(false);

  useEffect(() => setPrefTheme(theme || "system"), [theme]);

  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setTheme(prefTheme);
    toast.success(t("settingsPage.saved"));
    setSaving(false);
  };

  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ left: "10%", top: "20%" }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl animate-pulse" style={{ right: "10%", bottom: "20%", animationDelay: "1s" }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-950 via-transparent opacity-70" />
      </div>

      <main className="container relative z-10 py-12 min-h-[calc(100vh-160px)] grid md:grid-cols-3 gap-8">
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
            <h1 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{t("settingsPage.title")}</h1>

            <div className="space-y-4">
              <div className="font-medium text-gray-600 dark:text-cyan-300">{t("settingsPage.themeLabel")}</div>
              <div className="flex flex-nowrap items-center gap-6 text-gray-600 dark:text-gray-300">
                {["light", "dark", "system"].map((mode) => (
                  <label
                    key={mode}
                    className={`inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      prefTheme === mode ? "text-gray-900 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={mode}
                      checked={prefTheme === mode}
                      onChange={() => setPrefTheme(mode)}
                      className="accent-black dark:accent-white"
                    />
                    <span>
                      {mode === "light"
                        ? t("settingsPage.options.light")
                        : mode === "dark"
                        ? t("settingsPage.options.dark")
                        : t("settingsPage.options.system")}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-6">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-black text-white font-semibold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gradient-to-r dark:from-cyan-400 dark:via-sky-500 dark:to-blue-500 dark:shadow-cyan-500/30 dark:hover:shadow-cyan-500/50 dark:hover:from-cyan-300 dark:hover:via-sky-400 dark:hover:to-blue-400"
                >
                  {saving ? t("settingsPage.saving") : t("settingsPage.save")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
