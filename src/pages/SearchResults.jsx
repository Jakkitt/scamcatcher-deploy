// src/pages/SearchResults.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { searchReports } from "../services/reports";
import { formatAccountNumber } from "../utils/format";
import ExternalChecks from "../components/ExternalChecks";
import ResultCard from "../components/ResultCard";
import { t } from "../i18n/strings";
import { fetchExternalChecks } from "../services/external";
import { recordSearchStats } from "../services/stats";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const INITIAL_METRICS = {
  queryCount: 0,
  nameCount: 0,
  accountCount: 0,
  bankCount: 0,
  channelCount: 0,
  firstNameCount: 0,
  lastNameCount: 0,
};

const deriveNameParts = (firstName = "", lastName = "", fallback = "") => {
  if (firstName || lastName) {
    const full = [firstName, lastName].filter(Boolean).join(" ").trim();
    return { firstName, lastName, fullName: full };
  }
  const parts = String(fallback || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "", fullName: "" };
  const resolvedFirst = parts.shift() || "";
  const resolvedLast = parts.join(" ");
  return { firstName: resolvedFirst, lastName: resolvedLast, fullName: [resolvedFirst, resolvedLast].filter(Boolean).join(" ").trim() };
};

export default function SearchResults() {
  const q = useQuery();
  const copy = t("searchResultsPage") || {};
  const externalCopy = t("externalChecks") || {};
  const externalErrorText = externalCopy.error || "ไม่สามารถเชื่อมต่อข้อมูลภายนอก";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [errorMessage, setErrorMessage] = useState("");
  const [externalSummary, setExternalSummary] = useState({
    loading: false,
    bls: { skipped: true },
  });
  const navigate = useNavigate();

  const query = useMemo(
    () => ({
      firstName: q.get("firstName") || "",
      lastName: q.get("lastName") || "",
      name: q.get("name") || "",
      account: (q.get("account") || "").replace(/[^\d]/g, ""),
      bank: q.get("bank") || "",
      channel: q.get("channel") || "",
    }),
    [q]
  );
  const nameParts = useMemo(
    () => deriveNameParts(query.firstName, query.lastName, query.name),
    [query.firstName, query.lastName, query.name]
  );
  const displayName = nameParts.fullName;

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await searchReports(query);
        if (!alive) return;
        const approvedOnly = Array.isArray(res)
          ? res.filter((item) => item.status === 'approved')
          : [];
        setItems(approvedOnly);
        if (displayName || query.account || query.bank || query.channel) {
          try {
            const stats = await recordSearchStats(query);
            if (!alive) return;
            setMetrics({ ...INITIAL_METRICS, ...stats });
          } catch (statsErr) {
            console.warn('recordSearchStats failed', statsErr);
            if (!alive) return;
            setMetrics(INITIAL_METRICS);
          }
        } else if (alive) {
          setMetrics(INITIAL_METRICS);
        }
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
  }, [query.name, query.account, query.bank, query.channel, query.firstName, query.lastName, displayName]);

  useEffect(() => {
    let cancelled = false;

    if (!displayName && !query.account && !query.bank) {
      setExternalSummary({
        loading: false,
        bls: { skipped: true, found: false },
      });
      return () => {
        cancelled = true;
      };
    }

    setExternalSummary((prev) => ({ ...prev, loading: true }));
    (async () => {
      const attemptFetch = async (retries = 2, delay = 1000) => {
        try {
          const data = await fetchExternalChecks(query);
          if (cancelled) return;
          const source = data?.sources?.blacklistseller || {};
          const formattedTime = data?.checkedAt
            ? new Date(data.checkedAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })
            : undefined;
          setExternalSummary({
            loading: false,
            bls: {
              found: Boolean(source.found),
              count: source.count || 0,
              link: source.link || source.sourceUrl,
              error: source.error,
              skipped: source.skipped,
              matches: source.matches || [],
              lastChecked: formattedTime,
              cached: source.cached || data?.cached,
              reason: source.reason,
            },
          });
        } catch (err) {
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptFetch(retries - 1, delay * 1.5);
          }
          if (cancelled) return;
          setExternalSummary({
            loading: false,
            bls: { found: false, error: err?.message || externalErrorText },
          });
        }
      };
      attemptFetch();
    })();

    return () => {
      cancelled = true;
    };
  }, [query.name, query.account, query.bank, query.channel, query.firstName, query.lastName, displayName]);

  const foundCount = items.length;

  const formattedAccount = query.account ? formatAccountNumber(query.account) : "";

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
        const fields = [];
        if (displayName) fields.push(displayName);
        if (query.account) fields.push(formattedAccount || query.account);
        if (query.bank) fields.push(query.bank);
        if (query.channel) fields.push(query.channel);
        if (fields.length === 0) return "ยังไม่ได้ระบุรายละเอียดการค้นหา";
        return `ฟิลด์ที่ใช้: ${fields.join(" • ")}`;
      })(),
    },
  ];

  if (displayName) {
    summaryCards.push({
      label: `การค้นหาชื่อ "${displayName}"`,
      value: metrics.nameCount,
      description: "นับเฉพาะคำค้นหานี้โดยไม่สนใจช่องทางหรือธนาคาร",
    });
  } else {
    summaryCards.push({
      label: "การค้นหาชื่อ",
      value: metrics.nameCount,
      description: "กรอกชื่อเพื่อเริ่มนับจำนวนการค้นหา",
    });
  }

  if (query.account) {
    summaryCards.push({
      label: `การค้นหาเลขบัญชี ${formattedAccount}`,
      value: metrics.accountCount,
      description: "รวมทุกการค้นหาที่ใช้เลขบัญชีนี้",
    });
    if (query.channel) {
      summaryCards.push({
        label: `การค้นหาช่องทาง ${query.channel}`,
        value: metrics.channelCount,
        description: "นับการค้นหาที่ระบุช่องทางธุรกรรมนี้",
      });
    }
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
          onReportHint={() =>
            navigate("/report", {
              state: {
                prefill: {
                  firstName: nameParts.firstName,
                  lastName: nameParts.lastName,
                  name: displayName,
                  bank: query.bank,
                  account: query.account,
                  channel: query.channel,
                },
              },
            })
          }
        />
      </div>

      {/* Results */}
      <section className="mt-10 lg:mt-6">
        <h3 className="text-xl font-bold mb-4">{copy.sectionTitle}</h3>

        {loading ? (
          <div className="space-y-3" aria-live="polite">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse border rounded-2xl p-6 bg-white dark:bg-gray-900 dark:border-gray-800 space-y-2"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
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
