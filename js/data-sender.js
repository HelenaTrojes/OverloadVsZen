// ============================================================
// data-sender.js
// Sends study payload to Google Apps Script (two-sheet architecture)
//
// Payload structure expected by Code.gs:
//   {
//     participantId:  string,
//     conditionOrder: string,   "overload_first" | "zen_first"
//     isTestEntry:    boolean,  true → routed to Tests sheet only
//     task:           string,   "task1" … "task5" | "all_tasks"
//     behavioral:     object,   → written to Behavioral_Data sheet
//     survey:         object    → written to Survey_Responses sheet
//   }
//
// CORS note: Apps Script does not return CORS headers, so all
// requests use mode: "no-cors". This means we never receive a
// response body — fire-and-forget. Failures are caught by the
// try/catch and saved to localStorage as a local backup.
//
// NO LOGIC CHANGES in this file — only the test payload below
// has been updated to reflect the current schema (no _clicks,
// firstClickTime added) so test entries stay consistent.
// ============================================================

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby--KKuzcP5KYwMO83t3KOIKDxPLXhFcztMaOc2LIc_nb9d8kQh531PgLYSqnV7fDKxTg/exec";

// ── Main send function ────────────────────────────────────────

async function sendToGoogleSheets(payload) {
  const body = JSON.stringify(payload);

  try {
    console.log("Sending to Google Sheets...", payload);
    console.log("POST body:", body);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    console.log("Data sent via fetch");
    return { success: true, method: "fetch" };
  } catch (error) {
    console.error("Send failed — saving local backup:", error);
    saveLocalBackup(payload);
    return { success: false, error: error.message };
  }
}

// ── Local backup (localStorage, survives page refresh) ────────
// Used as a safety net when the Apps Script request fails.
// Participants can download backups from the completion page.

function saveLocalBackup(data) {
  try {
    const backups = JSON.parse(localStorage.getItem("dataBackups") || "[]");
    backups.push({ ...data, backupTimestamp: new Date().toISOString() });
    localStorage.setItem("dataBackups", JSON.stringify(backups));
    console.log("Local backup saved");
  } catch (err) {
    console.error("Local backup also failed:", err);
  }
}

function downloadBackups() {
  const backups = JSON.parse(localStorage.getItem("dataBackups") || "[]");

  if (backups.length === 0) {
    alert("No backup data found in local storage.");
    return;
  }

  const blob = new Blob([JSON.stringify(backups, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `backup-data-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Test connection ───────────────────────────────────────────
// Sends a minimal payload with isTestEntry: true so Code.gs
// routes it to the Tests sheet and never touches real data.
// Behavioral fields here reflect the current schema so test
// entries in the Tests sheet look realistic.

async function testConnection() {
  console.log("Testing connection to Google Sheets...");

  const testPayload = {
    participantId: `TEST-${Date.now()}`,
    conditionOrder: "overload_first",
    isTestEntry: true,
    task: "test",
    behavioral: {
      t1_A_timeSpent: 0,
      t1_B_timeSpent: 0,
      t1_A_firstClickTime: 0,
      t1_B_firstClickTime: 0,
      t1_A_misclicks: 0,
      t1_B_misclicks: 0,
      t1_A_deceptionClicks: 0,
    },
    survey: { comment: "Connection test entry" },
  };

  const result = await sendToGoogleSheets(testPayload);

  if (result.success) {
    console.log("Test sent. Check the Tests tab in your Google Sheet.");
    alert(
      "Test sent successfully. Check the Tests tab in your Google Sheet — not the Behavioral_Data or Survey_Responses tabs.",
    );
  } else {
    console.error("Test failed:", result.error);
    alert("Connection failed. Check the browser console for details.");
  }
}
