// Task 1 Survey JavaScript - REVISED FOR SPECIFIC MEASUREMENTS

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 1 Survey loaded");

  /*
  // Check if user actually completed both versions
  const completed = JSON.parse(
    sessionStorage.getItem("task1VersionsCompleted") || "[]",
  );
  if (!completed.includes("versionA") || !completed.includes("versionB")) {
    // Redirect back to task selection if they haven't completed both
    console.warn("Both versions not completed. Redirecting...");
    window.location.href = './task1-selection.html';
    return;
  }
    */

  // Handle form submission
  const form = document.getElementById("surveyForm");
  form.addEventListener("submit", handleSubmit);
});

function handleSubmit(e) {
  e.preventDefault();

  // Collect form data
  const formData = new FormData(e.target);

  // Get task completion data
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const task1Data = completedTasks.filter((t) => t.task === "task1");

  // Calculate average metrics from both versions
  const versionAData = task1Data.find(
    (t) => t.version === "versionA" || t.mode === "overload",
  );
  const versionBData = task1Data.find(
    (t) => t.version === "versionB" || t.mode === "zen",
  );

  const surveyData = {
    participantId: sessionStorage.getItem("participantId"),
    timestamp: new Date().toISOString(),
    task: "task1",
    version: "both",
    timeSpent: (versionAData?.timeSpent || 0) + (versionBData?.timeSpent || 0),
    clicks: (versionAData?.clicks || 0) + (versionBData?.clicks || 0),
    responses: {
      versionA_confidence: parseInt(formData.get("q1_versionA_confidence")),
      versionB_confidence: parseInt(formData.get("q1_versionB_confidence")),
      versionA_difficulty: parseInt(formData.get("q2_versionA_difficulty")),
      versionB_difficulty: parseInt(formData.get("q2_versionB_difficulty")),
      versionA_control: parseInt(formData.get("q3_versionA_control")),
      versionB_control: parseInt(formData.get("q3_versionB_control")),
      comments: formData.get("q4_comments") || "",
    },
  };

  console.log("Survey data collected:", surveyData);

  // Save to session storage (local backup)
  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]",
  );
  allSurveys.push(surveyData);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  // Send to Google Sheets (if data-sender.js is loaded)
  if (typeof sendToGoogleSheets === "function") {
    sendToGoogleSheets(surveyData).then((result) => {
      if (result.success) {
        console.log("✅ Data sent to Google Sheets");
      }
    });
  }

  // Mark Task 1 as fully complete
  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task1")) {
    tasksCompleted.push("task1");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  // Clear task1 specific data
  sessionStorage.removeItem("task1VersionsCompleted");
  sessionStorage.removeItem("task1FirstVersion");

  // Navigate to Task 2
  setTimeout(() => {
    window.location.href = './task2-selection.html';
  }, 500);
}

// Optional: Add validation feedback
document.querySelectorAll("input[required]").forEach((input) => {
  input.addEventListener("invalid", (e) => {
    e.preventDefault();
    e.target.closest(".question-block").style.animation = "shake 0.5s";
    setTimeout(() => {
      e.target.closest(".question-block").style.animation = "";
    }, 500);
  });
});

// Add shake animation to CSS if needed
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
