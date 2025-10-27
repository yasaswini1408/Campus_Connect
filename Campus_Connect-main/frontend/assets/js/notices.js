function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Show form only if faculty
const user = getUser();
if (user?.role === 'faculty') {
  document.getElementById('noticeForm').style.display = 'block';
}

// Fetch and render notices
async function getNotices() {
  try {
    const res = await fetch('http://localhost:3000/api/notices', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const notices = await res.json();
    const container = document.getElementById('notices');
    container.innerHTML = '';

    if (!Array.isArray(notices)) {
      container.innerHTML = '<p>No notices found.</p>';
      return;
    }

    // Group notices by category
    const groups = {
      urgent: [],
      event: [],
      placement: [],
      general: []
    };

    notices.forEach(n => {
      if (groups[n.category]) {
        groups[n.category].push(n);
      } else {
        groups.general.push(n);
      }
    });

    // Render groups in order
    renderGroup(container, 'urgent', '', groups.urgent);
    renderGroup(container, 'event', '', groups.event);
    renderGroup(container, 'placement', '', groups.placement);
    renderGroup(container, 'general', '', groups.general);

  } catch (err) {
    console.error('Error fetching notices:', err);
  }
}

// Render one group of notices
function renderGroup(container, category, title, notices) {
  if (notices.length === 0) return;

  const section = document.createElement('div');
  section.innerHTML = `<h2 style="margin-top:20px;">${title}</h2>`;

  notices.forEach(n => {
    const div = document.createElement('div');
    div.classList.add('notice');

    // Badge colors
    let badge = '';
    switch (n.category) {
      case 'urgent':
        badge = '<span style="color:white; background:red; padding:3px 6px; border-radius:4px;">Urgent</span>';
        break;
      case 'event':
        badge = '<span style="color:white; background:green; padding:3px 6px; border-radius:4px;">Event</span>';
        break;
      case 'placement':
        badge = '<span style="color:white; background:blue; padding:3px 6px; border-radius:4px;">Placement</span>';
        break;
      default:
        badge = '<span style="color:white; background:gray; padding:3px 6px; border-radius:4px;">General</span>';
    }

    div.innerHTML = `
      <h3>${n.title} ${badge}</h3>
      <small>By ${n.author?.name || 'Unknown'} • ${new Date(n.date).toLocaleString()}</small>
      <p>${n.content}</p>
    `;
    section.appendChild(div);
  });

  container.appendChild(section);
}

// Handle notice form (faculty only)
document.getElementById('noticeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const category = document.getElementById('category').value;

  try {
    const res = await fetch('http://localhost:3000/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ title, content, category })
    });

    if (res.ok) {
      document.getElementById('noticeForm').reset();
      getNotices();
    } else {
      const data = await res.json();
      alert(data.msg || 'Error posting notice');
    }
  } catch (err) {
    console.error('Error posting notice:', err);
  }
});

// Load notices on page load
getNotices();
