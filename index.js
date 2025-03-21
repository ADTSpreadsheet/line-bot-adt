// นำเข้าตัวแปรสภาพแวดล้อมจากไฟล์ .env
require('dotenv').config();

// นำเข้าโมดูลที่จำเป็น
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const indexRouter = require('./routes/index');
const { line } = require('@line/bot-sdk');

// ตรวจสอบตัวแปรสภาพแวดล้อมที่จำเป็น
const requiredEnvVars = [
  'LINE_BOT1_ACCESS_TOKEN',
  'LINE_BOT1_CHANNEL_SECRET',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ ไม่พบตัวแปรสภาพแวดล้อม: ${envVar}`);
    process.exit(1);
  }
});

// สร้างแอปพลิเคชัน Express
const app = express();

// กำหนดค่า LINE SDK
const lineConfig = {
  channelAccessToken: process.env.LINE_BOT1_ACCESS_TOKEN,
  channelSecret: process.env.LINE_BOT1_CHANNEL_SECRET
};

// ติดตั้ง middleware
app.use(cors());

// Middleware สำหรับตรวจสอบลายเซ็น LINE
app.use('/webhook', (req, res, next) => {
  const signature = req.headers['x-line-signature'];
  
  // ถ้าไม่มี body หรือไม่ได้ส่ง signature มา ให้ผ่านไป
  if (!signature || !req.body) {
    // ใช้ body-parser แบบ raw ก่อนเพื่อให้ได้ข้อมูลดิบ
    bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
      }
    })(req, res, next);
    return;
  }
  
  // ตรวจสอบลายเซ็น (ถ้ามี signature)
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
      const signature = req.headers['x-line-signature'];
      const hmac = crypto.createHmac('sha256', lineConfig.channelSecret)
        .update(req.rawBody)
        .digest('base64');
      
      // ถ้าลายเซ็นไม่ตรงกัน
      if (hmac !== signature) {
        console.error('❌ Signature ไม่ถูกต้อง');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('✅ Signature ถูกต้อง');
    }
  })(req, res, next);
});

// ใช้ body-parser สำหรับเส้นทางอื่นๆ
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ใช้เส้นทางหลัก
app.use('/', indexRouter);

// กำหนดพอร์ตและเริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
  console.log(`🌎 URL เซิร์ฟเวอร์: ${process.env.SERVER_URL}`);
  console.log(`🤖 Webhook URL: ${process.env.SERVER_URL}/webhook`);
});

// จัดการข้อผิดพลาด
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
