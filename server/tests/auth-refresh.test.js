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

test('refresh endpoint issues new access/refresh cookies', async (t) => {
  const mongo = await setupDB();
  const agent = request.agent(app);

  const registerRes = await agent
    .post('/api/auth/register')
    .send({
      username: 'tester',
      email: 'tester@example.com',
      password: 'Password123',
      gender: '',
      dob: '',
    })
    .expect(201);

  const initialCookies = registerRes.get('set-cookie') || [];
  assert(initialCookies.some((c) => c.startsWith('sc_refresh=')));
  assert(initialCookies.some((c) => c.startsWith('sc_access=')));

  const refreshRes = await agent.post('/api/auth/refresh').expect(200);
  const newCookies = refreshRes.get('set-cookie') || [];
  assert(newCookies.some((c) => c.startsWith('sc_refresh=')));
  assert(newCookies.some((c) => c.startsWith('sc_access=')));

  await mongoose.disconnect();
  await mongo.stop();
});
