// Task 3 Mode Selection JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 3 selection page loaded');
    initializeTaskData();
});

function initializeTaskData() {
    if (!sessionStorage.getItem('task3ModesCompleted')) {
        sessionStorage.setItem('task3ModesCompleted', JSON.stringify([]));
    }
}

function selectMode(mode) {
    console.log(`Task 3 - Mode selected: ${mode}`);
    
    const firstMode = sessionStorage.getItem('task3FirstMode');
    if (!firstMode) {
        sessionStorage.setItem('task3FirstMode', mode);
    }
    
    const selectionData = {
        task: 'task3',
        mode: mode,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    const selections = JSON.parse(sessionStorage.getItem('modeSelections') || '[]');
    selections.push(selectionData);
    sessionStorage.setItem('modeSelections', JSON.stringify(selections));
    
    if (mode === 'overload') {
        window.location.href = 'task3-overload.html';
    } else {
        window.location.href = 'task3-zen.html';
    }
}