const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;
const LOGICAL_W = canvas.width / scale;
const LOGICAL_H = canvas.height / scale;

const stepsBody = document.querySelector('#stepsTable tbody');
const symList = document.querySelector('#symList');
const benchOut = document.querySelector('#benchmarkResult');

function clearCanvas() {
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

function drawGrid() {
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  for (let x = 0; x <= LOGICAL_W; x++) {
    ctx.beginPath();
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= LOGICAL_H; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * scale);
    ctx.lineTo(canvas.width, y * scale);
    ctx.stroke();
  }
}

function putPixel(x, y, color = 'black') {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

function plot8(cx, cy, x, y, color = 'black') {
  putPixel(cx + x, cy + y, color);
  putPixel(cx + y, cy + x, color);
  putPixel(cx - x, cy + y, color);
  putPixel(cx - y, cy + x, color);
  putPixel(cx + x, cy - y, color);
  putPixel(cx + y, cy - x, color);
  putPixel(cx - x, cy - y, color);
  putPixel(cx - y, cy - x, color);
}

function circleMidpoint(cx, cy, r, onStep = null, highlightStep = -1) {
  let x = 0;
  let y = r;
  let d = 1 - r;
  let step = 0;

  while (x <= y) {
    const dBefore = d;
    let decision;

    const color = (step === highlightStep) ? 'orange' : 'red';
    plot8(cx, cy, x, y, color);

    if (onStep) onStep(step, x, y, dBefore, null, null, decision);
    if (step === highlightStep) fillSymList(cx, cy, x, y);

    if (d < 0) {
      d += 2 * x + 3;
      decision = 'E';
    } else {
      d += 2 * (x - y) + 5;
      y -= 1;
      decision = 'SE';
    }

    if (onStep) onStep(step, x, y, dBefore, decision, d, null);

    x += 1;
    step++;
  }
}

function circleFormula(cx, cy, r) {
  for (let x = 0; x <= r / Math.SQRT2; x++) {
    const y = Math.round(Math.sqrt(r * r - x * x));
    plot8(cx, cy, x, y, 'blue');
  }
}

function addStepRow(step, x, y, dBefore, decision, dAfter) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${step}</td>
    <td>${x}</td>
    <td>${y}</td>
    <td>${dBefore}</td>
    <td>${decision ?? ''}</td>
    <td>${dAfter ?? ''}</td>
  `;
  stepsBody.appendChild(tr);
}

function fillSymList(cx, cy, x, y) {
  symList.innerHTML = '';
  const pts = [
    [cx + x, cy + y], [cx + y, cy + x],
    [cx - x, cy + y], [cx - y, cy + x],
    [cx + x, cy - y], [cx + y, cy - x],
    [cx - x, cy - y], [cx - y, cy - x],
  ];
  for (const [px, py] of pts) {
    const li = document.createElement('li');
    li.textContent = `(${px}, ${py})`;
    symList.appendChild(li);
  }
}

document.querySelector('#build').addEventListener('click', () => {
  const cx = +document.querySelector('#cx').value;
  const cy = +document.querySelector('#cy').value;
  const r  = +document.querySelector('#r').value;

  const method = document.querySelector('#method').value;
  const highlight = document.querySelector('#highlight').checked;

  if (r <= 0) {
    alert('Радиус должен быть больше 0');
    return;
  }

  clearCanvas();
  stepsBody.innerHTML = '';
  symList.innerHTML = '';

  const highlightStep = highlight ? Math.floor(r / 2) : -1;

  if (method === 'midpoint' || method === 'both') {
    circleMidpoint(cx, cy, r,
      (step, x, y, dBefore, decision, dAfter) => {
        if (decision !== null || dAfter !== null) {
          addStepRow(step, x, y, dBefore, decision, dAfter);
        }
      },
      highlightStep
    );
  }

  if (method === 'formula' || method === 'both') {
    circleFormula(cx, cy, r);
  }
});

document.querySelector('#benchmark').addEventListener('click', () => {
  const N = 1000;
  const r = 30;

  function run(fn) {
    clearCanvas();
    for (let i = 0; i < N; i++) {
      const cx = Math.floor(Math.random() * LOGICAL_W);
      const cy = Math.floor(Math.random() * LOGICAL_H);
      fn(cx, cy, r);
    }
  }

  run(circleMidpoint);
  run(circleFormula);

  const t1s = performance.now();
  run(circleMidpoint);
  const t1e = performance.now();

  const t2s = performance.now();
  run(circleFormula);
  const t2e = performance.now();

  benchOut.textContent =
    `Midpoint:      ${(t1e - t1s).toFixed(2)} ms (${N} окружностей)\n` +
    `Формула+sqrt:  ${(t2e - t2s).toFixed(2)} ms (${N} окружностей)`;
});

clearCanvas();
circleMidpoint(20, 15, 5,
  (step, x, y, dBefore, decision, dAfter) => {
    if (decision !== null || dAfter !== null) {
      addStepRow(step, x, y, dBefore, decision, dAfter);
    }
  },
  -1
);