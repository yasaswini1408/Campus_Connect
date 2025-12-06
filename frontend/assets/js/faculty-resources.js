import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

async function loadMyResources() {
  try {
    const res = await fetch(`${BASE_URL}/api/resources/mine`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) throw new Error("Failed to fetch resources");

    const resources = await res.json();
    const div = document.getElementById('myResources');
    div.innerHTML = '';

    if (resources.length === 0) {
      div.innerHTML = '<p>No resources uploaded yet.</p>';
      return;
    }

    resources.forEach(r => {
      const el = document.createElement('div');
      el.classList.add('resource');
      el.style.border = "1px solid #ddd";
      el.style.margin = "8px 0";
      el.style.padding = "10px";
      el.style.borderRadius = "6px";
      el.innerHTML = `
        <strong>${r.title}</strong> (${r.subject})<br>
        <small>${r.year} Year - ${r.branch} - ${r.section}</small><br>
        <small>Uploaded on: ${new Date(r.date).toLocaleString()}</small><br>
        <a href="${BASE_URL}${r.filePath}" target="_blank">📥 Download</a>
      `;
      div.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading resources:", err);
  }
}

// ✅ Ensure only faculty can access
loadMyResources();
const user = getUser();
if (!user || user.role !== 'faculty') {
  alert('Access denied! Only faculty can upload resources.');
  window.location.href = 'faculty-dashboard.html';
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('subject', document.getElementById('subject').value);
  formData.append('year', document.getElementById('year').value);
  formData.append('branch', document.getElementById('branch').value);
  formData.append('section', document.getElementById('section').value);
  formData.append('file', document.getElementById('file').files[0]);

  try {
    const res = await fetch(`${BASE_URL}/api/resources`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });

    if (res.ok) {
      alert('✅ Resource uploaded successfully');
      document.getElementById('uploadForm').reset();
      loadMyResources();
    } else {
      let data;
      try {
        data = await res.json();
      } catch {
        data = { msg: "Unknown error (possibly HTML response instead of JSON)" };
      }
      alert(data.msg || '❌ Failed to upload resource');
    }
  } catch (err) {
    console.error('Error uploading resource:', err);
    alert('❌ Error uploading resource');
  }
});
