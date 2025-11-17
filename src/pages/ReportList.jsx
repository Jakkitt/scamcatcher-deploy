import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import { listMyReports, removeReport } from "../services/reports";
import toast from "react-hot-toast";
import { t } from "../i18n/strings";

export default function ReportList() {
  const copy = t("reportListPage") || {};
  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];
  const [items, setItems] = useState(null);
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await listMyReports();
      if (alive) setItems(data);
    })();
    return () => { alive = false; };
  }, []);

  const onDelete = async (id) => {
    if (!confirm(t("reports.deleteConfirm"))) return;
    setDeleting(String(id));
    try {
      await removeReport(id);
      setItems((prev) => (prev || []).filter((x) => String(x.id) !== String(id)));
      toast.success(t("reports.deleteSuccess"));
    } catch (e) {
      toast.error(e?.message || t("reports.deleteError"));
    } finally {
      setDeleting("");
    }
  };

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
            <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{copy.heading}</h1>

            {!items ? (
              <div className="text-sm text-gray-400">{copy.loading}</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-300">
                {copy.empty}{" "}
                <a href="/report" className="underline text-gray-900 font-semibold ml-1 dark:text-white">
                  {copy.emptyLink}
                </a>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((r) => (
                  <li
                    key={r.id}
                    className="border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4 bg-white dark:bg-[#0a1c32]/90 dark:border-cyan-400/30 dark:shadow-[0_15px_50px_rgba(6,182,212,0.25)]"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{r.name || t('common.unknown')}</div>
                      <div className="text-sm text-gray-400">
                        {copy.cardCategory}: {r.category || "-"} · {copy.cardDate}{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                          r.status === 'approved'
                            ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                            : r.status === 'pending'
                            ? 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-200 dark:border-amber-500/40 dark:bg-amber-500/10'
                            : 'text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-200 dark:border-rose-500/40 dark:bg-rose-500/10'
                        }`}
                      >
                        {t(`admin.statuses.${r.status}`) || r.status}
                      </span>
                      <a
                        href={`/reports/${r.id}`}
                        className="inline-flex items-center justify-center px-3 py-1 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-100 transition dark:border-white/40 dark:bg-white/10 dark:text-cyan-200 dark:hover:bg-white/20"
                        title={t('reportListPage.viewDetail') || 'ดูรายละเอียด'}
                        aria-label={t('reportListPage.viewDetail') || 'ดูรายละเอียด'}
                      >
                        <svg
                          viewBox="0 0 64 64"
                          className="w-5 h-5 text-gray-800 dark:hidden"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M32 14C16 14 4 32 4 32s12 18 28 18 28-18 28-18-12-18-28-18zm0 30a12 12 0 1112-12 12 12 0 01-12 12zm0-18a6 6 0 106 6 6 6 0 00-6-6z" />
                        </svg>
                        <svg
                          viewBox="0 0 64 64"
                          className="w-5 h-5 hidden dark:block text-cyan-300"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M32 14C16 14 4 32 4 32s12 18 28 18 28-18 28-18-12-18-28-18zm0 30a12 12 0 1112-12 12 12 0 01-12 12zm0-18a6 6 0 106 6 6 6 0 00-6-6z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => onDelete(r.id)}
                        disabled={deleting === String(r.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                          deleting === String(r.id)
                            ? "bg-red-500/60 text-gray-900 dark:text-white cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-gray-900 dark:text-white shadow-md shadow-red-500/20"
                        }`}
                      >
                        {deleting === String(r.id) ? copy.deleting : copy.delete}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
