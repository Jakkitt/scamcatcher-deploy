// src/components/ExternalChecks.jsx
import React from "react";
import { t } from "../i18n/strings";

function Row({ title, found }) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between dark:border-gray-800">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {found ? t('externalChecks.detailFound') : t('externalChecks.detailMissing')}
        </div>
      </div>
      <span
        className={`text-xs px-3 py-1 rounded-full ${
          found ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
        }`}
      >
        {found ? t('externalChecks.badgeFound') : t('externalChecks.badgeMissing')}
      </span>
    </div>
  );
}

export default function ExternalChecks({ summary = { bls: false, checkgon: false }, onReportHint }) {
  return (
    <aside className="space-y-4">
      <div className="text-lg font-bold">{t('externalChecks.title')}</div>
      <Row title="Blacklistseller.com" found={summary.bls} />
      <Row title="Checkgon.go.th" found={summary.checkgon} />
      <button
        onClick={onReportHint}
        className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white"
      >
        {t('externalChecks.cta')}
      </button>
    </aside>
  );
}
