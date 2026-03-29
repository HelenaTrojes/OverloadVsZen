// Task 3 Zen Mode JavaScript
// Clean plan selection — no pressure, no friction on changing mind

let taskStartTime;
let firstClickTime = null; // seconds from task load to first click
let clickCount = 0;        // internal only, not saved
let planChanges = 0;       // times user went back to change plan
let selectedPlan = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 3 Zen Mode loaded");
  taskStartTime = new Date();

  document.addEventListener("click", () => {
    clickCount++;

    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }
  });
});

function selectPlan(plan) {
  selectedPlan = plan;
  console.log("Plan selected:", plan);

  document.getElementById("planSelection").style.display = "none";
  document.getElementById("confirmationSection").style.display = "block";

  const planNames = {
    basic: "Basic Plan ($9/month)",
    pro: "Pro Plan ($19/month)",
    premium: "Premium Plan ($29/month)",
  };
  document.getElementById("selectedPlanName").textContent = planNames[plan];
}

function changeMind() {
  planChanges++;
  console.log("User changed mind. Total changes:", planChanges);

  document.getElementById("confirmationSection").style.display = "none";
  document.getElementById("planSelection").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function confirmSelection() {
  if (!selectedPlan) {
    alert("Please select a plan first");
    return;
  }
  completeTask();
}

function completeTask() {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task3",
    mode: "zen",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: 0,
    planChanges: planChanges,
    confirmshamingShown: 0,
    finalPlan: selectedPlan,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 3 Zen completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task3Modes = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]"
  );
  if (!task3Modes.includes("zen")) {
    task3Modes.push("zen");
    sessionStorage.setItem("task3ModesCompleted", JSON.stringify(task3Modes));
  }

  setTimeout(() => {
    checkIfBothModesCompleted();
  }, 500);
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]"
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    window.location.href = "task3-survey.html";
  } else {
    window.location.href = "task3-selection.html";
  }
}

function switchMode(mode) {
  if (mode === "overload") window.location.href = "task3-overload.html";
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