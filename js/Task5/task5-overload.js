// Task 5 Overload Mode JavaScript
// Dark pattern: repeated popups, pressure timer, video interruptions
// breaking reading focus and impairing comprehension

let taskStartTime;
let firstClickTime = null;    // seconds from task load to first click
let clickCount = 0;           // internal only, not saved
let selectedAnswer = null;
let interruptionCount = 0;    // times popups broke the reading session
let pressureTime = 90;        // countdown timer in seconds

let pressureTimerIntervalId = null;
let initialVideoPopupTimeoutId = null;
let recurringVideoPopupTimeoutId = null;
let initialInterruptionTimeoutId = null;
let recurringInterruptionTimeoutId = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 5 Overload Mode loaded");
  taskStartTime = new Date();

  startPressureTimer();

  // Show video popup after 3 seconds
  initialVideoPopupTimeoutId = setTimeout(showVideoPopup, 3000);

  // Show interruption popup after 8 seconds
  initialInterruptionTimeoutId = setTimeout(showInterruption, 8000);

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

function startPressureTimer() {
  pressureTimerIntervalId = setInterval(() => {
    pressureTime--;
    if (pressureTime < 0) pressureTime = 90;

    const minutes = Math.floor(pressureTime / 60);
    const seconds = pressureTime % 60;

    const timerEl = document.getElementById("pressureTimer");
    if (timerEl) {
      timerEl.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
    }
  }, 1000);
}

function showVideoPopup() {
  const popup = document.getElementById("videoPopup");
  if (popup) {
    popup.style.display = "block";
  }
}

function closeVideo() {
  const popup = document.getElementById("videoPopup");
  if (popup) {
    popup.style.display = "none";
  }

  recurringVideoPopupTimeoutId = setTimeout(showVideoPopup, 10000);
}

function showInterruption() {
  interruptionCount++;
  console.log("Interruption shown. Count:", interruptionCount);

  const popup = document.getElementById("interruptionPopup");
  if (popup) {
    popup.style.display = "flex";
  }
}

function closeInterruption() {
  const popup = document.getElementById("interruptionPopup");
  if (popup) {
    popup.style.display = "none";
  }

  recurringInterruptionTimeoutId = setTimeout(
    showInterruption,
    Math.random() * 15000 + 10000
  );
}

function stopTaskEffects() {
  if (pressureTimerIntervalId) clearInterval(pressureTimerIntervalId);
  if (initialVideoPopupTimeoutId) clearTimeout(initialVideoPopupTimeoutId);
  if (recurringVideoPopupTimeoutId) clearTimeout(recurringVideoPopupTimeoutId);
  if (initialInterruptionTimeoutId) clearTimeout(initialInterruptionTimeoutId);
  if (recurringInterruptionTimeoutId) clearTimeout(recurringInterruptionTimeoutId);
}

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
  stopTaskEffects();

  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task5",
    mode: "overload",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: 0,
    interruptionCount: interruptionCount,
    answerCorrect: isCorrect,
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 5 Overload completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task5Modes = JSON.parse(
    sessionStorage.getItem("task5ModesCompleted") || "[]"
  );
  if (!task5Modes.includes("overload")) {
    task5Modes.push("overload");
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
  if (mode === "zen") window.location.href = "task5-zen.html";
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