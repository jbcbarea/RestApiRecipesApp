/*
const express = require('express');

const app = express();

// middlewares
app.use(express.json());
//Por si envían datos a través de objeto de un formulario
app.use(express.urlencoded({extended: false}));
*/

const express = require("express");
const app = express();
//const pgp = require('pg-promise')();
//const db = pgp('postgres://postgres:admin@localhost:5432/test');
const routes = require("./routes/routes");

//sirve imágenes estáticas que voy guardando en la carpeta de imágenes
app.use(
  "/images",
  express.static("C:/Users/jbcor/ionicProyects/RestApiRecipesApp/images")
);
app.use(express.json());
/*
app.use((req, res, next) => {
  //Http://192.168.1.135:3000
   // res.header('Access-Control-Allow-Origin', 'http://localhost:8100');
   res.header('Access-Control-Allow-Origin', 'https://192.168.1.135:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
*/
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permitir solicitudes desde cualquier origen
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

routes(app, express);
const HOST = "0.0.0.0"; // Escuchar en todas las interfaces de red
app.listen(3000, HOST, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
