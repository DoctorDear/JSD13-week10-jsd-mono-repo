# คู่มือ Error Handling ใน Express.js (ฉบับมือใหม่เข้าใจง่าย 🚀)

---

## 1. Error Handling คืออะไร? ทำไมต้องมี?

ลองจินตนาการว่า **Backend ของเราคือ "พนักงานร้านอาหาร"**:
- **ถ้าไม่มี Error Handling**: เมื่อวัตถุดิบหมด หรือทำจานแตก พนักงานจะ "ช็อกสลบไปเลย" (Server Crash) ลูกค้าก็นั่งรอเก้อ ไม่รู้ว่าอาหารจะได้ไหม
- **ถ้ามี Error Handling**: เมื่อเกิดปัญหา พนักงานจะเดินมาบอกลูกค้าอย่างสุภาพว่า *"ขอโทษครับ เมนูนี้หมด เปลี่ยนเป็นเมนูอื่นได้ไหมครับ"* (ตอบกลับ Status Code และ Message ให้ Client ทราบอย่างถูกต้อง)

> **สรุปสั้นๆ**: Error Handling คือการเตรียมแผนรับมือเมื่อมีสิ่งผิดปกติเกิดขึ้น เพื่อไม่ให้ Server พัง และแจ้งเตือนผู้ใช้งาน/Frontend ได้อย่างถูกต้อง

---

## 2. ขั้นตอนการทำงานแบบ "รวมศูนย์" (Centralized Error Handling)

ในโปรเจกต์นี้เราใช้แนวคิด **Centralized Error Handling** (มีแผนกจัดการ Error กลางเพียงที่เดียว)

### แผนภาพจำลองการทำงาน

```
[1. Client ยิง Request เข้ามา]
            │
            ▼
[2. Route / Endpoint (เช่น GET /api/v2/users)]
            │
            ├── ทำงานสำเร็จ ───► ส่งข้อมูลให้ Client (res.status(200).json(...))
            │
            └── เกิด Error! (เข้า catch)
                     │
                     ▼
             เรียก next(err) 🚀
                     │
                     ▼ (Express ข้าม Route อื่นทั้งหมดทันที)
                     │
[3. Centralized Error Middleware ใน server.js]
            │
            ▼
[4. ส่ง JSON บอก Client ว่าพังตรงไหน (res.status(500).json(...))]
```

---

## 3. เจาะลึก 3 จุดสำคัญในโค้ดของโปรเจกต์นี้

### จุดที่ 1: ใน Route (`try...catch`)
ดูตัวอย่างจาก `backend/src/routes/v2/user.routes.js`:

```javascript
router.get("/", async (req, res, next) => {
  try {
    // 1. โค้ดที่เสี่ยงจะพัง ให้เอามาไว้ใน try
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    // 2. ถ้ามีปัญหา ให้กระโดดมาที่ catch แล้วส่งต่อให้ส่วนกลาง
    next(err); 
  }
});
```

---

### จุดที่ 2: คำสั่ง `next(err)` คืออะไร?
ปกติ `next()` ใน Express จะมี 2 โหมด:
1. `next()` (ไม่มี argument): *"ฉันตรวจเสร็จแล้ว ส่งต่อให้ middleware ถัดไปได้"*
2. `next(err)` (มี argument ส่ง Error ไปด้วย): *"เกิดปัญหาแล้ว! ข้าม middleware ปกติทั้งหมด แล้ววิ่งตรงไปหา Error Handler ตัวกลางทันที!"*

---

### จุดที่ 3: Error Handling Middleware ใน `server.js`
ดูที่ท้ายไฟล์ `backend/src/server.js`:

```javascript
// Centralize Error Handling Middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server...",
    message: err.message,
  });
});
```

#### ⚠️ กฎสำคัญมาก 2 ข้อ:
1. **ต้องมี parameter ครบ 4 ตัวเสมอ**: `(err, req, res, next)` ห้ามลบ `next` ออกเด็ดขาด แม้จะไม่ได้เรียกใช้ เพราะ Express จะรู้ว่าเป็น Error Handler ก็ต่อเมื่อฟังก์ชันนั้นมีพารามิเตอร์ 4 ตัวเท่านั้น!
2. **ต้องวางไว้บรรทัดล่างสุดของ Route ทั้งหมด**: เสมือนเป็น "ตาข่ายดักจับลูกบอลลูกสุดท้าย" ถ้านำไปไว้บนก่อน Route มันจะไม่ดักจับ Error ให้

---

## 4. Error 2 แบบที่มือใหม่ต้องแยกให้ออก

| ประเภท | คำอธิบาย | ตัวอย่าง HTTP Status | ตัวอย่างในโค้ด |
| :--- | :--- | :--- | :--- |
| **1. Client Error (เราจงใจตรวจ)** | ผู้ใช้ส่งข้อมูลผิด เช่น ไม่กรอกรหัสผ่าน, หา ID ไม่เจอ | `400 Bad Request`<br/>`404 Not Found` | ใช้ `if (...) return res.status(400)` ใน Route ได้เลย |
| **2. Server/System Error (อุบัติเหตุที่ไม่คาดคิด)** | ระบบพัง เช่น Database ดับ, Syntax error, Mongoose query ล้มเหลว | `500 Internal Server Error` | โยนเข้า `catch (err)` แล้วเรียก `next(err)` ส่งให้ส่วนกลาง |

### ตัวอย่างเปรียบเทียบใน Route เดียวกัน:
```javascript
router.post("/", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // แบบที่ 1: ตรวจสอบข้อมูลจาก Client (Client Error)
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "username, email and password are required" 
      });
    }

    // จุดเสี่ยง Server Error: ติดต่อ Database
    const newUser = await User.create({ username, email, password });
    return res.status(201).json(newUser);

  } catch (err) {
    // แบบที่ 2: ระบบมีปัญหา (Database ล่ม, ข้อมูลซ้ำ ฯลฯ)
    next(err); // วิ่งไปหา status 500 ส่วนกลาง
  }
});
```

---

## 5. ข้อผิดพลาดที่มือใหม่เจอบ่อย (Common Pitfalls)

1. **ลืมใส่ `return` หน้า `res.status(...)` ในเงื่อนไข `if`**:
   ```javascript
   // ❌ ผิด: โค้ดจะยังทำงานต่อไปข้างล่าง ทำให้เกิด Cannot set headers after they are sent
   if (!user) {
     res.status(404).json({ error: "User not found!" });
   }

   // ✅ ถูก: ต้องมี return เพื่อหยุดการทำงานทันที
   if (!user) {
     return res.status(404).json({ error: "User not found!" });
   }
   ```

2. **เขียนพารามิเตอร์ใน Error Middleware แค่ 3 ตัว**:
   ```javascript
   // ❌ ผิด: Express จะคิดว่าเป็น Middleware ปกติ ไม่ใช่ Error Handler
   app.use((err, req, res) => { ... });

   // ✅ ถูก: ต้องมี 4 ตัวเสมอ (err, req, res, next)
   app.use((err, req, res, next) => { ... });
   ```

3. **วาง Error Middleware ไว้ก่อนหน้า Route**:
   ```javascript
   // ❌ ผิด: วางก่อน route ทำให้ Request ที่ Error ข้างล่างย้อนขึ้นมาไม่ถึง
   app.use((err, req, res, next) => { ... });
   app.use("/api", apiRoutes);

   // ✅ ถูก: ต้องวางหลัง route ทั้งหมดเสมอ
   app.use("/api", apiRoutes);
   app.use((err, req, res, next) => { ... });
   ```

---

## 6. สรุปสูตรจำง่ายๆ

1. โค้ดจุดไหนที่มีโอกาสพัง (เช่น ต่อ Database) 👉 ครอบด้วย `try...catch`
2. ในบล็อก `catch` อย่าตอบเอง 👉 ให้เรียก `next(err)`
3. ให้ Error Middleware ตัวเดียวที่ท้าย `server.js` 👉 เป็นคนตอบ `res.status(500)` กลับไปให้ Client เสมอ
