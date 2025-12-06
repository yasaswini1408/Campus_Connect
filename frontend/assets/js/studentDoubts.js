import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only students can access
const user = getUser();
if (!user || user.role !== 'student') {
  alert('Access denied! Only students can post/view doubts.');
  window.location.href = 'features.html';
}

// Load faculty list for dropdown
async function loadFaculty() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/faculty`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const faculty = await res.json();
    const select = document.getElementById('faculty');
    faculty.forEach(f => {
      const option = document.createElement('option');
      option.value = f._id;
      option.textContent = `${f.name} (${f.regNo})`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading faculty:', err);
  }
}

// Submit a new doubt
document.getElementById('doubtForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const facultyId = document.getElementById('faculty').value;

  try {
    const res = await fetch(`${BASE_URL}/api/doubts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ title, description, facultyId })
    });

    if (res.ok) {
      document.getElementById('doubtForm').reset();
      loadMyDoubts();
    } else {
      const data = await res.json();
      alert(data.msg || 'Error submitting doubt');
    }
  } catch (err) {
    console.error('Error submitting doubt:', err);
  }
});

// Load my doubts
async function loadMyDoubts() {
  try {
    const res = await fetch(`${BASE_URL}/api/doubts/my`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    // --- RECTIFICATION START ---
    if (!res.ok) {
        // Log the error if the response is not successful (e.g., 404, 500)
        const errorData = await res.json().catch(() => ({ msg: 'Error: Non-JSON response' }));
        throw new Error(errorData.msg || `Failed to load doubts with status: ${res.status}`);
    }
    
    const doubts = await res.json();

    // Check if the received data is an array
    if (!Array.isArray(doubts)) {
        console.error('API did not return an array for my doubts:', doubts);
        // Display a message indicating no doubts or an API issue
        const list = document.getElementById('doubtsList');
        list.innerHTML = '<p>No doubts found or an unexpected API format was received.</p>';
        return; 
    }
    // --- RECTIFICATION END ---

    const list = document.getElementById('doubtsList');
    list.innerHTML = '';
    doubts.forEach(d => {
      const div = document.createElement('div');
      div.classList.add('doubt');
      div.innerHTML = `
        <h4>${d.title}</h4>
        <p>${d.description}</p>
        <small>Faculty: ${d.faculty?.name || 'Unknown'} (${d.faculty?.regNo || ''})</small><br>
        <small>Status: <span class="${d.status.toLowerCase()}">${d.status}</span></small><br>
        ${d.reply ? `<p><strong>Reply:</strong> ${d.reply}</p>` : ''}
      `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading doubts:', err);
    // Optional: Add a user-facing error message
    const list = document.getElementById('doubtsList');
    if(list.innerHTML === '') {
        list.innerHTML = `<p class="error">Failed to load doubts: ${err.message}</p>`;
    }
  }
}

// Init
loadFaculty();
loadMyDoubts();