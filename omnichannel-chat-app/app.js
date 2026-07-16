let conversations = [
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
    messages: [
      ["customer", "สนใจโปรลดน้ำหนักค่ะ ราคาเริ่มต้นเท่าไหร่"],
      ["agent", "สวัสดีค่ะ ตอนนี้มีแพ็กเกจเริ่มต้น 2,900 บาท ขอเบอร์ติดต่อกลับได้ไหมคะ"],
      ["customer", "ได้ค่ะ 089-234-8891 อยากเริ่มสัปดาห์นี้"],
      {
        role: "customer",
        text: "แนบรูปก่อนเริ่มให้ช่วยประเมินค่ะ",
        attachment: {
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
    messages: [
      ["customer", "อยากจองคิวปรึกษาผิว วันเสาร์ว่างไหมครับ"],
      ["agent", "วันเสาร์มีช่วง 11:00 และ 15:30 ค่ะ สะดวกช่วงไหนคะ"],
      ["customer", "15:30 ครับ เบอร์ 082-775-4410"],
      {
        role: "customer",
        text: "โอนเงินมัดจำแล้วครับ แนบสลิปให้ตรวจสอบ",
        attachment: {
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
    messages: [
      ["customer", "ตัวนี้เหมาะกับผิวแพ้ง่ายไหมคะ"],
      ["agent", "เหมาะกับผิวแพ้ง่ายหลายเคสค่ะ ถ้ามีประวัติแพ้สารใดเป็นพิเศษแจ้งได้เลยค่ะ"],
      ["customer", "เดี๋ยวทักไปถามเพิ่มค่ะ"],
    ],
  },
  {
    id: "fb-017",
    channel: "Facebook",
    name: "คุณก้อง",
    time: "เมื่อวาน",
    owner: "Sale A",
    status: "ตามครั้งที่ 1",
    phone: "086-112-9088",
    interest: "แพ็กเกจตรวจสุขภาพ",
    bookingAmount: 0,
    sourcePost: "ปิดการขาย",
    score: 78,
    waitingMinutes: 0,
    messages: [
      ["customer", "ขอรายละเอียดตรวจสุขภาพสำหรับพนักงาน 20 คนครับ"],
      ["agent", "ได้ค่ะ ขอชื่อบริษัทและอีเมลสำหรับส่งใบเสนอราคาได้ไหมคะ"],
      ["customer", "บริษัท North Star อีเมล hr@northstar.example"],
    ],
  },
];

const AI_RESPONSE_LIMIT_MINUTES = 2;
const API_BASE_URL = window.location.origin;
let apiBacked = false;
let isSendingChatMessage = false;
const fernClinicWelcomeMessage =
  "สวัสดีค่ะ Fern Clinic ยินดีต้อนรับค่ะ แอดมินได้รับข้อความแล้ว ขออนุญาตดูข้อมูลและตอบกลับโดยเร็วที่สุดนะคะ";

const workflowStepsLegacy = [
  {
    title: "รับข้อความ",
    detail: "ดึงข้อความจาก webhook หรือไฟล์นำเข้า แล้วรวมเป็น conversation เดียวกันตามช่องทางและ user id",
  },
  {
    title: "แยกข้อมูลสำคัญ",
    detail: "ตรวจจับชื่อ เบอร์โทร อีเมล ความสนใจ สาขา วันนัด แหล่งที่มา และแยกรูปคนไข้ที่ส่งมาเป็นก่อนทำหรือหลังทำ",
  },
  {
    title: "ตรวจจับแชทไม่ตอบ",
    detail: "AI ตรวจสถานะแชทที่ลูกค้าส่งข้อความเข้ามา หากยังไม่มีทีมตอบภายใน 2 นาที ให้ Action ส่งข้อความต้อนรับเฟิร์นคลีนิคทันที",
  },
  {
    title: "รวมโปรไฟล์",
    detail: "เชื่อมข้อมูลซ้ำจาก Facebook, LINE และ TikTok ด้วยเบอร์โทรหรือกฎ matching ที่กำหนด",
  },
  {
    title: "จัดลำดับงาน",
    detail: "ให้คะแนน lead, ตั้งสถานะ, มอบหมายเจ้าของงาน และสร้างงานติดตามอัตโนมัติ",
  },
  {
    title: "ส่งต่อระบบหลัก",
    detail: "บันทึกลง CRM, Google Sheets, ฐานข้อมูล หรือ API หลังบ้าน พร้อมประวัติการยินยอม",
  },
];

const workflowSteps = [
  {
    title: "รับแชททุกช่องทาง",
    category: "Capture",
    detail: "รวมข้อความจาก Facebook, LINE, TikTok, Webhook และไฟล์นำเข้า พร้อมบันทึกแหล่งที่มา เช่น โฆษณา, Rich menu, Live หรือ Inbox direct",
    outcome: "ทุกข้อความเข้า inbox เดียว",
    tone: "capture",
  },
  {
    title: "รวมโปรไฟล์ลูกค้า",
    category: "Identity",
    detail: "จับคู่ชื่อ เบอร์โทร LINE/Facebook ID และอีเมล เพื่อลดลูกค้าซ้ำข้ามช่องทางและเก็บประวัติไว้ในโปรไฟล์เดียว",
    outcome: "เห็นประวัติลูกค้าครบคนเดียว",
    tone: "identity",
  },
  {
    title: "วิเคราะห์เจตนา",
    category: "Intent",
    detail: "แยกข้อความเป็นกลุ่ม เช่น ถามราคา, จองคิว, ส่งรูปประเมิน, ส่งสลิป, ติดตามผล, ร้องเรียน หรือถามข้อมูลทั่วไป",
    outcome: "รู้ทันทีว่าลูกค้าต้องการอะไร",
    tone: "intent",
  },
  {
    title: "เก็บข้อมูลสำคัญ",
    category: "Data",
    detail: "ดึงชื่อ เบอร์ ความสนใจ งบประมาณ สาขา วันที่สะดวก รูปก่อน/หลังทำ และสลิป พร้อมแจ้งข้อมูลที่ยังขาด",
    outcome: "ข้อมูลพร้อมใช้ต่อยอด",
    tone: "data",
  },
  {
    title: "ให้คะแนน Lead",
    category: "Scoring",
    detail: "ให้คะแนนจากความพร้อม เช่น มีเบอร์แล้ว, สนใจบริการชัดเจน, ส่งรูปแล้ว, ส่งสลิปแล้ว หรือพร้อมจองคิว",
    outcome: "จัดลำดับลูกค้าที่ควรตอบก่อน",
    tone: "scoring",
  },
  {
    title: "AI ช่วยตอบตาม SLA",
    category: "SLA",
    detail: "ถ้าลูกค้ายังไม่ได้คำตอบภายในเวลาที่กำหนด ให้ AI ส่งข้อความต้อนรับ ขอข้อมูลเบื้องต้น และแจ้งเตือนทีม",
    outcome: "ไม่ปล่อยแชทค้างเกินเวลา",
    tone: "sla",
  },
  {
    title: "มอบหมายทีมดูแล",
    category: "Assign",
    detail: "ส่งต่อ Sale/Admin ตามช่องทาง บริการ สาขา หรือความเร่งด่วน พร้อมสถานะ เช่น รอตอบ, รอรูป, รอสลิป, รอจองคิว",
    outcome: "ทุกเคสมีเจ้าของงาน",
    tone: "assign",
  },
  {
    title: "ตรวจรูปและสลิป",
    category: "Verify",
    detail: "แยกรูปก่อนทำ/หลังทำ ตรวจหลักฐานการโอน ยอดเงิน และแนบไฟล์กลับเข้าโปรไฟล์ลูกค้าอย่างเป็นระบบ",
    outcome: "หลักฐานครบก่อนส่งต่อ",
    tone: "verify",
  },
  {
    title: "นัดหมายและติดตามผล",
    category: "Follow-up",
    detail: "สร้างงานจองคิว ติดตามก่อนนัด หลังนัด และแจ้งเตือนทีมเมื่อถึงเวลาติดต่อกลับหรือปิดเคส",
    outcome: "ไม่หลุดงานติดตาม",
    tone: "follow",
  },
  {
    title: "ส่งต่อ CRM และรายงาน",
    category: "Sync",
    detail: "บันทึกลง CRM, Google Sheets หรือ API พร้อมแหล่งที่มา คะแนน lead เจ้าของงาน สถานะล่าสุด และประวัติการยินยอม",
    outcome: "พร้อมทำรายงานและวัดผล",
    tone: "sync",
  },
];

const defaultUserAccounts = [
  {
    id: "user-admin",
    name: "Admin หลัก",
    email: "admin@omnichat.example",
    role: "ผู้ดูแลระบบ",
    status: "ใช้งานอยู่",
    lastLogin: "วันนี้ 10:45",
  },
  {
    id: "user-sale-a",
    name: "Sale A",
    email: "sale-a@omnichat.example",
    role: "ทีมขาย",
    status: "ใช้งานอยู่",
    lastLogin: "วันนี้ 09:20",
  },
  {
    id: "user-sale-b",
    name: "Sale B",
    email: "sale-b@omnichat.example",
    role: "ทีมขาย",
    status: "รอเชิญตอบรับ",
    lastLogin: "-",
  },
];

const channelConfigFields = {
  facebook: ["pageId", "accessToken", "verifyToken"],
  line: ["channelId", "channelSecret", "accessToken", "channelId2", "channelSecret2", "accessToken2"],
  tiktok: ["businessId", "clientKey", "clientSecret"],
};

let selectedId = conversations[0].id;
let selectedCrmId = "";
let channelFilter = "all";
let customerChannelFilter = "all";
const selectedCustomerIds = new Set();

const conversationList = document.querySelector("#conversationList");
const chatDetail = document.querySelector("#chatDetail");
const profileDetail = document.querySelector("#profileDetail");
const customerRows = document.querySelector("#customerRows");
const workflowGrid = document.querySelector("#workflowGrid");
const searchInput = document.querySelector("#searchInput");
const toast = document.querySelector("#toast");
const settingsGrid = document.querySelector("#settingsGrid");
const selectAllCustomers = document.querySelector("#selectAllCustomers");
const selectedCustomersCount = document.querySelector("#selectedCustomersCount");
const accountsGrid = document.querySelector("#accountsGrid");
const userAccountRows = document.querySelector("#userAccountRows");
const dashboardTotalCustomers = document.querySelector("#dashboardTotalCustomers");
const dashboardAnsweredRate = document.querySelector("#dashboardAnsweredRate");
const dashboardWaitingChats = document.querySelector("#dashboardWaitingChats");
const dashboardCapturedCustomers = document.querySelector("#dashboardCapturedCustomers");
const dashboardBookingTotal = document.querySelector("#dashboardBookingTotal");
const dashboardSlipTotal = document.querySelector("#dashboardSlipTotal");
const dashboardSlipReview = document.querySelector("#dashboardSlipReview");
const dashboardUpdatedAt = document.querySelector("#dashboardUpdatedAt");
const dashboardChannelBreakdown = document.querySelector("#dashboardChannelBreakdown");
const dashboardActionList = document.querySelector("#dashboardActionList");
const addUserButton = document.querySelector("#addUserButton");
const cancelUserButton = document.querySelector("#cancelUserButton");
const userFormPanel = document.querySelector("#userFormPanel");
const userAccountForm = document.querySelector("#userAccountForm");
const userFormMode = document.querySelector("#userFormMode");
const userFormTitle = document.querySelector("#userFormTitle");
const saveUserButton = document.querySelector("#saveUserButton");
let editingUserId = null;

function getStoredConfigs() {
  try {
    return JSON.parse(localStorage.getItem("omnichatChannelConfigs")) || {};
  } catch {
    return {};
  }
}

function saveStoredConfigs(configs) {
  localStorage.setItem("omnichatChannelConfigs", JSON.stringify(configs));
}

function getStoredSlips() {
  try {
    return JSON.parse(localStorage.getItem("omnichatPaymentSlips")) || {};
  } catch {
    return {};
  }
}

function saveStoredSlips(slips) {
  localStorage.setItem("omnichatPaymentSlips", JSON.stringify(slips));
}

function getStoredPatientPhotos() {
  try {
    return JSON.parse(localStorage.getItem("omnichatPatientPhotos")) || {};
  } catch {
    return {};
  }
}

function saveStoredPatientPhotos(photos) {
  localStorage.setItem("omnichatPatientPhotos", JSON.stringify(photos));
}

function getStoredAiReplies() {
  try {
    return JSON.parse(localStorage.getItem("omnichatAiReplies")) || {};
  } catch {
    return {};
  }
}

function saveStoredAiReplies(replies) {
  localStorage.setItem("omnichatAiReplies", JSON.stringify(replies));
}

function getStoredUserAccounts() {
  try {
    return JSON.parse(localStorage.getItem("omnichatUserAccounts")) || [];
  } catch {
    return [];
  }
}

function saveStoredUserAccounts(users) {
  localStorage.setItem("omnichatUserAccounts", JSON.stringify(users));
}

function getStoredUserAccountOverrides() {
  try {
    return JSON.parse(localStorage.getItem("omnichatUserAccountOverrides")) || {};
  } catch {
    return {};
  }
}

function saveStoredUserAccountOverrides(overrides) {
  localStorage.setItem("omnichatUserAccountOverrides", JSON.stringify(overrides));
}

function getUserAccounts() {
  const overrides = getStoredUserAccountOverrides();
  const defaultUsers = defaultUserAccounts.map((user) => ({ ...user, ...(overrides[user.id] || {}) }));
  return [...defaultUsers, ...getStoredUserAccounts()];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function getMessageRole(message) {
  return Array.isArray(message) ? message[0] : message.role;
}

function getMessageText(message) {
  return Array.isArray(message) ? message[1] : message.text;
}

async function loadConversationsFromApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("API response was not ok");
    }

    const data = await response.json();
    if (!Array.isArray(data.conversations)) {
      throw new Error("API conversations payload is invalid");
    }

    conversations = data.conversations;
    apiBacked = true;
    if (!conversations.some((conversation) => conversation.id === selectedId)) {
      selectedId = conversations[0]?.id;
    }
  } catch {
    apiBacked = false;
    showToast("ยังเชื่อม API ไม่ได้ ใช้ข้อมูลตัวอย่างในเครื่องก่อน");
  }
}

function getConversationMessages(conversation) {
  if (apiBacked) {
    return conversation.messages || [];
  }
  const aiReply = getStoredAiReplies()[conversation.id];
  return aiReply ? [...conversation.messages, aiReply] : conversation.messages;
}

function getAiResponseState(conversation) {
  if (apiBacked && conversation.aiState) {
    const tone = conversation.aiState.overdue ? "urgent" : conversation.aiState.waiting ? "watch" : "done";
    const dueIn = Math.max(AI_RESPONSE_LIMIT_MINUTES - (conversation.aiState.waitingMinutes || 0), 0);
    return { ...conversation.aiState, tone, dueIn };
  }

  const messages = getConversationMessages(conversation);
  const lastMessage = messages[messages.length - 1];
  const hasAiReply = Boolean(getStoredAiReplies()[conversation.id]);
  const waiting = conversation.status !== "ปิดการขาย" && getMessageRole(lastMessage) === "customer";
  const waitingMinutes = conversation.waitingMinutes || 0;
  const overdue = waiting && waitingMinutes >= AI_RESPONSE_LIMIT_MINUTES;
  const dueIn = Math.max(AI_RESPONSE_LIMIT_MINUTES - waitingMinutes, 0);

  if (hasAiReply) {
    return { label: "AI ตอบแล้ว", tone: "done", waiting: false, overdue: false, waitingMinutes, dueIn };
  }

  if (!waiting) {
    return { label: "ตอบแล้ว", tone: "done", waiting: false, overdue: false, waitingMinutes, dueIn };
  }

  return {
    label: overdue ? `เกิน ${AI_RESPONSE_LIMIT_MINUTES} นาที` : `รอตอบ ${waitingMinutes} นาที`,
    tone: overdue ? "urgent" : "watch",
    waiting,
    overdue,
    waitingMinutes,
    dueIn,
  };
}

function getPaymentSlipMessages(conversation) {
  return conversation.messages.filter((message) => !Array.isArray(message) && message.attachment?.kind === "payment-slip");
}

function getPatientPhotoMessages(conversation) {
  return conversation.messages.filter((message) => !Array.isArray(message) && message.attachment?.kind === "patient-photo");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAccountAvatarClass(index) {
  if (index % 3 === 1) {
    return "sale-a";
  }
  if (index % 3 === 2) {
    return "sale-b";
  }
  return "";
}

function getPatientPhotoSummary(customerId) {
  const photoRecords = Object.values(getStoredPatientPhotos()).filter((photo) => photo.customerId === customerId);
  return {
    before: photoRecords.filter((photo) => photo.stage === "before").length,
    after: photoRecords.filter((photo) => photo.stage === "after").length,
    pending: photoRecords.filter((photo) => photo.stage === "pending").length,
  };
}

function createPatientPhotoDataUrl(conversation, attachment) {
  const isBefore = attachment.suggestedStage === "before";
  const title = isBefore ? "Before Treatment" : "After Treatment";
  const accent = isBefore ? "#e65f3c" : "#126b68";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 720 520">
      <rect width="720" height="520" fill="#f7fafc"/>
      <rect x="52" y="44" width="616" height="432" rx="24" fill="#ffffff" stroke="#dce3ea" stroke-width="3"/>
      <circle cx="360" cy="198" r="78" fill="#f0d0be"/>
      <path d="M254 405c26-78 82-118 106-118s80 40 106 118" fill="#dce3ea"/>
      <path d="M292 176c20-62 116-64 136-1 18-28 5-82-69-82-72 0-88 54-67 83z" fill="#26323d"/>
      <circle cx="332" cy="196" r="7" fill="#17212b"/>
      <circle cx="388" cy="196" r="7" fill="#17212b"/>
      <path d="M333 232c18 14 37 14 55 0" fill="none" stroke="#9a6042" stroke-width="5" stroke-linecap="round"/>
      <rect x="92" y="72" width="210" height="46" rx="12" fill="${accent}"/>
      <text x="112" y="102" font-family="Segoe UI, Arial" font-size="22" font-weight="700" fill="#ffffff">${title}</text>
      <text x="92" y="456" font-family="Segoe UI, Arial" font-size="22" font-weight="700" fill="#17212b">${conversation.name}</text>
      <text x="92" y="486" font-family="Segoe UI, Arial" font-size="17" fill="#657383">${attachment.name}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getFilteredConversations() {
  const query = searchInput.value.trim().toLowerCase();
  return conversations.filter((item) => {
    if (item.channel === "LINE" && item.lineAccount === 2) {
      return false;
    }
    const matchesChannel = channelFilter === "all" || item.channel === channelFilter;
    const haystack = `${item.name} ${item.phone} ${item.interest} ${getConversationMessages(item).map(getMessageText).join(" ")}`.toLowerCase();
    return matchesChannel && (!query || haystack.includes(query));
  });
}

function getFilteredCustomers() {
  return conversations.filter((item) => customerChannelFilter === "all" || item.channel === customerChannelFilter);
}

function parseMoney(value) {
  const amount = Number(String(value ?? 0).replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

function formatBaht(value) {
  return parseMoney(value).toLocaleString("th-TH", {
    maximumFractionDigits: 0,
  });
}

function getBookingAmount(customer) {
  return parseMoney(customer.bookingAmount);
}

function getSlipRecords(customer) {
  const storedSlip = getStoredSlips()[customer.id];
  if (storedSlip) {
    return [storedSlip];
  }

  return getConversationMessages(customer)
    .filter((message) => !Array.isArray(message) && message.attachment?.kind === "payment-slip")
    .map((message) => message.attachment);
}

function getSlipTotal(customer) {
  return getSlipRecords(customer).reduce((total, slip) => total + parseMoney(slip.amount), 0);
}

function getSlipAudit(customer) {
  const bookingAmount = getBookingAmount(customer);
  const slipTotal = getSlipTotal(customer);
  const diff = slipTotal - bookingAmount;

  if (!bookingAmount && !slipTotal) {
    return { label: "รอยอดจอง", tone: "pending", detail: "ยังไม่มียอดให้ AI ตรวจ", diff };
  }

  if (bookingAmount && !slipTotal) {
    return { label: "รอสลิป", tone: "warning", detail: `ขาด ${formatBaht(bookingAmount)} บาท`, diff };
  }

  if (!bookingAmount && slipTotal) {
    return { label: "ขาดยอดจอง", tone: "warning", detail: `พบสลิป ${formatBaht(slipTotal)} บาท`, diff };
  }

  if (Math.abs(diff) <= 1) {
    return { label: "ยอดตรงกัน", tone: "match", detail: "AI ตรวจสอบผ่าน", diff };
  }

  if (diff < 0) {
    return { label: "ยอดสลิปขาด", tone: "danger", detail: `ขาด ${formatBaht(Math.abs(diff))} บาท`, diff };
  }

  return { label: "สลิปเกินยอด", tone: "warning", detail: `เกิน ${formatBaht(diff)} บาท`, diff };
}

function renderMetrics() {
  const captured = conversations.filter((item) => item.phone !== "-").length;
  const follow = conversations.filter((item) => item.status !== "ปิดการขาย").length;
  const aiPending = conversations.filter((item) => getAiResponseState(item).waiting).length;
  document.querySelector("#newChatsMetric").textContent = conversations.length;
  document.querySelector("#capturedMetric").textContent = `${conversations.length ? Math.round((captured / conversations.length) * 100) : 0}%`;
  document.querySelector("#followMetric").textContent = follow;
  document.querySelector("#aiPendingMetric").textContent = aiPending;
}

function renderDashboard() {
  const total = conversations.length;
  const captured = conversations.filter((item) => item.phone !== "-").length;
  const waiting = conversations.filter((item) => getAiResponseState(item).waiting).length;
  const answered = total - waiting;
  const answeredRate = total ? Math.round((answered / total) * 100) : 0;
  const bookingTotal = conversations.reduce((sum, item) => sum + getBookingAmount(item), 0);
  const slipTotal = conversations.reduce((sum, item) => sum + getSlipTotal(item), 0);
  const slipReviewCount = conversations.filter((item) => {
    const audit = getSlipAudit(item);
    return audit.tone !== "match" && (getBookingAmount(item) || getSlipTotal(item));
  }).length;
  const channelCounts = conversations.reduce((counts, item) => {
    counts[item.channel] = (counts[item.channel] || 0) + 1;
    return counts;
  }, {});
  const actionItems = conversations
    .filter((item) => getAiResponseState(item).waiting || item.status !== "ปิดการขาย")
    .sort((a, b) => (b.waitingMinutes || 0) - (a.waitingMinutes || 0))
    .slice(0, 5);

  dashboardTotalCustomers.textContent = total;
  dashboardAnsweredRate.textContent = `${answeredRate}%`;
  dashboardWaitingChats.textContent = waiting;
  dashboardCapturedCustomers.textContent = captured;
  if (dashboardBookingTotal) {
    dashboardBookingTotal.textContent = `${formatBaht(bookingTotal)} บาท`;
  }
  if (dashboardSlipTotal) {
    dashboardSlipTotal.textContent = `${formatBaht(slipTotal)} บาท`;
  }
  if (dashboardSlipReview) {
    dashboardSlipReview.textContent = slipReviewCount;
  }
  dashboardUpdatedAt.textContent = `อัปเดตล่าสุด: ${new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  dashboardChannelBreakdown.innerHTML = ["Facebook", "LINE", "TikTok"]
    .map((channel) => {
      const count = channelCounts[channel] || 0;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return `
        <div class="channel-row">
          <div>
            <span class="badge ${channel}">${channel}</span>
            <strong>${count} แชท</strong>
          </div>
          <div class="channel-meter" aria-label="${channel} ${percent}%">
            <span style="width: ${percent}%"></span>
          </div>
          <small>${percent}%</small>
        </div>
      `;
    })
    .join("");

  dashboardActionList.innerHTML =
    actionItems
      .map((item) => {
        const aiState = getAiResponseState(item);
        return `
        <button class="dashboard-action" type="button" data-customer-id="${item.id}">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.interest)} · ${escapeHtml(item.status)}</span>
          </div>
          <small class="${aiState.tone}">${escapeHtml(aiState.label)}</small>
        </button>
      `;
      })
      .join("") || `<p class="dashboard-empty">ยังไม่มีงานที่ต้องดูแลตอนนี้</p>`;

  dashboardActionList.querySelectorAll(".dashboard-action").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.customerId;
      document.querySelector('[data-view="inbox"]').click();
      renderAll();
    });
  });
}

function renderConversations() {
  const items = getFilteredConversations();
  conversationList.innerHTML = items
    .map(
      (item) => {
        const messages = getConversationMessages(item);
        const latestMessage = messages[messages.length - 1];
        const aiState = getAiResponseState(item);
        return `
        <button class="conversation-item ${item.id === selectedId ? "active" : ""}" type="button" data-id="${item.id}">
          <div class="avatar ${item.channel}">${item.name.slice(3, 5)}</div>
          <div class="conversation-copy">
            <strong>${item.name}</strong>
            <span>${getMessageText(latestMessage)}</span>
            <small class="ai-response-chip ${aiState.tone}">${aiState.label}</small>
          </div>
          <span class="conversation-time">${item.time}</span>
        </button>
      `;
      },
    )
    .join("");

  conversationList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.id;
      renderAll();
    });
  });
}

function renderChat() {
  const item = conversations.find((conversation) => conversation.id === selectedId) || conversations[0];
  const messages = getConversationMessages(item);
  chatDetail.innerHTML = `
    <div class="chat-head">
      <div>
        <h2>${item.name}</h2>
        <span class="badge ${item.channel}">${item.channel}</span>
      </div>
      <span class="status-pill ${item.status === "ปิดการขาย" ? "done" : ""}">${item.status}</span>
    </div>
    ${renderAiResponsePanel(item)}
    <div class="messages">
      ${messages
        .map((message, index) => renderChatMessage(item, message, index))
        .join("")}
    </div>
    <form id="chatComposerForm" class="composer" data-customer-id="${item.id}">
      <input id="chatComposerInput" type="text" placeholder="พิมพ์ข้อความตอบกลับหรือบันทึกโน้ต" />
      <button id="sendChatButton" class="primary-button" type="submit">ส่ง</button>
    </form>
  `;

  chatDetail.querySelectorAll(".save-chat-slip").forEach((button) => {
    button.addEventListener("click", () => saveChatSlipToCustomer(button.dataset.customerId, Number(button.dataset.messageIndex)));
  });

  chatDetail.querySelectorAll(".classify-photo").forEach((button) => {
    button.addEventListener("click", () =>
      classifyPatientPhoto(button.dataset.customerId, Number(button.dataset.messageIndex), button.dataset.stage),
    );
  });

  chatDetail.querySelectorAll(".send-ai-welcome").forEach((button) => {
    button.addEventListener("click", () => sendAiWelcomeReply(button.dataset.customerId));
  });

  const composerForm = chatDetail.querySelector("#chatComposerForm");
  composerForm?.addEventListener("submit", handleChatComposerSubmit);
}

function renderAiResponsePanel(conversation) {
  const aiState = getAiResponseState(conversation);
  const aiReply = getStoredAiReplies()[conversation.id];

  if (aiReply) {
    return `
      <div class="ai-action-panel done">
        <div>
          <strong>AI ตอบต้อนรับแล้ว</strong>
          <span>ส่งข้อความต้อนรับเฟิร์นคลีนิคเมื่อ ${aiReply.sentAtLabel}</span>
        </div>
        <span class="status-pill done">เสร็จสิ้น</span>
      </div>
    `;
  }

  if (!aiState.waiting) {
    return `
      <div class="ai-action-panel done">
        <div>
          <strong>สถานะการตอบแชทปกติ</strong>
          <span>ลูกค้าได้รับคำตอบแล้ว ยังไม่ต้องให้ AI ดำเนินการ</span>
        </div>
        <span class="status-pill done">ตอบแล้ว</span>
      </div>
    `;
  }

  return `
    <div class="ai-action-panel ${aiState.overdue ? "urgent" : ""}">
      <div>
        <strong>${aiState.overdue ? `เกิน ${AI_RESPONSE_LIMIT_MINUTES} นาที ต้องตอบทันที` : `เหลือ ${aiState.dueIn} นาที ก่อนครบ SLA`}</strong>
        <span>AI ตรวจพบว่าลูกค้ายังไม่ได้รับคำตอบ แนะนำส่งข้อความต้อนรับเฟิร์นคลีนิค</span>
        <small>${fernClinicWelcomeMessage}</small>
      </div>
      <button class="primary-button send-ai-welcome" type="button" data-customer-id="${conversation.id}">AI ตอบต้อนรับ</button>
    </div>
  `;
}

function renderChatMessage(conversation, message, index) {
  const role = getMessageRole(message);
  const text = getMessageText(message);
  const safeText = escapeHtml(text);
  const attachment = Array.isArray(message) ? null : message.attachment;
  const slipSaved = Boolean(getStoredSlips()[conversation.id]);
  const patientPhotoKey = `${conversation.id}-${index}`;
  const photoRecord = getStoredPatientPhotos()[patientPhotoKey];

  return `
    <div class="message ${role === "agent" ? "agent" : ""} ${message.automated ? "automated" : ""}">
      ${message.automated ? `<small class="auto-reply-label">AI Auto Reply</small>` : ""}
      <span>${safeText}</span>
      ${
        attachment?.kind === "payment-slip"
          ? `
        <div class="chat-slip-card">
          <strong>สลิปโอนเงิน</strong>
          <span>${attachment.name}</span>
          <small>ยอด ${attachment.amount} บาท · Ref ${attachment.reference}</small>
          <button class="save-chat-slip" type="button" data-customer-id="${conversation.id}" data-message-index="${index}" ${slipSaved ? "disabled" : ""}>
            ${slipSaved ? "เก็บแล้วในข้อมูลลูกค้า" : "เก็บเข้าข้อมูลลูกค้า"}
          </button>
        </div>
      `
          : ""
      }
      ${
        attachment?.kind === "patient-photo"
          ? `
        <div class="patient-photo-card">
          <img src="${createPatientPhotoDataUrl(conversation, attachment)}" alt="${attachment.name}" />
          <div class="patient-photo-copy">
            <strong>รูปคนไข้</strong>
            <span>${attachment.name}</span>
            <small>${photoRecord ? `จัดเป็น${photoRecord.stage === "before" ? "ก่อนทำ" : "หลังทำ"}แล้ว` : "ยังไม่ได้แยกประเภท"}</small>
          </div>
          <div class="photo-classify-actions">
            <button class="classify-photo ${photoRecord?.stage === "before" ? "active" : ""}" type="button" data-customer-id="${conversation.id}" data-message-index="${index}" data-stage="before">ก่อนทำ</button>
            <button class="classify-photo ${photoRecord?.stage === "after" ? "active" : ""}" type="button" data-customer-id="${conversation.id}" data-message-index="${index}" data-stage="after">หลังทำ</button>
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function renderProfile() {
  const item = conversations.find((conversation) => conversation.id === selectedId) || conversations[0];
  if (!item) return;

  const beforeVal = item.before_img_count || 0;
  const afterVal = item.after_img_count || 0;
  const pendingVal = item.review_img_count || 0;
  const aiState = getAiResponseState(item);

  profileDetail.innerHTML = `
    <div class="profile-section">
      <h3>ข้อมูลที่ดึงจากแชท</h3>
      <div class="field-list">
        <div class="field">
          <span>ชื่อ</span>
          <input type="text" id="crm-input-name" value="${escapeHtml(item.name || '')}" />
        </div>
        <div class="field">
          <span>เบอร์</span>
          <input type="text" id="crm-input-phone" value="${escapeHtml(item.phone || '')}" />
        </div>
        <div class="field">
          <span>สนใจ</span>
          <select id="crm-input-interest">
            <option value="" ${!item.interest ? 'selected' : ''}>-- เลือกคอร์ส --</option>
            <option value="คอร์สลดน้ำหนัก" ${item.interest === 'คอร์สลดน้ำหนัก' ? 'selected' : ''}>คอร์สลดน้ำหนัก</option>
            <option value="คอร์สลดเหนียง" ${item.interest === 'คอร์สลดเหนียง' ? 'selected' : ''}>คอร์สลดเหนียง</option>
            <option value="คอร์สปรับรูปหน้า" ${item.interest === 'คอร์สปรับรูปหน้า' ? 'selected' : ''}>คอร์สปรับรูปหน้า</option>
            <option value="ปรึกษาผิวหน้า" ${item.interest === 'ปรึกษาผิวหน้า' ? 'selected' : ''}>ปรึกษาผิวหน้า</option>
            <option value="รีวิวสินค้า" ${item.interest === 'รีวิวสินค้า' ? 'selected' : ''}>รีวิวสินค้า</option>
            <option value="อื่นๆ" ${item.interest === 'อื่นๆ' ? 'selected' : ''}>อื่นๆ</option>
          </select>
        </div>
        <div class="field">
          <span>แท็กกลุ่มลูกค้า</span>
          <select id="crm-input-source">
            <option value="ลูกค้าใหม่" ${item.sourcePost === 'ลูกค้าใหม่' ? 'selected' : ''}>ลูกค้าใหม่</option>
            <option value="ต้องติดตาม" ${item.sourcePost === 'ต้องติดตาม' ? 'selected' : ''}>ต้องติดตาม</option>
            <option value="กำลังพิจารณา" ${item.sourcePost === 'กำลังพิจารณา' ? 'selected' : ''}>กำลังพิจารณา</option>
            <option value="จองคิว" ${item.sourcePost === 'จองคิว' ? 'selected' : ''}>จองคิว</option>
            <option value="ปิดการขาย" ${item.sourcePost === 'ปิดการขาย' ? 'selected' : ''}>ปิดการขาย</option>
            <option value="ไม่สนใจ" ${item.sourcePost === 'ไม่สนใจ' ? 'selected' : ''}>ไม่สนใจ</option>
          </select>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h3>Workflow</h3>
      <div class="field-list">
        <div class="field">
          <span>คะแนน</span>
          <input type="number" id="crm-input-score" min="0" max="100" value="${item.score || 0}" />
        </div>
        <div class="field">
          <span>สถานะ</span>
          <select id="crm-input-status">
            <option value="ตามครั้งที่ 1" ${item.status === 'ตามครั้งที่ 1' ? 'selected' : ''}>ตามครั้งที่ 1</option>
            <option value="ตามครั้งที่ 2" ${item.status === 'ตามครั้งที่ 2' ? 'selected' : ''}>ตามครั้งที่ 2</option>
            <option value="ตามครั้งที่ 3" ${item.status === 'ตามครั้งที่ 3' ? 'selected' : ''}>ตามครั้งที่ 3</option>
            <option value="ตามครั้งที่ 4" ${item.status === 'ตามครั้งที่ 4' ? 'selected' : ''}>ตามครั้งที่ 4</option>
            <option value="ตามครั้งที่ 5" ${item.status === 'ตามครั้งที่ 5' ? 'selected' : ''}>ตามครั้งที่ 5</option>
            <option value="ตามครั้งที่ 6" ${item.status === 'ตามครั้งที่ 6' ? 'selected' : ''}>ตามครั้งที่ 6</option>
          </select>
        </div>
        <div class="field">
          <span>การส่งรูป</span>
          <select id="crm-input-photo-delivery">
            <option value="" ${!item.photoDelivery ? 'selected' : ''}>-- เลือกสถานะส่งรูป --</option>
            <option value="ส่งรูปแล้ว" ${item.photoDelivery === 'ส่งรูปแล้ว' ? 'selected' : ''}>ส่งรูปแล้ว</option>
            <option value="ไม่มีการส่งรูป" ${item.photoDelivery === 'ไม่มีการส่งรูป' ? 'selected' : ''}>ไม่มีการส่งรูป</option>
          </select>
        </div>
        <div class="field">
          <span>ผู้ดูแล</span>
          <select id="crm-input-assignee">
            <option value="Unassigned" ${item.owner === 'Unassigned' || !item.owner ? 'selected' : ''}>ไม่มีผู้ดูแล</option>
            <option value="Sale A" ${item.owner === 'Sale A' ? 'selected' : ''}>Sale A</option>
            <option value="Sale B" ${item.owner === 'Sale B' ? 'selected' : ''}>Sale B</option>
          </select>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h3>ข้อมูลการจองคิว</h3>
      <div class="field-list">
        <div class="field">
          <span>แพทย์ที่จอง</span>
          <input type="text" id="crm-input-booking-doctor" value="${escapeHtml(item.bookingDoctor || '')}" />
        </div>
        <div class="field">
          <span>วันเวลาจองคิว</span>
          <input type="text" id="crm-input-booking-date" value="${escapeHtml(item.bookingDate || '')}" placeholder="เช่น 25 กรกฎาคม 69 เวลา 10.00 น." />
        </div>
        <div class="field">
          <span>โรคประจำตัว</span>
          <input type="text" id="crm-input-underlying-disease" value="${escapeHtml(item.underlyingDisease || '')}" />
        </div>
        <div class="field">
          <span>ประวัติแพ้ยา</span>
          <input type="text" id="crm-input-drug-allergy" value="${escapeHtml(item.drugAllergy || '')}" />
        </div>
        <div class="field">
          <span>ราคาเคส (บาท)</span>
          <input type="number" id="crm-input-case-price" min="0" value="${item.casePrice || 0}" />
        </div>
        <div class="field">
          <span>เงินมัดจำ (บาท)</span>
          <input type="number" id="crm-input-booking-amount" min="0" value="${item.bookingAmount || 0}" />
        </div>
        <div class="field">
          <span>ยอดชำระวันทำ</span>
          <strong style="color: var(--accent); font-size: 15px;">
            ${((item.casePrice || 0) - (item.bookingAmount || 0)).toLocaleString()} บาท
          </strong>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h3>AI ตอบแชท</h3>
      <div class="field-list">
        <div class="field"><span>SLA</span><strong>ไม่เกิน ${AI_RESPONSE_LIMIT_MINUTES} นาที</strong></div>
        <div class="field"><span>สถานะ</span><strong>${aiState.label}</strong></div>
      </div>
    </div>
    <div class="profile-section">
      <h3>รูปคนไข้</h3>
      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <div style="flex: 1; text-align: center;">
          <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px;">ก่อนทำ</span>
          <input type="number" id="crm-input-before" min="0" value="${beforeVal}" style="text-align: center; width: 100%;" />
        </div>
        <div style="flex: 1; text-align: center;">
          <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px;">หลังทำ</span>
          <input type="number" id="crm-input-after" min="0" value="${afterVal}" style="text-align: center; width: 100%;" />
        </div>
        <div style="flex: 1; text-align: center;">
          <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px;">รอแยก</span>
          <input type="number" id="crm-input-pending" min="0" value="${pendingVal}" style="text-align: center; width: 100%;" />
        </div>
      </div>
    </div>
    <button class="primary-button" type="button" onclick="saveActiveCustomerCrm()" style="width: 100%; margin-top: 10px;">สร้างงานติดตาม</button>
  `;
}

function renderWorkflow() {
  workflowGrid.innerHTML = workflowSteps
    .map(
      (step, index) => `
        <article class="workflow-card ${step.tone}">
          <div class="workflow-card-top">
            <span class="step-number">${index + 1}</span>
            <span class="workflow-category">${step.category}</span>
          </div>
          <strong>${step.title}</strong>
          <p>${step.detail}</p>
          <div class="workflow-outcome">
            <span>ผลลัพธ์</span>
            <strong>${step.outcome}</strong>
          </div>
          <span class="status-pill done">พร้อมใช้ในระบบ</span>
        </article>
      `,
    )
    .join("");
}

function renderCustomers() {
  const customers = getFilteredCustomers();
  const slips = getStoredSlips();
  customerRows.innerHTML = customers
    .map(
      (item) => {
        const slip = slips[item.id];
        const photoSummary = getPatientPhotoSummary(item.id);
        const bookingAmount = getBookingAmount(item);
        const slipTotal = getSlipTotal(item);
        const slipAudit = getSlipAudit(item);
        return `
        <tr>
          <td class="check-cell">
            <input class="customer-checkbox" type="checkbox" value="${item.id}" aria-label="เลือกลูกค้า ${item.name}" ${selectedCustomerIds.has(item.id) ? "checked" : ""} />
          </td>
          <td><strong>${item.name}</strong></td>
          <td><span class="badge ${item.channel}">${item.channel}</span></td>
          <td>${item.phone}</td>
          <td>${item.interest}</td>
          <td>${item.status}</td>
          <td><strong class="money-cell">${formatBaht(bookingAmount)} บาท</strong></td>
          <td><strong class="money-cell ${slipTotal ? "has-amount" : ""}">${formatBaht(slipTotal)} บาท</strong></td>
          <td>
            <div class="slip-audit ${slipAudit.tone}">
              <strong>${slipAudit.label}</strong>
              <span>${slipAudit.detail}</span>
            </div>
          </td>
          <td>
            <div class="photo-summary-cell">
              <span>ก่อนทำ ${photoSummary.before}</span>
              <span>หลังทำ ${photoSummary.after}</span>
              ${photoSummary.pending ? `<small>รอแยก ${photoSummary.pending}</small>` : ""}
            </div>
          </td>
          <td>
            <div class="slip-cell">
              <span class="slip-state ${slip ? "has-slip" : ""}">${slip ? "มีสลิปแล้ว" : "ยังไม่มีสลิป"}</span>
              <span class="slip-name">${slip ? slip.name : "-"}</span>
              <span class="slip-total-line">ยอดสลิปรวม ${formatBaht(slipTotal)} บาท</span>
              ${slip?.source === "chat" ? `<span class="slip-source">จากห้องแชท ${slip.sourceChannel}</span>` : ""}
              <div class="slip-actions">
                <button class="view-slip" type="button" data-id="${item.id}" ${slip ? "" : "disabled"}>ดู</button>
                <button class="remove-slip" type="button" data-id="${item.id}" ${slip ? "" : "disabled"}>ลบ</button>
              </div>
            </div>
          </td>
          <td>${item.owner}</td>
        </tr>
      `;
      },
    )
    .join("") || `
      <tr>
        <td colspan="12" class="empty-row">ไม่พบข้อมูลลูกค้าในช่องทางนี้</td>
      </tr>
    `;

  customerRows.querySelectorAll(".customer-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedCustomerIds.add(checkbox.value);
      } else {
        selectedCustomerIds.delete(checkbox.value);
      }
      updateCustomerSelectionState();
    });
  });

  customerRows.querySelectorAll(".view-slip").forEach((button) => {
    button.addEventListener("click", () => viewSlip(button.dataset.id));
  });

  customerRows.querySelectorAll(".remove-slip").forEach((button) => {
    button.addEventListener("click", () => removeSlip(button.dataset.id));
  });

  updateCustomerSelectionState();
}

function renderUserAccounts() {
  const users = getUserAccounts();
  accountsGrid.innerHTML = users
    .map(
      (user, index) => `
        <article class="account-card">
          <div class="account-avatar ${getAccountAvatarClass(index)}">${escapeHtml(getInitials(user.name))}</div>
          <div>
            <h3>${escapeHtml(user.name)}</h3>
            <p>${escapeHtml(user.email)}</p>
          </div>
          <span class="status-pill ${user.role === "ผู้ดูแลระบบ" ? "done" : ""}">${escapeHtml(user.role)}</span>
          <button class="edit-user-button" type="button" data-user-id="${escapeHtml(user.id)}">แก้ไข</button>
        </article>
      `,
    )
    .join("");

  userAccountRows.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td><strong>${escapeHtml(user.name)}</strong></td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.role)}</td>
          <td><span class="slip-state ${user.status === "ใช้งานอยู่" ? "has-slip" : ""}">${escapeHtml(user.status)}</span></td>
          <td>${escapeHtml(user.lastLogin)}</td>
          <td>
            <button class="edit-user-button table-edit" type="button" data-user-id="${escapeHtml(user.id)}">แก้ไข</button>
          </td>
        </tr>
      `,
    )
    .join("");

  document.querySelectorAll(".edit-user-button").forEach((button) => {
    button.addEventListener("click", () => openUserForm(button.dataset.userId));
  });
}

function openUserForm(userId = null) {
  editingUserId = userId;
  const user = userId ? getUserAccounts().find((item) => item.id === userId) : null;
  userFormMode.textContent = user ? "Edit account" : "New account";
  userFormTitle.textContent = user ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน";
  saveUserButton.textContent = user ? "บันทึกการแก้ไข" : "บันทึกผู้ใช้งาน";
  if (user) {
    userAccountForm.elements.name.value = user.name;
    userAccountForm.elements.email.value = user.email;
    userAccountForm.elements.role.value = user.role;
    userAccountForm.elements.status.value = user.status;
  } else {
    userAccountForm.reset();
  }
  userFormPanel.hidden = false;
  userAccountForm.elements.name.focus();
}

function closeUserForm() {
  userAccountForm.reset();
  editingUserId = null;
  userFormPanel.hidden = true;
}

function updateCustomerSelectionState() {
  const visibleCustomerIds = getFilteredCustomers().map((item) => item.id);
  const selectedVisibleCount = visibleCustomerIds.filter((id) => selectedCustomerIds.has(id)).length;
  selectedCustomersCount.textContent = `เลือก ${selectedCustomerIds.size} รายการ`;
  selectAllCustomers.checked = visibleCustomerIds.length > 0 && selectedVisibleCount === visibleCustomerIds.length;
  selectAllCustomers.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleCustomerIds.length;
}

function createChatSlipDataUrl(conversation, attachment) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="760" height="980" viewBox="0 0 760 980">
      <rect width="760" height="980" fill="#f7fafc"/>
      <rect x="70" y="70" width="620" height="840" rx="24" fill="#ffffff" stroke="#dce3ea" stroke-width="3"/>
      <text x="110" y="150" font-family="Segoe UI, Arial" font-size="34" font-weight="700" fill="#17212b">Payment Slip</text>
      <text x="110" y="210" font-family="Segoe UI, Arial" font-size="22" fill="#657383">Source: ${conversation.channel} chat</text>
      <line x1="110" y1="250" x2="650" y2="250" stroke="#dce3ea" stroke-width="2"/>
      <text x="110" y="320" font-family="Segoe UI, Arial" font-size="24" fill="#657383">Customer</text>
      <text x="110" y="360" font-family="Segoe UI, Arial" font-size="30" font-weight="700" fill="#17212b">${conversation.name}</text>
      <text x="110" y="430" font-family="Segoe UI, Arial" font-size="24" fill="#657383">Amount</text>
      <text x="110" y="480" font-family="Segoe UI, Arial" font-size="56" font-weight="800" fill="#126b68">THB ${attachment.amount}</text>
      <text x="110" y="560" font-family="Segoe UI, Arial" font-size="24" fill="#657383">Reference</text>
      <text x="110" y="600" font-family="Segoe UI, Arial" font-size="26" font-weight="700" fill="#17212b">${attachment.reference}</text>
      <text x="110" y="680" font-family="Segoe UI, Arial" font-size="24" fill="#657383">File</text>
      <text x="110" y="720" font-family="Segoe UI, Arial" font-size="24" fill="#17212b">${attachment.name}</text>
      <rect x="110" y="790" width="540" height="70" rx="12" fill="#dff6ea"/>
      <text x="145" y="835" font-family="Segoe UI, Arial" font-size="24" font-weight="700" fill="#0e5c39">Captured from chat message</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function saveChatSlipToCustomer(customerId, messageIndex) {
  const conversation = conversations.find((item) => item.id === customerId);
  const message = conversation?.messages[messageIndex];
  const attachment = Array.isArray(message) ? null : message?.attachment;

  if (!conversation || attachment?.kind !== "payment-slip") {
    showToast("ไม่พบสลิปจากห้องแชท");
    return;
  }

  const slips = getStoredSlips();
  slips[customerId] = {
    name: attachment.name,
    type: attachment.type,
    size: 0,
    uploadedAt: new Date().toISOString(),
    source: "chat",
    sourceChannel: conversation.channel,
    amount: attachment.amount,
    reference: attachment.reference,
    dataUrl: createChatSlipDataUrl(conversation, attachment),
  };
  saveStoredSlips(slips);
  renderChat();
  renderCustomers();
  showToast("เก็บสลิปจากห้องแชทไว้ในข้อมูลลูกค้าแล้ว");
}

function classifyPatientPhoto(customerId, messageIndex, stage) {
  const conversation = conversations.find((item) => item.id === customerId);
  const message = conversation?.messages[messageIndex];
  const attachment = Array.isArray(message) ? null : message?.attachment;

  if (!conversation || attachment?.kind !== "patient-photo") {
    showToast("ไม่พบรูปคนไข้จากห้องแชท");
    return;
  }

  const photos = getStoredPatientPhotos();
  photos[`${customerId}-${messageIndex}`] = {
    customerId,
    messageIndex,
    name: attachment.name,
    type: attachment.type,
    stage,
    savedAt: new Date().toISOString(),
    dataUrl: createPatientPhotoDataUrl(conversation, attachment),
  };
  saveStoredPatientPhotos(photos);
  renderChat();
  renderProfile();
  renderCustomers();
  showToast(`แยกรูปเป็น${stage === "before" ? "ก่อนทำ" : "หลังทำ"}แล้ว`);
}

async function sendAiWelcomeReply(customerId) {
  const conversation = conversations.find((item) => item.id === customerId);
  if (!conversation) {
    showToast("ไม่พบห้องแชทนี้");
    return;
  }

  if (apiBacked) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: customerId }),
      });

      if (!response.ok) {
        throw new Error("AI welcome API failed");
      }

      await loadConversationsFromApi();
      renderMetrics();
      renderDashboard();
      renderConversations();
      renderChat();
      renderProfile();
      showToast("AI ส่งข้อความต้อนรับ Fern Clinic ผ่าน API แล้ว");
      return;
    } catch {
      showToast("ส่งผ่าน API ไม่สำเร็จ ใช้การบันทึกในเครื่องแทน");
      apiBacked = false;
    }
  }

  const replies = getStoredAiReplies();
  replies[customerId] = {
    role: "agent",
    text: fernClinicWelcomeMessage,
    automated: true,
    sentAt: new Date().toISOString(),
    sentAtLabel: "ตอนนี้",
  };
  saveStoredAiReplies(replies);
  renderMetrics();
  renderDashboard();
  renderConversations();
  renderChat();
  renderProfile();
  showToast("AI ส่งข้อความต้อนรับเฟิร์นคลีนิคแล้ว");
}

async function sendChatMessage(customerId, text) {
  const messageText = text.trim();
  if (!messageText) {
    showToast("พิมพ์ข้อความก่อนกดส่ง");
    return;
  }

  if (isSendingChatMessage) {
    return;
  }

  const conversation = conversations.find((item) => item.id === customerId);
  if (!conversation) {
    showToast("ไม่พบห้องแชทนี้");
    return;
  }

  isSendingChatMessage = true;
  const composerForm = chatDetail.querySelector("#chatComposerForm");
  const sendButton = composerForm?.querySelector("#sendChatButton");
  const composerInput = composerForm?.querySelector("#chatComposerInput");
  if (sendButton) {
    sendButton.disabled = true;
    sendButton.textContent = "กำลังส่ง";
  }
  if (composerInput) {
    composerInput.value = "";
  }

  conversation.messages.push({
    role: "agent",
    text: messageText,
    sentAt: new Date().toISOString(),
    sentAtLabel: "ตอนนี้",
  });
  conversation.waitingMinutes = 0;

  const replies = getStoredAiReplies();
  if (replies[customerId]) {
    delete replies[customerId];
    saveStoredAiReplies(replies);
  }

  if (apiBacked) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(customerId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "agent", text: messageText }),
      });

      if (!response.ok) {
        throw new Error("Send message API failed");
      }

      await loadConversationsFromApi();
      renderAll();
      showToast("ส่งข้อความแล้ว");
      isSendingChatMessage = false;
      return;
    } catch {
      showToast("ส่งข้อความบนหน้าเว็บแล้ว แต่ API ยังไม่ตอบกลับ");
      apiBacked = false;
    }
  }

  renderAll();
  isSendingChatMessage = false;
  showToast("ส่งข้อความแล้ว");
}

function viewSlip(customerId) {
  const slip = getStoredSlips()[customerId];
  if (!slip) {
    showToast("ยังไม่มีสลิปของลูกค้ารายนี้");
    return;
  }

  const slipWindow = window.open("", "_blank");
  if (!slipWindow) {
    showToast("เบราว์เซอร์บล็อกหน้าต่างดูสลิป");
    return;
  }

  if (slip.type === "application/pdf") {
    slipWindow.document.write(`<title>${slip.name}</title><iframe src="${slip.dataUrl}" style="width:100%;height:100vh;border:0"></iframe>`);
    return;
  }

  slipWindow.document.write(`
    <title>${slip.name}</title>
    <body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh">
      <img src="${slip.dataUrl}" alt="${slip.name}" style="max-width:100%;max-height:100vh" />
    </body>
  `);
}

function removeSlip(customerId) {
  const slips = getStoredSlips();
  delete slips[customerId];
  saveStoredSlips(slips);
  renderCustomers();
  showToast("ลบสลิปโอนเงินแล้ว");
}

function getPlatformConfig(card) {
  const platform = card.dataset.platform;
  return channelConfigFields[platform].reduce((config, fieldName) => {
    const input = card.querySelector(`[name="${fieldName}"]`);
    config[fieldName] = input.value.trim();
    return config;
  }, {});
}

function isConfigComplete(platform, config) {
  if (platform === "line") {
    return Boolean(config.channelId && config.channelSecret && config.accessToken);
  }
  return channelConfigFields[platform].every((fieldName) => Boolean(config[fieldName]));
}

function updateConnectionStatus(platform, config) {
  const status = document.querySelector(`[data-status="${platform}"]`);
  const connected = isConfigComplete(platform, config);
  status.textContent = connected ? "เชื่อมต่อแล้ว" : "ยังไม่เชื่อมต่อ";
  status.classList.toggle("connected", connected);
}

function loadChannelSettings() {
  const configs = getStoredConfigs();
  settingsGrid.querySelectorAll(".integration").forEach((card) => {
    const platform = card.dataset.platform;
    const config = configs[platform] || {};
    channelConfigFields[platform].forEach((fieldName) => {
      card.querySelector(`[name="${fieldName}"]`).value = config[fieldName] || "";
    });
    updateConnectionStatus(platform, config);
  });
}

function setupChannelSettings() {
  settingsGrid.querySelectorAll(".integration").forEach((card) => {
    const platform = card.dataset.platform;

    card.querySelectorAll(".toggle-secret").forEach((button) => {
      button.addEventListener("click", () => {
        const input = button.previousElementSibling;
        input.type = input.type === "password" ? "text" : "password";
      });
    });

    card.querySelector(".save-config").addEventListener("click", () => {
      const configs = getStoredConfigs();
      const config = getPlatformConfig(card);
      configs[platform] = config;
      saveStoredConfigs(configs);
      updateConnectionStatus(platform, config);
      showToast("บันทึก Key สำหรับช่องทางนี้แล้ว");
    });

    card.querySelector(".test-config").addEventListener("click", () => {
      const config = getPlatformConfig(card);
      if (!isConfigComplete(platform, config)) {
        showToast("กรอก Key ให้ครบก่อนทดสอบการเชื่อมต่อ");
        return;
      }
      showToast("ทดสอบสำเร็จในต้นแบบ พร้อมลิงค์กับช่องแชทเมื่อมี backend");
    });

    card.querySelector(".clear-config").addEventListener("click", () => {
      const configs = getStoredConfigs();
      delete configs[platform];
      saveStoredConfigs(configs);
      channelConfigFields[platform].forEach((fieldName) => {
        card.querySelector(`[name="${fieldName}"]`).value = "";
      });
      updateConnectionStatus(platform, {});
      showToast("ล้างค่า Key ของช่องทางนี้แล้ว");
    });
  });
}

function renderAll() {
  renderMetrics();
  renderDashboard();
  renderConversations();
  renderChat();
  renderProfile();
  renderWorkflow();
  renderCustomers();
  renderUserAccounts();
  renderCrm();
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    item.classList.add("active");
    document.querySelector(`#${item.dataset.view}View`).classList.add("active");
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    channelFilter = chip.dataset.channel;
    renderConversations();
  });
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    customerChannelFilter = button.dataset.customerChannel;
    renderCustomers();
  });
});

selectAllCustomers.addEventListener("change", () => {
  getFilteredCustomers().forEach((item) => {
    if (selectAllCustomers.checked) {
      selectedCustomerIds.add(item.id);
    } else {
      selectedCustomerIds.delete(item.id);
    }
  });
  renderCustomers();
});

searchInput.addEventListener("input", renderConversations);

function submitChatComposer(form) {
  if (!form) {
    showToast("ไม่พบฟอร์มส่งข้อความ");
    return;
  }

  const composerInput = form.querySelector("#chatComposerInput");
  if (!composerInput) {
    showToast("ไม่พบช่องพิมพ์ข้อความ");
    return;
  }

  sendChatMessage(form.dataset.customerId, composerInput.value);
}

function handleChatComposerSubmit(event) {
  event.preventDefault();
  submitChatComposer(event.currentTarget);
  return false;
}

window.handleChatComposerSubmit = handleChatComposerSubmit;

document.querySelector("#syncButton").addEventListener("click", () => {
  const configs = getStoredConfigs();
  const connectedCount = Object.entries(channelConfigFields).filter(([platform]) => isConfigComplete(platform, configs[platform] || {})).length;
  showToast(connectedCount ? `พร้อมซิงก์ ${connectedCount} ช่องทางที่บันทึก Key แล้ว` : "กรอก Key ในเมนูเชื่อมต่อช่องทางก่อนซิงก์จริง");
});

document.querySelector("#runWorkflowButton").addEventListener("click", () => {
  showToast("ตรวจ Workflow แล้ว: รวมโปรไฟล์ วิเคราะห์เจตนา ให้คะแนน lead มอบหมายทีม และติดตาม SLA พร้อมใช้งาน");
});

document.querySelector("#exportButton").addEventListener("click", () => {
  const slips = getStoredSlips();
  const header = [
    "\u0e0a\u0e37\u0e48\u0e2d\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32",
    "\u0e0a\u0e48\u0e2d\u0e07\u0e17\u0e32\u0e07",
    "\u0e40\u0e1a\u0e2d\u0e23\u0e4c\u0e42\u0e17\u0e23",
    "\u0e04\u0e27\u0e32\u0e21\u0e2a\u0e19\u0e43\u0e08",
    "\u0e2a\u0e16\u0e32\u0e19\u0e30",
    "\u0e22\u0e2d\u0e14\u0e08\u0e2d\u0e07",
    "\u0e22\u0e2d\u0e14\u0e2a\u0e25\u0e34\u0e1b\u0e23\u0e27\u0e21",
    "AI \u0e15\u0e23\u0e27\u0e08\u0e2a\u0e25\u0e34\u0e1b",
    "\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14 AI",
    "\u0e23\u0e39\u0e1b\u0e01\u0e48\u0e2d\u0e19\u0e17\u0e33",
    "\u0e23\u0e39\u0e1b\u0e2b\u0e25\u0e31\u0e07\u0e17\u0e33",
    "\u0e2a\u0e25\u0e34\u0e1b\u0e42\u0e2d\u0e19\u0e40\u0e07\u0e34\u0e19",
    "\u0e40\u0e08\u0e49\u0e32\u0e02\u0e2d\u0e07\u0e07\u0e32\u0e19",
  ];
  const rows = getFilteredCustomers().map((item) => {
    const photoSummary = getPatientPhotoSummary(item.id);
    const slipAudit = getSlipAudit(item);
    return [
      item.name,
      item.channel,
      item.phone,
      item.interest,
      item.status,
      getBookingAmount(item),
      getSlipTotal(item),
      slipAudit.label,
      slipAudit.detail,
      photoSummary.before,
      photoSummary.after,
      slips[item.id] ? slips[item.id].name : "",
      item.owner,
    ];
  });
  const escapeCell = (cell) => String(cell ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const tableRows = [header, ...rows]
    .map((row, index) => {
      const open = index === 0 ? "<th>" : "<td>";
      const close = index === 0 ? "</th>" : "</td>";
      return "<tr>" + row.map((cell) => open + escapeCell(cell) + close).join("") + "</tr>";
    })
    .join("");
  const excelHtml = "<!doctype html>" +
    "<html><head><meta charset=\"UTF-8\" />" +
    "<style>table{border-collapse:collapse;font-family:Tahoma,Arial,sans-serif;font-size:12pt;}th{background:#dff6ea;font-weight:700;}th,td{border:1px solid #9ca3af;padding:6px 10px;mso-number-format:\"\\@\";}</style>" +
    "</head><body><table>" + tableRows + "</table></body></html>";
  const blob = new Blob(["\uFEFF", excelHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fern-clinic-customer-report.xls";
  link.click();
  URL.revokeObjectURL(url);
  showToast("\u0e2a\u0e48\u0e07\u0e2d\u0e2d\u0e01\u0e23\u0e35\u0e1e\u0e2d\u0e23\u0e4c\u0e15 Excel \u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e43\u0e0a\u0e49\u0e41\u0e25\u0e49\u0e27");
});

addUserButton.addEventListener("click", openUserForm);

cancelUserButton.addEventListener("click", closeUserForm);

userFormPanel.addEventListener("click", (event) => {
  if (event.target === userFormPanel) {
    closeUserForm();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !userFormPanel.hidden) {
    closeUserForm();
  }
});

userAccountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(userAccountForm);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim().toLowerCase();
  const role = formData.get("role");
  const status = formData.get("status");

  if (!name || !email) {
    showToast("กรอกชื่อและอีเมลให้ครบก่อนบันทึก");
    return;
  }

  const emailExists = getUserAccounts().some((user) => user.id !== editingUserId && user.email.toLowerCase() === email);
  if (emailExists) {
    showToast("อีเมลนี้มีอยู่ในบัญชีผู้ใช้งานแล้ว");
    return;
  }

  if (editingUserId) {
    const storedUsers = getStoredUserAccounts();
    const storedIndex = storedUsers.findIndex((user) => user.id === editingUserId);
    const currentUser = getUserAccounts().find((user) => user.id === editingUserId);
    const updatedUser = {
      ...currentUser,
      name,
      email,
      role,
      status,
      lastLogin: status === "ใช้งานอยู่" && currentUser.lastLogin === "-" ? "เพิ่งเพิ่ม" : currentUser.lastLogin,
    };

    if (storedIndex >= 0) {
      storedUsers[storedIndex] = updatedUser;
      saveStoredUserAccounts(storedUsers);
    } else {
      const overrides = getStoredUserAccountOverrides();
      overrides[editingUserId] = updatedUser;
      saveStoredUserAccountOverrides(overrides);
    }

    closeUserForm();
    renderUserAccounts();
    showToast("บันทึกการแก้ไขผู้ใช้งานแล้ว");
    return;
  }

  const storedUsers = getStoredUserAccounts();
  storedUsers.push({
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    status,
    lastLogin: status === "ใช้งานอยู่" ? "เพิ่งเพิ่ม" : "-",
  });
  saveStoredUserAccounts(storedUsers);
  closeUserForm();
  renderUserAccounts();
  showToast("เพิ่มผู้ใช้งานใหม่แล้ว");
});

setupChannelSettings();
loadChannelSettings();

// ==========================================
// Clinic CRM Feature Implementations (Codex)
// ==========================================

// CRM Active Customer Update
async function saveActiveCustomerCrm() {
  if (!selectedId) return;
  const conversation = conversations.find((item) => item.id === selectedId);
  if (!conversation) return;

  const name = document.getElementById('crm-input-name').value;
  const phone = document.getElementById('crm-input-phone').value;
  const interest = document.getElementById('crm-input-interest').value;
  const sourcePost = document.getElementById('crm-input-source').value;
  const score = parseInt(document.getElementById('crm-input-score').value) || 0;
  const status = document.getElementById('crm-input-status').value;
  const photoDelivery = document.getElementById('crm-input-photo-delivery').value;
  const owner = document.getElementById('crm-input-assignee').value;

  const bookingDoctor = document.getElementById('crm-input-booking-doctor').value;
  const bookingDate = document.getElementById('crm-input-booking-date').value;
  const underlyingDisease = document.getElementById('crm-input-underlying-disease').value;
  const drugAllergy = document.getElementById('crm-input-drug-allergy').value;
  const casePrice = parseInt(document.getElementById('crm-input-case-price').value) || 0;
  const bookingAmount = parseInt(document.getElementById('crm-input-booking-amount').value) || 0;
  
  const before_img_count = parseInt(document.getElementById('crm-input-before').value) || 0;
  const after_img_count = parseInt(document.getElementById('crm-input-after').value) || 0;
  const review_img_count = parseInt(document.getElementById('crm-input-pending').value) || 0;

  const payload = {
    name,
    phone,
    interest,
    sourcePost,
    score,
    status,
    photoDelivery,
    owner,
    bookingDoctor,
    bookingDate,
    underlyingDisease,
    drugAllergy,
    casePrice,
    bookingAmount,
    before_img_count,
    after_img_count,
    review_img_count
  };

  if (apiBacked) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${encodeURIComponent(selectedId)}/crm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadConversationsFromApi();
        renderAll();
        showToast("บันทึกข้อมูลและสร้างงานติดตามลูกค้าสำเร็จ!");
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback to local memory
  conversation.name = name;
  conversation.phone = phone;
  conversation.interest = interest;
  conversation.sourcePost = sourcePost;
  conversation.score = score;
  conversation.status = status;
  conversation.photoDelivery = photoDelivery;
  conversation.owner = owner;
  conversation.bookingDoctor = bookingDoctor;
  conversation.bookingDate = bookingDate;
  conversation.underlyingDisease = underlyingDisease;
  conversation.drugAllergy = drugAllergy;
  conversation.casePrice = casePrice;
  conversation.bookingAmount = bookingAmount;
  conversation.before_img_count = before_img_count;
  conversation.after_img_count = after_img_count;
  conversation.review_img_count = review_img_count;

  renderAll();
  showToast("บันทึกงานติดตามในเครื่องเรียบร้อยแล้ว!");
}

// CRM Edit Modal Handling
window.openCrmEditModal = function(customerId) {
  const customer = conversations.find(c => c.id === customerId);
  if (!customer) return;

  document.getElementById('crm-edit-id').value = customer.id;
  document.getElementById('crm-edit-name').value = customer.name || '';
  document.getElementById('crm-edit-phone').value = customer.phone || '';
  document.getElementById('crm-edit-interest').value = customer.interest || '';
  document.getElementById('crm-edit-source').value = customer.sourcePost || '';
  document.getElementById('crm-edit-score').value = customer.score || 0;
  document.getElementById('crm-edit-status').value = customer.status || 'ตามครั้งที่ 1';
  document.getElementById('crm-edit-photo-delivery').value = customer.photoDelivery || '';
  document.getElementById('crm-edit-assignee').value = customer.owner || 'Unassigned';

  document.getElementById('crm-edit-booking-doctor').value = customer.bookingDoctor || '';
  document.getElementById('crm-edit-booking-date').value = customer.bookingDate || '';
  document.getElementById('crm-edit-underlying-disease').value = customer.underlyingDisease || '';
  document.getElementById('crm-edit-drug-allergy').value = customer.drugAllergy || '';
  document.getElementById('crm-edit-case-price').value = customer.casePrice || 0;
  document.getElementById('crm-edit-booking-amount').value = customer.bookingAmount || 0;

  document.getElementById('crm-edit-before').value = customer.before_img_count || 0;
  document.getElementById('crm-edit-after').value = customer.after_img_count || 0;
  document.getElementById('crm-edit-pending').value = customer.review_img_count || 0;

  const modal = document.getElementById('crmEditModal');
  if (modal) {
    modal.style.display = 'grid';
    modal.classList.remove('hidden');
  }
}

window.closeCrmEditModal = function() {
  const modal = document.getElementById('crmEditModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.add('hidden');
  }
}

// Redirect helper
window.navigateToChatWithCustomer = function(customerId) {
  selectedId = customerId;
  const navBtn = document.querySelector('.nav-item[data-view="inbox"]');
  if (navBtn) navBtn.click();
  renderAll();
};

// Wire up event listeners
document.querySelector("#crmSearchInput")?.addEventListener("input", renderCustomers);
document.querySelector("#crmStatusFilter")?.addEventListener("change", renderCustomers);
document.querySelector("#crmAssigneeFilter")?.addEventListener("change", renderCustomers);

document.getElementById('crmEditForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('crm-edit-id').value;
  if (!id) return;

  const payload = {
    name: document.getElementById('crm-edit-name').value,
    phone: document.getElementById('crm-edit-phone').value,
    interest: document.getElementById('crm-edit-interest').value,
    sourcePost: document.getElementById('crm-edit-source').value,
    score: parseInt(document.getElementById('crm-edit-score').value) || 0,
    status: document.getElementById('crm-edit-status').value,
    photoDelivery: document.getElementById('crm-edit-photo-delivery').value,
    owner: document.getElementById('crm-edit-assignee').value,
    bookingDoctor: document.getElementById('crm-edit-booking-doctor').value,
    bookingDate: document.getElementById('crm-edit-booking-date').value,
    underlyingDisease: document.getElementById('crm-edit-underlying-disease').value,
    drugAllergy: document.getElementById('crm-edit-drug-allergy').value,
    casePrice: parseInt(document.getElementById('crm-edit-case-price').value) || 0,
    bookingAmount: parseInt(document.getElementById('crm-edit-booking-amount').value) || 0,
    before_img_count: parseInt(document.getElementById('crm-edit-before').value) || 0,
    after_img_count: parseInt(document.getElementById('crm-edit-after').value) || 0,
    review_img_count: parseInt(document.getElementById('crm-edit-pending').value) || 0,
  };

  if (apiBacked) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${encodeURIComponent(id)}/crm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadConversationsFromApi();
        closeCrmEditModal();
        renderAll();
        showToast("แก้ไขข้อมูล CRM สำเร็จ!");
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Fallback
  const customer = conversations.find(c => c.id === id);
  if (customer) {
    Object.assign(customer, payload);
  }
  closeCrmEditModal();
  renderAll();
  showToast("แก้ไขข้อมูลในเครื่องสำเร็จ!");
});

// CRM Workspace Loader & Table Renderer
function initSelectedCrmId() {
  if (!selectedCrmId) {
    const crmAcc2 = conversations.find(c => c.channel === "LINE" && c.lineAccount === 2);
    if (crmAcc2) {
      selectedCrmId = crmAcc2.id;
    }
  }
}

function renderCrm() {
  initSelectedCrmId();
  renderCrmConversations();
  renderCrmChat();
  renderCrmProfile();
}

function renderCrmConversations() {
  const list = document.getElementById("crmConversationList");
  if (!list) return;

  const items = conversations.filter(c => c.channel === "LINE" && c.lineAccount === 2);
  list.innerHTML = items
    .map(
      (item) => {
        const messages = getConversationMessages(item);
        const latestMessage = messages[messages.length - 1];
        const aiState = getAiResponseState(item);
        return `
        <button class="conversation-item ${item.id === selectedCrmId ? "active" : ""}" type="button" data-id="${item.id}">
          <div class="avatar ${item.channel}">${item.name.slice(3, 5)}</div>
          <div class="conversation-copy">
            <strong>${item.name}</strong>
            <span>${getMessageText(latestMessage)}</span>
            <small class="ai-response-chip ${aiState.tone}">${aiState.label}</small>
          </div>
          <span class="conversation-time">${item.time}</span>
        </button>
      `;
      },
    )
    .join("") || `<p style="padding: 20px; color: #64748b; text-align: center;">ไม่มีบทสนทนาของบัญชี 2</p>`;

  list.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCrmId = button.dataset.id;
      renderAll();
    });
  });
}

function renderCrmChat() {
  const container = document.getElementById("crmChatDetail");
  if (!container) return;

  const item = conversations.find((c) => c.id === selectedCrmId);
  if (!item) {
    container.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b;">เลือกบทสนทนาเพื่อแสดงรายละเอียดแชท</div>`;
    return;
  }

  const messages = getConversationMessages(item);
  container.innerHTML = `
    <div class="chat-head">
      <div>
        <h2>${item.name}</h2>
        <span class="badge ${item.channel}">${item.channel}</span>
      </div>
      <span class="status-pill ${item.status === "ปิดการขาย" ? "done" : ""}">${item.status}</span>
    </div>
    ${renderAiResponsePanel(item)}
    <div class="messages">
      ${messages
        .map((message, index) => renderChatMessage(item, message, index))
        .join("")}
    </div>
    <form id="crmChatComposerForm" class="composer" data-customer-id="${item.id}">
      <input id="crmChatComposerInput" type="text" placeholder="พิมพ์ข้อความตอบกลับหรือบันทึกโน้ต" />
      <button id="sendCrmChatButton" class="primary-button" type="submit">ส่ง</button>
    </form>
  `;

  container.querySelectorAll(".save-chat-slip").forEach((button) => {
    button.addEventListener("click", () => {
      saveChatSlipToCustomer(button.dataset.customerId, Number(button.dataset.messageIndex));
      renderAll();
    });
  });

  container.querySelectorAll(".classify-photo").forEach((button) => {
    button.addEventListener("click", () => {
      classifyPatientPhoto(button.dataset.customerId, Number(button.dataset.messageIndex), button.dataset.stage);
      renderAll();
    });
  });

  container.querySelectorAll(".send-ai-welcome").forEach((button) => {
    button.addEventListener("click", () => {
      sendAiWelcomeReply(button.dataset.customerId);
      renderAll();
    });
  });

  const composerForm = container.querySelector("#crmChatComposerForm");
  composerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = container.querySelector("#crmChatComposerInput");
    const text = input.value.trim();
    if (!text) return;
    await sendChatMessage(item.id, text);
    renderAll();
  });
}

function renderCrmProfile() {
  const container = document.getElementById("crmProfileDetail");
  if (!container) return;

  const item = conversations.find((conversation) => conversation.id === selectedCrmId);
  if (!item) {
    container.innerHTML = "";
    return;
  }

  const beforeVal = item.before_img_count || 0;
  const afterVal = item.after_img_count || 0;
  const pendingVal = item.review_img_count || 0;
  const aiState = getAiResponseState(item);

  container.innerHTML = `
    <div class="profile-section">
      <h3>ข้อมูลที่ดึงจากแชท</h3>
      <div class="field-list">
        <div class="field">
          <span>ชื่อ</span>
          <input type="text" id="crm-tab-input-name" value="${escapeHtml(item.name || '')}" />
        </div>
        <div class="field">
          <span>เบอร์</span>
          <input type="text" id="crm-tab-input-phone" value="${escapeHtml(item.phone || '')}" />
        </div>
        <div class="field">
          <span>สนใจ</span>
          <select id="crm-tab-input-interest">
            <option value="" ${!item.interest ? 'selected' : ''}>-- เลือกคอร์ส --</option>
            <option value="คอร์สลดน้ำหนัก" ${item.interest === 'คอร์สลดน้ำหนัก' ? 'selected' : ''}>คอร์สลดน้ำหนัก</option>
            <option value="คอร์สลดเหนียง" ${item.interest === 'คอร์สลดเหนียง' ? 'selected' : ''}>คอร์สลดเหนียง</option>
            <option value="คอร์สปรับรูปหน้า" ${item.interest === 'คอร์สปรับรูปหน้า' ? 'selected' : ''}>คอร์สปรับรูปหน้า</option>
            <option value="ปรึกษาผิวหน้า" ${item.interest === 'ปรึกษาผิวหน้า' ? 'selected' : ''}>ปรึกษาผิวหน้า</option>
            <option value="รีวิวสินค้า" ${item.interest === 'รีวิวสินค้า' ? 'selected' : ''}>รีวิวสินค้า</option>
            <option value="อื่นๆ" ${item.interest === 'อื่นๆ' ? 'selected' : ''}>อื่นๆ</option>
          </select>
        </div>
        <div class="field">
          <span>แท็กกลุ่มลูกค้า</span>
          <select id="crm-tab-input-source">
            <option value="ลูกค้าใหม่" ${item.sourcePost === 'ลูกค้าใหม่' ? 'selected' : ''}>ลูกค้าใหม่</option>
            <option value="ต้องติดตาม" ${item.sourcePost === 'ต้องติดตาม' ? 'selected' : ''}>ต้องติดตาม</option>
            <option value="กำลังพิจารณา" ${item.sourcePost === 'กำลังพิจารณา' ? 'selected' : ''}>กำลังพิจารณา</option>
            <option value="จองคิว" ${item.sourcePost === 'จองคิว' ? 'selected' : ''}>จองคิว</option>
            <option value="ปิดการขาย" ${item.sourcePost === 'ปิดการขาย' ? 'selected' : ''}>ปิดการขาย</option>
            <option value="ไม่สนใจ" ${item.sourcePost === 'ไม่สนใจ' ? 'selected' : ''}>ไม่สนใจ</option>
          </select>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h3>Workflow</h3>
      <div class="field-list">
        <div class="field">
          <span>คะแนน</span>
          <input type="number" id="crm-tab-input-score" min="0" max="100" value="${item.score || 0}" />
        </div>
        <div class="field">
          <span>สถานะ</span>
          <select id="crm-tab-input-status">
            <option value="ตามครั้งที่ 1" ${item.status === 'ตามครั้งที่ 1' ? 'selected' : ''}>ตามครั้งที่ 1</option>
            <option value="ตามครั้งที่ 2" ${item.status === 'ตามครั้งที่ 2' ? 'selected' : ''}>ตามครั้งที่ 2</option>
            <option value="ตามครั้งที่ 3" ${item.status === 'ตามครั้งที่ 3' ? 'selected' : ''}>ตามครั้งที่ 3</option>
            <option value="ตามครั้งที่ 4" ${item.status === 'ตามครั้งที่ 4' ? 'selected' : ''}>ตามครั้งที่ 4</option>
            <option value="ตามครั้งที่ 5" ${item.status === 'ตามครั้งที่ 5' ? 'selected' : ''}>ตามครั้งที่ 5</option>
            <option value="ตามครั้งที่ 6" ${item.status === 'ตามครั้งที่ 6' ? 'selected' : ''}>ตามครั้งที่ 6</option>
          </select>
        </div>
        <div class="field">
          <span>การส่งรูป</span>
          <select id="crm-tab-input-photo-delivery">
            <option value="" ${!item.photoDelivery ? 'selected' : ''}>-- เลือกสถานะส่งรูป --</option>
            <option value="ส่งรูปแล้ว" ${item.photoDelivery === 'ส่งรูปแล้ว' ? 'selected' : ''}>ส่งรูปแล้ว</option>
            <option value="ไม่มีการส่งรูป" ${item.photoDelivery === 'ไม่มีการส่งรูป' ? 'selected' : ''}>ไม่มีการส่งรูป</option>
          </select>
        </div>
        <div class="field">
          <span>ผู้ดูแล</span>
          <select id="crm-tab-input-assignee">
            <option value="Unassigned" ${item.owner === 'Unassigned' || !item.owner ? 'selected' : ''}>ไม่มีผู้ดูแล</option>
            <option value="Sale A" ${item.owner === 'Sale A' ? 'selected' : ''}>Sale A</option>
            <option value="Sale B" ${item.owner === 'Sale B' ? 'selected' : ''}>Sale B</option>
          </select>
        </div>
      </div>
    </div>
    <div class="profile-section">
      <h3>AI ตอบแชท</h3>
      <div class="field-list">
        <div class="field"><span>SLA</span><strong>ไม่เกิน ${AI_RESPONSE_LIMIT_MINUTES} นาที</strong></div>
        <div class="field"><span>สถานะ</span><strong>${aiState.label}</strong></div>
      </div>
    </div>
    <div class="profile-section">
      <h3>รูปคนไข้</h3>
      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <div style="flex: 1; text-align: center;">
          <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px;">ก่อนทำ</span>
          <input type="number" id="crm-tab-input-before" min="0" value="${beforeVal}" style="text-align: center; width: 100%;" />
        </div>
        <div style="flex: 1; text-align: center;">
          <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px;">หลังทำ</span>
          <input type="number" id="crm-tab-input-after" min="0" value="${afterVal}" style="text-align: center; width: 100%;" />
        </div>
        <div style="flex: 1; text-align: center;">
          <span style="font-size: 11px; color: var(--muted); display: block; margin-bottom: 2px;">รอแยก</span>
          <input type="number" id="crm-tab-input-pending" min="0" value="${pendingVal}" style="text-align: center; width: 100%;" />
        </div>
      </div>
    </div>
    <button class="primary-button" type="button" onclick="saveActiveCustomerCrmFromTab()" style="width: 100%; margin-top: 10px;">สร้างงานติดตาม</button>
  `;
}

window.saveActiveCustomerCrmFromTab = async function() {
  if (!selectedCrmId) return;
  const conversation = conversations.find((item) => item.id === selectedCrmId);
  if (!conversation) return;

  const name = document.getElementById('crm-tab-input-name').value;
  const phone = document.getElementById('crm-tab-input-phone').value;
  const interest = document.getElementById('crm-tab-input-interest').value;
  const sourcePost = document.getElementById('crm-tab-input-source').value;
  const score = parseInt(document.getElementById('crm-tab-input-score').value) || 0;
  const status = document.getElementById('crm-tab-input-status').value;
  const photoDelivery = document.getElementById('crm-tab-input-photo-delivery')?.value ?? (conversation.photoDelivery || '');
  const owner = document.getElementById('crm-tab-input-assignee').value;

  const bookingDoctor = document.getElementById('crm-tab-input-booking-doctor')?.value ?? (conversation.bookingDoctor || '');
  const bookingDate = document.getElementById('crm-tab-input-booking-date')?.value ?? (conversation.bookingDate || '');
  const underlyingDisease = document.getElementById('crm-tab-input-underlying-disease')?.value ?? (conversation.underlyingDisease || '');
  const drugAllergy = document.getElementById('crm-tab-input-drug-allergy')?.value ?? (conversation.drugAllergy || '');
  const casePrice = document.getElementById('crm-tab-input-case-price') ? parseInt(document.getElementById('crm-tab-input-case-price').value) || 0 : (conversation.casePrice || 0);
  const bookingAmount = document.getElementById('crm-tab-input-booking-amount') ? parseInt(document.getElementById('crm-tab-input-booking-amount').value) || 0 : (conversation.bookingAmount || 0);
  
  const before_img_count = parseInt(document.getElementById('crm-tab-input-before').value) || 0;
  const after_img_count = parseInt(document.getElementById('crm-tab-input-after').value) || 0;
  const review_img_count = parseInt(document.getElementById('crm-tab-input-pending').value) || 0;

  const payload = {
    name,
    phone,
    interest,
    sourcePost,
    score,
    status,
    photoDelivery,
    owner,
    bookingDoctor,
    bookingDate,
    underlyingDisease,
    drugAllergy,
    casePrice,
    bookingAmount,
    before_img_count,
    after_img_count,
    review_img_count
  };

  if (apiBacked) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${encodeURIComponent(selectedCrmId)}/crm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadConversationsFromApi();
        renderAll();
        showToast("บันทึกข้อมูลและสร้างงานติดตามลูกค้าสำเร็จ!");
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback
  Object.assign(conversation, payload);
  renderAll();
  showToast("สร้างงานติดตามแบบจำลองสำเร็จ!");
}

async function initializeApp() {
  await loadConversationsFromApi();
  renderAll();
}

initializeApp();
