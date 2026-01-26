// Introduction Page JavaScript

// Timer configuration
let timeRemaining = 180; // 3 minutes in seconds
let timerInterval;
const circumference = 2 * Math.PI * 80; // Circle circumference

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Introduction page loaded');
    logPageView('introduction');
    
    // Set initial circle state
    const progressCircle = document.getElementById('progressCircle');
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = 0;
    
    // Start the countdown timer
    startTimer();
});

// Timer function
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        updateProgressCircle();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            // Auto-proceed to next page (or show a button)
            setTimeout(() => {
                proceedToNextPage();
            }, 1000);
        }
    }, 1000);
}

// Update timer text display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerText = document.getElementById('timerText');
    timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update circular progress indicator
function updateProgressCircle() {
    const progressCircle = document.getElementById('progressCircle');
    const progress = timeRemaining / 180; // 180 = initial time
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

// Proceed to next page (Task 1 selection)
function proceedToNextPage() {
    // Store that intro is complete
    sessionStorage.setItem('introComplete', 'true');
    sessionStorage.setItem('introCompletedAt', new Date().toISOString());
    
    // Navigate to Task 1 mode selection
    window.location.href = 'Task1/task1-selection.html';
}

// Helper function to log page views
function logPageView(pageName) {
    const pageData = {
        page: pageName,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId') || 'unknown'
    };
    
    const pageViews = JSON.parse(sessionStorage.getItem('pageViews') || '[]');
    pageViews.push(pageData);
    sessionStorage.setItem('pageViews', JSON.stringify(pageViews));
}

// Optional: Allow skip for testing purposes (remove in production)
document.addEventListener('keydown', (e) => {
    // Press 'S' key to skip timer (for development)
    if (e.key === 's' || e.key === 'S') {
        console.log('Timer skipped');
        clearInterval(timerInterval);
        timeRemaining = 0;
        proceedToNextPage();
    }
});