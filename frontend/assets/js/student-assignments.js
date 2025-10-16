function getToken() {
  return localStorage.getItem('token');
}
function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

const user = getUser();
if (!user || user.role !== 'student') {
  alert("Access denied! Students only.");
  window.location.href = "features.html";
}

function showToast(message, color = "#333") {
  const toast = document.getElementById("toast");
  toast.style.backgroundColor = color;
  toast.textContent = message;
  toast.style.visibility = "visible";
  toast.style.opacity = "1";
  toast.style.bottom = "50px";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.bottom = "30px";
    setTimeout(() => toast.style.visibility = "hidden", 500);
  }, 2500);
}

// Load assignments
async function loadAssignments() {
  try {
    const res = await fetch("http://localhost:3000/api/assignments/my", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    const { pending, finished } = await res.json();

    const pendingDiv = document.getElementById("pendingAssignments");
    pendingDiv.innerHTML = "";
    pending.forEach(a => {
      const div = document.createElement("div");
      div.classList.add("assignment");
      div.innerHTML = `
        <h3>${a.title} (${a.subject})</h3>
        <p>${a.description}</p>
        <p><b>Due:</b> ${new Date(a.dueDate).toLocaleDateString()} | Max Marks: ${a.maxMarks}</p>
        <form onsubmit="submitAssignment(event, '${a._id}')">
          <input type="file" id="file-${a._id}" required>
          <button type="submit">Submit</button>
        </form>
      `;
      pendingDiv.appendChild(div);
    });

    const finishedDiv = document.getElementById("finishedAssignments");
    finishedDiv.innerHTML = "";
    finished.forEach(s => {
      const div = document.createElement("div");
      div.classList.add("assignment");
      div.innerHTML = `
        <h3>${s.assignment.title} (${s.assignment.subject})</h3>
        <p>Marks: ${s.marks !== null ? `${s.marks}/${s.assignment.maxMarks}` : "Not graded yet"}</p>
        <a href="http://localhost:3000/${s.file}" target="_blank">📂 View Your Submission</a>
      `;
      finishedDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading assignments:", err);
  }
}

// Submit assignment
async function submitAssignment(e, assignmentId) {
  e.preventDefault();
  const fileInput = document.getElementById(`file-${assignmentId}`);
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${getToken()}` },
      body: formData
    });

    if (res.ok) {
      showToast("Assignment submitted successfully!", "#28a745");
      document.querySelector(`#file-${assignmentId}`).closest('.assignment').remove();
      loadAssignments();
    } else {
      alert("Error submitting assignment");
    }
  } catch (err) {
    console.error("Error submitting:", err);
  }
}

// Initial load
loadAssignments();
