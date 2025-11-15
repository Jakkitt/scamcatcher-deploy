// src/pages/SearchResults.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { searchReports } from "../services/reports";
import ExternalChecks from "../components/ExternalChecks";
import ResultCard from "../components/ResultCard";
import { t } from "../i18n/strings";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const SEARCH_STATS_KEY = "sc_search_stats_v1";

const readStats = () => {
  try {
    return (
      JSON.parse(localStorage.getItem(SEARCH_STATS_KEY)) || {
        queries: {},
        names: {},
        accounts: {},
        banks: {},
        channels: {},
      }
    );
  } catch {
    return { queries: {}, names: {}, accounts: {}, banks: {}, channels: {} };
  }
};

const writeStats = (stats) => {
  try {
    localStorage.setItem(SEARCH_STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ignore storage quota errors */
  }
};

const normalize = (value = "") => value.trim().toLowerCase();

function buildQueryKey({ name = "", account = "", bank = "", channel = "" }) {
  return ["name", normalize(name), "account", normalize(account), "bank", normalize(bank), "channel", normalize(channel)].join("|");
}

function updateStats(query) {
  const stats = readStats();
  const key = buildQueryKey(query);
  stats.queries[key] = (stats.queries[key] || 0) + 1;

  let nameCount = 0;
  if (query.name) {
    const nKey = normalize(query.name);
    stats.names[nKey] = (stats.names[nKey] || 0) + 1;
    nameCount = stats.names[nKey];
  }

  let accountCount = 0;
  if (query.account) {
    const aKey = normalize(query.account.replace(/[^\d]/g, ""));
    stats.accounts[aKey] = (stats.accounts[aKey] || 0) + 1;
    accountCount = stats.accounts[aKey];
  }

  let bankCount = 0;
  if (query.bank) {
    const bKey = normalize(query.bank);
    stats.banks[bKey] = (stats.banks[bKey] || 0) + 1;
    bankCount = stats.banks[bKey];
  }

  let channelCount = 0;
  if (query.channel) {
    const cKey = normalize(query.channel);
    stats.channels[cKey] = (stats.channels[cKey] || 0) + 1;
    channelCount = stats.channels[cKey];
  }

  writeStats(stats);

  return {
    queryCount: stats.queries[key],
    nameCount,
    accountCount,
    bankCount,
    channelCount,
  };
}

export default function SearchResults() {
  const q = useQuery();
  const copy = t("searchResultsPage") || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    queryCount: 0,
    nameCount: 0,
    accountCount: 0,
    bankCount: 0,
    channelCount: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const query = {
    name: q.get("name") || "",
    account: q.get("account") || "",
    bank: q.get("bank") || "",
    channel: q.get("channel") || "",
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await searchReports(query);
        if (!alive) return;
        setItems(res || []);
        setMetrics(updateStats(query));
      } catch (err) {
        if (!alive) return;
        setItems([]);
        setErrorMessage(err?.message || copy.errorMessage || "เกิดข้อผิดพลาดในการค้นหา");
        toast.error(err?.message || copy.errorMessage || "ค้นหาไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [query.name, query.account, query.bank, query.channel]);

  // mock summary to match the design placeholders
  const foundCount = items.length;
  const externalSummary = { bls: foundCount > 0, checkgon: false };

  const summaryCards = [
    {
      label: copy.totalReports,
      value: foundCount,
      description: copy.totalReportsDesc || "จำนวนรายงานที่ระบบพบ",
    },
    {
      label: "จำนวนการค้นหารูปแบบนี้",
      value: metrics.queryCount,
      description: (() => {
        const fields = ["name", "account", "bank", "channel"]
          .filter((key) => query[key])
          .map((key) => ({ name: key, value: query[key] }));
        if (fields.length === 0) return "ยังไม่ได้ระบุรายละเอียดการค้นหา";
        return `ฟิลด์ที่ใช้: ${fields.map((f) => f.value).join(" • ")}`;
      })(),
    },
  ];

  if (query.name) {
    summaryCards.push({
      label: `การค้นหาชื่อ "${query.name}" ทั้งหมด`,
      value: metrics.nameCount,
      description: "นับเฉพาะคำค้นหานี้โดยไม่สนใจช่องทางหรือธนาคาร",
    });
  }

  if (query.account) {
    summaryCards.push({
      label: `การค้นหาเลขบัญชี ${query.account}`,
      value: metrics.accountCount,
      description: "รวมทุกการค้นหาที่ใช้เลขบัญชีนี้",
    });
  }

  if (query.bank) {
    summaryCards.push({
      label: `การค้นหาธนาคาร ${query.bank}`,
      value: metrics.bankCount,
      description: "นับการค้นหาที่ระบุธนาคารนี้",
    });
  }

  if (query.channel) {
    summaryCards.push({
      label: `การค้นหาช่องทาง ${query.channel}`,
      value: metrics.channelCount,
      description: "นับการค้นหาที่ระบุช่องทางธุรกรรมนี้",
    });
  }

  return (
    <main className="container py-10">
      {/* Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="rounded-2xl p-6 bg-white text-gray-900 shadow-soft border border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800">
            <h2 className="text-3xl font-extrabold mb-6 text-center">
              {foundCount > 0 ? copy.heroFound : copy.heroEmpty}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl font-extrabold">{card.value}</div>
                  <div className="mt-1 text-sm font-semibold">{card.label}</div>
                  <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{card.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ExternalChecks
          summary={externalSummary}
          onReportHint={() => toast(t("search.reportHint"))}
        />
      </div>

      {/* Results */}
      <section className="mt-10 lg:mt-6">
        <h3 className="text-xl font-bold mb-4">{copy.sectionTitle}</h3>

        {loading ? (
          <div className="border rounded-2xl p-6 text-center text-gray-500 bg-white dark:bg-gray-900 dark:border-gray-800">{copy.loading}</div>
        ) : errorMessage ? (
          <div className="border rounded-2xl p-6 text-center text-red-500 bg-white dark:bg-gray-900 dark:border-gray-800">
            {errorMessage}
          </div>
        ) : items.length === 0 ? (
          <div className="border rounded-2xl p-6 text-center text-gray-500 bg-white dark:bg-gray-900 dark:border-gray-800">
            {copy.empty}
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
