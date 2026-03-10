// Data Sender - Sends survey data to Google Sheets via Apps Script

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwC8yOOp3Z1qRI4HQJ-YvhkgHrdD1yD8BhxPg4LTWkmza0mZU6w-W_pnmjT8NbV63Ne9g/exec";

async function sendToGoogleSheets(surveyData) {
  const payload = JSON.stringify(surveyData);

  try {
    console.log("Sending data to Google Sheets...", surveyData);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
      const queued = navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);

      if (queued) {
        console.log("Data queued for Google Sheets via sendBeacon");
        return { success: true, method: "sendBeacon" };
      }
    }

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      body: payload,
    });

    console.log("Data sent to Google Sheets");
    return { success: true, method: "fetch" };
  } catch (error) {
    console.error("Error sending data:", error);
    saveLocalBackup(surveyData);
    return { success: false, error: error.message };
  }
}

function saveLocalBackup(data) {
  const backups = JSON.parse(localStorage.getItem("dataBackups") || "[]");
  backups.push({
    ...data,
    backupTimestamp: new Date().toISOString(),
  });
  localStorage.setItem("dataBackups", JSON.stringify(backups));
  console.log("Data backed up locally");
}

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

async function testConnection() {
  console.log("Testing connection to Google Sheets...");

  const testData = {
    participantId: `TEST-${Date.now()}`,
    timestamp: new Date().toISOString(),
    task: "test",
    version: "both",
    timeSpent: 0,
    clicks: 0,
    responses: {
      versionA_confidence: 5,
      versionB_confidence: 5,
      versionA_difficulty: 1,
      versionB_difficulty: 1,
      versionA_control: 5,
      versionB_control: 5,
      comments: "Connection test entry",
    },
  };

  const result = await sendToGoogleSheets(testData);

  if (result.success) {
    console.log("Connection test request sent. Check your Google Sheet.");
    alert("Connection test request sent. Check your Google Sheet.");
  } else {
    console.error("Connection test failed:", result.error);
    alert("Connection failed. Check console for details.");
  }
}
