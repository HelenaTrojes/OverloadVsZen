// Task 2 Survey JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 2 Survey loaded');
    
    // Verify both modes completed
    const completed = JSON.parse(sessionStorage.getItem('task2ModesCompleted') || '[]');
    if (!completed.includes('overload') || !completed.includes('zen')) {
        console.warn('Both modes not completed. Redirecting...');
        window.location.href = 'task2-selection.html';
        return;
    }
    
    const form = document.getElementById('surveyForm');
    form.addEventListener('submit', handleSubmit);
});

function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const surveyData = {
        task: 'task2',
        participantId: sessionStorage.getItem('participantId'),
        timestamp: new Date().toISOString(),
        responses: {
            ease: formData.get('q1_ease'),
            overloadConfidence: parseInt(formData.get('q2_overload_confidence')),
            zenConfidence: parseInt(formData.get('q2_zen_confidence')),
            frustration: formData.get('q3_frustration'),
            comments: formData.get('q4_comments') || ''
        }
    };
    
    console.log('Task 2 Survey data:', surveyData);
    
    // Save survey response
    const allSurveys = JSON.parse(sessionStorage.getItem('surveyResponses') || '[]');
    allSurveys.push(surveyData);
    sessionStorage.setItem('surveyResponses', JSON.stringify(allSurveys));
    
    // Mark Task 2 complete
    const tasksCompleted = JSON.parse(sessionStorage.getItem('tasksCompleted') || '[]');
    if (!tasksCompleted.includes('task2')) {
        tasksCompleted.push('task2');
        sessionStorage.setItem('tasksCompleted', JSON.stringify(tasksCompleted));
    }
    
    // Clear task2 specific data
    sessionStorage.removeItem('task2ModesCompleted');
    sessionStorage.removeItem('task2FirstMode');
    
    // Navigate to next task
    setTimeout(() => {
        alert('Task 2 complete! Ready for Task 3?');
        // window.location.href = 'task3-selection.html';
        
        // For now, show progress
        console.log('=== PROGRESS ===');
        console.log('Tasks completed:', tasksCompleted);
        console.log('Survey responses:', allSurveys.length);
    }, 500);
}

// Add validation shake
document.querySelectorAll('input[required]').forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.preventDefault();
        e.target.closest('.question-block').style.animation = 'shake 0.5s';
        setTimeout(() => {
            e.target.closest('.question-block').style.animation = '';
        }, 500);
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);