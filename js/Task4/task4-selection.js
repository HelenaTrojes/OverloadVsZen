// Task 4 Mode Selection JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 4 selection page loaded');
    initializeTaskData();
});

function initializeTaskData() {
    if (!sessionStorage.getItem('task4ModesCompleted')) {
        sessionStorage.setItem('task4ModesCompleted', JSON.stringify([]));
    }
}

function selectMode(mode) {
    console.log(`Task 4 - Mode selected: ${mode}`);
    
    const firstMode = sessionStorage.getItem('task4FirstMode');
    if (!firstMode) {
        sessionStorage.setItem('task4FirstMode', mode);
    }
    
    const selectionData = {
        task: 'task4',
        mode: mode,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    const selections = JSON.parse(sessionStorage.getItem('modeSelections') || '[]');
    selections.push(selectionData);
    sessionStorage.setItem('modeSelections', JSON.stringify(selections));
    
    if (mode === 'overload') {
        window.location.href = 'task4-overload.html';
    } else {
        window.location.href = 'task4-zen.html';
    }
}