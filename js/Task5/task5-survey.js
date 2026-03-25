// ============================================================
// task5-survey.js
// Task 5 — Focus & Distraction (Reading Comprehension)
// Dark pattern: Repeated popups, pressure timer, video interruptions
//               that break reading focus and impair comprehension
//
// Survey questions:
//   Q1 (t5_focus_winner)         — Which mode allowed you to focus better?
//                                  comparative: "overload" / "zen" / "same"
//   Q2 (t5_A_distraction /
//       t5_B_distraction)        — How distracted did you feel in each mode?
//                                  (1–5 Likert)
//                                  1 = Not distracted, 5 = Very distracted
//   Q3 (t5_effectiveness_winner) — In which mode did you feel more
//                                  effective at completing the task?
//                                  comparative: "overload" / "zen" / "same"
//   Q4 (t5_comment)              — Open text, optional
//
// Form field names (HTML):
//   q1_focus, q2_overload_distraction, q2_zen_distraction,
//   q3_effectiveness, q4_comments
//
// Payload sent to Google Sheets:
//   data.behavioral  → Behavioral_Data sheet
//   data.survey      → Survey_Responses sheet
//
// Note: This is the final task. On submit, studyComplete and
//       studyCompletedAt are set in sessionStorage before
//       redirecting to the completion page.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task5ModesCompleted") || "[]",
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 5. Redirecting...");
    window.location.href = "task5-selection.html";
    return;
  }

  document
    .getElementById("surveyForm")
    .addEventListener("submit", handleSubmit);
  initPreviewModal();
});

// ── Modal ─────────────────────────────────────────────────────

function initPreviewModal() {
  const modal = document.getElementById("modePreviewModal");
  const titleEl = document.getElementById("modePreviewTitle");
  const imageEl = document.getElementById("modePreviewImage");
  const closeBtn = document.getElementById("modePreviewClose");
  const previewBtns = document.querySelectorAll(".preview-btn");

  if (!modal || !titleEl || !imageEl || !closeBtn || !previewBtns.length)
    return;

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
    lastTrigger?.focus();
  };

  previewBtns.forEach((btn) =>
    btn.addEventListener("click", () => openModal(btn)),
  );
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

// ── Score helpers ─────────────────────────────────────────────

function comparativeToScores(choice) {
  if (choice === "overload") return { A: 5, B: 1 };
  if (choice === "zen") return { A: 1, B: 5 };
  return { A: 3, B: 3 };
}

// ── Build payload ─────────────────────────────────────────────

function buildPayload(formData) {
  const allTasks = JSON.parse(sessionStorage.getItem("completedTasks") || "[]");
  const task5Tasks = allTasks.filter((t) => t.task === "task5");
  const overloadRec = task5Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA",
  );
  const zenRec = task5Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB",
  );

  const focusWinner = formData.get("q1_focus") || "same";
  const effectivenessWinner = formData.get("q3_effectiveness") || "same";

  return {
    // ── Identity & session ──────────────────────────────────
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task5",

    // ── Behavioral data (goes to Behavioral_Data sheet) ─────
    // t5_A = Overload Mode, t5_B = Zen Mode
    behavioral: {
      t5_A_timeSpent: overloadRec?.timeSpent ?? "",
      t5_B_timeSpent: zenRec?.timeSpent ?? "",
      t5_A_clicks: overloadRec?.clicks ?? "",
      t5_B_clicks: zenRec?.clicks ?? "",
      t5_A_misclicks: overloadRec?.misclicks ?? "",
      t5_B_misclicks: zenRec?.misclicks ?? "",
      // interruptionCount: how many times popups appeared and
      // broke the participant's reading focus in overload mode.
      // Always 0 in zen mode. Direct measure of distraction intensity.
      t5_A_interruptionCount: overloadRec?.interruptionCount ?? "",
      t5_B_interruptionCount: zenRec?.interruptionCount ?? "",
      // answerGiven + answerCorrect: the comprehension check.
      // This is task 5's strongest objective metric — did overload
      // mode's distractions actually impair reading comprehension
      // enough to cause wrong answers compared to zen mode?
      t5_A_answerGiven: overloadRec?.answerGiven ?? "",
      t5_B_answerGiven: zenRec?.answerGiven ?? "",
      t5_A_answerCorrect: overloadRec?.answerCorrect ?? "",
      t5_B_answerCorrect: zenRec?.answerCorrect ?? "",
    },

    // ── Survey data (goes to Survey_Responses sheet) ────────
    survey: {
      // Q1 — focus: which mode allowed better focus?
      t5_focus_winner: focusWinner,

      // Q2 — distraction rating per mode (1–5 Likert)
      // Form fields: q2_overload_distraction, q2_zen_distraction
      t5_A_distraction:
        parseInt(formData.get("q2_overload_distraction"), 10) || "",
      t5_B_distraction: parseInt(formData.get("q2_zen_distraction"), 10) || "",

      // Q3 — effectiveness: which mode felt more effective?
      t5_effectiveness_winner: effectivenessWinner,

      // Q4 — open text comment
      t5_comment: (formData.get("q4_comments") || "").trim(),
    },
  };
}

// ── Submit ────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const payload = buildPayload(formData);

  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]",
  );
  allSurveys.push(payload);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  /*
  if (typeof sendToGoogleSheets === "function") {
    await sendToGoogleSheets(payload);
  }
  */

  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task5")) {
    tasksCompleted.push("task5");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  // Clean up task-specific keys
  sessionStorage.removeItem("task5ModesCompleted");
  sessionStorage.removeItem("task5FirstMode");

  // Mark the full study as complete — used by completion.js
  // to calculate total session time and enable data download
  sessionStorage.setItem("studyComplete", "true");
  sessionStorage.setItem("studyCompletedAt", new Date().toISOString());

  setTimeout(() => {
    window.location.href = "../completion.html";
  }, 500);
}

// ── Validation shake animation ────────────────────────────────

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

const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-10px); }
    75%       { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);
