# 03. Mongoose Schema & V2 Database CRUD

คู่มือส่วนนี้อธิบายการก้าวไปสู่อีกระดับของการพัฒนา Backend ด้วยการเชื่อมต่อกับฐานข้อมูลจริง (MongoDB) ผ่าน Mongoose ในโฟลเดอร์ `v2`

---

## 1. Mongoose คืออะไร? (ODM - Object Data Modeling)

MongoDB เป็นฐานข้อมูลแบบ NoSQL ที่เก็บข้อมูลเป็น Document ยืดหยุ่น แต่ในทางปฏิบัติเราต้องการให้ข้อมูลมีระเบียบ มีกฎเกณฑ์ เช่น:
- User ต้องมีอีเมลที่ถูกต้อง
- Username ห้ามซ้ำกัน
- ต้องบันทึกวันเวลาที่สร้างข้อมูลอัตโนมัติ

**Mongoose** ทำหน้าที่เป็นตัวกลาง (ODM) ช่วยกำหนดกฎเกณฑ์ (Schema) และควบคุมการทำงานกับ Database ให้ปลอดภัยและเป็นระเบียบ

---

## 2. เจาะลึกการสร้าง Schema & Model (`src/models/user.model.js`)

ดูไฟล์ [`backend/src/models/user.model.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/models/user.model.js):

```javascript
import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: { type: String, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
```

### การตั้งค่าที่สำคัญ:
1. **`unique: true`**:
   - สร้าง Index บังคับว่า `username` และ `email` ต้องไม่ซ้ำกับคนอื่นในระบบ
2. **`lowercase: true` และ `trim: true`**:
   - `lowercase`: ปรับอีเมลเป็นตัวพิมพ์เล็กเสมอ (เช่น `Dear@Example.com` ➔ `dear@example.com`)
   - `trim`: ตัดช่องว่างหัวท้ายที่ผู้ใช้อาจเผลอเคาะ spacebar ออกให้อัตโนมัติ
3. **`match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]`**:
   - ตรวจสอบรูปแบบ Regex เพื่อให้มั่นใจว่าเป็นอีเมลที่ถูกต้อง (มี `@` และ `.`) ถ้าผิดรูปแบบ Mongoose จะปฏิเสธการบันทึกทันที
4. **`password: { type: String, select: false }` (สำคัญมากด้าน Security 🔐)**:
   - สั่งให้ Mongoose **ไม่ดึงรหัสผ่านออกมาโดยอัตโนมัติ** เมื่อเราเรียกคำสั่ง `find()` เพื่อป้องกันไม่ให้รหัสผ่านหลุดออกไปหา Client โดยไม่ได้ตั้งใจ
5. **`{ timestamps: true }`**:
   - Mongoose จะสร้างฟิลด์ `createdAt` (เวลาที่สร้าง) และ `updatedAt` (เวลาที่มีการแก้ไขล่าสุด) ให้เองอัตโนมัติ

---

## 3. เจาะลึก CRUD กับ MongoDB ใน `src/routes/v2/user.routes.js`

ดูไฟล์ [`backend/src/routes/v2/user.routes.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/routes/v2/user.routes.js):

ทุกฟังก์ชันในเวอร์ชันนี้จะเป็น **`async (req, res, next) => { ... }`** เพราะการติดต่อกับ Database ต้องรอคำตอบ (I/O Operation) เสมอ

---

### 1) READ: อ่านข้อมูลทั้งหมด (`GET /`)
```javascript
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});
```
- **`User.find()`**: ดึงข้อมูลผู้ใช้ทั้งหมดจาก MongoDB
- เนื่องจากเราตั้ง `select: false` ไว้ที่ password ผู้ใช้ที่ได้รับกลับไปจะไม่มีฟิลด์รหัสผ่านติดไปด้วย ปลอดภัย 100%

---

### 2) CREATE: สร้างผู้ใช้ใหม่ (`POST /`)
```javascript
router.post("/", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required" });
    }

    // สร้าง Document ใหม่ใน MongoDB
    const newUser = await User.create({ username, email, password });

    // เทคนิคตัด Password ออกก่อนส่ง Response ให้ Client
    const { password: _password, ...userWithoutPassword } = newUser.toObject();
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});
```

#### 💡 เทคนิคเด็ด: Object Destructuring Rest Syntax
```javascript
const { password: _password, ...userWithoutPassword } = newUser.toObject();
```
1. `newUser.toObject()` แปลง Mongoose Document ให้เป็น Plain JavaScript Object ธรรมดา
2. ดึงค่า `password` แยกออกไปใส่ไว้ในตัวแปร `_password`
3. ส่วนที่เหลือทั้งหมด (`...rest`) จะถูกเก็บไว้ใน `userWithoutPassword`
4. ทำให้ Client ได้รับข้อมูลครบทุกอย่าง *ยกเว้นรหัสผ่าน*

---

### 3) UPDATE: อัปเดตข้อมูลผู้ใช้ (`PUT /:id`)
```javascript
router.put("/:id", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required!" });
    }

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true, runValidators: true } // 👈 Options สำคัญ 2 ตัว
    ).select("-password");

    if (!updateUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    return res.status(200).json(updateUser);
  } catch (err) {
    next(err);
  }
});
```

#### ⚠️ ทำไมต้องใส่ Options `{ new: true, runValidators: true }`?
1. **`new: true`**:
   - ค่าเริ่มต้นของ Mongoose จะส่งข้อมูลตัวเดิม *ก่อนอัปเดต* กลับมา การใส่ `new: true` จะบังคับให้คืนค่าข้อมูล *เวอร์ชันใหม่หลังอัปเดตแล้ว*
2. **`runValidators: true`**:
   - ปกติ Mongoose จะรันการตรวจ Schema (เช่น regex ของอีเมล) เฉพาะตอน `create()` เท่านั้น แต่ถ้าเป็นการ `update` มันจะไม่ตรวจให้! การใส่ option นี้จะสั่งให้ Mongoose ตรวจสอบความถูกต้องของข้อมูลใหม่ก่อนอัปเดตเสมอ
3. **`.select("-password")`**:
   - สั่งตัดฟิลด์ password ออกจากผลลัพธ์ที่ส่งกลับ

---

### 4) DELETE: ลบผู้ใช้ (`DELETE /:id`)
```javascript
router.delete("/:id", async (req, res, next) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);

    if (!deleteUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.status(200).json({
      message: "User successfully deleted",
    });
  } catch (err) {
    next(err);
  }
});
```
- **`User.findByIdAndDelete(req.params.id)`**: ค้นหาตาม `_id` ของ MongoDB และทำการลบทันที หากมีข้อมูลจะคืนค่า document ที่ถูกลบมา ถ้าไม่มีจะคืนค่า `null` (นำไปเช็คเงื่อนไข `!deleteUser` เพื่อตอบ 404)
