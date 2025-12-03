document.addEventListener('DOMContentLoaded', () =>{
    // listData();
    searchData();
});    

let username = 'P002:APBXP002';
let password = 'km8vNktCwERc';
let auth = btoa(`${username}:${password}`);
let datos;

let tableScroll = document.getElementById('table-scroll');
let search = document.getElementById('search');
let results = document.getElementById('results');

fetch('http://mycloudmms.com:81/api/EmailUser/',{
    headers:{
        'Authorization': `Basic ${auth}`
    },
}).then(function(response){
    return response.json();
}).then(function(data){
    console.log(data);
    datos = JSON.stringify(data);
    console.log(datos);
    
    //convertir datos en un array
    datos = JSON.parse(datos);
    console.log(datos);

    listData(datos);

  
    
}).catch(function(err){
    console.log(err);
});

  function listData(datos){
    
tableScroll.innerHTML = `
  <table id="tableContainer">
    <thead>
      <tr>
        <th data-type="string"><span class="text">Cluster</span></th>
        <th data-type="string"><span class="text">Phone</span></th>
        <th data-type="string"><span class="text">Email</span></th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
`;

const tableContainer = document.getElementById('tableContainer');
const tbody = tableContainer.querySelector('tbody');

// Fetch table
datos.forEach(item => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${item.providerName ?? ''}</td>
    <td>${item.phoneNumber ?? ''}</td>
    <td>${item.emailAddress ?? ''}</td>
  `;
  tbody.appendChild(tr);
});

results.innerHTML = 'Total results: ' + datos.length;

let currentSort = { index: -1, asc: true };

const ths = tableContainer.querySelectorAll('th');

ths.forEach((th, index) => {
  th.addEventListener('click', () => {
    const type = th.dataset.type || 'string';
    const rows = Array.from(tbody.querySelectorAll('tr'));

   // Update order based on new click
    if (currentSort.index === index) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort.index = index;
      currentSort.asc = true;
    }

    ths.forEach((h, i) => {
      h.classList.remove('asc', 'desc');
      if (i === currentSort.index) {
        h.classList.add(currentSort.asc ? 'asc' : 'desc');
      }
    });

    
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    rows.sort((a, b) => {
      let aVal = a.children[index].textContent.trim();
      let bVal = b.children[index].textContent.trim();

      if (type === 'number') {
        // Normaliza números en texto (ej. "1,234" o "+51 987...")
        const toNum = v => parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;
        aVal = toNum(aVal);
        bVal = toNum(bVal);
        return currentSort.asc ? aVal - bVal : bVal - aVal;
      } else {
        const cmp = collator.compare(aVal, bVal);
        return currentSort.asc ? cmp : -cmp;
      }
    });

    rows.forEach(r => tbody.appendChild(r));

    console.log(`✅ Ordenado por ${th.innerText} (${currentSort.asc ? 'ascendente ▲' : 'descendente ▼'})`);
  });
});

// Load file with asc order in first column
ths[0].click();   



}

function searchData(){
    search.addEventListener("input", e => {
        const inputText = e.target.value.toUpperCase().trim();

        const showFilter = datos.filter(item => 
            item.emailAddress.toUpperCase().includes(inputText) || 
            item.phoneNumber.toString().includes(inputText) ||
            item.providerName.toUpperCase().includes(inputText));
        
        if(showFilter.length === 0){
                tableScroll.innerHTML = '<h3>No results found</h3>';
                results.innerHTML = '';
        }else{
           
            listData(showFilter);
        }
        
    })
}   
