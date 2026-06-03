const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeNav = () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "메뉴 열기");
};

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("hashchange", closeNav);
updateHeader();

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeNav();
  }
});

document.addEventListener("click", (event) => {
  if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
    closeNav();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get("name") || "담당자";
  const googleSheetUrl = contactForm.dataset.googleSheetUrl;
  const payload = {
    name: formData.get("name") || "",
    company: formData.get("company") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    topic: formData.get("topic") || "",
    message: formData.get("message") || "",
  };

  if (googleSheetUrl) {
    formNote.textContent = "문의 내용을 전송하고 있습니다.";

    fetch(googleSheetUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    formNote.textContent = `${name}님, 문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.`;
    contactForm.reset();
    return;
  }

  formNote.textContent = `${name}님, 문의 내용이 확인되었습니다. 실제 발송 연동은 메일 또는 CRM 연결 후 활성화됩니다.`;
  contactForm.reset();
});
