const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const revealTargets = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  document.body.classList.add("motion-ready");

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  revealTargets.forEach((target) => observer.observe(target));
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

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get("name") || "담당자";
  const googleSheetUrl = contactForm.dataset.googleSheetUrl;
  const submitButton = contactForm.querySelector('button[type="submit"]');
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
    submitButton.disabled = true;

    postToGoogleSheet(googleSheetUrl, payload);

    window.setTimeout(() => {
      formNote.textContent = `${name}님, 문의가 접수되었습니다. 내용을 확인 후 연락드리겠습니다.`;
      contactForm.reset();
      submitButton.disabled = false;
    }, 900);
    return;
  }

  formNote.textContent = `${name}님, 문의 내용을 확인했습니다. 실제 발송 연동은 메일 또는 CRM 연결 시 완성됩니다.`;
  contactForm.reset();
});
