// Task 3 Overload Mode JavaScript

let taskStartTime;
let clickCount = 0;
let planChanges = 0;
let confirmshamingShown = 0;
let selectedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 3 Overload Mode loaded');
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
    
    // Show upsell if not premium
    if (plan !== 'premium') {
        document.getElementById('upsellMessage').style.display = 'block';
    }
}

function showConfirmShaming() {
    confirmshamingShown++;
    console.log('Confirmshaming modal shown. Count:', confirmshamingShown);
    
    // Show confirmshaming modal
    document.getElementById('confirmshamingModal').style.display = 'flex';
}

function closeConfirmShaming() {
    // Hide modal without changing
    document.getElementById('confirmshamingModal').style.display = 'none';
}

function actuallyChangeMind() {
    planChanges++;
    console.log('User actually changed mind. Total changes:', planChanges);
    
    // Hide modal
    document.getElementById('confirmshamingModal').style.display = 'none';
    
    // Hide confirmation
    document.getElementById('confirmationSection').style.display = 'none';
    
    // Show plan selection again
    document.getElementById('planSelection').style.display = 'block';
    
    // Scroll to top
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
        mode: 'overload',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        planChanges: planChanges,
        confirmshamingShown: confirmshamingShown,
        finalPlan: selectedPlan,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 3 Overload completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task3Modes = JSON.parse(sessionStorage.getItem('task3ModesCompleted') || '[]');
    if (!task3Modes.includes('overload')) {
        task3Modes.push('overload');
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
    if (mode === 'zen') {
        window.location.href = 'task3-zen.html';
    }
}