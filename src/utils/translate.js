// src/utils/translate.js
import { t } from '../i18n/strings';

const categoryMap = {
  investment: 'หลอกลงทุน',
  shopping: 'ซื้อของออนไลน์',
  job: 'หลอกทำงาน',
  loan: 'เงินกู้',
  romance: 'หลอกให้รัก',
  bill: 'บิล/ภาษีปลอม',
  other: 'อื่นๆ',
};

const statusMap = {
  pending: 'รอตรวจสอบ',
  approved: 'ยืนยันแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

/**
 * แปลหมวดหมู่ให้ปลอดภัย
 * - ถ้าเป็น key มาตรฐาน (eng) -> แปลไทยให้
 * - ถ้าเป็นภาษาไทยอยู่แล้ว -> คืนค่าเดิม
 * - ถ้าไม่รู้จัก -> คืนค่าเดิม
 */
export function translateCategory(cat) {
  if (!cat) return '-';
  // 1. ลองหาใน map ปกติ
  if (categoryMap[cat]) return categoryMap[cat];
  
  // 2. ลองหาจาก i18n
  const key = `admin.categories.${cat}`;
  const translated = t(key);
  if (translated !== key) return translated;

  // 3. คืนค่าเดิม (Fallback)
  return cat;
}

/**
 * แปลสถานะให้ปลอดภัย
 */
export function translateStatus(status) {
  if (!status) return '-';
  if (statusMap[status]) return statusMap[status];

  const key = `admin.statuses.${status}`;
  const translated = t(key);
  if (translated !== key) return translated;

  return status;
}
