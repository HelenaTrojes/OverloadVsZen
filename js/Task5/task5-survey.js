// Task 5 Survey JavaScript - FINAL TASK!

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 5 Survey (FINAL) loaded");

  // Verify both modes completed
  const completed = JSON.parse(
    sessionStorage.getItem("task5ModesCompleted") || "[]",
  );
  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed. Redirecting...");
    window.location.href = "task5-selection.html";
    return;
  }

  const form = document.getElementById("surveyForm");
  form.addEventListener("submit", handleSubmit);

  initializeModePreviewModal();
});

function initializeModePreviewModal() {
  const previewButtons = document.querySelectorAll(".preview-btn");
  const previewModal = document.getElementById("modePreviewModal");
  const previewTitle = document.getElementById("modePreviewTitle");
  const previewImage = document.getElementById("modePreviewImage");
  const closeButton = document.getElementById("modePreviewClose");

  if (
    !previewButtons.length ||
    !previewModal ||
    !previewTitle ||
    !previewImage ||
    !closeButton
  ) {
    return;
  }

  const previewImages = {
    modeA: {
      src: "../assets/task5-mode-a.png",
      title: "Mode A Preview",
      alt: "Static screenshot preview of Task 5 Mode A interface",
    },
    modeB: {
      src: "../assets/task5-mode-b.png",
      title: "Mode B Preview",
      alt: "Static screenshot preview of Task 5 Mode B interface",
    },
  };

  let lastTrigger = null;

  const closeModal = () => {
    previewModal.hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) {
      lastTrigger.focus();
    }
  };

  const openModal = (trigger) => {
    const mode = trigger.dataset.previewMode;
    const defaults = previewImages[mode] || {};
    const src = trigger.dataset.previewSrc || defaults.src || "";
    const title =
      trigger.dataset.previewTitle || defaults.title || "Mode Preview";
    const alt = trigger.dataset.previewAlt || defaults.alt || "Mode preview";

    previewTitle.textContent = title;
    previewImage.src = src;
    previewImage.alt = alt;
    lastTrigger = trigger;

    previewModal.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  };

  previewButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  closeButton.addEventListener("click", closeModal);

  previewModal.addEventListener("click", (event) => {
    if (event.target === previewModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !previewModal.hidden) {
      closeModal();
    }
  });
}

function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  // Get task completion data
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const task5Data = completedTasks.filter((t) => t.task === "task5");

  const versionAData = task5Data.find(
    (t) => t.version === "versionA" || t.mode === "overload",
  );
  const versionBData = task5Data.find(
    (t) => t.version === "versionB" || t.mode === "zen",
  );

  const surveyData = {
    participantId: sessionStorage.getItem("participantId"),
    timestamp: new Date().toISOString(),
    task: "task5",
    version: "both",
    timeSpent: (versionAData?.timeSpent || 0) + (versionBData?.timeSpent || 0),
    clicks: (versionAData?.clicks || 0) + (versionBData?.clicks || 0),
    responses: {
      versionA_confidence: parseInt(
        formData.get("q1_versionA_confidence") ||
          formData.get("q2_overload_distraction") ||
          3,
      ),
      versionB_confidence: parseInt(
        formData.get("q1_versionB_confidence") ||
          formData.get("q2_zen_distraction") ||
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

  console.log("Task 5 Survey data (FINAL):", surveyData);

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
        console.log("✅ Task 5 data sent to Google Sheets");
      }
    });
  }

  // Mark Task 5 complete
  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task5")) {
    tasksCompleted.push("task5");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task5VersionsCompleted");
  sessionStorage.removeItem("task5FirstVersion");

  // Mark study as complete
  sessionStorage.setItem("studyComplete", "true");
  sessionStorage.setItem("studyCompletedAt", new Date().toISOString());

  // Navigate to completion page
  setTimeout(() => {
    window.location.href = "../completion.html";
  }, 500);
}

function showDataSummary() {
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const surveys = JSON.parse(sessionStorage.getItem("surveyResponses") || "[]");
  const participantId = sessionStorage.getItem("participantId");

  console.log("\n=== FINAL DATA SUMMARY ===");
  console.log("Participant ID:", participantId);
  console.log("Tasks Completed:", completedTasks.length);
  console.log("Surveys Completed:", surveys.length);
  console.log("\nAll Data:");
  console.log("Completed Tasks:", completedTasks);
  console.log("Survey Responses:", surveys);

  // You can add a download button here later
  alert(
    `Data Collection Complete!\n\nParticipant ID: ${participantId}\nTasks: ${completedTasks.length}\nSurveys: ${surveys.length}\n\nCheck console for full data.`,
  );
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
