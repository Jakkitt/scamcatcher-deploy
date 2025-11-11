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
      const msg = String(e?.message || '')
      const friendly = msg.includes('VITE_API_BASE_URL')
        ? 'ระบบยังไม่พร้อมใช้งาน: โปรดตั้งค่า VITE_API_BASE_URL ในไฟล์ .env แล้วหยุด/รัน npm run dev ใหม่'
        : msg || 'เกิดข้อผิดพลาด';
      setServerError(friendly)
    }
  };

  return(
    <div className='min-h-[70vh] flex items-start justify-center pt-16'>
      <div className='w-full max-w-md border rounded-xl p-8 shadow-soft bg-white dark:bg-gray-900 dark:border-gray-800'>
        <h2 className='text-2xl font-bold text-center mb-2 dark:text-white'>ลงทะเบียน</h2>
        <p className='text-center text-gray-600 dark:text-gray-300 mb-6'>สร้างบัญชีใหม่เพื่อใช้งาน ScamCatcher</p>
        {serverError&&<div className='mb-4 text-red-600 text-sm'>{serverError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div><input placeholder='ชื่อผู้ใช้' {...register('username',{required:'กรุณากรอกชื่อผู้ใช้'})}/>{errors.username&&<p className='text-red-600 text-sm mt-1'>{errors.username.message}</p>}</div>
          <div className='flex gap-2'><select className='w-1/2' {...register('gender',{required:'กรุณาเลือกเพศ'})}><option value=''>เลือกเพศ</option><option value='male'>ชาย</option><option value='female'>หญิง</option><option value='other'>อื่น ๆ</option></select><input className='w-1/2' type='date' {...register('dob',{required:'กรุณาเลือกวันเกิด'})}/></div>{(errors.gender||errors.dob)&&<p className='text-red-600 text-sm -mt-2'>{errors.gender?.message||errors.dob?.message}</p>}
          <div><input type='email' placeholder='your@email.com' {...register('email',{required:'กรุณากรอกอีเมล'})}/>{errors.email&&<p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}</div>
          <div className='flex gap-2'>
            <div className='w-1/2'><input type='password' placeholder='รหัสผ่าน' {...register('password',{required:'กรุณากรอกรหัสผ่าน', minLength:{value:6, message:'อย่างน้อย 6 ตัวอักษร'}})}/>{errors.password&&<p className='text-red-600 text-sm mt-1'>{errors.password.message}</p>}</div>
            <div className='w-1/2'><input type='password' placeholder='ยืนยันรหัสผ่าน' {...register('confirmPassword',{required:'กรุณายืนยันรหัสผ่าน', validate:v=>v===password||'รหัสผ่านไม่ตรงกัน'})}/>{errors.confirmPassword&&<p className='text-red-600 text-sm mt-1'>{errors.confirmPassword.message}</p>}</div>
          </div>
          <button disabled={isSubmitting} type='submit' className='w-full bg-black text-white py-2 rounded-lg disabled:opacity-60'>{isSubmitting?'กำลังส่ง…':'ลงทะเบียน'}</button>
        </form>
        <p className='text-center text-sm mt-4 text-gray-600 dark:text-gray-300'>มีบัญชีอยู่แล้ว? <Link to='/login' className='text-blue-600 hover:underline'>เข้าสู่ระบบ</Link></p>
      </div>
    </div>
  )
}
