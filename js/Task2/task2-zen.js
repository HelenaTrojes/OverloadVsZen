// Task 2 Zen Mode JavaScript

let taskStartTime;
let clickCount = 0;
let validationAttempts = 0;
let progressFill;
let progressText;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Task 2 Zen Mode loaded");
  taskStartTime = new Date();

  const form = document.getElementById("contactForm");
  form.addEventListener("submit", handleSubmit);

  progressFill = document.getElementById("formProgress");
  progressText = document.getElementById("progressText");

  // Add real-time validation feedback
  addRealtimeValidation();

  // Initialize progress tracking
  addProgressTracking();
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

    progressFill.style.width = percent + "%";
    progressText.textContent = `${percent}% completed`;

    if (percent === 100) {
      progressText.textContent = "Ready to submit ✓";
    }
  }

  inputs.forEach((input) => {
    input.addEventListener("input", updateProgress);
  });

  // Initial state
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
    errorSpan.textContent = "";
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    errorSpan.textContent = errorMessage;
    validationAttempts++;
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
    clicks: clickCount,
    validationAttempts: validationAttempts,
    formData: {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
    },
    timestamp: new Date().toISOString(),
    participantId: sessionStorage.getItem("participantId"),
  };

  console.log("Task 2 completed:", taskData);

  const completedTasks = JSON.parse(
    sessionStorage.getItem("completedTasks") || "[]",
  );
  completedTasks.push(taskData);
  sessionStorage.setItem("completedTasks", JSON.stringify(completedTasks));

  const task2Modes = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]",
  );
  if (!task2Modes.includes("zen")) {
    task2Modes.push("zen");
    sessionStorage.setItem("task2ModesCompleted", JSON.stringify(task2Modes));
  }

  // Show success message briefly
  showSuccessMessage();

  // Check if both modes completed
  setTimeout(() => {
    checkIfBothModesCompleted();
  }, 1500);
}

function showSuccessMessage() {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message show";
  successDiv.innerHTML =
    "<strong>✓ Success!</strong><br>Your form has been submitted.";
  document.querySelector(".form-container").appendChild(successDiv);
}

function checkIfBothModesCompleted() {
  const completed = JSON.parse(
    sessionStorage.getItem("task2ModesCompleted") || "[]",
  );

  if (completed.includes("overload") && completed.includes("zen")) {
    window.location.href = "task2-survey.html";
  } else {
    window.location.href = "task2-selection.html";
  }
}

function switchMode(mode) {
  if (mode === "overload") {
    window.location.href = "task2-overload.html";
  }
}

// Track clicks
document.addEventListener("click", () => {
  clickCount++;
});
