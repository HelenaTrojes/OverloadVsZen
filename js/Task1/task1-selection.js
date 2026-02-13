// Task 1 Mode Selection JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 1 selection page loaded');
    
    // Initialize task data
    initializeTaskData();
});

function initializeTaskData() {
    // Check if this is the first task
    if (!sessionStorage.getItem('tasksCompleted')) {
        sessionStorage.setItem('tasksCompleted', JSON.stringify([]));
    }
    
    // Track which modes have been tried for Task 1
    if (!sessionStorage.getItem('task1ModesCompleted')) {
        sessionStorage.setItem('task1ModesCompleted', JSON.stringify([]));
    }
}

function selectMode(mode) {
    console.log(`Mode selected: ${mode}`);
    
    // Track first mode selection
    const firstMode = sessionStorage.getItem('task1FirstMode');
    if (!firstMode) {
        sessionStorage.setItem('task1FirstMode', mode);
    }
    
    // Store selection timestamp
    const selectionData = {
        task: 'task1',
        mode: mode,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    // Save to session storage
    const selections = JSON.parse(sessionStorage.getItem('modeSelections') || '[]');
    selections.push(selectionData);
    sessionStorage.setItem('modeSelections', JSON.stringify(selections));
    
    // Navigate to the selected mode
    if (mode === 'overload') {
        window.location.href = 'task1-overload.html';
    } else {
        window.location.href = 'task1-zen.html';
    }
}

// Check if user has completed both modes
function checkBothModesCompleted() {
    const completed = JSON.parse(sessionStorage.getItem('task1ModesCompleted') || '[]');
    return completed.includes('overload') && completed.includes('zen');
}