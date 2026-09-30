const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const scale = 10;

const LOGICAL_W = canvas.width / scale;
const LOGICAL_H = canvas.height / scale;

const tableBody = document.querySelector('#stepsTable tbody');

function clearCanvas() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    drawGrid();
}

function drawGrid(){
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for(let x = 0; x<= LOGICAL_W; x++){
        ctx.beginPath();
        ctx.moveTo(x*scale, 0);
        ctx.lineTo(x * scale, canvas.height);
        ctx.stroke();
    }

    for(let y = 0; y <= LOGICAL_H; y++){
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(canvas.width, y * scale);
        ctx.stroke();
    }
}

function putPixel(x, y, color ='black'){
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, scale, scale);
}

function lineDDA(x1, y1, x2, y2, log = true){
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (log) tableBody.innerHTML = '';

    if(steps === 0) {
        putPixel(x1, y1, 'red');
        if (log) addRow(0, x1, y1, x1, y1);
        return;
    }

    const xStep = dx / steps;
    const yStep = dy / steps;

    let x = x1;
    let y = y1;

    for(let i = 0; i<= steps; i+=1){
        const px = Math.round(x);
        const py = Math.round(y);
        putPixel(px, py, 'red');
        if(log) addRow(i, x, y, px, py);
        x+= xStep;
        y += yStep;
    }
}

function addRow(i, x, y, px, py){
    const tr = document.createElement('tr');
    tr.innerHTML =
    `<td>${i}</td>
    <td>${x.toFixed(2)}</td>
    <td>${y.toFixed(2)}</td>
    <td>${px}</td>
    <td>${py}</td> `;

    tableBody.appendChild(tr);
}

document.querySelector('#build').addEventListener('click', () =>{
    const x1 = +document.querySelector('#x1').value;
    const y1 = +document.querySelector('#y1').value;
    const x2 = +document.querySelector('#x2').value;
    const y2 = +document.querySelector('#y2').value;

    clearCanvas();
    lineDDA(x1,y1,x2,y2);
});

clearCanvas();
lineDDA(2,2,20,8, true);