import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import { listMyReports, removeReport } from "../services/reports";
import toast from "react-hot-toast";
import { t } from "../i18n/strings";
import { translateCategory, translateStatus } from "../utils/translate";

export default function ReportList() {
  const copy = t("reportListPage") || {};
  const tabs = [
    { to: "/profile", label: t("tabs.profile") },
    { to: "/reports", label: t("tabs.reports") },
    { to: "/settings", label: t("tabs.settings") },
  ];
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listMyReports();
        if (!alive) return;
        setItems(data);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || copy.errorLoading || "ไม่สามารถโหลดข้อมูลได้");
        setItems([]);
      }
    })();
    return () => {
      alive = false;
    };
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

          {/* การ์ดรายการรายงาน – สไตล์เดียวกับ Settings card */}
          <div
            className="rounded-3xl p-6 sm:p-8 bg-white/95 text-slate-900 border border-slate-200/80
                       shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                       dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950
                       dark:text-white dark:border-white/10 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
          >
            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              {copy.heading}
            </h1>

            {!items ? (
              <div className="space-y-4" aria-live="polite">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse border rounded-xl p-4 space-y-3 border-slate-200/70 bg-white/90 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-sm text-rose-500">{error}</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-300">
                {copy.empty}{" "}
                <Link
                  to="/report"
                  className="underline text-slate-900 font-semibold ml-1 dark:text-white"
                >
                  {copy.emptyLink}
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((r) => (
                  <li
                    key={r.id}
                    className="border border-slate-200/80 rounded-2xl p-4 flex items-start justify-between gap-4
                               bg-white/95 shadow-sm
                               dark:bg-slate-900/80 dark:border-white/10 dark:shadow-[0_15px_50px_rgba(15,23,42,0.9)]"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {r.name ||
                          [r.firstName, r.lastName].filter(Boolean).join(" ").trim() ||
                          t("common.unknown")}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-300">
                        {copy.cardCategory}: {translateCategory(r.category)} · {copy.cardDate}{" "}
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("th-TH")
                          : "-"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                          r.status === "approved"
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                            : r.status === "pending"
                            ? "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-200 dark:border-amber-500/40 dark:bg-amber-500/10"
                            : "text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-200 dark:border-rose-500/40 dark:bg-rose-500/10"
                        }`}
                      >
                        {translateStatus(r.status)}
                      </span>
                      <button
                        onClick={() => onDelete(r.id)}
                        disabled={deleting === String(r.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                          deleting === String(r.id)
                            ? "bg-red-500/60 text-white cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
                        }`}
                      >
                        {deleting === String(r.id) ? copy.deleting : copy.delete}
                      </button>
                      <Link
                        to={`/reports/${r.id}`}
                        className="inline-flex items-center justify-center px-3 py-1 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 transition
                                   dark:border-white/40 dark:bg-white/10 dark:text-sky-200 dark:hover:bg-white/20"
                        title={t("reportListPage.viewDetail") || "ดูรายละเอียด"}
                        aria-label={t("reportListPage.viewDetail") || "ดูรายละเอียด"}
                      >
                        <svg
                          viewBox="0 0 64 64"
                          className="w-5 h-5 text-slate-800 dark:hidden"
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
                      </Link>
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
