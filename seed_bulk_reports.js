
const API_URL = 'https://scamcatcher.onrender.com/api';

const REPORTS = [
  {
    name: 'นายสมชาย ขายถูก',
    firstName: 'นายสมชาย',
    lastName: 'ขายถูก',
    bank: 'ธนาคารกสิกรไทย',
    account: '1234567890',
    amount: 25900,
    date: new Date().toISOString(),
    category: 'shopping',
    channel: 'Facebook',
    desc: 'สั่งซื้อ iPhone 15 Pro Max มือสอง สภาพนางฟ้า ราคาถูกกว่าท้องตลาด โอนเงินไปแล้วคนขายบล็อกเฟสหนี ไม่ส่งของ ติดต่อไม่ได้'
  },
  {
    name: 'น.ส. ร่ำรวย ช่วยชาติ',
    firstName: 'น.ส. ร่ำรวย',
    lastName: 'ช่วยชาติ',
    bank: 'ธนาคารไทยพาณิชย์',
    account: '9876543210',
    amount: 150000,
    date: new Date().toISOString(),
    category: 'investment',
    channel: 'Line',
    desc: 'ชักชวนลงทุน "บ้านออมทอง" อ้างผลตอบแทนร้อยละ 20 ต่อเดือน เดือนแรกได้จริง เดือนต่อมาปิดกลุ่มหนี เชิดเงินลูกทีมไปหมด'
  },
  {
    name: 'แอดมิน ฟ้าใส',
    firstName: 'แอดมิน',
    lastName: 'ฟ้าใส',
    bank: 'ธนาคารกรุงไทย',
    account: '1112333445',
    amount: 3500,
    date: new Date().toISOString(),
    category: 'job',
    channel: 'TikTok / Telegram',
    desc: 'สมัครงานกดไลค์คลิป TikTok ช่วงแรกได้เงินจริง 20-30 บาท ต่อมาให้โอนเงิน "สำรองจ่าย" เพื่อทำภารกิจพิเศษ อ้างว่าจะได้ค่าคอมมิชชั่นสูงขึ้น แต่พอโอนไปแล้วถอนเงินออกมาไม่ได้'
  },
  {
    name: 'บริษัท เงินด่วน ทันใจ จำกัด (ปลอม)',
    firstName: 'บริษัท เงินด่วน',
    lastName: 'ทันใจ จำกัด (ปลอม)',
    bank: 'ธนาคารออมสิน',
    account: '5550123456',
    amount: 2000,
    date: new Date().toISOString(),
    category: 'loan',
    channel: 'SMS / Website',
    desc: 'ได้รับ SMS อนุมัติเงินกู้ 50,000 บาท แอดไลน์ไปคุย บอกต้องโอนค่า "ค้ำประกันสัญญา" หรือ "ค่าปลดล็อคระบบ" ก่อน 2,000 บาท พอโอนแล้วก็เงียบหาย ไม่ได้เงินกู้'
  },
  {
    name: 'Mr. John Smith',
    firstName: 'Mr. John',
    lastName: 'Smith',
    bank: 'ธนาคารกรุงเทพ',
    account: '4445666778',
    amount: 45000,
    date: new Date().toISOString(),
    category: 'romance',
    channel: 'Instagram / Tinder',
    desc: 'คุยกันผ่านแอปหาคู่ อ้างเป็นวิศวกรชาวต่างชาติ จะส่งของขวัญมาให้ แต่ติดศุลกากร ให้เราช่วยโอนเงินค่าภาษีไปให้ก่อนที่บัญชีคนไทย'
  },
  {
    name: 'น้องพลอย กดบัตร',
    firstName: 'น้องพลอย',
    lastName: 'กดบัตร',
    bank: 'ทหารไทยธนชาต',
    account: '7778999001',
    amount: 6500,
    date: new Date().toISOString(),
    category: 'shopping',
    channel: 'Twitter (X)',
    desc: 'ประกาศขายบัตรคอนเสิร์ต Taylor Swift โซนหน้าคอม อ้างว่าเพื่อนไปไม่ได้เลยขายต่อราคาพาร์ วิดีโอคอลเช็คบัตรได้ แต่พอโอนเงินแล้วส่งบัตรปลอมมาให้ (วนขายหลายคน)'
  },
  {
    name: 'เทพซ่า 007',
    firstName: 'เทพซ่า',
    lastName: '007',
    bank: 'ธนาคารกสิกรไทย', // TrueMoney not in bank list, using KBank as placeholder or need to check if 'TrueMoney' is valid bank value? In banks.js it is in TRANSFER_CHANNELS. For bank field, usually it expects a bank. If user selected TrueMoney, maybe bank is empty? Let's use KBank for now or empty string.
    // Wait, the user said "ธนาคาร: - (TrueMoney)".
    // If I leave bank empty, it might fail validation if bank is required?
    // In Report.jsx schema: bank: z.string().optional().
    // So I can leave it empty.
    account: '0987654321',
    amount: 1200,
    date: new Date().toISOString(),
    category: 'shopping',
    channel: 'Facebook Group',
    desc: 'ซื้อรหัสเกม Valorant สกินครบ โอนเงินผ่าน TrueMoney Wallet แล้วให้รหัสผิด เปลี่ยนรหัสหนี บล็อกเฟส'
  },
  {
    name: 'การไฟฟ้า (ปลอม)',
    firstName: 'การไฟฟ้า',
    lastName: '(ปลอม)',
    bank: 'ธนาคารกรุงศรีอยุธยา',
    account: '2223444556',
    amount: 1850,
    date: new Date().toISOString(),
    category: 'bill',
    channel: 'SMS',
    desc: 'ส่ง SMS แจ้งว่ามิเตอร์ไฟฟ้าผิดปกติ หรือค้างชำระค่าไฟ จะถูกตัดไฟ ให้รีบชำระผ่านลิงก์ หรือโอนเงินเข้าบัญชีส่วนตัวที่อ้างว่าเป็นเจ้าหน้าที่'
  },
  {
    name: 'ฟาร์มแมวน่ารัก',
    firstName: 'ฟาร์มแมว',
    lastName: 'น่ารัก',
    bank: 'ธนาคารเกียรตินาคินภัทร',
    account: '3334555667',
    amount: 5000,
    date: new Date().toISOString(),
    category: 'shopping',
    channel: 'Facebook Page',
    desc: 'ขายลูกแมวพันธุ์สก็อตติชโฟลด์ ราคาถูก ให้โอนมัดจำก่อนครึ่งนึง อ้างว่ามีบริการส่งถึงบ้าน พอถึงเวลานัดไม่มาส่ง ติดต่อไม่ได้ ปิดเพจหนี'
  },
  {
    name: 'นาย มิจฉา ชีพ',
    firstName: 'นาย มิจฉา',
    lastName: 'ชีพ',
    bank: 'ธนาคารยูโอบี',
    account: '8889000112',
    amount: 2000,
    date: new Date().toISOString(),
    category: 'other',
    channel: 'Messenger / Line',
    desc: 'ทักแชทมาอ้างว่าเป็นเพื่อน เดือดร้อนเรื่องเงิน แอปธนาคารเข้าไม่ได้ ขอยืมเงินก่อน 2,000 เดี๋ยวคืนให้ตอนเย็น (จริงๆ คือเพื่อนโดนแฮกเฟส)'
  }
];

// Fix for TrueMoney case
REPORTS[6].bank = ''; 

async function seedBulk() {
  try {
    // 1. Login as Admin
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'Admin@1234' }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.text();
      throw new Error(`Login failed: ${err}`);
    }

    // Parse Cookies & CSRF
    const rawSetCookie = loginRes.headers.get('set-cookie') || '';
    const cookieParts = rawSetCookie.split(/,(?=\s*\w+=)/g);
    const cookiesToSend = cookieParts.map(part => {
        const match = part.match(/^\s*([^=]+=[^;]+)/);
        return match ? match[1] : null;
    }).filter(Boolean).join('; ');
    
    let csrfToken = '';
    const csrfMatch = cookiesToSend.match(/sc_csrf=([^;]+)/);
    if (csrfMatch) {
        csrfToken = csrfMatch[1];
    }
    console.log('CSRF Token:', csrfToken);

    const headers = {
        'Cookie': cookiesToSend,
        'x-csrf-token': csrfToken
    };

    const createdIds = [];

    // 2. Create Reports
    console.log(`Creating ${REPORTS.length} reports...`);
    
    // Dummy Image
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(pngBase64, 'base64');
    
    for (const [index, r] of REPORTS.entries()) {
        const formData = new FormData();
        formData.append('name', r.name);
        formData.append('firstName', r.firstName);
        formData.append('lastName', r.lastName);
        formData.append('bank', r.bank);
        formData.append('account', r.account);
        formData.append('amount', String(r.amount));
        formData.append('date', r.date);
        formData.append('category', r.category);
        formData.append('channel', r.channel);
        formData.append('desc', r.desc);
        
        const blob = new Blob([buffer], { type: 'image/png' });
        formData.append('photos', blob, `evidence_${index}.png`);

        const res = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Failed to create report ${index + 1}: ${err}`);
            continue;
        }

        const data = await res.json();
        console.log(`Created report ${index + 1}: ${data.id}`);
        createdIds.push(data.id);
    }

    // 3. Approve Reports
    console.log(`Approving ${createdIds.length} reports...`);
    
    const approveHeaders = {
        'Content-Type': 'application/json',
        'Cookie': cookiesToSend,
        'x-csrf-token': csrfToken
    };

    for (const id of createdIds) {
        const res = await fetch(`${API_URL}/reports/${id}/approve`, {
            method: 'PATCH',
            headers: approveHeaders,
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Failed to approve report ${id}: ${err}`);
        } else {
            console.log(`Approved report ${id}`);
        }
    }

    console.log('Bulk seed completed!');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seedBulk();
