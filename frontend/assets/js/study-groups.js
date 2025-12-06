import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem("token");
}

// Load all groups
async function loadAllGroups() {
  try {
    const res = await fetch(`${BASE_URL}/api/study-groups`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const groups = await res.json();
    const div = document.getElementById("allGroups");
    div.innerHTML = "";

    if (groups.length === 0) {
      div.innerHTML = "<p>No groups created yet.</p>";
      return;
    }

    groups.forEach(g => {
      const el = document.createElement("div");
      el.classList.add("group");

      let membersList = g.members.map(m => `${m.name} (${m.regNo})`).join(", ");

      el.innerHTML = `
        <h3>${g.name}</h3>
        <p><small>Subject: ${g.subject}</small></p>
        <p><small>Members: ${membersList}</small></p>
        <button onclick="joinGroup('${g._id}')">Join Group</button>
      `;
      div.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading groups:", err);
  }
}

function openGroup(id) {
  window.location.href = `group-chat.html?id=${id}`;
}
// Load my groups
async function loadMyGroups() {
  try {
    const res = await fetch(`${BASE_URL}/api/study-groups/my`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const groups = await res.json();
    const div = document.getElementById("myGroups");
    div.innerHTML = "";

    if (groups.length === 0) {
      div.innerHTML = "<p>You haven't joined any groups yet.</p>";
      return;
    }

    groups.forEach(g => {
        const el = document.createElement("div");
        el.classList.add("group");

        let membersList = g.members.map(m => `${m.name} (${m.regNo})`).join(", ");

        el.innerHTML = `
            <h3>${g.name}</h3>
            <p><small>Subject: ${g.subject}</small></p>
            <p>🟢 ${g.members.length} members</p>
            <p><small>Members: ${membersList}</small></p>
            <button onclick="openGroup('${g._id}')">Join Group</button>
        `;
        div.appendChild(el);
    });

  } catch (err) {
    console.error("Error loading my groups:", err);
  }
}

// Create group
document.getElementById("createGroupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("groupName").value;
  const subject = document.getElementById("subject").value;

  try {
    const res = await fetch(`${BASE_URL}/api/study-groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name, subject })
    });

    const data = await res.json();
    alert(data.msg);
    document.getElementById("createGroupForm").reset();
    loadAllGroups();
    loadMyGroups();
  } catch (err) {
    console.error("Error creating group:", err);
  }
});

// Join group
async function joinGroup(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/study-groups/${id}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    const data = await res.json();
    alert(data.msg);
    loadAllGroups();
    loadMyGroups();
  } catch (err) {
    console.error("Error joining group:", err);
  }
}
// Initial load
loadAllGroups();
loadMyGroups();
