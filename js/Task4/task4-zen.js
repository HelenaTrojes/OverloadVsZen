// Task 4 Zen Mode JavaScript

let taskStartTime;
let clickCount = 0;
let selectedProduct = null;
let selectedPrice = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 4 Zen Mode loaded');
    taskStartTime = new Date();
    
    document.addEventListener('click', () => {
        clickCount++;
    });
});

function selectProduct(product, price) {
    selectedProduct = product;
    selectedPrice = price;
    
    console.log('Product selected:', product, 'Price:', price);
    
    completeTask();
}

function completeTask() {
    const timeSpent = (new Date() - taskStartTime) / 1000;
    
    const taskData = {
        task: 'task4',
        mode: 'zen',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        selectedProduct: selectedProduct,
        selectedPrice: selectedPrice,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 4 Zen completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task4Modes = JSON.parse(sessionStorage.getItem('task4ModesCompleted') || '[]');
    if (!task4Modes.includes('zen')) {
        task4Modes.push('zen');
        sessionStorage.setItem('task4ModesCompleted', JSON.stringify(task4Modes));
    }
    
    // Check if both modes completed
    setTimeout(() => {
        checkIfBothModesCompleted();
    }, 500);
}

function checkIfBothModesCompleted() {
    const completed = JSON.parse(sessionStorage.getItem('task4ModesCompleted') || '[]');
    
    if (completed.includes('overload') && completed.includes('zen')) {
        window.location.href = 'task4-survey.html';
    } else {
        window.location.href = 'task4-selection.html';
    }
}

function switchMode(mode) {
    if (mode === 'overload') {
        window.location.href = 'task4-overload.html';
    }
}