// ============================================================
// task1-survey.js
// Task 1 — Mental Clarity & Cognitive Load
// Dark pattern: Distraction (irrelevant buttons, visual noise)
//
// Final schema aligned with:
// - Task 1 mode scripts
// - completion.js
// - Code.gs
//
// Survey questions:
//   Q1 (t1_clarity_winner)  — Which mode felt clearer to navigate?
//   Q2 (t1_A_stress / t1_B_stress) — How stressful did each mode feel? (1–5)
//   Q3 (t1_control_winner)  — In which mode did you feel more in control?
//   Q4 (t1_comment)         — Open text, optional
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task1ModesCompleted") || "[]"
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 1. Redirecting...");
    window.location.href = "task1-selection.html";
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
      src: "../assets/task1-mode-a.png",
      title: "Mode A — Overload",
      alt: "Task 1 Overload Mode screenshot",
    },
    modeB: {
      src: "../assets/task1-mode-b.png",
      title: "Mode B — Zen",
      alt: "Task 1 Zen Mode screenshot",
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
  const task1Tasks = allTasks.filter((t) => t.task === "task1");

  const overloadRec = task1Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA"
  );
  const zenRec = task1Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB"
  );

  const clarityWinner = formData.get("q1_clarity") || "same";
  const controlWinner = formData.get("q3_control") || "same";

  return {
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task1",

    behavioral: {
      t1_A_timeSpent: overloadRec?.timeSpent ?? "",
      t1_B_timeSpent: zenRec?.timeSpent ?? "",
      t1_A_firstClickTime: overloadRec?.firstClickTime ?? "",
      t1_B_firstClickTime: zenRec?.firstClickTime ?? "",
      t1_A_misclicks: overloadRec?.misclicks ?? "",
      t1_B_misclicks: zenRec?.misclicks ?? "",
      t1_A_deceptionClicks: overloadRec?.deceptionClicks ?? "",
    },

    survey: {
      t1_clarity_winner: clarityWinner,
      t1_A_stress: parseInt(formData.get("q2_overload_feeling"), 10) || "",
      t1_B_stress: parseInt(formData.get("q2_zen_feeling"), 10) || "",
      t1_control_winner: controlWinner,
      t1_comment: (formData.get("q4_comments") || "").trim(),
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
  if (!tasksCompleted.includes("task1")) {
    tasksCompleted.push("task1");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task1ModesCompleted");
  sessionStorage.removeItem("task1FirstMode");

  setTimeout(() => {
    window.location.href = "../Task2/task2-selection.html";
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
