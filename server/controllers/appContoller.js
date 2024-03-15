const db = require("../../config/connection");
// Number of rows per table
const limit = 15;

// Login
exports.login = async (req, res) => {
  const message = await req.flash("msg");
  res.render("login", { layout: false, message });
};

exports.loginAuthenticate = async (req, res) => {
  try {
    const { username, password } = req.body;
    let sql = "select * from tbl_user where name = ? and password = ?";
    const [rows] = await db.query(sql, [username, password]);
    if (rows == 0) throw { sqlMessage: "Please enter a correct username and password" };
    req.flash("msg", { type: "success", msg: username, heading: "Error" });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/");
  }
};

exports.settings = async (req, res) => {
  res.render("settings");
};

exports.pos = async (req, res) => {
  res.render("pos", { layout: false });
};

exports.contact = async (req, res) => {
  res.render("contact");
};

exports.address = async (req, res) => {
  res.render("address");
};

exports.dashboard = async (req, res) => {
  const message = await req.flash("msg");
  res.render("dashboard", { message });
};

exports.showStockTransfer = async (req, res) => {
  const message = await req.flash("msg");
  res.render("stock-transfer", { message });
};

exports.showShipment = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "select count(*) as count from view_shipment";
    const [out] = await db.query(sql);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    sql = "Select * from view_shipment order by id limit ? offset ?";
    const [rows] = await db.query(sql, [limit, startIndex]);
    res.render("shipment", { rows, message, pagin });
  } catch (err) {
    console.log(err);
  }
};

// Supplier
exports.showAllSupplier = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from tbl_supplier where name like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql =
      "Select s.id, s.name, st.name as status from tbl_supplier as s " +
      "join tbl_supplier_status as st on s.status_id=st.id " +
      "where s.name like ? or s.id like ? order by s.id limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("supplier", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showSupplierForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_supplier_status order by name";
    const [status] = await db.query(sql);
    res.render("add-supplier", { status_option: status, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addSupplier = async (req, res) => {
  try {
    const { name, id, address, barangay, city, province, contact } = req.body;
    // Insert supplier
    let sql = "Insert into tbl_supplier (name, status_id) values (?, ?)";
    const [supplier] = await db.query(sql, [name, id]);
    const supplier_id = supplier.insertId;
    // Adds Address
    if (checkString(address) || checkString(barangay) || checkString(city) || checkString(province))
      throw { sqlMessage: "Please enter valid characters" };
    const address_id = await addAddress(address, barangay, city, province);
    sql = "Insert into tbl_supplier_address values (?, ?)";
    const [supplier_address] = await db.query(sql, [supplier_id, address_id]);
    // Adds Contact
    if (checkString(contact)) throw { sqlMessage: "Please enter valid characters" };
    const contact_id = await addContact(contact);
    sql = "Insert into tbl_supplier_contact values (?, ?)";
    const [supplier_contact] = await db.query(sql, [supplier_id, contact_id]);

    req.flash("msg", { type: "success", msg: "Supplier Added Successfully", heading: "Success" });
    res.redirect("/supplier/addsupplier");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/supplier/addsupplier");
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    let sql = "Delete from tbl_supplier where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Supplier Deleted Successfully", heading: "Success" });
    res.redirect("/supplier");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Supplier Delete Error" });
    res.redirect("/supplier");
  }
};

async function addAddress(address, barangay, city, province) {
  try {
    let province_id, city_id, barangay_id, address_id;
    // Adds Province
    let sql = "Select * from tbl_province where name = ?";
    const [prov] = await db.query(sql, [province]);
    if (prov.length == 1) {
      province_id = prov[0].id;
    } else {
      const [insert] = await db.query("Insert into tbl_province (name) values (?)", [province]);
      province_id = insert.insertId;
    }
    // Adds City
    sql = "Select * from tbl_city where name = ?";
    const [cit] = await db.query(sql, [city]);
    if (cit.length == 1) {
      city_id = cit[0].id;
    } else {
      const [insert] = await db.query("Insert into tbl_city (name, province_id) values (?, ?)", [city, province_id]);
      city_id = insert.insertId;
    }
    // Adds Barangay
    sql = "Select * from tbl_barangay where name = ?";
    const [bar] = await db.query(sql, [barangay]);
    if (bar.length == 1) {
      barangay_id = bar[0].id;
    } else {
      const [insert] = await db.query("Insert into tbl_barangay (name, city_id) values (?, ?)", [barangay, city_id]);
      barangay_id = insert.insertId;
    }
    // Adds Address
    const [insert] = await db.query("Insert into tbl_address (address, barangay_id) values (?, ?)", [
      address,
      barangay_id,
    ]);
    address_id = insert.insertId;
    console.log(address_id);
    return address_id;
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function addContact(contact) {
  try {
    let contact_id;
    // Adds Contact
    let sql = "Select * from tbl_contact where contact_number = ?";
    const [cont] = await db.query(sql, [contact]);
    if (cont.length == 1) {
      contact_id = cont[0].id;
    } else {
      const [insert] = await db.query("Insert into tbl_contact (contact_number, type_id) values (?, 1)", [contact]);
      contact_id = insert.insertId;
    }
    return contact_id;
  } catch (err) {
    console.log(err);
  }
}

exports.showSupplier = async (req, res) => {
  try {
    // Supplier Data
    let sql =
      "Select s.id, s.name, st.name as status from tbl_supplier as s " +
      "join tbl_supplier_status st on s.status_id = st.id " +
      "where s.id = ?";
    let [rows] = await db.query(sql, [req.params.id]);
    // Supplier Address
    sql = "Select * from view_address join tbl_supplier_address on id=address_id where supplier_id = ?";
    const [address] = await db.query(sql, [req.params.id]);
    rows[0].address = address;

    // Supplier Contact
    sql = "Select * from view_contact join tbl_supplier_contact on id=contact_id where supplier_id = ?";
    const [contact] = await db.query(sql, [req.params.id]);
    console.log(contact);
    rows[0].contact = contact;

    sql = "Select * from tbl_supplier_status order by name";
    const [status] = await db.query(sql);
    rows[0].status_option = status;

    res.render("edit-supplier", { rows });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editSupplier = async (req, res) => {
  try {
    const { name, id } = req.body;
    if (checkString(name)) throw { sqlMessage: "Please enter valid characters" };
    // Update supplier
    let sql = "Update tbl_supplier set name = ?, status_id = ? where id = ?";
    const [supplier] = await db.query(sql, [name, id, req.params.id]);

    req.flash("msg", { type: "success", msg: "Supplier Updated Successfully", heading: "Success" });
    res.redirect("/supplier");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Supplier Edit Error" });
    res.redirect("/supplier");
  }
};

// Supplier Status
exports.showStatus = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "select count(*) as count from tbl_supplier_status";
    const [out] = await db.query(sql);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    sql = "Select * from tbl_supplier_status order by id limit ? offset ?";
    const [rows] = await db.query(sql, [limit, startIndex]);
    res.render("supplier-status", { rows, message, pagin });
  } catch (err) {
    console.log(err);
  }
};

exports.addStatus = async (req, res) => {
  try {
    const name = req.body.name;
    if (checkString(name)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Insert into tbl_supplier_status (name) values (?)";
    const [rows] = await db.query(sql, name);
    req.flash("msg", { type: "success", msg: "Supplier Status Added", heading: "Success" });
    res.redirect("/supplier/status");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Supplier Status Edit Error" });
    res.redirect("/supplier/status");
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    let sql = "Delete from tbl_supplier_status where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Supplier Status Deleted Successfully", heading: "Success" });
    res.redirect("/supplier/status");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Supplier Status Delete Error" });
    res.redirect("/supplier/status");
  }
};

exports.showStatusForm = async (req, res) => {
  try {
    let sql = "Select * from tbl_supplier_status where id = ?";
    const [rows] = await db.query(sql, req.params.id);
    console.log(rows);
    res.render("edit-supplier-status", { rows });
  } catch (err) {
    console.log(err);
  }
};

exports.editStatus = async (req, res) => {
  try {
    const name = req.body.name;
    if (checkString(name)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_supplier_status set name = ? where id = ?";
    const [rows] = await db.query(sql, [name, req.params.id]);
    req.flash("msg", { type: "success", msg: "Supplier Status Updated", heading: "Success" });
    res.redirect("/supplier/status");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Supplier Status Edit Error" });
    res.redirect("/supplier/status");
  }
  res.render("edit-supplier-status");
};

// Supplier Invoice
exports.showAllInvoice = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from view_invoice where code like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql = "select * from view_invoice where code like ? or id like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("supplier-invoice", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showInvoiceForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_supplier order by name";
    const [supplier] = await db.query(sql);
    sql = "Select * from tbl_supplier_invoice_status order by name";
    const [status] = await db.query(sql);
    res.render("add-supplier-invoice", { status_option: status, supplier_option: supplier, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addInvoice = async (req, res) => {
  try {
    const { code, supplier, status } = req.body;
    if (checkString(code)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Insert into tbl_supplier_invoice (sinvoice_code, supplier_id, status_id) values (?, ?, ?)";
    const [rows] = await db.query(sql, [code, supplier, status]);
    req.flash("msg", { type: "success", msg: "Invoice Added Successfully", heading: "Success" });
    res.redirect("/invoice/addinvoice");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/invoice/addinvoice");
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    let sql = "Delete from tbl_supplier_invoice where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Invoice Deleted Successfully", heading: "Success" });
    res.redirect("/invoice");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Invoice Delete Error" });
    res.redirect("/invoice");
  }
};

exports.showInvoice = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from view_invoice where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    sql = "Select * from tbl_supplier order by name";
    const [supplier] = await db.query(sql);
    rows[0].supplier_option = supplier;
    sql = "Select * from tbl_supplier_invoice_status order by name";
    const [status] = await db.query(sql);
    rows[0].status_option = status;
    sql = "Select * from view_invoice_item where id = ?";
    const [item] = await db.query(sql, [req.params.id]);
    rows[0].item = item;

    res.render("edit-supplier-invoice", { rows, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editInvoice = async (req, res) => {
  try {
    const { code, supplier, status } = req.body;
    if (checkString(code)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_supplier_invoice set sinvoice_code = ?, supplier_id = ?, status_id = ? where id = ?";
    const [rows] = await db.query(sql, [code, supplier, status, req.params.id]);

    req.flash("msg", { type: "success", msg: "Invoice Updated Successfully", heading: "Success" });
    res.redirect("/invoice");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Invoice Update Error" });
    res.redirect("/invoice");
  }
};

// Supplier Invoice Item
exports.showInvoiceItemForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_sku order by codename";
    const [sku] = await db.query(sql);
    res.render("add-invoice-item", { sku_option: sku, message, id: req.params.id });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addInvoiceItem = async (req, res) => {
  try {
    const { sku, qty, price } = req.body;
    const total = qty * price;
    let sql = "Insert into tbl_supplier_invoice_item values (?, ?, ?, ?, ?)";
    const [rows] = await db.query(sql, [req.params.id, sku, qty, price, total]);
    req.flash("msg", { type: "success", msg: "Invoice Item Added Successfully", heading: "Success" });
    res.redirect("/invoice/editinvoice/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/invoice/editinvoice/" + encodeURIComponent(req.params.id));
  }
};

exports.deleteInvoiceItem = async (req, res) => {
  try {
    let sql = "Delete from tbl_supplier_invoice_item where sinvoice_id = ? and sku_id = ?";
    const [rows] = await db.query(sql, [req.params.id, req.params.item]);
    req.flash("msg", { type: "success", msg: "Invoice Item Deleted Successfully", heading: "Success" });
    res.redirect("/invoice/editinvoice/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Invoice Item Delete Error" });
    res.redirect("/invoice/editinvoice/" + encodeURIComponent(req.params.id));
  }
};

exports.showInvoiceItem = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from view_invoice_item where id = ? and sku_id = ?";
    const [rows] = await db.query(sql, [req.params.id, req.params.item]);
    sql = "Select * from tbl_sku order by codename";
    const [sku] = await db.query(sql);
    rows[0].sku_option = sku;
    res.render("edit-invoice-item", { rows, message, id: req.params.id });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editInvoiceItem = async (req, res) => {
  try {
    const { sku, qty, price } = req.body;
    const total = qty * price;
    let sql =
      "Update tbl_supplier_invoice_item set sinvoice_id = ?, sku_id = ?, product_qty = ?, supplier_price = ?, total = ? where sinvoice_id = ? and sku_id = ?";
    const [rows] = await db.query(sql, [req.params.id, sku, qty, price, total, req.params.id, req.params.item]);

    req.flash("msg", { type: "success", msg: "Invoice Item Updated Successfully", heading: "Success" });
    res.redirect("/invoice/editinvoice/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Invoice Item Update Error" });
    res.redirect("/invoice/editinvoice/" + encodeURIComponent(req.params.id));
  }
};

// Product
exports.showAllProduct = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from tbL_product where name like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql =
      "select p.id, p.name, p.description, c.name as category from tbL_product as p " +
      "join tbl_category as c on p.category_id=c.id " +
      "where p.name like ? or p.id like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("products", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showProductForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_category order by name";
    const [category] = await db.query(sql);
    res.render("add-product", { category_option: category, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if ((checkString(name), checkString(description))) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Insert into tbl_product (name, description, category_id) values (?, ?, ?)";
    const [rows] = await db.query(sql, [name, description, category]);
    req.flash("msg", { type: "success", msg: "Product Added Successfully", heading: "Success" });
    res.redirect("/product/addproduct");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/product/addproduct");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    let sql = "Delete from tbl_product where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Product Deleted Successfully", heading: "Success" });
    res.redirect("/product");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Product Delete Error" });
    res.redirect("/product");
  }
};

exports.showProduct = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql =
      "select p.id, p.name, p.description, c.name as category from tbL_product as p " +
      "join tbl_category as c on p.category_id=c.id " +
      "where p.id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    sql = "Select * from tbl_category order by name";
    const [category] = await db.query(sql);
    rows[0].category_option = category;
    res.render("edit-product", { rows, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if ((checkString(name), checkString(description))) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_product set name = ?, description = ?, category_id = ? where id = ?";
    const [rows] = await db.query(sql, [name, description, category, req.params.id]);
    req.flash("msg", { type: "success", msg: "Product Updated Successfully", heading: "Success" });
    res.redirect("/product");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Product Update Error" });
    res.redirect("/product");
  }
};

// Product Category
exports.showAllCategory = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from tbl_category where name like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql =
      "select c.id, c.name, p.name as parent from tbl_category as c " +
      "left join tbl_category as p on c.parent_category_id=p.id " +
      "where c.name like ? or c.id like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("category", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showCategoryForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_category order by name";
    const [category] = await db.query(sql);
    res.render("add-category", { category_option: category, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (checkString(name)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Insert into tbl_category (name, parent_category_id) values (?, ?)";
    const [rows] = await db.query(sql, [name, category]);
    req.flash("msg", { type: "success", msg: "Category Added Successfully", heading: "Success" });
    res.redirect("/product/category/addcategory");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/product/category/addcategory");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    let sql = "Delete from tbl_category where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Category Deleted Successfully", heading: "Success" });
    res.redirect("/product/category");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Category Delete Error" });
    res.redirect("/product/category");
  }
};

exports.showCategory = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql =
      "select c.id, c.name, p.name as parent from tbl_category as c " +
      "left join tbl_category as p on c.parent_category_id=p.id " +
      "where c.id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    sql = "Select * from tbl_category order by name";
    const [category] = await db.query(sql);
    rows[0].category_option = category;
    res.render("edit-category", { rows, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (checkString(name)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_category set name = ?, parent_category_id = ? where id = ?";
    const [rows] = await db.query(sql, [name, category, req.params.id]);
    req.flash("msg", { type: "success", msg: "Category Updated Successfully", heading: "Success" });
    res.redirect("/product/category");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Category Edit Error" });
    res.redirect("/product/category");
  }
};

// SKU
exports.showAllSKU = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from view_sku where codename like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql = "select * from view_sku where codename like ? or id like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("sku", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showSKUForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_product order by name";
    const [product] = await db.query(sql);
    res.render("add-sku", { product_option: product, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addSKU = async (req, res) => {
  try {
    const { codename, product } = req.body;
    if (checkString(codename)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Insert into tbl_sku (codename, product_id) values (?, ?)";
    const [rows] = await db.query(sql, [codename, product]);
    req.flash("msg", { type: "success", msg: "SKU Added Successfully", heading: "Success" });
    res.redirect("/sku/addsku");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/sku/addsku");
  }
};

exports.deleteSKU = async (req, res) => {
  try {
    let sql = "Delete from tbl_sku where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "SKU Deleted Successfully", heading: "Success" });
    res.redirect("/sku");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "SKU Delete Error" });
    res.redirect("/sku");
  }
};

exports.showSKU = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "select * from view_sku where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    sql = "Select * from view_voption join tbl_sku_variation on id=variation_option_id where sku_id = ?";
    const [variation] = await db.query(sql, [req.params.id]);
    rows[0].variation = variation;

    sql = "Select id, concat(variation, ' - ', variation_option) as name from view_voption";
    const [option] = await db.query(sql, [req.params.id]);
    rows[0].variation_option = option;

    sql = "Select * from tbl_product order by name";
    const [product] = await db.query(sql);
    rows[0].product_option = product;
    res.render("edit-sku", { rows, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editSKU = async (req, res) => {
  try {
    const { codename, product } = req.body;
    if (checkString(codename)) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_sku set codename = ?, product_id = ? where id = ?";
    const [rows] = await db.query(sql, [codename, product, req.params.id]);

    req.flash("msg", { type: "success", msg: "SKU Updated Successfully", heading: "Success" });
    res.redirect("/sku");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "SKU Update Error" });
    res.redirect("/sku");
  }
};

exports.addVariation = async (req, res) => {
  try {
    const { variation } = req.body;
    let sql = "Insert into tbl_sku_variation values (?, ?)";
    const [rows] = await db.query(sql, [req.params.id, variation]);

    req.flash("msg", { type: "success", msg: "Variation Added Successfully", heading: "Success" });
    res.redirect("/sku/editsku/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Variation Insert Error" });
    res.redirect("/sku/editsku/" + encodeURIComponent(req.params.id));
  }
};

exports.deleteVariation = async (req, res) => {
  try {
    let sql = "Delete from tbl_sku_variation where sku_id = ? and variation_option_id = ?";
    const [rows] = await db.query(sql, [req.params.id, req.params.var]);
    req.flash("msg", { type: "success", msg: "Variation Deleted Successfully", heading: "Success" });
    res.redirect("/sku/editsku/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Variation Delete Error" });
    res.redirect("/sku/editsku/" + encodeURIComponent(req.params.id));
  }
};

// Stock IN
exports.showAllStockin = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from view_stockin where id like ?";
    const [out] = await db.query(sql, ["%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql = "select * from view_stockin where id like ? or inserted_at like ? or updated_at like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("stockin", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showStockinForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_supplier order by name";
    const [supplier] = await db.query(sql);
    sql = "Select * from tbl_supplier_invoice order by sinvoice_code";
    const [invoice] = await db.query(sql);
    sql = "Select * from tbl_warehouse order by name";
    const [warehouse] = await db.query(sql);
    sql = "Select * from tbl_shipment order by id";
    const [shipment] = await db.query(sql);
    res.render("add-stockin", {
      supplier_option: supplier,
      invoice_option: invoice,
      warehouse_option: warehouse,
      shipment_option: shipment,
      message,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addStockin = async (req, res) => {
  try {
    const { supplier, invoice, warehouse, shipment } = req.body;
    let sql = "Insert into tbl_stockin (supplier_id, sinvoice_id, warehouse_id, shipment_id) values (?, ?, ?, ?)";
    const [rows] = await db.query(sql, [supplier, invoice, warehouse, shipment]);
    req.flash("msg", { type: "success", msg: "Stockin Added Successfully", heading: "Success" });
    res.redirect("/stockin/addstockin");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/stockin/addstockin");
  }
};

exports.deleteStockin = async (req, res) => {
  try {
    let sql = "Delete from tbl_stockin where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Stockin Deleted Successfully", heading: "Success" });
    res.redirect("/stockin");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Stockin Delete Error" });
    res.redirect("/stockin");
  }
};

exports.showStockin = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from view_stockin where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    sql = "Select * from tbl_supplier order by name";
    const [supplier] = await db.query(sql);
    rows[0].supplier_option = supplier;
    sql = "Select * from tbl_supplier_invoice order by sinvoice_code";
    const [invoice] = await db.query(sql);
    rows[0].invoice_option = invoice;
    sql = "Select * from tbl_warehouse order by name";
    const [warehouse] = await db.query(sql);
    rows[0].warehouse_option = warehouse;
    sql = "Select * from tbl_shipment order by id";
    const [shipment] = await db.query(sql);
    rows[0].shipment_option = shipment;
    sql = "Select * from view_stockin_item where id = ? order by id";
    const [item] = await db.query(sql, [req.params.id]);
    rows[0].item = item;
    res.render("edit-stockin", { rows, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editStockin = async (req, res) => {
  try {
    const { supplier, invoice, warehouse, shipment } = req.body;
    let sql = "Select * from tbl_stockin_item where stockin_id = ?";
    const [check] = await db.query(sql, [req.params.id]);
    if (check.length >= 1) throw { sqlMessage: "Cannot Update Stockin with content" };
    sql = "Update tbl_stockin set supplier_id=?, sinvoice_id=?, warehouse_id=?, shipment_id=? " + "where id = ?";
    const [rows] = await db.query(sql, [supplier, invoice, warehouse, shipment, req.params.id]);
    req.flash("msg", { type: "success", msg: "Stockin Updated Successfully", heading: "Success" });
    res.redirect("/stockin");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Stockin Edit Error" });
    res.redirect("/stockin");
  }
};

// Stock IN Item
exports.showStockinItemForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql =
      "Select * from tbl_sku join tbl_supplier_invoice_item on id=sku_id where sinvoice_id = ? order by codename";
    const [sku] = await db.query(sql, [req.params.invoice]);
    res.render("add-stockin-item", {
      sku_option: sku,
      message,
      id: req.params.id,
      invoice: req.params.invoice,
      warehouse: req.params.warehouse,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addStockinItem = async (req, res) => {
  try {
    const { sku, qty } = req.body;
    // Check if amount is less than or equal in invoice
    let sql = "select * from tbl_supplier_invoice_item where sinvoice_id = ? and sku_id = ?";
    const [check] = await db.query(sql, [req.params.invoice, sku]);
    if (qty > check[0].product_qty) throw { sqlMessage: "Quantity is greater than the one in invoice" };

    sql = "Insert into tbl_stockin_item values (?, ?, ?)";
    const [rows] = await db.query(sql, [req.params.id, sku, qty]);

    // Update warehouse
    sql = "Select * from tbl_warehouse_item where warehouse_id = ? and sku_id = ?";
    const [item] = await db.query(sql, [req.params.warehouse, sku]);
    if (item.length == 1) {
      sql = "Update tbl_warehouse_item set quantity = quantity + ? where warehouse_id = ? and sku_id = ?";
      const [insert] = await db.query(sql, [qty, req.params.warehouse, sku]);
    } else {
      sql = "Insert into tbl_warehouse_item values (?,?,?)";
      const [insert] = await db.query(sql, [req.params.warehouse, sku, qty]);
    }

    req.flash("msg", { type: "success", msg: "Stockin Item Added Successfully", heading: "Success" });
    res.redirect("/stockin/editstockin/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/stockin/editstockin/" + encodeURIComponent(req.params.id));
  }
};

exports.deleteStockinItem = async (req, res) => {
  try {
    let sql = "Select * from tbl_stockin_item where stockin_id = ? and sku_id = ?";
    const [rows] = await db.query(sql, [req.params.id, req.params.item]);
    // Remove item
    sql = "Delete from tbl_stockin_item where stockin_id = ? and sku_id = ?";
    const [out] = await db.query(sql, [req.params.id, req.params.item]);
    // Decrement warehouse item
    sql = "Update tbl_warehouse_item set quantity = quantity - ? where warehouse_id = ? and sku_id = ?";
    const [insert] = await db.query(sql, [rows[0].quantity, req.params.warehouse, req.params.item]);

    req.flash("msg", { type: "success", msg: "Stockin Item Deleted Successfully", heading: "Success" });
    res.redirect("/stockin/editstockin/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Invoice Item Delete Error" });
    res.redirect("/stockin/editstockin/" + encodeURIComponent(req.params.id));
  }
};

exports.showStockinItem = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql =
      "Select * from tbl_sku join tbl_stockin_item on id=sku_id where stockin_id = ? and sku_id = ? order by codename";
    const [rows] = await db.query(sql, [req.params.id, req.params.item]);
    res.render("edit-stockin-item", {
      rows,
      message,
      id: req.params.id,
      sku: req.params.item,
      invoice: req.params.invoice,
      warehouse: req.params.warehouse,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editStockinItem = async (req, res) => {
  try {
    const { sku, qty } = req.body;
    // Check if amount is less than or equal in invoice
    let sql = "select * from tbl_supplier_invoice_item where sinvoice_id = ? and sku_id = ?";
    const [check] = await db.query(sql, [req.params.invoice, sku]);
    if (qty > check[0].product_qty) throw { sqlMessage: "Quantity is greater than the one in invoice" };

    sql = "select * from tbl_stockin_item where stockin_id = ? and sku_id = ?";
    const [out] = await db.query(sql, [req.params.id, req.params.item]);

    sql = "Update tbl_stockin_item set quantity = ? where stockin_id = ? and sku_id = ?";
    const [rows] = await db.query(sql, [qty, req.params.id, sku]);

    // Update warehouse
    sql = "Update tbl_warehouse_item set quantity = quantity - ? + ? where warehouse_id = ? and sku_id = ?";
    const [up2] = await db.query(sql, [out[0].quantity, qty, req.params.warehouse, sku]);

    req.flash("msg", { type: "success", msg: "Stockin Item Updated Successfully", heading: "Success" });
    res.redirect("/stockin/editstockin/" + encodeURIComponent(req.params.id));
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Stockin Item Update Error" });
    res.redirect("/stockin/editstockin/" + encodeURIComponent(req.params.id));
  }
};

// Warehouse
exports.showAllWarehouse = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from tbl_warehouse where name like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql =
      "select w.id, w.name, a.full_address from tbl_warehouse as w " +
      "join view_full_address as a on w.address_id=a.id " +
      "where w.name like ? or w.id like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("warehouse", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showWarehouseForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    res.render("add-warehouse", { message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addWarehouse = async (req, res) => {
  try {
    const { name, address, barangay, city, province, contact } = req.body;

    // Adds Address
    if (checkString(address) || checkString(barangay) || checkString(city) || checkString(province))
      throw { sqlMessage: "Please enter valid characters" };
    const address_id = await addAddress(address, barangay, city, province);
    // Insert warehouse
    let sql = "Insert into tbl_warehouse (name, address_id) values (?, ?)";
    const [warehouse] = await db.query(sql, [name, address_id]);
    const warehouse_id = warehouse.insertId;
    // Adds Contact
    if (checkString(contact)) throw { sqlMessage: "Please enter valid characters" };
    const contact_id = await addContact(contact);
    sql = "Insert into tbl_warehouse_contact values (?, ?)";
    const [warehouse_contact] = await db.query(sql, [warehouse_id, contact_id]);

    req.flash("msg", { type: "success", msg: "Warehouse Added Successfully", heading: "Success" });
    res.redirect("/warehouse/addwarehouse");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/warehouse/addwarehouse");
  }
};

exports.deleteWarehouse = async (req, res) => {
  try {
    let sql = "Select * from tbl_warehouse_item where warehouse_id = ?";
    const [check] = await db.query(sql, [req.params.id]);
    if (check.length > 0) throw { sqlMessage: "Warehouse needs to be empty to be deleted!" };
    sql = "Delete from tbl_warehouse where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Warehouse Deleted Successfully", heading: "Success" });
    res.redirect("/warehouse");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Warehouse Delete Error" });
    res.redirect("/warehouse");
  }
};

exports.showWarehouse = async (req, res) => {
  try {
    const message = await req.flash("msg");
    res.render("edit-warehouse", { message, rows: [{}] });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editWarehouse = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if ((checkString(name), checkString(description))) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_product set name = ?, description = ?, category_id = ? where id = ?";
    const [rows] = await db.query(sql, [name, description, category, req.params.id]);
    req.flash("msg", { type: "success", msg: "Product Updated Successfully", heading: "Success" });
    res.redirect("/product");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Product Update Error" });
    res.redirect("/product");
  }
};

exports.showWarehouseInventory = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from view_warehouse_item where id = ? and (sku like ? or product like ?)";
    const [out] = await db.query(sql, [req.params.id, "%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql = "select * from view_warehouse_item where id = ? and (sku like ? or product like ?)  limit ? offset ?";
    const [rows] = await db.query(sql, [req.params.id, "%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("warehouse-inventory", {
      rows,
      pagin,
      search: search,
      message,
      id: req.params.id,
      name: req.params.name,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// Store
exports.showAllStore = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from tbl_store where name like ? or id like ?";
    const [out] = await db.query(sql, ["%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql =
      "select s.id, s.name, a.full_address, t.name as type from tbl_store as s " +
      "left join view_full_address as a on s.address_id=a.id " +
      "left join tbl_store_type as t on s.storetype_id=t.id " +
      "where s.name like ? or s.id like ? limit ? offset ?";
    const [rows] = await db.query(sql, ["%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("store", { rows, pagin, search: search, message });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.showStoreForm = async (req, res) => {
  try {
    const message = await req.flash("msg");
    let sql = "Select * from tbl_store_type order by name";
    const [type] = await db.query(sql);
    res.render("add-store", { message, store_option: type });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.addStore = async (req, res) => {
  try {
    const { name, type, address, barangay, city, province, contact } = req.body;
    // Adds Address
    if (checkString(address) || checkString(barangay) || checkString(city) || checkString(province))
      throw { sqlMessage: "Please enter valid characters" };
    const address_id = await addAddress(address, barangay, city, province);
    // Insert Store
    let sql = "Insert into tbl_store (name, address_id, storetype_id) values (?, ?, ?)";
    const [store] = await db.query(sql, [name, address_id, type]);
    const store_id = store.insertId;
    // Adds Contact
    if (checkString(contact)) throw { sqlMessage: "Please enter valid characters" };
    const contact_id = await addContact(contact);
    sql = "Insert into tbl_store_contact values (?, ?)";
    const [store_contact] = await db.query(sql, [store_id, contact_id]);

    req.flash("msg", { type: "success", msg: "Store Added Successfully", heading: "Success" });
    res.redirect("/store/addstore");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Error" });
    res.redirect("/store/addstore");
  }
};

exports.deleteStore = async (req, res) => {
  try {
    let sql = "Select * from tbl_store_item where store_id = ?";
    const [check] = await db.query(sql, [req.params.id]);
    if (check.length > 0) throw { sqlMessage: "Store needs to be empty to be deleted!" };
    sql = "Delete from tbl_store where id = ?";
    const [rows] = await db.query(sql, [req.params.id]);
    req.flash("msg", { type: "success", msg: "Store Deleted Successfully", heading: "Success" });
    res.redirect("/store");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Store Delete Error" });
    res.redirect("/store");
  }
};

exports.showStore = async (req, res) => {
  try {
    const message = await req.flash("msg");
    res.render("edit-store", { message, rows: [{}] });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

exports.editStore = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if ((checkString(name), checkString(description))) throw { sqlMessage: "Please enter valid characters" };
    let sql = "Update tbl_product set name = ?, description = ?, category_id = ? where id = ?";
    const [rows] = await db.query(sql, [name, description, category, req.params.id]);
    req.flash("msg", { type: "success", msg: "Product Updated Successfully", heading: "Success" });
    res.redirect("/product");
  } catch (err) {
    console.log(err);
    req.flash("msg", { type: "danger", msg: err.sqlMessage, heading: "Product Update Error" });
    res.redirect("/product");
  }
};

exports.showStoreInventory = async (req, res) => {
  try {
    const search = req.body.search || req.query.search || "";
    const message = await req.flash("msg");
    console.log(search);
    let sql = "select count(*) as count from view_store_item where id = ? and (sku like ? or product like ?)";
    const [out] = await db.query(sql, [req.params.id, "%" + search + "%", "%" + search + "%"]);
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const numOfPages = await Math.ceil(out[0].count / limit);
    const pagin = await pagination(page, numOfPages);
    const startIndex = (page - 1) * limit;
    // Show All
    sql = "select * from view_store_item where id = ? and (sku like ? or product like ?)  limit ? offset ?";
    const [rows] = await db.query(sql, [req.params.id, "%" + search + "%", "%" + search + "%", limit, startIndex]);
    res.render("store-inventory", {
      rows,
      pagin,
      search: search,
      message,
      id: req.params.id,
      name: req.params.name,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

function checkString(input) {
  return input.length == 0 || input.trim() == "";
}

function pagination(page, numOfPages) {
  arr = [];
  // Page numbers
  let start = page - 3 < 1 ? 1 : page - 3;
  let end = start + 6 >= numOfPages ? numOfPages : start + 6;
  if (end < page + 3) {
    start -= page + 3 - numOfPages;
    if (start < 0) {
      start = 1;
    }
  }

  if (page <= 1) {
    arr.push({
      name: "Previous",
      value: page - 1,
      disabled: "1",
    });
  } else {
    arr.push({
      name: "Previous",
      value: page - 1,
    });
  }
  for (let i = start; i <= end; i++) {
    if (i == page) {
      arr.push({
        name: i.toString(),
        value: i,
        active: "1",
      });
    } else {
      arr.push({
        name: i.toString(),
        value: i,
      });
    }
  }
  if (page >= numOfPages) {
    arr.push({
      name: "Next",
      value: page + 1,
      disabled: "1",
    });
  } else {
    arr.push({
      name: "Next",
      value: page + 1,
    });
  }
  return arr;
}
