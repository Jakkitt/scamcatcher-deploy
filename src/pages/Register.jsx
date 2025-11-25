import React, { useEffect, useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n/strings';

export default function Register() {
  const copy = t('auth.register') || {};
  const validationCopy = copy.validation || {};
  const loginErrors = t('auth.login.errors') || {};
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });

  const normalizeFieldError = (code) =>
    ({
      invalid_email: loginErrors.emailInvalid,
      min_8: loginErrors.min8,
      max_72: loginErrors.max72,
      max_bytes_72: loginErrors.maxBytes72,
    }[code] ||
      validationCopy.invalidInput ||
      loginErrors.invalidInput ||
      t('auth.login.errors.invalidInput', 'Invalid input'));

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error(copy.passwordMismatch);
      }

      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        gender: data.gender,
        dob: data.dob,
      });

      navigate('/profile', { replace: true });
    } catch (e) {
      const raw = String(e?.message || '');
      let friendly = raw || copy.genericError;
      const fields = e?.data?.error?.fields || {};

      if (e?.status === 400 && fields) {
        if (fields.email) {
          setError('email', {
            type: 'server',
            message: normalizeFieldError(fields.email),
          });
        }
        if (fields.password) {
          setError('password', {
            type: 'server',
            message: normalizeFieldError(fields.password),
          });
        }
        if (fields.username) {
          setError('username', {
            type: 'server',
            message: validationCopy.usernameRequired,
          });
        }
        if (fields.dob) {
          setError('dob', {
            type: 'server',
            message: validationCopy.dobRequired,
          });
        }
        if (fields.gender) {
          setError('gender', {
            type: 'server',
            message: validationCopy.genderRequired,
          });
        }
        friendly = validationCopy.invalidInput || friendly;
      } else if (/email\s*already\s*exists/i.test(raw) || /duplicate/i.test(raw)) {
        friendly = copy.emailTaken;
      } else if (/VITE_API_BASE_URL/.test(raw)) {
        friendly =
          loginErrors.notReady ||
          t('auth.login.errors.notReady', t('common.notReady'));
      } else if (!raw) {
        friendly = copy.genericError;
      }

      setServerError(friendly);
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <p className="text-xs text-rose-500 mt-1">{errors[field]?.message}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-gray-950 dark:text-slate-100 overflow-hidden flex items-center justify-center py-16">
      {/* พื้นหลังโทนเดียวกับ Home1 hero */}
      <div className="absolute inset-0 -z-10">
        {/* base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50 to-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-950 dark:to-black" />

        {/* blobs light */}
        <div className="absolute -top-24 -left-10 w-[420px] h-[420px] bg-sky-200/70 blur-3xl rounded-full pointer-events-none dark:hidden" />
        <div className="absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-cyan-200/60 blur-3xl rounded-full pointer-events-none dark:hidden" />
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-100/60 blur-3xl rounded-full pointer-events-none dark:hidden" />

        {/* blobs dark */}
        <div className="hidden dark:block absolute -top-24 -left-10 w-[420px] h-[420px] bg-blue-800/40 blur-[120px] rounded-full pointer-events-none" />
        <div className="hidden dark:block absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-cyan-700/35 blur-[130px] rounded-full pointer-events-none" />
        <div className="hidden dark:block absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-purple-900/40 blur-[130px] rounded-full pointer-events-none" />

        {/* texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] dark:opacity-[0.08]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* การ์ดสมัครสมาชิกสไตล์เดียวกับ Login / Home1 */}
        <div className="rounded-3xl p-10 sm:p-12 border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur
                        dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {copy.title}
            </h1>
            <p className="text-slate-500 text-sm dark:text-slate-400">
              {copy.subtitle}
            </p>
          </div>

          {serverError && (
            <div className="mt-4 text-center text-sm text-rose-500">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-cyan-300">
                  {copy.usernameLabel}
                </label>
                <input
                  {...register('username', {
                    required: validationCopy.usernameRequired,
                  })}
                  placeholder={copy.usernamePlaceholder}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('username')}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-cyan-300">
                  {copy.genderLabel}
                </label>
                <select
                  {...register('gender', {
                    required: validationCopy.genderRequired,
                  })}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t('profilePage.genderPlaceholder')}
                  </option>
                  <option value="male">
                    {t('profilePage.genderOptions.male')}
                  </option>
                  <option value="female">
                    {t('profilePage.genderOptions.female')}
                  </option>
                  <option value="other">
                    {t('profilePage.genderOptions.other')}
                  </option>
                </select>
                {renderError('gender')}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* DOB */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-cyan-300">
                  {copy.dobLabel}
                </label>
                <input
                  type="date"
                  {...register('dob', {
                    required: validationCopy.dobRequired,
                  })}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('dob')}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-cyan-300">
                  {copy.emailLabel}
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: validationCopy.emailRequired,
                  })}
                  placeholder={copy.emailPlaceholder}
                  className="w-full h-12 px-4 rounded-xl
                             bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                             focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                             dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                />
                {renderError('email')}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-cyan-300">
                  {copy.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPwd.password ? 'text' : 'password'}
                    {...register('password', {
                      required: validationCopy.passwordRequired,
                      minLength: {
                        value: 6,
                        message: validationCopy.min6,
                      },
                    })}
                    placeholder={copy.passwordPlaceholder}
                    className="w-full h-12 pl-4 pr-12 rounded-xl
                               bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                               focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors"
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, password: !s.password }))
                    }
                  >
                    {showPwd.password ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {renderError('password')}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-800 dark:text-cyan-300">
                  {copy.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: validationCopy.confirmPasswordRequired,
                      validate: (v) => v === password || copy.passwordMismatch,
                    })}
                    placeholder={copy.confirmPasswordPlaceholder}
                    className="w-full h-12 pl-4 pr-12 rounded-xl
                               bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400
                               focus:border-sky-500 focus:ring-2 focus:ring-sky-400/40 outline-none transition-all
                               dark:bg-slate-900/70 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors"
                    onClick={() =>
                      setShowPwd((s) => ({ ...s, confirm: !s.confirm }))
                    }
                  >
                    {showPwd.confirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {renderError('confirmPassword')}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2
                         bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300
                         text-white transition-all duration-300 shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                copy.sending
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {copy.submit}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6 dark:text-slate-400">
            {copy.haveAccount}{' '}
            <Link
              to="/login"
              className="text-sky-600 font-semibold hover:underline dark:text-sky-300"
            >
              {copy.loginCta}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
