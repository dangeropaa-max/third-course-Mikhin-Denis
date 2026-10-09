const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');          
const scale = 10;
const LOGICAL_W = canvas.width / scale;
const LOGICAL_H = canvas.height / scale;      

const bresBody = document.querySelector('#stepsTable tbody'); 
const ddaList = document.querySelector('#ddaList');
const bresList = document.querySelector('#bresList');          
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

function lineDDA(x1, y1, x2, y2, onPixel = null) {  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  if (steps === 0) {
    putPixel(x1, y1, 'blue');
    if (onPixel) onPixel(x1, y1);
    return;
  }

  const xStep = dx / steps;
  const yStep = dy / steps;

  let x = x1, y = y1;
  for (let i = 0; i <= steps; i++) {
    const px = Math.round(x);
    const py = Math.round(y);
    putPixel(px, py, 'blue');
    if (onPixel) onPixel(px, py);
    x += xStep;
    y += yStep;
  }
}

function lineBresenham(x1, y1, x2, y2, onPixel = null, onStep = null) {
  let x = x1, y = y1;
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;

  let error = dx - dy;
  let step = 0;

  while (true) {
    putPixel(x, y, 'red');
    if (onPixel) onPixel(x, y);

    if (x === x2 && y === y2) break;         

    const error2 = 2 * error;
    let movedX = false, movedY = false;

    if (error2 > -dy) { error -= dy; x += sx; movedX = true; }
    if (error2 < dx)  { error += dx; y += sy; movedY = true; }

    if (onStep) onStep(step, x, y, error, error2, movedX, movedY);
    step++;
  }
}

function addBresRow(step, x, y, error, error2, movedX, movedY) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${step}</td>
    <td>${x}</td>
    <td>${y}</td>
    <td>${error}</td>
    <td>${error2}</td>
    <td>${movedX ? '✓' : ''}</td>
    <td>${movedY ? '✓' : ''}</td>
  `;
  bresBody.appendChild(tr);
}

function addToList(list, x, y) {
  const li = document.createElement('li');
  li.textContent = `(${x}, ${y})`;
  list.appendChild(li);
}

document.querySelector('#build').addEventListener('click', () => {
  const x1 = +document.querySelector('#x1').value;
  const y1 = +document.querySelector('#y1').value;
  const x2 = +document.querySelector('#x2').value;
  const y2 = +document.querySelector('#y2').value;

  const algo = document.querySelector('#algo').value;
  const showCoords = document.querySelector('#showCoords').checked;

  clearCanvas();
  bresBody.innerHTML = '';
  ddaList.innerHTML = '';
  bresList.innerHTML = '';

  if (algo === 'dda' || algo === 'both') {
    lineDDA(x1, y1, x2, y2, showCoords ? (x, y) => addToList(ddaList, x, y) : null);
  }

  if (algo === 'bresenham' || algo === 'both') {
    lineBresenham(
      x1, y1, x2, y2,
      showCoords ? (x, y) => addToList(bresList, x, y) : null,
      (step, x, y, error, error2, mx, my) => addBresRow(step, x, y, error, error2, mx, my)
    );
  }
});

document.querySelector('#benchmark').addEventListener('click', () => {
  const N = 1000;

  function runLine(fn) {
    clearCanvas();
    for (let i = 0; i < N; i++) {
      const x1 = Math.floor(Math.random() * LOGICAL_W);
      const y1 = Math.floor(Math.random() * LOGICAL_H);
      const x2 = Math.floor(Math.random() * LOGICAL_W);
      const y2 = Math.floor(Math.random() * LOGICAL_H);
      fn(x1, y1, x2, y2);
    }
  }

  runLine(lineDDA);
  runLine(lineBresenham);

  const t1s = performance.now();
  runLine(lineDDA);
  const t1e = performance.now();

  const t2s = performance.now();
  runLine(lineBresenham);
  const t2e = performance.now();

  benchOut.textContent =
    `ЦДА:        ${(t1e - t1s).toFixed(2)} ms (${N} линий)\n` +
    `Брезенхем:  ${(t2e - t2s).toFixed(2)} ms (${N} линий)`;
});

clearCanvas();
lineBresenham(2, 2, 20, 8, null, (step, x, y, error, error2, mx, my) =>
  addBresRow(step, x, y, error, error2, mx, my)
);