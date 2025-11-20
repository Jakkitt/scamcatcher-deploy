export function buildResetPasswordEmail({ resetUrl, username, expiresMinutes = 15 }) {
  const displayName = username || 'ผู้ใช้ ScamCatcher';
  const subject = 'ScamCatcher - ลิงก์รีเซ็ตรหัสผ่าน';
  const text = [
    `สวัสดี ${displayName}`,
    '',
    'คุณหรือมีใครสักคนได้ขอรีเซ็ตรหัสผ่านให้บัญชีของคุณ',
    `คลิกที่ลิงก์นี้เพื่อรีเซ็ตรหัสผ่าน: ${resetUrl}`,
    '',
    `ลิงก์นี้จะหมดอายุใน ${expiresMinutes} นาที`,
    'หากไม่ได้ทำรายการนี้ กรุณาเพิกเฉยอีเมลนี้',
  ].join('\n');

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
  const displayName = username || 'ผู้ใช้ ScamCatcher';
  const subject = 'ScamCatcher - รหัส PIN สำหรับเปลี่ยนรหัสผ่าน';
  const text = [
    `สวัสดี ${displayName}`,
    '',
    'นี่คือรหัส PIN สำหรับยืนยันการเปลี่ยนรหัสผ่าน',
    `PIN: ${pin}`,
    '',
    `รหัสนี้จะหมดอายุใน ${expiresMinutes} นาที`,
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0b1220; line-height: 1.6; max-width: 520px;">
      <h2 style="color: #0ea5e9;">ScamCatcher</h2>
      <p>สวัสดี ${displayName}</p>
      <p>นี่คือรหัส PIN สำหรับยืนยันการเปลี่ยนรหัสผ่าน</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #0ea5e9;">${pin}</p>
      <p style="margin-top: 10px;">รหัสนี้จะหมดอายุใน ${expiresMinutes} นาที</p>
      <p style="font-size: 12px; color: #475569;">หากไม่ได้ทำรายการนี้ สามารถเพิกเฉยอีเมลนี้ได้</p>
    </div>
  `;

  return { subject, text, html };
}
