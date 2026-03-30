// Welcome Page JavaScript
// Automatic participant assignment from Google Apps Script

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby--KKuzcP5KYwMO83t3KOIKDxPLXhFcztMaOc2LIc_nb9d8kQh531PgLYSqnV7fDKxTg/exec";

let assignmentReady = false;

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Welcome page loaded");

  clearPreviousStudyData();
  logPageView("welcome");
  prepareWelcomeUI();

  await prepareParticipantAssignment();
});

// ── UI setup ──────────────────────────────────────────────────

function prepareWelcomeUI() {
  const button = document.querySelector(".cta-button");

  if (button) {
    button.disabled = true;
    button.style.opacity = "0.7";
    button.style.cursor = "not-allowed";
  }

  showAssignmentStatus("Preparing your experience...");
}

function showAssignmentStatus(message, isError = false) {
  let statusEl = document.getElementById("assignmentStatus");

  if (!statusEl) {
    statusEl = document.createElement("p");
    statusEl.id = "assignmentStatus";
    statusEl.style.marginTop = "16px";
    statusEl.style.fontSize = "0.95rem";
    statusEl.style.opacity = "0.85";

    const infoContent = document.querySelector(".info-content");
    const button = document.querySelector(".cta-button");

    if (infoContent && button) {
      infoContent.insertBefore(statusEl, button);
    } else if (infoContent) {
      infoContent.appendChild(statusEl);
    }
  }

  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b02a37" : "";
}

function enableStartButton() {
  const button = document.querySelector(".cta-button");

  if (button) {
    button.disabled = false;
    button.style.opacity = "1";
    button.style.cursor = "pointer";
  }
}

// ── Assignment ────────────────────────────────────────────────

async function prepareParticipantAssignment() {
  try {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=assignParticipant`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log("Assignment response:", data);

    if (!data || data.status !== "success") {
      console.error("Assignment failed:", data);
      showAssignmentStatus(
        "Could not prepare the study session. Please reload the page.",
        true,
      );
      return;
    }

    sessionStorage.setItem("participantNumber", String(data.participantNumber));
    sessionStorage.setItem("participantId", data.participantId);
    sessionStorage.setItem("counterbalanceGroup", data.counterbalanceGroup);
    sessionStorage.setItem("conditionOrder", data.conditionOrder);

    assignmentReady = true;

    console.log("Participant assignment ready:", data);
    showAssignmentStatus("Your experience is ready.");
    enableStartButton();
  } catch (error) {
    console.error("Error preparing participant assignment:", error);
    showAssignmentStatus(
      "Could not prepare the study session. Please reload the page.",
      true,
    );
  }
}

// ── Start study ───────────────────────────────────────────────

async function startExperience() {
  console.log("startExperience fired");

  let participantId = sessionStorage.getItem("participantId");
  let counterbalanceGroup = sessionStorage.getItem("counterbalanceGroup");

  // If not ready → wait for assignment
  if (!participantId || !counterbalanceGroup) {
    console.log("Assignment not ready, waiting...");

    try {
      const response = await fetch(
        `${APPS_SCRIPT_URL}?action=assignParticipant`,
      );
      const data = await response.json();

      if (data && data.status === "success") {
        sessionStorage.setItem(
          "participantNumber",
          String(data.participantNumber),
        );
        sessionStorage.setItem("participantId", data.participantId);
        sessionStorage.setItem("counterbalanceGroup", data.counterbalanceGroup);
        sessionStorage.setItem("conditionOrder", data.conditionOrder);

        participantId = data.participantId;
        counterbalanceGroup = data.counterbalanceGroup;

        console.log("Assignment completed on click:", data);
      } else {
        alert("Could not start the study. Please refresh.");
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Connection error. Please refresh.");
      return;
    }
  }

  const startTime = new Date().toISOString();
  sessionStorage.setItem("experienceStartTime", startTime);

  console.log("Starting with:", participantId, counterbalanceGroup);

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
