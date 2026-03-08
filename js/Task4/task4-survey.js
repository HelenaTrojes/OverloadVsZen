// Task 4 Survey JavaScript

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 4 Survey loaded");

  // Verify both modes completed
  const completed = JSON.parse(
    sessionStorage.getItem("task4ModesCompleted") || "[]",
  );
  if (!completed.includes("overload") || !completed.includes("zen")) {
    console.warn("Both modes not completed. Redirecting...");
    window.location.href = "task4-selection.html";
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
      src: "../assets/task4-mode-a.png",
      title: "Mode A Preview",
      alt: "Static screenshot preview of Task 4 Mode A interface",
    },
    modeB: {
      src: "../assets/task4-mode-b.png",
      title: "Mode B Preview",
      alt: "Static screenshot preview of Task 4 Mode B interface",
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
  const task4Data = completedTasks.filter((t) => t.task === "task4");

  const versionAData = task4Data.find(
    (t) => t.version === "versionA" || t.mode === "overload",
  );
  const versionBData = task4Data.find(
    (t) => t.version === "versionB" || t.mode === "zen",
  );

  const surveyData = {
    participantId: sessionStorage.getItem("participantId"),
    timestamp: new Date().toISOString(),
    task: "task4",
    version: "both",
    timeSpent: (versionAData?.timeSpent || 0) + (versionBData?.timeSpent || 0),
    clicks: (versionAData?.clicks || 0) + (versionBData?.clicks || 0),
    responses: {
      versionA_confidence: parseInt(
        formData.get("q1_versionA_confidence") ||
          formData.get("q2_overload_urgency") ||
          3,
      ),
      versionB_confidence: parseInt(
        formData.get("q1_versionB_confidence") ||
          formData.get("q2_zen_urgency") ||
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

  console.log("Task 4 Survey data:", surveyData);

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
        console.log("✅ Task 4 data sent to Google Sheets");
      }
    });
  }

  // Mark Task 4 complete
  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task4")) {
    tasksCompleted.push("task4");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task4VersionsCompleted");
  sessionStorage.removeItem("task4FirstVersion");

  // Navigate to Task 5 (Final task!)
  setTimeout(() => {
    window.location.href = "../Task5/task5-selection.html";
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
