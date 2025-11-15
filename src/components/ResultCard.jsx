// src/components/ResultCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../i18n/strings";

export default function ResultCard({ item }) {
  const navigate = useNavigate();
  const copy = t("searchResultsPage.card") || {};
  const currency = t("common.currencyBaht");
  return (
    <div className="border rounded-2xl p-5 space-y-2 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{item.name || copy.unnamed || t('common.unknown')}</h3>
        <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">{copy.badge}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
        <div>{copy.bank}: <b>{item.bank || "-"}</b></div>
        <div>{copy.account}: <b>{item.account || "-"}</b></div>
        <div>{copy.channel}: <b>{item.channel || "-"}</b></div>
        <div>{copy.amount}: <b>{item.amount ? `${item.amount.toLocaleString()} ${currency}` : "-"}</b></div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => navigate(`/search/detail?id=${item.id}`, { state: { item } })}
          className="px-4 py-2 rounded-xl border"
        >
          {copy.view}
        </button>
      </div>
    </div>
  );
}
