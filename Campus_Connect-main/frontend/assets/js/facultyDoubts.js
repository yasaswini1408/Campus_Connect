function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only faculty can access
const user = getUser();
if (!user || user.role !== 'faculty') {
  alert('Access denied! Only faculty can view doubts.');
  window.location.href = 'features.html';
}

// Load assigned doubts
async function loadDoubts() {
  try {
    const res = await fetch('http://localhost:3000/api/doubts/assigned', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const doubts = await res.json();

    const list = document.getElementById('doubtsList');
    list.innerHTML = '';
    doubts.forEach(d => {
      const div = document.createElement('div');
      div.classList.add('doubt');
      div.innerHTML = `
        <h4>${d.title}</h4>
        <p>${d.description}</p>
        <small>Student: ${d.student?.name || 'Unknown'} (${d.student?.regNo || ''})</small><br>
        <small>Status: <span class="${d.status.toLowerCase()}">${d.status}</span></small><br>
        ${d.reply ? `<p><strong>Reply:</strong> ${d.reply}</p>` : `
          <textarea id="reply-${d._id}" placeholder="Write your reply..."></textarea>
          <button onclick="sendReply('${d._id}')">Submit Reply</button>
        `}
      `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error('Error loading doubts:', err);
  }
}

// Send reply
async function sendReply(doubtId) {
  const textarea = document.getElementById(`reply-${doubtId}`);
  const reply = textarea.value;
  if (!reply.trim()) {
    alert('Please enter a reply.');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/doubts/${doubtId}/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ reply })
    });

    if (res.ok) {
      loadDoubts();
    } else {
      const data = await res.json();
      alert(data.msg || 'Error submitting reply');
    }
  } catch (err) {
    console.error('Error submitting reply:', err);
  }
}

// Init
loadDoubts();
