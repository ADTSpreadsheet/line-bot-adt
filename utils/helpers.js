// utils/helpers.js - ฟังก์ชันช่วยเหลือทั่วไป

/**
 * สร้าง Ref.Code แบบสุ่ม
 * @returns {string} - Ref.Code ที่สร้างขึ้น (รูปแบบ: LETTER-NUMBER-LETTER-NUMBER, เช่น A1B2)
 */
function generateRefCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let code = '';
  
  // รูปแบบ LETTER-NUMBER-LETTER-NUMBER
  code += letters.charAt(Math.floor(Math.random() * letters.length));
  code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  code += letters.charAt(Math.floor(Math.random() * letters.length));
  code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  console.log(`🔑 สร้าง Ref.Code: ${code}`);
  return code;
}

/**
 * สร้าง Serial Key แบบสุ่ม 6 หลัก (ตัวเลข 4 หลักและตัวอักษร 2 หลัก สลับกัน)
 * @returns {string} - Serial Key ที่สร้างขึ้น (รูปแบบ: 6 หลัก)
 */
function generateSerialKey() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // สร้างตำแหน่งสุ่มสำหรับตัวอักษร 2 ตัว
  // เช่น [0, 3] หมายถึงตำแหน่งที่ 0 และ 3 จะเป็นตัวอักษร ส่วนที่เหลือเป็นตัวเลข
  let letterPositions = [];
  while (letterPositions.length < 2) {
    const pos = Math.floor(Math.random() * 6);
    if (!letterPositions.includes(pos)) {
      letterPositions.push(pos);
    }
  }
  
  // สร้าง Serial Key
  let key = '';
  for (let i = 0; i < 6; i++) {
    if (letterPositions.includes(i)) {
      // ตำแหน่งนี้เป็นตัวอักษร
      key += letters.charAt(Math.floor(Math.random() * letters.length));
    } else {
      // ตำแหน่งนี้เป็นตัวเลข
      key += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
  }
  
  console.log(`🔑 สร้าง Serial Key: ${key}`);
  return key;
}

/**
 * คำนวณเวลาหมดอายุตามจำนวนนาทีที่กำหนด
 * สำหรับคอลัมน์ประเภท timetz ในฐานข้อมูล
 * @param {number} minutes - จำนวนนาทีสำหรับการหมดอายุ
 * @returns {string} - เวลาหมดอายุในรูปแบบ HH:MM:SS+07
 */
function calculateExpiryTime(minutes) {
  const now = new Date();
  const expiry = new Date(now.getTime() + minutes * 60000);
  
  // สร้างเวลาในรูปแบบ HH:MM:SS+07 สำหรับประเภทข้อมูล timetz
  // เนื่องจากเราใช้ Time Zone เป็น Asia/Bangkok (+07)
  const timeOnly = expiry.toTimeString().split(' ')[0] + '+07';
  
  console.log(`⏱️ เวลาหมดอายุ: ${timeOnly} (${minutes} นาที)`);
  return timeOnly;
}

/**
 * แปลงวันที่เป็นรูปแบบ ISO String (YYYY-MM-DD)
 * @param {Date} date - วันที่ที่ต้องการแปลง
 * @returns {string} - วันที่ในรูปแบบ YYYY-MM-DD
 */
function formatDateToISOString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * แปลงเวลาเป็นรูปแบบ HH:MM:SS+07 สำหรับ timetz
 * @param {Date} date - วันที่และเวลาที่ต้องการแปลง
 * @returns {string} - เวลาในรูปแบบ HH:MM:SS+07
 */
function formatTimeForTimetz(date) {
  return date.toTimeString().split(' ')[0] + '+07';
}

module.exports = {
  generateRefCode,
  generateSerialKey,
  calculateExpiryTime,
  formatDateToISOString,
  formatTimeForTimetz
};
