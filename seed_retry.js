
const API_URL = 'https://scamcatcher.onrender.com/api';

const REPORTS = [
  {
    name: 'เทพซ่า 007',
    firstName: 'เทพซ่า',
    lastName: '007',
    bank: '', 
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
  }
];

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
    
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(pngBase64, 'base64');
    
    for (const [index, r] of REPORTS.entries()) {
        // Delay to avoid rate limit
        if (index > 0) {
            console.log('Waiting 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

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
            console.error(`Failed to create report ${r.name}: ${err}`);
            continue;
        }

        const data = await res.json();
        console.log(`Created report ${r.name}: ${data.id}`);
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

    console.log('Retry seed completed!');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seedBulk();
