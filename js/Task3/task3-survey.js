// ============================================================
// task3-survey.js
// Task 3 — Freedom & Pressure (Plan Selection)
// Dark pattern: Confirmshaming, upsell pressure, plan change friction
//
// Survey questions:
//   Q1 (t3_freedom_winner)     — In which mode did you feel freer
//                                to choose without pressure?
//                                comparative: "overload" / "zen" / "same"
//   Q2 (t3_A_pressure /
//       t3_B_pressure)         — How much pressure did each mode
//                                make you feel? (1–5 Likert)
//                                1 = No pressure, 5 = Very pressured
//   Q3 (t3_respect_winner)     — Which mode felt more respectful
//                                of your decision?
//                                comparative: "overload" / "zen" / "same"
//   Q4 (t3_comment)            — Open text, optional
//
// Form field names (HTML):
//   q1_freedom, q2_overload_pressure, q2_zen_pressure,
//   q3_respect, q4_comments
//
// Payload sent to Google Sheets:
//   data.behavioral  → Behavioral_Data sheet
//   data.survey      → Survey_Responses sheet
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const completed = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]",
  );

  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed for task 3. Redirecting...");
    window.location.href = "task3-selection.html";
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
  const task3Tasks = allTasks.filter((t) => t.task === "task3");
  const overloadRec = task3Tasks.find(
    (t) => t.mode === "overload" || t.version === "versionA",
  );
  const zenRec = task3Tasks.find(
    (t) => t.mode === "zen" || t.version === "versionB",
  );

  const freedomWinner = formData.get("q1_freedom") || "same";
  const respectWinner = formData.get("q3_respect") || "same";

  return {
    // ── Identity & session ──────────────────────────────────
    participantId: sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry: false,
    task: "task3",

    // ── Behavioral data (goes to Behavioral_Data sheet) ─────
    // t3_A = Overload Mode, t3_B = Zen Mode
    behavioral: {
      t3_A_timeSpent: overloadRec?.timeSpent ?? "",
      t3_B_timeSpent: zenRec?.timeSpent ?? "",
      t3_A_clicks: overloadRec?.clicks ?? "",
      t3_B_clicks: zenRec?.clicks ?? "",
      t3_A_misclicks: overloadRec?.misclicks ?? "",
      t3_B_misclicks: zenRec?.misclicks ?? "",
      // planChanges: how many times the participant went back
      // to change their plan selection — comparable across both modes.
      // In overload this is driven by pressure; in zen it is genuine choice.
      t3_A_planChanges: overloadRec?.planChanges ?? "",
      t3_B_planChanges: zenRec?.planChanges ?? "",
      // confirmshamingShown: how many times the manipulative modal
      // appeared in overload mode. Always 0 in zen mode.
      t3_A_confirmShamingShown: overloadRec?.confirmshamingShown ?? "",
      t3_B_confirmShamingShown: zenRec?.confirmshamingShown ?? "",
      // finalPlan: which plan the participant ended up selecting.
      // Useful to check if overload pressure pushed people toward
      // more expensive plans compared to zen mode.
      t3_A_finalPlan: overloadRec?.finalPlan ?? "",
      t3_B_finalPlan: zenRec?.finalPlan ?? "",
    },

    // ── Survey data (goes to Survey_Responses sheet) ────────
    survey: {
      // Q1 — freedom: which mode felt freer to choose without pressure?
      t3_freedom_winner: freedomWinner,

      // Q2 — pressure rating per mode (1–5 Likert)
      // Form fields: q2_overload_pressure, q2_zen_pressure
      t3_A_pressure: parseInt(formData.get("q2_overload_pressure"), 10) || "",
      t3_B_pressure: parseInt(formData.get("q2_zen_pressure"), 10) || "",

      // Q3 — respect: which mode felt more respectful of your decision?
      t3_respect_winner: respectWinner,

      // Q4 — open text comment
      t3_comment: (formData.get("q4_comments") || "").trim(),
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
