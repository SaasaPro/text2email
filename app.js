document.addEventListener("DOMContentLoaded", () => {
  loadEmailUsers();
  searchData();

  const exportBtn = document.getElementById("exportCsvBtn");
  if(exportBtn) {
    exportBtn.addEventListener("click", exportCsv);
  }
});

// --- Manejo de tabs ---
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.getAttribute("data-tab");


    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    document.getElementById(tab).classList.add("active");
  });
});

let datos = [];
let currentView = [];
const tableScroll = document.getElementById("table-scroll");
const search = document.getElementById("search");
const results = document.getElementById("results");

// --- GET listado desde backend ---
function loadEmailUsers() {
  fetch("https://text2email.onrender.com/proxy/email-users")
    .then(response => response.json())
    .then(data => {
      console.log("Listado recibido:", data);
      datos = data;
      listData(datos);
    })
    .catch(err => {
      console.error("Error cargando usuarios:", err);
    });
}

function listData(datos) {
  currentView = datos;
  tableScroll.innerHTML = `
    <table id="tableContainer">
      <thead>
        <tr>
          <th data-type="string"><span class="text">Cluster</span></th>
          <th data-type="string"><span class="text">Phone</span></th>
          <th data-type="string" class="email-col"><span class="text">Email</span></th>
          <th class="acciones-col"><span class="text">Actions</span></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tableContainer = document.getElementById("tableContainer");
  const tbody = tableContainer.querySelector("tbody");

  datos.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="cluster-cell">${item.providerName ?? ""}</td>
      <td class="phone-cell">${item.phoneNumber ?? ""}</td>
      <td class="email-cell">${item.emailAddress ?? ""}</td>
      <td class="acciones-cell">
        <button class="delete-btn" data-number="${item.phoneNumber}" title="Eliminar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="red" viewBox="0 0 24 24">
            <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5a1 1 0 0 1-1 .5H7.5a1 1 0 0 1-1-.5L5 9zm5 2v8h2v-8h-2zm4 0v8h2v-8h-2zM9 4V2h6v2h5v2H4V4h5z"/>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  results.innerHTML = "Total results: " + datos.length;

  // --- Manejo de clicks en botones eliminar ---
  tbody.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-btn")) {
      const btn = e.target.closest(".delete-btn");
      const number = btn.getAttribute("data-number");
      if (confirm(`Are you sure you want to delete number ${number}?`)) {
        try {
          const response = await fetch(`https://text2email.onrender.com/proxy/phone-number/${number}`, {
            method: "DELETE"
          });

          if (response.ok) {
            btn.closest("tr").remove();
            datos = datos.filter(item => item.phoneNumber !== number);
            
            results.innerHTML = "Total results: " + (tbody.querySelectorAll("tr").length);
            alert("Number deleted successfully");
              setTimeout(() => {
                window.location.reload();
              }, 500);
          } else {
            alert("Delete number failed");
          }
        } catch (err) {
          console.error(err);
          alert("Oops, we couldn't connect to the server. Please try again.");
        }
      }
    }
  });

  // --- Estado de orden global ---
  let currentSort = { index: -1, asc: true };
  const ths = tableContainer.querySelectorAll("th");

  ths.forEach((th, index) => {
    // Excluir la última columna (acciones) de la lógica de ordenado
    if (index < 3) {
      th.addEventListener("click", () => {
        const type = th.dataset.type || "string";
        const rows = Array.from(tbody.querySelectorAll("tr"));

        if (currentSort.index === index) {
          currentSort.asc = !currentSort.asc;
        } else {
          currentSort.index = index;
          currentSort.asc = true;
        }

        ths.forEach((h, i) => {
          h.classList.remove("asc", "desc");
          if (i === currentSort.index) {
            h.classList.add(currentSort.asc ? "asc" : "desc");
          }
        });

        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

        rows.sort((a, b) => {
          let aVal = a.children[index].textContent.trim();
          let bVal = b.children[index].textContent.trim();

          if (type === "number") {
            const toNum = v => parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0;
            aVal = toNum(aVal);
            bVal = toNum(bVal);
            return currentSort.asc ? aVal - bVal : bVal - aVal;
          } else {
            const cmp = collator.compare(aVal, bVal);
            return currentSort.asc ? cmp : -cmp;
          }
        });

        rows.forEach(r => tbody.appendChild(r));
        console.log(`✅ Ordenado por ${th.innerText} (${currentSort.asc ? "ascendente ▲" : "descendente ▼"})`);
      });
    }
  });

  // Orden inicial por primera columna
  ths[0].click();
}



// --- Buscar en la tabla ---
function searchData() {
  search.addEventListener("input", e => {
    const inputText = e.target.value.toUpperCase().trim();

    const showFilter = datos.filter(item =>
      (item.emailAddress ?? "").toUpperCase().includes(inputText) ||
      (item.phoneNumber ?? "").toString().includes(inputText) ||
      (item.providerName ?? "").toUpperCase().includes(inputText)
    );

    if (showFilter.length === 0) {
      tableScroll.innerHTML = "<h3>No results found</h3>";
      results.innerHTML = "";
    } else {
      listData(showFilter);
    }
  });
}

function exportCsv() {
  const headers = ["Cluster", "Phone", "Email"];
  const rows = currentView.map(item => [
    item.providerName ?? "",
    item.phoneNumber ?? "",
    item.emailAddress ?? ""
  ]);

  let csvContent = headers.join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.map(value => `"${value}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "email_users.csv";
  link.click();
}
