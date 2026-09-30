let value = 0;

const valueEl = document.getElementById('value');
const statusEl =document.getElementById('status');

function render(){
    valueEl.textContent = value;

    let message, className;
    if(value > 0){
        message = 'Число положительное';
        className = 'positive';
    } else if (value < 0){
        message = 'Число отрицательное';
        className= 'negative';
    } else {
        message = 'Число равно нулю';
        className = 'zero';
    }

    statusEl.textContent = message;
    statusEl.className = 'status' + className;
}

document.getElementById('btn-inc').addEventListener('click', () => {
    value +=1;
    render();
});

document.getElementById('btn-dec').addEventListener('click', () =>{
    value -= 1;
    render();
});

document.getElementById('btn-reset').addEventListener('click',()=> {
    value =0;
    render();
});

render();