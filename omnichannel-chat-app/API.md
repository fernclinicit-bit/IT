# Fern Clinic Chat API

ใช้ deploy เป็น Render Web Service ได้ด้วยคำสั่ง `npm start`

## Render settings

- Service type: Web Service
- Build Command: เว้นว่าง หรือ `npm install`
- Start Command: `npm start`
- Root Directory: เว้นว่าง ถ้า repo มีไฟล์นี้อยู่หน้าแรก หรือใส่ `Codex/2026-07-07/omnichannel-chat-app` ถ้า repo อัพทั้งโฟลเดอร์ Codex

## Endpoints

- `GET /api/health` ตรวจว่า API ทำงาน
- `GET /api/conversations` รายการแชทพร้อมสถานะ AI
- `GET /api/customers` รายชื่อลูกค้า
- `POST /api/ai/welcome`
  - body: `{ "conversationId": "fb-001" }`
  - ส่งข้อความต้อนรับ Fern Clinic ให้ห้องแชท
- `POST /api/webhooks/facebook`
- `POST /api/webhooks/line`
- `POST /api/webhooks/tiktok`
  - body ตัวอย่าง: `{ "name": "คุณใหม่", "phone": "0812345678", "message": "สนใจบริการค่ะ" }`
- `GET /api/channel-configs`
- `POST /api/channel-configs`
  - body: `{ "platform": "facebook", "config": { "pageId": "..." } }`

หมายเหตุ: API ชุดนี้ใช้หน่วยความจำใน server สำหรับต้นแบบ ถ้า deploy ใหม่ข้อมูลที่รับผ่าน API จะรีเซ็ต ควรต่อฐานข้อมูลจริงในขั้นถัดไป
