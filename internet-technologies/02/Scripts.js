const values = [];

function addValue(value) {
  values.push(value);
  render();
}

function removeLastValue() {
  values.pop();
  render();
}

function clearValues() {
  values.length = 0;
  render();
}

function getStatistics(value) {
  if (value.length === 0) {
    return {
      count: 0,
      sum: 0,
      min: null,
      max: null,
      average: null,
    };
  }

  let sum = 0;
  let min = value[0];
  let max = value[0];

  for (const v of value) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  return {
    count: value.length,
    sum: sum,
    min: min,
    max: max,
    average: sum / value.length,
  };
}

function render() {
  const list = document.querySelector('#numbers-list');
  list.innerHTML = '';

  for (const value of values) {
    const li = document.createElement('li');
    li.textContent = value;
    list.appendChild(li);
  }

  const stats = getStatistics(values);

  document.querySelector('#stat-count').textContent = stats.count;
  document.querySelector('#stat-sum').textContent = stats.sum;
  document.querySelector('#stat-average').textContent =
    stats.average === null ? '—' : stats.average.toFixed(2);
  document.querySelector('#stat-min').textContent =
    stats.min === null ? '—' : stats.min;
  document.querySelector('#stat-max').textContent =
    stats.max === null ? '—' : stats.max;
}

const input = document.querySelector('#number-input');
const errorEl = document.querySelector('#error');

document.querySelector('#add-btn').addEventListener('click', () => {
  errorEl.textContent = '';
  const raw = input.value.trim();

  if (raw === '') {
    errorEl.textContent = 'Введите число.';
    return;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    errorEl.textContent = 'Это не число.';
    return;
  }

  addValue(value);
  input.value = '';
  input.focus();
});

document.querySelector('#remove-btn').addEventListener('click', () => {
  errorEl.textContent = '';
  removeLastValue();
});

document.querySelector('#clear-btn').addEventListener('click', () => {
  errorEl.textContent = '';
  clearValues();
});