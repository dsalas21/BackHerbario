const mysql2 = require('mysql2/promise');
const express = require('express');
const app = express();
//const port=3001;
const cors= require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const router = express.Router();
const port = process.env.PORT || 46785;
const host = process.env.DB_HOST || 'roundhouse.proxy.rlwy.net';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || 'dPLNXWMXwxFnffTPjiFNjjOVNgZbLQor';
const database = process.env.DB_NAME || 'railway';

const connection = mysql2.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});





app.use(cors());
app.use(express.json({ limit: '50mb' }));


app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});




app.get('/Usuarios', async function(req, res, next) {
  try {
    const [rows] = await connection.query("SELECT * FROM Usuarios");
    if (rows.length === 0) {
      return res.status(204).json({ status: 204, message: "No items found" });
    }
    return res.status(200).json({ status: 200, data: rows });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
});



//Registrar usuarios
app.post('/create', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Función para encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      'INSERT INTO Usuarios (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    res.status(201).json({ status: 201, message: 'Usuario registrado exitosamente', data: result });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Error al registrar el usuario', error: err.message });
  }
});


//Inicio de sesion

app.post('/Login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // busqueda del email
    const [results] = await connection.promise().query('SELECT * FROM Usuarios WHERE email = ?', [email]);

    if (results.length === 0) {
      res.status(401).send('Usuario no encontrado');
      return;
    }

    const user = results[0];

    // comparacion de contra encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).send('Contraseña incorrecta');
      return;
    }

    res.send('Inicio de sesión exitoso');
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
});






//Registrar Recolectores


app.post("/regR", async (req, res) => {
  const { name, state, country, city } = req.body;

  try {
    const query = 'INSERT INTO Recolectores (name, state, country, city) VALUES (?, ?, ?, ?)';
    const values = [name, state, country, city];

    const [result] = await connection.promise().query(query, values);
    res.send('Recolector registrado exitosamente');
  } catch (err) {
    console.log('Error al insertar datos:', err);
    res.status(500).send('Error al registrar recolector');
  }
});


//registrar Planta

app.post("/regP", async (req, res) => {
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

  try {
    const query = 'INSERT INTO Plantas (scientific_name, common_name, family, genus, species, description, habitat, location, image, collection_date, recolector_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [scientific_name, common_name, family, genus, species, description, habitat, location, image, collection_date, recolector_id];

    const [result] = await connection.promise().query(query, values);
    res.send('Planta registrada exitosamente');
  } catch (err) {
    console.log('Error al insertar datos:', err);
    res.status(500).send('Error al registrar planta');
  }
});


//Actualizar planta
app.post("/PlantasUp/:id", async (req, res) => {
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

  const query = `UPDATE Plantas SET scientific_name = ?, common_name = ?, family = ?, genus = ?, species = ?, description = ?, habitat = ?, location = ?, image = ?, collection_date = ?, recolector_id = ? WHERE id = ?`;

  try {
    const [result] = await connection.promise().query(query, [scientific_name, common_name, family, genus, species, description, habitat, location, image, collection_date, recolector_id, id]);
    res.send('Planta actualizada exitosamente');
  } catch (err) {
    console.log('Error al actualizar datos:', err);
    res.status(500).send('Error al actualizar la planta');
  }
});


//Consultar Recolectores

app.get('/Recolectores', async function(req, res, next) {
  try {
    const [rows] = await connection.query("SELECT * FROM Recolectores");
    if (rows.length === 0) {
      return res.status(204).json({ status: 204, message: "No items found" });
    }
    return res.status(200).json({ status: 200, data: rows });
    
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
    
  }
});




//Consultar Plantas


app.get('/Plantas', async function(req, res, next) {
  try {
    const [rows] = await connection.query("SELECT * FROM Plantas");
    if (rows.length === 0) {
      return res.status(204).json({ status: 204, message: "No items found" });
    }
    return res.status(200).json({ status: 200, data: rows });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
});








//Consultar plantas con id
app.get("/Plantas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.promise().query('SELECT * FROM Plantas WHERE id = ?', [id]);
    
    if (result.length > 0) {
      res.send(result[0]); 
    } else {
      res.status(404).send('Planta no encontrada'); 
    }
  } catch (err) {
    console.log('Error:', err);
    res.status(500).send('Error al obtener la planta');
  }
});

//borrar plantas

app.delete("/borrarPlanta/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.promise().query('DELETE FROM Plantas WHERE id = ?', [id]);
    
    if (result.affectedRows > 0) {
      res.send('Planta borrada exitosamente');
    } else {
      res.status(404).send('Planta no encontrada');
    }
  } catch (err) {
    console.log('Error al borrar la planta:', err);
    res.status(500).send('Error al borrar la planta');
  }
});



//consultar usuarios
/*
app.get("/Usuarios",(req,res)=>{
  
  connection.query ( 'SELECT * FROM Usuarios ',
  (err,result)=>{
   
      if (err) {
        console.log(err);
      }else{
        res.send(result);
      }

}
);
});

*/

/*
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos MySQL establecida correctamente');
});
*/
app.get('/test-db-connection', async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT 1");
    res.status(200).json({ status: 200, message: 'Connection successful', data: rows });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Connection failed', error: err.message });
  }
});





// Listen on `port` and 0.0.0.0
app.listen(port, "0.0.0.0", function () {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


module.exports = connection;


