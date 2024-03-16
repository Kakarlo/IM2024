const charts = document.querySelectorAll(".chart");

charts.forEach(function (chart, index) {
  var ctx = chart.getContext("2d");

  // Use different chart types based on the index
  var chartType = index === 0 ? "bar" : "line";

  var myChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: index === 0 ? "# of Votes (Bar)" : "# of Votes (Line)",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: index === 0 ? "rgba(255, 99, 132, 0.2)" : "transparent",
          borderColor: index === 0 ? "rgba(255, 99, 132, 1)" : "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          pointBackgroundColor: index === 0 ? "rgba(255, 99, 132, 1)" : "rgba(54, 162, 235, 1)",
          pointRadius: 5,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});

$(document).ready(function () {
  $(".data-table").each(function (_, table) {
    $(table).DataTable();
  });
});

// Modal

// Delete Supplier
let deleteSupplier = document.getElementById("deleteSupplier");
if (deleteSupplier != null) {
  deleteSupplier.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");
    document.getElementById("deleteForm").action = "/supplier/" + id + "?_method=DELETE";
  });
}

// Delete Supplier Status
let deleteSupplierStatus = document.getElementById("deleteSupplierStatus");
if (deleteSupplierStatus != null) {
  console.log("Working");
  deleteSupplierStatus.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/supplier/status/" + id + "?_method=DELETE";
  });
}

// Delete Invoice Status
let deleteInvoice = document.getElementById("deleteInvoice");
if (deleteInvoice != null) {
  console.log("Working");
  deleteInvoice.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/invoice/" + id + "?_method=DELETE";
  });
}

// Delete Invoice Item
let deleteInvoiceItem = document.getElementById("deleteInvoiceItem");
if (deleteInvoiceItem != null) {
  console.log("Working");
  deleteInvoiceItem.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");
    let item = button.getAttribute("data-bs-sku");

    document.getElementById("deleteForm").action = "/invoice/editinvoice/" + id + "/" + item + "?_method=DELETE";
  });
}

// Delete Product
let deleteProduct = document.getElementById("deleteProduct");
if (deleteProduct != null) {
  console.log("Working");
  deleteProduct.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/product/" + id + "?_method=DELETE";
  });
}

// Delete Product Category
let deleteCategory = document.getElementById("deleteCategory");
if (deleteCategory != null) {
  console.log("Working");
  deleteCategory.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/product/category/" + id + "?_method=DELETE";
  });
}

// Delete SKU
let deleteSKU = document.getElementById("deleteSKU");
if (deleteSKU != null) {
  console.log("Working");
  deleteSKU.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/sku/" + id + "?_method=DELETE";
  });
}

// Delete Stockin
let deleteStockin = document.getElementById("deleteStockin");
if (deleteStockin != null) {
  console.log("Working");
  deleteStockin.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/stockin/" + id + "?_method=DELETE";
  });
}

// Delete Stockin Item
let deleteStockinItem = document.getElementById("deleteStockinItem");
if (deleteStockinItem != null) {
  console.log("Working");
  deleteStockinItem.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");
    let warehouse = button.getAttribute("data-bs-warehouse");
    let item = button.getAttribute("data-bs-sku");

    document.getElementById("deleteForm").action =
      "/stockin/editstockin/" + id + "/" + warehouse + "/" + item + "?_method=DELETE";
  });
}

// Delete Warehouse
let deleteWarehouse = document.getElementById("deleteWarehouse");
if (deleteWarehouse != null) {
  console.log("Working");
  deleteWarehouse.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/warehouse/" + id + "?_method=DELETE";
  });
}

// Delete Stock Transfer
let deleteStockTransfer = document.getElementById("deleteStockTransfer");
if (deleteStockTransfer != null) {
  console.log("Working");
  deleteStockTransfer.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/stocktransfer/" + id + "?_method=DELETE";
  });
}

// Delete Stock Transfer
let deleteStore = document.getElementById("deleteStore");
if (deleteStore != null) {
  console.log("Working");
  deleteStore.addEventListener("show.bs.modal", function (event) {
    let button = event.relatedTarget;
    let id = button.getAttribute("data-bs-id");

    document.getElementById("deleteForm").action = "/store/" + id + "?_method=DELETE";
  });
}
