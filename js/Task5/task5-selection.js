// Task 5 Mode Selection JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 5 selection page loaded');
    initializeTaskData();
});

function initializeTaskData() {
    if (!sessionStorage.getItem('task5ModesCompleted')) {
        sessionStorage.setItem('task5ModesCompleted', JSON.stringify([]));
    }
}

function selectMode(mode) {
    console.log(`Task 5 - Mode selected: ${mode}`);
    
    const firstMode = sessionStorage.getItem('task5FirstMode');
    if (!firstMode) {
        sessionStorage.setItem('task5FirstMode', mode);
    }
    
    const selectionData = {
        task: 'task5',
        mode: mode,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    const selections = JSON.parse(sessionStorage.getItem('modeSelections') || '[]');
    selections.push(selectionData);
    sessionStorage.setItem('modeSelections', JSON.stringify(selections));
    
    if (mode === 'overload') {
        window.location.href = 'task5-overload.html';
    } else {
        window.location.href = 'task5-zen.html';
    }
}