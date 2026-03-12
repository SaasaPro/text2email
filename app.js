document.addEventListener("DOMContentLoaded", () => {
  loadEmailUsers();
  searchData();
});

// --- Manejo de tabs ---
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

let datos = [];
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

// --- Renderizar tabla ---
function listData(datos) {
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

  const tableContainer = document.getElementById("tableContainer");
  const tbody = tableContainer.querySelector("tbody");

  datos.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.providerName ?? ""}</td>
      <td>${item.phoneNumber ?? ""}</td>
      <td>${item.emailAddress ?? ""}</td>
    `;
    tbody.appendChild(tr);
  });

  results.innerHTML = "Total results: " + datos.length;

  // --- Estado de orden global ---
  let currentSort = { index: -1, asc: true };
  const ths = tableContainer.querySelectorAll("th");

  ths.forEach((th, index) => {
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
