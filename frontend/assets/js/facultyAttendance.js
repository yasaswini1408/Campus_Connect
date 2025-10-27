function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Ensure only faculty can access
const user = getUser();
if (!user || user.role !== 'faculty') {
  alert('Access denied! Only faculty can mark attendance.');
  window.location.href = 'features.html';
}

// Auto-set date to today
document.getElementById('date').value = new Date().toISOString().split('T')[0];

let studentsList = [];

// Handle form submit → load students
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value;
  const date = document.getElementById('date').value;
  const periods = document.getElementById('periods').value;

  if (!subject || !date) {
    alert('Please select subject and date');
    return;
  }

  try {
    // Fetch all students
    const res = await fetch('http://localhost:3000/api/auth/students', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    studentsList = await res.json();

    if (!Array.isArray(studentsList) || studentsList.length === 0) {
      alert('No students found');
      return;
    }

    const tbody = document.getElementById('studentsTable');
    tbody.innerHTML = '';
    studentsList.forEach(s => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.regNo}</td>
        <td>${s.name}</td>
        <td><input type="checkbox" id="absent-${s._id}"></td>
      `;
      tbody.appendChild(row);
    });

    document.getElementById('attendanceSection').style.display = 'block';
  } catch (err) {
    console.error('Error loading students:', err);
  }
});

// Handle posting attendance
document.getElementById('markAttendanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value;
  const date = document.getElementById('date').value;
  const periods = parseInt(document.getElementById('periods').value);

  try {
    for (const s of studentsList) {
      const absent = document.getElementById(`absent-${s._id}`).checked;
      const status = absent ? 'absent' : 'present';

      // Send one record per period
      for (let i = 0; i < periods; i++) {
        await fetch('http://localhost:3000/api/attendance', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ studentId: s._id, subject, date, status })
        });
      }
    }
    alert('Attendance marked successfully');
  } catch (err) {
    console.error('Error posting attendance:', err);
  }
});
