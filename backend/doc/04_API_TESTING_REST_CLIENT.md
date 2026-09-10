# 04. API Testing ด้วย REST Client

คู่มือส่วนนี้อธิบายวิธีการทดสอบ API โดยไม่ต้องพึ่งโปรแกรมภายนอกอย่าง Postman ผ่านไฟล์ `.rest` ที่เราสร้างไว้ในโปรเจกต์

---

## 1. REST Client คืออะไร? ทำไมถึงนิยมใช้?

**REST Client** เป็น Extension บน VS Code ที่ช่วยให้เราสามารถเขียนคำสั่งยิง HTTP Request ได้โดยตรงจากไฟล์ข้อความธรรมดา (`.rest` หรือ `.http`):

### ข้อดีเมื่อเทียบกับ Postman:
1. **เก็บบันทึกไว้ใน Git ได้**: ไฟล์ทดสอบอยู่คู่กับโค้ด เพื่อนร่วมทีมดึงโปรเจกต์ไปก็สามารถกดรันเทสต์ได้ทันที ไม่ต้อง export/import ให้ยุ่งยาก
2. **เบาและรวดเร็ว**: อยู่ใน VS Code หน้าจอเดียวกับที่เขียนโค้ด ไม่ต้องสลับหน้าจอไปมา
3. **มีปุ่ม "Send Request" ให้กดเล่นได้ทันที**: เมื่อติดตั้ง Extension จะมีปุ่มเล็กๆ เหนือบรรทัดคำขอให้คลิกทดสอบได้เลย

---

## 2. เจาะลึกไฟล์ทดสอบ V1 (`src/testHTTP/v1/users-api-test.rest`)

ดูไฟล์ [`backend/src/testHTTP/v1/users-api-test.rest`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/testHTTP/v1/users-api-test.rest):

```http
### Read all users
GET http://localhost:3001/api/v1/users

### Create a new user
POST http://localhost:3001/api/v1/users
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secretpassword"
}

### Update a user
PUT http://localhost:3001/api/v1/users/1
Content-Type: application/json

{
  "username": "Chirasak Updated",
  "email": "chirasak_updated@example.com",
  "password": "newpassword123"
}

### Delete a user
DELETE http://localhost:3001/api/v1/users/1

### Trigger centralize error handling middleware
POST http://localhost:3001/api/v1/users
Content-Type: application/json

{
  "username": "test",
```

### ไฮไลต์สำคัญใน V1:
- เคสสุดท้าย (`Trigger centralize error handling middleware`) มีการจงใจส่ง JSON ไม่สมบูรณ์ (ไม่มีวงเล็บปิด `}`) 
- เมื่อส่งไป Express จะแปลง JSON ไม่สำเร็จ เกิด SyntaxError และส่งต่อไปยัง Centralized Error Handling Middleware เพื่อตอบ `500` กลับมา เป็นเทคนิคที่ดีมากในการทดสอบว่าตัวดักจับ error ทำงานจริงไหม

---

## 3. เจาะลึกไฟล์ทดสอบ V2 (`src/testHTTP/v2/users-api-test-v2.rest`)

ดูไฟล์ [`backend/src/testHTTP/v2/users-api-test-v2.rest`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/testHTTP/v2/users-api-test-v2.rest):

```http
@baseUrl = http://localhost:3001/api/v2

### Read all users
GET {{baseUrl}}/users

### Create a new user
POST {{baseUrl}}/users
Content-Type: application/json

{
  "username": "Chirasak",
  "email": "dearchirasak@example.com",
  "password": "pass123" 
}

### Update a user
PUT {{baseUrl}}/users/6a9e62ec36f97c1081654d53
Content-Type: application/json

{
  "username": "ChirasakUpandDown",
  "email": "chirasak_updated@example.com",
  "password": "newpassword123"
}

### Delete User
DELETE {{baseUrl}}/users/6a9e630136f97c1081654d56
```

### การปรับปรุงที่ชาญฉลาดใน V2:
1. **การใช้ตัวแปร `@baseUrl`**:
   - บรรทัดแรกกำหนด `@baseUrl = http://localhost:3001/api/v2`
   - เวลาเรียกใช้ให้พิมพ์ `{{baseUrl}}/users` ทำให้ถ้าเราเปลี่ยน Port หรือเปลี่ยน Domain ในอนาคต ก็แก้ที่บรรทัดบนสุดเพียงจุดเดียว
2. **MongoDB ObjectId**:
   - ใน v2 ค่า ID จะเป็นรหัส Hex 24 ตัวอักษรของ MongoDB (เช่น `6a9e62ec36f97c1081654d53`) แทนที่จะเป็นตัวเลข `"1"` เหมือน v1

---

## 4. เจาะลึกไฟล์ทดสอบ Auth Flow (`src/testHTTP/v2/users-api-v2-auth.rest`)

ดูไฟล์ [`backend/src/testHTTP/v2/users-api-v2-auth.rest`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/src/testHTTP/v2/users-api-v2-auth.rest):
ไฟล์นี้ถูกออกแบบมาเพื่อทดสอบ **Cookie-based Authentication Flow** ครบทั้ง 5 ขั้นตอน:

```http
@baseUrl = http://localhost:3001/api/v2/users
@email = test02@example.com
@password = pass123

### 1. Check Auth without token (Expect 401 Access denied)
GET {{baseUrl}}/auth

### 2. Login success (Sets accessToken cookie)
POST {{baseUrl}}/login
Content-Type: application/json

{
    "email": "{{email}}",
    "password": "{{password}}"
}

### 3. Check Auth with Cookie (Expect 200 OK & user data)
GET {{baseUrl}}/auth

### 4. Logout (Clears accessToken cookie)
POST {{baseUrl}}/logout

### 5. Check Auth after Logout (Expect 401 Access denied)
GET {{baseUrl}}/auth
```

> **ความเจ๋งของ REST Client กับ Cookie**:
> เมื่อเรายิงข้อ 2 (`POST /login`) แล้วเซิร์ฟเวอร์ส่ง `Set-Cookie: accessToken=...` กลับมา เจ้า Extension REST Client จะจดจำ Cookie นี้ไว้ในไฟล์ `cookies.txt` อัตโนมัติ! ทำให้เมื่อเรากดยิงข้อ 3 (`GET /auth`) มันจะแนบ Cookie ไปให้อัตโนมัติเหมือนเรากำลังเปิดเบราว์เซอร์จริงเลย!

---

## 5. กฎไวยากรณ์ (Syntax Rules) ของ REST Client ที่ต้องระวัง

1. **เครื่องหมาย `###` (Triple Hash)**:
   - ใช้เพื่อแบ่งแยกระหว่าง Request แต่ละตัว **ห้ามลืมใส่** ไม่งั้นคำขอจะรวมกันเป็นคำสั่งเดียว
2. **การเว้นบรรทัดว่าง 1 บรรทัดก่อน Body**:
   - ระหว่าง Header (`Content-Type: application/json`) กับตัว JSON Body **ต้องมีบรรทัดว่างคั่น 1 บรรทัดเสมอ** ถ้าไม่มี HTTP จะแยกไม่ออกว่าตรงไหนคือ Header หรือ Body:
   ```http
   POST {{baseUrl}}/users
   Content-Type: application/json
   <-- ต้องมีบรรทัดว่างตรงนี้เสมอ! -->
   {
     "username": "dear"
   }
   ```
3. **การจำลอง Header สำหรับทดสอบ CORS**:
   - สามารถพิมพ์ `Origin: http://localhost:5173` ใต้บรรทัด Method ได้เลย เพื่อทดสอบว่าเซิร์ฟเวอร์ตอบกลับ Header CORS ให้หรือไม่
