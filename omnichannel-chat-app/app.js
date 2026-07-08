const conversations = [
  {
    id: "fb-001",
    channel: "Facebook",
    name: "คุณมินตรา",
    time: "10:42",
    owner: "Sale A",
    status: "ต้องติดตาม",
    phone: "089-234-8891",
    interest: "คอร์สลดน้ำหนัก",
    sourcePost: "โฆษณาโปรเดือนนี้",
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
    name: "คุณต้น",
    time: "09:58",
    owner: "Sale B",
    status: "จองคิว",
    phone: "082-775-4410",
    interest: "ปรึกษาผิวหน้า",
    sourcePost: "Rich menu",
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
    id: "tt-109",
    channel: "TikTok",
    name: "Nana Beauty",
    time: "09:21",
    owner: "Unassigned",
    status: "รอคัดกรอง",
    phone: "-",
    interest: "รีวิวสินค้า",
    sourcePost: "Live comment",
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
    status: "ปิดการขาย",
    phone: "086-112-9088",
    interest: "แพ็กเกจตรวจสุขภาพ",
    sourcePost: "Inbox direct",
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
const fernClinicWelcomeMessage =
  "สวัสดีค่ะ Fern Clinic ยินดีต้อนรับค่ะ แอดมินได้รับข้อความแล้ว ขออนุญาตดูข้อมูลและตอบกลับโดยเร็วที่สุดนะคะ";

const workflowSteps = [
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
  line: ["channelId", "channelSecret", "accessToken"],
  tiktok: ["businessId", "clientKey", "clientSecret"],
};

let selectedId = conversations[0].id;
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

function getConversationMessages(conversation) {
  const aiReply = getStoredAiReplies()[conversation.id];
  return aiReply ? [...conversation.messages, aiReply] : conversation.messages;
}

function getAiResponseState(conversation) {
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
    const matchesChannel = channelFilter === "all" || item.channel === channelFilter;
    const haystack = `${item.name} ${item.phone} ${item.interest} ${getConversationMessages(item).map(getMessageText).join(" ")}`.toLowerCase();
    return matchesChannel && (!query || haystack.includes(query));
  });
}

function getFilteredCustomers() {
  return conversations.filter((item) => customerChannelFilter === "all" || item.channel === customerChannelFilter);
}

function renderMetrics() {
  const captured = conversations.filter((item) => item.phone !== "-").length;
  const follow = conversations.filter((item) => item.status !== "ปิดการขาย").length;
  const aiPending = conversations.filter((item) => getAiResponseState(item).waiting).length;
  document.querySelector("#newChatsMetric").textContent = conversations.length;
  document.querySelector("#capturedMetric").textContent = `${Math.round((captured / conversations.length) * 100)}%`;
  document.querySelector("#followMetric").textContent = follow;
  document.querySelector("#aiPendingMetric").textContent = aiPending;
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
    <div class="composer">
      <input type="text" placeholder="พิมพ์ข้อความตอบกลับหรือบันทึกโน้ต" />
      <button class="primary-button" type="button">ส่ง</button>
    </div>
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
  const attachment = Array.isArray(message) ? null : message.attachment;
  const slipSaved = Boolean(getStoredSlips()[conversation.id]);
  const patientPhotoKey = `${conversation.id}-${index}`;
  const photoRecord = getStoredPatientPhotos()[patientPhotoKey];

  return `
    <div class="message ${role === "agent" ? "agent" : ""} ${message.automated ? "automated" : ""}">
      ${message.automated ? `<small class="auto-reply-label">AI Auto Reply</small>` : ""}
      <span>${text}</span>
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
  const photoSummary = getPatientPhotoSummary(item.id);
  const aiState = getAiResponseState(item);
  profileDetail.innerHTML = `
    <div class="profile-section">
      <h3>ข้อมูลที่ดึงจากแชท</h3>
      <div class="field-list">
        <div class="field"><span>ชื่อ</span><strong>${item.name}</strong></div>
        <div class="field"><span>เบอร์</span><strong>${item.phone}</strong></div>
        <div class="field"><span>สนใจ</span><strong>${item.interest}</strong></div>
        <div class="field"><span>แหล่งที่มา</span><strong>${item.sourcePost}</strong></div>
      </div>
    </div>
    <div class="profile-section">
      <h3>Workflow</h3>
      <div class="field-list">
        <div class="field"><span>คะแนน</span><strong>${item.score}/100</strong></div>
        <div class="field"><span>สถานะ</span><strong>${item.status}</strong></div>
        <div class="field"><span>ผู้ดูแล</span><strong>${item.owner}</strong></div>
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
      <div class="photo-summary">
        <div><span>ก่อนทำ</span><strong>${photoSummary.before}</strong></div>
        <div><span>หลังทำ</span><strong>${photoSummary.after}</strong></div>
        <div><span>รอแยก</span><strong>${photoSummary.pending}</strong></div>
      </div>
    </div>
    <button class="secondary-button" type="button">สร้างงานติดตาม</button>
  `;
}

function renderWorkflow() {
  workflowGrid.innerHTML = workflowSteps
    .map(
      (step, index) => `
        <article class="workflow-card">
          <span class="step-number">${index + 1}</span>
          <strong>${step.title}</strong>
          <p>${step.detail}</p>
          <span class="status-pill done">พร้อมใช้งาน</span>
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
        <td colspan="9" class="empty-row">ไม่พบข้อมูลลูกค้าในช่องทางนี้</td>
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

function sendAiWelcomeReply(customerId) {
  const conversation = conversations.find((item) => item.id === customerId);
  if (!conversation) {
    showToast("ไม่พบห้องแชทนี้");
    return;
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
  renderConversations();
  renderChat();
  renderProfile();
  showToast("AI ส่งข้อความต้อนรับเฟิร์นคลีนิคแล้ว");
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
  renderConversations();
  renderChat();
  renderProfile();
  renderWorkflow();
  renderCustomers();
  renderUserAccounts();
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

document.querySelector("#syncButton").addEventListener("click", () => {
  const configs = getStoredConfigs();
  const connectedCount = Object.entries(channelConfigFields).filter(([platform]) => isConfigComplete(platform, configs[platform] || {})).length;
  showToast(connectedCount ? `พร้อมซิงก์ ${connectedCount} ช่องทางที่บันทึก Key แล้ว` : "กรอก Key ในเมนูเชื่อมต่อช่องทางก่อนซิงก์จริง");
});

document.querySelector("#runWorkflowButton").addEventListener("click", () => {
  showToast("ประมวลผล workflow: ดึงข้อมูลสำคัญ แยกรูปก่อน/หลัง และตรวจแชทที่ต้องตอบภายใน 2 นาที");
});

document.querySelector("#exportButton").addEventListener("click", () => {
  const slips = getStoredSlips();
  const header = ["name", "channel", "phone", "interest", "status", "before_photos", "after_photos", "payment_slip", "owner"];
  const rows = getFilteredCustomers().map((item) => {
    const photoSummary = getPatientPhotoSummary(item.id);
    return [
      item.name,
      item.channel,
      item.phone,
      item.interest,
      item.status,
      photoSummary.before,
      photoSummary.after,
      slips[item.id] ? slips[item.id].name : "",
      item.owner,
    ];
  });
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "omnichat-customers.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("ส่งออกข้อมูลลูกค้าเป็น CSV แล้ว");
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
renderAll();
