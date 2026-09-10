# 📚 คู่มือการเรียนรู้ Backend Architecture & Code (ฉบับมือใหม่เข้าใจง่าย)

ยินดีต้อนรับสู่คู่มืออธิบายโค้ดทั้งหมดในโปรเจกต์ Backend (`jsd-mono-repo/backend`) คู่มือชุดนี้จัดทำขึ้นเพื่อให้เห็นภาพรวมและเข้าใจเหตุผลเบื้องหลังของโค้ดทุกบรรทัด ตั้งแต่พื้นฐานไปจนถึงการต่อ Database จริง

---

## 🗺️ แผนผังสารบัญ (Table of Contents)

สามารถคลิกอ่านตามลำดับเพื่อความเข้าใจแบบเป็นขั้นเป็นตอน:

1. [**01. Server Setup & Database Config**](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/01_SERVER_AND_CONFIG.md)
   - ทำความรู้จัก `package.json` และระบบ ES Modules
   - การเชื่อมต่อ MongoDB ด้วย Mongoose (`src/config/db.js`)
   - จุดเริ่มต้นของระบบใน `src/server.js` (Middleware, Matrix Landing Page, Async Start Pattern)

2. [**02. Router Structure & V1 In-Memory CRUD**](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/02_ROUTING_AND_V1_CRUD.md)
   - การแบ่ง Route เป็นลำดับชั้น (`/api` ➔ `/v1` ➔ `/users`)
   - การจำลองฐานข้อมูลด้วย Fake Array (`src/fakeDB/fakeUsers.js`)
   - เจาะลึก CRUD แบบ In-Memory: `GET`, `POST` (Auto ID ด้วย `reduce`), `PUT`, `DELETE` (เทคนิค `splice`)

3. [**03. Mongoose Schema & V2 Database CRUD**](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/03_MONGOOSE_AND_V2_CRUD.md)
   - Schema & Model ใน `src/models/user.model.js` (Validation, Regex, Select False, Timestamps)
   - การทำ CRUD กับ MongoDB จริงใน `src/routes/v2/user.routes.js`
   - เทคนิคซ่อน Password ด้วย Object Destructuring Rest Operator
   - การใช้ `findByIdAndUpdate` พร้อม `{ new: true, runValidators: true }`

4. [**04. API Testing ด้วย REST Client**](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/04_API_TESTING_REST_CLIENT.md)
   - วิธีทดสอบ API ผ่านไฟล์ `.rest` (`users-apu-test.rest` และ `users-apu-test-v2.rest`)
   - การประกาศตัวแปร `@baseUrl`
   - รูปแบบคำสั่งการทดสอบครบทุก HTTP Methods (GET / POST / PUT / DELETE)

5. [**05. Centralized Error Handling**](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/ERROR_HANDLING.md)
   - หลักการทำงานของ Centralized Error Handling
   - ความแตกต่างระหว่าง Client Error (400/404) และ Server Error (500)
   - กฎเหล็กของ Middleware 4 ตัวแปร `(err, req, res, next)` และหน้าที่ของ `next(err)`

6. [**06. CORS Guide & Configuration**](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/CORS.md)
   - CORS คืออะไร และทำไม Browser ถึงบล็อกคำขอข้าม Origin
   - เจาะลึก Preflight Request (`OPTIONS`) และ Header สำคัญ
   - การตั้งค่า `cors.js` (Allowed Origins, Credentials, Methods, Headers) และการเชื่อมต่อกับ React/Vite

---

## 🏗️ โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Tree)

```text
backend/
├── .env                         # ไฟล์เก็บ Environment Variables เช่น MONGODB_URI
├── package.json                 # ไฟล์ตั้งค่าโปรเจกต์และ dependencies
├── splice.js                    # สคริปต์ทดลองเล่น Array.splice()
├── users-apu-test.rest          # ไฟล์ทดสอบ API สำหรับ v1 (In-memory)
├── users-apu-test-v2.rest       # ไฟล์ทดสอบ API สำหรับ v2 (MongoDB)
├── doc/                         # โฟลเดอร์คู่มือสำหรับมือใหม่
│   ├── README.md                # 👈 สารบัญหลักหน้านี้
│   ├── 01_SERVER_AND_CONFIG.md
│   ├── 02_ROUTING_AND_V1_CRUD.md
│   ├── 03_MONGOOSE_AND_V2_CRUD.md
│   ├── 04_API_TESTING_REST_CLIENT.md
│   ├── CORS.md                  # คู่มือทำความเข้าใจและการตั้งค่า CORS
│   └── ERROR_HANDLING.md
└── src/
    ├── server.js                # จุดเริ่มต้นแอปพลิเคชัน (Entry Point)
    ├── config/
    │   ├── cors.js              # การตั้งค่า CORS สำหรับ Frontend
    │   └── db.js                # ฟังก์ชันเชื่อมต่อ MongoDB
    ├── fakeDB/
    │   └── fakeUsers.js         # ข้อมูลจำลองสำหรับ v1
    ├── models/
    │   └── user.model.js        # Mongoose Schema & Model สำหรับ v2
    └── routes/
        ├── index.js             # Route หลักสำหรับรวม /v1 และ /v2 เข้ากับ /api
        ├── v1/
        │   ├── index.js         # รวม route ย่อยของ v1
        │   └── user.routes.js   # CRUD ด้วย JavaScript Array
        └── v2/
            ├── index.js         # รวม route ย่อยของ v2
            └── user.routes.js   # CRUD เชื่อมต่อ MongoDB จริง
```

---

## 💡 ภาพรวมการพัฒนา: จาก V1 สู่ V2

| มิติการเปรียบเทียบ | Version 1 (`/api/v1/users`) | Version 2 (`/api/v2/users`) |
| :--- | :--- | :--- |
| **ที่เก็บข้อมูล** | In-Memory (JavaScript Array ใน RAM) | MongoDB (Database จริง) |
| **ความคงทนของข้อมูล** | ข้อมูลหายเมื่อ Restart Server | ข้อมูลถูกบันทึกถาวรใน Database |
| **การจัดการ ID** | สั่งคำนวณเลขสูงสุดแล้วบวกหนึ่ง (`"1"`, `"2"`, ...) | MongoDB สร้างให้อัตโนมัติเป็น `ObjectId` |
| **การตรวจสอบข้อมูล** | เขียนโค้ดเช็คเงื่อนไข `if` ด้วยตัวเองทั้งหมด | มี Mongoose Schema คอย Validate ชนิดข้อมูล, รูปแบบ email, ความ unique |
| **ความปลอดภัย** | Password เก็บและส่งแสดงตรงๆ ใน Object | ซ่อน Password อัตโนมัติ (`select: false`) และใช้ rest operator ตัดออก |
