// Task 2 Selection JavaScript
// Auto-routing version with shorter delay on second pass

const FIRST_PASS_DELAY_MS = 3000;
const SECOND_PASS_DELAY_MS = 2000;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 2 selection page loaded");

  initializeTaskData();
  routeTask2Automatically();
});

function initializeTaskData() {
  if (!sessionStorage.getItem("task2ModesCompleted")) {
    sessionStorage.setItem("task2ModesCompleted", JSON.stringify([]));
  }
}

function routeTask2Automatically() {
  const completedModes = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]"
  );

  if (completedModes.includes("overload") && completedModes.includes("zen")) {
    console.log("Both Task 2 modes already completed. Redirecting to survey.");
    setTimeout(() => {
      window.location.href = "task2-survey.html";
    }, 500);
    return;
  }

  const group = sessionStorage.getItem("counterbalanceGroup");
  const firstMode = getFirstModeForTask2(group);
  const secondMode = firstMode === "overload" ? "zen" : "overload";

  let nextMode = null;

  if (!completedModes.includes(firstMode)) {
    nextMode = firstMode;
  } else if (!completedModes.includes(secondMode)) {
    nextMode = secondMode;
  }

  if (!nextMode) {
    console.warn("Could not determine next Task 2 mode. Redirecting to survey.");
    setTimeout(() => {
      window.location.href = "task2-survey.html";
    }, 500);
    return;
  }

  const isFirstPass = completedModes.length === 0;
  const delayMs = isFirstPass ? FIRST_PASS_DELAY_MS : SECOND_PASS_DELAY_MS;

  updateSelectionUI(isFirstPass, delayMs);

  console.log("Task 2 auto-routing to:", nextMode);

  setTimeout(() => {
    selectMode(nextMode);
  }, delayMs);
}

function getFirstModeForTask2(group) {
  // Group 1 -> Task 2: B first -> zen first
  // Group 2 -> Task 2: A first -> overload first
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
  console.log(`Task 2 auto-selected mode: ${mode}`);

  const firstMode = sessionStorage.getItem("task2FirstMode");
  if (!firstMode) {
    sessionStorage.setItem("task2FirstMode", mode);
  }

  const selectionData = {
    task: "task2",
    mode: mode,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
    counterbalanceGroup: sessionStorage.getItem("counterbalanceGroup") || "",
  };

  saveModeSelection(selectionData);

  if (mode === "overload") {
    window.location.href = "task2-overload.html";
  } else {
    window.location.href = "task2-zen.html";
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