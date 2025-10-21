function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only students can access
const user = getUser();
if (!user || user.role !== 'student') {
  alert('Access denied! Only students can view attendance.');
  window.location.href = 'features.html';
}

async function loadAttendance() {
  try {
    const res = await fetch('http://localhost:3000/api/attendance/my', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const records = await res.json();
    if (!Array.isArray(records)) {
      alert('Error fetching attendance');
      return;
    }

    // -------------------
    // Subject-wise summary
    // -------------------
    const summary = {};
    let totalClasses = 0, totalPresent = 0;

    records.forEach(r => {
      if (!summary[r.subject]) {
        summary[r.subject] = { present: 0, total: 0 };
      }
      summary[r.subject].total++;
      if (r.status === 'present') {
        summary[r.subject].present++;
        totalPresent++;
      }
      totalClasses++;
    });

    const summaryList = document.getElementById('summaryList');
    summaryList.innerHTML = '';
    Object.keys(summary).forEach(sub => {
      const { present, total } = summary[sub];
      const percent = ((present / total) * 100).toFixed(2);
      const li = document.createElement('li');
      li.textContent = `${sub}: ${present}/${total} (${percent}%)`;
      summaryList.appendChild(li);
    });

    // -------------------
    // Overall stats
    // -------------------
    const overallPercent = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;
<<<<<<< HEAD
    document.getElementById('overall').innerHTML = `Overall: ${totalPresent}/${totalClasses} (<span style="font-weight: bold; color: #007bff;">${overallPercent}%</span>)`;
=======
    document.getElementById('overall').textContent = `Overall: ${totalPresent}/${totalClasses} (${overallPercent}%)`;
>>>>>>> 659307a5db6b3e39f3cab4f305cf6e3a3e1a2436

    // Max classes they can miss and still stay above 75%
    let canMiss = 0;
    while (((totalPresent / (totalClasses + canMiss)) * 100) >= 75) {
      canMiss++;
    }
    canMiss--; // last valid value
    document.getElementById('maxMiss').textContent =
      `You can miss at most ${canMiss >= 0 ? canMiss : 0} more classes while staying above 75%.`;

    // -------------------
    // Daily summary (grouped)
    // -------------------
    const grouped = {};
    records.forEach(r => {
      const key = r.date.split('T')[0] + '-' + r.subject; // group by date+subject
      if (!grouped[key]) {
        grouped[key] = { date: r.date, subject: r.subject, present: 0, absent: 0 };
      }
      if (r.status === 'present') grouped[key].present++;
      else grouped[key].absent++;
    });

    const tbody = document.getElementById('recordsTable');
    tbody.innerHTML = '';
    Object.values(grouped).forEach(g => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(g.date).toLocaleDateString()}</td>
        <td>${g.subject}</td>
        <td style="color:green">${g.present}</td>
        <td style="color:red">${g.absent}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Error loading attendance:', err);
  }
}

loadAttendance();
