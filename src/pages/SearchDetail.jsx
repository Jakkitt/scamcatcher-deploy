// src/pages/SearchDetail.jsx
import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BANKS } from "../constants/banks";
import { formatAccountNumber, sanitizeText } from "../utils/format";

const schema = z.object({
  name: z.string().optional(),
  account: z.string().optional(),
  bank: z.string().optional(),
});

export default function SearchDetail() {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", account: "", bank: "" },
  });

  const onAccountChange = (e) => {
    setValue("account", formatAccountNumber(e.target.value), { shouldDirty: true });
  };

  const onSubmit = async (raw) => {
    const params = {
      name: sanitizeText(raw.name || ""),
      account: sanitizeText(raw.account || ""),
      bank: raw.bank || "",
    };
    // ส่งไปหน้า /search/results แบบ query string
    navigate({
      pathname: "/search/results",
      search: `?${createSearchParams(params)}`,
    });
  };

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-center">ตรวจสอบและรายงานมิจฉาชีพ</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-soft"
      >
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">ชื่อ–นามสกุล (ถ้ามี)</label>
          <input {...register("name")} placeholder="เช่น นายสมชาย ใจดี" />
        </div>

        <div>
          <label className="block text-sm mb-1">เลขบัญชี (ถ้ามี)</label>
          <input {...register("account")} onChange={onAccountChange} placeholder="เช่น 123-4-56789-0" />
        </div>

        <div>
          <label className="block text-sm mb-1">ธนาคาร</label>
          <select {...register("bank")}>
            <option value="">— เลือกธนาคาร —</option>
            {BANKS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
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
