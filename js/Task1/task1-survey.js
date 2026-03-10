// Task 1 Survey JavaScript

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 1 Survey loaded");

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
    `q1_clarity=${formData.get("q1_clarity") || ""}`,
    `q2_overload_feeling=${formData.get("q2_overload_feeling") || ""}`,
    `q2_zen_feeling=${formData.get("q2_zen_feeling") || ""}`,
    `q3_control=${formData.get("q3_control") || ""}`,
  ].join("; ");

  return freeText ? `${freeText}\n[raw] ${rawSummary}` : `[raw] ${rawSummary}`;
}

async function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  const task1Data = completedTasks.filter((t) => t.task === "task1");
  const versionAData = task1Data.find(
    (t) => t.version === "versionA" || t.mode === "overload",
  );
  const versionBData = task1Data.find(
    (t) => t.version === "versionB" || t.mode === "zen",
  );

  const clarityScores = comparativeChoiceToScores(formData.get("q1_clarity"));
  const controlScores = comparativeChoiceToScores(formData.get("q3_control"));

  const surveyData = {
    participantId: sessionStorage.getItem("participantId"),
    timestamp: new Date().toISOString(),
    task: "task1",
    version: "both",
    timeSpent: (versionAData?.timeSpent || 0) + (versionBData?.timeSpent || 0),
    clicks: (versionAData?.clicks || 0) + (versionBData?.clicks || 0),
    responses: {
      versionA_confidence: clarityScores.versionA,
      versionB_confidence: clarityScores.versionB,
      versionA_difficulty: parseInt(formData.get("q2_overload_feeling"), 10),
      versionB_difficulty: parseInt(formData.get("q2_zen_feeling"), 10),
      versionA_control: controlScores.versionA,
      versionB_control: controlScores.versionB,
      comments: buildCommentSummary(
        formData,
        (formData.get("q4_comments") || "").trim(),
      ),
    },
  };

  console.log("Survey data collected:", surveyData);

  const allSurveys = JSON.parse(
    sessionStorage.getItem("surveyResponses") || "[]",
  );
  allSurveys.push(surveyData);
  sessionStorage.setItem("surveyResponses", JSON.stringify(allSurveys));

  if (typeof sendToGoogleSheets === "function") {
    const result = await sendToGoogleSheets(surveyData);
    if (result.success) {
      console.log("Task 1 data sent to Google Sheets");
    }
  }

  const tasksCompleted = JSON.parse(
    sessionStorage.getItem("tasksCompleted") || "[]",
  );
  if (!tasksCompleted.includes("task1")) {
    tasksCompleted.push("task1");
    sessionStorage.setItem("tasksCompleted", JSON.stringify(tasksCompleted));
  }

  sessionStorage.removeItem("task1ModesCompleted");
  sessionStorage.removeItem("task1FirstMode");

  setTimeout(() => {
    window.location.href = "../Task2/task2-selection.html";
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
