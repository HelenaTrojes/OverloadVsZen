// ============================================================
// completion.js
// Study completion page — merges all 5 task payloads into one
// and sends a single row to each Google Sheet tab.
//
// FINAL VERSION
// - Reads all task survey payloads from sessionStorage
// - Merges behavioral + survey fields into one flat payload
// - Sends one combined payload to Code.gs
// - Offers JSON + CSV download as local backup
// - Prevents accidental duplicate send in the same session
//
// Expected output:
// {
//   participantId: string,
//   conditionOrder: string,
//   isTestEntry: false,
//   task: "all_tasks",
//   behavioral: { ... },
//   survey: { ... }
// }
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Completion page loaded");

  const studyComplete = sessionStorage.getItem("studyComplete");
  if (!studyComplete) {
    console.warn("Study not marked as complete.");
  }

  displayParticipantInfo();
  displayDataSummary();
  sendMergedData();
});

// ── Send merged payload ───────────────────────────────────────

async function sendMergedData() {
  const payload = buildMergedPayload();

  if (!payload) {
    console.warn("No survey responses found in sessionStorage.");
    return;
  }

  const alreadySent = sessionStorage.getItem("mergedDataSent");
  if (alreadySent === "true") {
    console.log("Merged data already sent in this session. Skipping resend.");
    return;
  }

  console.log("Merged payload about to send:");
  console.log(JSON.stringify(payload, null, 2));

  if (typeof sendToGoogleSheets !== "function") {
    console.error("sendToGoogleSheets is not defined.");
    return;
  }

  try {
    const result = await sendToGoogleSheets(payload);
    console.log("Merged data sent.", result);

    // Mark as sent only after successful request
    sessionStorage.setItem("mergedDataSent", "true");

    const summaryBox = document.getElementById("summaryContent");
    if (summaryBox) {
      summaryBox.insertAdjacentHTML(
        "beforeend",
        `
        <p style="margin-top: 12px; color: #198754; font-size: 0.95rem;">
          <strong>Status:</strong> Data successfully submitted.
        </p>
        `,
      );
    }
  } catch (error) {
    console.error("Failed to send merged data:", error);

    const summaryBox = document.getElementById("summaryContent");
    if (summaryBox) {
      summaryBox.insertAdjacentHTML(
        "beforeend",
        `
        <p style="margin-top: 12px; color: #b02a37; font-size: 0.95rem;">
          <strong>Status:</strong> Submission failed. Please download your backup file before closing this tab.
        </p>
        `,
      );
    }
  }
}

// ── Build merged payload ──────────────────────────────────────

function buildMergedPayload() {
  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]",
  );

  if (!Array.isArray(allSurveys) || allSurveys.length === 0) {
    return null;
  }

  const first = allSurveys[0] || {};

  const participantId =
    sessionStorage.getItem("participantId") || first.participantId || "";

  const conditionOrder =
    sessionStorage.getItem("conditionOrder") || first.conditionOrder || "";

  const mergedBehavioral = {};
  const mergedSurvey = {};

  allSurveys.forEach((payload) => {
    Object.assign(mergedBehavioral, payload.behavioral || {});
    Object.assign(mergedSurvey, payload.survey || {});
  });

  return {
    participantId,
    conditionOrder,
    isTestEntry: false,
    task: "all_tasks",
    behavioral: mergedBehavioral,
    survey: mergedSurvey,
  };
}

// ── Display functions ─────────────────────────────────────────

function displayParticipantInfo() {
  const participantId = sessionStorage.getItem("participantId") || "Unknown";

  const startRaw = sessionStorage.getItem("experienceStartTime");
  const endRaw = sessionStorage.getItem("studyCompletedAt");

  const startTime = startRaw ? new Date(startRaw) : null;
  const endTime = endRaw ? new Date(endRaw) : null;

  let totalMinutes = "Unknown";
  if (
    startTime instanceof Date &&
    !isNaN(startTime) &&
    endTime instanceof Date &&
    !isNaN(endTime)
  ) {
    totalMinutes = Math.max(
      0,
      Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60),
    );
  }

  const participantEl = document.getElementById("participantId");
  const totalTimeEl = document.getElementById("totalTime");

  if (participantEl) participantEl.textContent = participantId;
  if (totalTimeEl) {
    totalTimeEl.textContent =
      totalMinutes === "Unknown" ? "Unknown" : `${totalMinutes} minutes`;
  }
}

function displayDataSummary() {
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const surveys = JSON.parse(sessionStorage.getItem("surveyResponses") || "[]");
  const conditionOrder =
    sessionStorage.getItem("conditionOrder") || "unknown";

  const summaryHTML = `
    <p><strong>Tasks completed:</strong> ${Array.isArray(completedTasks) ? completedTasks.length : 0} mode sessions</p>
    <p><strong>Surveys submitted:</strong> ${Array.isArray(surveys) ? surveys.length : 0} of 5 tasks</p>
    <p><strong>Condition order:</strong> ${conditionOrder}</p>
    <hr style="margin: 16px 0; border: 1px solid #e9ecef;">
    <p style="font-size: 0.9rem; color: rgba(0,0,0,0.6);">
      Your data is being submitted automatically. Please download a backup before closing this tab.
    </p>
  `;

  const summaryContent = document.getElementById("summaryContent");
  if (summaryContent) {
    summaryContent.innerHTML = summaryHTML;
  }
}

// ── JSON download ─────────────────────────────────────────────

function downloadJSON() {
  const payload = buildMergedPayload();

  if (!payload) {
    alert("No data to download.");
    return;
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const filename = `study-data-${payload.participantId || "unknown"}-${Date.now()}.json`;
  triggerDownload(URL.createObjectURL(blob), filename);
  console.log("JSON downloaded:", filename);
}

// ── CSV download ──────────────────────────────────────────────
// Mirrors the two-tab Google Sheet structure exactly.
// Section 1 = Behavioral_Data row
// Section 2 = Survey_Responses row

function downloadCSV() {
  const payload = buildMergedPayload();
  if (!payload) {
    alert("No data to download.");
    return;
  }

  const b = payload.behavioral || {};
  const s = payload.survey || {};

  let csv = "";

  // ── Section 1: Behavioral_Data ────────────────────────────
  csv += "BEHAVIORAL DATA\n";
  csv +=
    [
      "participantId",
      "conditionOrder",

      // T1
      "t1_A_timeSpent",
      "t1_B_timeSpent",
      "t1_A_firstClickTime",
      "t1_B_firstClickTime",
      "t1_A_misclicks",
      "t1_B_misclicks",
      "t1_A_deceptionClicks",

      // T2
      "t2_A_timeSpent",
      "t2_B_timeSpent",
      "t2_A_firstClickTime",
      "t2_B_firstClickTime",
      "t2_A_misclicks",
      "t2_B_misclicks",
      "t2_A_fakeButtonClicks",
      "t2_A_resetClicks",
      "t2_B_resetClicks",
      "t2_A_validationErrors",
      "t2_B_validationErrors",

      // T3
      "t3_A_timeSpent",
      "t3_B_timeSpent",
      "t3_A_firstClickTime",
      "t3_B_firstClickTime",
      "t3_A_misclicks",
      "t3_B_misclicks",
      "t3_A_planChanges",
      "t3_B_planChanges",
      "t3_A_confirmShamingShown",
      "t3_A_finalPlan",
      "t3_B_finalPlan",

      // T4
      "t4_A_timeSpent",
      "t4_B_timeSpent",
      "t4_A_firstClickTime",
      "t4_B_firstClickTime",
      "t4_A_misclicks",
      "t4_B_misclicks",
      "t4_A_productChosen",
      "t4_B_productChosen",
      "t4_A_priceChosen",
      "t4_B_priceChosen",

      // T5
      "t5_A_timeSpent",
      "t5_B_timeSpent",
      "t5_A_firstClickTime",
      "t5_B_firstClickTime",
      "t5_A_misclicks",
      "t5_B_misclicks",
      "t5_A_interruptionCount",
      "t5_B_interruptionCount",
      "t5_A_answerCorrect",
      "t5_B_answerCorrect",
    ].join(",") + "\n";

  csv +=
    [
      payload.participantId,
      payload.conditionOrder,

      b.t1_A_timeSpent,
      b.t1_B_timeSpent,
      b.t1_A_firstClickTime,
      b.t1_B_firstClickTime,
      b.t1_A_misclicks,
      b.t1_B_misclicks,
      b.t1_A_deceptionClicks,

      b.t2_A_timeSpent,
      b.t2_B_timeSpent,
      b.t2_A_firstClickTime,
      b.t2_B_firstClickTime,
      b.t2_A_misclicks,
      b.t2_B_misclicks,
      b.t2_A_fakeButtonClicks,
      b.t2_A_resetClicks,
      b.t2_B_resetClicks,
      b.t2_A_validationErrors,
      b.t2_B_validationErrors,

      b.t3_A_timeSpent,
      b.t3_B_timeSpent,
      b.t3_A_firstClickTime,
      b.t3_B_firstClickTime,
      b.t3_A_misclicks,
      b.t3_B_misclicks,
      b.t3_A_planChanges,
      b.t3_B_planChanges,
      b.t3_A_confirmShamingShown,
      b.t3_A_finalPlan,
      b.t3_B_finalPlan,

      b.t4_A_timeSpent,
      b.t4_B_timeSpent,
      b.t4_A_firstClickTime,
      b.t4_B_firstClickTime,
      b.t4_A_misclicks,
      b.t4_B_misclicks,
      b.t4_A_productChosen,
      b.t4_B_productChosen,
      b.t4_A_priceChosen,
      b.t4_B_priceChosen,

      b.t5_A_timeSpent,
      b.t5_B_timeSpent,
      b.t5_A_firstClickTime,
      b.t5_B_firstClickTime,
      b.t5_A_misclicks,
      b.t5_B_misclicks,
      b.t5_A_interruptionCount,
      b.t5_B_interruptionCount,
      b.t5_A_answerCorrect,
      b.t5_B_answerCorrect,
    ]
      .map(escapeCSV)
      .join(",") + "\n\n";

  // ── Section 2: Survey_Responses ───────────────────────────
  csv += "SURVEY RESPONSES\n";
  csv +=
    [
      "participantId",
      "conditionOrder",

      "t1_clarity_winner",
      "t1_A_stress",
      "t1_B_stress",
      "t1_control_winner",
      "t1_comment",

      "t2_ease_winner",
      "t2_A_submitConfidence",
      "t2_B_submitConfidence",
      "t2_frustration_winner",
      "t2_comment",

      "t3_freedom_winner",
      "t3_A_pressure",
      "t3_B_pressure",
      "t3_respect_winner",
      "t3_comment",

      "t4_trust_winner",
      "t4_A_urgency",
      "t4_B_urgency",
      "t4_honesty_winner",
      "t4_comment",

      "t5_focus_winner",
      "t5_A_distraction",
      "t5_B_distraction",
      "t5_effectiveness_winner",
      "t5_comment",
    ].join(",") + "\n";

  csv +=
    [
      payload.participantId,
      payload.conditionOrder,

      s.t1_clarity_winner,
      s.t1_A_stress,
      s.t1_B_stress,
      s.t1_control_winner,
      s.t1_comment,

      s.t2_ease_winner,
      s.t2_A_submitConfidence,
      s.t2_B_submitConfidence,
      s.t2_frustration_winner,
      s.t2_comment,

      s.t3_freedom_winner,
      s.t3_A_pressure,
      s.t3_B_pressure,
      s.t3_respect_winner,
      s.t3_comment,

      s.t4_trust_winner,
      s.t4_A_urgency,
      s.t4_B_urgency,
      s.t4_honesty_winner,
      s.t4_comment,

      s.t5_focus_winner,
      s.t5_A_distraction,
      s.t5_B_distraction,
      s.t5_effectiveness_winner,
      s.t5_comment,
    ]
      .map(escapeCSV)
      .join(",") + "\n";

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const filename = `study-data-${payload.participantId || "unknown"}-${Date.now()}.csv`;
  triggerDownload(URL.createObjectURL(blob), filename);
  console.log("CSV downloaded:", filename);
}

// ── Helpers ───────────────────────────────────────────────────

function escapeCSV(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}