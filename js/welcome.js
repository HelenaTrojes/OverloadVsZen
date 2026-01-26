// Welcome Page JavaScript

// Track when user starts the experience
function startExperience() {
    // Record start time
    const startTime = new Date().toISOString();
    
    // Store in session storage for data collection
    sessionStorage.setItem('experienceStartTime', startTime);
    sessionStorage.setItem('participantId', generateParticipantId());
    
    // Navigate to introduction page
    window.location.href = 'intro.html';
}

// Generate a unique participant ID
function generateParticipantId() {
    return 'P' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Add smooth entrance animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome page loaded');
    
    // Track page view for analytics
    logPageView('welcome');
});

// Helper function to log page views (for your thesis data collection)
function logPageView(pageName) {
    const pageData = {
        page: pageName,
        timestamp: new Date().toISOString(),
        participantId: sessionStorage.getItem('participantId') || 'unknown'
    };
    
    // Store in session storage
    const pageViews = JSON.parse(sessionStorage.getItem('pageViews') || '[]');
    pageViews.push(pageData);
    sessionStorage.setItem('pageViews', JSON.stringify(pageViews));
    
    console.log('Page view logged:', pageData);
}