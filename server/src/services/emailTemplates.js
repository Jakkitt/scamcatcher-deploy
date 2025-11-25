// Security: Escape HTML entities to prevent XSS in email clients
function escapeHtml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildResetPasswordEmail({ resetUrl, username, expiresMinutes = 15 }) {
  const displayName = escapeHtml(username || 'ผู้ใช้ ScamCatcher');
  const safeUrl = escapeHtml(resetUrl); // Escape URL for text version
  const subject = 'ScamCatcher - ลิงก์รีเซ็ตรหัสผ่าน';
  const text = [
    `สวัสดี ${displayName}`,
    '',
    'คุณหรือมีใครสักคนได้ขอรีเซ็ตรหัสผ่านให้บัญชีของคุณ',
    `คลิกที่ลิงก์นี้เพื่อรีเซ็ตรหัสผ่าน: ${safeUrl}`,
    '',
    `ลิงก์นี้จะหมดอายุใน ${expiresMinutes} นาที`,
    'หากไม่ได้ทำรายการนี้ กรุณาเพิกเฉยอีเมลนี้',
  ].join('\n');

  // Note: resetUrl is trusted (server-generated), but still escape for safety
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0b1220; line-height: 1.6; max-width: 520px;">
      <h2 style="color: #0ea5e9;">ScamCatcher</h2>
      <p>สวัสดี ${displayName}</p>
      <p>คุณหรือมีใครสักคนได้ขอรีเซ็ตรหัสผ่านให้บัญชีของคุณ</p>
      <p>
        <a href="${resetUrl}" style="background: linear-gradient(90deg, #06b6d4, #2563eb); color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 12px; display: inline-block;">
          รีเซ็ตรหัสผ่าน
        </a>
      </p>
      <p style="margin-top: 10px;">ลิงก์จะหมดอายุใน ${expiresMinutes} นาที</p>
      <p style="font-size: 12px; color: #475569;">หากไม่ได้ทำรายการนี้ สามารถเพิกเฉยอีเมลนี้ได้</p>
    </div>
  `;

  return { subject, text, html };
}

export function buildChangePasswordPinEmail({ pin, username, expiresMinutes = 10 }) {
  const displayName = escapeHtml(username || 'ผู้ใช้ ScamCatcher');
  const safePin = escapeHtml(pin);
  const subject = 'ScamCatcher - รหัส PIN สำหรับเปลี่ยนรหัสผ่าน';
  const text = [
    `สวัสดี ${displayName}`,
    '',
    'นี่คือรหัส PIN สำหรับยืนยันการเปลี่ยนรหัสผ่าน',
    `PIN: ${safePin}`,
    '',
    `รหัสนี้จะหมดอายุใน ${expiresMinutes} นาที`,
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0b1220; line-height: 1.6; max-width: 520px;">
      <h2 style="color: #0ea5e9;">ScamCatcher</h2>
      <p>สวัสดี ${displayName}</p>
      <p>นี่คือรหัส PIN สำหรับยืนยันการเปลี่ยนรหัสผ่าน</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #0ea5e9;">${safePin}</p>
      <p style="margin-top: 10px;">รหัสนี้จะหมดอายุใน ${expiresMinutes} นาที</p>
      <p style="font-size: 12px; color: #475569;">หากไม่ได้ทำรายการนี้ สามารถเพิกเฉยอีเมลนี้ได้</p>
    </div>
  `;

  return { subject, text, html };
}

export function buildReportApprovedEmail({ username, reportId, reportName }) {
  const displayName = escapeHtml(username || 'ผู้ใช้ ScamCatcher');
  const safeId = escapeHtml(reportId);
  const safeName = escapeHtml(reportName);
  const subject = `ScamCatcher - รายงาน #${safeId} ได้รับการอนุมัติแล้ว`;
  const text = [
    `สวัสดี ${displayName}`,
    '',
    `รายงานของคุณเกี่ยวกับ "${safeName}" ได้รับการตรวจสอบและอนุมัติแล้ว`,
    'ขอบคุณที่ช่วยกันสร้างสังคมออนไลน์ที่ปลอดภัย',
    '',
    'ทีมงาน ScamCatcher',
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0b1220; line-height: 1.6; max-width: 520px;">
      <h2 style="color: #0ea5e9;">ScamCatcher</h2>
      <p>สวัสดี ${displayName}</p>
      <p>รายงานของคุณเกี่ยวกับ <strong>"${safeName}"</strong> ได้รับการตรวจสอบและ <span style="color: #10b981; font-weight: bold;">อนุมัติแล้ว</span></p>
      <p>ขอบคุณที่ช่วยกันสร้างสังคมออนไลน์ที่ปลอดภัย</p>
      <p style="margin-top: 20px; font-size: 12px; color: #64748b;">ทีมงาน ScamCatcher</p>
    </div>
  `;
  return { subject, text, html };
}

export function buildReportRejectedEmail({ username, reportId, reportName }) {
  const displayName = escapeHtml(username || 'ผู้ใช้ ScamCatcher');
  const safeId = escapeHtml(reportId);
  const safeName = escapeHtml(reportName);
  const subject = `ScamCatcher - รายงาน #${safeId} ไม่ผ่านการอนุมัติ`;
  const text = [
    `สวัสดี ${displayName}`,
    '',
    `รายงานของคุณเกี่ยวกับ "${safeName}" ไม่ผ่านการอนุมัติ`,
    'อาจเนื่องมาจากข้อมูลไม่เพียงพอหรือซ้ำซ้อน',
    '',
    'ทีมงาน ScamCatcher',
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0b1220; line-height: 1.6; max-width: 520px;">
      <h2 style="color: #0ea5e9;">ScamCatcher</h2>
      <p>สวัสดี ${displayName}</p>
      <p>รายงานของคุณเกี่ยวกับ <strong>"${safeName}"</strong> <span style="color: #ef4444; font-weight: bold;">ไม่ผ่านการอนุมัติ</span></p>
      <p>อาจเนื่องมาจากข้อมูลไม่เพียงพอหรือซ้ำซ้อน</p>
      <p style="margin-top: 20px; font-size: 12px; color: #64748b;">ทีมงาน ScamCatcher</p>
    </div>
  `;
  return { subject, text, html };
}
