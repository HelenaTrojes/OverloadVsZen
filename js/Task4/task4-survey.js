// ============================================================
// task4-survey.js
// Task 4 — Trust & Transparency (Product Purchase)
// Dark pattern: Fake countdown timer, fake viewer count,
//               fake stock alerts, false urgency
//
// Final schema aligned with:
// - Task 4 mode scripts
// - completion.js
// - Code.gs
//
// Survey questions:
//   Q1 (t4_trust_winner)       — Which mode felt more trustworthy?
//   Q2 (t4_A_urgency /
//       t4_B_urgency)          — How much urgency or time pressure
//                                did each mode make you feel? (1–5)
//   Q3 (t4_honesty_winner)     — Which mode felt more honest?
//   Q4 (t4_comment)            — Open text, optional
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task4ModesCompleted") || "[]"
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 4. Redirecting...");
    window.location.href = "task4-selection.html";
    return;
  }

  const surveyForm = document.getElementById("surveyForm");
  if (surveyForm) {
    surveyForm.addEventListener("submit", handleSubmit);
  }

  initFloatingModeReminder();
  initPreviewModal();
  initValidationShake();
});

// ── Modal ─────────────────────────────────────────────────────

function initPreviewModal() {
  const modal = document.getElementById("modePreviewModal");
  const titleEl = document.getElementById("modePreviewTitle");
  const imageEl = document.getElementById("modePreviewImage");
  const closeBtn = document.getElementById("modePreviewClose");
  const previewBtns = document.querySelectorAll(".preview-btn");

  if (!modal || !titleEl || !imageEl || !closeBtn || !previewBtns.length) {
    return;
  }

  const defaults = {
    modeA: {
      src: "../assets/task4-mode-a.png",
      title: "Mode A — Overload",
      alt: "Task 4 Overload Mode screenshot",
    },
    modeB: {
      src: "../assets/task4-mode-b.png",
      title: "Mode B — Zen",
      alt: "Task 4 Zen Mode screenshot",
    },
  };

  let lastTrigger = null;

  const openModal = (btn) => {
    const d = defaults[btn.dataset.previewMode] || {};
    titleEl.textContent = btn.dataset.previewTitle || d.title || "Preview";
    imageEl.src = btn.dataset.previewSrc || d.src || "";
    imageEl.alt = btn.dataset.previewAlt || d.alt || "";
    lastTrigger = btn;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  };

  previewBtns.forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn));
  });

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

function initFloatingModeReminder() {
  const topReminder = document.querySelector(".mode-preview-section");
  const floatingReminder = document.getElementById("floatingModeReminder");
  const desktopMedia = window.matchMedia("(min-width: 1025px)");

  if (!topReminder || !floatingReminder) {
    return;
  }

  const setVisible = (isVisible) => {
    const shouldShow = isVisible && desktopMedia.matches;
    floatingReminder.classList.toggle("is-visible", shouldShow);
    floatingReminder.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  };

  setVisible(false);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.intersectionRatio < 0.35);
      },
      {
        threshold: [0, 0.35, 1],
      }
    );

    observer.observe(topReminder);
  } else {
    const updateVisibility = () => {
      const rect = topReminder.getBoundingClientRect();
      const visibleHeight =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = visibleHeight > 0 ? visibleHeight / rect.height : 0;
      setVisible(ratio < 0.35);
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    updateVisibility();
  }

  const handleMediaChange = () => {
    if (!desktopMedia.matches) {
      setVisible(false);
    }
  };

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleMediaChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(handleMediaChange);
  }
}

// ── Build payload ─────────────────────────────────────────────

function buildPayload(formData) {
  const allTasks = JSON.parse(sessionStorage.getItem("completedTasks") || "[]");
  const task4Tasks = allTasks.filter((t) => t.task === "task4");

  const overloadRec = task4Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA"
  );
  const zenRec = task4Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB"
  );

  const trustWinner = formData.get("q1_trust") || "same";
  const honestyWinner = formData.get("q3_honesty") || "same";

  return {
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task4",

    behavioral: {
      t4_A_timeSpent: overloadRec?.timeSpent ?? "",
      t4_B_timeSpent: zenRec?.timeSpent ?? "",
      t4_A_firstClickTime: overloadRec?.firstClickTime ?? "",
      t4_B_firstClickTime: zenRec?.firstClickTime ?? "",
      t4_A_misclicks: overloadRec?.misclicks ?? "",
      t4_B_misclicks: zenRec?.misclicks ?? "",
      t4_A_productChosen: overloadRec?.productChosen ?? "",
      t4_B_productChosen: zenRec?.productChosen ?? "",
      t4_A_priceChosen: overloadRec?.priceChosen ?? "",
      t4_B_priceChosen: zenRec?.priceChosen ?? "",
    },

    survey: {
      t4_trust_winner: trustWinner,
      t4_A_urgency: parseInt(formData.get("q2_overload_urgency"), 10) || "",
      t4_B_urgency: parseInt(formData.get("q2_zen_urgency"), 10) || "",
      t4_honesty_winner: honestyWinner,
      t4_comment: (formData.get("q4_comments") || "").trim(),
    },
  };
}

// ── Submit ────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const payload = buildPayload(formData);

  saveOrUpdateSurveyResponse(payload);

  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]"
  );
  if (!tasksCompleted.includes("task4")) {
    tasksCompleted.push("task4");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task4ModesCompleted");
  sessionStorage.removeItem("task4FirstMode");

  setTimeout(() => {
    window.location.href = "../Task5/task5-selection.html";
  }, 500);
}

// ── Storage helper ────────────────────────────────────────────

function saveOrUpdateSurveyResponse(payload) {
  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]"
  );

  const index = allSurveys.findIndex((item) => item.task === payload.task);

  if (index >= 0) {
    allSurveys[index] = payload;
  } else {
    allSurveys.push(payload);
  }

  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));
}

// ── Validation shake animation ────────────────────────────────

function initValidationShake() {
  document.querySelectorAll("input[required]").forEach((input) => {
    input.addEventListener("invalid", (e) => {
      e.preventDefault();
      const block = e.target.closest(".question-block");
      if (!block) return;

      block.style.animation = "shake 0.5s";
      setTimeout(() => {
        block.style.animation = "";
      }, 500);
    });
  });

  if (!document.getElementById("survey-shake-style")) {
    const style = document.createElement("style");
    style.id = "survey-shake-style";
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);
  }
}
