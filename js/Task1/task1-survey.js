// ============================================================
// task1-survey.js
// Task 1 — Mental Clarity & Cognitive Load
// Dark pattern: Distraction (irrelevant buttons, visual noise)
//
// Survey questions:
//   Q1 (t1_clarity_winner)  — Which mode felt clearer to navigate?
//                             comparative choice: "overload" / "zen" / "same"
//   Q2 (t1_A_stress /
//       t1_B_stress)        — How stressful did each mode feel?
//                             1–5 Likert per mode (overload + zen separately)
//   Q3 (t1_control_winner)  — In which mode did you feel more in control?
//                             comparative choice: "overload" / "zen" / "same"
//   Q4 (t1_comment)         — Open text, optional
//
// Payload sent to Google Sheets:
//   data.behavioral  → Behavioral_Data sheet
//   data.survey      → Survey_Responses sheet
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

  document.getElementById("surveyForm").addEventListener("submit", handleSubmit);
  initPreviewModal();
});

// ── Modal ─────────────────────────────────────────────────────

function initPreviewModal() {
  const modal       = document.getElementById("modePreviewModal");
  const titleEl     = document.getElementById("modePreviewTitle");
  const imageEl     = document.getElementById("modePreviewImage");
  const closeBtn    = document.getElementById("modePreviewClose");
  const previewBtns = document.querySelectorAll(".preview-btn");

  if (!modal || !titleEl || !imageEl || !closeBtn || !previewBtns.length) return;

  const defaults = {
    modeA: { src: "../assets/task1-mode-a.png", title: "Mode A — Overload", alt: "Task 1 Overload Mode screenshot" },
    modeB: { src: "../assets/task1-mode-b.png", title: "Mode B — Zen",      alt: "Task 1 Zen Mode screenshot" }
  };

  let lastTrigger = null;

  const openModal = (btn) => {
    const d     = defaults[btn.dataset.previewMode] || {};
    titleEl.textContent = btn.dataset.previewTitle || d.title || "Preview";
    imageEl.src         = btn.dataset.previewSrc   || d.src   || "";
    imageEl.alt         = btn.dataset.previewAlt   || d.alt   || "";
    lastTrigger         = btn;
    modal.hidden        = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    lastTrigger?.focus();
  };

  previewBtns.forEach(btn => btn.addEventListener("click", () => openModal(btn)));
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
}

// ── Score helpers ─────────────────────────────────────────────

// Converts a comparative choice ("overload" / "zen" / "same")
// into numeric scores for version A (Overload) and version B (Zen).
// Used so the _winner label stays readable in the sheet while
// the numeric form is available if needed for analysis.
function comparativeToScores(choice) {
  if (choice === "overload") return { A: 5, B: 1 };
  if (choice === "zen")      return { A: 1, B: 5 };
  return                            { A: 3, B: 3 };
}

// ── Build payload ─────────────────────────────────────────────

function buildPayload(formData) {
  // Pull both mode records from sessionStorage separately —
  // never combine them, because we need per-mode timing and clicks.
  const allTasks    = JSON.parse(sessionStorage.getItem("completedTasks") || "[]");
  const task1Tasks  = allTasks.filter(t => t.task === "task1");
  const overloadRec = task1Tasks.find(t => t.mode === "overload" || t.version === "versionA");
  const zenRec      = task1Tasks.find(t => t.mode === "zen"      || t.version === "versionB");

  // Survey answers
  const clarityWinner = formData.get("q1_clarity")  || "same";
  const controlWinner = formData.get("q3_control")  || "same";

  return {
    // ── Identity & session ──────────────────────────────────
    participantId:  sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry:    false,
    task:           "task1",

    // ── Behavioral data (goes to Behavioral_Data sheet) ─────
    // All timing and click metrics split by mode.
    // t1_A = Overload, t1_B = Zen — consistent with Code.gs.
    behavioral: {
      t1_A_timeSpent:         overloadRec?.timeSpent         ?? "",
      t1_B_timeSpent:         zenRec?.timeSpent              ?? "",
      t1_A_clicks:            overloadRec?.clicks            ?? "",
      t1_B_clicks:            zenRec?.clicks                 ?? "",
      t1_A_misclicks:         overloadRec?.misclicks         ?? "",
      t1_B_misclicks:         zenRec?.misclicks              ?? "",
      // Task 1 specific: how many times did the participant click distraction elements in Overload mode?
      t1_A_distractionClicks: overloadRec?.distractionClicks ?? "",
      t1_B_distractionClicks: zenRec?.distractionClicks      ?? ""
    },

    // ── Survey data (goes to Survey_Responses sheet) ────────
    survey: {
      // Q1 — clarity: which mode felt clearer?
      t1_clarity_winner: clarityWinner,

      // Q2 — stress rating per mode (1–5 Likert)
      // Form fields: q2_overload_feeling, q2_zen_feeling
      t1_A_stress: parseInt(formData.get("q2_overload_feeling"), 10) || "",
      t1_B_stress: parseInt(formData.get("q2_zen_feeling"),      10) || "",

      // Q3 — control: which mode gave more sense of control?
      t1_control_winner: controlWinner,

      // Q4 — open text comment (clean, no raw dumps)
      t1_comment: (formData.get("q4_comments") || "").trim()
    }
  };
}

// ── Submit ────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const payload  = buildPayload(formData);

  // Save to sessionStorage so the completion page can
  // offer a local JSON download as backup.
  const allSurveys = JSON.parse(sessionStorage.getItem("surveyResponses") || "[]");
  allSurveys.push(payload);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  // Send to Google Sheets (no-cors, fire and forget).
  // Failure is handled inside sendToGoogleSheets via local backup.
  //if (typeof sendToGoogleSheets === "function") {
  //  await sendToGoogleSheets(payload);
  //}

  // Mark task 1 as complete
  const tasksCompleted = JSON.parse(sessionStorage.getItem("tasksCompleted") || "[]");
  if (!tasksCompleted.includes("task1")) {
    tasksCompleted.push("task1");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  // Clean up task-specific sessionStorage keys
  sessionStorage.removeItem("task1ModesCompleted");
  sessionStorage.removeItem("task1FirstMode");

  setTimeout(() => {
    window.location.href = "../Task2/task2-selection.html";
  }, 500);
}

// ── Validation shake animation ────────────────────────────────

document.querySelectorAll("input[required]").forEach(input => {
  input.addEventListener("invalid", e => {
    e.preventDefault();
    const block = e.target.closest(".question-block");
    if (!block) return;
    block.style.animation = "shake 0.5s";
    setTimeout(() => { block.style.animation = ""; }, 500);
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