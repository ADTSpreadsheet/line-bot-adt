// 📁 utils/randomMessageGenerator.js

const welcomeMessages = [
  "ขอบคุณที่กลับมาอีกครั้งนะครับ! 😊",
  "เฮ้! พี่แอดผมอีกแล้ว ไม่คิดถึงกันหน่อยเหรอ 😜",
  "ยังไม่เบื่อกันใช่มั้ยครับ? ผมยังอยู่ที่เดิม รอให้บริการอยู่ครับ 💻",
  "กลับมาแล้วเหรอ ผมนึกว่าพี่ลืมกันไปแล้ว 😢",
  "ขอต้อนรับเข้าสู่ ADTSpreadsheet อีกครั้งนะครับ 🤗"
];

const annoyedMessages = [
  "นี่ก็ครั้งที่ 3 แล้วนะครับ... เล่นอะไรกับผมเปล่าครับเนี่ย? 😂",
  "Block แล้ว Follow วน ๆ พี่คิดว่าผมไม่รู้ใช่ม้าา 😏",
  "พี่ครับ ถ้าใจไม่มั่นคง บอทก็เสียใจเป็นนะครับ 🥲",
];

function getRandomWelcomeMessage() {
  const index = Math.floor(Math.random() * welcomeMessages.length);
  return welcomeMessages[index];
}

function getRandomAnnoyedMessage() {
  const index = Math.floor(Math.random() * annoyedMessages.length);
  return annoyedMessages[index];
}

module.exports = {
  getRandomWelcomeMessage,
  getRandomAnnoyedMessage
};
