
const API_URL = 'https://scamcatcher.onrender.com/api';
const REPORT_ID = '692f109479d756b01c340a90'; // ID from previous step

async function approve() {
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

    // Parse Cookies
    const rawSetCookie = loginRes.headers.get('set-cookie') || '';
    const cookieParts = rawSetCookie.split(/,(?=\s*\w+=)/g);
    const cookiesToSend = cookieParts.map(part => {
        const match = part.match(/^\s*([^=]+=[^;]+)/);
        return match ? match[1] : null;
    }).filter(Boolean).join('; ');
    
    // Extract CSRF
    let csrfToken = '';
    const csrfMatch = cookiesToSend.match(/sc_csrf=([^;]+)/);
    if (csrfMatch) {
        csrfToken = csrfMatch[1];
    }
    console.log('CSRF Token:', csrfToken);

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': cookiesToSend,
        'x-csrf-token': csrfToken
    };

    // 2. Approve Report
    console.log(`Approving report ${REPORT_ID}...`);
    const approveRes = await fetch(`${API_URL}/reports/${REPORT_ID}/approve`, {
      method: 'PATCH',
      headers: headers,
    });

    if (!approveRes.ok) {
      const err = await approveRes.text();
      throw new Error(`Approve failed: ${err}`);
    }

    const result = await approveRes.json();
    console.log('Report approved successfully:', result);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

approve();
