// Task 2 Zen Mode JavaScript
// Clear form with real-time validation, progress indicator, honest feedback

let taskStartTime;
let firstClickTime = null;   // seconds from task load to first click
let clickCount = 0;          // internal only, not saved
let validationErrors = 0;    // failed validation attempts
let progressFill;
let progressText;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 2 Zen Mode loaded");
  taskStartTime = new Date();

  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  progressFill = document.getElementById("formProgress");
  progressText = document.getElementById("progressText");

  addRealtimeValidation();
  addProgressTracking();

  document.addEventListener("click", () => {
    clickCount++;

    if (firstClickTime === null) {
      firstClickTime = (new Date() - taskStartTime) / 1000;
    }
  });
});

function addRealtimeValidation() {
  const inputs = document.querySelectorAll(".form-input");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input);
    });

    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        validateField(input);
      }
    });
  });
}

function addProgressTracking() {
  const inputs = document.querySelectorAll(".form-input");

  function updateProgress() {
    let filled = 0;

    inputs.forEach((input) => {
      if (input.value.trim() !== "") {
        filled++;
      }
    });

    const percent = Math.round((filled / inputs.length) * 100);

    if (progressFill) {
      progressFill.style.width = percent + "%";
    }

    if (progressText) {
      progressText.textContent =
        percent === 100 ? "Ready to submit ✓" : `${percent}% completed`;
    }
  }

  inputs.forEach((input) => {
    input.addEventListener("input", updateProgress);
  });

  updateProgress();
}

function validateField(input) {
  const errorSpan = document.getElementById(input.id + "Error");
  let isValid = true;
  let errorMessage = "";

  if (input.value.trim() === "") {
    isValid = false;
    errorMessage = "This field is required";
  } else if (input.type === "email" && !isValidEmail(input.value)) {
    isValid = false;
    errorMessage = "Please enter a valid email address";
  }

  if (isValid) {
    input.classList.remove("invalid");
    input.classList.add("valid");
    if (errorSpan) errorSpan.textContent = "";
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    if (errorSpan) errorSpan.textContent = errorMessage;
    validationErrors++;
  }

  return isValid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const inputs = form.querySelectorAll(".form-input");
  let allValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      allValid = false;
    }
  });

  if (allValid) {
    completeTask(form);
  }
}

function completeTask(form) {
  const timeSpent = (new Date() - taskStartTime) / 1000;

  const taskData = {
    task: "task2",
    mode: "zen",
    completed: true,
    timeSpent: timeSpent,
    firstClickTime: firstClickTime ?? "",
    misclicks: validationErrors,
    fakeButtonClicks: 0,
    resetClicks: 0,
    validationErrors: validationErrors,
    formData: {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
    },
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 2 Zen completed:", taskData);

  saveOrUpdateCompletedTask(taskData);

  const task2Modes = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]"
  );
  if (!task2Modes.includes("zen")) {
    task2Modes.push("zen");
    sessionStorage.setItem("task2ModesCompleted", JSON.stringify(task2Modes));
  }

  const submitBtn = document.querySelector(".submit-button");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitted ✓";
  }

  showSuccessMessage();

  setTimeout(() => {
    checkIfBothModesCompleted();
  }, 2000);
}

function showSuccessMessage() {
  let successDiv = document.querySelector(".success-message");

  if (!successDiv) {
    successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.innerHTML =
      "<strong>✓ Success!</strong><br>Your form has been submitted.";

    const container = document.querySelector(".form-container");
    if (container) {
      container.appendChild(successDiv);
    }
  }

  successDiv.classList.add("show");

  setTimeout(() => {
    successDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
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
  if (mode === "overload") window.location.href = "task2-overload.html";
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