import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register(){
  const { register, handleSubmit, watch, formState:{ errors, isSubmitting } }=useForm();
  const navigate=useNavigate();
  const { register: registerUser } = useAuth();
  const [serverError,setServerError]=useState('');
  const password=watch('password');

  const onSubmit=async (data)=>{
    setServerError('');
    try{
      if(data.password!==data.confirmPassword){ throw new Error('รหัสผ่านไม่ตรงกัน') }
      await registerUser({ username:data.username, email:data.email, password:data.password, gender:data.gender, dob:data.dob });
      navigate('/profile',{replace:true})
    }catch(e){
      const raw = String(e?.message || '');
      let friendly = raw || 'เกิดข้อผิดพลาด';
      if (/email\s*already\s*exists/i.test(raw) || /duplicate/i.test(raw)) {
        friendly = 'อีเมลนี้มีผู้ใช้งานแล้ว';
      }
      if (/VITE_API_BASE_URL/.test(raw)) {
        friendly = 'ระบบยังไม่พร้อมใช้งาน: โปรดตั้งค่า VITE_API_BASE_URL ในไฟล์ .env แล้วหยุด/รัน npm run dev ใหม่';
      }
      setServerError(friendly)
    }
  };

  return(
    <div className='min-h-[70vh] pt-16 relative overflow-hidden flex items-start justify-center bg-gray-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-950 dark:to-black'>
      <div className='relative z-10 w-full max-w-md mx-4'>
        <div className='rounded-3xl p-8 shadow-2xl bg-white border border-gray-200 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900/70 dark:to-gray-950/70 dark:text-white dark:border-cyan-400/20 dark:backdrop-blur-xl dark:shadow-cyan-500/10'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-black mb-2 dark:text-white'>ลงทะเบียน</h2>
            <p className='text-gray-500 dark:text-gray-400'>สร้างบัญชีใหม่เพื่อใช้งาน ScamCatcher</p>
          </div>

          <div className='h-5 mb-4 text-center text-sm'>
            <span className={serverError ? 'text-red-600' : 'opacity-0'}>{serverError || 'placeholder'}</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300'>ชื่อผู้ใช้</label>
              <input
                placeholder='ชื่อผู้ใช้'
                {...register('username',{required:'กรุณากรอกชื่อผู้ใช้'})}
                className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20'
              />
              {errors.username&&<p className='text-red-600 text-sm mt-1'>{errors.username.message}</p>}
            </div>

            <div className='flex gap-2'>
              <div className='w-1/2'>
                <label className='block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300'>เพศ</label>
                <select
                  className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20'
                  {...register('gender',{required:'กรุณาเลือกเพศ'})}
                >
                  <option value=''>เลือกเพศ</option>
                  <option value='male'>ชาย</option>
                  <option value='female'>หญิง</option>
                  <option value='other'>อื่น ๆ</option>
                </select>
              </div>
              <div className='w-1/2'>
                <label className='block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300'>วันเกิด</label>
                <input
                  type='date'
                  className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20'
                  {...register('dob',{required:'กรุณาเลือกวันเกิด'})}
                />
              </div>
            </div>
            {(errors.gender||errors.dob)&&<p className='text-red-600 text-sm -mt-2'>{errors.gender?.message||errors.dob?.message}</p>}

            <div>
              <label className='block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300'>อีเมล</label>
              <input
                type='email'
                placeholder='your@email.com'
                {...register('email',{required:'กรุณากรอกอีเมล'})}
                className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20'
              />
              {errors.email&&<p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}
            </div>

            <div className='flex gap-2'>
              <div className='w-1/2'>
                <label className='block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300'>รหัสผ่าน</label>
                <input
                  type='password'
                  placeholder='รหัสผ่าน'
                  {...register('password',{required:'กรุณากรอกรหัสผ่าน', minLength:{value:6, message:'อย่างน้อย 6 ตัวอักษร'}})}
                  className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20'
                />
                {errors.password&&<p className='text-red-600 text-sm mt-1'>{errors.password.message}</p>}
              </div>
              <div className='w-1/2'>
                <label className='block text-sm mb-2 font-medium text-gray-700 dark:text-cyan-300'>ยืนยันรหัสผ่าน</label>
                <input
                  type='password'
                  placeholder='ยืนยันรหัสผ่าน'
                  {...register('confirmPassword',{required:'กรุณายืนยันรหัสผ่าน', validate:v=>v===password||'รหัสผ่านไม่ตรงกัน'})}
                  className='w-full h-12 rounded-xl transition-all outline-none bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:bg-gray-900/50 dark:border-cyan-400/30 dark:text-white dark:placeholder-gray-500 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-400/20'
                />
                {errors.confirmPassword&&<p className='text-red-600 text-sm mt-1'>{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button disabled={isSubmitting} type='submit' className='w-full py-2 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2 bg-black text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 dark:hover:from-cyan-400 dark:hover:to-blue-400 dark:shadow-xl dark:shadow-cyan-500/30'>
              {isSubmitting?'กำลังส่ง…':'ลงทะเบียน'}
            </button>
          </form>

          <p className='text-center text-xs text-gray-500 mt-6'>
            มีบัญชีอยู่แล้ว? <Link to='/login' className='text-gray-800 hover:underline dark:text-cyan-300'>เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
