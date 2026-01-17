const form = document.getElementById('form');
const text = document.getElementById('tit');
const amount = document.getElementById("amt");
const options = document.getElementById('enter');
const tabledata = document.getElementById('list');
const span = document.getElementById('total-expense');

// ==== filters ====
const filterSelect = document.getElementById('filters');
const dateFilter = document.getElementById('dateFilter');
const clearDateBtn = document.getElementById('clearDateBtn');

// ==== theme ====
const mode = document.getElementById('mode');

// ======== function to add rows ========
function addExpenseRow(expense){
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>${expense.date}</td>
    <td>${expense.title}</td>
    <td>${expense.category}</td>
    <td class="amt">₹${expense.amount}</td>
    <td><button class="delete-btn">Delete</button></td>
    `;

    tabledata.appendChild(tr);
}

// ======== function to update total when filtered ========
function updateTotal(){
    const rows = tabledata.querySelectorAll('tr');
    let total = 0;
    rows.forEach( row => {
        if(row.style.display !== "none"){
            const amt = Number(row.querySelector('.amt').textContent.replace("₹",""));
            total += amt;
        }
    });
    span.innerText = total;
}

// ======== Form submission ========
form.addEventListener('submit', function(event){
    event.preventDefault();

    const title = text.value;
    const amt = Number(amount.value);
    const select = options.value;

    const date = new Date().toISOString().split('T')[0];

    const expense = { date, title, category: select, amount: amt };
    
    // saving to local storage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(expense);
    localStorage.setItem('expenses',JSON.stringify(expenses));

    addExpenseRow(expense); /*adding row */

    // ensure newly added row is visible immediately (ignore current filters briefly)
    const newRow = tabledata.lastElementChild;

    form.reset();

    applyFilters();
    if(newRow && newRow.style.display === "none"){
        newRow.style.display = "";
        // update total to include the newly visible row
        updateTotal();
    }
});

// ======== DELETE ROW ========
tabledata.addEventListener('click', function(event){
    if(event.target.classList.contains("delete-btn")){
        const row = event.target.closest('tr');
        const amttxt = row.querySelector('.amt').textContent;
        const amt = Number(amttxt.replace("₹",""));

        const title = row.children[1].textContent;
        const category = row.children[2].textContent;
        const date = row.children[0].textContent;

        // remove from json storage
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = expenses.filter(exp => !(exp.date === date && exp.title === title && 
                                        exp.category === category && exp.amount === amt));
        
        localStorage.setItem('expenses',JSON.stringify(expenses));

        row.remove();

        applyFilters();
    }
});

// ======== FILTERS FUNCTION ========
function applyFilters(){
    const selectedCategory = filterSelect.value || "📋 All";
    const selectedDate = dateFilter.value || ""; 
    // month filter removed; only category + date filter used

    const rows = tabledata.querySelectorAll('tr');
    let total = 0;

    rows.forEach(row => {
        const rowCategory = row.children[2].textContent;
        const rowDate = row.children[0]. textContent;
        const rowMonth = rowDate.slice(0,7);
        const amount = Number(row.querySelector('.amt').textContent.replace("₹",""));

        // checking all filters
        let categoryMatch = (selectedCategory === "📋 All" || rowCategory === selectedCategory);
        let dateMatch = (selectedDate === "" || rowDate === selectedDate);
        if(categoryMatch && dateMatch){
            row.style.display = "";
            total += amount;
        }else{
            row.style.display = "none";
        }
    });

    span.innerText = total;
}

// ======== FILTER EVENTS ========
filterSelect.addEventListener("change", applyFilters);
dateFilter.addEventListener("input", applyFilters);

// ======== CLEAR DATE FILTER ========
clearDateBtn.addEventListener("click", function(event){
    event.preventDefault();
    dateFilter.value = "";
    applyFilters();
});

// ======== LOAD DATA ON PAGE LOAD ========
window.addEventListener('DOMContentLoaded', () => {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.forEach( exp => addExpenseRow(exp));

    applyFilters();

    // Load theme
    const theme = localStorage.getItem('theme') || 'light';
    if(theme === 'dark'){
        document.body.classList.add('dark');
        mode.innerText = "🔆Lightmode";
    } else {
        mode.innerText = "🌙Darkmode";
    }
});

// ======== THEME CHANGING ========
mode.addEventListener('click', () =>{
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme',theme);
    if(theme === "dark"){
        mode.innerText = "🔆Lightmode";
    }else{
        mode.innerText = "🌙Darkmode";
    }
});