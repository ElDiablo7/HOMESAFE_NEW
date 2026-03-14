// GRACE-X TradeLink™
// Prototype front-end: local job list + simple actions.
// No backend, no real network – just enough to demo the flow.

(function () {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel || "*"));

  let initialised = false;
  let selectedJobId = null;

  // Fake data: sample jobs in memory
  const jobs = [
    {
      id: "job-001",
      title: "Kitchen Rewire – Flat 3B",
      client: "Lewis / Flat 3B",
      location: "South London, SE15",
      budget: "£1,800",
      status: "Awaiting quote",
      tradeType: "Electrician",
      date: "Today",
      description:
        "Full kitchen rewire including new cooker feed, socket ring, and under-cabinet lighting. " +
        "Property is occupied. Access after 9am only."
    },
    {
      id: "job-002",
      title: "Loft Boarding & Hatch",
      client: "Martha & James",
      location: "Croydon, CR0",
      budget: "£1,200",
      status: "Site visit booked",
      tradeType: "Carpenter",
      date: "This week",
      description:
        "Board out loft for light storage, install new insulated hatch and ladder. " +
        "No structural changes, just flooring on existing joists where safe."
    },
    {
      id: "job-003",
      title: "Bathroom Extractor Upgrade",
      client: "Mr Singh",
      location: "Bromley, BR1",
      budget: "£450",
      status: "In discussion",
      tradeType: "Plumber / Electrician",
      date: "Flexible",
      description:
        "Replace noisy old extractor with quiet humidistat model, re-route ducting if needed, " +
        "make good any minor decoration around vent."
    }
  ];

  function logMessage(msg) {
    const logEl = $("#tl-log");
    if (!logEl) return;
    const now = new Date().toLocaleTimeString();
    const prefix = `[${now}] `;
    if (logEl.textContent.trim() === "No actions yet…") {
      logEl.textContent = prefix + msg;
    } else {
      logEl.textContent += "\n" + prefix + msg;
    }
  }

  function renderJobList() {
    const list = $("#tl-job-list");
    if (!list) return;

    list.innerHTML = "";

    if (!jobs.length) {
      list.innerHTML = `<p>No jobs available.</p>`;
      return;
    }

    jobs.forEach(job => {
      const btn = document.createElement("button");
      btn.className = "builder-btn tl-job-item";
      btn.type = "button";
      btn.dataset.jobId = job.id;
      btn.innerHTML = `
        <div class="tl-job-title">${job.title}</div>
        <div class="tl-job-sub">
          <span>${job.tradeType}</span> • 
          <span>${job.location}</span> • 
          <span>${job.status}</span>
        </div>
      `;
      btn.addEventListener("click", () => selectJob(job.id));
      list.appendChild(btn);
    });
  }

  function selectJob(id) {
    selectedJobId = id;
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    const titleEl = $("#tl-detail-title");
    const metaEl  = $("#tl-detail-meta");
    const bodyEl  = $("#tl-detail-body");
    const statusEl= $("#tl-detail-status");

    if (titleEl) titleEl.textContent = job.title;
    if (metaEl) {
      metaEl.textContent = `${job.client} • ${job.location} • Budget ${job.budget} • ${job.tradeType} • ${job.date}`;
    }
    if (bodyEl) bodyEl.textContent = job.description;
    if (statusEl) statusEl.textContent = `Status: ${job.status}`;

    // Highlight selected button
    const list = $("#tl-job-list");
    if (list) {
      $$(".tl-job-item", list).forEach(btn => {
        if (btn.dataset.jobId === id) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    logMessage(`Selected job: ${job.title}`);
  }

  function updateJobStatus(id, newStatus) {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    job.status = newStatus;

    // If this job is currently shown, update the detail status text
    const statusEl= $("#tl-detail-status");
    if (statusEl && selectedJobId === id) {
      statusEl.textContent = `Status: ${job.status}`;
    }

    // Refresh list text so the status badge updates
    renderJobList();
  }

  function initTradeLink() {
    if (initialised) return;

    const container = document.querySelector(".tradelink-container");
    if (!container) return; // not on this module

    initialised = true;

    renderJobList();

    const btnRequest  = $("#tl-btn-request");
    const btnAssign   = $("#tl-btn-assign");
    const btnComplete = $("#tl-btn-complete");

    if (btnRequest) {
      btnRequest.addEventListener("click", () => {
        if (!selectedJobId) {
          logMessage("Tried to request quote, but no job is selected.");
          if (window.GRACEX_Utils) {
            GRACEX_Utils.showToast("Please select a job first", "error");
          }
          return;
        }
        const job = jobs.find(j => j.id === selectedJobId);
        logMessage(`Quote requested for "${job.title}". (Prototype – no real messages sent.)`);
        updateJobStatus(selectedJobId, "Quote requested");
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Quote requested", "success");
        }
      });
    }

    if (btnAssign) {
      btnAssign.addEventListener("click", () => {
        if (!selectedJobId) {
          logMessage("Tried to assign trade, but no job is selected.");
          return;
        }
        const job = jobs.find(j => j.id === selectedJobId);
        logMessage(`Trade assigned to "${job.tradeType}" for "${job.title}". (Prototype only.)`);
        updateJobStatus(selectedJobId, "Trade assigned");
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Trade assigned", "success");
        }
      });
    }

    if (btnComplete) {
      btnComplete.addEventListener("click", () => {
        if (!selectedJobId) {
          logMessage("Tried to mark completed, but no job is selected.");
          if (window.GRACEX_Utils) {
            GRACEX_Utils.showToast("Please select a job first", "error");
          }
          return;
        }
        const job = jobs.find(j => j.id === selectedJobId);
        logMessage(`Job marked as completed: "${job.title}".`);
        updateJobStatus(selectedJobId, "Completed");
        if (window.GRACEX_Utils) {
          GRACEX_Utils.showToast("Job marked as completed", "success");
        }
      });
    }

    // GRACEX TradeLink V5 Brain Wiring
    function initTradeLinkBrain() {
      // Use the centralized brainV5Helper if available
      if (window.setupModuleBrain) {
        window.setupModuleBrain("tradelink", {
          panelId: "tradelink-brain-panel",
          inputId: "tradelink-brain-input",
          sendId: "tradelink-brain-send",
          outputId: "tradelink-brain-output",
          clearId: "tradelink-brain-clear",
          initialMessage: "I'm the TradeLink brain. Ask about jobs, quotes, or which trade you need.",
        });
      }
    }

    // Initialize brain when module loads
    setTimeout(initTradeLinkBrain, 50);
  }

  // When opened directly (modules/tradelink.html in browser)
  if (document.currentScript && document.currentScript.src.indexOf("tradelink.js") !== -1) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initTradeLink);
    } else {
      initTradeLink();
    }
  }

  // When loaded dynamically via Core, core.js just injects the script
  // after the HTML is in #content, so readyState will already be "complete"
  // and the block above will run initTradeLink straight away.
})();