// src/components/ExternalChecks.jsx
import React from "react";

function Row({ title, found }) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-gray-500 mt-1">
          {found ? "พบบัญชีผู้กระทำผิดในฐานข้อมูล" : "ไม่พบข้อมูลในฐานข้อมูล"}
        </div>
      </div>
      <span
        className={`text-xs px-3 py-1 rounded-full ${
          found ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
        }`}
      >
        {found ? "พบบัญชี" : "ไม่พบข้อมูล"}
      </span>
    </div>
  );
}

export default function ExternalChecks({ summary = { bls: false, checkgon: false }, onReportHint }) {
  return (
    <aside className="space-y-4">
      <div className="text-lg font-bold">ตรวจสอบจากแหล่งภายนอก</div>
      <Row title="Blacklistseller.com" found={summary.bls} />
      <Row title="Checkgon.go.th" found={summary.checkgon} />
      <button
        onClick={onReportHint}
        className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white"
      >
        แจ้งเบาะแส
      </button>
    </aside>
  );
}
