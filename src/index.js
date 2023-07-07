const path = require("path");
const express = require("express");
const morgan = require("morgan");
const handlebars = require("express-handlebars");
const cookieParser = require('cookie-parser');
const session = require('express-session');
var cors = require('cors')
'use strict';

const app = express();
const port = 4000;

//Used for get data as json format. Ex: res.json(req.body);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'quizone secret',
  resave: false,
  saveUninitialized: true,
}))

app.use(cors());

const route = require("./routes");

const db = require('./config/db');

//Connect to db
db.connect();

//used for getting log in terminal
// app.use(morgan('combined'));

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

app.use('/public', express.static(path.join(__dirname, "public")));



let server = app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

let io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});
app.set("io", io);

// route init
route(app);