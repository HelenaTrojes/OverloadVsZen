// Task 2 Mode Selection JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 2 selection page loaded');
    initializeTaskData();
});

function initializeTaskData() {
    if (!sessionStorage.getItem('task2ModesCompleted')) {
        sessionStorage.setItem('task2ModesCompleted', JSON.stringify([]));
    }
}

function selectMode(mode) {
    console.log(`Task 2 - Mode selected: ${mode}`);
    
    const firstMode = sessionStorage.getItem('task2FirstMode');
    if (!firstMode) {
        sessionStorage.setItem('task2FirstMode', mode);
    }
    
    const selectionData = {
        task: 'task2',
        mode: mode,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    const selections = JSON.parse(sessionStorage.getItem('modeSelections') || '[]');
    selections.push(selectionData);
    sessionStorage.setItem('modeSelections', JSON.stringify(selections));
    
    if (mode === 'overload') {
        window.location.href = 'task2-overload.html';
    } else {
        window.location.href = 'task2-zen.html';
    }
}