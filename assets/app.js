// Lucide
if (window.lucide) lucide.createIcons();

// Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX, y = e.clientY;
    cursorDot.style.left = `${x}px`;
    cursorDot.style.top = `${y}px`;
    cursorOutline.animate({ left: `${x}px`, top: `${y}px` }, { duration: 450, fill: "forwards" });
  });

  document.querySelectorAll('a, button, input, select, textarea, .device-clickable')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hover-expand'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hover-expand'));
    });
}

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const closeMenu = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) menuBtn.addEventListener('click', () => mobileMenu.classList.remove('translate-x-full'));
if (closeMenu && mobileMenu) closeMenu.addEventListener('click', () => mobileMenu.classList.add('translate-x-full'));
document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', () => mobileMenu?.classList.add('translate-x-full')));

// Spotlight effect
window.handleSpotlight = function(e, element) {
  const rect = element.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  element.style.setProperty('--mouse-x', `${x}%`);
  element.style.setProperty('--mouse-y', `${y}%`);
}
window.clearSpotlight = function(element) {
  element.style.setProperty('--mouse-x', '50%');
  element.style.setProperty('--mouse-y', '50%');
}

// Active nav highlight based on current file
(function setActiveNav(){
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (href === current) a.classList.add('active');
  });
})();

// ===========================
// Estimator (planning tool)
// ===========================
let revenueChart;

function fmtMoney(n) {
  const v = Math.max(0, Math.round(n));
  return '$' + v.toLocaleString();
}

function initEstimatorChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas || !window.Chart) return;
  if (revenueChart) revenueChart.destroy();

  revenueChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Current', 'Projected (Low)', 'Projected (Mid)', 'Projected (High)'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(255,255,255,0.10)',
          'rgba(16,185,129,0.35)',
          'rgba(16,185,129,0.55)',
          '#10b981'
        ],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            color: '#9ca3af',
            callback: v => '$' + Number(v).toLocaleString()
          }
        },
        x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
      }
    }
  });
}

function updateEstimator() {
  const visitors = Number(document.getElementById('visitors')?.value || 0);
  const aov = Number(document.getElementById('aov')?.value || 0);
  const cvr = Number(document.getElementById('cvr')?.value || 0);
  const trafficLift = Number(document.getElementById('trafficLift')?.value || 0);
  const cvrLift = Number(document.getElementById('cvrLift')?.value || 0);

  // Displays
  const vDisp = document.getElementById('visitorsDisp');
  const aovDisp = document.getElementById('aovDisp');
  const cvrDisp = document.getElementById('cvrDisp');
  const tDisp = document.getElementById('trafficLiftDisp');
  const cDisp = document.getElementById('cvrLiftDisp');

  if (vDisp) vDisp.textContent = visitors.toLocaleString();
  if (aovDisp) aovDisp.textContent = fmtMoney(aov);
  if (cvrDisp) cvrDisp.textContent = cvr.toFixed(1) + '%';
  if (tDisp) tDisp.textContent = trafficLift.toFixed(0) + '%';
  if (cDisp) cDisp.textContent = cvrLift.toFixed(0) + '%';

  const currentRevenue = visitors * (cvr / 100) * aov;

  // We calculate a LOW/MID/HIGH range to make it clear it’s not a promise.
  const newVisitorsLow = visitors * (1 + (trafficLift * 0.6) / 100);
  const newVisitorsMid = visitors * (1 + (trafficLift * 1.0) / 100);
  const newVisitorsHigh = visitors * (1 + (trafficLift * 1.3) / 100);

  const newCvrLow = (cvr * (1 + (cvrLift * 0.6) / 100)) / 100;
  const newCvrMid = (cvr * (1 + (cvrLift * 1.0) / 100)) / 100;
  const newCvrHigh = (cvr * (1 + (cvrLift * 1.3) / 100)) / 100;

  const projectedLow = newVisitorsLow * newCvrLow * aov;
  const projectedMid = newVisitorsMid * newCvrMid * aov;
  const projectedHigh = newVisitorsHigh * newCvrHigh * aov;

  document.getElementById('currentRevenue').textContent = fmtMoney(currentRevenue);
  document.getElementById('projLow').textContent = fmtMoney(projectedLow);
  document.getElementById('projMid').textContent = fmtMoney(projectedMid);
  document.getElementById('projHigh').textContent = fmtMoney(projectedHigh);

  if (revenueChart) {
    revenueChart.data.datasets[0].data = [
      Math.round(currentRevenue),
      Math.round(projectedLow),
      Math.round(projectedMid),
      Math.round(projectedHigh)
    ];
    revenueChart.update();
  }
}

if (document.body?.dataset?.page === 'estimator') {
  window.updateEstimator = updateEstimator;
  setTimeout(() => { initEstimatorChart(); updateEstimator(); }, 200);
}
