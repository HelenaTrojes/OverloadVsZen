let taskStartTime;
let clickCount = 0;
let distractionClicks = 0;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 1 Zen Mode loaded");
  taskStartTime = new Date();
  trackInteractions();
});

function trackInteractions() {
  document.addEventListener("click", (e) => {
    clickCount++;

    const importantNotif = document.getElementById("importantNotification");
    const clickedImportant =
      importantNotif && importantNotif.contains(e.target);

    if (!clickedImportant) {
      distractionClicks++;
      console.log(
        "Zen non-target click counted as distraction/misdirect click",
      );
    }

    const clickData = {
      timestamp: new Date().toISOString(),
      element: e.target.tagName,
      className: e.target.className,
      clickNumber: clickCount,
      wasDistraction: !clickedImportant,
    };

    console.log("Click tracked:", clickData);
  });
}

function completeTask() {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task1",
    mode: "zen",
    completed: true,
    timeSpent: timeSpent,
    clicks: clickCount,
    distractionClicks: distractionClicks,
    misclicks: distractionClicks,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task completed:", taskData);

  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  completedTasks.push(taskData);
  sessionStorage.setItem("completedTasks", JSON.stringify(completedTasks));

  const task1Modes = JSON.parse(
    sessionStorage.getItem("task1ModesCompleted") || "[]",
  );
  if (!task1Modes.includes("zen")) {
    task1Modes.push("zen");
    sessionStorage.setItem("task1ModesCompleted", JSON.stringify(task1Modes));
  }

  checkIfBothModesCompleted();
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task1ModesCompleted") || "[]",
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    // Both modes completed - go to survey
    setTimeout(() => {
      window.location.href = "./task1-survey.html";
    }, 500);
  } else {
    // Return to mode selection to try the other mode
    setTimeout(() => {
      window.location.href = "./task1-selection.html";
    }, 500);
  }
}

function switchMode(mode) {
  if (mode === "overload") {
    window.location.href = "./task1-overload.html";
  }
}
