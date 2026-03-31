// ============================================================
// task3-survey.js
// Task 3 — Freedom & Pressure (Plan Selection)
// Dark pattern: Confirmshaming, upsell pressure, plan change friction
//
// Final schema aligned with:
// - Task 3 mode scripts
// - completion.js
// - Code.gs
//
// Survey questions:
//   Q1 (t3_freedom_winner)     — In which mode did you feel freer
//                                to choose without pressure?
//   Q2 (t3_A_pressure /
//       t3_B_pressure)         — How much pressure did each mode
//                                make you feel? (1–5 Likert)
//   Q3 (t3_respect_winner)     — Which mode felt more respectful
//                                of your decision?
//   Q4 (t3_comment)            — Open text, optional
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]"
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 3. Redirecting...");
    window.location.href = "task3-selection.html";
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
      src: "../assets/task3-mode-a.png",
      title: "Mode A — Overload",
      alt: "Task 3 Overload Mode screenshot",
    },
    modeB: {
      src: "../assets/task3-mode-b.png",
      title: "Mode B — Zen",
      alt: "Task 3 Zen Mode screenshot",
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
  const task3Tasks = allTasks.filter((t) => t.task === "task3");

  const overloadRec = task3Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA"
  );
  const zenRec = task3Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB"
  );

  const freedomWinner = formData.get("q1_freedom") || "same";
  const respectWinner = formData.get("q3_respect") || "same";

  return {
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task3",

    behavioral: {
      t3_A_timeSpent: overloadRec?.timeSpent ?? "",
      t3_B_timeSpent: zenRec?.timeSpent ?? "",
      t3_A_firstClickTime: overloadRec?.firstClickTime ?? "",
      t3_B_firstClickTime: zenRec?.firstClickTime ?? "",
      t3_A_misclicks: overloadRec?.misclicks ?? "",
      t3_B_misclicks: zenRec?.misclicks ?? "",
      t3_A_planChanges: overloadRec?.planChanges ?? "",
      t3_B_planChanges: zenRec?.planChanges ?? "",
      t3_A_confirmShamingShown: overloadRec?.confirmshamingShown ?? "",
      t3_A_finalPlan: overloadRec?.finalPlan ?? "",
      t3_B_finalPlan: zenRec?.finalPlan ?? "",
    },

    survey: {
      t3_freedom_winner: freedomWinner,
      t3_A_pressure: parseInt(formData.get("q2_overload_pressure"), 10) || "",
      t3_B_pressure: parseInt(formData.get("q2_zen_pressure"), 10) || "",
      t3_respect_winner: respectWinner,
      t3_comment: (formData.get("q4_comments") || "").trim(),
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
  if (!tasksCompleted.includes("task3")) {
    tasksCompleted.push("task3");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task3ModesCompleted");
  sessionStorage.removeItem("task3FirstMode");

  setTimeout(() => {
    window.location.href = "../Task4/task4-selection.html";
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
