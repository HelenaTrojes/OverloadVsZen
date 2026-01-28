// Task 3 Survey JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 3 Survey loaded');
    
    // Verify both modes completed
    const completed = JSON.parse(sessionStorage.getItem('task3ModesCompleted') || '[]');
    if (!completed.includes('overload') || !completed.includes('zen')) {
        console.warn('Both modes not completed. Redirecting...');
        window.location.href = 'task3-selection.html';
        return;
    }
    
    const form = document.getElementById('surveyForm');
    form.addEventListener('submit', handleSubmit);
});

function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const surveyData = {
        task: 'task3',
        participantId: sessionStorage.getItem('participantId'),
        timestamp: new Date().toISOString(),
        responses: {
            freedom: formData.get('q1_freedom'),
            overloadPressure: parseInt(formData.get('q2_overload_pressure')),
            zenPressure: parseInt(formData.get('q2_zen_pressure')),
            respect: formData.get('q3_respect'),
            comments: formData.get('q4_comments') || ''
        }
    };
    
    console.log('Task 3 Survey data:', surveyData);
    
    // Save survey response
    const allSurveys = JSON.parse(sessionStorage.getItem('surveyResponses') || '[]');
    allSurveys.push(surveyData);
    sessionStorage.setItem('surveyResponses', JSON.stringify(allSurveys));
    
    // Mark Task 3 complete
    const tasksCompleted = JSON.parse(sessionStorage.getItem('tasksCompleted') || '[]');
    if (!tasksCompleted.includes('task3')) {
        tasksCompleted.push('task3');
        sessionStorage.setItem('tasksCompleted', JSON.stringify(tasksCompleted));
    }
    
    // Clear task3 specific data
    sessionStorage.removeItem('task3ModesCompleted');
    sessionStorage.removeItem('task3FirstMode');
    
    // Navigate to Task 4
    setTimeout(() => {
        window.location.href = '../Task4/task4-selection.html';
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