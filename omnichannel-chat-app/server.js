const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const AI_RESPONSE_LIMIT_MINUTES = 2;
const fernClinicWelcomeMessage =
  "สวัสดีค่ะ Fern Clinic ยินดีต้อนรับค่ะ แอดมินได้รับข้อความแล้ว ขออนุญาตดูข้อมูลและตอบกลับโดยเร็วที่สุดนะคะ";

const conversations = [
  {
    id: "fb-001",
    channel: "Facebook",
    name: "คุณมินตรา",
    time: "10:42",
    owner: "Sale A",
    status: "ตามครั้งที่ 1",
    phone: "089-234-8891",
    interest: "คอร์สลดน้ำหนัก",
    bookingAmount: 2900,
    sourcePost: "ต้องติดตาม",
    score: 86,
    waitingMinutes: 4,
    before_img_count: 1,
    after_img_count: 0,
    review_img_count: 0,
    followup_date: "2026-07-16T12:00",
    messages: [
      ["customer", "สนใจโปรลดน้ำหนักค่ะ ราคาเริ่มต้นเท่าไหร่"],
      ["agent", "สวัสดีค่ะ ตอนนี้มีแพ็กเกจเริ่มต้น 2,900 บาท ขอเบอร์ติดต่อกลับได้ไหมคะ"],
      ["customer", "ได้ค่ะ 089-234-8891 อยากเริ่มสัปดาห์นี้"],
      {
        role: "customer",
        text: "แนบรูปก่อนเริ่มให้ช่วยประเมินค่ะ",
        attachment: {
          role: "customer",
          kind: "patient-photo",
          name: "mintra-before-photo.svg",
          type: "image/svg+xml",
          suggestedStage: "before",
        },
      },
    ],
  },
  {
    id: "line-014",
    channel: "LINE",
    lineAccount: 1,
    name: "คุณต้น",
    time: "09:58",
    owner: "Sale B",
    status: "ตามครั้งที่ 2",
    phone: "082-775-4410",
    interest: "ปรึกษาผิวหน้า",
    bookingAmount: 500,
    sourcePost: "จองคิว",
    score: 91,
    waitingMinutes: 7,
    before_img_count: 2,
    after_img_count: 2,
    review_img_count: 1,
    followup_date: "",
    messages: [
      ["customer", "อยากจองคิวปรึกษาผิว วันเสาร์ว่างไหมครับ"],
      ["agent", "วันเสาร์มีช่วง 11:00 และ 15:30 ค่ะ สะดวกช่วงไหนคะ"],
      ["customer", "15:30 ครับ เบอร์ 082-775-4410"],
      {
        role: "customer",
        text: "โอนเงินมัดจำแล้วครับ แนบสลิปให้ตรวจสอบ",
        attachment: {
          role: "customer",
          kind: "payment-slip",
          name: "line-slip-ton-1530.svg",
          type: "image/svg+xml",
          amount: "500.00",
          reference: "LINE-1530-0827754410",
        },
      },
    ],
  },
  {
    id: "line-022",
    channel: "LINE",
    lineAccount: 2,
    name: "คุณ ศิรินทิพย์ วงศ์ปิง (LINE Acc 2)",
    time: "10:15",
    owner: "Sale B",
    status: "ตามครั้งที่ 1",
    phone: "064-560-8454",
    interest: "อื่นๆ",
    bookingDoctor: "คุณหมอวุ้นเส้น",
    bookingDate: "25 กรกฎาคม 69 เวลา 10.00 น.",
    underlyingDisease: "แฝงทาลัสซีเมีย",
    drugAllergy: "-",
    casePrice: 24900,
    bookingAmount: 3000,
    sourcePost: "ต้องติดตาม",
    score: 78,
    waitingMinutes: 0,
    before_img_count: 1,
    after_img_count: 1,
    review_img_count: 0,
    followup_date: "2026-07-18T10:00",
    messages: [
      ["customer", "สนใจแพ็กเกจปรับรูปหน้าค่ะ บัญชี 2"],
      ["agent", "สวัสดีค่ะ จองคิวของบัญชี 2 วันไหนดีคะ"],
    ],
  },
  {
    id: "tt-109",
    channel: "TikTok",
    name: "Nana Beauty",
    time: "09:21",
    owner: "Unassigned",
    status: "ตามครั้งที่ 1",
    phone: "-",
    interest: "รีวิวสินค้า",
    bookingAmount: 0,
    sourcePost: "ลูกค้าใหม่",
    score: 54,
    waitingMinutes: 3,
    before_img_count: 1,
    after_img_count: 0,
    review_img_count: 0,
    followup_date: "2026-07-20T15:00",
    messages: [
      ["customer", "ตัวนี้เหมาะกับผิวแพ้ง่ายไหมคะ"],
      ["agent", "เหมาะกับผิวแพ้ง่ายหลายเคสค่ะ ถ้ามีประวัติแพ้สารใดเป็นพิเศษแจ้งได้เลยค่ะ"],
      ["customer", "เดี๋ยวทักไปถามเพิ่มค่ะ"],
    ],
  },
];

const aiReplies = {};
const channelConfigs = {};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function getMessageRole(message) {
  return Array.isArray(message) ? message[0] : message.role;
}

function getConversationMessages(conversation) {
  const aiReply = aiReplies[conversation.id];
  return aiReply ? [...conversation.messages, aiReply] : conversation.messages;
}

function getAiResponseState(conversation) {
  const messages = getConversationMessages(conversation);
  const lastMessage = messages[messages.length - 1];
  const hasAiReply = Boolean(aiReplies[conversation.id]);
  const waiting = conversation.status !== "ปิดการขาย" && getMessageRole(lastMessage) === "customer";
  const waitingMinutes = conversation.waitingMinutes || 0;
  const overdue = waiting && waitingMinutes >= AI_RESPONSE_LIMIT_MINUTES;

  if (hasAiReply) {
    return { label: "AI ตอบแล้ว", waiting: false, overdue: false, waitingMinutes };
  }

  if (!waiting) {
    return { label: "ตอบแล้ว", waiting: false, overdue: false, waitingMinutes };
  }

  return {
    label: overdue ? `เกิน ${AI_RESPONSE_LIMIT_MINUTES} นาที` : `รอตอบ ${waitingMinutes} นาที`,
    waiting,
    overdue,
    waitingMinutes,
  };
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".png": "image/png",
    };
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "Fern Clinic Chat API",
      aiResponseLimitMinutes: AI_RESPONSE_LIMIT_MINUTES,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/conversations") {
    sendJson(res, 200, {
      conversations: conversations.map((conversation) => ({
        ...conversation,
        messages: getConversationMessages(conversation),
        aiState: getAiResponseState(conversation),
      })),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/customers") {
    sendJson(res, 200, {
      customers: conversations.map(({ messages, ...conversation }) => conversation),
    });
    return;
  }

  const crmMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/crm$/);
  if (req.method === "POST" && crmMatch) {
    const customerId = decodeURIComponent(crmMatch[1]);
    const body = await readJsonBody(req);
    const conversation = conversations.find((item) => item.id === customerId);

    if (!conversation) {
      sendJson(res, 404, { ok: false, error: "Customer not found" });
      return;
    }

    if (body.name !== undefined) conversation.name = body.name;
    if (body.phone !== undefined) conversation.phone = body.phone;
    if (body.interest !== undefined) conversation.interest = body.interest;
    if (body.sourcePost !== undefined) conversation.sourcePost = body.sourcePost;
    if (body.score !== undefined) conversation.score = parseInt(body.score) || 0;
    if (body.status !== undefined) conversation.status = body.status;
    if (body.owner !== undefined) conversation.owner = body.owner;
    
    if (body.before_img_count !== undefined) conversation.before_img_count = parseInt(body.before_img_count) || 0;
    if (body.after_img_count !== undefined) conversation.after_img_count = parseInt(body.after_img_count) || 0;
    if (body.review_img_count !== undefined) conversation.review_img_count = parseInt(body.review_img_count) || 0;
    if (body.followup_date !== undefined) conversation.followup_date = body.followup_date;

    if (body.bookingDoctor !== undefined) conversation.bookingDoctor = body.bookingDoctor;
    if (body.bookingDate !== undefined) conversation.bookingDate = body.bookingDate;
    if (body.underlyingDisease !== undefined) conversation.underlyingDisease = body.underlyingDisease;
    if (body.drugAllergy !== undefined) conversation.drugAllergy = body.drugAllergy;
    if (body.casePrice !== undefined) conversation.casePrice = parseInt(body.casePrice) || 0;
    if (body.bookingAmount !== undefined) conversation.bookingAmount = parseInt(body.bookingAmount) || 0;

    sendJson(res, 200, { ok: true, customer: conversation });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai/welcome") {
    const body = await readJsonBody(req);
    const conversation = conversations.find((item) => item.id === body.conversationId);

    if (!conversation) {
      sendJson(res, 404, { ok: false, error: "Conversation not found" });
      return;
    }

    aiReplies[conversation.id] = {
      role: "agent",
      text: fernClinicWelcomeMessage,
      automated: true,
      sentAt: new Date().toISOString(),
      sentAtLabel: "ตอนนี้",
    };
    sendJson(res, 200, {
      ok: true,
      conversationId: conversation.id,
      reply: aiReplies[conversation.id],
    });
    return;
  }

  const messageMatch = url.pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
  if (req.method === "POST" && messageMatch) {
    const conversationId = decodeURIComponent(messageMatch[1]);
    const body = await readJsonBody(req);
    const conversation = conversations.find((item) => item.id === conversationId);

    if (!conversation) {
      sendJson(res, 404, { ok: false, error: "Conversation not found" });
      return;
    }

    const text = String(body.text || "").trim();
    if (!text) {
      sendJson(res, 400, { ok: false, error: "message text is required" });
      return;
    }

    const message = {
      role: body.role === "customer" ? "customer" : "agent",
      text,
      sentAt: new Date().toISOString(),
      sentAtLabel: "ตอนนี้",
    };
    conversation.messages.push(message);
    conversation.waitingMinutes = 0;
    delete aiReplies[conversation.id];
    sendJson(res, 201, {
      ok: true,
      conversationId: conversation.id,
      message,
      aiState: getAiResponseState(conversation),
    });
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/webhooks/")) {
    const platform = url.pathname.split("/").pop();
    const body = await readJsonBody(req);
    const id = `${platform}-${Date.now()}`;
    const conversation = {
      id,
      channel: platform.toUpperCase(),
      name: body.name || "ลูกค้าใหม่",
      time: "ตอนนี้",
      owner: "Unassigned",
      status: "รอคัดกรอง",
      phone: body.phone || "-",
      interest: body.interest || "สอบถามข้อมูล",
      sourcePost: body.sourcePost || "Webhook",
      score: 50,
      waitingMinutes: 0,
      messages: [["customer", body.message || "ลูกค้าส่งข้อความใหม่"]],
    };
    conversations.unshift(conversation);
    sendJson(res, 201, { ok: true, conversation });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/channel-configs") {
    const body = await readJsonBody(req);
    if (!body.platform) {
      sendJson(res, 400, { ok: false, error: "platform is required" });
      return;
    }
    channelConfigs[body.platform] = body.config || {};
    sendJson(res, 200, { ok: true, platform: body.platform });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/channel-configs") {
    sendJson(res, 200, { configs: channelConfigs });
    return;
  }

  sendJson(res, 404, { ok: false, error: "API route not found" });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch((error) => {
      sendJson(res, 400, { ok: false, error: error.message });
    });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Fern Clinic Chat API running on port ${PORT}`);
});
