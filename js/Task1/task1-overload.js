// Task 1 Overload Mode JavaScript
// Dark pattern: visual noise, buried target, annoying popup

let taskStartTime;
let firstClickTime = null; // seconds from task load to first click
let clickCount = 0;        // internal only, not saved
let deceptionClicks = 0;   // clicks on fake banners/alerts/prizes

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 1 Overload Mode loaded");
  taskStartTime = new Date();

  // Show annoying popup after 3 seconds
  setTimeout(() => {
    showAnnoyingPopup();
  }, 3000);

  trackInteractions();
});

function trackInteractions() {
  document.addEventListener("click", (e) => {
    clickCount++;

    // Record time to first click
    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }

    const clickedDeception =
      e.target.closest(
        ".flash-banner, .ad-banner, .fake-alert, .fake-notification, .flash-alert, .trending-banner"
      ) !== null;

    if (clickedDeception) {
      deceptionClicks++;
      console.log("Deception element clicked!");
    }

    console.log("Click tracked:", {
      timestamp: new Date().toISOString(),
      element: e.target.tagName,
      className: e.target.className,
      clickNumber: clickCount,
      wasDeception: clickedDeception,
    });
  });

  // Completing the task = clicking the actual important notification
  const importantNotif = document.getElementById("importantNotification");
  if (importantNotif) {
    importantNotif.addEventListener("click", () => {
      completeTask();
    });
  }
}

function showAnnoyingPopup() {
  const popup = document.getElementById("annoyingPopup");
  if (popup) popup.style.display = "flex";
}

function closePopup() {
  const popup = document.getElementById("annoyingPopup");
  if (popup) popup.style.display = "none";
}

function completeTask() {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task1",
    mode: "overload",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: deceptionClicks,
    deceptionClicks: deceptionClicks,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 1 Overload completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task1Modes = JSON.parse(
    sessionStorage.getItem("task1ModesCompleted") || "[]"
  );
  if (!task1Modes.includes("overload")) {
    task1Modes.push("overload");
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
  if (mode === "zen") window.location.href = "./task1-zen.html";
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

window.onclick = function (event) {
  const popup = document.getElementById("annoyingPopup");
  if (event.target === popup) closePopup();
};