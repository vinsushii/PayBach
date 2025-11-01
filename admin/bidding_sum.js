// Will handle filtering, table rendering, and CSV export later

const tableBody = document.querySelector('#bidsTable tbody');
const noResults = document.getElementById('noResults');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const filterBtn = document.getElementById('filterBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportCsv');

// Placeholder palang waiting for DB connection
function renderRows(rows) {
  tableBody.innerHTML = '';
  if (!rows || rows.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.date}</td>
      <td>${row.start}</td>
      <td>${row.last}</td>
      <td>${row.type}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Temporary lang just to show empty table
document.addEventListener('DOMContentLoaded', () => {
  renderRows([]);
});
