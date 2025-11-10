// src/components/ResultCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ResultCard({ item }) {
  const navigate = useNavigate();
  return (
    <div className="border rounded-2xl p-5 space-y-2 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{item.name || "ไม่ระบุชื่อ"}</h3>
        <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">อีโคโนกรอนิกส์</span>
      </div>

      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
        <div>ธนาคาร: <b>{item.bank || "-"}</b></div>
        <div>เลขบัญชี: <b>{item.account || "-"}</b></div>
        <div>ช่องทางการขาย: <b>{item.channel || "-"}</b></div>
        <div>ยอดโอน: <b>{item.amount ? `${item.amount.toLocaleString()} บาท` : "-"}</b></div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => navigate(`/search/detail?id=${item.id}`, { state: { item } })}
          className="px-4 py-2 rounded-xl border"
        >
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
}
