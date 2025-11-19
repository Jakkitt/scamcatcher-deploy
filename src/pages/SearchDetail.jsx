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
      (val) => (typeof val === "string" ? val.replace(/[^\d-]/g, "").trim() : ""),
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
    const channelLabel = data.channel === "OTHER" ? data.channelOther : data.channel;
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
    setValue("account", formatAccountNumber(e.target.value), { shouldDirty: true });
  };

  const onSubmit = (raw) => {
    const accountDigits = raw.account ? raw.account.replace(/[^\d]/g, "") : "";
    const firstName = sanitizeText(raw.firstName || "");
    const lastName = sanitizeText(raw.lastName || "");
    const channelValue = raw.channel === "OTHER" ? sanitizeText(raw.channelOther || "") : raw.channel || "";
    const params = {
      firstName,
      lastName,
      account: accountDigits,
      bank: raw.bank || "",
      channel: channelValue,
    };
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (fullName) {
      params.name = fullName;
    }
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
    navigate({
      pathname: "/search/results",
      search: `?${createSearchParams(filteredParams)}`,
    });
  };

  const fieldError = (field) =>
    errors?.[field] ? <p className="mt-1 text-sm text-red-500">{errors[field].message}</p> : null;

  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ left: "10%", top: "20%" }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl animate-pulse" style={{ right: "10%", bottom: "20%", animationDelay: "1s" }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <main className="container relative z-10 py-10">
        <div className="text-center mb-6 space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t("search.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">{t("search.subtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 rounded-2xl p-6 bg-white border border-gray-200 shadow-xl text-gray-900 dark:bg-[#061427]/90 dark:border-cyan-400/40 dark:text-white dark:shadow-[0_25px_80px_rgba(6,182,212,0.25)]"
        >
          <div className="md:col-span-2 h-5 -mt-2 text-center text-sm">
            <span className={errors?.__root ? "text-red-500" : "opacity-0"}>
              {errors?.__root?.message || "placeholder"}
            </span>
          </div>

          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-cyan-300">
                {t("search.firstNameLabel")}
              </label>
              <input
                {...register("firstName")}
                placeholder={t("search.firstNamePlaceholder")}
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
              />
              {fieldError("firstName")}
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-cyan-300">
                {t("search.lastNameLabel")}
              </label>
              <input
                {...register("lastName")}
                placeholder={t("search.lastNamePlaceholder")}
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
              />
              {fieldError("lastName")}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600 dark:text-cyan-300">{t("search.bankLabel")}</label>
            <select
              {...register("bank")}
              className="appearance-none w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
            >
              <option value="">{t("search.bankPlaceholder")}</option>
              {BANKS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {bankValue && (
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-cyan-300">{t("search.accountLabel")}</label>
              <input
                {...register("account")}
                onChange={onAccountChange}
                placeholder={t("search.accountPlaceholder")}
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
              />
              {fieldError("account")}
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-gray-600 dark:text-cyan-300">{t("search.channelLabel")}</label>
            <div className="grid md:grid-cols-2 gap-3">
              <select
                {...register("channel")}
                className="appearance-none w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
              >
                <option value="">{t("search.channelPlaceholder")}</option>
                {TRANSFER_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
                <option value="OTHER">{t("search.channelOtherOption")}</option>
              </select>
              {channelValue === "OTHER" && (
                <input
                  {...register("channelOther")}
                  placeholder={t("search.channelOtherPlaceholder")}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
                />
              )}
            </div>
            {fieldError("channelOther")}
          </div>

          <div className="md:col-span-2">
            <button
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-black text-white font-semibold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gradient-to-r dark:from-cyan-400 dark:via-sky-500 dark:to-blue-500 dark:shadow-cyan-500/30 dark:hover:shadow-cyan-500/50 dark:hover:from-cyan-300 dark:hover:via-sky-400 dark:hover:to-blue-400"
            >
              {isSubmitting ? t("search.submitting") : t("search.submit")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
