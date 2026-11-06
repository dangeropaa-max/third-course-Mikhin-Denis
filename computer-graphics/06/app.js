const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;
const W = canvas.width / scale;
const H = canvas.height / scale;

const shapes = {
  inside: [
    { x: 15, y: 12 }, { x: 40, y: 12 },
    { x: 40, y: 22 }, { x: 15, y: 22 },
  ],
  outside: [
    { x: 50, y: 30 }, { x: 55, y: 30 },
    { x: 55, y: 35 }, { x: 50, y: 35 },
  ],
  one: [
    { x: 5, y: 15 }, { x: 20, y: 10 },
    { x: 20, y: 20 }, { x: 5, y: 20 },
  ],
  two: [
    { x: 5, y: 15 }, { x: 50, y: 15 },
    { x: 50, y: 25 }, { x: 5, y: 25 },
  ],
  all: [
    { x: 2, y: 2 }, { x: 55, y: 5 },
    { x: 50, y: 35 }, { x: 5, y: 30 },
  ],
  concave: [
    { x: 5, y: 5 }, { x: 25, y: 15 },
    { x: 50, y: 5 }, { x: 45, y: 30 },
    { x: 10, y: 30 },
  ],
  vertexOnEdge: [
    { x: 10, y: 8 }, { x: 25, y: 15 },
    { x: 40, y: 20 }, { x: 30, y: 30 },
  ],
  edgeOnEdge: [
    { x: 10, y: 8 }, { x: 45, y: 8 },
    { x: 45, y: 25 }, { x: 10, y: 25 },
  ],
};

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

function drawPolygon(points, color = 'blue', width = 2, fillColor = null) {
  if (points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x * scale  , points[0].y * scale );
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * scale  , points[i].y * scale  );
  }
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawRect(rect, color = 'red') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    rect.xmin * scale, rect.ymin * scale,
    (rect.xmax - rect.xmin) * scale,
    (rect.ymax - rect.ymin) * scale
  );
}

function intersectVertical(a, b, xBoundary) {
  const t = (xBoundary - a.x) / (b.x - a.x);
  return { x: xBoundary, y: a.y + t * (b.y - a.y) };
}

function intersectHorizontal(a, b, yBoundary) {
  const t = (yBoundary - a.y) / (b.y - a.y);
  return { x: a.x + t * (b.x - a.x), y: yBoundary };
}

function clipAgainstBoundary(polygon, isInside, getIntersection) {
  const output = [];
  if (polygon.length === 0) return output;

  let s = polygon[polygon.length - 1];

  for (const p of polygon) {
    const sInside = isInside(s);
    const pInside = isInside(p);

    if (sInside && pInside) {
      output.push(p);
    } else if (sInside && !pInside) {
      output.push(getIntersection(s, p));
    } else if (!sInside && pInside) {
      output.push(getIntersection(s, p));
      output.push(p);
    }

    s = p;
  }

  return output;
}

function clipPolygon(polygon, rect) {
  let result = polygon;
  const stages = { original: polygon.slice() };

  result = clipAgainstBoundary(result,
    p => p.x >= rect.xmin,
    (a, b) => intersectVertical(a, b, rect.xmin));
  stages.left = result.slice();
  if (result.length === 0) {
    stages.right = [];
    stages.top = [];
    stages.bottom = [];
    return { result, stages };
  }

  result = clipAgainstBoundary(result,
    p => p.x <= rect.xmax,
    (a, b) => intersectVertical(a, b, rect.xmax));
  stages.right = result.slice();
  if (result.length === 0) {
    stages.top = [];
    stages.bottom = [];
    return { result, stages };
  }

  result = clipAgainstBoundary(result,
    p => p.y >= rect.ymin,
    (a, b) => intersectHorizontal(a, b, rect.ymin));
  stages.top = result.slice();
  if (result.length === 0) {
    stages.bottom = [];
    return { result, stages };
  }

  result = clipAgainstBoundary(result,
    p => p.y <= rect.ymax,
    (a, b) => intersectHorizontal(a, b, rect.ymax));
  stages.bottom = result.slice();

  return { result, stages };
}

function renderStagesTable(stages) {
  const tbody = document.querySelector('#stagesTable tbody');
  tbody.innerHTML = '';

  const labels = {
    original: 'Исходный',
    left: 'LEFT',
    right: 'RIGHT',
    top: 'TOP',
    bottom: 'BOTTOM',
  };

  for (const key of ['original', 'left', 'right', 'top', 'bottom']) {
    const arr = stages[key] || [];
    const tr = document.createElement('tr');
    const coords = arr.map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join(' ');
    tr.innerHTML = `<td>${labels[key]}</td><td>${arr.length}</td><td>${coords}</td>`;
    tbody.appendChild(tr);
  }
}

document.querySelector('#build').addEventListener('click', () => {
  const rect = {
    xmin: +document.querySelector('#xmin').value,
    ymin: +document.querySelector('#ymin').value,
    xmax: +document.querySelector('#xmax').value,
    ymax: +document.querySelector('#ymax').value,
  };

  if (rect.xmin >= rect.xmax || rect.ymin >= rect.ymax) {
    alert('Некорректное окно');
    return;
  }

  const shapeKey = document.querySelector('#shape').value;
  const stage = document.querySelector('#stage').value;
  const polygon = shapes[shapeKey];

  clearCanvas();
  drawRect(rect);

  drawPolygon(polygon, 'gray', 1);

  const { stages } = clipPolygon(polygon, rect);

  const stagePoly = stages[stage] || [];
  if (stagePoly.length > 0) {
    drawPolygon(stagePoly, 'red', 2, 'rgba(255,0,0,0.2)');
  }

  renderStagesTable(stages);
});

clearCanvas();
drawRect({ xmin: 10, ymin: 8, xmax: 45, ymax: 28 });
drawPolygon(shapes.all, 'gray', 1);
const init = clipPolygon(shapes.all, { xmin: 10, ymin: 8, xmax: 45, ymax: 28 });
if (init.result.length > 0) {
  drawPolygon(init.result, 'red', 2, 'rgba(255,0,0,0.2)');
}
renderStagesTable(init.stages);