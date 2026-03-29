// Task 5 Zen Mode JavaScript
// Clean reading comprehension — no popups, no pressure, no interruptions

let taskStartTime;
let firstClickTime = null; // seconds from task load to first click
let clickCount = 0;        // internal only, not saved
let selectedAnswer = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 5 Zen Mode loaded");
  taskStartTime = new Date();

  document.querySelectorAll('input[name="answer"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      selectedAnswer = e.target.value;
      console.log("Answer selected:", selectedAnswer);
    });
  });

  document.addEventListener("click", () => {
    clickCount++;

    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }
  });
});

function submitAnswer() {
  if (!selectedAnswer) {
    alert("Please select an answer before submitting.");
    return;
  }

  const correctAnswer = "B";
  const isCorrect = selectedAnswer === correctAnswer;

  console.log("Answer submitted:", selectedAnswer, "Correct:", isCorrect);
  completeTask(isCorrect);
}

function completeTask(isCorrect) {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task5",
    mode: "zen",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: 0,
    interruptionCount: 0,
    answerCorrect: isCorrect,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 5 Zen completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task5Modes = JSON.parse(
    sessionStorage.getItem("task5ModesCompleted") || "[]"
  );
  if (!task5Modes.includes("zen")) {
    task5Modes.push("zen");
    sessionStorage.setItem("task5ModesCompleted", JSON.stringify(task5Modes));
  }

  setTimeout(() => {
    checkIfBothModesCompleted();
  }, 500);
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task5ModesCompleted") || "[]"
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    window.location.href = "task5-survey.html";
  } else {
    window.location.href = "task5-selection.html";
  }
}

function switchMode(mode) {
  if (mode === "overload") window.location.href = "task5-overload.html";
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