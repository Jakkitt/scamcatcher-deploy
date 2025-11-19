import React from "react";
import { t } from "../i18n/strings";

const STATUS_STYLES = {
  loading: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200",
  found: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  missing: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  error: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  disabled: "bg-gray-200 text-gray-500 dark:bg-gray-900 dark:text-gray-400",
  skipped: "bg-gray-200 text-gray-500 dark:bg-gray-900 dark:text-gray-400",
};

const skeletonRows = Array.from({ length: 3 });

function buildMessage(copy, result) {
  if (result.loading) return copy.loading;
  if (result.reason === "disabled") return copy.disabled || copy.skipped;
  if (result.error) return copy.error || result.error;
  if (result.found) {
    const countText =
      typeof copy.matches === "function" && typeof result.count === "number" && result.count > 0
        ? ` • ${copy.matches(result.count)}`
        : "";
    return `${copy.detailFound}${countText}`;
  }
  if (result.skipped) return copy.skipped || copy.detailMissing;
  return copy.detailMissing;
}

function StatusBadge({ status, copy }) {
  const labels = {
    found: copy.badgeFound,
    error: copy.badgeError,
    loading: copy.badgeLoading,
    disabled: copy.badgeDisabled || copy.badgeMissing,
    skipped: copy.badgeSkipped || copy.badgeMissing,
    missing: copy.badgeMissing,
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.missing}`}>
      {labels[status] || copy.badgeMissing}
    </span>
  );
}

function Row({ title, result = {}, copy }) {
  const status = result.loading
    ? "loading"
    : result.reason === "disabled"
    ? "disabled"
    : result.skipped
    ? "skipped"
    : result.error
    ? "error"
    : result.found
    ? "found"
    : "missing";

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3 dark:border-gray-800" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>
          <div className={`text-xs ${result.error ? "text-rose-500" : "text-gray-500 dark:text-gray-400"}`}>
            {buildMessage(copy, result)}
          </div>
        </div>
        <StatusBadge status={status} copy={copy} />
      </div>
      {!result.loading && Array.isArray(result.matches) && result.matches.length > 0 && (
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          {result.matches.slice(0, 3).map((match) => (
            <li key={match.id || match.account || match.name} className="flex justify-between gap-2">
              <span className="font-medium truncate">{match.name || match.account}</span>
              {match.bank && <span className="text-gray-400">{match.bank}</span>}
            </li>
          ))}
        </ul>
      )}
      {result.lastChecked && (
        <div className="text-[11px] text-gray-400 dark:text-gray-500">
          {copy.updated ? copy.updated(result.lastChecked) : result.lastChecked}
          {result.cached && <span className="ml-1 text-cyan-500">{copy.cached || '(cached)'}</span>}
        </div>
      )}
    </div>
  );
}

export default function ExternalChecks({ summary = { loading: false, bls: {} }, onReportHint }) {
  const copy = t("externalChecks") || {};
  const blsResult = { ...(summary.bls || {}), loading: summary.loading };

  return (
    <aside className="space-y-4">
      <div className="text-lg font-bold">{copy.title}</div>
      {summary.loading ? (
        <div className="space-y-3" aria-live="polite">
          {skeletonRows.map((_, idx) => (
            <div key={idx} className="animate-pulse border border-dashed rounded-xl p-4 space-y-2 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <Row title="Blacklistseller.com" result={blsResult} copy={copy} />
      )}
      <button
        onClick={onReportHint}
        disabled={summary.loading}
        className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white disabled:bg-gray-500 disabled:cursor-not-allowed dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-600"
      >
        {summary.loading ? copy.loading : copy.cta}
      </button>
    </aside>
  );
}
