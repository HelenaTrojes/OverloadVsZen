// ============================================================
// task4-survey.js
// Task 4 — Trust & Transparency (Product Purchase)
// Dark pattern: Fake countdown timer, fake viewer count,
//               fake stock alerts, false urgency
//
// Survey questions:
//   Q1 (t4_trust_winner)       — Which mode felt more trustworthy?
//                                comparative: "overload" / "zen" / "same"
//   Q2 (t4_A_urgency /
//       t4_B_urgency)          — How much urgency or time pressure
//                                did each mode make you feel? (1–5 Likert)
//                                1 = No pressure, 5 = Very pressured
//   Q3 (t4_honesty_winner)     — Which mode felt more honest about
//                                the product and its availability?
//                                comparative: "overload" / "zen" / "same"
//   Q4 (t4_comment)            — Open text, optional
//
// Form field names (HTML):
//   q1_trust, q2_overload_urgency, q2_zen_urgency,
//   q3_honesty, q4_comments
//
// Payload sent to Google Sheets:
//   data.behavioral  → Behavioral_Data sheet
//   data.survey      → Survey_Responses sheet
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
    modeA: { src: "../assets/task4-mode-a.png", title: "Mode A — Overload", alt: "Task 4 Overload Mode screenshot" },
    modeB: { src: "../assets/task4-mode-b.png", title: "Mode B — Zen",      alt: "Task 4 Zen Mode screenshot" }
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

function comparativeToScores(choice) {
  if (choice === "overload") return { A: 5, B: 1 };
  if (choice === "zen")      return { A: 1, B: 5 };
  return                            { A: 3, B: 3 };
}

// ── Build payload ─────────────────────────────────────────────

function buildPayload(formData) {
  const allTasks    = JSON.parse(sessionStorage.getItem("completedTasks") || "[]");
  const task4Tasks  = allTasks.filter(t => t.task === "task4");
  const overloadRec = task4Tasks.find(t => t.mode === "overload" || t.version === "versionA");
  const zenRec      = task4Tasks.find(t => t.mode === "zen"      || t.version === "versionB");

  const trustWinner   = formData.get("q1_trust")   || "same";
  const honestyWinner = formData.get("q3_honesty") || "same";

  return {
    // ── Identity & session ──────────────────────────────────
    participantId:  sessionStorage.getItem("participantId") || "",
    conditionOrder: sessionStorage.getItem("conditionOrder") || "",
    isTestEntry:    false,
    task:           "task4",

    // ── Behavioral data (goes to Behavioral_Data sheet) ─────
    // t4_A = Overload Mode, t4_B = Zen Mode
    behavioral: {
      t4_A_timeSpent:     overloadRec?.timeSpent    ?? "",
      t4_B_timeSpent:     zenRec?.timeSpent         ?? "",
      t4_A_clicks:        overloadRec?.clicks       ?? "",
      t4_B_clicks:        zenRec?.clicks            ?? "",
      t4_A_misclicks:     overloadRec?.misclicks    ?? "",
      t4_B_misclicks:     zenRec?.misclicks         ?? "",
      // productChosen and priceChosen are the key outcome metrics
      // for task 4. Comparing these across modes shows whether
      // false urgency pressure influenced purchase decisions —
      // e.g. did overload mode push participants toward pricier
      // or impulse choices compared to zen mode?
      t4_A_productChosen: overloadRec?.productChosen ?? "",
      t4_B_productChosen: zenRec?.productChosen      ?? "",
      t4_A_priceChosen:   overloadRec?.priceChosen   ?? "",
      t4_B_priceChosen:   zenRec?.priceChosen        ?? ""
    },

    // ── Survey data (goes to Survey_Responses sheet) ────────
    survey: {
      // Q1 — trust: which mode felt more trustworthy?
      t4_trust_winner: trustWinner,

      // Q2 — urgency rating per mode (1–5 Likert)
      // Form fields: q2_overload_urgency, q2_zen_urgency
      t4_A_urgency: parseInt(formData.get("q2_overload_urgency"), 10) || "",
      t4_B_urgency: parseInt(formData.get("q2_zen_urgency"),      10) || "",

      // Q3 — honesty: which mode felt more honest?
      t4_honesty_winner: honestyWinner,

      // Q4 — open text comment
      t4_comment: (formData.get("q4_comments") || "").trim()
    }
  };
}

// ── Submit ────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const payload  = buildPayload(formData);

  const allSurveys = JSON.parse(sessionStorage.getItem("surveyResponses") || "[]");
  allSurveys.push(payload);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  /*
  if (typeof sendToGoogleSheets === "function") {
    await sendToGoogleSheets(payload);
  }
    */

  const tasksCompleted = JSON.parse(sessionStorage.getItem("tasksCompleted") || "[]");
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