const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/appContoller");

router.get("/", supplierController.viewAll);
router.post("/", supplierController.find);
router.get("/addsupplier", supplierController.showform);
router.post("/addsupplier", supplierController.addSupplier);

module.exports = router;
