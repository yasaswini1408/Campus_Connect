import { BASE_URL } from "./config.js";

document.getElementById('studentLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent page reload

    const regNo = document.getElementById('regNo').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regNo, password })
        });

        const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === 'faculty') {
          window.location.href = 'faculty-dashboard.html';
        } else if (data.user.role === 'student'){
          window.location.href = 'dashboard.html'; // student dashboard
        } else {
          window.location.href = 'admin-dashboard.html';
        }
      } else {
            document.getElementById('message').innerText = data.msg;
        }
    } catch (err) {
        console.error(err);
        document.getElementById('message').innerText = 'Server error. Try again later.';
    }
});


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
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.shadowColor = "#fff";
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
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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