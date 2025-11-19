import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const { default: app } = await import('../src/app.js');

async function setupDB() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  return mongo;
}

test('stats endpoints track searches by name parts and account', async () => {
  const mongo = await setupDB();
  const agent = request.agent(app);

  const registerRes = await agent
    .post('/api/auth/register')
    .send({
      username: 'stats-user',
      email: 'stats@example.com',
      password: 'Password123',
      gender: '',
      dob: '',
    })
    .expect(201);
  const csrfCookie = (registerRes.get('set-cookie') || []).find((c) => c.startsWith('sc_csrf='));
  const csrfToken = csrfCookie ? csrfCookie.split(';')[0].split('=')[1] : '';

  const sampleFirst = 'นายทดสอบ';
  const sampleLast = 'ระบบ';
  const fullName = `${sampleFirst} ${sampleLast}`;
  const nameRes = await agent
    .post('/api/stats/search')
    .set('x-csrf-token', csrfToken)
    .send({ firstName: sampleFirst, lastName: sampleLast })
    .expect(200);

  assert.equal(nameRes.body.nameCount, 1);
  assert.equal(nameRes.body.queryCount, 1);
  assert.equal(nameRes.body.firstNameCount, 1);
  assert.equal(nameRes.body.lastNameCount, 1);

  const repeatName = await agent
    .post('/api/stats/search')
    .set('x-csrf-token', csrfToken)
    .send({ firstName: sampleFirst, lastName: sampleLast })
    .expect(200);
  assert.equal(repeatName.body.nameCount, 2);
  assert.equal(repeatName.body.queryCount, 2);
  assert.equal(repeatName.body.firstNameCount, 2);
  assert.equal(repeatName.body.lastNameCount, 2);

  const accountValue = '1234567890';
  const accountRes = await agent
    .post('/api/stats/search')
    .set('x-csrf-token', csrfToken)
    .send({ account: accountValue })
    .expect(200);
  assert.equal(accountRes.body.accountCount, 1);
  assert.equal(accountRes.body.bankCount, 0);

  const bankRes = await agent
    .post('/api/stats/search')
    .set('x-csrf-token', csrfToken)
    .send({ bank: 'kbank' })
    .expect(200);
  assert.equal(bankRes.body.bankCount, 1);

  const getStats = await agent
    .get('/api/stats/search')
    .query({ firstName: sampleFirst, lastName: sampleLast })
    .expect(200);

  assert.equal(getStats.body.nameCount, 2);
  assert.equal(getStats.body.queryCount, 2);
  assert.equal(getStats.body.firstNameCount, 2);
  assert.equal(getStats.body.lastNameCount, 2);
  const bankStats = await agent
    .get('/api/stats/search')
    .query({ bank: 'kbank' })
    .expect(200);
  assert.equal(bankStats.body.bankCount, 1);

  await mongoose.disconnect();
  await mongo.stop();
});
