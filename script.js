/* =============================================================
   이안AX — 인터랙션 스크립트
   ============================================================= */

// 아이콘 렌더
if (window.lucide) lucide.createIcons();

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const revealTargets = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---------- 헤더 / 스크롤 ---------- */
const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeNav = () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "메뉴 열기");
  document.body.classList.remove("menu-open");
};

const setupReveal = () => {
  if (prefersReducedMotion.matches) {
    revealTargets.forEach((t) => t.classList.add("is-visible"));
    return;
  }
  document.body.classList.add("motion-ready");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  revealTargets.forEach((t) => observer.observe(t));
};

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("hashchange", closeNav);
updateHeader();
setupReveal();

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  document.body.classList.toggle("menu-open", isOpen);
});

nav.addEventListener("click", (e) => {
  if (e.target.matches("a")) closeNav();
});
document.addEventListener("click", (e) => {
  if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
});

/* ---------- 문의 폼 ---------- */
const postToGoogleSheet = (url, values) => {
  const iframeName = "google-sheet-submit-frame";
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.hidden = true;
    document.body.appendChild(iframe);
  }
  const form = document.createElement("form");
  form.action = url;
  form.method = "POST";
  form.target = iframeName;
  form.style.display = "none";
  Object.entries(values).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  form.remove();
};

const setNote = (msg, type) => {
  formNote.textContent = msg;
  formNote.classList.remove("ok", "err");
  if (type) formNote.classList.add(type);
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => /[0-9]{2,4}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}/.test(v.trim());

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fd = new FormData(contactForm);

  // 허니팟: 봇이 채우면 조용히 무시
  if ((fd.get("company_website") || "").trim() !== "") return;

  const name = (fd.get("name") || "").trim();
  const company = (fd.get("company") || "").trim();
  const phone = (fd.get("phone") || "").trim();
  const email = (fd.get("email") || "").trim();
  const agree = contactForm.querySelector('[name="privacy_agree"]').checked;

  // 검증
  if (!name || !company) return setNote("담당자명과 회사명을 입력해 주세요.", "err");
  if (!phoneOk(phone)) return setNote("연락처를 정확히 입력해 주세요.", "err");
  if (!emailOk(email)) return setNote("이메일 형식을 확인해 주세요.", "err");
  if (!agree) return setNote("개인정보 수집·이용 동의가 필요합니다.", "err");

  const googleSheetUrl = contactForm.dataset.googleSheetUrl;
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const payload = {
    name, company, phone, email,
    topic: fd.get("topic") || "",
    message: (fd.get("message") || "").trim(),
  };

  if (googleSheetUrl) {
    setNote("문의 내용을 전송하고 있습니다.", "ok");
    submitButton.disabled = true;
    postToGoogleSheet(googleSheetUrl, payload);
    window.setTimeout(() => {
      setNote(`${name}님, 문의가 접수되었습니다. 내용을 확인 후 연락드리겠습니다.`, "ok");
      contactForm.reset();
      submitButton.disabled = false;
    }, 900);
    return;
  }
  setNote(`${name}님, 문의 내용을 확인했습니다. 연락처 또는 메일로 회신드리겠습니다.`, "ok");
  contactForm.reset();
});

/* =============================================================
   약관 모달 (개인정보 처리방침 / 이메일 무단수집 거부 / 이용약관)
   ============================================================= */
const modalContents = {
  privacy: {
    title: "개인정보 처리방침",
    body: `
      <p>이안AX(이하 "회사")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.</p>
      <h3>1. 개인정보의 처리 목적</h3>
      <p>회사는 다음의 목적을 위해 개인정보를 처리합니다.</p>
      <ul>
        <li>문의 접수 및 답변</li>
        <li>서비스, 프로그램, 컨설팅, AI 보안 환경 구축 및 설정 관련 상담</li>
        <li>문의 내용 확인, 담당자 연락, 후속 안내</li>
        <li>서비스 품질 개선 및 고객 응대 이력 관리</li>
      </ul>
      <h3>2. 처리하는 개인정보 항목</h3>
      <p><strong>필수 항목:</strong> 담당자명, 회사명, 연락처, 이메일 주소, 문의 주제, 문의 내용</p>
      <p><strong>자동 수집 항목:</strong> 접속 IP 주소, 브라우저 정보, 기기 정보, 접속 일시, 서비스 이용 기록, 쿠키 정보</p>
      <h3>3. 개인정보의 처리 및 보유기간</h3>
      <p>수집·이용 목적 달성 시까지 보유하며, 목적 달성 후 지체 없이 파기합니다. 분쟁 대응을 위해 필요한 경우 문의 접수일로부터 최대 3년간 보관할 수 있습니다.</p>
      <h3>4. 개인정보의 제3자 제공</h3>
      <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 이용자 동의, 법령 규정, 수사기관의 적법한 요청이 있는 경우 예외적으로 제공할 수 있습니다.</p>
      <h3>5. 개인정보 처리의 위탁 및 국외 이전</h3>
      <p>1) Google LLC — 홈페이지 문의 접수 정보 저장 및 관리(Google Workspace/Apps Script). 처리 데이터가 미국 등 국외 서버에 저장·처리될 수 있습니다.</p>
      <p>2) 네이버클라우드㈜ (네이버웍스) — 이메일 서비스 운영 및 문의 접수 알림 제공.</p>
      <h3>6. 개인정보의 파기</h3>
      <p>전자적 파일은 복구 불가능한 방법으로 삭제하며, 종이 문서는 분쇄 또는 소각합니다.</p>
      <h3>7. 이용자의 권리</h3>
      <p>이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 개인정보 보호책임자 이메일로 요청하시면 됩니다.</p>
      <h3>8. 쿠키의 사용</h3>
      <p>회사는 서비스 개선을 위해 쿠키를 사용할 수 있습니다. 브라우저 설정을 통해 쿠키를 거부할 수 있습니다.</p>
      <h3>9. 개인정보 보호책임자</h3>
      <ul>
        <li>책임자: 지성현</li>
        <li>소속: 이안AX</li>
        <li>이메일: mzesh0318@ianax.co.kr</li>
        <li>연락처: 010-3256-3589</li>
      </ul>
      <h3>10. 권익침해 구제방법</h3>
      <ul>
        <li>개인정보침해신고센터: 118 / privacy.kisa.or.kr</li>
        <li>개인정보 분쟁조정위원회: 1833-6972 / kopico.go.kr</li>
        <li>대검찰청 사이버수사과: 1301</li>
        <li>경찰청 사이버범죄 신고시스템: 182</li>
      </ul>
      <p class="modal-date">공고일자: 2026년 06월 23일 &nbsp;|&nbsp; 시행일자: 2026년 06월 23일</p>
    `,
  },
  email: {
    title: "이메일 무단수집 거부",
    body: `
      <p>이안AX는 홈페이지에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부합니다.</p>
      <p>「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령에 따라, 본 홈페이지에 게시된 이메일 주소를 무단으로 수집하거나 이를 이용하여 광고성 정보 등을 전송하는 행위는 금지되어 있습니다.</p>
      <p>이를 위반할 경우 관련 법령에 따라 처벌받을 수 있습니다.</p>
      <p><strong>이안AX</strong></p>
    `,
  },
  terms: {
    title: "이용약관",
    body: `
      <h3>제1조 (목적)</h3>
      <p>본 약관은 이안AX(이하 "회사")가 운영하는 웹사이트의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정하는 것을 목적으로 합니다.</p>
      <h3>제2조 (서비스의 제공)</h3>
      <p>회사는 사이트를 통해 다음과 같은 서비스를 제공합니다.</p>
      <ul>
        <li>기업 대상 AI·AX 교육 관련 정보 제공</li>
        <li>기업 맞춤형 교육 및 컨설팅 서비스 안내</li>
        <li>교육 및 컨설팅 문의 접수</li>
        <li>기타 회사가 제공하는 관련 서비스 안내</li>
      </ul>
      <h3>제3조 (이용자의 의무)</h3>
      <p>이용자는 사이트 이용 시 다음 행위를 하여서는 안 됩니다.</p>
      <ul>
        <li>타인의 개인정보를 도용하거나 허위 정보를 제공하는 행위</li>
        <li>회사의 서비스 운영을 방해하는 행위</li>
        <li>사이트 내 게시된 콘텐츠를 회사의 동의 없이 복제, 배포, 상업적으로 이용하는 행위</li>
        <li>관련 법령을 위반하는 행위</li>
      </ul>
      <h3>제4조 (문의 서비스 이용)</h3>
      <p>이용자는 사이트 내 문의 기능을 통해 교육 및 컨설팅 관련 문의를 접수할 수 있습니다. 회사는 접수된 문의 내용을 확인 후 담당자를 통해 답변 또는 상담을 진행합니다.</p>
      <h3>제5조 (콘텐츠 및 저작권)</h3>
      <p>사이트 내 제공되는 모든 콘텐츠에 대한 저작권 및 지식재산권은 회사 또는 정당한 권리자에게 귀속됩니다. 이용자는 회사의 사전 동의 없이 해당 콘텐츠를 복제, 수정, 배포, 판매 또는 상업적으로 이용할 수 없습니다.</p>
      <h3>제6조 (회사의 의무)</h3>
      <p>회사는 관련 법령을 준수하며 안정적인 서비스 제공을 위해 노력합니다.</p>
      <h3>제7조 (서비스 이용 제한)</h3>
      <p>법령 위반, 타인의 권리 침해, 서비스 운영 방해 등의 경우 서비스 이용을 제한할 수 있습니다.</p>
      <h3>제8조 (회사의 책임 제한)</h3>
      <p>천재지변, 불가항력적 사유 또는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해서는 책임을 제한할 수 있습니다.</p>
      <h3>제9조 (분쟁 해결)</h3>
      <p>회사와 이용자 간 발생한 분쟁은 상호 협의를 통해 해결하도록 노력합니다.</p>
      <h3>제10조 (약관의 변경)</h3>
      <p>회사는 관련 법령 변경 또는 서비스 운영상 필요한 경우 본 약관을 변경할 수 있으며, 변경 사항은 사이트를 통해 공지합니다.</p>
      <p class="modal-date">시행일자: 2026년 06월 12일</p>
    `,
  },
};

const overlay = document.getElementById("modalOverlay");
const modalBox = overlay.querySelector(".modal-box");
let lastFocused = null;

function openModal(type) {
  const content = modalContents[type];
  if (!content) return;
  document.getElementById("modalTitle").textContent = content.title;
  document.getElementById("modalBody").innerHTML = content.body;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  lastFocused = document.activeElement;
  overlay.querySelector("[data-modal-close]").focus();
}

function closeModal() {
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocused) lastFocused.focus();
}

// 트리거 바인딩
document.querySelectorAll("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.getAttribute("data-modal")));
});
overlay.querySelector("[data-modal-close]").addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

// 키보드: ESC 닫기 + 포커스 트랩
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (overlay.classList.contains("is-open")) closeModal();
    closeNav();
  }
  if (e.key === "Tab" && overlay.classList.contains("is-open")) {
    const focusable = modalBox.querySelectorAll(
      'button, a[href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
