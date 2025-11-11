import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { BANKS } from '../constants/banks'
import { createReport } from '../services/reports'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const schema=z.object({ name:z.string().min(1,'กรุณาระบุชื่อผู้กระทำผิด'), bank:z.string().min(1,'กรุณาเลือกธนาคาร'), account:z.string().min(6,'เลขบัญชีสั้นเกินไป'), amount:z.coerce.number().min(1,'กรุณาระบุจำนวนเงิน'), date:z.string().min(1,'กรุณาระบุวันที่โอน'), category:z.string().min(1,'กรุณาระบุหมวดหมู่') })
export default function Report(){
  const navigate = useNavigate();
  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset }=useForm({ resolver:zodResolver(schema) });
  const fileRef = React.useRef(null);
  const [files, setFiles] = React.useState([]); // File[]
  const [previews, setPreviews] = React.useState([]); // preview urls

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
        <div><label className='block text-sm mb-1'>ชื่อ–นามสกุลผู้กระทำผิด *</label><input {...register('name')} placeholder='ระบุชื่อ–นามสกุล'/>{errors.name&&<p className='text-red-500 text-sm'>{errors.name.message}</p>}</div>
        <div><label className='block text-sm mb-1'>หมวดหมู่ *</label><input {...register('category')} placeholder='เช่น การลงทุน'/>{errors.category&&<p className='text-red-500 text-sm'>{errors.category.message}</p>}</div>
        <div><label className='block text-sm mb-1'>ธนาคาร *</label><select {...register('bank')}>
          <option value="">-- เลือกธนาคาร --</option>
          {BANKS.map(b=>
            <option key={b.value} value={b.value}>{b.label}</option>
          )}
        </select>{errors.bank&&<p className='text-red-500 text-sm'>{errors.bank.message}</p>}</div>
        <div><label className='block text-sm mb-1'>เลขบัญชี *</label><input {...register('account')} placeholder='เช่น 123-4-56789-0'/>{errors.account&&<p className='text-red-500 text-sm'>{errors.account.message}</p>}</div>
        <div><label className='block text-sm mb-1'>ยอดโอน (บาท) *</label><input type='number' {...register('amount')} placeholder='ระบุจำนวนเงิน'/>{errors.amount&&<p className='text-red-500 text-sm'>{errors.amount.message}</p>}</div>
        <div><label className='block text-sm mb-1'>วันที่โอนเงิน *</label><input type='date' {...register('date')}/>{errors.date&&<p className='text-red-500 text-sm'>{errors.date.message}</p>}</div>
        <div className='md:col-span-2'><label className='block text-sm mb-1'>ช่องทาง</label><input placeholder='เช่น Facebook/Line/IG' {...register('channel')}/></div>
        <div className='md:col-span-2'><label className='block text-sm mb-1'>รายละเอียดเพิ่มเติม</label><textarea placeholder='อธิบายเหตุการณ์โดยย่อ' {...register('desc')}/></div>
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
