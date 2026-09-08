# 02. Router Structure & V1 In-Memory CRUD

คู่มือส่วนนี้อธิบายระบบการจัดเส้นทาง (Routing) แบบแบ่งเวอร์ชัน และการสร้าง CRUD API แบบ In-Memory (จำลองฐานข้อมูลด้วย JavaScript Array) ในโฟลเดอร์ `v1`

---

## 1. การจัดโครงสร้าง Route แบบลำดับชั้น (Hierarchical Routing)

แทนที่จะเขียน endpoint ทั้งหมดรวมกันไว้ใน `server.js` เราแบ่งหน้าที่ออกเป็นชั้นๆ ด้วย `Router()`:

```
Request วิ่งเข้ามา
  │
  ▼
[server.js] ── app.use("/api", apiRoutes)
  │
  ▼
[src/routes/index.js] ── routes.use("/v1", v1Routes)
  │
  ▼
[src/routes/v1/index.js] ── routes.use("/users", userRoutes)
  │
  ▼
[src/routes/v1/user.routes.js] ── router.get("/", ...), router.post("/", ...)
```

**ผลลัพธ์**: เมื่อนำเส้นทางมารวมกัน Endpoint สุดท้ายจะกลายเป็น:  
`http://localhost:3001/api/v1/users`

> **💡 ทำไมต้องมี `/v1` และ `/v2`? (API Versioning)**  
> เพื่อให้เราสามารถอัปเกรดระบบเป็นเวอร์ชันใหม่ (v2 ที่ใช้ MongoDB) ได้ โดยที่ระบบเดิมของลูกค้า (v1) จะไม่พังและยังคงใช้งานควบคู่กันได้

---

## 2. ฐานข้อมูลจำลอง (`src/fakeDB/fakeUsers.js`)

ดูไฟล์ [`backend/src/fakeDB/fakeUsers.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/fakeDB/fakeUsers.js):

```javascript
export const users = [
  { id: "1", username: "Chirasak", email: "Chirasak@example.com", password: "pass123" },
  { id: "2", username: "Somchai", email: "somchai@example.com", password: "pass456" },
  ...
];
```
- เป็น Array เก็บ Object ธรรมดาอยู่ในหน่วยความจำ (RAM)
- มีประโยชน์อย่างยิ่งสำหรับการฝึกเขียน CRUD เบื้องต้นโดยยังไม่ต้องกังวลเรื่องการตั้งค่า Database

---

## 3. เจาะลึกการทำ CRUD ใน `src/routes/v1/user.routes.js`

ดูไฟล์ [`backend/src/routes/v1/user.routes.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/routes/v1/user.routes.js):

### 1) READ: อ่านข้อมูลทั้งหมด (`GET /`)
```javascript
router.get("/", (req, res, next) => {
  try {
    res.send(users); // ส่ง array users ทั้งหมดกลับไป (Status 200 อัตโนมัติ)
  } catch (err) {
    next(err);
  }
});
```

---

### 2) CREATE: เพิ่มผู้ใช้ใหม่ (`POST /`)
```javascript
router.post("/", (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. ตรวจสอบข้อมูลบังคับ
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required!" });
    }

    // 2. หาค่า ID ที่สูงที่สุดใน Array เพื่อสร้าง ID ถัดไป
    const highestId = users.reduce(
      (max, user) => Math.max(max, Number(user.id)),
      0
    );
    const nextId = String(highestId + 1);

    // 3. สร้าง Object ผู้ใช้ใหม่
    const newUser = { id: nextId, username, email, password };

    // 4. บันทึกลง Array
    users.push(newUser);

    // 5. ตอบกลับด้วย Status 201 (Created)
    return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});
```

#### 🔍 เคล็ดลับมือใหม่: `reduce` ทำงานอย่างไร?
```javascript
users.reduce((max, user) => Math.max(max, Number(user.id)), 0)
```
คำสั่งนี้จะวนลูปผู้ใช้ทุกคน นำค่า `id` มาแปลงเป็นตัวเลข (`Number(user.id)`) แล้วเปรียบเทียบหาตัวเลขที่มากที่สุด หากเจอมากสุดคือ 4 รอบถัดไปก็จะได้ `4 + 1 = "5"`

---

### 3) UPDATE: แก้ไขข้อมูลผู้ใช้ (`PUT /:id`)
```javascript
router.put("/:id", (req, res, next) => {
  try {
    // 1. ค้นหา User ตาม id จาก URL params (req.params.id)
    const user = users.find((u) => u.id === req.params.id);

    // 2. ถ้าหาไม่เจอ ให้ตอบ 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // 3. ตรวจสอบ body ที่ส่งมา
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required!" });
    }

    // 4. อัปเดตค่าลงใน Object เดิม
    user.username = username;
    user.email = email;
    user.password = password;

    // 5. ตอบกลับด้วย Status 200 (OK)
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});
```

---

### 4) DELETE: ลบผู้ใช้ (`DELETE /:id`)
```javascript
router.delete("/:id", (req, res, next) => {
  try {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // หา index ตำแหน่งของผู้ใช้ใน array
    const index = users.indexOf(user);

    // ลบข้อมูลตำแหน่ง index นั้นออกไป 1 รายการ
    users.splice(index, 1);

    // ส่ง Status 204 (No Content) แปลว่าลบสำเร็จ และไม่มีเนื้อหาต้องส่งคืน
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});
```

---

## 4. เสริมความรู้: ไฟล์ทดลอง `splice.js`

ดูไฟล์ [`backend/splice.js`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/splice.js):

```javascript
const fruits = ["Apple", "Banana", "Orange"];
const target = "Apple";

fruits.splice(fruits.indexOf(target), 2);
console.log(fruits); // Output: ["Orange"]
```

### การทำงานของ `splice(startIndex, deleteCount)`:
- `startIndex`: ตำแหน่งเริ่มต้นที่ต้องการลบ (หาได้จาก `indexOf`)
- `deleteCount`: จำนวนตัวที่ต้องการลบ
  - ใน `splice.js` ใส่เลข `2` แปลว่าเริ่มลบตั้งแต่ `"Apple"` ไป 2 ตัว คือลบทั้ง `"Apple"` และ `"Banana"` เหลือแค่ `["Orange"]`
  - แต่ในโค้ด API ลบ User เราใส่ `splice(index, 1)` แปลว่าต้องการลบแค่คนเดียว จึงถูกต้องและปลอดภัย

---

## 5. สรุป HTTP Status Codes ที่ใช้ใน V1

| Status Code | ความหมาย | ใช้ตอนไหน |
| :--- | :--- | :--- |
| **`200 OK`** | สำเร็จ มีข้อมูลส่งกลับ | `GET /`, `PUT /:id` |
| **`201 Created`** | สร้างข้อมูลใหม่สำเร็จ | `POST /` |
| **`204 No Content`** | สำเร็จ แต่ไม่มีข้อมูลต้องส่งกลับ | `DELETE /:id` |
| **`400 Bad Request`** | Client ส่งข้อมูลมาไม่ถูกต้องหรือไม่ครบ | เมื่อขาด `username`, `email`, หรือ `password` |
| **`404 Not Found`** | หาข้อมูลไม่พบตาม ID ที่ส่งมา | เมื่อ `find` หา user ใน array ไม่เจอ |
| **`500 Internal Server Error`** | เซิร์ฟเวอร์มีปัญหาที่ไม่คาดคิด | โยนเข้า Error Handling Middleware |
