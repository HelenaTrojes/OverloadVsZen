// Task 3 Overload Mode JavaScript
// Dark pattern: confirmshaming modal, upsell pressure on every plan choice

let taskStartTime;
let firstClickTime = null;      // seconds from task load to first click
let clickCount = 0;             // internal only, not saved
let planChanges = 0;            // times user went back to change their plan
let confirmshamingShown = 0;    // times the manipulative modal was triggered
let selectedPlan = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 3 Overload Mode loaded");
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

  const confirmationTitle = document.getElementById("confirmationTitle");
  const upsellMessage = document.getElementById("upsellMessage");
  const upsellText = document.getElementById("upsellText");

  if (plan === "basic") {
    confirmationTitle.textContent = "Are You Sure About This?";
    upsellMessage.style.display = "block";
    upsellText.textContent =
      "🚨 You're leaving 90% of the features on the table. Most users who pick Basic upgrade within a week - skip the hassle and go Premium now while the discount lasts!";
  } else if (plan === "pro") {
    confirmationTitle.textContent = "So Close to the Best...";
    upsellMessage.style.display = "block";
    upsellText.textContent =
      "⚡ Premium is only $10 more and gives you 4× the storage, 24/7 support, and custom integrations. You're already this close!";
  } else if (plan === "premium") {
    confirmationTitle.textContent = "Excellent Choice!";
    upsellMessage.style.display = "block";
    upsellText.textContent =
      "⚠️ You selected the full plan with the most features and value! Congratulations!";
  }
}

function showConfirmShaming() {
  confirmshamingShown++;
  console.log("Confirmshaming modal shown. Count:", confirmshamingShown);

  const shameTitle = document.getElementById("shameTitle");
  const shameText = document.getElementById("shameText");

  if (selectedPlan === "basic") {
    shameTitle.textContent = "Wait - you really want fewer features?";
    shameText.textContent =
      "Going back means risking losing this limited-time deal entirely. Are you sure you want to start over?";
  } else if (selectedPlan === "pro") {
    shameTitle.textContent = "Give up your Pro spot?";
    shameText.textContent =
      "If you go back, you might miss the current pricing. Most users who leave don't come back to the same offer.";
  } else if (selectedPlan === "premium") {
    shameTitle.textContent = "You'd give up Premium?";
    shameText.textContent =
      "Premium users save an average of $840/year in productivity. Are you sure you want to downgrade your experience?";
  } else {
    shameTitle.textContent = "Are you sure you want to go back?";
    shameText.textContent = "You might lose your current pricing offer.";
  }

  document.getElementById("confirmshamingModal").style.display = "flex";
}

function closeConfirmShaming() {
  document.getElementById("confirmshamingModal").style.display = "none";
}

function actuallyChangeMind() {
  planChanges++;
  console.log("User changed mind. Total changes:", planChanges);

  document.getElementById("confirmshamingModal").style.display = "none";
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
    mode: "overload",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: 0,
    planChanges: planChanges,
    confirmshamingShown: confirmshamingShown,
    finalPlan: selectedPlan,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 3 Overload completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task3Modes = JSON.parse(
    sessionStorage.getItem("task3ModesCompleted") || "[]"
  );
  if (!task3Modes.includes("overload")) {
    task3Modes.push("overload");
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
  if (mode === "zen") window.location.href = "task3-zen.html";
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