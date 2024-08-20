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
    referrerPolicy: "unsafe-url"
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

    
   
    tableScroll.innerHTML = '<table id="tableContainer"><thead><tr><th><span class="text">Cluster</span></th><th><span class="text">Phone</span></th><th><span class="text">Email</span></th></tr></thead></table>';
    const tableContainer = document.getElementById('tableContainer');
   datos.forEach(item => {
       const elements = document.createElement('tr');
       elements.innerHTML = `<td>${item.providerName}</td><td>${item.phoneNumber}</td><td>${item.emailAddress}</td>`;
       tableContainer.appendChild(elements);
   });
   results.innerHTML = 'Total results: ' + datos.length;
}

function searchData(){
    search.addEventListener("input", e => {
        const inputText = e.target.value.toUpperCase().trim();

        const showFilter = datos.filter(item => 
            item.emailAddress.toUpperCase().includes(inputText) || 
            item.phoneNumber.toString().includes(inputText));
        
        if(showFilter.length === 0){
                tableScroll.innerHTML = '<h3>No results found</h3>';
                results.innerHTML = '';
        }else{
           
            listData(showFilter);
        }
        
    })
}   