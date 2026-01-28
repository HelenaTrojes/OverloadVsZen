// Task 4 Overload Mode JavaScript

let taskStartTime;
let clickCount = 0;
let selectedProduct = null;
let selectedPrice = 0;
let viewerCount = 127;
let countdown = 167; // 2:47 in seconds

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 4 Overload Mode loaded');
    taskStartTime = new Date();
    
    // Start fake viewer counter
    startViewerCounter();
    
    // Start countdown timer
    startCountdown();
    
    // Show fake stock alerts
    setTimeout(showStockAlert, 3000);
    
    document.addEventListener('click', () => {
        clickCount++;
    });
});

function startViewerCounter() {
    setInterval(() => {
        // Random fluctuation in viewers
        const change = Math.floor(Math.random() * 10) - 5;
        viewerCount = Math.max(100, Math.min(200, viewerCount + change));
        document.getElementById('viewerCount').textContent = viewerCount;
    }, 2000);
}

function startCountdown() {
    setInterval(() => {
        countdown--;
        if (countdown < 0) countdown = 180; // Reset to 3 minutes
        
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        document.getElementById('countdown').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function showStockAlert() {
    const alert = document.getElementById('stockAlert');
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
    
    // Show again randomly
    setTimeout(showStockAlert, Math.random() * 10000 + 5000);
}

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
        mode: 'overload',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        selectedProduct: selectedProduct,
        selectedPrice: selectedPrice,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 4 Overload completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task4Modes = JSON.parse(sessionStorage.getItem('task4ModesCompleted') || '[]');
    if (!task4Modes.includes('overload')) {
        task4Modes.push('overload');
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
    if (mode === 'zen') {
        window.location.href = 'task4-zen.html';
    }
}