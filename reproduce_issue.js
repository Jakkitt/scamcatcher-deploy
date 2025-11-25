// import fetch from 'node-fetch'; // Native fetch in Node 18+

const BASE_URL = 'http://localhost:4011/api';
const EMAIL = 'admin@test.com'; // Assuming this user exists
const PASSWORD = 'password'; // Assuming this is the password, or I need to register a new user

async function run() {
  try {
    const randomEmail = `test${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Register
    console.log(`Registering new user: ${randomEmail}...`);
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: randomEmail, password, username: 'TestUser' }),
    });

    if (!registerRes.ok) {
      console.error('Register failed:', await registerRes.text());
      return;
    }

    const registerData = await registerRes.json();
    const cookies = registerRes.headers.get('set-cookie');
    console.log('Register successful');

    // Extract CSRF token
    const csrfMatch = cookies.match(/sc_csrf=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    // 2. Update Profile
    console.log('Updating profile settings...');
    const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        settings: { emailNotifications: false }
      }),
    });

    const updateText = await updateRes.text();
    console.log('Update Status:', updateRes.status);
    console.log('Update Response:', updateText);

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
