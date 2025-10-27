function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only students can access
const user = getUser();
if (!user || user.role !== 'student') {
  alert('Access denied! Only students can view resources.');
  window.location.href = 'features.html';
}

async function loadResources() {
  try {
    const res = await fetch('http://localhost:3000/api/resources/my', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) throw new Error("Failed to fetch resources");

    const resources = await res.json();
    const div = document.getElementById('resources');
    div.innerHTML = '';

    if (resources.length === 0) {
      div.innerHTML = '<p>No resources available for your class yet.</p>';
      return;
    }

    resources.forEach(r => {
      const el = document.createElement('div');
      el.classList.add('resource');
      el.innerHTML = `
        <strong>${r.title}</strong> (${r.subject})<br>
        <small>${r.year} Year - ${r.branch} - ${r.section}</small>
        <small>Uploaded on: ${new Date(r.date).toLocaleString()}</small>
        <p>${r.description || ''}</p>
        <a class="download" href="http://localhost:3000${r.filePath}" target="_blank">📥 Download</a>
      `;
      div.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading resources:", err);
  }
}

// Load on page start
loadResources();
