// Task 4 Zen Mode JavaScript
// Clean product selection — honest pricing, no urgency manipulation

let taskStartTime;
let firstClickTime = null; // seconds from task load to first click
let clickCount = 0;        // internal only, not saved
let selectedProduct = null;
let selectedPrice = 0;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 4 Zen Mode loaded");
  taskStartTime = new Date();

  document.addEventListener("click", () => {
    clickCount++;

    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }
  });
});

function selectProduct(product, price) {
  selectedProduct = product;
  selectedPrice = price;

  console.log("Product selected:", product, "Price:", price);
  completeTask();
}

function completeTask() {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task4",
    mode: "zen",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: 0,
    productChosen: selectedProduct,
    priceChosen: selectedPrice,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 4 Zen completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task4Modes = JSON.parse(
    sessionStorage.getItem("task4ModesCompleted") || "[]"
  );
  if (!task4Modes.includes("zen")) {
    task4Modes.push("zen");
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
  if (mode === "overload") window.location.href = "task4-overload.html";
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