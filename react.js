const root = document.getElementById('react-root');

if (root) {
  const ui = document.createElement('div');
  ui.className = 'floating-theme-bar';
  ui.innerHTML = `
    <span class="theme-pill">✨ Playful Rescue</span>
    <button class="theme-toggle" type="button">Switch vibe</button>
  `;

  const badges = document.createElement('div');
  badges.className = 'floating-badges';
  badges.innerHTML = `
    <span class="badge">🌱 Zero waste</span>
    <span class="badge">🥗 Safe picks</span>
    <span class="badge">🚚 Smart pickup</span>
  `;

  root.appendChild(ui);
  root.appendChild(badges);

  const toggle = ui.querySelector('.theme-toggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('playful-theme');
    const active = document.body.classList.contains('playful-theme');
    toggle.textContent = active ? 'Back to calm' : 'Switch vibe';
  });
}
