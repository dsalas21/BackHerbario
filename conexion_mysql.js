const mysql = require('mysql');
const express = require('express');
const app = express();
//const port=3001;
const cors= require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
 
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

//Registrar usuarios
app.post('/create', (req, res) => {
  const { name, email, password } = req.body;

  // funcion para encriptar contraseña
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      res.status(500).send('Error al hashear la contraseña');
      return;
    }

    connection.query(
      'INSERT INTO Usuarios (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash],
    
      (err, result) => {
        if (err) {
          res.status(500).send('Error al registrar el usuario');
          return;
        }

        res.send('Usuario registrado exitosamente');
      }
    );
  });
});

//Inicio de sesion

app.post('/Login', (req, res) => {
  const { email, password } = req.body;

  // busqueda del email
  connection.query('SELECT * FROM Usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      res.status(500).send('Error al buscar usuario');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Usuario no encontrado');
      return;
    }

    const user = results[0];

    // comparacion de contra encriptada
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        res.status(500).send('Error al comparar contraseñas');
        return;
      }

      if (!isMatch) {
        res.status(401).send('Contraseña incorrecta');
        return;
      }

      res.send('Inicio de sesión exitoso');
    });
  });
});





//Registrar Recolectores


app.post("/regR",(req,res)=>{
  const name=req.body.name;
  const state=req.body.state;
  const country=req.body.country;
  const city=req.body.city;
  
  
  connection.query ( 'INSERT INTO Recolectores (name, state, country,city) VALUES (?, ?, ?,?)',[name, state, country,city],
  (err,result)=>{
   
      if (err) {
        console.log('Error al insertar datos:', err);
      }else{res.send('Recolector registrado exitosamente');}
      

  }

);
});

//registrar Planta

app.post("/regP",(req,res)=>{
  const scientific_name =req.body.scientific_name;
  const common_name=req.body.common_name;
  const family=req.body.family;
  const genus=req.body.genus;
  const species=req.body.species;
  const description=req.body.description;
  const habitat=req.body.habitat;
  const location=req.body.location;
  const image=req.body.image;
  const collection_date=req.body.collection_date;
  const recolector_id=req.body.recolector_id;
  
  
  connection.query ( 'INSERT INTO Plantas (scientific_name, common_name, family,genus,species,description,habitat,location,image,collection_date,recolector_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [scientific_name, common_name, family,genus,species,description,habitat,location,image,collection_date,recolector_id],
  (err,result)=>{
   
      if (err) {
        console.log('Error al insertar datos:', err);
      }else{res.send('Planta registrado exitosamente');}
      
  }
);
});

//Actualizar planta
app.post("/PlantasUp/:id", (req, res) => {
  const { id } = req.params;
  const {
    scientific_name,
    common_name,
    family,
    genus,
    species,
    description,
    habitat,
    location,
    image,
    collection_date,
    recolector_id
  } = req.body;

  const query = `UPDATE Plantas SET scientific_name = ?,common_name = ?,family = ?, genus = ?,species = ?, description = ?,habitat = ?,
    location = ?, image = ?,collection_date = ?,recolector_id = ? WHERE id = ? `;

  connection.query(query, [scientific_name,common_name,family,genus,species,description, habitat,location, image,collection_date, recolector_id, id
  ], (err, result) => {
    if (err) {
      console.log('Error al actualizar datos:', err);
      res.status(500).send('Error al actualizar la planta');
    } else {
      res.send('Planta actualizada exitosamente');
    }
  });
});

//Consultar Recolectores


app.get("/Recolectores",(req,res)=>{
  
  connection.query ( 'SELECT * FROM Recolectores ',
  (err,result)=>{
   
      if (err) {
        console.log(Err);
      }else{
        res.send(result);
      }

}
);
});

//Consultar Plantas

app.get("/Plantas",(req,res)=>{
  
  connection.query ( 'SELECT * FROM Plantas ',
  (err,result)=>{
   
      if (err) {
        console.log(Err);
      }else{
        res.send(result);
      }

}
);
});
//Consultar plantas con id
app.get("/Plantas/:id", (req, res) => {
  const { id } = req.params; // Obtienes el ID de la ruta

  connection.query('SELECT * FROM Plantas WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.log('Error:', err);
      res.status(500).send('Error al obtener la planta');
    } else {
      
      if (result.length > 0) {
        res.send(result[0]); 
      } else {
        res.status(404).send('Planta no encontrada'); 
      }
    }
  });
});

//borrar plantas

app.delete("/borrarPlanta/:id", (req, res) => {
  const { id } = req.params; 

  connection.query('DELETE FROM Plantas WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.log('Error al borrar la planta:', err);
      res.status(500).send('Error al borrar la planta');
    } else {
      if (result.affectedRows > 0) {
        res.send('Planta borrada exitosamente');
      } else {
        res.status(404).send('Planta no encontrada');
      }
    }
  });
});


//consultar usuarios
app.get("/Usuarios",(req,res)=>{
  
  connection.query ( 'SELECT * FROM usuarios ',
  (err,result)=>{
   
      if (err) {
        console.log(Err);
      }else{
        res.send(result);
      }

}
);
});

/*
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL establecida correctamente');
});


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


*/



module.exports = connection;


