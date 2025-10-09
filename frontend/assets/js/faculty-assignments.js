function getToken() {
  return localStorage.getItem('token');
}
function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

const user = getUser();
if (!user || user.role !== 'faculty') {
  alert("Access denied! Faculty only.");
  window.location.href = "dashboard.html";
}

// Create assignment
document.getElementById("createAssignmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    subject: document.getElementById("subject").value,
    maxMarks: document.getElementById("maxMarks").value,
    dueDate: document.getElementById("dueDate").value,
    year: document.getElementById("year").value,
    branch: document.getElementById("branch").value,
    section: document.getElementById("section").value
  };

  try {
    const res = await fetch("http://localhost:3000/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Assignment created successfully");
      loadAssignments();
      e.target.reset();
    } else {
      alert("Error creating assignment");
    }
  } catch (err) {
    console.error("Error:", err);
  }
});

// Load faculty assignments
async function loadAssignments() {
  try {
    const res = await fetch("http://localhost:3000/api/assignments/faculty", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const assignments = await res.json();

    const container = document.getElementById("assignments");
    container.innerHTML = "";

    assignments.forEach(a => {
      const div = document.createElement("div");
      div.classList.add("assignment");
      div.innerHTML = `
        <h3>${a.title} (${a.subject})</h3>
        <p>${a.description}</p>
        <p><b>Due:</b> ${new Date(a.dueDate).toLocaleDateString()} | Max Marks: ${a.maxMarks}</p>
        <button onclick="viewSubmissions('${a._id}')">View Submissions</button>
        <div id="subs-${a._id}"></div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading assignments:", err);
  }
}

// View submissions
async function viewSubmissions(assignmentId) {
  try {
    const res = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submissions`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const subs = await res.json();

    const div = document.getElementById(`subs-${assignmentId}`);
    div.innerHTML = "";

    subs.forEach(s => {
      const el = document.createElement("div");
      el.classList.add("submissions");
      el.innerHTML = `
        <p><b>${s.student.name}</b> (${s.student.regNo})</p>
        <a href="http://localhost:3000/${s.file}" target="_blank">📂 View Submission</a>
        <p>Status: ${s.marks !== null ? ` Graded <br> Marks obtained: ${s.marks}` : "Not graded"}</p>
        <input type="number" id="mark-${s._id}" placeholder="Marks">
        <button onclick="gradeSubmission('${s._id}', '${assignmentId}')">Grade</button>
      `;
      div.appendChild(el);
    });
  } catch (err) {
    console.error("Error viewing submissions:", err);
  }
}

// Grade submission
async function gradeSubmission(submissionId, assignmentId) {
  const marks = document.getElementById(`mark-${submissionId}`).value;
  try {
    const res = await fetch(`http://localhost:3000/api/assignments/${submissionId}/grade`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify({ marks })
    });

    if (res.ok) {
      alert("Graded successfully");
      viewSubmissions(assignmentId);
    } else {
      alert("Error grading");
    }
  } catch (err) {
    console.error("Error grading:", err);
  }
}

// Initial load
loadAssignments();
