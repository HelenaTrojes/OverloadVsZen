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
    window.location.href = "./task1-selection.html";
    return;
  }
    */

  // Handle form submission
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
      src: "../assets/task1-mode-a.png",
      title: "Mode A Preview",
      alt: "Static screenshot preview of Task 1 Mode A interface",
    },
    modeB: {
      src: "../assets/task1-mode-b.png",
      title: "Mode B Preview",
      alt: "Static screenshot preview of Task 1 Mode B interface",
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
    const title = trigger.dataset.previewTitle || defaults.title || "Mode Preview";
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
    window.location.href = "../Task2/task2-selection.html";
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
