// Welcome Page JavaScript
// Automatic participant assignment from Google Apps Script

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby--KKuzcP5KYwMO83t3KOIKDxPLXhFcztMaOc2LIc_nb9d8kQh531PgLYSqnV7fDKxTg/exec";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Welcome page loaded");

  clearPreviousStudyData();
  logPageView("welcome");

  await prepareParticipantAssignment();
});

// ── Assignment ────────────────────────────────────────────────

async function prepareParticipantAssignment() {
  try {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=assignParticipant`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!data || data.status !== "success") {
      console.error("Assignment failed:", data);
      alert("Could not prepare participant assignment. Please reload the page.");
      return;
    }

    sessionStorage.setItem("participantNumber", String(data.participantNumber));
    sessionStorage.setItem("participantId", data.participantId);
    sessionStorage.setItem("counterbalanceGroup", data.counterbalanceGroup);
    sessionStorage.setItem("conditionOrder", data.conditionOrder);

    console.log("Participant assignment ready:", data);

  } catch (error) {
    console.error("Error preparing participant assignment:", error);
    alert("Could not contact the assignment service. Please reload the page.");
  }
}

// ── Start study ───────────────────────────────────────────────

function startExperience() {
  console.log("startExperience fired");

  const participantId = sessionStorage.getItem("participantId");
  const counterbalanceGroup = sessionStorage.getItem("counterbalanceGroup");

  if (!participantId || !counterbalanceGroup) {
    alert("Participant assignment is not ready yet. Please wait a moment and try again.");
    return;
  }

  const startTime = new Date().toISOString();
  sessionStorage.setItem("experienceStartTime", startTime);

  console.log("Saved startTime:", sessionStorage.getItem("experienceStartTime"));
  console.log("Saved participantNumber:", sessionStorage.getItem("participantNumber"));
  console.log("Saved participantId:", sessionStorage.getItem("participantId"));
  console.log("Saved counterbalanceGroup:", sessionStorage.getItem("counterbalanceGroup"));
  console.log("Saved conditionOrder:", sessionStorage.getItem("conditionOrder"));

  // Keep current navigation for now.
  // We will change the routing logic in the next step.
  window.location.href = "Task1/task1-selection.html";
}

// ── Helpers ───────────────────────────────────────────────────

function clearPreviousStudyData() {
  sessionStorage.removeItem("surveyResponses");
  sessionStorage.removeItem("completedTasks");
  sessionStorage.removeItem("tasksCompleted");
  sessionStorage.removeItem("modeSelections");

  sessionStorage.removeItem("task1ModesCompleted");
  sessionStorage.removeItem("task2ModesCompleted");
  sessionStorage.removeItem("task3ModesCompleted");
  sessionStorage.removeItem("task4ModesCompleted");
  sessionStorage.removeItem("task5ModesCompleted");

  sessionStorage.removeItem("task1FirstMode");
  sessionStorage.removeItem("task2FirstMode");
  sessionStorage.removeItem("task3FirstMode");
  sessionStorage.removeItem("task4FirstMode");
  sessionStorage.removeItem("task5FirstMode");

  sessionStorage.removeItem("studyComplete");
  sessionStorage.removeItem("studyCompletedAt");
  sessionStorage.removeItem("mergedDataSent");

  sessionStorage.removeItem("participantNumber");
  sessionStorage.removeItem("participantId");
  sessionStorage.removeItem("counterbalanceGroup");
  sessionStorage.removeItem("conditionOrder");
}

function logPageView(pageName) {
  const pageData = {
    page: pageName,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId") || "unknown",
  };

  const pageViews = JSON.parse(sessionStorage.getItem("pageViews") || "[]");
  pageViews.push(pageData);
  sessionStorage.setItem("pageViews", JSON.stringify(pageViews));

  console.log("Page view logged:", pageData);
}