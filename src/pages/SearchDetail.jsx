// src/pages/SearchDetail.jsx
import React from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BANKS, TRANSFER_CHANNELS } from "../constants/banks";
import { formatAccountNumber, sanitizeText } from "../utils/format";
import { t } from "../i18n/strings";

const createOptionalText = () =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : ""),
    z.string().max(80, t("validation.max80"))
  );

const schema = z
  .object({
    firstName: createOptionalText(),
    lastName: createOptionalText(),
    account: z.preprocess(
      (val) =>
        typeof val === "string" ? val.replace(/[^\d-]/g, "").trim() : "",
      z
        .string()
        .refine(
          (value) => !value || /^[\d-]{6,20}$/.test(value),
          t("validation.accountInvalid")
        )
    ),
    bank: z.string().optional(),
    channel: z.string().optional(),
    channelOther: createOptionalText(),
  })
  .superRefine((data, ctx) => {
    const channelLabel =
      data.channel === "OTHER" ? data.channelOther : data.channel;
    const hasName = Boolean(data.firstName || data.lastName);
    const hasOther = Boolean(data.account || data.bank || channelLabel);

    if (!hasName && !hasOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.requireOne"),
        path: ["__root"],
      });
    }

    if (data.channel === "OTHER" && !data.channelOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.channelOtherRequired"),
        path: ["channelOther"],
      });
    }

    if ((data.bank || channelLabel) && !data.account) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "กรุณากรอกเลขบัญชีเมื่อเลือกธนาคารหรือช่องทาง",
        path: ["account"],
      });
    }
  });

export default function SearchDetail() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      account: "",
      bank: "",
      channel: "",
      channelOther: "",
    },
  });

  const channelValue = watch("channel");
  const bankValue = watch("bank");

  const onAccountChange = (e) => {
    setValue("account", formatAccountNumber(e.target.value), {
      shouldDirty: true,
    });
  };

  const onSubmit = (raw) => {
    const accountDigits = raw.account
      ? raw.account.replace(/[^\d]/g, "")
      : "";
    const firstName = sanitizeText(raw.firstName || "");
    const lastName = sanitizeText(raw.lastName || "");
    const isWallet = ['TrueMoney', 'ShopeePay', 'LINE Pay', 'พร้อมเพย์'].includes(raw.channel);
    const channelValue =
      raw.channel === "OTHER"
        ? sanitizeText(raw.channelOther || "")
        : raw.channel || "";

    // ถ้าเป็น Wallet ให้ใช้ channelOther เป็น account (ถ้า account หลักว่างอยู่)
    let finalAccount = accountDigits;
    if (isWallet && !finalAccount && raw.channelOther) {
      finalAccount = raw.channelOther.replace(/[^\d]/g, "");
    }

    const params = {
      firstName,
      lastName,
      account: finalAccount,
      bank: raw.bank || "",
      channel: channelValue,
    };

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (fullName) {
      params.name = fullName;
    }

    const filteredParams = Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      },
      {}
    );

    navigate({
      pathname: "/search/results",
      search: `?${createSearchParams(filteredParams)}`,
    });
  };

  const fieldError = (field) =>
    errors?.[field] ? (
      <p className="mt-1 text-sm text-rose-500">
        {errors[field].message}
      </p>
    ) : null;

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 relative overflow-hidden bg-white dark:bg-black flex items-start justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/cyber_network_bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-10 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 dark:from-black/90 dark:via-black/50 dark:to-black/90" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 w-full">
        {/* Title + subtitle */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t("search.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t("search.subtitle")}
          </p>
        </div>

        {/* Card หลักของฟอร์ม */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 md:p-10 bg-white/95 border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                     dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]
                     grid md:grid-cols-2 gap-6 text-slate-900 dark:text-slate-100"
        >
          {/* root error */}
          <div className="md:col-span-2 h-5 -mt-2 text-center text-sm">
            <span
              className={
                errors?.__root ? "text-rose-500" : "opacity-0"
              }
            >
              {errors?.__root?.message || "placeholder"}
            </span>
          </div>

          {/* first / last name */}
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {t("search.firstNameLabel")}
              </label>
              <input
                {...register("firstName")}
                placeholder={t("search.firstNamePlaceholder")}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {fieldError("firstName")}
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {t("search.lastNameLabel")}
              </label>
              <input
                {...register("lastName")}
                placeholder={t("search.lastNamePlaceholder")}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {fieldError("lastName")}
            </div>
          </div>

          {/* bank */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
              {t("search.bankLabel")}
            </label>
            <div className="relative">
              <select
                {...register("bank")}
                className="appearance-none w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              >
                <option value="">{t("search.bankPlaceholder")}</option>
                {BANKS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* account (แสดงเมื่อเลือก bank แล้วเหมือนเดิม) */}
          {bankValue && (
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {t("search.accountLabel")}
              </label>
              <input
                {...register("account")}
                maxLength="15"
                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                placeholder={t("search.accountPlaceholder")}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {fieldError("account")}
            </div>
          )}

          {/* channel + other */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
              {t("search.channelLabel")}
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="relative">
                <select
                  {...register("channel")}
                  className="appearance-none w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                >
                  <option value="">{t("search.channelPlaceholder")}</option>
                  {TRANSFER_CHANNELS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                  <option value="OTHER">
                    {t("search.channelOtherOption")}
                  </option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {['TrueMoney', 'ShopeePay', 'LINE Pay', 'พร้อมเพย์'].includes(channelValue) && (
                <input
                  {...register('channelOther')}
                  maxLength={channelValue === 'พร้อมเพย์' ? 14 : 10}
                  onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  placeholder={
                    channelValue === 'พร้อมเพย์'
                      ? 'ระบุเบอร์มือถือ/บัตรปชช.'
                      : `ระบุเบอร์ ${channelValue}`
                  }
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              )}

              {channelValue === "OTHER" && (
                <input
                  {...register("channelOther")}
                  placeholder={t("search.channelOtherPlaceholder")}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              )}
            </div>
            {fieldError("channelOther")}
          </div>

          {/* ปุ่ม submit */}
          <div className="md:col-span-2">
            <button
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center
                         bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                         text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("search.submitting") : t("search.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
