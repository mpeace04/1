function getJobs() {
  return JSON.parse(localStorage.getItem("op_jobs") || "[]");
}

function saveJobs(jobs) {
  localStorage.setItem("op_jobs", JSON.stringify(jobs));
}

function getQuotes() {
  return JSON.parse(localStorage.getItem("op_quotes") || "[]");
}

function saveQuotes(quotes) {
  localStorage.setItem("op_quotes", JSON.stringify(quotes));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const quote = Object.fromEntries(new FormData(form).entries());
    quote.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    quote.createdAt = new Date().toLocaleString();

    const quotes = getQuotes();
    quotes.unshift(quote);
    saveQuotes(quotes);

    document.getElementById("quoteMessage").textContent =
      "Thank you. Your request has been saved and the team will contact you.";
    form.reset();
  });
}

function setupAdminJobForm() {
  const form = document.getElementById("jobForm");
  if (!form) return;

  const message = document.getElementById("jobMessage");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const job = Object.fromEntries(new FormData(form).entries());
    job.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    job.createdAt = new Date().toLocaleString();
    job.technicianNotes = "";
    job.signature = "";
    job.completedAt = "";

    const jobs = getJobs();
    jobs.unshift(job);
    saveJobs(jobs);

    form.reset();
    message.textContent = "Job saved and assigned successfully.";
    renderAdminJobs();
    renderDashboardStats();
  });
}

function renderDashboardStats() {
  const jobs = getJobs();
  const total = document.getElementById("totalJobs");
  const scheduled = document.getElementById("scheduledJobs");
  const completed = document.getElementById("completedJobs");

  if (total) total.textContent = jobs.length;
  if (scheduled) scheduled.textContent = jobs.filter((job) => job.status === "Scheduled").length;
  if (completed) completed.textContent = jobs.filter((job) => job.status === "Completed").length;
}

function jobCard(job, options = {}) {
  const signature = job.signature
    ? `<img class="signature-img" src="${job.signature}" alt="Client signature">`
    : "";

  const adminActions = options.admin
    ? `<div class="job-actions">
        <button class="btn btn-small btn-ghost" data-admin-edit="${job.id}">Quick Status Update</button>
        <button class="btn btn-small btn-danger" data-delete-job="${job.id}">Delete</button>
      </div>`
    : "";

  return `
    <article class="job-card">
      <h3>${escapeHtml(job.clientName)}</h3>
      <span class="status-pill">${escapeHtml(job.status)}</span>
      <div class="job-meta">
        <span><strong>Service:</strong> ${escapeHtml(job.serviceType)}</span>
        <span><strong>Date:</strong> ${escapeHtml(job.jobDate)}</span>
        <span><strong>Contact:</strong> ${escapeHtml(job.contactNumber)}</span>
        <span><strong>Address:</strong> ${escapeHtml(job.address)}</span>
        <span><strong>Assigned To:</strong> ${escapeHtml(job.assignedTo)}</span>
        <span><strong>Admin Instructions:</strong> ${escapeHtml(job.notes || "No instructions")}</span>
        <span><strong>Technician Notes:</strong> ${escapeHtml(job.technicianNotes || "No technician notes yet")}</span>
        ${job.completedAt ? `<span><strong>Completed At:</strong> ${escapeHtml(job.completedAt)}</span>` : ""}
      </div>
      ${signature}
      ${adminActions}
    </article>
  `;
}

function renderAdminJobs() {
  const list = document.getElementById("adminJobsList");
  if (!list) return;

  const jobs = getJobs();

  if (!jobs.length) {
    list.innerHTML = `<p class="form-message">No jobs created yet.</p>`;
    return;
  }

  list.innerHTML = jobs.map((job) => jobCard(job, { admin: true })).join("");

  list.querySelectorAll("[data-delete-job]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteJob;
      if (!confirm("Delete this job?")) return;
      saveJobs(getJobs().filter((job) => job.id !== id));
      renderAdminJobs();
      renderDashboardStats();
    });
  });

  list.querySelectorAll("[data-admin-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.adminEdit;
      const nextStatus = prompt("Enter new status: Scheduled, In Progress, Completed, Follow-up Needed");
      if (!nextStatus) return;

      const jobs = getJobs().map((job) => {
        if (job.id === id) {
          job.status = nextStatus;
          if (nextStatus === "Completed" && !job.completedAt) {
            job.completedAt = new Date().toLocaleString();
          }
        }
        return job;
      });

      saveJobs(jobs);
      renderAdminJobs();
      renderDashboardStats();
    });
  });
}

function renderQuotes() {
  const list = document.getElementById("quotesList");
  if (!list) return;

  const quotes = getQuotes();

  if (!quotes.length) {
    list.innerHTML = `<p class="form-message">No website quote requests yet.</p>`;
    return;
  }

  list.innerHTML = quotes.map((quote) => `
    <article class="job-card">
      <h3>${escapeHtml(quote.name)}</h3>
      <div class="job-meta">
        <span><strong>Phone:</strong> ${escapeHtml(quote.phone)}</span>
        <span><strong>Service:</strong> ${escapeHtml(quote.service)}</span>
        <span><strong>Message:</strong> ${escapeHtml(quote.message || "No message")}</span>
        <span><strong>Submitted:</strong> ${escapeHtml(quote.createdAt)}</span>
      </div>
    </article>
  `).join("");

  const clearQuotesBtn = document.getElementById("clearQuotesBtn");
  if (clearQuotesBtn) {
    clearQuotesBtn.onclick = () => {
      if (!confirm("Clear all quote requests?")) return;
      localStorage.removeItem("op_quotes");
      renderQuotes();
    };
  }
}

function setupClearJobs() {
  const clearJobsBtn = document.getElementById("clearJobsBtn");
  if (!clearJobsBtn) return;

  clearJobsBtn.addEventListener("click", () => {
    if (!confirm("Clear all jobs?")) return;
    localStorage.removeItem("op_jobs");
    renderAdminJobs();
    renderDashboardStats();
  });
}

function setupSignatureCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  let drawing = false;

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : event;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function start(event) {
    event.preventDefault();
    drawing = true;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function move(event) {
    if (!drawing) return;
    event.preventDefault();
    const point = getPoint(event);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#17211c";
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function stop() {
    drawing = false;
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", stop);

  return {
    clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
    toDataURL: () => canvas.toDataURL("image/png")
  };
}

function renderTechnicianJobs() {
  const list = document.getElementById("technicianJobsList");
  if (!list) return;

  const session = JSON.parse(localStorage.getItem("op_session") || "null");
  const allJobs = getJobs();
  const jobs = session?.role === "admin"
    ? allJobs
    : allJobs.filter((job) => job.assignedTo === session?.email);

  if (!jobs.length) {
    list.innerHTML = `<p class="form-message">No jobs assigned to this technician yet.</p>`;
    return;
  }

  list.innerHTML = jobs.map((job) => `
    <article class="job-card">
      <h3>${escapeHtml(job.clientName)}</h3>
      <span class="status-pill">${escapeHtml(job.status)}</span>
      <div class="job-meta">
        <span><strong>Service:</strong> ${escapeHtml(job.serviceType)}</span>
        <span><strong>Date:</strong> ${escapeHtml(job.jobDate)}</span>
        <span><strong>Contact:</strong> ${escapeHtml(job.contactNumber)}</span>
        <span><strong>Address:</strong> ${escapeHtml(job.address)}</span>
        <span><strong>Admin Instructions:</strong> ${escapeHtml(job.notes || "No instructions")}</span>
        <span><strong>Current Technician Notes:</strong> ${escapeHtml(job.technicianNotes || "No notes yet")}</span>
      </div>

      ${job.signature ? `<img class="signature-img" src="${job.signature}" alt="Client signature">` : ""}

      <form class="inline-form" data-tech-update="${job.id}">
        <label>
          Update Status
          <select name="status">
            <option ${job.status === "Scheduled" ? "selected" : ""}>Scheduled</option>
            <option ${job.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${job.status === "Completed" ? "selected" : ""}>Completed</option>
            <option ${job.status === "Follow-up Needed" ? "selected" : ""}>Follow-up Needed</option>
          </select>
        </label>

        <label>
          Technician Notes
          <textarea name="technicianNotes" rows="3" placeholder="Add work completed, findings, chemicals used, follow-up notes...">${escapeHtml(job.technicianNotes || "")}</textarea>
        </label>

        <div class="signature-wrap">
          <div class="signature-header">
            <strong>Client Signature</strong>
            <button class="btn btn-small btn-ghost" type="button" data-clear-signature="${job.id}">Clear</button>
          </div>
          <canvas width="700" height="220" data-signature-canvas="${job.id}"></canvas>
        </div>

        <button class="btn btn-primary" type="submit">Save Job Update</button>
      </form>
    </article>
  `).join("");

  list.querySelectorAll("canvas[data-signature-canvas]").forEach((canvas) => {
    const pad = setupSignatureCanvas(canvas);
    canvas._signaturePad = pad;
  });

  list.querySelectorAll("[data-clear-signature]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.clearSignature;
      const canvas = list.querySelector(`canvas[data-signature-canvas="${id}"]`);
      if (canvas?._signaturePad) canvas._signaturePad.clear();
    });
  });

  list.querySelectorAll("form[data-tech-update]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const id = form.dataset.techUpdate;
      const data = Object.fromEntries(new FormData(form).entries());
      const canvas = form.querySelector(`canvas[data-signature-canvas="${id}"]`);

      const jobs = getJobs().map((job) => {
        if (job.id === id) {
          job.status = data.status;
          job.technicianNotes = data.technicianNotes;
          if (canvas?._signaturePad) {
            job.signature = canvas._signaturePad.toDataURL();
          }
          if (data.status === "Completed") {
            job.completedAt = new Date().toLocaleString();
          }
        }
        return job;
      });

      saveJobs(jobs);
      alert("Job updated successfully.");
      renderTechnicianJobs();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupQuoteForm();
  setupAdminJobForm();
  setupClearJobs();

  renderDashboardStats();
  renderAdminJobs();
  renderQuotes();
  renderTechnicianJobs();
});
