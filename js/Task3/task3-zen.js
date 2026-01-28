// Task 3 Zen Mode JavaScript

let taskStartTime;
let clickCount = 0;
let planChanges = 0;
let selectedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 3 Zen Mode loaded');
    taskStartTime = new Date();
    
    document.addEventListener('click', () => {
        clickCount++;
    });
});

function selectPlan(plan) {
    selectedPlan = plan;
    console.log('Plan selected:', plan);
    
    // Hide plan selection
    document.getElementById('planSelection').style.display = 'none';
    
    // Show confirmation
    const confirmationSection = document.getElementById('confirmationSection');
    confirmationSection.style.display = 'block';
    
    // Update selected plan name
    const planNames = {
        'basic': 'Basic Plan ($9/month)',
        'pro': 'Pro Plan ($19/month)',
        'premium': 'Premium Plan ($29/month)'
    };
    document.getElementById('selectedPlanName').textContent = planNames[plan];
}

function changeMind() {
    planChanges++;
    console.log('User changed mind. Total changes:', planChanges);
    
    // Hide confirmation
    document.getElementById('confirmationSection').style.display = 'none';
    
    // Show plan selection again
    document.getElementById('planSelection').style.display = 'block';
    
    // Scroll back to plans
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function confirmSelection() {
    if (!selectedPlan) {
        alert('Please select a plan first');
        return;
    }
    
    completeTask();
}

function completeTask() {
    const timeSpent = (new Date() - taskStartTime) / 1000;
    
    const taskData = {
        task: 'task3',
        mode: 'zen',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        planChanges: planChanges,
        finalPlan: selectedPlan,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 3 Zen completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task3Modes = JSON.parse(sessionStorage.getItem('task3ModesCompleted') || '[]');
    if (!task3Modes.includes('zen')) {
        task3Modes.push('zen');
        sessionStorage.setItem('task3ModesCompleted', JSON.stringify(task3Modes));
    }
    
    // Check if both modes completed
    setTimeout(() => {
        checkIfBothModesCompleted();
    }, 500);
}

function checkIfBothModesCompleted() {
    const completed = JSON.parse(sessionStorage.getItem('task3ModesCompleted') || '[]');
    
    if (completed.includes('overload') && completed.includes('zen')) {
        window.location.href = 'task3-survey.html';
    } else {
        window.location.href = 'task3-selection.html';
    }
}

function switchMode(mode) {
    if (mode === 'overload') {
        window.location.href = 'task3-overload.html';
    }
}