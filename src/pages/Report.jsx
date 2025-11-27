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
      (v) => !v || String(v).replace(/\D/g, '').length >= 6,
      validationCopy.accountShort,
    ),
  amount: z.coerce.number().min(1, validationCopy.amountRequired),
  date: z.string().min(1, validationCopy.dateRequired),
  category: z.string().min(1, validationCopy.categoryRequired),
  channel: z.string().optional(),
  channelOther: z.string().optional(),
  desc: z.string().optional(),
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
  const bankValue = watch('bank');

  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    // Validate file size (max 5MB)
    const invalidFile = picked.find(f => f.size > 5 * 1024 * 1024);
    if (invalidFile) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB');
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

  const renderError = (field) =>
    errors[field] ? (
      <p className="text-sm text-red-500 mt-1">{errors[field]?.message}</p>
    ) : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* 🎨 พื้นหลังแบบเดียวกับหน้า Login */}
      <div className="absolute inset-0">
        {/* texture เบา ๆ */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] dark:opacity-5" />
        {/* แสงฟุ้งด้านบน */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-400/20 blur-[110px] rounded-full pointer-events-none dark:bg-blue-600/25" />
        {/* แสงฟุ้งด้านล่าง */}
        <div className="absolute bottom-0 right-0 w-[700px] h-[520px] bg-cyan-300/15 blur-[100px] rounded-full pointer-events-none dark:bg-cyan-500/15" />
      </div>

      <main className="container mx-auto px-4 md:px-6 relative z-10 py-10 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-6">
            {copy.title}
          </h1>

          {/* การ์ดฟอร์ม: สไตล์เดียวกับการ์ด Login / ReportDetail */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid md:grid-cols-2 gap-6 rounded-3xl p-6 sm:p-8 border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                       dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
          >
            {/* ชื่อ - นามสกุล */}
            <div className="grid md:grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                  {fields.firstName?.label}
                </label>
                <input
                  {...register('firstName')}
                  placeholder={fields.firstName?.placeholder}
                  className="w-full h-12 px-4 rounded-xl
                             bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('firstName')}
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                  {fields.lastName?.label}
                </label>
                <input
                  {...register('lastName')}
                  placeholder={fields.lastName?.placeholder}
                  className="w-full h-12 px-4 rounded-xl
                             bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('lastName')}
              </div>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                {fields.category?.label}
              </label>
              <input
                {...register('category')}
                placeholder={fields.category?.placeholder}
                className="w-full h-12 px-4 rounded-xl
                           bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('category')}
            </div>

            {/* ธนาคาร */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                {fields.bank?.label}
              </label>
              <select
                {...register('bank')}
                className="appearance-none w-full h-12 px-4 rounded-xl
                           bg-white border border-slate-300 text-slate-900
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
            </div>

            {/* เลขบัญชี (แสดงเมื่อเลือกธนาคาร) */}
            {bankValue && (
              <div>
                <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                  {fields.account?.label}
                </label>
                <input
                  {...register('account')}
                  placeholder={fields.account?.placeholder}
                  className="w-full h-12 px-4 rounded-xl
                             bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('account')}
              </div>
            )}

            {/* ช่องทางการขาย */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                {fields.channel?.label}
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                <select
                  {...register('channel')}
                  className="appearance-none w-full h-12 px-4 rounded-xl
                             bg-white border border-slate-300 text-slate-900
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
                {channelValue === 'OTHER' && (
                  <input
                    {...register('channelOther')}
                    placeholder={fields.channel?.otherPlaceholder}
                    className="w-full h-12 px-4 rounded-xl
                               bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                               focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                )}
              </div>
            </div>

            {/* ยอดโอน */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                {fields.amount?.label}
              </label>
              <input
                type="number"
                {...register('amount')}
                placeholder={fields.amount?.placeholder}
                className="w-full h-12 px-4 rounded-xl
                           bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('amount')}
            </div>

            {/* วันที่โอน */}
            <div>
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                {fields.date?.label}
              </label>
              <input
                type="date"
                {...register('date')}
                className="w-full h-12 px-4 rounded-xl
                           bg-white border border-slate-300 text-slate-900
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
              {renderError('date')}
            </div>

            {/* รายละเอียดเพิ่มเติม */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-1 font-medium">
                {fields.desc?.label}
              </label>
              <textarea
                {...register('desc')}
                rows="4"
                placeholder={fields.desc?.placeholder}
                className="w-full rounded-2xl
                           bg-white border border-slate-300 text-slate-900 placeholder-slate-500
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                           dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
              />
            </div>

            {/* อัปโหลดรูป */}
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 dark:text-cyan-300 mb-2 font-medium">
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
        </div>
      </main>
    </div>
  );
}
