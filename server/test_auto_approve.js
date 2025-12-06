
import 'dotenv/config';
import mongoose from 'mongoose';
import Report from './src/models/Report.js';
import User from './src/models/User.js';
import { createReportRecord } from './src/services/reports.js';

// MongoDB Connection String
const MONGODB_URI = 'mongodb://127.0.0.1:27017/scamcatcher_db';

async function runTest() {
  console.log('🧪 Starting Auto-Approve Test...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create a dummy user (Reporter)
    let user = await User.findOne({ email: 'tester@example.com' });
    if (!user) {
      user = await User.create({
        username: 'Tester',
        email: 'tester@example.com',
        password: 'password123', // Dummy
        role: 'user'
      });
      console.log('👤 Created dummy user:', user._id);
    } else {
      console.log('👤 Using existing user:', user._id);
    }

    // 2. Define Scammer Details
    const scammer = {
      firstName: 'นายทดสอบ',
      lastName: 'ระบบออโต้',
      bank: 'KBANK',
      account: '9998887776',
      category: 'shopping'
    };

    console.log(`🎯 Target Scammer: ${scammer.firstName} ${scammer.lastName} (${scammer.account})`);

    // 3. Loop create 5 reports
    console.log('\n--- Reporting Progress ---');
    for (let i = 1; i <= 5; i++) {
        console.log(`\n📝 Submitting Report #${i}...`);
        
        const payload = {
            ...scammer,
            amount: 100 * i,
            date: new Date().toISOString(),
            desc: `Test report number ${i}`,
            channel: 'FACEBOOK'
        };

        const report = await createReportRecord({
            ownerId: user._id,
            payload: payload,
            photos: []
        });

        console.log(`   > Report ID: ${report._id}`);
        console.log(`   > Status: [ ${report.status.toUpperCase()} ]`);
        console.log(`   > Method: ${report.verificationMethod}`);

        if (report.status === 'approved' && report.verificationMethod === 'auto_volume') {
            console.log(`\n🎉 SUCCESS! Report #${i} triggered Auto-Approve!`);
        }
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🏁 Test Completed');
    process.exit(0);
  }
}

runTest();
