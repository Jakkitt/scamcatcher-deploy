// รายชื่อธนาคารที่ใช้งานทั่วไปในไทย (กลุ่มลูกค้ารายย่อย) — ตัดธนาคารที่ยุติบริการรายย่อยออกแล้ว
export const BANKS = [
  { value: 'ธนาคารกรุงเทพ',            label: 'ธนาคารกรุงเทพ (BBL)' },
  { value: 'ธนาคารกสิกรไทย',           label: 'ธนาคารกสิกรไทย (KBank)' },
  { value: 'ธนาคารไทยพาณิชย์',         label: 'ธนาคารไทยพาณิชย์ (SCB)' },
  { value: 'ธนาคารกรุงไทย',            label: 'ธนาคารกรุงไทย (KTB)' },
  { value: 'ธนาคารกรุงศรีอยุธยา',      label: 'ธนาคารกรุงศรีอยุธยา (BAY)' },
  { value: 'ทหารไทยธนชาต',             label: 'ทหารไทยธนชาต (ttb)' },
  { value: 'ธนาคารยูโอบี',             label: 'ธนาคารยูโอบี (UOB)' },
  { value: 'ธนาคารเกียรตินาคินภัทร',   label: 'ธนาคารเกียรตินาคินภัทร (KKP)' },
  { value: 'ธนาคารทิสโก้',             label: 'ธนาคารทิสโก้ (TISCO)' },
  { value: 'ธนาคารแลนด์แอนด์เฮ้าส์',    label: 'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)' },
  { value: 'ธนาคารไทยเครดิต',           label: 'ธนาคารไทยเครดิตเพื่อรายย่อย (TCRB)' },
  { value: 'ธนาคารซีไอเอ็มบี ไทย',      label: 'ธนาคารซีไอเอ็มบี ไทย (CIMB Thai)' },
  { value: 'ธนาคารออมสิน',             label: 'ธนาคารออมสิน (GSB)' },
  { value: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร', label: 'ธ.เพื่อการเกษตรและสหกรณ์การเกษตร (BAAC/ธกส.)' },
  { value: 'ไอซีบีซี (ไทย)',            label: 'ธนาคารไอซีบีซี (ไทย) (ICBC Thai)' },
  { value: 'แบงก์ออฟไชน่า',            label: 'ธนาคารแห่งประเทศจีน (Bank of China) — Thailand' },
  { value: 'ธนาคารอิสลามแห่งประเทศไทย', label: 'ธนาคารอิสลามแห่งประเทศไทย (IBANK)' },
];

// ช่องทางการโอน/ชำระเงินที่พบบ่อยในไทย (เพื่อใช้เป็นตัวเลือกในฟอร์ม)
export const TRANSFER_CHANNELS = [
  { value: 'PromptPay', label: 'พร้อมเพย์ (PromptPay)' },
  { value: 'ThaiQR', label: 'QR พร้อมเพย์ / Thai QR' },
  { value: 'MobileBanking', label: 'Mobile Banking' },
  { value: 'InternetBanking', label: 'Internet Banking' },
  { value: 'ATM', label: 'โอนผ่านตู้ ATM' },
  { value: 'CDM', label: 'ฝากเงินสดผ่านตู้ (CDM)' },
  { value: 'BankCounter', label: 'เคาน์เตอร์ธนาคาร' },
  { value: 'WalletTrueMoney', label: 'TrueMoney Wallet' },
  { value: 'WalletShopeePay', label: 'ShopeePay' },
  { value: 'WalletLinePay', label: 'LINE Pay' },
];
