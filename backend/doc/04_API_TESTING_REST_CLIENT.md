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

## 2. เจาะลึกไฟล์ทดสอบ V1 (`users-apu-test.rest`)

ดูไฟล์ [`backend/users-apu-test.rest`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/users-apu-test.rest):

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

## 3. เจาะลึกไฟล์ทดสอบ V2 (`users-apu-test-v2.rest`)

ดูไฟล์ [`backend/users-apu-test-v2.rest`](file:///c:/Users/DoctorDear/Code/JSD13/week-10/jsd-mono-repo/backend/users-apu-test-v2.rest):

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

## 4. กฎไวยากรณ์ (Syntax Rules) ของ REST Client ที่ต้องระวัง

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
