// Data Sender - Sends data to Google Sheets via Apps Script

// REPLACE THIS with your actual Google Apps Script URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwC8yOOp3Z1qRI4HQJ-YvhkgHrdD1yD8BhxPg4LTWkmza0mZU6w-W_pnmjT8NbV63Ne9g/exec";

// Send survey data to Google Sheets
async function sendToGoogleSheets(surveyData) {
  try {
    console.log("Sending data to Google Sheets...", surveyData);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Important! Allows cross-origin
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(surveyData),
    });

    console.log("✅ Data sent successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending data:", error);

    // Still save locally as backup
    saveLocalBackup(surveyData);
    return { success: false, error: error.message };
  }
}

// Save backup locally in case Google Sheets fails
function saveLocalBackup(data) {
  const backups = JSON.parse(localStorage.getItem("dataBackups") || "[]");
  backups.push({
    ...data,
    backupTimestamp: new Date().toISOString(),
  });
  localStorage.setItem("dataBackups", JSON.stringify(backups));
  console.log("💾 Data backed up locally");
}

// Export local backups if needed
function downloadBackups() {
  const backups = JSON.parse(localStorage.getItem("dataBackups") || "[]");
  if (backups.length === 0) {
    alert("No backup data found");
    return;
  }

  const dataStr = JSON.stringify(backups, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-data-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

// Test connection to Google Sheets
async function testConnection() {
  console.log("Testing connection to Google Sheets...");

  const testData = {
    participantId: "TEST-" + Date.now(),
    timestamp: new Date().toISOString(),
    task: "test",
    version: "test",
    timeSpent: 0,
    clicks: 0,
    responses: {
      versionA_confidence: 5,
      versionB_confidence: 5,
      versionA_difficulty: 1,
      versionB_difficulty: 1,
      versionA_control: 5,
      versionB_control: 5,
      comments: "This is a test entry",
    },
  };

  const result = await sendToGoogleSheets(testData);

  if (result.success) {
    console.log("✅ Connection test successful! Check your Google Sheet.");
    alert(
      "✅ Connection successful! Check your Google Sheet for a test entry.",
    );
  } else {
    console.error("❌ Connection test failed:", result.error);
    alert("❌ Connection failed. Check console for details.");
  }
}
