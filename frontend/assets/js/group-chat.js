import { BASE_URL } from "./config.js";

const socket = io(`${BASE_URL}`);
const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");
const chatBox = document.getElementById("chatBox");
const user = JSON.parse(localStorage.getItem("user"));

// Join group room
socket.emit("joinGroup", { groupId, user });

socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Send message
document.getElementById("sendBtn").addEventListener("click", () => {
  const text = document.getElementById("messageInput").value;
  socket.emit("chatMessage", { groupId, user: user.name, text });
  document.getElementById("messageInput").value = "";
});

// Upload file
document.getElementById("uploadBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    socket.emit("uploadFile", { groupId, user: user.name, fileName: file.name });
    const div = document.createElement("div");
    div.innerHTML = `<strong>${user.name} uploaded:</strong> ${file.name}`;
    chatBox.appendChild(div);
  }
});

// Exit group
document.getElementById("exitBtn").addEventListener("click", async () => {
  await fetch(`${BASE_URL}/api/study-groups/${groupId}/leave`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  alert("You left the group.");
  window.location.href = "study-groups.html";
});
