import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem('token');
}

async function loadNotifications() {
  try {
    const res = await fetch(`${BASE_URL}/api/notifications/my`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) return;

    const notifs = await res.json();
    const list = document.getElementById('notifList');
    list.innerHTML = '';

    if (notifs.length === 0) {
      list.innerHTML = '<p>No notifications yet.</p>';
      return;
    }

    notifs.forEach(n => {
      const el = document.createElement('div');
      el.style.marginBottom = "8px";
      el.style.padding = "5px";
      el.style.background = n.seen ? "#f4f4f4" : "#e6f0ff";
      el.style.borderRadius = "4px";
      el.innerHTML = `
        <strong>${n.title}</strong><br>
        <small>${n.message}</small><br>
        ${n.link ? `<a href="${n.link}">View</a>` : ""}
      `;
      list.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading notifications:", err);
  }
}

// Toggle dropdown
document.getElementById('notifBtn').addEventListener('click', () => {
  const list = document.getElementById('notifList');
  list.style.display = list.style.display === 'none' ? 'block' : 'none';
  loadNotifications();
});
