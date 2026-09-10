const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173", // URL ของ Frontend Vite
  "http://localhost:3000", // เผื่อกรณีรัน React ทั่วไป
];

export const corsOptions = {
  origin: (origin, callback) => {
    // 1. อนุญาต Request ที่ไม่มี Origin (เช่น Postman, REST Client, mobile apps หรือ server-to-server)
    // 2. หรือถ้า Origin นั้นอยู่ในรายการที่อนุญาต
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true, // อนุญาตให้ส่ง Cookies / Auth Headers ได้
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
