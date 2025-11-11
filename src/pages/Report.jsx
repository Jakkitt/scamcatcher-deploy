import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { BANKS, TRANSFER_CHANNELS } from '../constants/banks'
import { createReport } from '../services/reports'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const schema = z.object({
  name: z.string().min(1,'กรุณาระบุชื่อผู้กระทำผิด'),
  // ธนาคาร/เลขบัญชี: ไม่บังคับ แต่ถ้ากรอกต้องสมเหตุสมผล
  bank: z.string().optional(),
  account: z.string().optional().refine(v => !v || String(v).replace(/\D/g,'').length >= 6, 'เลขบัญชีสั้นเกินไป'),
  amount: z.coerce.number().min(1,'กรุณาระบุจำนวนเงิน'),
  date: z.string().min(1,'กรุณาระบุวันที่โอน'),
  category: z.string().min(1,'กรุณาระบุหมวดหมู่'),
  channel: z.string().optional(),
  channelOther: z.string().optional()
})
export default function Report(){
  const navigate = useNavigate();
  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset, watch }=useForm({ resolver:zodResolver(schema) });
  const fileRef = React.useRef(null);
  const [files, setFiles] = React.useState([]); // File[]
  const [previews, setPreviews] = React.useState([]); // preview urls
  const channelValue = watch('channel');
  const bankValue = watch('bank');

  const onFiles = (e)=>{
    const picked = Array.from(e.target.files||[]);
    if (picked.length === 0) return;
    const next = [...files, ...picked].slice(0,3);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removePhoto = (idx)=> {
    setFiles(prev => prev.filter((_,i)=>i!==idx));
    setPreviews(prev => prev.filter((_,i)=>i!==idx));
  };

  const onSubmit=async(d)=>{
    try{
      if (files.length === 0) {
        toast.error('โปรดอัปโหลดรูปอย่างน้อย 1 รูป');
        return;
      }
      if (d.channel === 'OTHER' && d.channelOther) {
        d.channel = d.channelOther;
      }
      delete d.channelOther;
      // Build FormData to upload files
      const fd = new FormData();
      Object.entries(d).forEach(([k,v])=> fd.append(k, String(v ?? '')));
      files.forEach(f => fd.append('photos', f));
      await createReport(fd);
      toast.success('ส่งรายงานสำเร็จ');
      reset();
      setFiles([]); setPreviews([]);
      navigate('/reports');
    }catch(e){
      toast.error(e?.message || 'ไม่สามารถส่งรายงานได้');
    }
  };

  return(
    <main className='container py-10'>
      <h1 className='text-3xl font-extrabold text-center mb-6'>รายงานมิจฉาชีพ</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='max-w-3xl mx-auto grid md:grid-cols-2 gap-6 rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-soft'>
        <div><label className='block text-sm mb-1'>ชื่อ–นามสกุลผู้กระทำผิด *</label><input className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20' {...register('name')} placeholder='ระบุชื่อ–นามสกุล'/>{errors.name&&<p className='text-red-500 text-sm'>{errors.name.message}</p>}</div>
        <div><label className='block text-sm mb-1'>หมวดหมู่ *</label><input className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20' {...register('category')} placeholder='เช่น การลงทุน'/>{errors.category&&<p className='text-red-500 text-sm'>{errors.category.message}</p>}</div>
        <div><label className='block text-sm mb-1'>ธนาคาร</label><select className='w-full h-12 py-0 px-3 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20 appearance-none pr-10 bg-no-repeat bg-[length:16px_16px] bg-[right_0.85rem_center] bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27%3E%3Cpath d=%27M6 8l4 4 4-4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")] dark:bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%23D1D5DB%27 stroke-width=%272%27%3E%3Cpath d=%27M6 8l4 4 4-4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")]' {...register('bank')}>
          <option value="">-- เลือกธนาคาร --</option>
          {BANKS.map(b=>
            <option key={b.value} value={b.value}>{b.label}</option>
          )}
        </select>{errors.bank&&<p className='text-red-500 text-sm'>{errors.bank.message}</p>}</div>
        {bankValue && (
          <div><label className='block text-sm mb-1'>เลขบัญชี</label><input className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20' {...register('account')} placeholder='เช่น 123-4-56789-0'/>{errors.account&&<p className='text-red-500 text-sm'>{errors.account.message}</p>}</div>
        )}
        {/* ช่องทาง (ย้ายขึ้นมาแทนที่ตำแหน่งเดิมของยอดโอน) */}
        <div className='md:col-span-2'>
          <label className='block text-sm mb-1'>ช่องทาง</label>
          <div className='grid md:grid-cols-2 gap-3'>
            <select {...register('channel')} className='w-full h-12 py-0 px-3 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20 appearance-none pr-10 bg-no-repeat bg-[length:16px_16px] bg-[right_0.85rem_center] bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27%3E%3Cpath d=%27M6 8l4 4 4-4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")] dark:bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27 stroke=%27%23D1D5DB%27 stroke-width=%272%27%3E%3Cpath d=%27M6 8l4 4 4-4%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E")]'>
              <option value=''>— เลือกช่องทาง —</option>
              {TRANSFER_CHANNELS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
              <option value='OTHER'>อื่น ๆ / ระบุเอง</option>
            </select>
            {channelValue === 'OTHER' && (
              <input className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20' {...register('channelOther')} placeholder='ระบุช่องทาง (ถ้าเลือก อื่น ๆ)' />
            )}
          </div>
        </div>
        {/* ยอดโอน และ วันที่โอนเงิน ย้ายลงมาด้านล่าง */}
        <div><label className='block text-sm mb-1'>ยอดโอน (บาท) *</label><input className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20' type='number' {...register('amount')} placeholder='ระบุจำนวนเงิน'/>{errors.amount&&<p className='text-red-500 text-sm'>{errors.amount.message}</p>}</div>
        <div><label className='block text-sm mb-1'>วันที่โอนเงิน *</label><input className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20' type='date' {...register('date')}/>{errors.date&&<p className='text-red-500 text-sm'>{errors.date.message}</p>}</div>
        <div className='md:col-span-2'><label className='block text-sm mb-1'>รายละเอียดเพิ่มเติม</label><textarea className='w-full min-h-28 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20 p-3' placeholder='อธิบายเหตุการณ์โดยย่อ' {...register('desc')}/></div>
        <div className='md:col-span-2'>
          <label className='block text-sm mb-2'>รูปภาพประกอบ (สูงสุด 3 รูป)</label>
          <div className='flex items-center gap-3 flex-wrap'>
            {previews.map((src, idx)=> (
              <div key={idx} className='relative w-20 h-20 rounded-lg overflow-hidden border dark:border-gray-800'>
                <img src={src} alt={`evidence-${idx+1}`} className='w-full h-full object-cover'/>
                <button type='button' onClick={()=>removePhoto(idx)} className='absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-1.5 py-0.5'>x</button>
              </div>
            ))}
            {files.length < 3 && (
              <button type='button' onClick={()=>fileRef.current?.click()} className='w-20 h-20 rounded-lg border dark:border-gray-800 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300'>+ รูป</button>
            )}
          </div>
          <input ref={fileRef} type='file' accept='image/*' multiple className='hidden' onChange={onFiles}/>
        </div>
        <div className='md:col-span-2'><button disabled={isSubmitting} type='submit' className='w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60'>{isSubmitting?'กำลังส่ง…':'ส่งรายงาน'}</button></div>
      </form>
    </main>
  )
}
