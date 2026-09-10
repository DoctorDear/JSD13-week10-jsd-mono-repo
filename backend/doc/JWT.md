# 🔐 คู่มือเจาะลึก JWT (JSON Web Token) & Authentication ฉบับมือใหม่เข้าใจง่าย

[⬅️ กลับสู่สารบัญหลัก](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/doc/README.md)

---

## 1. JWT คืออะไร? ทำไมโลก Web Development ถึงนิยมใช้?

**JWT (JSON Web Token)** คือ มาตรฐานเปิด (RFC 7519) ที่ใช้สำหรับส่งข้อมูลอย่างปลอดภัยระหว่าง **Client** กับ **Server** ในรูปแบบของ String ข้อความสั้นๆ มักนิยมนำมาใช้เป็น **"บัตรผ่านเข้าสู่ระบบ" (Authentication & Authorization)**

### 🎟️ เปรียบเทียบให้เห็นภาพ (Analogy)
ลองจินตนาการถึง **"สายรัดข้อมือ VIP ของงานคอนเสิร์ต"**:
1. **ตอนซื้อตั๋ว (Login)**: คุณยื่นบัตรประชาชนและจ่ายเงิน (ส่ง Email + Password) ทางงานตรวจแล้วว่าถูกต้อง จึงเอา **สายรัดข้อมือ VIP** ปั๊มตราประทับพิเศษที่ปลอมแปลงไม่ได้มาสวมให้คุณ
2. **ตอนเดินเข้าโซนพิเศษ (เข้าถึง Protected Route)**: คุณไม่ต้องแสดงบัตรประชาชนซ้ำทุกครั้ง แค่ยื่นสายรัดข้อมือให้การ์ดดู การ์ดเห็นตราประทับของแท้และยังไม่หมดอายุ ก็เปิดประตูให้ผ่านได้ทันที
3. **ถ้ามีคนปลอมแปลงสายรัดข้อมือ**: ตราประทับจะไม่ตรงกับแม่พิมพ์ของงาน การ์ดจะรู้ทันทีและไล่ออกไป (401 Unauthorized)

### ⚖️ Session vs JWT (Token-based)
| มิติ | Session แบบเดิม | JWT (Token-based) |
| :--- | :--- | :--- |
| **การเก็บข้อมูล** | Server ต้องจดจำ Session ID ของทุกคนไว้ใน RAM หรือ Database (Stateful) | ข้อมูลทุกอย่างถูกเซ็นกำกับไว้ใน Token แล้ว Client เป็นคนเก็บ (Stateless) |
| **ภาระของ Server** | เมื่อมีคนออนไลน์พร้อมกันเป็นแสนคน RAM ของ Server จะเต็ม | Server ไม่ต้องจำอะไรเลย แค่ตรวจลายเซ็น (Verify Signature) |
| **การขยายระบบ (Scale)** | ทำได้ยาก ต้องแชร์ Session ระหว่างเซิร์ฟเวอร์หลายเครื่อง | ขยายง่ายมาก (Horizontal Scaling) ทุกเซิร์ฟเวอร์ที่มี Secret เดียวกันสามารถตรวจ Token ได้ทันที |

---

## 2. โครงสร้างของ JWT (3 ส่วนประกอบหลัก)

หน้าตาของ JWT จะเป็นข้อความยาวๆ ที่มีเครื่องหมายจุด (`.`) คั่นแบ่งเป็น 3 ส่วน:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2RlZmciLCJyb2xlIjoidXNlciJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└──────────────────┬─────────────────┘ └───────────────────┬──────────────────┘ └───────────────────────┬──────────────────────┘
             1. Header                               2. Payload                                3. Signature
```

### 1) Header (ส่วนหัว)
บอกประเภทของ Token และอัลกอริทึมที่ใช้เข้ารหัส (ส่วนใหญ่คือ `HS256`):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2) Payload (ข้อมูลที่ต้องการส่ง)
เป็นข้อมูลที่เราใส่ไว้เพื่อให้ Server นำไปใช้งานต่อ เช่น `id`, `role`, `email`:
```json
{
  "id": "67cdefg123456",
  "role": "user",
  "iat": 1741584000,
  "exp": 1741670400
}
```

> [!CAUTION]
> **ข้อควรระวังขั้นร้ายแรง**:
> ส่วน Payload ถูกเข้ารหัสด้วย **Base64Url** เท่านั้น ซึ่งใครๆ ก็สามารถนำไปถอดรหัสอ่านได้ผ่านเว็บไซต์อย่าง [jwt.io](https://jwt.io)  
> **ห้ามนำข้อมูลสำคัญ เช่น Password, บัตรเครดิต, หรือ Secret Key ไปใส่ใน Payload เด็ดขาด!**

### 3) Signature (ลายเซ็นดิจิทัล)
เกิดจากการนำ `Base64(Header)` + `Base64(Payload)` + **`JWT_SECRET` (รหัสลับหลังบ้าน)** มาผ่านการ Hash  
- ลายเซ็นนี้เป็นตัวการันตีว่า **ข้อมูลใน Payload ไม่ได้ถูกแอบแก้ไขระหว่างทาง**
- หากแฮกเกอร์แอบแก้ `role: "user"` เป็น `role: "admin"` ลายเซ็นจะไม่ตรงกับ Secret ทันที Server จะปฏิเสธ Token นั้นทิ้ง

---

## 3. แผนภาพการทำงานของระบบ Auth ด้วย JWT

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (React / Postman)
    participant Server as Backend (Express)
    participant DB as MongoDB (Users)

    Note over Client, DB: 🔐 ขั้นตอนที่ 1: เข้าสู่ระบบ (Login Flow)
    Client->>Server: POST /api/v2/users/login (email + password)
    Server->>DB: User.findOne({ email }).select('+password')
    DB-->>Server: ส่งข้อมูล User พร้อม hashed password
    Server->>Server: bcrypt.compare(password, user.password)
    
    alt รหัสผ่านถูกต้อง ✅
        Server->>Server: สร้าง Token ด้วย jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' })
        Server-->>Client: 200 OK + ส่ง Token กลับไป (ทาง HTTP-only Cookie หรือ JSON)
    else รหัสผ่านไม่ถูกต้อง ❌
        Server-->>Client: 401 Unauthorized ("Invalid email or password")
    end

    Note over Client, DB: 🛡️ ขั้นตอนที่ 2: เรียกใช้ Private Route (Protected Flow)
    Client->>Server: GET /api/v2/users/profile (แนบ Token ใน Cookie หรือ Header)
    Server->>Server: jwt.verify(token, JWT_SECRET)
    
    alt Token ถูกต้องและยังไม่หมดอายุ ✅
        Server->>Server: ดึง payload เก็บไว้ที่ req.user
        Server-->>Client: 200 OK + ส่งข้อมูลโปรไฟล์กลับไป
    else Token ปลอมหรือหมดอายุ ❌
        Server-->>Client: 403 Forbidden ("Token is invalid or expired")
    end
```

---

## 4. เก็บ Token ไว้ที่ไหนดีที่สุด? (Cookie vs LocalStorage)

| สถานที่เก็บ | ข้อดี | ข้อเสีย & ช่องโหว่ | วิธีป้องกัน |
| :--- | :--- | :--- | :--- |
| **LocalStorage** | ใช้งานง่ายมาก ฝั่ง Frontend เรียก `localStorage.setItem('token', ...)` แล้วแนบใน Header `Authorization: Bearer <token>` ได้เลย | **เสี่ยงต่อ XSS (Cross-Site Scripting)** สูงมาก หากเว็บโดนฉีดโค้ด JavaScript โดนแฮกเกอร์อ่านและขโมย Token ไปได้ทันที | ❌ หลีกเลี่ยงหากเป็นระบบความปลอดภัยสูง |
| **HTTP-only Cookie** *(แนะนำ 👍)* | **JavaScript ในหน้าเว็บอ่านไม่ได้เลย!** ป้องกันการขโมยผ่าน XSS ได้ 100% เบราว์เซอร์จะแนบ Cookie ไปหา Server ให้อัตโนมัติ | เสี่ยงต่อ CSRF (Cross-Site Request Forgery) | ✅ แก้ได้โดยตั้ง `SameSite: 'Lax'` หรือ `'Strict'` และใช้ร่วมกับ CORS `credentials: true` |

---

## 5. การติดตั้งและการตั้งค่าในโปรเจกต์

### 1) ติดตั้งแพ็กเกจที่จำเป็นใน `backend`
```bash
npm install jsonwebtoken bcrypt cookie-parser
```

### 2) ตั้งค่ารหัสลับใน `.env`
เพิ่มตัวแปรลับลงในไฟล์ [`backend/.env`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/.env):
```env
JWT_SECRET=super_secret_jwt_key_jsd13_2026_random_long_string
JWT_EXPIRES_IN=1d
```

### 3) เปิดใช้งาน `cookie-parser` ใน [`backend/src/server.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/server.js)
```javascript
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // 👈 1. นำเข้า cookie-parser
import { corsOptions } from "./config/cors.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // 👈 2. ให้อ่าน req.cookies ได้
```

---

## 6. เจาะลึกโค้ดตัวอย่างระบบ Authentication ครบวงจร

### ขั้นที่ 1: Hash Password ตอนสมัครสมาชิก (`user.model.js`)
ใช้ `userSchema.pre("save")` เพื่อ Hash รหัสผ่านก่อนลงฐานข้อมูลเสมอ:
```javascript
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  email: { type: String, unique: true, required: true },
  password: { type: String, select: false }, // ซ่อนรหัสผ่านไม่ให้แสดงเวลา query ทั่วไป
}, { timestamps: true });

// Hash รหัสผ่านเมื่อมีการสร้างหรือเปลี่ยน password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = mongoose.model("User", userSchema);
```

---

### ขั้นที่ 2: สร้าง Endpoint เข้าสู่ระบบ (`POST /login`)
ใน [`backend/src/routes/v2/user.routes.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/routes/v2/user.routes.js):
```javascript
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Login endpoint
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 1. ค้นหา User โดยดึง password ออกมาด้วย (+password)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 2. ตรวจสอบรหัสผ่านว่าตรงกับ Hash ใน DB หรือไม่
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. สร้าง JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1d" }
    );

    // 4. ส่ง Token กลับไปทาง HTTP-only Cookie
    res.cookie("token", token, {
      httpOnly: true, // ป้องกัน JavaScript อ่าน Cookie (กัน XSS)
      secure: process.env.NODE_ENV === "production", // ใช้ HTTPS ใน production
      sameSite: "lax", // ป้องกัน CSRF
      maxAge: 24 * 60 * 60 * 1000, // อายุ 1 วัน
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token, // ส่ง token ให้เผื่อกรณี client อยากเก็บเอง
    });
  } catch (err) {
    next(err);
  }
});
```

---

### ขั้นที่ 3: Middleware ตรวจสอบสิทธิ์ (`auth.middleware.js`)
สร้าง Middleware เพื่อดักจับ Token และคัดกรองสิทธิ์:

```javascript
import jwt from "jsonwebtoken";

// Middleware ตรวจสอบว่าล็อกอินหรือยัง
export const verifyToken = (req, res, next) => {
  // 1. ดึง token ได้จากทั้ง Cookie หรือ Header
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // 2. ตรวจสอบลายเซ็นและความถูกต้องของ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
    
    // 3. ฝากข้อมูล user ไว้ใน request object เพื่อให้ route ถัดไปหยิบใช้ได้
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware สำหรับจำกัดสิทธิ์เฉพาะ Admin เท่านั้น
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};
```

#### การนำไปใช้ครอบ Route ที่ต้องการความปลอดภัย:
```javascript
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";

// ใครล็อกอินแล้วก็ดูโปรไฟล์ตัวเองได้
router.get("/profile", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

// ต้องเป็น Admin เท่านั้นถึงจะลบผู้ใช้อื่นได้!
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted by admin" });
});
```

---

## 7. วิธีทดสอบด้วย REST Client (`.rest`)

ดูตัวอย่างการเขียนใน [`backend/src/testHTTP/v2/users-api-v2-auth.rest`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/testHTTP/v2/users-api-v2-auth.rest):

```rest
@baseUrl = http://localhost:3001/api/v2/users

### 1. เข้าสู่ระบบ (Login)
# @name loginRequest
POST {{baseUrl}}/login
Content-Type: application/json

{
    "email": "chirasak@gmail.com",
    "password": "Password123!"
}

### 2. เก็บ Token จากผลลัพธ์ของ Login อัตโนมัติ
@authToken = {{loginRequest.response.body.token}}

### 3. เรียก Private Route ด้วย Authorization Header
GET {{baseUrl}}/profile
Authorization: Bearer {{authToken}}
```

---

## 8. สรุปฟังก์ชันสำคัญของ `jsonwebtoken` (Cheatsheet)

| คำสั่ง | ตัวอย่างโค้ด | หน้าที่การทำงาน |
| :--- | :--- | :--- |
| **`jwt.sign()`** | `jwt.sign({ id, role }, secret, { expiresIn: '1d' })` | สร้าง Token ใหม่ พร้อมกำหนดข้อมูลและวันหมดอายุ |
| **`jwt.verify()`** | `jwt.verify(token, secret)` | ตรวจสอบว่า Token ของแท้หรือไม่ และยังไม่หมดอายุใช่ไหม (ถ้าปลอมจะ throw Error) |
| **`jwt.decode()`** | `jwt.decode(token)` | แกะอ่านข้อมูลใน Payload ตรงๆ **โดยไม่เช็กลายเซ็น** (เหมาะสำหรับดูข้อมูลคร่าวๆ แต่ห้ามใช้ตัดสินใจเรื่องสิทธิ์ความปลอดภัย) |
