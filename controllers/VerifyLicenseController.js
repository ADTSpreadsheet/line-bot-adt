const { supabase } = require('../utils/supabaseClient');

const verifyLicense1 = async (req, res) => {
  try {
    const { license_no, national_id, phone_number } = req.body;

    // ───────────────────────────────
    // 0. ตรวจสอบว่า input ครบหรือไม่
    // ───────────────────────────────
    if (!license_no || !national_id || !phone_number) {
      console.log("⚠️ [0] ข้อมูลไม่ครบ");
      return res.status(400).json({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // ───────────────────────────────
    // 1. ตรวจสอบว่า license_no มีอยู่หรือไม่
    // ───────────────────────────────
    const { data: licenseCheck, error: licenseError } = await supabase
      .from('license_holders')
      .select('license_no, status, verify_count')
      .eq('license_no', license_no)
      .single();

    // 1.1 ไม่พบ license_no ในระบบ
    if (licenseError || !licenseCheck) {
      console.log("❌ [1.1] ไม่พบ license_no:", license_no);
      return res.status(404).json({
        message: 'ระบบตรวจสอบไม่พบรหัสลิขสิทธิ์ของท่านกรุราติดต่อ ADT-Admin'
      });
    }

    // 1.2 พบ license แต่สถานะไม่ใช่ Pending
    if (licenseCheck.status !== 'Pending') {
      console.log("🔁 [1.2] License เคยยืนยันแล้ว:", license_no);
      return res.status(409).json({
        message: 'รหัสลิขสิทธิ์ได้รับการยืนยันเรียบร้อยแล้ว'
      });
    }
// 1.3  พบ license_no + phone_number ตรง แต่ยังไม่มี national_id
    const { data: partialMatch, error: partialError } = await supabase
  .from('license_holders')
  .select('license_no, first_name, last_name')
  .eq('license_no', license_no)
  .eq('phone_number', phone_number)
  .is('national_id', null) // national_id เป็น null
  .single();

if (partialMatch) {
  console.log("🟡 [1.3] พบ License + Phone ตรง แต่ยังไม่มีเลขบัตรประชาชน:", license_no);
  return res.status(206).json({
    message: 'ระบบตรวจสอบไม่พบเลขบัตรประชาชนของท่าน กรุณากรอกเพื่อยืนยันตัวตน',
   
  });
}

    // ───────────────────────────────
    // 2. ตรวจสอบข้อมูลผู้ใช้ว่าตรงกับ license หรือไม่
    // ───────────────────────────────
    const { data, error } = await supabase
      .from('license_holders')
      .select('license_no, first_name, last_name, verify_count')
      .eq('license_no', license_no)
      .eq('national_id', national_id)
      .eq('phone_number', phone_number)
      .single();

    // 2.1 ข้อมูลตรง → ยืนยันสำเร็จ
    if (data) {
      console.log("✅ [2.1] ยืนยันสำเร็จ:", data.license_no);
      return res.status(200).json({
        license_no: data.license_no,
        full_name: `${data.first_name} ${data.last_name}`,
        message: 'Your copyright has been successfully verified.'
      });
    }

    // 2.2 ข้อมูลผิด → ตรวจนับครั้ง
    const verifyCount = licenseCheck.verify_count || 0;

    if (verifyCount < 2) {
      const newCount = verifyCount + 1;

      await supabase
        .from('license_holders')
        .update({ verify_count: newCount })
        .eq('license_no', license_no);

      console.log(`⚠️ [2.2] ข้อมูลผิด (ครั้งที่ ${newCount}) → ${license_no}`);
      return res.status(401).json({
        message: 'ข้อมูลไม่ตรง กรุณาลองใหม่อีกครั้ง',
        verify_count: newCount,
        attempts_remaining: `กรุณาลองใหม่อีก ${4 - newCount}/3`
      });
    }

    // ───────────────────────────────
    // 3. เกิน 3 ครั้ง → บล็อกการตรวจสอบ
    // ───────────────────────────────
    await supabase
      .from('license_holders')
      .update({ verify_count: 4 })
      .eq('license_no', license_no);

    console.log("🚫 [3] ถูกบล็อก - เกิน 3 ครั้ง:", license_no);
    return res.status(403).json({
      message: 'คุณตรวจสอบผิดเกินจำนวนที่กำหนด กรุณาติดต่อผู้ดูแลระบบ'
    });

  } catch (err) {
    console.error('❌ [ERROR] VERIFY LICENSE1', err);
    return res.status(500).json({
      message: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง'
    });
  }
};

//--------------------------------------------------------------- 
// ฟังก์ชันสำหรับตรวจสอบใบอนุญาตด้วยวิธีที่ 2 (เตรียมไว้สำหรับใช้งานในอนาคต)
//--------------------------------------------------------------- 

const verifyLicense2 = async (req, res) => {
  try {
    // เตรียมไว้สำหรับการตรวจสอบในรูปแบบที่ 2
    // เช่น ตรวจสอบด้วย email + license_no หรือวิธีอื่นๆ
    
    // สำหรับตอนนี้ส่งข้อความแจ้งว่าฟังก์ชันนี้ยังไม่พร้อมใช้งาน
    return res.status(200).json({ 
      message: 'ฟังก์ชัน verifyLicense2 อยู่ระหว่างการพัฒนา'
    });
  } catch (err) {
    console.error('❌ [VERIFY LICENSE2 ERROR]', err);
    return res.status(404).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง' });
  }
};

//---------------------------------------------------------------    
// ฟังก์ชันสำหรับตรวจสอบ Ref.Code และ Serial Key
//---------------------------------------------------------------
    
const verifyRefCodeAndSerial = async (req, res) => {
  try {
    const { ref_code, serial_key } = req.body;
    
    if (!ref_code || !serial_key) {
      return res.status(404).json({ message: 'กรุณาระบุ Ref.Code และ Serial Key' });
    }
    
    // เตรียมไว้สำหรับการตรวจสอบ Ref.Code และ Serial Key
    // เช่น ตรวจสอบว่ามีคู่ Ref.Code และ Serial Key นี้ในฐานข้อมูลหรือไม่
    
    // สำหรับตอนนี้ส่งข้อความแจ้งว่าฟังก์ชันนี้ยังไม่พร้อมใช้งาน
    return res.status(200).json({ 
      message: 'ฟังก์ชัน verifyRefCodeAndSerial อยู่ระหว่างการพัฒนา'
    });
  } catch (err) {
    console.error('❌ [VERIFY REF CODE AND SERIAL ERROR]', err);
    return res.status(404).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง' });
  }
};

module.exports = {
  verifyLicense1,
  verifyLicense2,
  verifyRefCodeAndSerial
};
