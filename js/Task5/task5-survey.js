// Task 5 Survey JavaScript - FINAL TASK!

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task 5 Survey (FINAL) loaded');
    
    // Verify both modes completed
    const completed = JSON.parse(sessionStorage.getItem('task5ModesCompleted') || '[]');
    if (!completed.includes('overload') || !completed.includes('zen')) {
        console.warn('Both modes not completed. Redirecting...');
        window.location.href = 'task5-selection.html';
        return;
    }
    
    const form = document.getElementById('surveyForm');
    form.addEventListener('submit', handleSubmit);
});

function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const surveyData = {
        task: 'task5',
        participantId: sessionStorage.getItem('participantId'),
        timestamp: new Date().toISOString(),
        responses: {
            focus: formData.get('q1_focus'),
            overloadDistraction: parseInt(formData.get('q2_overload_distraction')),
            zenDistraction: parseInt(formData.get('q2_zen_distraction')),
            effectiveness: formData.get('q3_effectiveness'),
            comments: formData.get('q4_comments') || ''
        }
    };
    
    console.log('Task 5 Survey data:', surveyData);
    
    // Save survey response
    const allSurveys = JSON.parse(sessionStorage.getItem('surveyResponses') || '[]');
    allSurveys.push(surveyData);
    sessionStorage.setItem('surveyResponses', JSON.stringify(allSurveys));
    
    // Mark Task 5 complete
    const tasksCompleted = JSON.parse(sessionStorage.getItem('tasksCompleted') || '[]');
    if (!tasksCompleted.includes('task5')) {
        tasksCompleted.push('task5');
        sessionStorage.setItem('tasksCompleted', JSON.stringify(tasksCompleted));
    }
    
    // Clear task5 specific data
    sessionStorage.removeItem('task5ModesCompleted');
    sessionStorage.removeItem('task5FirstMode');
    
    // Mark study as complete
    sessionStorage.setItem('studyComplete', 'true');
    sessionStorage.setItem('studyCompletedAt', new Date().toISOString());
    
    // Navigate to completion page
    setTimeout(() => {
        console.log('=== STUDY COMPLETE ===');
        console.log('All tasks completed:', tasksCompleted);
        console.log('Total surveys:', allSurveys.length);
        console.log('Participant ID:', sessionStorage.getItem('participantId'));
        
        // Navigate to completion page with data export
        alert('🎉 Congratulations! You\'ve completed all 5 tasks!\n\nThank you for your participation.');
        
        // For now, show completion message
        // You can create a completion.html page next
        // window.location.href = '../completion.html';
        
        // Or show data summary
        showDataSummary();
    }, 500);
}

function showDataSummary() {
    const completedTasks = JSON.parse(sessionStorage.getItem('completedTasks') || '[]');
    const surveys = JSON.parse(sessionStorage.getItem('surveyResponses') || '[]');
    const participantId = sessionStorage.getItem('participantId');
    
    console.log('\n=== FINAL DATA SUMMARY ===');
    console.log('Participant ID:', participantId);
    console.log('Tasks Completed:', completedTasks.length);
    console.log('Surveys Completed:', surveys.length);
    console.log('\nAll Data:');
    console.log('Completed Tasks:', completedTasks);
    console.log('Survey Responses:', surveys);
    
    // You can add a download button here later
    alert(`Data Collection Complete!\n\nParticipant ID: ${participantId}\nTasks: ${completedTasks.length}\nSurveys: ${surveys.length}\n\nCheck console for full data.`);
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