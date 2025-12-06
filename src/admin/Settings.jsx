import React from 'react';
import toast from 'react-hot-toast';
import { Globe, Trash2, Zap } from 'lucide-react';
import { getExternalChecksSetting, updateExternalChecksSetting, getAutoApproveSetting, updateAutoApproveSetting } from '../services/admin';
import { purgeOrphans, countOrphans } from '../services/reports';
import { t } from '../i18n/strings';

export default function AdminSettings() {
  const [externalEnabled, setExternalEnabled] = React.useState(true);
  const [externalSettingLoading, setExternalSettingLoading] = React.useState(true);
  const [externalSettingSaving, setExternalSettingSaving] = React.useState(false);
  const [purgeState, setPurgeState] = React.useState(null);
  const [purging, setPurging] = React.useState(false);
  
  // Auto-Approve State
  const [autoApproveEnabled, setAutoApproveEnabled] = React.useState(false);
  const [autoApproveThreshold, setAutoApproveThreshold] = React.useState(5);
  const [autoApproveSaving, setAutoApproveSaving] = React.useState(false);

  const adminCopy = t('admin') || {};
  const externalControlCopy = adminCopy.externalChecks || {};

  // Load initial settings
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [extSetting, autoSetting, orphanInfo] = await Promise.all([
          getExternalChecksSetting(),
          getAutoApproveSetting().catch(() => ({ enabled: false, threshold: 5 })),
          countOrphans().catch(() => null)
        ]);
        
        if (!alive) return;
        setExternalEnabled(extSetting?.enabled !== false);
        
        // Load Auto Approve Settings
        if (autoSetting) {
            setAutoApproveEnabled(autoSetting.enabled);
            setAutoApproveThreshold(autoSetting.threshold);
        }

        setPurgeState(orphanInfo);
      } catch (err) {
        console.warn(err);
      } finally {
        if (alive) setExternalSettingLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const toggleExternalChecks = async () => {
    const next = !externalEnabled;
    setExternalSettingSaving(true);
    try {
      const updated = await updateExternalChecksSetting(next);
      setExternalEnabled(updated?.enabled !== false);
      toast.success(next ? externalControlCopy.toastOn : externalControlCopy.toastOff);
    } catch (err) {
      toast.error(err?.message || adminCopy.actionFailed);
    } finally {
      setExternalSettingSaving(false);
    }
  };

  const toggleAutoApprove = async () => {
    const next = !autoApproveEnabled;
    setAutoApproveSaving(true);
    try {
        await updateAutoApproveSetting({ enabled: next });
        setAutoApproveEnabled(next);
        toast.success(next ? 'เปิดใช้งานอนุมัติอัตโนมัติแล้ว' : 'ปิดการอนุมัติอัตโนมัติแล้ว');
    } catch (err) {
        toast.error('บันทึกการตั้งค่าล้มเหลว');
    } finally {
        setAutoApproveSaving(false);
    }
  };

  const saveThreshold = async () => {
      setAutoApproveSaving(true);
      try {
          await updateAutoApproveSetting({ threshold: autoApproveThreshold });
          toast.success('บันทึกเกณฑ์จำนวนรายงานแล้ว');
      } catch (err) {
          toast.error('บันทึกค่าล้มเหลว');
      } finally {
          setAutoApproveSaving(false);
      }
  };

  const onPurge = async () => {
    setPurging(true);
    try {
      await purgeOrphans();
      toast.success('ลบข้อมูลขยะแล้ว');
      const orphanInfo = await countOrphans();
      setPurgeState(orphanInfo);
    } catch {
      toast.error('ไม่สามารถลบข้อมูลได้');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">การตั้งค่าทั่วไป</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">จัดการการเชื่อมต่อภายนอกและการดูแลระบบ</p>
      </div>

      {/* External API Connection */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {externalControlCopy.label || 'การเชื่อมต่อ API ภายนอก'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {externalControlCopy.hint || 'เชื่อมต่อฐานข้อมูล Blacklistseller เพื่อตรวจสอบประวัติโดยอัตโนมัติ'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleExternalChecks}
            disabled={externalSettingLoading || externalSettingSaving}
            role="switch"
            aria-checked={externalEnabled}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75
              ${externalEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}
              ${externalSettingSaving || externalSettingLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                ${externalEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
        
 
      </div>

      {/* System Data Management */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                จัดการข้อมูลระบบ
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ล้างไฟล์ขยะ (Cache) และประวัติการค้นหาชั่วคราวเพื่อเพิ่มประสิทธิภาพ
              </p>
            </div>
          </div>

          <button
            onClick={onPurge}
            disabled={purging}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {purging ? 'กำลังล้าง...' : 'ล้างข้อมูลขยะ'}
          </button>
        </div>

        {purgeState?.count > 0 && (
           <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
             พบไฟล์ขยะจำนวน {purgeState.count} รายการ
           </div>
        )}
      </div>

      {/* Auto Approve based on Report Count */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                อนุมัติอัตโนมัติจากจำนวนรายงาน
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                อนุมัติโดยอัตโนมัติเมื่อมีผู้ร้องเรียนครบจำนวนที่กำหนด (Volume Threshold)
              </p>
            </div>
          </div>

          <button
            onClick={toggleAutoApprove}
            disabled={autoApproveSaving}
            role="switch"
            aria-checked={autoApproveEnabled}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75
              ${autoApproveEnabled ? 'bg-cyan-500' : 'bg-gray-200 dark:bg-gray-700'}
              ${autoApproveSaving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                ${autoApproveEnabled ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        <div className={`mt-6 pl-[72px] pr-4 transition-opacity duration-200 ${autoApproveEnabled ? 'opacity-100' : 'opacity-50 grayscale'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                เกณฑ์จำนวนรายงานขั้นต่ำ
              </span>
              <span className="px-3 py-1 rounded-lg bg-cyan-100 text-cyan-700 font-bold text-sm dark:bg-cyan-900/30 dark:text-cyan-300">
                {autoApproveThreshold} รายงาน
              </span>
            </div>
            
            <div className="relative mb-2">
               <input
                type="range"
                min="0"
                max="20"
                step="1"
                disabled={!autoApproveEnabled}
                value={autoApproveThreshold}
                onChange={(e) => setAutoApproveThreshold(Number(e.target.value))}
                onMouseUp={saveThreshold}
                onTouchEnd={saveThreshold}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none dark:bg-gray-700 accent-cyan-500 focus:outline-none 
                  ${autoApproveEnabled ? 'cursor-pointer hover:accent-cyan-400 focus:ring-2 focus:ring-cyan-500/50' : 'cursor-not-allowed opacity-70'}
                `}
              />
               <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0 คน</span>
                  <span>แนะนำ: 5-10 คน</span>
                  <span>20 คน</span>
               </div>
            </div>

            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ระบบจะเปลี่ยนสถานะเป็น "ยืนยันแล้ว" ทันทีเมื่อมีผู้รายงานครบ {autoApproveThreshold} คน
            </p>
          </div>
      </div>
    </div>
  );
}
