import https from 'https';

const endpoints = [
  'https://api.blacklistseller.com/api/v1/queries/fullname-summary/',
  'https://www.blacklistseller.com/api/v1/queries/fullname-summary/',
  'https://blacklistseller.com/api/v1/queries/fullname-summary/',
  'https://www.blacklistseller.com/api/queries/fullname-summary/',
  'https://api.blacklistseller.com/api/queries/fullname-summary/',
];

const payload = JSON.stringify({ first_name: 'Somchai', last_name: 'Sodsai' });

endpoints.forEach(url => {
  const req = https.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'NeEzmFRK_3Pm2IdOtGVHoFZq5JYa5jYpLIO-8wIzwUo',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log(`URL: ${url} => Status: ${res.statusCode}`);
      console.log(`Body: ${body.substring(0, 200)}...`); // Print first 200 chars
    });
  });
  
  req.on('error', (e) => {
    console.log(`URL: ${url} => Error: ${e.message}`);
  });
  
  req.write(payload);
  req.end();
});
