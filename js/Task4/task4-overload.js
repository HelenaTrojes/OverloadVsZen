// Task 4 Overload Mode JavaScript
// Dark pattern: fake countdown timer, fake viewer count, fake stock alerts

let taskStartTime;
let firstClickTime = null;   // seconds from task load to first click
let clickCount = 0;          // internal only, not saved
let selectedProduct = null;
let selectedPrice = 0;
let viewerCount = 127;
let countdown = 167;         // 2:47 in seconds

let viewerIntervalId = null;
let countdownIntervalId = null;
let initialStockAlertTimeoutId = null;
let recurringStockAlertTimeoutId = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 4 Overload Mode loaded");
  taskStartTime = new Date();

  startViewerCounter();
  startCountdown();

  // Show fake stock alert after 3 seconds
  initialStockAlertTimeoutId = setTimeout(showStockAlert, 3000);

  document.addEventListener("click", () => {
    clickCount++;

    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }
  });
});

function startViewerCounter() {
  viewerIntervalId = setInterval(() => {
    const change = Math.floor(Math.random() * 10) - 5;
    viewerCount = Math.max(100, Math.min(200, viewerCount + change));

    const viewerEl = document.getElementById("viewerCount");
    if (viewerEl) {
      viewerEl.textContent = viewerCount;
    }
  }, 2000);
}

function startCountdown() {
  countdownIntervalId = setInterval(() => {
    countdown--;
    if (countdown < 0) countdown = 180;

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
      countdownEl.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
    }
  }, 1000);
}

function showStockAlert() {
  const alertBox = document.getElementById("stockAlert");
  if (alertBox) {
    alertBox.style.display = "block";

    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000);
  }

  // Show again at random interval
  recurringStockAlertTimeoutId = setTimeout(
    showStockAlert,
    Math.random() * 10000 + 5000
  );
}

function stopTaskEffects() {
  if (viewerIntervalId) clearInterval(viewerIntervalId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (initialStockAlertTimeoutId) clearTimeout(initialStockAlertTimeoutId);
  if (recurringStockAlertTimeoutId) clearTimeout(recurringStockAlertTimeoutId);
}

function selectProduct(product, price) {
  selectedProduct = product;
  selectedPrice = price;

  console.log("Product selected:", product, "Price:", price);
  completeTask();
}

function completeTask() {
  stopTaskEffects();

  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task4",
    mode: "overload",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: 0,
    productChosen: selectedProduct,
    priceChosen: selectedPrice,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 4 Overload completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task4Modes = JSON.parse(
    sessionStorage.getItem("task4ModesCompleted") || "[]"
  );
  if (!task4Modes.includes("overload")) {
    task4Modes.push("overload");
    sessionStorage.setItem("task4ModesCompleted", JSON.stringify(task4Modes));
  }

  setTimeout(() => {
    checkIfBothModesCompleted();
  }, 500);
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task4ModesCompleted") || "[]"
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    window.location.href = "task4-survey.html";
  } else {
    window.location.href = "task4-selection.html";
  }
}

function switchMode(mode) {
  if (mode === "zen") window.location.href = "task4-zen.html";
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