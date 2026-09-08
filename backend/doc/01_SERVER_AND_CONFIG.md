# 01. Server Setup & Database Config

คู่มือส่วนนี้อธิบายไฟล์รากฐานของระบบ Backend ได้แก่ `package.json`, การเชื่อมต่อฐานข้อมูลใน `src/config/db.js` และการทำงานของ `src/server.js`

---

## 1. การตั้งค่าโปรเจกต์ (`package.json`)

ดูไฟล์ [`backend/package.json`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/package.json):

```json
{
  "name": "jsd-full-stack-app",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "node --env-file=.env --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "mongoose": "^9.9.5"
  }
}
```

### จุดที่มือใหม่ควรรู้:
1. **`"type": "module"`**:
   - ทำให้ Node.js ใช้ระบบ **ES Modules (ESM)**
   - เราจึงสามารถใช้คำสั่งมาตรฐานสมัยใหม่อย่าง `import` และ `export` ได้ (แทนที่จะต้องใช้ `require` หรือ `module.exports` แบบเดิม)
2. **`--env-file=.env` (ใน script dev)**:
   - ฟีเจอร์ใหม่ของ Node.js (v20+) ที่สามารถโหลดไฟล์ `.env` ได้โดยตรง ไม่จำเป็นต้องลงแพ็กเกจ `dotenv` เพิ่มเติม
3. **`--watch`**:
   - Node.js จะคอยตรวจจับเมื่อไฟล์ใน `src/` มีการเปลี่ยนแปลง และ Restart server ให้ใหม่อัตโนมัติ (คล้าย `nodemon`)
4. **`express: ^5.2.1`**:
   - โปรเจกต์นี้ใช้ Express 5 ซึ่งเป็นเวอร์ชันใหม่ มีจุดเด่นคือรองรับ Async/Await ได้ดียิ่งขึ้น

---

## 2. การเชื่อมต่อฐานข้อมูล (`src/config/db.js`)

ดูไฟล์ [`backend/src/config/db.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/config/db.js):

```javascript
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment!");
  }
  await mongoose.connect(uri);
}
```

### การทำงานทีละบรรทัด:
1. **`const uri = process.env.MONGODB_URI;`**:
   - อ่านค่า Connection String ของ MongoDB จากไฟล์ `.env` เพื่อไม่ให้เผลอฝัง Password หรือรหัสผ่านลงในโค้ด (ความปลอดภัยขั้นพื้นฐาน)
2. **`if (!uri) throw new Error(...)`**:
   - ป้องกันล่วงหน้า ถ้าลืมตั้งค่า `.env` โปรแกรมจะหยุดและแจ้งเตือนทันที แทนที่จะปล่อยให้รันไปต่อแบบเงียบๆ
3. **`await mongoose.connect(uri);`**:
   - ส่งคำขอเชื่อมต่อไปยัง MongoDB Cluster แบบ Asynchronous เมื่อเชื่อมต่อสำเร็จถึงจะไปขั้นตอนถัดไป

---

## 3. เจาะลึกไฟล์หลักของระบบ (`src/server.js`)

ไฟล์ [`backend/src/server.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/server.js) คือ **Entry Point** (จุดเริ่มต้นของแอปพลิเคชัน) โดยมีโครงสร้างหลัก 5 ส่วน:

### ส่วนที่ 1: สร้าง Express App & แปลงข้อมูล Request (`express.json()`)
```javascript
import express from "express";
import { routes as apiRoutes } from "./routes/index.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(express.json());
```
- **`app.use(express.json())`**: เป็น Middleware สำคัญที่สุดตัวหนึ่ง ทำหน้าที่อ่าน Body ของ HTTP Request ที่ส่งมาเป็น JSON แล้วแปลงให้อยู่ในรูป JavaScript Object เก็บไว้ใน `req.body` เพื่อให้เราเรียกใช้ได้ใน Route

---

### ส่วนที่ 2: หน้า Landing Page สุดเท่ (Matrix Rain Effect)
```javascript
app.get("/", (req, res) => {
  res.send(`<!doctype html>...<canvas id="matrix-canvas">...`);
});
```
- เมื่อเปิด Browser เข้าที่ `http://localhost:3001/` จะแสดงหน้า Landing Page ธีม The Matrix พร้อมปุ่มลิงก์และแอนิเมชัน Canvas ให้ผู้ใช้งานรู้ว่าเซิร์ฟเวอร์เปิดอยู่และพร้อมใช้งาน

---

### ส่วนที่ 3: นำเข้าระบบ Routing
```javascript
app.use("/api", apiRoutes);
```
- ทุก request ที่ขึ้นต้นด้วย `/api` จะถูกส่งต่อไปยัง Router หลักใน `src/routes/index.js` ทันที

---

### ส่วนที่ 4: ตัวดักจับ Error ส่วนกลาง (Centralized Error Handler)
```javascript
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server...",
    message: err.message,
  });
});
```
- วางไว้หลัง route ทั้งหมด เพื่อคอยรับ Error ที่ส่งมาจาก `next(err)` ของทุก endpoint *(อ่านรายละเอียดลึกๆ ได้ในคู่มือ [ERROR_HANDLING.md](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/ERROR_HANDLING.md))*

---

### ส่วนที่ 5: เริ่มต้นการทำงานของเซิร์ฟเวอร์ (`start()`)
```javascript
const PORT = 3001;

async function start() {
  try {
    // 1. ต่อ Database ก่อน
    await connectDB();

    // 2. เมื่อต่อ DB สำเร็จ ค่อยเปิดรับ Request
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT} 🟢`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB.", err.message);
    process.exit(1); // ปิดโปรแกรมทันทีถ้าต่อฐานข้อมูลไม่สำเร็จ
  }
}

start();
```

> **ข้อคิดสำคัญสำหรับมือใหม่**:  
> เราต้องรอให้เชื่อมต่อ MongoDB สำเร็จก่อน (`await connectDB()`) จึงค่อยเปิด Server (`app.listen()`) เพราะถ้าเปิดรับ Request ก่อนที่ DB จะพร้อม เมื่อมีคนยิง Request เข้ามา ข้อมูลก็จะพังทันที และหากต่อ DB ไม่ผ่าน คำสั่ง `process.exit(1)` จะปิด Node process ทันทีเพื่อแจ้งเตือนให้ผู้พัฒนาทราบ
