const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;
const LOGICAL_W = canvas.width /scale;
const LOGICAL_H = canvas.height / scale;

const stepsBody = document.querySelector('#stepsTable tbody');
const codesDiv = document.querySelector('#codes');
const randomOut = document.querySelector('#randomResult');

const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;

function clearCanvas() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
}

function drawGrid(){
    ctx.strokeStyle ='#ddd';
    ctx.lineWidth = 1;
    for(let x = 0; x <= LOGICAL_W; x++){
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale,canvas.height);
        ctx.stroke();
    }

    for(let y = 0; y <= LOGICAL_H; y++){
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvas.width, y * scale);
        ctx.stroke();
    }
}

function drawLine(x1,y1,x2,y2, color ='black', width =1){
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1 * scale  , y1 * scale );
    ctx.lineTo(x2 * scale , y2 * scale );
    ctx.stroke();
}

function drawRect(rect, color = 'blue') {          
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    rect.xmin * scale, rect.ymin * scale,          
    (rect.xmax - rect.xmin) * scale,
    (rect.ymax - rect.ymin) * scale
  );
}

function getCode(x, y, rect){
    let code = INSIDE;
    if(x < rect.xmin) code |= LEFT;
    else if (x > rect.xmax) code |= RIGHT;

    if(y< rect.ymin) code |= TOP;
    else if (y > rect.ymax) code |= BOTTOM;

    return code;
}

function codeStr(code){
    return code.toString(2).padStart(4, '0');
}


function clipLine(x1, y1, x2, y2, rect){
    let code1 = getCode(x1, y1, rect);
    let code2 = getCode(x2,y2, rect);
    let step = 0;
    stepsBody.innerHTML='';

    while(true){
        addStepRow(step++, x1, y1, code1, x2, y2, code2, '-');

        if((code1 | code2) === 0){
            addStepRow(step, x1, y1, code1, x2, y2, code2, 'ACCEPT');
            return{x1,y1, x2, y2};
        }
        if((code1 & code2) !==0){
            addStepRow(step, x1, y1, code1, x2, y2, code2, 'REJECT');
            return null;
        }

        const codeOut = code1 !== 0 ? code1 : code2;
        let x, y, action;

        if(codeOut & TOP){
            const t = (rect.ymin - y1) / (y2 - y1);
            x = x1 + t * (x2 - x1);
            y = rect.ymin;
            action ='пересечение TOP';
        }

        else if (codeOut & BOTTOM){
            const t = (rect.ymax - y1) / (y2 - y1);
            x = x1 + t * (x2 - x1);
            y = rect.ymax;
            action = 'пересечение BOTTOM';
        }

        else if (codeOut & RIGHT){
             const t = (rect.xmax - x1) / (x2 - x1);
             x = rect.xmax;
             y = y1 + t * (y2 - y1);
             action = 'пересечение RIGHT';
        }

        else{
            const t = (rect.xmin - x1) / (x2 - x1);
            x = rect.xmin;
            y = y1 + t * (y2 - y1);
            action = 'пересечение LEFT';
        }

        addStepRow(step, x1, y1, code1, x2, y2, code2, action);

        if (codeOut === code1) {
        x1 = x; y1 = y;
        code1 = getCode(x1, y1, rect);
        } else {
            x2 = x; y2 = y;
             code2 = getCode(x2, y2, rect);
        }
    }
}

function addStepRow(step, x1, y1, code1, x2, y2, code2, action) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${step}</td>
    <td>(${x1.toFixed(1)}, ${y1.toFixed(1)})</td>
    <td>${codeStr(code1)}</td>
    <td>(${x2.toFixed(1)}, ${y2.toFixed(1)})</td>
    <td>${codeStr(code2)}</td>
    <td>${action}</td>
  `;
  stepsBody.appendChild(tr);
}

function readRect() {
  return {
    xmin: +document.querySelector('#xmin').value,
    ymin: +document.querySelector('#ymin').value,
    xmax: +document.querySelector('#xmax').value,
    ymax: +document.querySelector('#ymax').value,
  };
}

document.querySelector('#build').addEventListener('click', () => {
  const rect = readRect();
  if (rect.xmin >= rect.xmax || rect.ymin >= rect.ymax) {
    alert('Некорректное окно: должно быть xmin < xmax и ymin < ymax');
    return;
  }

  const x1 = +document.querySelector('#x1').value;
  const y1 = +document.querySelector('#y1').value;
  const x2 = +document.querySelector('#x2').value;
  const y2 = +document.querySelector('#y2').value;

  clearCanvas();
  drawRect(rect);
  
  drawLine(x1, y1, x2, y2, 'gray', 1);

  const codeA = getCode(x1, y1, rect);
  const codeB = getCode(x2, y2, rect);
  codesDiv.innerHTML = `A: ${codeStr(codeA)}<br>B: ${codeStr(codeB)}`;

  const clipped = clipLine(x1, y1, x2, y2, rect);

  if (clipped) {
    drawLine(clipped.x1, clipped.y1, clipped.x2, clipped.y2, 'red', 3);
  } else {
    codesDiv.innerHTML += '<br><b>Отрезок полностью снаружи</b>';
  }
});

document.querySelector('#polyline').addEventListener('click', () => {
  const rect = readRect();
  const points = [
    { x: 2,  y: 5  },
    { x: 12, y: 2  },
    { x: 20, y: 18 },
    { x: 30, y: 8  },
    { x: 36, y: 22 },
  ];

  clearCanvas();
  drawRect(rect);

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    drawLine(p1.x, p1.y, p2.x, p2.y, 'gray', 1);

    const c = clipLine(p1.x, p1.y, p2.x, p2.y, rect);
    if (c) drawLine(c.x1, c.y1, c.x2, c.y2, 'red', 3);
  }
});

document.querySelector('#randomTest').addEventListener('click', () => {
  const rect = readRect();
  const N = 200;

  let accepted = 0, clippedCount = 0, rejected = 0;

  for (let i = 0; i < N; i++) {
    const x1 = Math.floor(Math.random() * LOGICAL_W);
    const y1 = Math.floor(Math.random() * LOGICAL_H);
    const x2 = Math.floor(Math.random() * LOGICAL_W);
    const y2 = Math.floor(Math.random() * LOGICAL_H);

    const c1 = getCode(x1, y1, rect);
    const c2 = getCode(x2, y2, rect);

    if ((c1 | c2) === 0) { accepted++; continue; }
    if ((c1 & c2) !== 0) { rejected++; continue; }

    const c = clipLine(x1, y1, x2, y2, rect);
    if (c) clippedCount++; else rejected++;
  }

  randomOut.textContent =
    `Случайных отрезков: ${N}\n` +
    `Принято без изменения: ${accepted}\n` +
    `Отсечено:              ${clippedCount}\n` +
    `Отброшено:             ${rejected}`;
});

clearCanvas();
drawRect(readRect());
const initC = clipLine(2, 2, 30, 25, readRect());
if (initC) drawLine(initC.x1, initC.y1, initC.x2, initC.y2, 'red', 3);