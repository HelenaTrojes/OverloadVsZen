// ============================================================
// task5-survey.js
// Task 5 — Focus & Distraction (Reading Comprehension)
// Dark pattern: Repeated popups, pressure timer, video interruptions
//               that break reading focus and impair comprehension
//
// Final schema aligned with:
// - Task 5 mode scripts
// - completion.js
// - Code.gs
//
// Survey questions:
//   Q1 (t5_focus_winner)         — Which mode allowed you to focus better?
//   Q2 (t5_A_distraction /
//       t5_B_distraction)        — How distracted did you feel in each mode?
//   Q3 (t5_effectiveness_winner) — In which mode did you feel more effective?
//   Q4 (t5_comment)              — Open text, optional
//
// Note: This is the final task. On submit, studyComplete and
// studyCompletedAt are set before redirecting to completion.html
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task5ModesCompleted") || "[]"
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 5. Redirecting...");
    window.location.href = "task5-selection.html";
    return;
  }

  const surveyForm = document.getElementById("surveyForm");
  if (surveyForm) {
    surveyForm.addEventListener("submit", handleSubmit);
  }

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
      src: "../assets/task5-mode-a.png",
      title: "Mode A — Overload",
      alt: "Task 5 Overload Mode screenshot",
    },
    modeB: {
      src: "../assets/task5-mode-b.png",
      title: "Mode B — Zen",
      alt: "Task 5 Zen Mode screenshot",
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

// ── Build payload ─────────────────────────────────────────────

function buildPayload(formData) {
  const allTasks = JSON.parse(sessionStorage.getItem("completedTasks") || "[]");
  const task5Tasks = allTasks.filter((t) => t.task === "task5");

  const overloadRec = task5Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA"
  );
  const zenRec = task5Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB"
  );

  const focusWinner = formData.get("q1_focus") || "same";
  const effectivenessWinner = formData.get("q3_effectiveness") || "same";

  return {
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task5",

    behavioral: {
      t5_A_timeSpent: overloadRec?.timeSpent ?? "",
      t5_B_timeSpent: zenRec?.timeSpent ?? "",
      t5_A_firstClickTime: overloadRec?.firstClickTime ?? "",
      t5_B_firstClickTime: zenRec?.firstClickTime ?? "",
      t5_A_misclicks: overloadRec?.misclicks ?? "",
      t5_B_misclicks: zenRec?.misclicks ?? "",
      t5_A_interruptionCount: overloadRec?.interruptionCount ?? "",
      t5_B_interruptionCount: zenRec?.interruptionCount ?? "",
      t5_A_answerCorrect: overloadRec?.answerCorrect ?? "",
      t5_B_answerCorrect: zenRec?.answerCorrect ?? "",
    },

    survey: {
      t5_focus_winner: focusWinner,
      t5_A_distraction:
        parseInt(formData.get("q2_overload_distraction"), 10) || "",
      t5_B_distraction:
        parseInt(formData.get("q2_zen_distraction"), 10) || "",
      t5_effectiveness_winner: effectivenessWinner,
      t5_comment: (formData.get("q4_comments") || "").trim(),
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
  if (!tasksCompleted.includes("task5")) {
    tasksCompleted.push("task5");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task5ModesCompleted");
  sessionStorage.removeItem("task5FirstMode");

  sessionStorage.setItem("studyComplete", "true");
  sessionStorage.setItem("studyCompletedAt", new Date().toISOString());

  setTimeout(() => {
    window.location.href = "../completion.html";
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