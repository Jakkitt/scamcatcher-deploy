import https from 'https';

// Configuration
const API_KEY = 'NeEzmFRK_3Pm2IdOtGVHoFZq5JYa5jYpLIO-8wIzwUo'; // From your screenshot
const TEST_DATA = {
  fullname: { first_name: 'Somchai', last_name: 'Sodsai' },
  idcard: { idcard: '1234567890123' }, // Dummy ID
  bank: { bank_account: '1234567890', bank_id: '004' } // Dummy Bank
};

// Variations to test
const variations = [
  {
    name: 'Standard URL',
    url: 'https://api.blacklistseller.com/api/v1/queries/fullname-summary/',
    payload: TEST_DATA.fullname
  },
  {
    name: 'Double API URL (From Doc)',
    url: 'https://api.blacklistseller.com/api/api/v1/queries/fullname-summary/',
    payload: TEST_DATA.fullname
  },
  {
    name: 'ID Card Endpoint',
    url: 'https://api.blacklistseller.com/api/v1/queries/idcard-summary/',
    payload: TEST_DATA.idcard
  },
  {
    name: 'Bank Endpoint',
    url: 'https://api.blacklistseller.com/api/v1/queries/bank-summary/',
    payload: TEST_DATA.bank
  }
];

console.log('🔍 Starting Deep Debug of Blacklistseller API...\n');

function testEndpoint(variation) {
  return new Promise((resolve) => {
    const payloadStr = JSON.stringify(variation.payload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.blacklistseller.com/',
        'Origin': 'https://www.blacklistseller.com',
        'Content-Length': Buffer.byteLength(payloadStr)
      }
    };

    const req = https.request(variation.url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log(`----------------------------------------`);
        console.log(`Testing: ${variation.name}`);
        console.log(`URL: ${variation.url}`);
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        
        if (res.statusCode === 200) {
          console.log(`✅ SUCCESS! Body:`, body.substring(0, 200));
        } else {
          console.log(`❌ FAILED. Body Preview:`, body.substring(0, 150).replace(/\n/g, ' '));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`Testing: ${variation.name} => Network Error: ${e.message}`);
      resolve();
    });

    req.write(payloadStr);
    req.end();
  });
}

async function runTests() {
  for (const v of variations) {
    await testEndpoint(v);
  }
  console.log('\n----------------------------------------');
  console.log('🏁 Debug Complete');
}

runTests();
