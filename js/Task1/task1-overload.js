// Task 1 Overload Mode JavaScript

let taskStartTime;
let clickCount = 0;
let distractionClicks = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 1 Overload Mode loaded');
    
    // Record when user started this mode
    taskStartTime = new Date();
    
    // Show annoying popup after 3 seconds
    setTimeout(() => {
        showAnnoyingPopup();
    }, 3000);
    
    // Track interactions
    trackInteractions();
});

function trackInteractions() {
    // Track all clicks
    document.addEventListener('click', (e) => {
        clickCount++;
        
        // Check if user clicked on a distraction
        if (e.target.closest('.flash-banner, .ad-banner, .fake-alert, .fake-notification, .flash-alert, .trending-banner')) {
            distractionClicks++;
            console.log('Distraction clicked!');
        }
        
        // Log click data
        const clickData = {
            timestamp: new Date().toISOString(),
            element: e.target.tagName,
            className: e.target.className,
            clickNumber: clickCount,
            wasDistraction: e.target.closest('.flash-banner, .ad-banner, .fake-alert, .fake-notification, .flash-alert, .trending-banner') !== null
        };
        
        console.log('Click tracked:', clickData);
    });
    
    // Track when user clicks the actual important notification
    const importantNotif = document.getElementById('importantNotification');
    if (importantNotif) {
        importantNotif.addEventListener('click', () => {
            completeTask();
        });
    }
}

function showAnnoyingPopup() {
    const popup = document.getElementById('annoyingPopup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function closePopup() {
    const popup = document.getElementById('annoyingPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

function completeTask() {
    const timeSpent = (new Date() - taskStartTime) / 1000; // in seconds
    
    // Store task completion data
    const taskData = {
        task: 'task1',
        mode: 'overload',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        distractionClicks: distractionClicks,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task completed:', taskData);
    
    // Save to session storage
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark this mode as completed
    const task1Modes = JSON.parse(sessionStorage.getItem('task1ModesCompleted') || '[]');
    if (!task1Modes.includes('overload')) {
        task1Modes.push('overload');
        sessionStorage.setItem('task1ModesCompleted', JSON.stringify(task1Modes));
    }
    
    // Check if both modes are completed
    checkIfBothModesCompleted();
}

function checkIfBothModesCompleted() {
    const completed = JSON.parse(sessionStorage.getItem('task1ModesCompleted') || '[]');
    
    if (completed.includes('overload') && completed.includes('zen')) {
        // Both modes completed - go to survey
        setTimeout(() => {
            window.location.href = 'task1-survey.html';
        }, 500);
    } else {
        // Return to mode selection to try the other mode
        setTimeout(() => {
            window.location.href = 'task1-selection.html';
        }, 500);
    }
}

function switchMode(mode) {
    if (mode === 'zen') {
        window.location.href = 'task1-zen.html';
    }
}

// Make popup buttons work
window.onclick = function(event) {
    const popup = document.getElementById('annoyingPopup');
    if (event.target === popup) {
        closePopup();
    }
}