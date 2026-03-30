// Task 4 Selection JavaScript
// Auto-routing version with shorter delay on second pass

const FIRST_PASS_DELAY_MS = 3000;
const SECOND_PASS_DELAY_MS = 2000;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 4 selection page loaded");

  initializeTaskData();
  routeTask4Automatically();
});

function initializeTaskData() {
  if (!sessionStorage.getItem("task4ModesCompleted")) {
    sessionStorage.setItem("task4ModesCompleted", JSON.stringify([]));
  }
}

function routeTask4Automatically() {
  const completedModes = JSON.parse(
    sessionStorage.getItem("task4ModesCompleted") || "[]"
  );

  if (completedModes.includes("overload") && completedModes.includes("zen")) {
    console.log("Both Task 4 modes already completed. Redirecting to survey.");
    setTimeout(() => {
      window.location.href = "task4-survey.html";
    }, 500);
    return;
  }

  const group = sessionStorage.getItem("counterbalanceGroup");
  const firstMode = getFirstModeForTask4(group);
  const secondMode = firstMode === "overload" ? "zen" : "overload";

  let nextMode = null;

  if (!completedModes.includes(firstMode)) {
    nextMode = firstMode;
  } else if (!completedModes.includes(secondMode)) {
    nextMode = secondMode;
  }

  if (!nextMode) {
    console.warn("Could not determine next Task 4 mode. Redirecting to survey.");
    setTimeout(() => {
      window.location.href = "task4-survey.html";
    }, 500);
    return;
  }

  const isFirstPass = completedModes.length === 0;
  const delayMs = isFirstPass ? FIRST_PASS_DELAY_MS : SECOND_PASS_DELAY_MS;

  updateSelectionUI(isFirstPass, delayMs);

  console.log("Task 4 auto-routing to:", nextMode);

  setTimeout(() => {
    selectMode(nextMode);
  }, delayMs);
}

function getFirstModeForTask4(group) {
  // Group 1 -> Task 4: B first -> zen first
  // Group 2 -> Task 4: A first -> overload first
  if (group === "group2") {
    return "overload";
  }
  return "zen";
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
  console.log(`Task 4 auto-selected mode: ${mode}`);

  const firstMode = sessionStorage.getItem("task4FirstMode");
  if (!firstMode) {
    sessionStorage.setItem("task4FirstMode", mode);
  }

  const selectionData = {
    task: "task4",
    mode: mode,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
    counterbalanceGroup: sessionStorage.getItem("counterbalanceGroup") || "",
  };

  saveModeSelection(selectionData);

  if (mode === "overload") {
    window.location.href = "task4-overload.html";
  } else {
    window.location.href = "task4-zen.html";
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