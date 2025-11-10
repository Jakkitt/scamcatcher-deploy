// src/pages/SearchResults.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchReports } from "../services/reports";
import ExternalChecks from "../components/ExternalChecks";
import ResultCard from "../components/ResultCard";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SearchResults() {
  const q = useQuery();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = {
    name: q.get("name") || "",
    account: q.get("account") || "",
    bank: q.get("bank") || "",
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await searchReports(query);
      if (alive) {
        setItems(res || []);
        setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [query.name, query.account, query.bank]);

  // mock ตัวเลขสรุป + แหล่งภายนอก ให้ขึ้นตามภาพ
  const foundCount = items.length;
  const searchCount = Math.max(2 * (foundCount || 1), 2);
  const externalSummary = { bls: foundCount > 0, checkgon: false };

  return (
    <main className="container py-10">
      {/* แผงสรุปด้านบน */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div
            className={`rounded-2xl p-6 text-white ${
              foundCount > 0 ? "bg-amber-500" : "bg-green-600"
            }`}
          >
            <h2 className="text-3xl font-extrabold mb-6">
              {foundCount > 0 ? "พบรายงานการร้องเรียน" : "ไม่พบรายงานการร้องเรียน"}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/15 rounded-xl p-4 text-center">
                <div className="text-4xl font-extrabold">{foundCount}</div>
                <div className="mt-1 text-sm">จำนวนการร้องเรียน</div>
              </div>
              <div className="bg-white/15 rounded-xl p-4 text-center">
                <div className="text-4xl font-extrabold">{searchCount}</div>
                <div className="mt-1 text-sm">จำนวนการค้นหา</div>
              </div>
            </div>
          </div>
        </section>

        <ExternalChecks
          summary={externalSummary}
          onReportHint={() => alert("เปิดฟอร์ม “แจ้งเบาะแส” ได้ที่นี่ (ไว้เชื่อมจริงภายหลัง)")}
        />
      </div>

      {/* รายการผลลัพธ์ */}
      <section className="mt-8">
        <h3 className="font-bold text-lg mb-3">รายการเรื่องร้องเรียน / ประวัติการแจ้ง</h3>

        {loading ? (
          <div className="border rounded-2xl p-10 text-center text-gray-500">กำลังค้นหา…</div>
        ) : items.length === 0 ? (
          <div className="border rounded-2xl p-10 text-center text-gray-500">
            ยังไม่พบการแจ้งร้องเรียนในระบบ
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <ResultCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
