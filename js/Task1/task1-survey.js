// Task 1 Survey JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 1 Survey loaded');
    
    // Check if user actually completed both modes
    const completed = JSON.parse(sessionStorage.getItem('task1ModesCompleted') || '[]');
    if (!completed.includes('overload') || !completed.includes('zen')) {
        // Redirect back to task selection if they haven't completed both
        console.warn('Both modes not completed. Redirecting...');
        window.location.href = 'task1-selection.html';
        return;
    }
    
    // Handle form submission
    const form = document.getElementById('surveyForm');
    form.addEventListener('submit', handleSubmit);
});

function handleSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const surveyData = {
        task: 'task1',
        participantId: sessionStorage.getItem('participantId'),
        timestamp: new Date().toISOString(),
        responses: {
            clarity: formData.get('q1_clarity'),
            overloadFeeling: parseInt(formData.get('q2_overload_feeling')),
            zenFeeling: parseInt(formData.get('q2_zen_feeling')),
            control: formData.get('q3_control'),
            comments: formData.get('q4_comments') || ''
        }
    };
    
    console.log('Survey data collected:', surveyData);
    
    // Save to session storage
    const allSurveys = JSON.parse(sessionStorage.getItem('surveyResponses') || '[]');
    allSurveys.push(surveyData);
    sessionStorage.setItem('surveyResponses', JSON.stringify(allSurveys));
    
    // Mark Task 1 as fully complete
    const tasksCompleted = JSON.parse(sessionStorage.getItem('tasksCompleted') || '[]');
    if (!tasksCompleted.includes('task1')) {
        tasksCompleted.push('task1');
        sessionStorage.setItem('tasksCompleted', JSON.stringify(tasksCompleted));
    }
    
    // Clear task1 specific data
    sessionStorage.removeItem('task1ModesCompleted');
    sessionStorage.removeItem('task1FirstMode');
    
    // Navigate to next task or completion page
    // For now, let's create a simple transition page
    setTimeout(() => {
        alert('Great! Task 1 complete. You can now proceed to Task 2.');
        // window.location.href = 'task2-selection.html';
        
        // For now, show collected data in console
        console.log('=== ALL COLLECTED DATA ===');
        console.log('Completed Tasks:', sessionStorage.getItem('completedTasks'));
        console.log('Survey Responses:', sessionStorage.getItem('surveyResponses'));
        console.log('Page Views:', sessionStorage.getItem('pageViews'));
    }, 500);
}

// Optional: Add validation feedback
document.querySelectorAll('input[required]').forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.preventDefault();
        e.target.closest('.question-block').style.animation = 'shake 0.5s';
        setTimeout(() => {
            e.target.closest('.question-block').style.animation = '';
        }, 500);
    });
});

// Add shake animation to CSS if needed
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);