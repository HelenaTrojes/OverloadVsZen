// Task 5 Zen Mode JavaScript

let taskStartTime;
let clickCount = 0;
let selectedAnswer = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 5 Zen Mode loaded');
    taskStartTime = new Date();
    
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

function submitAnswer() {
    if (!selectedAnswer) {
        alert('Please select an answer before submitting.');
        return;
    }
    
    const correctAnswer = 'B'; // "Design for humans, not metrics"
    const isCorrect = selectedAnswer === correctAnswer;
    
    console.log('Answer submitted:', selectedAnswer, 'Correct:', isCorrect);
    
    completeTask(isCorrect);
}

function completeTask(isCorrect) {
    const timeSpent = (new Date() - taskStartTime) / 1000;
    
    const taskData = {
        task: 'task5',
        mode: 'zen',
        completed: true,
        timeSpent: timeSpent,
        clicks: clickCount,
        selectedAnswer: selectedAnswer,
        correctAnswer: isCorrect,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId')
    };
    
    console.log('Task 5 Zen completed:', taskData);
    
    // Save task data
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    completedTasks.push(taskData);
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    
    // Mark mode as completed
    const task5Modes = JSON.parse(sessionStorage.getItem('task5ModesCompleted') || '[]');
    if (!task5Modes.includes('zen')) {
        task5Modes.push('zen');
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
    if (mode === 'overload') {
        window.location.href = 'task5-overload.html';
    }
}