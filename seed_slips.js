
const API_URL = 'https://scamcatcher.onrender.com/api';
import fs from 'fs';
import path from 'path';

// Image paths provided by user
const IMAGE_PATHS = [
    'C:/Users/Admins/.gemini/antigravity/brain/8347a14e-fa63-428c-b8b9-52cb0eca2fc0/uploaded_image_0_1764737019727.jpg',
    'C:/Users/Admins/.gemini/antigravity/brain/8347a14e-fa63-428c-b8b9-52cb0eca2fc0/uploaded_image_1_1764737019727.jpg',
    'C:/Users/Admins/.gemini/antigravity/brain/8347a14e-fa63-428c-b8b9-52cb0eca2fc0/uploaded_image_2_1764737019727.jpg'
];

const REPORTS = [
  {
    name: 'นาย ธรรศภาคย์ เลิศเศวตพงศ์',
    firstName: 'นาย ธรรศภาคย์',
    lastName: 'เลิศเศวตพงศ์',
    bank: 'ธนาคารกสิกรไทย',
    account: '0985207', // Partial from slip
    amount: 555.55,
    date: new Date().toISOString(),
    category: 'shopping',
    channel: 'Facebook',
    desc: 'หลอกขายสินค้าออนไลน์ โอนเงินแล้วไม่ส่งของ สลิปปลอมชื่อ Steve Job แต่ชื่อบัญชีปลายทางเป็น นาย ธรรศภาคย์ เลิศเศวตพงศ์',
    imageIndex: 1 // KBank slip
  },
  {
    name: 'นาย ธรรศภาคย์ เลิศเศวตพงศ์',
    firstName: 'นาย ธรรศภาคย์',
    lastName: 'เลิศเศวตพงศ์',
    bank: 'ธนาคารกรุงเทพ',
    account: '0985207',
    amount: 555.55,
    date: new Date().toISOString(),
    category: 'shopping',
    channel: 'Facebook',
    desc: 'หลอกขายสินค้าออนไลน์ โอนเงินแล้วไม่ส่งของ สลิปปลอมชื่อ Steve Jobs แต่ชื่อบัญชีปลายทางเป็น นาย ธรรศภาคย์ เลิศเศวตพงศ์',
    imageIndex: 2 // BBL slip
  },
  {
    name: 'นาย ธรรศภาคย์ เลิศเศวตพงศ์',
    firstName: 'นาย ธรรศภาคย์',
    lastName: 'เลิศเศวตพงศ์',
    bank: 'ธนาคารไทยพาณิชย์',
    account: '0048907483342938', // PromptPay ID from slip
    amount: 99999.99,
    date: new Date().toISOString(),
    category: 'investment',
    channel: 'Line',
    desc: 'หลอกลงทุนวงแชร์ โอนเงินจำนวนมากเข้าพร้อมเพย์ ชื่อบัญชี นาย ธรรศภาคย์ เลิศเศวตพงศ์',
    imageIndex: 0 // SCB slip
  }
];

async function seedSlips() {
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
    console.log(`Creating ${REPORTS.length} reports with real slips...`);
    
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
        
        // Read image file
        const imagePath = IMAGE_PATHS[r.imageIndex];
        if (fs.existsSync(imagePath)) {
            const buffer = fs.readFileSync(imagePath);
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            formData.append('photos', blob, path.basename(imagePath));
        } else {
            console.warn(`Image not found: ${imagePath}, skipping image upload for this report.`);
        }

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

    console.log('Slip seeding completed!');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seedSlips();
