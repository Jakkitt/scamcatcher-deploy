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

const schema = z.object({
  name: z.string().min(1, validationCopy.nameRequired),
  bank: z.string().optional(),
  account: z.string().optional().refine((v) => !v || String(v).replace(/\D/g, '').length >= 6, validationCopy.accountShort),
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
  const prefill = location.state?.prefill || {};
  const fileRef = React.useRef(null);
  const [files, setFiles] = React.useState([]);
  const [previews, setPreviews] = React.useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: prefill.name || '',
      bank: prefill.bank || '',
      account: prefill.account || '',
      channel: prefill.channel || '',
    },
  });

  const channelValue = watch('channel');
  const bankValue = watch('bank');

  const onFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
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
    errors[field] ? <p className="text-sm text-red-500 mt-1">{errors[field]?.message}</p> : null;

  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl animate-pulse" style={{ right: '10%', bottom: '20%', animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <main className="container relative z-10 py-10">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6">{copy.title}</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 bg-white text-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:bg-[#061427]/90 dark:text-white dark:border-cyan-400/40 dark:shadow-[0_25px_80px_rgba(6,182,212,0.25)]"
        >
          <div>
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.name?.label}</label>
            <input
              {...register('name')}
              placeholder={fields.name?.placeholder}
              className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
            />
            {renderError('name')}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.category?.label}</label>
            <input
              {...register('category')}
              placeholder={fields.category?.placeholder}
              className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
            />
            {renderError('category')}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.bank?.label}</label>
            <select
              {...register('bank')}
              className="appearance-none w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
            >
              <option value="">{fields.bank?.placeholder}</option>
              {BANKS.map((bank) => (
                <option key={bank.value} value={bank.value}>{bank.label}</option>
              ))}
            </select>
          </div>

          {bankValue && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.account?.label}</label>
              <input
                {...register('account')}
                placeholder={fields.account?.placeholder}
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
              />
              {renderError('account')}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.channel?.label}</label>
            <div className="grid md:grid-cols-2 gap-3">
              <select
                {...register('channel')}
                className="appearance-none w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
              >
                <option value="">{fields.channel?.placeholder}</option>
                {TRANSFER_CHANNELS.map((channel) => (
                  <option key={channel.value} value={channel.value}>{channel.label}</option>
                ))}
                <option value="OTHER">{fields.channel?.other}</option>
              </select>
              {channelValue === 'OTHER' && (
                <input
                  {...register('channelOther')}
                  placeholder={fields.channel?.otherPlaceholder}
                  className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.amount?.label}</label>
            <input
              type="number"
              {...register('amount')}
              placeholder={fields.amount?.placeholder}
              className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
            />
            {renderError('amount')}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.date?.label}</label>
            <input
              type="date"
              {...register('date')}
              className="w-full h-12 px-4 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:focus:border-cyan-300"
            />
            {renderError('date')}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-1 font-medium">{fields.desc?.label}</label>
            <textarea
              {...register('desc')}
              rows="4"
              placeholder={fields.desc?.placeholder}
              className="w-full rounded-2xl bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all dark:bg-[#0f1f34] dark:border-cyan-400/40 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 dark:text-cyan-300 mb-2 font-medium">{fields.photos?.label}</label>
            <div className="flex flex-wrap gap-4">
              {previews.map((src, idx) => (
                <div key={src} className="w-28 h-28 relative">
                  <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-cyan-400/30" />
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
                  className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-sm text-gray-500 dark:border-cyan-400/40 dark:text-cyan-200"
                >
                  {fields.photos?.add}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-black text-white font-semibold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gradient-to-r dark:from-cyan-400 dark:via-sky-500 dark:to-blue-500 dark:shadow-cyan-500/30 dark:hover:shadow-cyan-500/50 dark:hover:from-cyan-300 dark:hover:via-sky-400 dark:hover:to-blue-400"
            >
              {isSubmitting ? copy.submitting : copy.submit}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
