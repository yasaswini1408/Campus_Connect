import { BASE_URL } from "./config.js";

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
    const res = await fetch(`${BASE_URL}/api/notices`, {
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
    const res = await fetch(`${BASE_URL}/api/notices`, {
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

const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const mouse = {
      x: null,
      y: null,
      radius: 120
    };

    window.addEventListener("mousemove", (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    class Particle {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.baseX = x;
    this.baseY = y;
    this.density = Math.random() * 30 + 1;

    // Add random velocity for natural movement
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(37, 96, 214, 0.8)";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 15;
    ctx.fill();
  }

  update() {
    // Move with velocity
    this.x += this.vx;
    this.y += this.vy;

    // Bounce on edges
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Mouse repulsion
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
      let angle = Math.atan2(dy, dx);
      let force = (mouse.radius - distance) / mouse.radius;
      let moveX = force * Math.cos(angle) * this.density;
      let moveY = force * Math.sin(angle) * this.density;

      this.x -= moveX;
      this.y -= moveY;
    }

    this.draw();
  }
}


    function init() {
      particlesArray.length = 0;
      const numberOfParticles = 150;
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let size = Math.random() * 3 + 1;
        particlesArray.push(new Particle(x, y, size));
      }
    }

    // Draw faint glowing lines between close particles
    function connect() {
    let maxDistance = 100 * 100; // 100px threshold
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = dx * dx + dy * dy;

        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(37, 96, 214, 0.3)"; // White lines
          ctx.lineWidth = 1;
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }

    function animate() {
      // Set background gradient matching dashboard palette
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f4f6fa'); // Light background from dashboard
      gradient.addColorStop(1, '#e8f0ff'); // Light blue tint
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
      requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });
