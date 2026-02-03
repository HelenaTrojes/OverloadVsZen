// Completion Page JavaScript - Data Download & Summary

document.addEventListener("DOMContentLoaded", () => {
  console.log("Completion page loaded");

  // Check if study is actually complete
  const studyComplete = sessionStorage.getItem("studyComplete");
  if (!studyComplete) {
    console.warn("Study not marked as complete. Redirecting...");
    // Uncomment to enforce completion:
    // window.location.href = 'index.html';
  }

  // Display participant info
  displayParticipantInfo();

  // Display data summary
  displayDataSummary();
});

function displayParticipantInfo() {
  const participantId = sessionStorage.getItem("participantId") || "Unknown";
  const startTime = new Date(sessionStorage.getItem("experienceStartTime"));
  const endTime = new Date(sessionStorage.getItem("studyCompletedAt"));

  // Calculate total time
  const totalMinutes = Math.round((endTime - startTime) / 1000 / 60);

  document.getElementById("participantId").textContent = participantId;
  document.getElementById("totalTime").textContent = `${totalMinutes} minutes`;
}

function displayDataSummary() {
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const surveys = JSON.parse(sessionStorage.getItem("surveyResponses") || "[]");

  const summaryHTML = `
        <p><strong>Total Tasks:</strong> ${completedTasks.length} tasks completed</p>
        <p><strong>Total Surveys:</strong> ${surveys.length} surveys completed</p>
        <p><strong>Data Points Collected:</strong> ${completedTasks.length + surveys.length} records</p>
        <hr style="margin: 16px 0; border: 1px solid #e9ecef;">
        <p style="font-size: 0.9rem; color: rgba(0,0,0,0.6);">
            All data is stored locally in your browser. Download it now to save for analysis.
        </p>
    `;

  document.getElementById("summaryContent").innerHTML = summaryHTML;
}

// Download data as JSON
function downloadJSON() {
  const data = collectAllData();
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const participantId = sessionStorage.getItem("participantId") || "unknown";
  const filename = `study-data-${participantId}-${Date.now()}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
  console.log("JSON downloaded:", filename);
}

// Download data as CSV (Excel-compatible)
function downloadCSV() {
  const data = collectAllData();
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const participantId = sessionStorage.getItem("participantId") || "unknown";
  const filename = `study-data-${participantId}-${Date.now()}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
  console.log("CSV downloaded:", filename);
}

// Collect all data from session storage
function collectAllData() {
  return {
    participantId: sessionStorage.getItem("participantId"),
    experienceStartTime: sessionStorage.getItem("experienceStartTime"),
    studyCompletedAt: sessionStorage.getItem("studyCompletedAt"),
    completedTasks: JSON.parse(
      sessionStorage.getItem("completedTasks") || "[]",
    ),
    surveyResponses: JSON.parse(
      sessionStorage.getItem("surveyResponses") || "[]",
    ),
    versionSelections: JSON.parse(
      sessionStorage.getItem("versionSelections") || "[]",
    ),
    pageViews: JSON.parse(sessionStorage.getItem("pageViews") || "[]"),
  };
}

// Convert data to CSV format
function convertToCSV(data) {
  let csv = "";

  // Header
  csv +=
    "Participant ID,Task,Version,Completed,Time Spent (s),Clicks,Timestamp\n";

  // Task completion data
  data.completedTasks.forEach((task) => {
    csv += `${data.participantId},`;
    csv += `${task.task},`;
    csv += `${task.mode || task.version || "unknown"},`;
    csv += `${task.completed},`;
    csv += `${task.timeSpent || 0},`;
    csv += `${task.clicks || 0},`;
    csv += `${task.timestamp}\n`;
  });

  // Add empty line
  csv += "\n";

  // Survey responses header
  csv += "Participant ID,Task,Survey Question,Response,Timestamp\n";

  // Survey data
  data.surveyResponses.forEach((survey) => {
    const responses = survey.responses || {};
    Object.keys(responses).forEach((key) => {
      csv += `${data.participantId},`;
      csv += `${survey.task},`;
      csv += `${key},`;
      csv += `${responses[key]},`;
      csv += `${survey.timestamp}\n`;
    });
  });

  return csv;
}

// Optional: Send data to server (if you set up backend)
function sendDataToServer() {
  const data = collectAllData();

  // Example: POST to your server
  fetch("https://your-server.com/api/save-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Data saved to server:", result);
      alert("Data successfully saved!");
    })
    .catch((error) => {
      console.error("Error saving data:", error);
      alert("Could not save to server. Please download your data.");
    });
}
