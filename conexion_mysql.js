const mysql = require('mysql');
const database = {
    host : 'localhost',
    user : 'teleruben',
    password : 'ruben1234',
    database : 'telemedicina_practica'
};

const conexion = mysql.createConnection(database);

conexion.connect(function (err) {
    if (err) {
        console.error('Error en la conexión de la base de datos:',err);
        process.exit();
    }
});

module.exports = conexion;