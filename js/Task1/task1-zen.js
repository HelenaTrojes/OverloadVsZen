// Task 1 Zen Mode JavaScript
// Clean notification layout — one clear target, no distractors

let taskStartTime;
let firstClickTime = null; // seconds from task load to first click
let clickCount = 0;        // internal only, not saved
let misclicks = 0;         // any click that is NOT the target notification

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 1 Zen Mode loaded");
  taskStartTime = new Date();
  trackInteractions();
});

function trackInteractions() {
  const importantNotif = document.getElementById("importantNotification");

  document.addEventListener("click", (e) => {
    clickCount++;

    // Record time to first click
    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }

    const clickedTarget = importantNotif && importantNotif.contains(e.target);

    // In Zen there are no deception elements.
    // Any non-target click counts as a misclick.
    if (!clickedTarget) {
      misclicks++;
      console.log("Non-target click counted as misclick");
    }

    console.log("Click tracked:", {
      timestamp: new Date().toISOString(),
      element: e.target.tagName,
      className: e.target.className,
      clickNumber: clickCount,
      wasMisclick: !clickedTarget,
    });
  });

  // Explicitly bind the correct target to task completion
  if (importantNotif) {
    importantNotif.addEventListener("click", () => {
      completeTask();
    });
  }
}

function completeTask() {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task1",
    mode: "zen",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: misclicks,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 1 Zen completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task1Modes = JSON.parse(
    sessionStorage.getItem("task1ModesCompleted") || "[]"
  );
  if (!task1Modes.includes("zen")) {
    task1Modes.push("zen");
    sessionStorage.setItem("task1ModesCompleted", JSON.stringify(task1Modes));
  }

  checkIfBothModesCompleted();
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task1ModesCompleted") || "[]"
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    setTimeout(() => {
      window.location.href = "./task1-survey.html";
    }, 500);
  } else {
    setTimeout(() => {
      window.location.href = "./task1-selection.html";
    }, 500);
  }
}

function switchMode(mode) {
  if (mode === "overload") window.location.href = "./task1-overload.html";
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