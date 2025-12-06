import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BANKS, TRANSFER_CHANNELS } from '../constants/banks';
import { createReport } from '../services/reports';
import { t } from '../i18n/strings';

const copy = t('reportForm') || {};
const fields = copy.fields || {};
const validationCopy = copy.validation || {};

const splitNameParts = (value = '') => {
  const parts = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
};

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, validationCopy.firstNameRequired || validationCopy.nameRequired)
    .max(80, validationCopy.firstNameMax || t('validation.max80')),
  lastName: z
    .string()
    .trim()
    .min(1, validationCopy.lastNameRequired || validationCopy.nameRequired)
    .max(80, validationCopy.lastNameMax || t('validation.max80')),
  bank: z.string().optional(),
  account: z
    .string()
    .optional()
    .refine(
      (v) => {
        const len = String(v || '').replace(/\D/g, '').length;
        return !v || (len >= 10 && len <= 13);
      },
      'เลขบัญชีต้องมีความยาว 10-13 หลัก',
    ),
  amount: z.coerce.number().min(0, 'จำนวนเงินต้องไม่ติดลบ').min(1, validationCopy.amountRequired),
  date: z.string().min(1, validationCopy.dateRequired),
  category: z.string().min(1, validationCopy.categoryRequired),
  categoryOther: z.string().optional(),
  channel: z.string().optional(),
  channelOther: z.string().optional(),
  desc: z.string().optional(),
}).refine((data) => data.bank || data.channel, {
  message: "กรุณาระบุ ธนาคาร หรือ ช่องทาง อย่างน้อย 1 อย่าง",
  path: ["bank"], // แสดง error ที่ช่องธนาคาร
});

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedPrefill = React.useMemo(() => {
    const raw = location.state?.prefill || {};
    if ((!raw.firstName && !raw.lastName) && raw.name) {
      return { ...raw, ...splitNameParts(raw.name) };
    }
    return raw;
  }, [location.state]);

  const hasPrefillValues = React.useMemo(
    () => Object.values(normalizedPrefill || {}).some((val) => Boolean(val)),
    [normalizedPrefill],
  );

  const prefillKey = React.useMemo(
    () =>
      ['firstName', 'lastName', 'bank', 'account', 'channel']
        .map((key) => normalizedPrefill?.[key] || '')
        .join('|'),
    [normalizedPrefill],
  );

  const fileRef = React.useRef(null);
  const [files, setFiles] = React.useState([]);
  const [previews, setPreviews] = React.useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: normalizedPrefill.firstName || '',
      lastName: normalizedPrefill.lastName || '',
      bank: normalizedPrefill.bank || '',
      account: normalizedPrefill.account || '',
      channel: normalizedPrefill.channel || '',
      channelOther: '',
      amount: '',
      date: '',
      category: '',
      categoryOther: '',
      desc: '',
    },
  });

  const prefillAppliedRef = React.useRef('');
  React.useEffect(() => {
    if (!hasPrefillValues) return;
    if (prefillAppliedRef.current === prefillKey) return;
    prefillAppliedRef.current = prefillKey;
    const current = getValues();
    reset({
      ...current,
      firstName: normalizedPrefill.firstName || '',
      lastName: normalizedPrefill.lastName || '',
      bank: normalizedPrefill.bank || '',
      account: normalizedPrefill.account || '',
      channel: normalizedPrefill.channel || '',
    });
  }, [hasPrefillValues, prefillKey, normalizedPrefill, reset, getValues]);

  const channelValue = watch('channel');
  const categoryValue = watch('category');
  const bankValue = watch('bank');

  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    // Validate file size (max 5MB)
    const invalidFile = picked.find(f => f.size > 5 * 1024 * 1024);
    if (invalidFile) {
      toast.error('ขนาดไฟล์ต้องไม่กิน 5MB');
      e.target.value = '';
      return;
    }

    const next = [...files, ...picked].slice(0, 3);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    try {
      if (files.length === 0) {
        toast.error(copy.uploadRequired || t('reportForm.uploadRequired'));
        return;
      }
      if (data.channel === 'OTHER' && data.channelOther) {
        data.channel = data.channelOther;
      }
      delete data.channelOther;

      if (data.category === 'OTHER' && data.categoryOther) {
        data.category = data.categoryOther;
      }
      delete data.categoryOther;

      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? '')));
      files.forEach((file) => fd.append('photos', file));

      await createReport(fd);
      toast.success(copy.success);
      reset();
      setFiles([]);
      setPreviews([]);
      navigate('/reports');
    } catch (e) {
      toast.error(e?.message || copy.error);
    }
  };

  const renderError = (field) => (
    <div className="min-h-[20px] mt-1">
      {errors[field] ? (
        <p className="text-sm text-red-500 animate-fadeIn">{errors[field]?.message}</p>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 md:px-6 relative overflow-hidden bg-white dark:bg-black flex items-start justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/cyber_warning_bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-10 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 dark:from-black/90 dark:via-black/50 dark:to-black/90" />
      </div>

      <main className="max-w-4xl mx-auto relative z-10 w-full">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {copy.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            ช่วยกันแจ้งเบาะแสเพื่อสังคมที่ปลอดภัย ตรวจสอบข้อมูลก่อนโอน
          </p>
        </div>

        {/* การ์ดฟอร์ม: สไตล์เดียวกับการ์ด Login / ReportDetail */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-4xl mx-auto rounded-3xl p-6 sm:p-8 md:p-10 bg-white/95 border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                     dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]
                     grid md:grid-cols-2 gap-6 text-slate-900 dark:text-slate-100"
        >
            {/* ชื่อจริง */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.firstName?.label}
              </label>
              <input
                {...register('firstName')}
                placeholder={fields.firstName?.placeholder}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('firstName')}
            </div>

            {/* นามสกุล */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.lastName?.label}
              </label>
              <input
                {...register('lastName')}
                placeholder={fields.lastName?.placeholder}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('lastName')}
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.category?.label}
              </label>
              <div className="relative">
                <select
                  {...register('category')}
                  className="appearance-none w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  <option value="investment">หลอกลงทุน</option>
                  <option value="shopping">ซื้อของออนไลน์</option>
                  <option value="job">หลอกทำงาน</option>
                  <option value="loan">เงินกู้</option>
                  <option value="romance">หลอกให้รัก</option>
                  <option value="bill">บิล/ภาษีปลอม</option>
                  <option value="OTHER">อื่น ๆ / ระบุเอง</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {categoryValue === 'OTHER' && (
                <input
                  {...register('categoryOther')}
                  placeholder="ระบุหมวดหมู่อื่นๆ"
                  className="mt-2 w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              )}
              {renderError('category')}
            </div>

            {/* ช่องทางการขาย */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.channel?.label}
              </label>
              <div className="relative">
                <select
                  {...register('channel')}
                  className="appearance-none w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                >
                  <option value="">{fields.channel?.placeholder}</option>
                  {TRANSFER_CHANNELS.map((channel) => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
                    </option>
                  ))}
                  <option value="OTHER">{fields.channel?.other}</option>
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
                      ? 'ระบุเบอร์มือถือ หรือเลขบัตรประชาชน (PromptPay ID)'
                      : `ระบุเบอร์โทรศัพท์ที่ผูกกับ ${channelValue}`
                  }
                  className="mt-2 w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              )}
              {channelValue === 'OTHER' && (
                <input
                  {...register('channelOther')}
                  placeholder={fields.channel?.otherPlaceholder}
                  className="mt-2 w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
              )}
            </div>

            {/* ธนาคาร */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.bank?.label}
              </label>
              <div className="relative">
                <select
                  {...register('bank')}
                  className="appearance-none w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                >
                  <option value="">{fields.bank?.placeholder}</option>
                  {BANKS.map((bank) => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* เลขบัญชี (แสดงเมื่อเลือกธนาคาร) */}
            {bankValue && (
              <div>
                <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                  {fields.account?.label}
                </label>
                <input
                  {...register('account')}
                  maxLength="15"
                  onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                  placeholder={fields.account?.placeholder}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('account')}
              </div>
            )}

            {/* ยอดโอน */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.amount?.label}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('amount')}
                onKeyDown={(e) => ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()}
                placeholder={fields.amount?.placeholder}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('amount')}
            </div>

            {/* วันที่โอน */}
            <div>
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.date?.label}
              </label>
              <input
                type="date"
                {...register('date')}
                className="w-full h-12 px-4 rounded-xl
                           bg-slate-50 border border-slate-300 text-slate-900
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('date')}
            </div>

            {/* รายละเอียดเพิ่มเติม */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-1 font-medium text-slate-700 dark:text-sky-200">
                {fields.desc?.label}
              </label>
              <textarea
                {...register('desc')}
                rows="4"
                placeholder={fields.desc?.placeholder}
                className="w-full rounded-2xl
                           bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
            </div>

            {/* อัปโหลดรูป */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 font-medium text-slate-700 dark:text-sky-200">
                {fields.photos?.label}
              </label>
              <div className="flex flex-wrap gap-4">
                {previews.map((src, idx) => (
                  <div key={src} className="w-28 h-28 relative">
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-full object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-black text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {files.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-200"
                  >
                    {fields.photos?.add}
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onFiles}
              />
              <p className="text-xs text-red-500 mt-2">ขนาดไฟล์ต้องไม่เกิน 5MB ต่อรูป</p>
            </div>

            {/* ปุ่มส่งฟอร์ม */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl font-semibold flex items-center justify-center
                           bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                           text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? copy.submitting : copy.submit}
              </button>
            </div>
          </form>
      </main>
    </div>
  );
}
