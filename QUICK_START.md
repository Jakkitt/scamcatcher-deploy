# 🚀 Quick Start Guide - ScamCatcher

## ⚡ สำหรับผู้ใช้งาน Windows

### 📝 ขั้นตอนที่ 1: Setup ครั้งแรก

#### 1.1 ติดตั้ง Node.js (ถ้ายังไม่มี)

- Download: https://nodejs.org/ (เลือก LTS version)
- ติดตั้งตามขั้นตอน
- เปิด PowerShell/CMD แล้วทดสอบ:
  ```powershell
  node --version
  npm --version
  ```

#### 1.2 แก้ไข PowerShell Execution Policy

เปิด PowerShell **As Administrator** แล้วรัน:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

พิมพ์ `Y` เพื่อยืนยัน

#### 1.3 ติดตั้ง Dependencies

```powershell
# ที่ root folder
npm install

# ที่ server folder
cd server
npm install
cd ..
```

---

### 📝 ขั้นตอนที่ 2: สร้าง JWT_SECRET

**Double-click ที่:** `generate-jwt-secret.cmd`

จะได้ค่าประมาณนี้:

```
JWT_SECRET=a1b2c3d4e5f6... (ยาว 64 ตัวอักษร)
```

**คัดลอกค่านี้** แล้วไปวางในไฟล์ `server\.env`:

```
JWT_SECRET=a1b2c3d4e5f6... (ค่าที่คุณได้)
```

---

### 📝 ขั้นตอนที่ 3: เริ่มใช้งาน

#### Option A: ใช้ Batch Files (ง่ายที่สุด)

**TerminalWindow 1:** Double-click `test-backend.cmd`

- รอจนเห็น `[API] http://localhost:4010`

**Terminal 2:** Double-click `test-frontend.cmd`

- รอจนเห็น `Local: http://localhost:5173`

**เปิดเบราว์เซอร์:** http://localhost:5173

---

#### Option B: ใช้ Command Line

**Terminal 1 (Backend):**

```powershell
cd server
npm run dev
```

**Terminal 2 (Frontend):**

```powershell
npm run dev
```

---

### 🧪 ทดสอบว่าทำงานหรือไม่

#### Test 1: เปิดเว็บไซต์

เปิด http://localhost:5173  
**ควรเห็น:** หน้า Home ของ ScamCatcher

#### Test 2: สมัครสมาชิก

1. คลิก "สมัครสมาชิก"
2. กรอกข้อมูล
3. คลิก "สมัครสมาชิก"
4. **ควรเข้าสู่หน้า Profile**

#### Test 3: Login

1. คลิก "เข้าสู่ระบบ"
2. กรอก email/password
3. **ควรเข้าสู่ระบบได้**

---

## 🔧 ปัญหาที่พบบ่อย

### ❌ Error: "cannot be loaded. The file is not digitally signed"

**แก้ไข:**

1. เปิด PowerShell **As Administrator**
2. รัน:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Restart terminal

---

### ❌ Error: "Port 4010 is already in use"

**แก้ไข:**

```powershell
# ปิด process ที่ใช้ port 4010
netstat -ano | findstr :4010
# จะได้ PID ตัวเลข เช่น 12345
taskkill /PID 12345 /F
```

---

### ❌ Error: "MONGODB_URI is not defined"

**แก้ไข:**
ไม่ต้องกังวล! ระบบจะใช้ in-memory database แทน (สำหรับ dev)

ถ้าต้องการใช้ MongoDB จริง:

1. สมัคร MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
2. สร้าง Cluster (ฟรี)
3. Get Connection String
4. ใส่ใน `server\.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scamcatcher
   ```

---

### ❌ Error: "Module not found"

**แก้ไข:**

```powershell
# ลบ node_modules แล้วติดตั้งใหม่
rm -r node_modules
npm install

cd server
rm -r node_modules
npm install
cd ..
```

---

## 📚 ไฟล์สำคัญ

| ไฟล์                      | คำอธิบาย                  |
| ------------------------- | ------------------------- |
| `test-backend.cmd`        | เริ่ม backend server      |
| `test-frontend.cmd`       | เริ่ม frontend dev server |
| `generate-jwt-secret.cmd` | สร้าง JWT_SECRET          |
| `server\.env`             | การตั้งค่า backend        |
| `.env`                    | การตั้งค่า frontend       |
| `TESTING_GUIDE.md`        | คู่มือทดสอบโค้ด           |
| `DEPLOYMENT_GUIDE.md`     | คู่มือ deploy production  |
| `FIXES_SUMMARY.md`        | สรุปการแก้ไขบั๊ก          |

---

## 🎯 ขั้นตอนถัดไป

### สำหรับ Development:

1. ✅ อ่าน `TESTING_GUIDE.md` เพื่อทดสอบการแก้ไข
2. ✅ ทดลองใช้งานฟีเจอร์ต่าง ๆ
3. ✅ ทดสอบ email notifications settings

### สำหรับ Production:

1. ✅ อ่าน `DEPLOYMENT_GUIDE.md`
2. ✅ เตรียม environment variables
3. ✅ สร้าง MongoDB production database
4. ✅ ตั้งค่า SMTP สำหรับส่งอีเมล
5. ✅ Deploy!

---

## 💡 เคล็ดลับ

### เคล็ดลับ 1: ใช้ 2 Terminal

- Terminal 1: Backend (ไม่ต้องปิด)
- Terminal 2: Frontend (ไม่ต้องปิด)
- ทั้งคู่ต้องรันพร้อมกันตลอด

### เคล็ดลับ 2: Hot Reload

- เมื่อแก้ไขโค้ด Backend → รอสักครู่ server จะ reload เอง
- เมื่อแก้ไขโค้ด Frontend → หน้าเว็บจะ reload เอง

### เคล็ดลับ 3: Clear Cache

ถ้าเจอปัญหาแปลก ๆ ลอง:

```powershell
# ลบ node_modules
rm -r -fo node_modules

# ลบ package-lock.json
rm package-lock.json

# ติดตั้งใหม่
npm install
```

---

## 📞 ต้องการความช่วยเหลือ?

1. ตรวจสอบ console/terminal มี error อะไรหรือไม่
2. ลอง Google error message
3. ตรวจสอบ `TESTING_GUIDE.md` และ `DEPLOYMENT_GUIDE.md`
4. ถามใน GitHub Issues (ถ้ามี)

---

## ✅ Checklist การเริ่มต้น

```
[ ] ติดตั้ง Node.js แล้ว
[ ] รัน npm install ที่ root และ server แล้ว
[ ] แก้ PowerShell execution policy แล้ว
[ ] สร้าง JWT_SECRET แล้ว
[ ] backend รันได้แล้ว (http://localhost:4010)
[ ] frontend รันได้แล้ว (http://localhost:5173)
[ ] สมัครสมาชิกได้แล้ว
[ ] login ได้แล้ว
```

**ถ้าครบทุกข้อ → พร้อมเริ่มพัฒนา! 🎉**

---

## 🎓 เรียนรู้เพิ่มเติม

- **React:** https://react.dev
- **Express:** https://expressjs.com
- **MongoDB:** https://www.mongodb.com/docs
- **Vite:** https://vitejs.dev

---

**Happy Coding! 🚀**
