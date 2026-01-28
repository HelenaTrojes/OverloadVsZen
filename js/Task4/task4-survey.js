// Task 4 Survey JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 4 Survey loaded');
    
    // Verify both modes completed
    const completed = JSON.parse(sessionStorage.getItem('task4ModesCompleted') || '[]');
    if (!completed.includes('overload') || !completed.includes('zen')) {
        console.warn('Both modes not completed. Redirecting...');
        window.location.href = 'task4-selection.html';
        return;
    }
    
    const form = document.getElementById('surveyForm');
    form.addEventListener('submit', handleSubmit);
});

function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const surveyData = {
        task: 'task4',
        participantId: sessionStorage.getItem('participantId'),
        timestamp: new Date().toISOString(),
        responses: {
            trust: formData.get('q1_trust'),
            overloadUrgency: parseInt(formData.get('q2_overload_urgency')),
            zenUrgency: parseInt(formData.get('q2_zen_urgency')),
            honesty: formData.get('q3_honesty'),
            comments: formData.get('q4_comments') || ''
        }
    };
    
    console.log('Task 4 Survey data:', surveyData);
    
    // Save survey response
    const allSurveys = JSON.parse(sessionStorage.getItem('surveyResponses') || '[]');
    allSurveys.push(surveyData);
    sessionStorage.setItem('surveyResponses', JSON.stringify(allSurveys));
    
    // Mark Task 4 complete
    const tasksCompleted = JSON.parse(sessionStorage.getItem('tasksCompleted') || '[]');
    if (!tasksCompleted.includes('task4')) {
        tasksCompleted.push('task4');
        sessionStorage.setItem('tasksCompleted', JSON.stringify(tasksCompleted));
    }
    
    // Clear task4 specific data
    sessionStorage.removeItem('task4ModesCompleted');
    sessionStorage.removeItem('task4FirstMode');
    
    // Navigate to Task 5 or completion
    setTimeout(() => {
        alert('Task 4 complete! One more task to go! 🎉');
        
        // Show progress
        console.log('=== PROGRESS ===');
        console.log('Tasks completed:', tasksCompleted);
        console.log('Total surveys:', allSurveys.length);
        
        // Next: Create Task 5 or go to completion
        // window.location.href = '../Task5/task5-selection.html';
        // or
        // window.location.href = '../completion.html';
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