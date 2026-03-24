// Welcome Page JavaScript - SKIP INTRO, GO DIRECTLY TO TASK 1

// Track when user starts the experience
function startExperience() {
  console.log("startExperience fired");

  // Clear old study data from previous runs
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

  const startTime = new Date().toISOString();
  const participantId = generateParticipantId();
  const order = Math.random() < 0.5 ? "overload_first" : "zen_first";

  sessionStorage.setItem("experienceStartTime", startTime);
  sessionStorage.setItem("participantId", participantId);
  sessionStorage.setItem("conditionOrder", order);

  console.log(
    "Saved startTime:",
    sessionStorage.getItem("experienceStartTime"),
  );
  console.log("Saved participantId:", sessionStorage.getItem("participantId"));
  console.log(
    "Saved conditionOrder:",
    sessionStorage.getItem("conditionOrder"),
  );

  window.location.href = "Task1/task1-selection.html";
}

// Generate a unique participant ID
function generateParticipantId() {
  return "P" + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Add smooth entrance animation when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Welcome page loaded");

  // Track page view for analytics
  logPageView("welcome");
});

// Helper function to log page views (for your thesis data collection)
function logPageView(pageName) {
  const pageData = {
    page: pageName,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId") || "unknown",
  };

  // Store in session storage
  const pageViews = JSON.parse(sessionStorage.getItem("pageViews") || "[]");
  pageViews.push(pageData);
  sessionStorage.setItem("pageViews", JSON.stringify(pageViews));

  console.log("Page view logged:", pageData);
}
