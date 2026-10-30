const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;
const W = canvas.width / scale;   
const H = canvas.height / scale;

const EMPTY = 0;
const BORDER = 1;
const FILL = 2;

let grid = [];     
let visitOrder = [];

function makeGrid() {
  grid = Array.from({ length: H }, () => Array(W).fill(EMPTY));
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
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

function render() {
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (grid[y][x] === BORDER) drawCell(x, y, 'black');
      else if (grid[y][x] === FILL) drawCell(x, y, 'orange');
    }
  }
}

function drawLineBres(x1, y1, x2, y2){
    let x = x1, y = y1;
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2? 1: -1;
    const sy = y1< y2? 1:-1;
    let error = dx - dy;

    while(true){
        if(x >= 0 && x< W && y >= 0 && y <H){
            grid[y][x] =BORDER;
        }
        if(x=== x2 && y === y2) break;

        const e2 = 2 * error;
        if(e2 > -dy){error -= dy; x += sx;}
        if(e2< dx){error += dx; y +=sy;}
    }
}

function drawPolygon(points) {
  for (let i = 0; i < points.length - 1; i++) {
    drawLineBres(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }
}

const shapes = {
  rect: [
    { x: 10, y: 8 },
    { x: 40, y: 8 },
    { x: 40, y: 25 },
    { x: 10, y: 25 },
    { x: 10, y: 8 },
  ],
  triangle: [
    { x: 30, y: 5 },
    { x: 50, y: 30 },
    { x: 10, y: 30 },
    { x: 30, y: 5 },
  ],
  convex: [
    { x: 30, y: 5 },
    { x: 50, y: 15 },
    { x: 45, y: 30 },
    { x: 15, y: 30 },
    { x: 10, y: 15 },
    { x: 30, y: 5 },
  ],
  concave: [
    { x: 10, y: 5 },
    { x: 30, y: 10 },
    { x: 50, y: 5 },
    { x: 45, y: 30 },
    { x: 15, y: 30 },
    { x: 10, y: 5 },
  ],
  open: [
    { x: 10, y: 10 },
    { x: 40, y: 10 },
    { x: 40, y: 25 },
    
  ],
};

function floodFill(startX, startY){
    visitOrder = [];
    const stack = [{x:startX, y:startY}];

    while(stack.length > 0){
        const {x,y} = stack.pop();

        if(x<0|| x>= W || y < 0 || y>= H) continue;
        if(grid[y][x] !== EMPTY) continue;

        grid[y][x] = FILL;
        visitOrder.push({x,y});

        stack.push({ x: x + 1, y });
        stack.push({ x: x - 1, y });
        stack.push({ x, y: y + 1 });
        stack.push({ x, y: y - 1 });
    }
}

function getIntersections(points, y) {
  const xs = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];

    if (a.y === b.y) continue;

    const yMin = Math.min(a.y, b.y);
    const yMax = Math.max(a.y, b.y);

    if (y < yMin || y >= yMax) continue;

    const x = a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y);
    xs.push(x);
  }

  xs.sort((a, b) => a - b);
  return xs;
}

function scanlineFill(points) {
  const ys = points.map(p => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  for (let y = yMin; y <= yMax; y++) {
    const xs = getIntersections(points, y);

    for (let i = 0; i < xs.length; i += 2) {
      const xStart = Math.ceil(xs[i]);
      const xEnd = Math.floor(xs[i + 1]);

      for (let x = xStart; x <= xEnd; x++) {
        if (x >= 0 && x < W && y >= 0 && y < H && grid[y][x] === EMPTY) {
          grid[y][x] = FILL;
        }
      }
    }
  }
}

function resetWithShape() {
  makeGrid();
  const key = document.querySelector('#shape').value;
  drawPolygon(shapes[key]);
  render();
}

document.querySelector('#floodBtn').addEventListener('click', () => {
  resetWithShape();
  const cx = Math.floor(W / 2);
  const cy = Math.floor(H / 2);
  floodFill(cx, cy);
  render();
});

document.querySelector('#scanBtn').addEventListener('click', () => {
  resetWithShape();
  const key = document.querySelector('#shape').value;
  scanlineFill(shapes[key]);
  render();
});

document.querySelector('#clearBtn').addEventListener('click', resetWithShape);

document.querySelector('#showRow').addEventListener('click', () => {
  const key = document.querySelector('#shape').value;
  const y = +document.querySelector('#scanY').value;
  const xs = getIntersections(shapes[key], y);

  let text = `y = ${y}\nX: ${xs.map(v => v.toFixed(1)).join(', ')}\n`;

  const intervals = [];
  for (let i = 0; i < xs.length; i += 2) {
    const a = Math.ceil(xs[i]);
    const b = Math.floor(xs[i + 1]);
    intervals.push(`${a}..${b}`);
  }
  text += `fill: ${intervals.join(', ')}`;

  document.querySelector('#rowTable').textContent = text;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / scale);
  const y = Math.floor((e.clientY - rect.top) / scale);

  resetWithShape();
  floodFill(x, y);
  render();
});

resetWithShape();

