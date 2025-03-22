const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../database');
const { generateRefCode, generateSerialKey, calculateExpiryTime } = require('../utils/helpers');
const LINE_TOKEN = process.env.LINE_BOT1_ACCESS_TOKEN;

// เส้นทางหลัก
router.get('/', (req, res) => {
  res.send('LINE Bot API is running!');
});

router.post('/webhook', async (req, res) => {
  console.log('📩 Webhook request received:', JSON.stringify(req.body).substring(0, 200) + '...');
  
  const events = req.body.events;
  if (!events || events.length === 0) {
    console.log('❌ No events received');
    return res.status(200).end();
  }
  
  for (const event of events) {
    const replyToken = event.replyToken;
    const userId = event.source.userId;
    const messageType = event.message?.type;
    const messageText = event.message?.text;
    
    console.log(`✅ Received from ${userId}: ${messageText}`);
    console.log(`📊 Event type: ${event.type}, Message type: ${messageType}`);
    
    if (messageText === 'REQ_REFCODE') {
      console.log('🔍 Processing REQ_REFCODE command');
      
      try {
        // ตรวจสอบว่ามี Ref.Code ที่ยังไม่หมดอายุ
        console.log(`🔍 Checking active sessions for user: ${userId}`);
        const existingSession = await db.findActiveSessionByUser(userId, 'PENDING');
        
        if (existingSession) {
          console.log(`📌 Found existing session: ${JSON.stringify(existingSession)}`);
          await replyText(replyToken, `📌 คุณมี Ref.Code ที่ยังใช้งานได้
รหัสคือ: ${existingSession.ref_code}`);
          return;
        }
        
        // สร้าง Ref.Code และ Serial Key ใหม่
        const refCode = generateRefCode();
        const serialKey = generateSerialKey();
        const expiresAt = calculateExpiryTime(15); // นาที
        
        const sessionData = {
          line_user_id: userId,
          ref_code: refCode,
          serial_key: serialKey,
          status: 'PENDING',
          request_count: 1,
          verify_count: 0,
          day_created_at: new Date().toISOString().split('T')[0],
          time_created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verify_at: new Date().toISOString(),
          expires_at: expiresAt
        };
        
        console.log('📋 Creating session with data:', JSON.stringify(sessionData));
        
        const { data, error } = await db.createSession(sessionData);
        
        if (error) {
          console.error('❌ Failed to create session:', error);
          await replyText(replyToken, 'เกิดข้อผิดพลาดในการสร้างรหัส กรุณาลองใหม่ภายหลัง');
          return;
        }
        
        console.log('✅ Session created successfully:', data);
        
        await replyText(replyToken, `✅ สร้าง Ref.Code สำเร็จแล้ว!
รหัสของคุณคือ: ${refCode}
กรุณากรอกใน Excel VBA แล้วกด Verify ครับ ✅`);
      } catch (err) {
        console.error('❌ Error processing REQ_REFCODE:', err);
        await replyText(replyToken, 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง');
      }
    } else if (messageText === 'PING') {
      // เพิ่มคำสั่งทดสอบการเชื่อมต่อ
      await replyText(replyToken, 'PONG! ระบบทำงานปกติ');
    } else {
      // สำหรับข้อความอื่นๆ
      await replyText(replyToken, `คุณพิมพ์ว่า: ${messageText}`);
    }
  }
  
  res.status(200).send('OK');
});

async function replyText(replyToken, text) {
  try {
    console.log('📤 Sending reply with text:', text);
    
    const response = await axios.post(
      'https://api.line.me/v2/bot/message/reply',
      {
        replyToken,
        messages: [{ type: 'text', text }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_TOKEN}`
        }
      }
    );
    
    console.log('✅ Reply sent successfully:', response.status);
    return true;
  } catch (err) {
    console.error('❌ Error replying to LINE:', err.response?.data || err.message);
    console.error('❌ Full error:', err);
    return false;
  }
}

module.exports = router;
