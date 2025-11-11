// src/pages/SearchDetail.jsx
import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BANKS, TRANSFER_CHANNELS } from "../constants/banks";
import { formatAccountNumber, sanitizeText } from "../utils/format";

const schema = z.object({
  name: z.string().optional(),
  account: z.string().optional(),
  bank: z.string().optional(),
  channel: z.string().optional(),
  channelOther: z.string().optional(),
});

export default function SearchDetail() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", account: "", bank: "", channel: "", channelOther: "" },
  });
  const channelValue = watch('channel');
  const [errorMsg, setErrorMsg] = React.useState('');
  const bankValue = watch('bank');

  const onAccountChange = (e) => {
    setValue("account", formatAccountNumber(e.target.value), { shouldDirty: true });
  };

  const onSubmit = async (raw) => {
    const params = {
      name: sanitizeText(raw.name || ""),
      account: sanitizeText(raw.account || ""),
      bank: raw.bank || "",
      channel: raw.channel === 'OTHER' ? sanitizeText(raw.channelOther || '') : (raw.channel || ''),
    };
    const hasAny = Boolean(params.name || params.account || params.bank || params.channel);
    if (!hasAny) {
      setErrorMsg('กรุณากรอกอย่างน้อย 1 ช่องเพื่อค้นหา');
      return;
    }
    setErrorMsg('');
    // ส่งไปหน้า /search/results แบบ query string
    navigate({
      pathname: "/search/results",
      search: `?${createSearchParams(params)}`,
    });
  };

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-center">ค้นหามิจฉาชีพ</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-soft"
      >
        <div className="md:col-span-2 h-5 -mt-2 text-center text-sm">
          <span className={errorMsg ? 'text-red-600' : 'opacity-0'}>{errorMsg || 'placeholder'}</span>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">ชื่อ–นามสกุล (ถ้ามี)</label>
          <input {...register("name")} placeholder="เช่น นายสมชาย ใจดี" />
        </div>

        <div>
          <label className="block text-sm mb-1">ธนาคาร</label>
          <select
            {...register("bank")}
            className="appearance-none w-full h-12 px-3 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20"
          >
            <option value="">— เลือกธนาคาร —</option>
            {BANKS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {bankValue && (
          <div>
            <label className="block text-sm mb-1">เลขบัญชี (ถ้ามี)</label>
            <input {...register("account")} onChange={onAccountChange} placeholder="เช่น 123-4-56789-0" />
          </div>
        )}

        {/* ช่องทาง: แบบเดียวกับหน้า รายงาน */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">ช่องทาง</label>
          <div className="grid md:grid-cols-2 gap-3">
            <select
              {...register("channel")}
              className="appearance-none w-full h-12 px-3 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20"
            >
              <option value="">— เลือกช่องทาง —</option>
              {TRANSFER_CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
              <option value="OTHER">อื่น ๆ / ระบุเอง</option>
            </select>
            {channelValue === 'OTHER' && (
              <input {...register("channelOther")} placeholder="ระบุช่องทาง (ถ้าเลือก อื่น ๆ)" />
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-black text-white disabled:opacity-60"
          >
            {isSubmitting ? "กำลังค้นหา…" : "ค้นหาข้อมูลมิจฉาชีพ"}
          </button>
        </div>
      </form>
    </main>
  );
}
