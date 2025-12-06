import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only faculty can access
const user = getUser();
if (!user || user.role !== 'faculty') {
  alert('Access denied! Only faculty can upload results.');
  window.location.href = 'faculty-dashboard.html';
}

document.getElementById('resultUploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('examType', document.getElementById('examType').value);
  formData.append('file', document.getElementById('file').files[0]);

  try {
    const res = await fetch(`${BASE_URL}/api/results/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { msg: "Unexpected server response" };
    }

    if (res.ok) {
      alert('✅ ' + data.msg);
      document.getElementById('resultUploadForm').reset();
      loadPreviousUploads();
    } else {
      alert('❌ ' + (data.msg || "Failed to upload results"));
    }
  } catch (err) {
    console.error("Error uploading results:", err);
    alert("❌ Error uploading results");
  }
});

async function loadPreviousUploads() {
  try {
    const res = await fetch(`${BASE_URL}/api/results/all`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) return;

    const results = await res.json();
    const div = document.getElementById('previousUploads');
    div.innerHTML = '';

    if (results.length === 0) {
      div.innerHTML = '<p>No results uploaded yet.</p>';
      return;
    }

    results.forEach(r => {
      const el = document.createElement('div');
      el.classList.add('result-item');
      el.innerHTML = `
        <strong>${r.examType.toUpperCase()}</strong> 
        <br><small>Uploaded: ${new Date(r.uploadedAt).toLocaleString()}</small>
      `;
      div.appendChild(el);
    });
  } catch (err) {
    console.error("Error fetching previous uploads:", err);
  }
}

// Load previous uploads on page start
loadPreviousUploads();
