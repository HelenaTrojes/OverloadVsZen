// Task 3 Survey JavaScript

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 3 Survey loaded");

  // Verify both modes completed
  const completed = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]",
  );
  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed. Redirecting...");
    window.location.href = "task3-selection.html";
    return;
  }

  const form = document.getElementById("surveyForm");
  form.addEventListener("submit", handleSubmit);
});

function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  // Get task completion data
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const task3Data = completedTasks.filter((t) => t.task === "task3");

  const versionAData = task3Data.find(
    (t) => t.version === "versionA" || t.mode === "overload",
  );
  const versionBData = task3Data.find(
    (t) => t.version === "versionB" || t.mode === "zen",
  );

  const surveyData = {
    participantId: sessionStorage.getItem("participantId"),
    timestamp: new Date().toISOString(),
    task: "task3",
    version: "both",
    timeSpent: (versionAData?.timeSpent || 0) + (versionBData?.timeSpent || 0),
    clicks: (versionAData?.clicks || 0) + (versionBData?.clicks || 0),
    responses: {
      versionA_confidence: parseInt(
        formData.get("q1_versionA_confidence") ||
          formData.get("q2_overload_pressure") ||
          3,
      ),
      versionB_confidence: parseInt(
        formData.get("q1_versionB_confidence") ||
          formData.get("q2_zen_pressure") ||
          3,
      ),
      versionA_difficulty: parseInt(
        formData.get("q2_versionA_difficulty") || 3,
      ),
      versionB_difficulty: parseInt(
        formData.get("q2_versionB_difficulty") || 3,
      ),
      versionA_control: parseInt(formData.get("q3_versionA_control") || 3),
      versionB_control: parseInt(formData.get("q3_versionB_control") || 3),
      comments: formData.get("q4_comments") || "",
    },
  };

  console.log("Task 3 Survey data:", surveyData);

  // Save to session storage
  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]",
  );
  allSurveys.push(surveyData);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  // Send to Google Sheets
  if (typeof sendToGoogleSheets === "function") {
    sendToGoogleSheets(surveyData).then((result) => {
      if (result.success) {
        console.log("✅ Task 3 data sent to Google Sheets");
      }
    });
  }

  // Mark Task 3 complete
  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task3")) {
    tasksCompleted.push("task3");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task3VersionsCompleted");
  sessionStorage.removeItem("task3FirstVersion");

  // Navigate to Task 4
  setTimeout(() => {
    window.location.href = "../Task4/task4-selection.html";
  }, 500);
}

// Add validation shake
document.querySelectorAll("input[required]").forEach((input) => {
  input.addEventListener("invalid", (e) => {
    e.preventDefault();
    e.target.closest(".question-block").style.animation = "shake 0.5s";
    setTimeout(() => {
      e.target.closest(".question-block").style.animation = "";
    }, 500);
  });
});

const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
