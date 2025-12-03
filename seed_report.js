
const API_URL = 'https://scamcatcher.onrender.com/api';

async function seed() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'qa_test_5823@test.com', password: 'Password1234' }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.text();
      throw new Error(`Login failed: ${err}`);
    }

    // Parse Set-Cookie headers
    const rawSetCookie = loginRes.headers.get('set-cookie') || '';
    const cookieParts = rawSetCookie.split(/,(?=\s*\w+=)/g);
    const cookiesToSend = cookieParts.map(part => {
        const match = part.match(/^\s*([^=]+=[^;]+)/);
        return match ? match[1] : null;
    }).filter(Boolean).join('; ');
    
    // Extract CSRF token
    let csrfToken = '';
    const csrfMatch = cookiesToSend.match(/sc_csrf=([^;]+)/);
    if (csrfMatch) {
        csrfToken = csrfMatch[1];
    }
    console.log('CSRF Token:', csrfToken);

    // 2. Create Report with FormData
    console.log('Creating report with FormData...');
    
    const formData = new FormData();
    formData.append('name', 'Test Scammer QA');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'Scammer QA');
    formData.append('bank', 'ธนาคารกสิกรไทย');
    formData.append('account', '1234567890');
    formData.append('amount', '500');
    formData.append('date', new Date().toISOString());
    formData.append('category', 'other');
    formData.append('channel', 'facebook');
    formData.append('desc', 'This is a QA test report created via script.');

    // Create a dummy PNG blob
    // minimal 1x1 transparent png
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(pngBase64, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });
    
    formData.append('photos', blob, 'test_evidence.png');

    const headers = {
        'Cookie': cookiesToSend,
        'x-csrf-token': csrfToken
        // Content-Type is set automatically by fetch when using FormData (multipart/form-data; boundary=...)
    };

    const createRes = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Create report failed: ${err}`);
    }

    const report = await createRes.json();
    console.log('Report created successfully:', report.id);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
