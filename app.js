  document.addEventListener('DOMContentLoaded', () =>{
    // listData();
    searchData();
});    
// Manejo de tabs
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.getAttribute("data-tab");

    // Quitar active de todos los botones
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    // Ocultar todos los contenidos
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    // Mostrar el tab seleccionado
    document.getElementById(tab).classList.add("active");
  });
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

    
   
    /* 
    tableScroll.innerHTML = '<table id="tableContainer"><thead><tr><th><span class="text">Cluster</span></th><th><span class="text">Phone</span></th><th><span class="text">Email</span></th></tr></thead></table>';
    const tableContainer = document.getElementById('tableContainer');
   datos.forEach(item => {
       const elements = document.createElement('tr');
       elements.innerHTML = `<td>${item.providerName}</td><td>${item.phoneNumber}</td><td>${item.emailAddress}</td>`;
       tableContainer.appendChild(elements);
   });
   results.innerHTML = 'Total results: ' + datos.length;
*/
   // Generar tabla con cabeceras
// Generar tabla con cabeceras
// Generar tabla con cabeceras

// Render de la tabla
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

// Poblar filas
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

// --- Estado de orden global ---
let currentSort = { index: -1, asc: true };

const ths = tableContainer.querySelectorAll('th');

ths.forEach((th, index) => {
  th.addEventListener('click', () => {
    const type = th.dataset.type || 'string';
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Determinar dirección: si es la misma columna, alterna; si es otra, empieza ascendente
    if (currentSort.index === index) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort.index = index;
      currentSort.asc = true;
    }

    // Actualizar flechas: limpiar otras columnas, aplicar solo a la actual
    ths.forEach((h, i) => {
      h.classList.remove('asc', 'desc');
      if (i === currentSort.index) {
        h.classList.add(currentSort.asc ? 'asc' : 'desc');
      }
    });

    // Comparador robusto
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

// --- ORDENAR AUTOMÁTICAMENTE POR LA PRIMERA COLUMNA ---
ths[0].click();   // Simula un clic en el primer encabezado



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
