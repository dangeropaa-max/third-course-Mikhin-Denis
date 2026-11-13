const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;
const W = canvas.width / scale;
const H = canvas.height / scale;

let original = []; 
let current = [];
let currentMatrix = null;

function clearCanvas() {
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

function drawGrid() {
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x++) {
    ctx.beginPath();
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * scale);
    ctx.lineTo(canvas.width, y * scale);
    ctx.stroke();
  }
}

function drawPolygon(points, color = 'blue', width = 2) {
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x * scale, points[0].y * scale);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * scale, points[i].y * scale);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawMarker(x, y, color = 'green') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, 5, 0, Math.PI * 2);
  ctx.fill();
}

function translation(tx, ty) {
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1],
  ];
}

function scaling(sx, sy) {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ];
}

function rotation(degrees) {
  const a = degrees * Math.PI / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    [c, -s, 0],
    [s,  c, 0],
    [0,  0, 1],
  ];
}

function multiplyMatrices(a, b) {
  const c = [[0,0,0],[0,0,0],[0,0,0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        c[i][j] += a[i][k] * b[k][j];
  return c;
}

function transformPoint(m, p) {
  return {
    x: m[0][0]*p.x + m[0][1]*p.y + m[0][2],
    y: m[1][0]*p.x + m[1][1]*p.y + m[1][2],
  };
}

function buildMatrix() {
  const tx = +document.querySelector('#tx').value;
  const ty = +document.querySelector('#ty').value;
  const sx = +document.querySelector('#sx').value;
  const sy = +document.querySelector('#sy').value;
  const angle = +document.querySelector('#angle').value;
  const cx = +document.querySelector('#cx').value;
  const cy = +document.querySelector('#cy').value;
  const order = document.querySelector('#order').value;

  const T = translation(tx, ty);
  const S = scaling(sx, sy);
  const R = rotation(angle);

  const Tc = translation(cx, cy);
  const Tnc = translation(-cx, -cy);

  const R_around_c = multiplyMatrices(multiplyMatrices(Tc, R), Tnc);
  
  const S_around_c = multiplyMatrices(multiplyMatrices(Tc, S), Tnc);

  if (order === 'TR') {
    return multiplyMatrices(T, R_around_c);
  }

  if (order === 'RT') {
    return multiplyMatrices(R_around_c, T);
  }

  return multiplyMatrices(R_around_c, S_around_c);
}

function render() {
  clearCanvas();

  drawPolygon(original, 'blue', 2);

  drawPolygon(current, 'red', 2);

  const cx = +document.querySelector('#cx').value;
  const cy = +document.querySelector('#cy').value;
  drawMarker(cx, cy, 'green');

  const tbody = document.querySelector('#verticesTable tbody');
  tbody.innerHTML = '';
  for (let i = 0; i < original.length; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>P${i}</td>
      <td>${original[i].x.toFixed(2)}</td>
      <td>${original[i].y.toFixed(2)}</td>
      <td>${current[i].x.toFixed(2)}</td>
      <td>${current[i].y.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  }

  if (currentMatrix) {
    document.querySelector('#matrixOut').textContent =
      currentMatrix.map(row =>
        row.map(v => v.toFixed(2).padStart(7)).join(' ')
      ).join('\n');
  } else {
    document.querySelector('#matrixOut').textContent = '—';
  }
}

document.querySelector('#apply').addEventListener('click', () => {
  currentMatrix = buildMatrix();
  current = original.map(p => transformPoint(currentMatrix, p));
  render();
});

document.querySelector('#reset').addEventListener('click', () => {
  current = original.map(p => ({ ...p }));
  currentMatrix = null;
  render();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  
  const x = Math.round((e.clientX - rect.left) / scale);
  const y = Math.round((e.clientY - rect.top) / scale);

  original.push({ x, y });
  
  current = original.map(p => ({ ...p }));
  currentMatrix = null;
  
  render();
});

document.querySelector('#clearPoly').addEventListener('click', () => {
  original = [];
  current = [];
  currentMatrix = null;
  render();
});

render();