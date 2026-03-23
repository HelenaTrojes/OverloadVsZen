// ============================================================
// data-sender.js
// Sends study payload to Google Apps Script (two-sheet architecture)
//
// Payload structure expected by Code.gs:
//   {
//     participantId:  string,
//     conditionOrder: string,   "overload_first" | "zen_first"
//     isTestEntry:    boolean,  true → routed to Tests sheet only
//     task:           string,   "task1" … "task5"
//     behavioral:     object,   → written to Behavioral_Data sheet
//     survey:         object    → written to Survey_Responses sheet
//   }
//
// CORS note: Apps Script does not return CORS headers, so all
// requests use mode: "no-cors". This means we never receive a
// response body — fire-and-forget. Failures are caught by the
// try/catch and saved to localStorage as a local backup.
// ============================================================

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyyEUlyiQbSei1cCfnY_qlXUAmw70WVh3yJK0Yn_ejBpepoyzkbs1lQwKl5MCpBGtGVXg/exec";

// ── Main send function ────────────────────────────────────────

async function sendToGoogleSheets(payload) {
  const body = JSON.stringify(payload);

  try {
    console.log("Sending to Google Sheets...", payload);

    // sendBeacon is preferred on page unload — it fires even if
    // the page navigates away before fetch completes.
    if (navigator.sendBeacon) {
      const blob   = new Blob([body], { type: "text/plain;charset=UTF-8" });
      const queued = navigator.sendBeacon(GOOGLE_SCRIPT_URL, blob);

      if (queued) {
        console.log("Data queued via sendBeacon");
        return { success: true, method: "sendBeacon" };
      }
    }

    // Fallback: fetch with no-cors + keepalive so the request
    // survives page transitions on GitHub Pages.
    await fetch(GOOGLE_SCRIPT_URL, {
      method:    "POST",
      mode:      "no-cors",
      keepalive: true,
      body:      body
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

  const blob = new Blob(
    [JSON.stringify(backups, null, 2)],
    { type: "application/json" }
  );
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href     = url;
  link.download = `backup-data-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Test connection ───────────────────────────────────────────
// Sends a minimal payload with isTestEntry: true so Code.gs
// routes it to the Tests sheet and never touches real data.

async function testConnection() {
  console.log("Testing connection to Google Sheets...");

  const testPayload = {
    participantId:  `TEST-${Date.now()}`,
    conditionOrder: "overload_first",
    isTestEntry:    true,           // ← routes to Tests sheet in Code.gs
    task:           "test",
    behavioral:     {},
    survey:         { comment: "Connection test entry" }
  };

  const result = await sendToGoogleSheets(testPayload);

  if (result.success) {
    console.log("Test sent. Check the Tests tab in your Google Sheet.");
    alert("Test sent successfully. Check the Tests tab in your Google Sheet — not the Behavioral_Data or Survey_Responses tabs.");
  } else {
    console.error("Test failed:", result.error);
    alert("Connection failed. Check the browser console for details.");
  }
}