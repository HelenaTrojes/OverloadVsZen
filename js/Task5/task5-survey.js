// Task 5 Survey JavaScript - Final task

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 5 Survey loaded");

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

function comparativeChoiceToScores(choice) {
  if (choice === "overload") {
    return { versionA: 5, versionB: 1 };
  }

  if (choice === "zen") {
    return { versionA: 1, versionB: 5 };
  }

  return { versionA: 3, versionB: 3 };
}

function buildCommentSummary(formData, freeText) {
  const rawSummary = [
    `q1_focus=${formData.get("q1_focus") || ""}`,
    `q2_overload_distraction=${formData.get("q2_overload_distraction") || ""}`,
    `q2_zen_distraction=${formData.get("q2_zen_distraction") || ""}`,
    `q3_effectiveness=${formData.get("q3_effectiveness") || ""}`,
  ].join("; ");

  return freeText ? `${freeText}\n[raw] ${rawSummary}` : `[raw] ${rawSummary}`;
}

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
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

  const focusScores = comparativeChoiceToScores(formData.get("q1_focus"));
  const effectivenessScores = comparativeChoiceToScores(
    formData.get("q3_effectiveness"),
  );

  const surveyData = {
    participantId: sessionStorage.getItem("participantId"),
    timestamp: new Date().toISOString(),
    task: "task5",
    version: "both",
    timeSpent: (versionAData?.timeSpent || 0) + (versionBData?.timeSpent || 0),
    clicks: (versionAData?.clicks || 0) + (versionBData?.clicks || 0),
    responses: {
      versionA_confidence: focusScores.versionA,
      versionB_confidence: focusScores.versionB,
      versionA_difficulty: parseInt(
        formData.get("q2_overload_distraction"),
        10,
      ),
      versionB_difficulty: parseInt(formData.get("q2_zen_distraction"), 10),
      versionA_control: effectivenessScores.versionA,
      versionB_control: effectivenessScores.versionB,
      comments: buildCommentSummary(
        formData,
        (formData.get("q4_comments") || "").trim(),
      ),
    },
  };

  console.log("Task 5 Survey data:", surveyData);

  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]",
  );
  allSurveys.push(surveyData);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  if (typeof sendToGoogleSheets === "function") {
    const result = await sendToGoogleSheets(surveyData);
    if (result.success) {
      console.log("Task 5 data sent to Google Sheets");
    }
  }

  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task5")) {
    tasksCompleted.push("task5");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task5ModesCompleted");
  sessionStorage.removeItem("task5FirstMode");

  sessionStorage.setItem("studyComplete", "true");
  sessionStorage.setItem("studyCompletedAt", new Date().toISOString());

  setTimeout(() => {
    window.location.href = "../completion.html";
  }, 500);
}

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
