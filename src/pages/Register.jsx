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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const normalizeFieldError = (code) =>
    ({
      invalid_email: loginErrors.emailInvalid,
      min_8: loginErrors.min8,
      max_72: loginErrors.max72,
      max_bytes_72: loginErrors.maxBytes72,
    }[code] || validationCopy.invalidInput || loginErrors.invalidInput || t('auth.login.errors.invalidInput', 'Invalid input'));

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (data.password !== data.confirmPassword) throw new Error(copy.passwordMismatch);
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
        if (fields.email) setError('email', { type: 'server', message: normalizeFieldError(fields.email) });
        if (fields.password) setError('password', { type: 'server', message: normalizeFieldError(fields.password) });
        if (fields.username) setError('username', { type: 'server', message: validationCopy.usernameRequired });
        if (fields.dob) setError('dob', { type: 'server', message: validationCopy.dobRequired });
        if (fields.gender) setError('gender', { type: 'server', message: validationCopy.genderRequired });
        friendly = validationCopy.invalidInput || friendly;
      } else if (/email\s*already\s*exists/i.test(raw) || /duplicate/i.test(raw)) {
        friendly = copy.emailTaken;
      } else if (/VITE_API_BASE_URL/.test(raw)) {
        friendly = loginErrors.notReady || t('auth.login.errors.notReady', t('common.notReady'));
      } else if (!raw) {
        friendly = copy.genericError;
      }
      setServerError(friendly);
    }
  };

  const renderError = (field) =>
    errors[field] ? <p className="text-xs text-red-400 mt-1">{errors[field]?.message}</p> : null;

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden flex items-center justify-center py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          style={{ left: `${mousePos.x / 20}px`, top: `${mousePos.y / 20}px`, transition: 'all 0.3s ease-out' }}
        />
        <div
          className="absolute w-96 h-96 bg-blue-400/25 rounded-full blur-3xl"
          style={{ right: `${mousePos.x / 30}px`, bottom: `${mousePos.y / 30}px`, transition: 'all 0.4s ease-out' }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.8; }
          90% { opacity: 0.5; }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-2xl mx-4 mt-4">
        <div className="rounded-3xl border-4 border-cyan-400/30 bg-gradient-to-b from-gray-950/80 via-gray-950 to-black p-10 shadow-[0_20px_80px_rgba(6,182,212,0.25)] text-white">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black">{copy.title}</h1>
            <p className="text-gray-300 text-sm">{copy.subtitle}</p>
          </div>

          {serverError && <div className="mt-6 text-center text-sm text-red-400">{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.usernameLabel}</label>
                <input
                  {...register('username', { required: validationCopy.usernameRequired })}
                  placeholder={copy.usernamePlaceholder}
                  className="w-full h-12 px-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
                {renderError('username')}
              </div>
              <div>
                <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.genderLabel}</label>
                <select
                  {...register('gender', { required: validationCopy.genderRequired })}
                  className="w-full h-12 px-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                  defaultValue=""
                >
                  <option value="" disabled>{t('profilePage.genderPlaceholder')}</option>
                  <option value="male">{t('profilePage.genderOptions.male')}</option>
                  <option value="female">{t('profilePage.genderOptions.female')}</option>
                  <option value="other">{t('profilePage.genderOptions.other')}</option>
                </select>
                {renderError('gender')}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.dobLabel}</label>
                <input
                  type="date"
                  {...register('dob', { required: validationCopy.dobRequired })}
                  className="w-full h-12 px-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
                {renderError('dob')}
              </div>
              <div>
                <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.emailLabel}</label>
                <input
                  type="email"
                  {...register('email', { required: validationCopy.emailRequired })}
                  placeholder={copy.emailPlaceholder}
                  className="w-full h-12 px-4 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                />
                {renderError('email')}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.passwordLabel}</label>
                <div className="relative">
                  <input
                    type={showPwd.password ? 'text' : 'password'}
                    {...register('password', {
                      required: validationCopy.passwordRequired,
                      minLength: { value: 6, message: validationCopy.min6 },
                    })}
                    placeholder={copy.passwordPlaceholder}
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                    onClick={() => setShowPwd((s) => ({ ...s, password: !s.password }))}
                  >
                    {showPwd.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {renderError('password')}
              </div>
              <div>
                <label className="block text-sm mb-2 font-medium text-cyan-300">{copy.confirmPasswordLabel}</label>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: validationCopy.confirmPasswordRequired,
                      validate: (v) => v === password || copy.passwordMismatch,
                    })}
                    placeholder={copy.confirmPasswordPlaceholder}
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-gray-900/50 border border-cyan-400/30 text-white placeholder-gray-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300"
                    onClick={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))}
                  >
                    {showPwd.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {renderError('confirmPassword')}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? copy.sending : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {copy.submit}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-6">
            {copy.haveAccount}{' '}
            <Link to="/login" className="text-cyan-300 font-semibold hover:underline">
              {copy.loginCta}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
