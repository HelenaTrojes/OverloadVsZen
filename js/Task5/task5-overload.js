// Task 5 Overload Mode JavaScript

let taskStartTime;
let clickCount = 0;
let selectedAnswer = null;
let interruptionCount = 0;
let pressureTime = 90; // 1:30 minutes

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 5 Overload Mode loaded');
    taskStartTime = new Date();
    
    // Start pressure timer countdown
    startPressureTimer();
    
    // Show video popup after 3 seconds
    setTimeout(showVideoPopup, 3000);
    
    // Show interruption popup after 8 seconds
    setTimeout(showInterruption, 8000);
    
    // Track answer selection
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedAnswer = e.target.value;
            console.log('Answer selected:', selectedAnswer);
        });
    });
    
    document.addEventListener('click', () => {
        clickCount++;
    });
});

function startPressureTimer() {
    setInterval(() => {
        pressureTime--;
        if (pressureTime < 0) pressureTime = 90; // Reset
        
        const minutes = Math.floor(pressureTime / 60);
        const seconds = pressureTime % 60;
        document.getElementById('pressureTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function showVideoPopup() {
    document.getElementById('videoPopup').style.display = 'block';
}

function closeVideo() {
    document.getElementById('videoPopup').style.display = 'none';
    
    // Show it again after 10 seconds
    setTimeout(showVideoPopup, 10000);
}

function showInterruption() {
    interruptionCount++;
    document.getElementById('interruptionPopup').style.display = 'flex';
}

function closeInterruption() {
    document.getElementById('interruptionPopup').style.display = 'none';
    
    // Show interruption again randomly
    setTimeout(showInterruption, Math.random() * 15000 + 10000);
}

function submitAnswer() {
    if (!selectedAnswer) {
        alert('Please select an answer before submitting.');
        return;
    }
    
    const correctAnswer = 'B';
    const isCorrect = selectedAnswer === correctAnswer;
    
    console.log('Answer submitted:', selectedAnswer, 'Correct:', isCorrect);
    
    completeTask(isCorrect);
}

function completeTask(isCorrect) {
    const timeSpent = (new Date() - taskStartTime) / 1000;
    
    const taskData = {
        task: 'task5',
        mode: 'overload',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        interruptionCount: interruptionCount,
        selectedAnswer: selectedAnswer,
        correctAnswer: isCorrect,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 5 Overload completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task5Modes = JSON.parse(sessionStorage.getItem('task5ModesCompleted') || '[]');
    if (!task5Modes.includes('overload')) {
        task5Modes.push('overload');
        sessionStorage.setItem('task5ModesCompleted', JSON.stringify(task5Modes));
    }
    
    // Check if both modes completed
    setTimeout(() => {
        checkIfBothModesCompleted();
    }, 500);
}

function checkIfBothModesCompleted() {
    const completed = JSON.parse(sessionStorage.getItem('task5ModesCompleted') || '[]');
    
    if (completed.includes('overload') && completed.includes('zen')) {
        window.location.href = 'task5-survey.html';
    } else {
        window.location.href = 'task5-selection.html';
    }
}

function switchMode(mode) {
    if (mode === 'zen') {
        window.location.href = 'task5-zen.html';
    }
}