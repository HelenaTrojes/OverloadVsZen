// Task 3 Selection JavaScript
// Auto-routing version with shorter delay on second pass

const FIRST_PASS_DELAY_MS = 3000;
const SECOND_PASS_DELAY_MS = 2000;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 3 selection page loaded");

  initializeTaskData();
  routeTask3Automatically();
});

function initializeTaskData() {
  if (!sessionStorage.getItem("task3ModesCompleted")) {
    sessionStorage.setItem("task3ModesCompleted", JSON.stringify([]));
  }
}

function routeTask3Automatically() {
  const completedModes = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]"
  );

  if (completedModes.includes("overload") && completedModes.includes("zen")) {
    console.log("Both Task 3 modes already completed. Redirecting to survey.");
    setTimeout(() => {
      window.location.href = "task3-survey.html";
    }, 500);
    return;
  }

  const group = sessionStorage.getItem("counterbalanceGroup");
  const firstMode = getFirstModeForTask3(group);
  const secondMode = firstMode === "overload" ? "zen" : "overload";

  let nextMode = null;

  if (!completedModes.includes(firstMode)) {
    nextMode = firstMode;
  } else if (!completedModes.includes(secondMode)) {
    nextMode = secondMode;
  }

  if (!nextMode) {
    console.warn("Could not determine next Task 3 mode. Redirecting to survey.");
    setTimeout(() => {
      window.location.href = "task3-survey.html";
    }, 500);
    return;
  }

  const isFirstPass = completedModes.length === 0;
  const delayMs = isFirstPass ? FIRST_PASS_DELAY_MS : SECOND_PASS_DELAY_MS;

  updateSelectionUI(isFirstPass, delayMs);

  console.log("Task 3 auto-routing to:", nextMode);

  setTimeout(() => {
    selectMode(nextMode);
  }, delayMs);
}

function getFirstModeForTask3(group) {
  // Group 1 -> Task 3: A first -> overload first
  // Group 2 -> Task 3: B first -> zen first
  if (group === "group2") {
    return "zen";
  }
  return "overload";
}

function updateSelectionUI(isFirstPass, delayMs) {
  const instructionEl = document.getElementById("taskInstruction");
  const messageEl = document.getElementById("autoRedirectMessage");

  if (instructionEl) {
    if (isFirstPass) {
      instructionEl.textContent = "Preparing the first interface for this task...";
    } else {
      instructionEl.textContent = "Preparing the second interface for this task...";
    }
  }

  if (messageEl) {
    messageEl.textContent = `Redirecting automatically in ${delayMs / 1000} seconds...`;
  }
}

function selectMode(mode) {
  console.log(`Task 3 auto-selected mode: ${mode}`);

  const firstMode = sessionStorage.getItem("task3FirstMode");
  if (!firstMode) {
    sessionStorage.setItem("task3FirstMode", mode);
  }

  const selectionData = {
    task: "task3",
    mode: mode,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
    counterbalanceGroup: sessionStorage.getItem("counterbalanceGroup") || "",
  };

  saveModeSelection(selectionData);

  if (mode === "overload") {
    window.location.href = "task3-overload.html";
  } else {
    window.location.href = "task3-zen.html";
  }
}

function saveModeSelection(selectionData) {
  const selections = JSON.parse(
    sessionStorage.getItem("modeSelections") || "[]"
  );

  const index = selections.findIndex(
    (item) =>
      item.task === selectionData.task && item.mode === selectionData.mode
  );

  if (index >= 0) {
    selections[index] = selectionData;
  } else {
    selections.push(selectionData);
  }

  sessionStorage.setItem("modeSelections", JSON.stringify(selections));
}