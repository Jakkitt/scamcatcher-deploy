// src/pages/ReportList.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import { listMyReports, removeReport } from "../services/reports";

function StatusBadge({ status }) {
  const map = {
    pending: { label: "รอตรวจสอบ", cls: "bg-black text-white" },
    approved: { label: "อนุมัติแล้ว", cls: "bg-green-600 text-white" },
    rejected: { label: "ปฏิเสธ", cls: "bg-red-600 text-white" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`px-3 py-1 rounded-lg text-sm ${s.cls}`}>{s.label}</span>
  );
}

export default function ReportList() {
  const [items, setItems] = useState(null);
  const [deleting, setDeleting] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await listMyReports(); // mock/localStorage หรือ API จริง
      if (alive) setItems(data);
    })();
    return () => (alive = false);
  }, []);

  const onDelete = async (id) => {
    if (!confirm('ยืนยันลบรายงานนี้?')) return;
    setDeleting(String(id));
    try{
      await removeReport(id);
      setItems(prev => (prev || []).filter(x => String(x.id) !== String(id)));
    }catch(e){
      alert(e?.message || 'ลบไม่สำเร็จ');
    }finally{
      setDeleting('');
    }
  };

  return (
    <main className="container py-10 grid md:grid-cols-3 gap-8">
      {/* การ์ดซ้าย */}
      <ProfileSidebar />

      {/* ขวา */}
      <section className="md:col-span-2">
        {/* แท็บบน */}
        <div className="mb-6">
          <div className="w-full flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              โปรไฟล์
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              รายงานของฉัน
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex-1 text-center h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-white dark:bg-gray-900 shadow-sm font-semibold" : "text-gray-600"
                }`
              }
            >
              การตั้งค่า
            </NavLink>
          </div>
        </div>

        {/* รายการรายงาน */}
        <div className="border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-800 p-6">
          <h1 className="text-xl font-bold mb-4">รายงานของฉัน</h1>

          {!items ? (
            <div className="text-sm text-gray-500">กำลังโหลด…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">
              ยังไม่มีรายงานของคุณ หากพบเหตุสงสัย
              <a href="/report" className="underline ml-1">
                คลิกเพื่อส่งรายงาน
              </a>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((r) => (
                <li
                  key={r.id}
                  className="border rounded-lg p-4 flex items-start justify-between gap-4 dark:border-gray-800"
                >
                  <div>
                    <div className="font-medium">{r.name || "ไม่ระบุชื่อ"}</div>
                    <div className="text-sm text-gray-500">
                      หมวดหมู่: {r.category || "-"} · วันที่ส่ง{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status || "pending"} />
                    <button
                      onClick={() => onDelete(r.id)}
                      disabled={deleting === String(r.id)}
                      className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >{deleting === String(r.id) ? 'กำลังลบ…' : 'ลบ'}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
