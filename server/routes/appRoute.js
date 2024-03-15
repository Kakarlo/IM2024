const express = require("express");
const router = express.Router();
const appController = require("../controllers/appContoller");

// Supplier Table
router.get("/supplier", appController.showAllSupplier);
router.post("/supplier", appController.showAllSupplier);
router.delete("/supplier/:id", appController.deleteSupplier);
router.get("/supplier/addsupplier", appController.showSupplierForm);
router.post("/supplier/addsupplier", appController.addSupplier);
router.get("/supplier/editsupplier/:id", appController.showSupplier);
router.post("/supplier/editsupplier/:id", appController.editSupplier);

// Supplier Status
router.get("/supplier/status", appController.showStatus);
router.post("/supplier/status", appController.addStatus);
router.delete("/supplier/status/:id", appController.deleteStatus);
router.get("/supplier/status/editstatus/:id", appController.showStatusForm);
router.post("/supplier/status/editstatus/:id", appController.editStatus);

// Supplier Invoice Table
router.get("/invoice", appController.showAllInvoice);
router.post("/invoice", appController.showAllInvoice);
router.delete("/invoice/:id", appController.deleteInvoice);
router.get("/invoice/addinvoice", appController.showInvoiceForm);
router.post("/invoice/addinvoice", appController.addInvoice);
router.get("/invoice/editinvoice/:id", appController.showInvoice);
router.post("/invoice/editinvoice/:id", appController.editInvoice);

// Supplier Invoice Item
router.delete("/invoice/editinvoice/:id/:item", appController.deleteInvoiceItem);
router.get("/invoice/editinvoice/:id/additem", appController.showInvoiceItemForm);
router.post("/invoice/editinvoice/:id/additem", appController.addInvoiceItem);
router.get("/invoice/editinvoice/:id/edititem/:item", appController.showInvoiceItem);
router.post("/invoice/editinvoice/:id/edititem/:item", appController.editInvoiceItem);

// Product Table
router.get("/product", appController.showAllProduct);
router.post("/product", appController.showAllProduct);
router.delete("/product/:id", appController.deleteProduct);
router.get("/product/addproduct", appController.showProductForm);
router.post("/product/addproduct", appController.addProduct);
router.get("/product/editproduct/:id", appController.showProduct);
router.post("/product/editproduct/:id", appController.editProduct);

// Product Category
router.get("/product/category", appController.showAllCategory);
router.post("/product/category", appController.showAllCategory);
router.delete("/product/category/:id", appController.deleteCategory);
router.get("/product/category/addcategory", appController.showCategoryForm);
router.post("/product/category/addcategory", appController.addCategory);
router.get("/product/category/editcategory/:id", appController.showCategory);
router.post("/product/category/editcategory/:id", appController.editCategory);

// SKU Table
router.get("/sku", appController.showAllSKU);
router.post("/sku", appController.showAllSKU);
router.delete("/sku/:id", appController.deleteSKU);
router.get("/sku/addsku", appController.showSKUForm);
router.post("/sku/addsku", appController.addSKU);
router.get("/sku/editsku/:id", appController.showSKU);
router.post("/sku/editsku/:id", appController.editSKU);
router.post("/sku/editsku/addvariation/:id", appController.addVariation);
router.delete("/sku/editsku/editvariation/:id/:var", appController.deleteVariation);

// Stock In Table
router.get("/stockin", appController.showAllStockin);
router.post("/stockin", appController.showAllStockin);
router.delete("/stockin/:id", appController.deleteStockin);
router.get("/stockin/addstockin", appController.showStockinForm);
router.post("/stockin/addstockin", appController.addStockin);
router.get("/stockin/editstockin/:id", appController.showStockin);
router.post("/stockin/editstockin/:id", appController.editStockin);

// Supplier Invoice Item
router.delete("/stockin/editstockin/:id/:warehouse/:item", appController.deleteStockinItem);
router.get("/stockin/editstockin/:id/additem/:invoice/:warehouse", appController.showStockinItemForm);
router.post("/stockin/editstockin/:id/additem/:invoice/:warehouse", appController.addStockinItem);
router.get("/stockin/editstockin/:id/edititem/:item/:invoice/:warehouse", appController.showStockinItem);
router.post("/stockin/editstockin/:id/edititem/:item/:invoice/:warehouse", appController.editStockinItem);

// Warehouse Table
router.get("/warehouse", appController.showAllWarehouse);
router.post("/warehouse", appController.showAllWarehouse);
router.delete("/warehouse/:id", appController.deleteWarehouse);
router.get("/warehouse/addwarehouse", appController.showWarehouseForm);
router.post("/warehouse/addwarehouse", appController.addWarehouse);
router.get("/warehouse/editwarehouse/:id", appController.showWarehouse);
// router.post("/warehouse/editwarehouse/:id", appController.editWarehouse);

// Warehouse Inventory
router.get("/warehouse/:id/inventory/:name", appController.showWarehouseInventory);
router.post("/warehouse/:id/inventory/:name", appController.showWarehouseInventory);

// Store Table
router.get("/store", appController.showAllStore);
router.post("/store", appController.showAllStore);
router.delete("/store/:id", appController.deleteStore);
router.get("/store/addstore", appController.showStoreForm);
router.post("/store/addstore", appController.addStore);
router.get("/store/editstore/:id", appController.showStore);
// router.post("/store/editstore/:id", appController.editStore);

// Store Inventory
router.get("/store/:id/inventory/:name", appController.showStoreInventory);
router.post("/store/:id/inventory/:name", appController.showStoreInventory);

// Trial
router.get("/", appController.login);
router.post("/", appController.loginAuthenticate);
router.get("/settings", appController.settings);
router.get("/pos", appController.pos);
router.get("/shipment", appController.showShipment);
router.post("/shipment", appController.showShipment);
router.get("/contact", appController.contact);
router.get("/address", appController.address);
router.get("/dashboard", appController.dashboard);
router.get("/stocktransfer", appController.showStockTransfer);
router.post("/stocktransfer", appController.showStockTransfer);

module.exports = router;
