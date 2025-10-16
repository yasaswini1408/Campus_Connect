function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only students can access
const user = getUser();
if (!user || user.role !== 'student') {
  alert('Access denied! Only students can view results.');
  window.location.href = 'features.html';
}

async function loadResults() {
  try {
    const res = await fetch('http://localhost:3000/api/results/my', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) throw new Error("Failed to fetch results");

    const results = await res.json();
    const div = document.getElementById('results');
    div.innerHTML = '';

    if (results.length === 0) {
      div.innerHTML = '<p>No results available yet.</p>';
      return;
    }

    const examLabels = [];
    const gpaValues = [];

    results.forEach(r => {
      const card = document.createElement('div');
      card.classList.add('result-card');

      // Exam title
      const examTitle = r.examType.toUpperCase().replace('MID', 'Mid-');
      card.innerHTML = `<h3>${examTitle}</h3>`;

      // Table of marks
      let table = `<table><tr><th>Subject</th><th>Marks</th></tr>`;
      for (const [subject, mark] of Object.entries(r.marks)) {
        table += `<tr><td>${subject}</td><td>${mark}</td></tr>`;
      }
      table += `</table>`;

      // GPA if available
      if (r.gpa) {
        card.innerHTML += table + `<p class="gpa">GPA: ${r.gpa}</p>`;
        examLabels.push(examTitle);
        gpaValues.push(r.gpa);
      } else {
        card.innerHTML += table + `<p class="gpa">GPA: Not available</p>`;
      }

      div.appendChild(card);
    });

    // GPA Trend Chart
    if (gpaValues.length > 0) {
      const ctx = document.getElementById('gpaChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: examLabels,
          datasets: [{
            label: 'GPA Trend',
            data: gpaValues,
            borderColor: '#007BFF',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              min: 0,
              max: 10,
              title: { display: true, text: 'GPA' }
            }
          }
        }
      });
    }

  } catch (err) {
    console.error("Error loading results:", err);
  }
}

// Load results on page start
loadResults();
