// Task 2 Overload Mode JavaScript
// Dark pattern: fake submit button, confusing reset, vague validation errors

let taskStartTime;
let firstClickTime = null;   // seconds from task load to first click
let clickCount = 0;          // internal only, not saved
let fakeButtonClicks = 0;    // clicks on the decoy submit button
let resetClicks = 0;         // accidental form resets
let validationErrors = 0;    // failed validation attempts

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 2 Overload Mode loaded");
  taskStartTime = new Date();

  const form = document.getElementById("chaosForm");
  if (form) {
    form.addEventListener("submit", handleRealSubmit);
  }

  document.addEventListener("click", () => {
    clickCount++;

    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }
  });
});

function fakeSubmit() {
  fakeButtonClicks++;
  console.log("Fake button clicked! Total:", fakeButtonClicks);

  const errorPopup = document.getElementById("errorPopup");
  if (errorPopup) {
    errorPopup.style.display = "flex";
  }
}

function fakeCancel() {
  // Intentionally does nothing
  console.log("Cancel clicked (does nothing)");
}

function resetForm() {
  resetClicks++;
  console.log("Reset clicked. Total:", resetClicks);

  const form = document.getElementById("chaosForm");
  if (form) {
    form.reset();
  }
}

function closeError() {
  const popup = document.getElementById("errorPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function handleRealSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    email: form.email.value,
    country: form.country.value,
  };

  if (!formData.firstName || !formData.lastName || !formData.email) {
    validationErrors++;
    fakeSubmit();
    return;
  }

  completeTask(formData);
}

function completeTask(formData) {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task2",
    mode: "overload",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: fakeButtonClicks + resetClicks,
    fakeButtonClicks: fakeButtonClicks,
    resetClicks: resetClicks,
    validationErrors: validationErrors,
    formData: formData,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 2 Overload completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task2Modes = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]"
  );
  if (!task2Modes.includes("overload")) {
    task2Modes.push("overload");
    sessionStorage.setItem("task2ModesCompleted", JSON.stringify(task2Modes));
  }

  setTimeout(() => {
    checkIfBothModesCompleted();
  }, 500);
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]"
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    window.location.href = "task2-survey.html";
  } else {
    window.location.href = "task2-selection.html";
  }
}

function switchMode(mode) {
  if (mode === "zen") window.location.href = "task2-zen.html";
}

function saveOrUpdateCompletedTask(taskData) {
  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]"
  );

  const index = completedTasks.findIndex(
    (item) => item.task === taskData.task && item.mode === taskData.mode
  );

  if (index >= 0) {
    completedTasks[index] = taskData;
  } else {
    completedTasks.push(taskData);
  }

  sessionStorage.setItem("completedTasks", JSON.stringify(completedTasks));
}