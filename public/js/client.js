// bace-app/public/js/client.js
document.addEventListener('DOMContentLoaded', () => {
  // Sadhana form validation
  const sadhanaForm = document.querySelector('#sadhana-form');
  if (sadhanaForm) {
    sadhanaForm.addEventListener('submit', (e) => {
      const wakeupTime = document.querySelector('input[name="wakeupTime"]').value;
      const sleepTime = document.querySelector('input[name="sleepTime"]').value;
      const bgStudyHours = parseFloat(document.querySelector('input[name="bgStudyHours"]').value);

      if (!wakeupTime || !/^\d{2}:\d{2}$/.test(wakeupTime)) {
        e.preventDefault();
        alert('Please enter a valid wakeup time (HH:MM)');
        return;
      }
      if (sleepTime && !/^\d{2}:\d{2}$/.test(sleepTime)) {
        e.preventDefault();
        alert('Please enter a valid sleep time (HH:MM)');
        return;
      }
      if (isNaN(bgStudyHours) || bgStudyHours < 0) {
        e.preventDefault();
        alert('Bhagavad Gita study hours must be a non-negative number');
        return;
      }
    });
  }

  // Fetch rankings dynamically
  const rankingsButton = document.querySelector('#fetch-rankings');
  const rankingsContainer = document.querySelector('#rankings-container');
  if (rankingsButton && rankingsContainer) {
    rankingsButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/rankings', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (response.ok) {
          rankingsContainer.innerHTML = `
            <h2 class="text-xl font-semibold mb-2">Weekly Rankings</h2>
            <ol class="list-decimal pl-5">
              ${data.rankings.map((r, i) => `
                <li class="mb-1">${i + 1}. ${r.name} - Score: ${r.score} (BG: ${r.bgHours} hrs, Sevas: ${r.sevas})</li>
              `).join('')}
            </ol>
          `;
        } else {
          rankingsContainer.innerHTML = '<p class="text-red-500 mb-2">Error fetching rankings</p>';
        }
      } catch (err) {
        rankingsContainer.innerHTML = '<p class="text-red-500 mb-2">Network error</p>';
      }
    });
  }

  // Logout button handler
  const logoutButton = document.querySelector('#logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault(); // Prevent default link behavior
      try {
        const response = await fetch('/logout', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          window.location.href = '/';
        } else {
          alert('Logout failed');
        }
      } catch (err) {
        alert('Network error during logout');
      }
    });
  }
});

// mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!btn || !mobileMenu) return;

  btn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
});
