// ============================================================
// PERIODIC TABLE LAYOUT
// ============================================================

// Grid positions: [row, col] (1-indexed)
// Row 1: H(1,1), He(1,18)
// Row 2: Li(2,1)..Ne(2,18)
// etc.
// Lanthanides row 9, Actinides row 10

function getGridPos(el) {
  const z = el.z;
  // Special: Lanthanides (57-71) go in rows 9, cols 4-18
  if (z >= 57 && z <= 71) return { row: 9, col: z - 57 + 4 };
  // Actinides (89-103) go in row 10
  if (z >= 89 && z <= 103) return { row: 10, col: z - 89 + 4 };

  // Main table placement
  const pos = {
    1:  [1,1], 2:  [1,18],
    3:  [2,1], 4:  [2,2], 5:  [2,13], 6:  [2,14], 7:  [2,15], 8:  [2,16], 9:  [2,17], 10: [2,18],
    11: [3,1], 12: [3,2], 13: [3,13], 14: [3,14], 15: [3,15], 16: [3,16], 17: [3,17], 18: [3,18],
    19: [4,1], 20: [4,2], 21: [4,3], 22: [4,4], 23: [4,5], 24: [4,6], 25: [4,7], 26: [4,8], 27: [4,9], 28: [4,10], 29: [4,11], 30: [4,12], 31: [4,13], 32: [4,14], 33: [4,15], 34: [4,16], 35: [4,17], 36: [4,18],
    37: [5,1], 38: [5,2], 39: [5,3], 40: [5,4], 41: [5,5], 42: [5,6], 43: [5,7], 44: [5,8], 45: [5,9], 46: [5,10], 47: [5,11], 48: [5,12], 49: [5,13], 50: [5,14], 51: [5,15], 52: [5,16], 53: [5,17], 54: [5,18],
    55: [6,1], 56: [6,2], 72: [6,4], 73: [6,5], 74: [6,6], 75: [6,7], 76: [6,8], 77: [6,9], 78: [6,10], 79: [6,11], 80: [6,12], 81: [6,13], 82: [6,14], 83: [6,15], 84: [6,16], 85: [6,17], 86: [6,18],
    87: [7,1], 88: [7,2], 104:[7,4], 105:[7,5], 106:[7,6], 107:[7,7], 108:[7,8], 109:[7,9], 110:[7,10], 111:[7,11], 112:[7,12], 113:[7,13], 114:[7,14], 115:[7,15], 116:[7,16], 117:[7,17], 118:[7,18],
  };
  if (pos[z]) return { row: pos[z][0], col: pos[z][1] };
  return null;
}

function buildTable() {
  const container = document.getElementById('periodicTable');
  // 10 rows (7 main + blank + 2 series), 18 cols
  const ROWS = 10, COLS = 18;

  // Create grid array
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = new Array(COLS).fill(null);
  }

  // Place elements
  ELEMENTS.forEach(el => {
    const pos = getGridPos(el);
    if (pos) {
      grid[pos.row - 1][pos.col - 1] = el;
    }
  });

  // Insert separator row at index 7 (between row 7 and lanthanides)
  // We'll handle this by just letting rows 9,10 be the series rows

  // Clear and rebuild
  container.innerHTML = '';
  container.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;

  for (let r = 0; r < ROWS; r++) {
    // Add separator between row 7 (index 6) and lanthanides (index 8)
    if (r === 7) {
      // Empty spacer row
      for (let c = 0; c < COLS; c++) {
        const sp = document.createElement('div');
        sp.style.height = '8px';
        container.appendChild(sp);
      }
      continue;
    }

    for (let c = 0; c < COLS; c++) {
      const el = grid[r][c];
      if (el) {
        const div = createElementTile(el);
        container.appendChild(div);
      } else {
        // Special label for lanthanide/actinide gap
        if ((r === 5 || r === 6) && c === 2) {
          // La/Ac placeholder
          const placeholder = document.createElement('div');
          placeholder.className = `element cat-${r === 5 ? 'lanthanide' : 'actinide'}`;
          placeholder.style.opacity = '0.5';
          placeholder.style.cursor = 'default';
          placeholder.innerHTML = `<div class="element-inner">
            <div class="el-sym" style="font-size:0.5rem;color:rgba(255,255,255,0.4)">${r === 5 ? '57-71' : '89-103'}</div>
          </div>`;
          container.appendChild(placeholder);
        } else {
          const sp = document.createElement('div');
          sp.className = 'spacer-block';
          container.appendChild(sp);
        }
      }
    }
  }
}

function createElementTile(el) {
  const div = document.createElement('div');
  div.className = `element cat-${el.cat}`;
  div.dataset.z = el.z;
  div.setAttribute('title', el.name);

  const catColor = CATEGORIES[el.cat]?.color || '#888';

  div.innerHTML = `
    <div class="element-inner">
      <div class="el-num">${el.z}</div>
      <div class="el-sym">${el.sym}</div>
      <div class="el-name">${el.name}</div>
      <div class="el-mass">${el.mass}</div>
    </div>
  `;

  // Colored left border
  div.style.borderLeft = `3px solid ${catColor}40`;

  div.addEventListener('click', () => openModal(el));
  return div;
}

// ============================================================
// LEGEND
// ============================================================
function buildLegend() {
  const legend = document.getElementById('legend');
  Object.entries(CATEGORIES).forEach(([key, val]) => {
    const item = document.createElement('div');
    item.className = `legend-item cat-${key}`;
    item.innerHTML = `<div class="legend-dot" style="background:${val.color}"></div>${val.label}`;
    item.addEventListener('click', () => filterCategory(key));
    legend.appendChild(item);
  });
}

// ============================================================
// SEARCH
// ============================================================
function searchElement(query) {
  const tiles = document.querySelectorAll('.element[data-z]');
  const q = query.trim().toLowerCase();

  if (!q) {
    tiles.forEach(t => { t.classList.remove('dimmed', 'highlighted'); });
    return;
  }

  tiles.forEach(tile => {
    const z = parseInt(tile.dataset.z);
    const el = ELEMENTS.find(e => e.z === z);
    if (!el) return;

    const match = el.name.toLowerCase().includes(q) ||
                  el.sym.toLowerCase().includes(q) ||
                  String(el.z) === q;

    tile.classList.toggle('dimmed', !match);
    tile.classList.toggle('highlighted', match);
  });
}

function filterCategory(cat) {
  const tiles = document.querySelectorAll('.element[data-z]');
  const anyDimmed = [...tiles].some(t => t.classList.contains('dimmed'));

  // Toggle: if currently filtering by this category, remove filter
  tiles.forEach(tile => {
    const z = parseInt(tile.dataset.z);
    const el = ELEMENTS.find(e => e.z === z);
    if (!el) return;
    tile.classList.toggle('dimmed', el.cat !== cat);
    tile.classList.remove('highlighted');
  });

  document.getElementById('searchInput').value = '';
}

// ============================================================
// MODAL
// ============================================================
function openModal(el) {
  document.getElementById('modalNum').textContent = el.z;
  document.getElementById('modalSym').textContent = el.sym;
  document.getElementById('modalMassBadge').textContent = el.mass;
  document.getElementById('modalName').textContent = el.name;
  document.getElementById('modalCategory').textContent = CATEGORIES[el.cat]?.label || el.cat;

  const catColor = CATEGORIES[el.cat]?.color || '#888';
  document.getElementById('modalBox').style.background = `${catColor}22`;
  document.getElementById('modalBox').style.borderColor = `${catColor}88`;

  const catTag = document.getElementById('modalCatTag');
  catTag.textContent = CATEGORIES[el.cat]?.label || el.cat;
  catTag.style.background = `${catColor}22`;
  catTag.style.color = catColor;
  catTag.style.borderColor = `${catColor}44`;

  // Info
  document.getElementById('iAtomNum').textContent = el.z;
  document.getElementById('iMass').textContent = `${el.mass} u`;
  document.getElementById('iProton').textContent = el.z;
  document.getElementById('iNeutron').textContent = Math.round(el.mass) - el.z;
  document.getElementById('iElectron').textContent = el.z;
  document.getElementById('iConfig').textContent = el.config;
  document.getElementById('iGroupPeriod').textContent = `${el.group || 'f-block'} / ${el.period}`;
  document.getElementById('iBlock').textContent = el.block?.toUpperCase() + '-blok' || '-';

  document.getElementById('iPhase').textContent = el.phase || '-';
  document.getElementById('iMelt').textContent = el.melt != null ? `${el.melt}°C` : 'Tidak diketahui';
  document.getElementById('iBoil').textContent = el.boil != null ? `${el.boil}°C` : 'Tidak diketahui';
  document.getElementById('iDensity').textContent = el.density != null ? `${el.density} g/cm³` : 'Tidak diketahui';
  document.getElementById('iElecneg').textContent = el.eneg != null ? `${el.eneg} (Pauling)` : 'Tidak diketahui';
  document.getElementById('iRadius').textContent = el.radius != null ? `${el.radius} pm` : 'Tidak diketahui';
  document.getElementById('iDiscovered').textContent = el.discovered || '-';

  document.getElementById('iDesc').textContent = el.desc || '';

  const usesDiv = document.getElementById('iUses');
  usesDiv.innerHTML = '';
  (el.uses || []).forEach(u => {
    const tag = document.createElement('span');
    tag.className = 'use-tag';
    tag.textContent = u;
    usesDiv.appendChild(tag);
  });

  document.getElementById('modalOverlay').classList.add('active');

  // Draw 3D atom
  setTimeout(() => renderAtom3D(el), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  stopAtomAnimation();
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// ============================================================
// 3D ATOM RENDERER
// ============================================================
let atomAnimId = null;
let atomRotX = 0, atomRotY = 0;
let isDragging = false;
let lastMX = 0, lastMY = 0;
let atomZoom = 1;

function stopAtomAnimation() {
  if (atomAnimId) { cancelAnimationFrame(atomAnimId); atomAnimId = null; }
}

function renderAtom3D(el) {
  stopAtomAnimation();
  atomRotX = 0.3; atomRotY = 0;
  atomZoom = 1;

  const canvas = document.getElementById('atomCanvas');
  const ctx = canvas.getContext('2d');

  const protons = el.z;
  const neutrons = Math.max(0, Math.round(el.mass) - el.z);
  const shells = el.shells || getShells(el.z);

  // Responsive canvas
  const maxW = Math.min(canvas.parentElement.clientWidth - 30, 560);
  canvas.width = maxW;
  canvas.height = Math.min(320, maxW * 0.6);

  // Nucleus particles
  const nucleusParticles = buildNucleus(protons, neutrons);

  // Electron positions (orbital)
  let electronAngle = shells.map(() => 0);

  // Drag to rotate
  canvas.onmousedown = (e) => { isDragging = true; lastMX = e.clientX; lastMY = e.clientY; };
  canvas.onmousemove = (e) => {
    if (!isDragging) return;
    atomRotY += (e.clientX - lastMX) * 0.01;
    atomRotX += (e.clientY - lastMY) * 0.01;
    lastMX = e.clientX; lastMY = e.clientY;
  };
  canvas.onmouseup = () => { isDragging = false; };
  canvas.onmouseleave = () => { isDragging = false; };

  // Touch support
  canvas.ontouchstart = (e) => { isDragging = true; lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY; e.preventDefault(); };
  canvas.ontouchmove = (e) => {
    if (!isDragging) return;
    atomRotY += (e.touches[0].clientX - lastMX) * 0.015;
    atomRotX += (e.touches[0].clientY - lastMY) * 0.015;
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY; e.preventDefault();
  };
  canvas.ontouchend = () => { isDragging = false; };

  canvas.onwheel = (e) => {
    atomZoom += e.deltaY > 0 ? -0.08 : 0.08;
    atomZoom = Math.max(0.4, Math.min(2.5, atomZoom));
    e.preventDefault();
  };

  const SHELL_COLORS = ['#60a5fa','#34d399','#fbbf24','#f472b6','#a78bfa','#fb923c','#22d3ee'];

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 2 * 0.82 * atomZoom;

    // Draw glow bg
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale);
    grad.addColorStop(0, 'rgba(0,150,255,0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Auto rotate when not dragging
    if (!isDragging) atomRotY += 0.008;

    const cosX = Math.cos(atomRotX), sinX = Math.sin(atomRotX);
    const cosY = Math.cos(atomRotY), sinY = Math.sin(atomRotY);

    function project3D(x, y, z) {
      // Rotate Y
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      // Rotate X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const fov = 2.5;
      const pz = z2 + fov;
      const sx = cx + (x1 / pz) * scale;
      const sy = cy - (y2 / pz) * scale;
      return { x: sx, y: sy, z: z2, depth: pz };
    }

    // --- ORBITS ---
    shells.forEach((count, si) => {
      const r = getOrbitalRadius(si, shells.length);
      const color = SHELL_COLORS[si % SHELL_COLORS.length];

      // Draw ellipse for orbital
      const tilt = si * 0.4 + 0.2;
      ctx.save();
      ctx.strokeStyle = `${color}30`;
      ctx.lineWidth = 1;

      // Draw dashed orbit path
      const pts = 60;
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const ox = r * Math.cos(a);
        const oy = r * Math.sin(a) * Math.sin(tilt);
        const oz = r * Math.sin(a) * Math.cos(tilt);
        const p = project3D(ox, oy, oz);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // --- NUCLEUS PARTICLES ---
    const nucleusScale = Math.min(0.12, 0.05 + Math.log10(protons + neutrons + 1) * 0.04);
    let allToDraw = [];

    nucleusParticles.forEach(p => {
      const nx = p.x * nucleusScale;
      const ny = p.y * nucleusScale;
      const nz = p.z * nucleusScale;
      const proj = project3D(nx, ny, nz);
      allToDraw.push({ type: p.type, proj, r: 4 + nucleusScale * 20 });
    });

    // --- ELECTRONS ---
    shells.forEach((count, si) => {
      const r = getOrbitalRadius(si, shells.length);
      const tilt = si * 0.4 + 0.2;
      const baseAngle = electronAngle[si];
      const speed = 0.015 + si * 0.005;

      for (let ei = 0; ei < count; ei++) {
        const a = baseAngle + (ei / count) * Math.PI * 2;
        const ex = r * Math.cos(a);
        const ey = r * Math.sin(a) * Math.sin(tilt);
        const ez = r * Math.sin(a) * Math.cos(tilt);
        const proj = project3D(ex, ey, ez);
        allToDraw.push({ type: 'electron', proj, si, r: 4 });
      }

      electronAngle[si] += speed;
    });

    // Sort by depth
    allToDraw.sort((a, b) => a.proj.z - b.proj.z);

    // Draw all
    allToDraw.forEach(item => {
      const { x, y } = item.proj;
      if (item.type === 'proton') {
        const pRadius = item.r;
        const grd = ctx.createRadialGradient(x - pRadius*0.3, y - pRadius*0.3, 0, x, y, pRadius * 1.5);
        grd.addColorStop(0, '#fca5a5');
        grd.addColorStop(0.5, '#ef4444');
        grd.addColorStop(1, '#991b1b');
        ctx.beginPath();
        ctx.arc(x, y, pRadius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,100,100,0.5)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      } else if (item.type === 'neutron') {
        const nRadius = item.r;
        const grd = ctx.createRadialGradient(x - nRadius*0.3, y - nRadius*0.3, 0, x, y, nRadius * 1.5);
        grd.addColorStop(0, '#e2e8f0');
        grd.addColorStop(0.5, '#94a3b8');
        grd.addColorStop(1, '#475569');
        ctx.beginPath();
        ctx.arc(x, y, nRadius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.strokeStyle = 'rgba(148,163,184,0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      } else if (item.type === 'electron') {
        const eR = item.r;
        const eColor = SHELL_COLORS[item.si % SHELL_COLORS.length];
        const grd = ctx.createRadialGradient(x, y, 0, x, y, eR * 2.5);
        grd.addColorStop(0, '#ffffff');
        grd.addColorStop(0.3, eColor);
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, eR, 0, Math.PI * 2);
        ctx.fillStyle = eColor;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, eR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
    });

    // Shell count labels
    shells.forEach((count, si) => {
      const r = getOrbitalRadius(si, shells.length);
      const tilt = si * 0.4 + 0.2;
      const a = Math.PI * 1.15;
      const lx = r * Math.cos(a);
      const ly = r * Math.sin(a) * Math.sin(tilt);
      const lz = r * Math.sin(a) * Math.cos(tilt);
      const p = project3D(lx, ly, lz);

      ctx.fillStyle = `${SHELL_COLORS[si % SHELL_COLORS.length]}cc`;
      ctx.font = `bold ${10}px 'Share Tech Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`n${si+1}: ${count}e`, p.x, p.y);
    });

    // Info overlay
    ctx.fillStyle = 'rgba(0,212,255,0.7)';
    ctx.font = "bold 11px 'Share Tech Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText(`${el.z}p / ${neutrons}n`, 12, canvas.height - 10);

    atomAnimId = requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

function getOrbitalRadius(shellIndex, totalShells) {
  const baseR = 0.12;
  const spacing = 0.14;
  return baseR + shellIndex * spacing;
}

function buildNucleus(protons, neutrons) {
  const particles = [];
  const total = protons + neutrons;
  const r = Math.cbrt(total) * 2.5;

  // Fibonacci sphere distribution
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < total; i++) {
    const y = 1 - (i / (total - 1)) * 2;
    const rad = Math.sqrt(1 - y * y) * r;
    const theta = phi * i;
    particles.push({
      x: Math.cos(theta) * rad,
      y: y * r,
      z: Math.sin(theta) * rad,
      type: i < protons ? 'proton' : 'neutron'
    });
  }

  // Shuffle so protons and neutrons are mixed
  for (let i = particles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [particles[i], particles[j]] = [particles[j], particles[i]];
  }

  return particles;
}

function getShells(z) {
  // Calculate electron shell filling
  const shellMax = [2, 8, 18, 32, 32, 18, 8];
  const shells = [];
  let remaining = z;
  for (const max of shellMax) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, max);
    shells.push(count);
    remaining -= count;
  }
  return shells;
}

// ============================================================
// KEYBOARD
// ============================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
// INIT
// ============================================================
buildLegend();
buildTable();
