// ============================================================
// task2-survey.js
// Task 2 — Ease of Use & Form Confidence
// Dark pattern: Fake buttons, vague errors, confusing reset
//
// Survey questions:
//   Q1 (t2_ease_winner)          — Which mode felt easier to complete?
//                                  comparative: "overload" / "zen" / "same"
//   Q2 (t2_A_submitConfidence /
//       t2_B_submitConfidence)   — How confident were you the form
//                                  submitted correctly? (1–5 Likert)
//                                  1 = Not confident, 5 = Very confident
//   Q3 (t2_frustration_winner)   — Which mode caused more frustration?
//                                  comparative: "overload" / "zen" / "same"
//   Q4 (t2_comment)              — Open text, optional
//
// Form field names (HTML):
//   q1_ease, q2_overload_confidence, q2_zen_confidence,
//   q3_frustration, q4_comments
//
// Payload sent to Google Sheets:
//   data.behavioral  → Behavioral_Data sheet
//   data.survey      → Survey_Responses sheet
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]",
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 2. Redirecting...");
    window.location.href = "task2-selection.html";
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
      src: "../assets/task2-mode-a.png",
      title: "Mode A — Overload",
      alt: "Task 2 Overload Mode screenshot",
    },
    modeB: {
      src: "../assets/task2-mode-b.png",
      title: "Mode B — Zen",
      alt: "Task 2 Zen Mode screenshot",
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
  const task2Tasks = allTasks.filter((t) => t.task === "task2");
  const overloadRec = task2Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA",
  );
  const zenRec = task2Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB",
  );

  const easeWinner = formData.get("q1_ease") || "same";
  const frustrationWinner = formData.get("q3_frustration") || "same";

  return {
    // ── Identity & session ──────────────────────────────────
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task2",

    // ── Behavioral data (goes to Behavioral_Data sheet) ─────
    // t2_A = Overload Mode, t2_B = Zen Mode
    behavioral: {
      t2_A_timeSpent: overloadRec?.timeSpent ?? "",
      t2_B_timeSpent: zenRec?.timeSpent ?? "",
      t2_A_clicks: overloadRec?.clicks ?? "",
      t2_B_clicks: zenRec?.clicks ?? "",
      t2_A_misclicks: overloadRec?.misclicks ?? "",
      t2_B_misclicks: zenRec?.misclicks ?? "",
      // Task 2 specific behavioral metrics
      // fakeButtonClicks: how many times the participant clicked
      // the fake submit button in Overload mode
      t2_A_fakeButtonClicks: overloadRec?.fakeButtonClicks ?? "",
      t2_B_fakeButtonClicks: zenRec?.fakeButtonClicks ?? "",
      // resetClicks: how many times the form was accidentally reset
      t2_A_resetClicks: overloadRec?.resetClicks ?? "",
      t2_B_resetClicks: zenRec?.resetClicks ?? "",
      // validationErrors: failed validation attempts in Zen mode
      // (useful contrast — zen shows clear errors, overload shows vague ones)
      t2_A_validationErrors: overloadRec?.validationErrors ?? "",
      t2_B_validationErrors: zenRec?.validationErrors ?? "",
    },

    // ── Survey data (goes to Survey_Responses sheet) ────────
    survey: {
      // Q1 — ease: which mode felt easier to complete the form?
      t2_ease_winner: easeWinner,

      // Q2 — submit confidence per mode (1–5 Likert)
      // Form fields: q2_overload_confidence, q2_zen_confidence
      t2_A_submitConfidence:
        parseInt(formData.get("q2_overload_confidence"), 10) || "",
      t2_B_submitConfidence:
        parseInt(formData.get("q2_zen_confidence"), 10) || "",

      // Q3 — frustration: which mode caused more frustration?
      t2_frustration_winner: frustrationWinner,

      // Q4 — open text comment
      t2_comment: (formData.get("q4_comments") || "").trim(),
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
  if (!tasksCompleted.includes("task2")) {
    tasksCompleted.push("task2");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task2ModesCompleted");
  sessionStorage.removeItem("task2FirstMode");

  setTimeout(() => {
    window.location.href = "../Task3/task3-selection.html";
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
