// src/components/ExternalChecks.jsx
import React from "react";
import { t } from "../i18n/strings";

const STATUS_STYLES = {
  loading: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200",
  found: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  missing: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  error: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
};

function buildMessage(copy, result) {
  if (result.loading) return copy.loading;
  if (result.error) return result.error;
  if (result.found) {
    const countText =
      typeof copy.matches === "function" && typeof result.count === "number" && result.count > 0
        ? ` • ${copy.matches(result.count)}`
        : "";
    return `${copy.detailFound}${countText}`;
  }
  if (result.skipped && copy.skipped) return copy.skipped;
  return copy.detailMissing;
}

function Row({ title, result = {}, copy }) {
  const status = result.loading ? "loading" : result.error ? "error" : result.found ? "found" : "missing";
  const badgeLabel =
    status === "found"
      ? copy.badgeFound
      : status === "error"
      ? copy.badgeError
      : status === "loading"
      ? copy.badgeLoading
      : copy.badgeMissing;
  const badgeClass = STATUS_STYLES[status] || STATUS_STYLES.missing;

  return (
    <div className="border rounded-xl p-4 flex items-center justify-between gap-4 dark:border-gray-800">
      <div className="space-y-1">
        <div className="font-semibold">{title}</div>
        <div className={`text-xs ${result.error ? "text-rose-500" : "text-gray-500 dark:text-gray-400"}`}>
          {buildMessage(copy, result)}
        </div>
        {result.lastChecked && (
          <div className="text-[11px] text-gray-400 dark:text-gray-500">
            {copy.updated ? copy.updated(result.lastChecked) : result.lastChecked}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>{badgeLabel}</span>
      </div>
    </div>
  );
}

export default function ExternalChecks({
  summary = { loading: false, bls: {} },
  onReportHint,
}) {
  const copy = t("externalChecks") || {};
  const blsResult = { ...(summary.bls || {}), loading: summary.loading };

  return (
    <aside className="space-y-4">
      <div className="text-lg font-bold">{copy.title}</div>
      <Row title="Blacklistseller.com" result={blsResult} copy={copy} />
      <button onClick={onReportHint} className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white">
        {copy.cta}
      </button>
    </aside>
  );
}
