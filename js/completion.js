// ============================================================
// completion.js
// Study completion page — merges all 5 task payloads into one
// and sends a single row to each Google Sheet tab.
//
// Flow:
//   1. Read all 5 survey payloads from sessionStorage
//   2. Merge behavioral fields from all tasks into one object
//   3. Merge survey fields from all tasks into one object
//   4. Send one combined payload to Code.gs
//   5. Offer JSON + CSV download as local backup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Completion page loaded");

  const studyComplete = sessionStorage.getItem("studyComplete");
  if (!studyComplete) {
    console.warn("Study not marked as complete.");
  }

  displayParticipantInfo();
  displayDataSummary();

  // Send merged data to Google Sheets as soon as the
  // completion page loads — not on button click.
  // This way even if the participant closes the tab
  // immediately, the data has already been sent.
  sendMergedData();
});

// ── Send merged payload ───────────────────────────────────────

async function sendMergedData() {
  const payload = buildMergedPayload();

  if (!payload) {
    console.warn("No survey responses found in sessionStorage.");
    return;
  }

  console.log("Sending merged payload to Google Sheets...", payload);

  if (typeof sendToGoogleSheets === "function") {
    await sendToGoogleSheets(payload);
    console.log("Merged data sent.");
  }
}

// Reads all 5 task payloads from sessionStorage and merges
// their behavioral and survey fields into one flat object.
function buildMergedPayload() {
  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]"
  );

  if (allSurveys.length === 0) return null;

  // Use participantId and conditionOrder from the first payload —
  // they are the same across all 5 tasks for one participant.
  const participantId  = sessionStorage.getItem("participantId")  || "";
  const conditionOrder = sessionStorage.getItem("conditionOrder") || "";

  // Merge all behavioral and survey sub-objects from every task
  // into two flat objects. Fields don't overlap because each task
  // uses its own t[n]_ prefix.
  const mergedBehavioral = {};
  const mergedSurvey     = {};

  allSurveys.forEach(payload => {
    Object.assign(mergedBehavioral, payload.behavioral || {});
    Object.assign(mergedSurvey,     payload.survey     || {});
  });

  return {
    participantId:  participantId,
    conditionOrder: conditionOrder,
    isTestEntry:    false,
    behavioral:     mergedBehavioral,
    survey:         mergedSurvey
  };
}

// ── Display functions ─────────────────────────────────────────

function displayParticipantInfo() {
  const participantId = sessionStorage.getItem("participantId") || "Unknown";
  const startTime     = new Date(sessionStorage.getItem("experienceStartTime"));
  const endTime       = new Date(sessionStorage.getItem("studyCompletedAt"));
  const totalMinutes  = Math.round((endTime - startTime) / 1000 / 60);

  document.getElementById("participantId").textContent = participantId;
  document.getElementById("totalTime").textContent     = `${totalMinutes} minutes`;
}

function displayDataSummary() {
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]"
  );
  const surveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]"
  );

  const summaryHTML = `
    <p><strong>Tasks completed:</strong> ${completedTasks.length} mode sessions</p>
    <p><strong>Surveys submitted:</strong> ${surveys.length} of 5 tasks</p>
    <p><strong>Condition order:</strong> ${sessionStorage.getItem("conditionOrder") || "unknown"}</p>
    <hr style="margin: 16px 0; border: 1px solid #e9ecef;">
    <p style="font-size: 0.9rem; color: rgba(0,0,0,0.6);">
      Your data has been submitted. Download below as a personal backup
      before closing this tab.
    </p>
  `;

  document.getElementById("summaryContent").innerHTML = summaryHTML;
}

// ── JSON download ─────────────────────────────────────────────

function downloadJSON() {
  const payload  = buildMergedPayload();
  const blob     = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/json" }
  );
  const filename = `study-data-${payload?.participantId || "unknown"}-${Date.now()}.json`;
  triggerDownload(URL.createObjectURL(blob), filename);
  console.log("JSON downloaded:", filename);
}

// ── CSV download ──────────────────────────────────────────────
// Mirrors the two-tab Google Sheet structure.
// Section 1 = Behavioral_Data row
// Section 2 = Survey_Responses row

function downloadCSV() {
  const payload  = buildMergedPayload();
  if (!payload) { alert("No data to download."); return; }

  const b = payload.behavioral || {};
  const s = payload.survey     || {};

  let csv = "";

  // Section 1 — Behavioral
  csv += "BEHAVIORAL DATA\n";
  csv += [
    "participantId","conditionOrder",
    "t1_A_timeSpent","t1_B_timeSpent","t1_A_clicks","t1_B_clicks",
    "t1_A_misclicks","t1_B_misclicks","t1_A_distractionClicks",
    "t2_A_timeSpent","t2_B_timeSpent","t2_A_clicks","t2_B_clicks",
    "t2_A_misclicks","t2_B_misclicks","t2_A_fakeButtonClicks",
    "t2_A_resetClicks","t2_B_validationErrors",
    "t3_A_timeSpent","t3_B_timeSpent","t3_A_clicks","t3_B_clicks",
    "t3_A_misclicks","t3_B_misclicks","t3_A_planChanges","t3_B_planChanges",
    "t3_A_confirmShamingShown","t3_A_finalPlan","t3_B_finalPlan",
    "t4_A_timeSpent","t4_B_timeSpent","t4_A_clicks","t4_B_clicks",
    "t4_A_misclicks","t4_B_misclicks","t4_A_productChosen","t4_B_productChosen",
    "t4_A_priceChosen","t4_B_priceChosen",
    "t5_A_timeSpent","t5_B_timeSpent","t5_A_clicks","t5_B_clicks",
    "t5_A_misclicks","t5_B_misclicks","t5_A_interruptionCount",
    "t5_A_answerGiven","t5_B_answerGiven","t5_A_answerCorrect","t5_B_answerCorrect"
  ].join(",") + "\n";

  csv += [
    payload.participantId, payload.conditionOrder,
    b.t1_A_timeSpent, b.t1_B_timeSpent, b.t1_A_clicks, b.t1_B_clicks,
    b.t1_A_misclicks, b.t1_B_misclicks, b.t1_A_distractionClicks,
    b.t2_A_timeSpent, b.t2_B_timeSpent, b.t2_A_clicks, b.t2_B_clicks,
    b.t2_A_misclicks, b.t2_B_misclicks, b.t2_A_fakeButtonClicks,
    b.t2_A_resetClicks, b.t2_B_validationErrors,
    b.t3_A_timeSpent, b.t3_B_timeSpent, b.t3_A_clicks, b.t3_B_clicks,
    b.t3_A_misclicks, b.t3_B_misclicks, b.t3_A_planChanges, b.t3_B_planChanges,
    b.t3_A_confirmShamingShown, b.t3_A_finalPlan, b.t3_B_finalPlan,
    b.t4_A_timeSpent, b.t4_B_timeSpent, b.t4_A_clicks, b.t4_B_clicks,
    b.t4_A_misclicks, b.t4_B_misclicks, b.t4_A_productChosen, b.t4_B_productChosen,
    b.t4_A_priceChosen, b.t4_B_priceChosen,
    b.t5_A_timeSpent, b.t5_B_timeSpent, b.t5_A_clicks, b.t5_B_clicks,
    b.t5_A_misclicks, b.t5_B_misclicks, b.t5_A_interruptionCount,
    b.t5_A_answerGiven, b.t5_B_answerGiven,
    b.t5_A_answerCorrect, b.t5_B_answerCorrect
  ].map(escapeCSV).join(",") + "\n\n";

  // Section 2 — Survey
  csv += "SURVEY RESPONSES\n";
  csv += [
    "participantId","conditionOrder",
    "t1_clarity_winner","t1_A_stress","t1_B_stress","t1_control_winner","t1_comment",
    "t2_ease_winner","t2_A_submitConfidence","t2_B_submitConfidence","t2_frustration_winner","t2_comment",
    "t3_freedom_winner","t3_A_pressure","t3_B_pressure","t3_respect_winner","t3_comment",
    "t4_trust_winner","t4_A_urgency","t4_B_urgency","t4_honesty_winner","t4_comment",
    "t5_focus_winner","t5_A_distraction","t5_B_distraction","t5_effectiveness_winner","t5_comment"
  ].join(",") + "\n";

  csv += [
    payload.participantId, payload.conditionOrder,
    s.t1_clarity_winner, s.t1_A_stress, s.t1_B_stress, s.t1_control_winner, s.t1_comment,
    s.t2_ease_winner, s.t2_A_submitConfidence, s.t2_B_submitConfidence, s.t2_frustration_winner, s.t2_comment,
    s.t3_freedom_winner, s.t3_A_pressure, s.t3_B_pressure, s.t3_respect_winner, s.t3_comment,
    s.t4_trust_winner, s.t4_A_urgency, s.t4_B_urgency, s.t4_honesty_winner, s.t4_comment,
    s.t5_focus_winner, s.t5_A_distraction, s.t5_B_distraction, s.t5_effectiveness_winner, s.t5_comment
  ].map(escapeCSV).join(",") + "\n";

  const blob     = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
  const link    = document.createElement("a");
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}