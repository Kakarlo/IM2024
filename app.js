const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("connect-flash");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Parsing middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

app.use(express.static("public"));

// Templating Engine
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      ifCond: function (v1, v2, options) {
        //console.log(v1);
        //console.log(v2);
        if (v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
    },
  })
);
app.set("view engine", "hbs");

// Flash Message
app.use(cookieParser("DeliciousCookies"));
app.use(
  session({
    secret: "WoahCookies",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// For Put and Delete Request
app.use(methodOverride("_method"));

// Route
let route = require("./server/routes/appRoute");
app.use("/", route);

// Error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Oopsies! Looks like something broke :)");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
