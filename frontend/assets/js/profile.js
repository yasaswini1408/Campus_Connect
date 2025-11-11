// ---------- Utils ----------
    const token = localStorage.getItem('token');
    const storedUser = (() => {
      try { return JSON.parse(localStorage.getItem('user')); } catch(e){ return null; }
    })();

    function showToast(msg, ok = true) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.background = ok ? '#111' : '#b91c1c';
      t.classList.add('show');
      setTimeout(()=> t.classList.remove('show'), 2600);
    }

    function ensureAuth() {
      if(!token) {
        showToast('Not logged in — redirecting', false);
        setTimeout(()=> location.href = 'login.html', 900);
        return false;
      }
      return true;
    }

    // ---------- Tabs ----------
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.tab-section');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        sections.forEach(s => s.style.display = s.id === tab ? 'block' : 'none');
      });
    });

    // ---------- Populate data ----------
    async function loadData() {
      if(!ensureAuth()) return;

      // fill quick info from localStorage if present
      if(storedUser){
        document.getElementById('displayName').innerText = storedUser.name || 'User';
        document.getElementById('displayReg').innerText = 'Reg No: ' + (storedUser.regNo || '—');
        document.getElementById('avatar').innerText = (storedUser.name || 'S').slice(0,1).toUpperCase();
        document.getElementById('nameField').value = storedUser.name || '';
        document.getElementById('regField').value = storedUser.regNo || '';
        document.getElementById('roleField').value = storedUser.role || '';
      }

      // Try to fetch StudentProfile from backend (optional)
      try {
        const res = await fetch('/api/studentprofiles/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          const profileText = `${profile.year} • ${profile.branch} • ${profile.section}`;
          document.getElementById('profileField').value = profileText;
          // optional: fill mobile if stored in profile
          if(profile.mobile) document.getElementById('mobileInput').value = profile.mobile;
        } else if (res.status === 404) {
          // no profile found — leave blank
          document.getElementById('profileField').value = '—';
        } else {
          // ignore, backend might not have this route
          console.debug('profile fetch non-ok', res.status);
        }
      } catch (err) {
        console.debug('profile fetch error', err);
      }

      // As fallback, we may hit /api/auth/me to get latest user fields
      try {
        const r2 = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (r2.ok) {
          const u = await r2.json();
          document.getElementById('nameField').value = u.name || document.getElementById('nameField').value;
          document.getElementById('regField').value = u.regNo || document.getElementById('regField').value;
        }
      } catch(e){}
    }

    // ---------- Update mobile / password ----------
    document.getElementById('saveUpdatesBtn').addEventListener('click', async () => {
      if(!ensureAuth()) return;
      const mobile = document.getElementById('mobileInput').value.trim();
      const pw = document.getElementById('newPassword').value;
      const pw2 = document.getElementById('confirmPassword').value;

      if(pw && pw.length < 6){ showToast('Password must be at least 6 characters', false); return; }
      if(pw && pw !== pw2){ showToast('Passwords do not match', false); return; }

      // Prepare calls (mobile and/or password)
      try {
        if(mobile) {
          const res = await fetch('/api/auth/update-mobile', {
            method: 'PUT',
            headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ mobile })
          });
          if (!res.ok) {
            const err = await res.json().catch(()=>({ msg:'Failed to update mobile' }));
            showToast(err.msg || 'Mobile update failed', false);
            return;
          }
        }

        if(pw) {
          const res2 = await fetch('/api/auth/update-password', {
            method: 'PUT',
            headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ password: pw })
          });
          if (!res2.ok) {
            const err = await res2.json().catch(()=>({ msg:'Failed to update password' }));
            showToast(err.msg || 'Password update failed', false);
            return;
          }
        }

        showToast('Profile updated');
        // clear password fields
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      } catch (err) {
        console.error(err);
        showToast('Server error while saving', false);
      }
    });

    // ---------- Suggestions & Complaints ----------
    document.getElementById('sendSuggestBtn').addEventListener('click', async () => {
      if(!ensureAuth()) return;
      const text = document.getElementById('suggestText').value.trim();
      if(!text){ showToast('Please write a suggestion', false); return; }
      try {
        const res = await fetch('/api/feedback/suggestions', {
          method:'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ message: text })
        });
        if(res.ok){
          showToast('Suggestion submitted — thanks!');
          document.getElementById('suggestText').value = '';
        } else {
          const e = await res.json().catch(()=>({ msg:'Failed' }));
          showToast(e.msg || 'Failed to submit', false);
        }
      } catch(err){
        console.error(err); showToast('Network error', false);
      }
    });

    document.getElementById('sendComplaintBtn').addEventListener('click', async () => {
      if(!ensureAuth()) return;
      const text = document.getElementById('complaintText').value.trim();
      if(!text){ showToast('Please describe the issue', false); return; }
      try {
        const res = await fetch('/api/feedback/complaints', {
          method:'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ message: text })
        });
        if(res.ok){
          showToast('Complaint submitted');
          document.getElementById('complaintText').value = '';
        } else {
          const e = await res.json().catch(()=>({ msg:'Failed' }));
          showToast(e.msg || 'Failed to submit', false);
        }
      } catch(err){
        console.error(err); showToast('Network error', false);
      }
    });

    // ---------- small helpers ----------
    document.getElementById('logoutFromProfile').addEventListener('click', () => {
      localStorage.removeItem('token'); localStorage.removeItem('user');
      location.href = 'login.html';
    });
    document.getElementById('editProfileBtn').addEventListener('click', loadData);

    // Initial load
    loadData();