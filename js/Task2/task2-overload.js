// Task 2 Overload Mode JavaScript

let taskStartTime;
let clickCount = 0;
let fakeButtonClicks = 0;
let resetClicks = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 2 Overload Mode loaded');
    taskStartTime = new Date();
    
    const form = document.getElementById('chaosForm');
    form.addEventListener('submit', handleRealSubmit);
    
    // Track all clicks
    document.addEventListener('click', () => {
        clickCount++;
    });
});

function fakeSubmit() {
    fakeButtonClicks++;
    console.log('Fake button clicked!');
    
    // Show vague error
    const errorPopup = document.getElementById('errorPopup');
    errorPopup.style.display = 'flex';
}

function fakeCancel() {
    console.log('Cancel clicked (does nothing)');
    // Does nothing - just tracks the click
}

function resetForm() {
    resetClicks++;
    console.log('Reset clicked');
    document.getElementById('chaosForm').reset();
}

function closeError() {
    const errorPopup = document.getElementById('errorPopup');
    errorPopup.style.display = 'none';
}

function handleRealSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        country: form.country.value
    };
    
    // Check if required fields are filled
    if (!formData.firstName || !formData.lastName || !formData.email) {
        // Show vague error
        fakeSubmit();
        return;
    }
    
    completeTask(formData);
}

function completeTask(formData) {
    const timeSpent = (new Date() - taskStartTime) / 1000;
    
    const taskData = {
        task: 'task2',
        mode: 'overload',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        fakeButtonClicks: fakeButtonClicks,
        resetClicks: resetClicks,
        formData: formData,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 2 Overload completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task2Modes = JSON.parse(sessionStorage.getItem('task2ModesCompleted') || '[]');
    if (!task2Modes.includes('overload')) {
        task2Modes.push('overload');
        sessionStorage.setItem('task2ModesCompleted', JSON.stringify(task2Modes));
    }
    
    // Check if both modes completed
    setTimeout(() => {
        checkIfBothModesCompleted();
    }, 500);
}

function checkIfBothModesCompleted() {
    const completed = JSON.parse(sessionStorage.getItem('task2ModesCompleted') || '[]');
    
    if (completed.includes('overload') && completed.includes('zen')) {
        window.location.href = 'task2-survey.html';
    } else {
        window.location.href = 'task2-selection.html';
    }
}

function switchMode(mode) {
    if (mode === 'zen') {
        window.location.href = 'task2-zen.html';
    }
}