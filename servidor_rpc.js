var rpc = require("./rpc.js"); //incorporamos la libreria
var datosServidor= require("./datos.js");
var conexionBD = require('./conexion_mysql.js');
/*
var gestores=datosServidor.ges;
var sanitarios=datosServidor.san;
var ubicaciones=datosServidor.ubi;
var categorias=datosServidor.cat;
var modelos=datosServidor.mod;
var recursos=datosServidor.rec;
var reservas=datosServidor.resr;
var resenyas=datosServidor.resy;
*/

function obtenerCategorias(callback){
    var sql = "SELECT * FROM categorias";

    conexionBD.query(sql, function(error, categorias){
        if(error){
            console.log("Error:", error);
            callback(null);
        } else {
            callback(categorias);
        }
    });
}

function obtenerModelos(callback){
    var sql = "SELECT * FROM modelos";

    conexionBD.query(sql, function(error, modelos){
        if(error){
            console.log("Error al obtener los modelos:", error);
            callback(null);
        } else {
            console.log("Modelos obtenidos:", modelos);
            callback(modelos);
        }
    });
}

function loginSanitario(usuario,password,callback){

    var sql = "SELECT * FROM sanitarios";
    conexionBD.query(sql, function(error, sanitarios){
        if(error){
            console.log("Error al realizar la select:", error);
            callback(null);
        } else {
            for (let i=0;sanitarios.length>i;i++){

                if (sanitarios[i].usuario==usuario && sanitarios[i].password==password){

                    console.log("Sanitario encontrado:", sanitarios[i]);
                    return callback(sanitarios[i].id);

                }

            }

            console.log("Sanitario no encontrado");
            return callback(null);
        }
    });
}

function crearSanitario(datosSanitario,callback){
    var {nombre, apellidos, usuario, password}=datosSanitario

    if (!nombre || !apellidos || !usuario || !password) {
        return callback(null);
    }

    var sql = "SELECT * FROM sanitarios";
    conexionBD.query(sql, function(error, sanitarios){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        }

        for (let i=0; i<sanitarios.length;i++){
            if (sanitarios[i].usuario==usuario){
                console.log("El usuario ya existe:", usuario);
                return callback(null)
            }
        }

        var maximo=0;

        for (let i=0; i<sanitarios.length;i++){
            if (sanitarios[i].id>=maximo){
                maximo=sanitarios[i].id+1;
            }
        }

        var nuevoSanitario= {id:maximo,nombre:nombre,apellidos:apellidos,usuario:usuario,password:password}

        var sql = "INSERT INTO sanitarios (id, nombre, apellidos, usuario, password) VALUES ('"
            + nuevoSanitario.id + "','"
            + nuevoSanitario.nombre + "','"
            + nuevoSanitario.apellidos + "','"
            + nuevoSanitario.usuario + "','"
            + nuevoSanitario.password + "')";

        conexionBD.query(sql, function(error, resultado){
            if(error){
                console.log("Error al realizar el insert:", error);
                return callback(null);
            } else {
                console.log("Sanitario creado:", nuevoSanitario);
                return callback(nuevoSanitario.id);
            }
        });
    });
}

function actualizarSanitario(idSanitario,datosSanitario,callback){
    var {nombre,apellidos,usuario,password}=datosSanitario;
    if (!nombre || !apellidos || !usuario || !password) {
        return callback(null);
    }

    var sql = "SELECT * FROM sanitarios";
    conexionBD.query(sql, function(error, sanitarios){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        }

        for (let i=0;sanitarios.length>i;i++){
            if(sanitarios[i].id!=idSanitario && sanitarios[i].usuario==usuario){
                console.log("El usuario ya existe:", usuario);
                return callback(null)
            }
        }

        for (let i=0;sanitarios.length>i;i++){
            if(sanitarios[i].id==idSanitario){

                var sql = "UPDATE sanitarios SET nombre = '"
                    + nombre + "', apellidos = '"
                    + apellidos + "', usuario = '"
                    + usuario + "', password = '"
                    + password + "' WHERE id = " + idSanitario;

                conexionBD.query(sql, function(error){
                    if(error){
                        console.log("Error al realizar el update:", error);
                        return callback(null);
                    } else {
                        console.log("Sanitario actualizado:", idSanitario);
                        return callback(true);
                    }
                });

                return;
            }
        }

        console.log("Sanitario no encontrado:", idSanitario);
        return callback(null);
    });
}

function obtenerSanitario(idSanitario,callback){

    var sql = "SELECT * FROM sanitarios";
    conexionBD.query(sql, function(error, sanitarios){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for( let i=0; sanitarios.length>i; i++){

                if (sanitarios[i].id==idSanitario){

                    var nombre= sanitarios[i].nombre;

                    var apellidos= sanitarios[i].apellidos;

                    var usuario= sanitarios[i].usuario;

                    var datosSanitario={id:idSanitario,nombre:nombre, apellidos:apellidos, usuario:usuario}

                    console.log("Sanitario obtenido:", datosSanitario);
                    return callback(datosSanitario)
                }
            }

            console.log("Sanitario no encontrado:", idSanitario);
            return callback(null)
        }
    });
}

function obtenerRecursos(idModelo,callback){

    var lista=[]

    var sql = "SELECT * FROM recursos";
    conexionBD.query(sql, function(error, recursos){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for (let i=0;recursos.length>i;i++){

                if(recursos[i].modelo==idModelo && recursos[i].estado==0){

                    lista.push(recursos[i])

                }

            }

            if (lista.length>=1){

                console.log("Recursos obtenidos:", lista);
                return callback(lista)

            }
            else{

                console.log("No se han encontrado recursos disponibles para el modelo:", idModelo);
                return callback(null)

            }
        }
    });
}

function tiempoPendiente(idRecurso, callback){
    var ahora = new Date().getTime();
    var tiempoRestanteTotal = 0;

    var sql = "SELECT * FROM reservas";
    conexionBD.query(sql, function(error, reservas){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for (let i = 0; i < reservas.length; i++){
                if (reservas[i].recurso == idRecurso){
                    var inicio = reservas[i].fecha_inicio;
                    var finalizado = reservas[i].fecha_fin;
                    var estimado = reservas[i].horas_estimadas * 60*60*1000;
                    var tiempoRestante = 0;

                    // solo contar reservas en uso
                    if (inicio != null && finalizado == null){
                        tiempoRestante = (inicio.getTime() + estimado) - ahora;

                        if (tiempoRestante < 0){
                            tiempoRestante = 0;
                        }

                        tiempoRestanteTotal += tiempoRestante;
                    }
                }
            }

            var tiempoRestanteTotalH = tiempoRestanteTotal / (1000*60*60);

            console.log("Tiempo pendiente del recurso", idRecurso, ":", tiempoRestanteTotalH, "horas");

            return callback(tiempoRestanteTotalH);
        }
    });
}

function obtenerReservas(idSanitario,callback){
    var reservasSanitarios=[]

    var sql = "SELECT * FROM reservas";
    conexionBD.query(sql, function(error, reservas){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for (let i=0; reservas.length>i;i++){
                if(reservas[i].sanitario==idSanitario){
                    reservasSanitarios.push(reservas[i]);

                }
            }

            console.log("Reservas del sanitario", idSanitario, ":", reservasSanitarios);
            return callback(reservasSanitarios);
        }
    });
}

function obtenerResenyas(idRecurso,callback){

    var resenyasRecursos=[]

    var sql = "SELECT * FROM resenyas";
    conexionBD.query(sql, function(error, resenyas){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for (let i=0; resenyas.length>i;i++){

                if(resenyas[i].recurso==idRecurso){

                    resenyasRecursos.push(resenyas[i])

                }

            }

            console.log("Reseñas del recurso", idRecurso, ":", resenyasRecursos);
            return callback(resenyasRecursos)
        }
    });
}

function crearResenya(idRecurso,idSanitario,valoracion,descripcion,callback){
    // Validar parámetros
    if (!idRecurso || !idSanitario || !valoracion || !descripcion) {
        return callback(null);
    }

    var sql = "SELECT * FROM resenyas";
    conexionBD.query(sql, function(error, resenyas){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            // Crear ID nuevo (buscar el máximo actual y sumar 1)
            var maxId = 0;
            for (let i=0;i<resenyas.length;i++) {
                if (resenyas[i].id>maxId) {
                    maxId=resenyas[i].id;
                }
            }

            var nuevoId=maxId+1;

            // Crear reseña
            var nuevaResenya = {
                id: nuevoId,
                recurso: idRecurso,
                sanitario: idSanitario,
                fecha: new Date(),
                valor: valoracion,
                descripcion: descripcion
            };

            // Añadir a la base de datos
            var sql = "INSERT INTO resenyas (id, recurso, sanitario, fecha, valor, descripcion) VALUES ('"
                + nuevaResenya.id + "','"
                + nuevaResenya.recurso + "','"
                + nuevaResenya.sanitario + "','"
                + nuevaResenya.fecha.toISOString().slice(0, 19).replace('T', ' ') + "','"
                + nuevaResenya.valor + "','"
                + nuevaResenya.descripcion + "')";

            conexionBD.query(sql, function(error){
                if(error){
                    console.log("Error al realizar el insert:", error);
                    return callback(null);
                } else {
                    console.log("Reseña creada:", nuevaResenya);
                    return callback(nuevoId);
                }
            });
        }
    });
}

function reservarRecurso(idRecurso, idSanitario, horasEstimadas, callback) {
    // Validar parámetros básicos
    if (!idRecurso || !idSanitario || !horasEstimadas || horasEstimadas <= 0) {
        return callback(null);
    }

    // Redondear a múltiplos de 0.5
    horasEstimadas = Math.round(horasEstimadas * 2) / 2;

    // Comprobar que el recurso existe
    var sql = "SELECT * FROM recursos";
    conexionBD.query(sql, function(error, recursos){
        if(error){
            console.log("Error al realizar la select de recursos:", error);
            return callback(null);
        } else {

            var recursoValido = false;

            for (var i = 0; i < recursos.length; i++) {
                if (recursos[i].id == idRecurso) {
                    recursoValido = true;
                    break;
                }
            }

            if (!recursoValido) {
                console.log("El recurso no existe:", idRecurso);
                return callback(null);
            }

            // Buscar el máximo id de reservas
            var sql = "SELECT * FROM reservas";
            conexionBD.query(sql, function(error, reservas){
                if(error){
                    console.log("Error al realizar la select de reservas:", error);
                    return callback(null);
                } else {

                    var maxId = 0;

                    for (var i = 0; i < reservas.length; i++) {
                        if (reservas[i].id > maxId) {
                            maxId = reservas[i].id;
                        }
                    }

                    var nuevoId = maxId + 1;

                    // Crear reserva
                    var nuevaReserva = {
                        id: nuevoId,
                        recurso: idRecurso,
                        sanitario: idSanitario,
                        horas_estimadas: horasEstimadas,
                        fecha_peticion: new Date(),
                        fecha_inicio: null,
                        fecha_fin: null
                    };

                    // Añadir a la base de datos
                    var sql = "INSERT INTO reservas (id, recurso, sanitario, horas_estimadas, fecha_peticion, fecha_inicio, fecha_fin) VALUES ('"
                        + nuevaReserva.id + "','"
                        + nuevaReserva.recurso + "','"
                        + nuevaReserva.sanitario + "','"
                        + nuevaReserva.horas_estimadas + "','"
                        + nuevaReserva.fecha_peticion.toISOString().slice(0, 19).replace('T', ' ') + "',"
                        + "NULL,NULL)";

                    conexionBD.query(sql, function(error){
                        if(error){
                            console.log("Error al realizar el insert:", error);
                            return callback(null);
                        } else {
                            console.log("Reserva creada:", nuevaReserva);
                            return callback(nuevoId);
                        }
                    });
                }
            });
        }
    });
}

function cancelarReserva(idReserva, callback) {

    var sql = "SELECT * FROM reservas";
    conexionBD.query(sql, function(error, reservas){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for (let i = 0; i < reservas.length; i++) {

                if (reservas[i].id == idReserva) {

                    var sql = "DELETE FROM reservas WHERE id = " + idReserva;

                    conexionBD.query(sql, function(error){
                        if(error){
                            console.log("Error al realizar el delete:", error);
                            return callback(null);
                        } else {
                            console.log("Reserva cancelada:", idReserva);
                            return callback(true);
                        }
                    });

                    return;
                }
            }

            console.log("No se encontró la reserva:", idReserva);
            return callback(null);
        }
    });
}

function iniciarReserva(idReserva, callback) {

    var sql = "SELECT * FROM reservas";
    conexionBD.query(sql, function(error, reservas){
        if(error){
            console.log("Error al realizar la select:", error);
            return callback(null);
        } else {

            for (let i = 0; i < reservas.length; i++) {

                if (reservas[i].id == idReserva) {

                    // Solo si no ha comenzado aún
                    if (reservas[i].fecha_inicio == null) {

                        var fechaInicio = new Date();

                        var sql = "UPDATE reservas SET fecha_inicio = '"
                            + fechaInicio.toISOString().slice(0, 19).replace('T', ' ')
                            + "' WHERE id = " + idReserva;

                        conexionBD.query(sql, function(error){
                            if(error){
                                console.log("Error al realizar el update:", error);
                                return callback(null);
                            } else {
                                console.log("Reserva iniciada:", idReserva);
                                return callback(true);
                            }
                        });
                        return;

                    } else {

                        console.log("La reserva ya estaba iniciada:", idReserva);
                        return callback(null);

                    }

                }

            }

            console.log("No se encontró la reserva:", idReserva);
            return callback(null);
        }
    });
}

function finalizarReserva(idReserva, callback) {

    console.log("Intentando finalizar reserva:", idReserva);

    // Primero buscamos la reserva
    var sql = "SELECT * FROM reservas WHERE id = " + idReserva;

    conexionBD.query(sql, function(error, reservas) {

        if (error) {
            console.log("Error al buscar la reserva:", error);
            return callback(null);
        }

        if (reservas.length === 0) {
            console.log("No se encontró la reserva:", idReserva);
            return callback(null);
        }

        var reserva = reservas[0];

        console.log("Reserva encontrada:", reserva);

        // La reserva debe estar iniciada y no finalizada
        if (reserva.fecha_inicio == null) {
            console.log("La reserva todavía no ha sido iniciada:", idReserva);
            return callback(null);
        }

        if (reserva.fecha_fin != null) {
            console.log("La reserva ya estaba finalizada:", idReserva);
            return callback(null);
        }

        var fechaFin = new Date();

        var fechaFinSQL = fechaFin
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        // IMPORTANTE:
        // Comprobamos otra vez que fecha_fin siga siendo NULL.
        // Así evitamos finalizar dos veces la misma reserva.
        var sqlUpdate = `
            UPDATE reservas
            SET fecha_fin = '${fechaFinSQL}'
            WHERE id = ${idReserva}
            AND fecha_inicio IS NOT NULL
            AND fecha_fin IS NULL
        `;

        conexionBD.query(sqlUpdate, function(error, resultado) {

            if (error) {
                console.log(
                    "Error al finalizar la reserva:",
                    error
                );
                return callback(null);
            }

            // Si no se modificó ninguna fila, otra llamada
            // probablemente ya la había finalizado.
            if (resultado.affectedRows === 0) {

                console.log(
                    "La reserva ya había sido finalizada:",
                    idReserva
                );

                return callback(null);
            }

            console.log(
                "Fecha de finalización guardada para la reserva:",
                idReserva
            );

            // Ahora ponemos el recurso disponible
            var sqlRecurso = `
                UPDATE recursos
                SET estado = 0
                WHERE id = ${reserva.recurso}
            `;

            conexionBD.query(sqlRecurso, function(error, resultadoRecurso) {

                if (error) {
                    console.log(
                        "Error al poner el recurso como disponible:",
                        error
                    );
                    return callback(null);
                }

                if (resultadoRecurso.affectedRows === 0) {

                    console.log(
                        "No se encontró el recurso:",
                        reserva.recurso
                    );

                    return callback(null);
                }

                console.log(
                    "Recurso puesto como disponible:",
                    reserva.recurso
                );

                console.log(
                    "Reserva finalizada:",
                    idReserva
                );

                return callback(true);
            });
        });
    });
}
var servidor = rpc.server(); // crear el servidor RPC
var app = servidor.createApp("gestion_pacientes"); // crear aplicación de RPC

//registros
app.registerAsync(obtenerCategorias);
app.registerAsync(obtenerModelos);
app.registerAsync(loginSanitario);
app.registerAsync(crearSanitario);
app.registerAsync(actualizarSanitario);
app.registerAsync(obtenerSanitario);
app.registerAsync(obtenerRecursos);
app.registerAsync(tiempoPendiente);
app.registerAsync(obtenerReservas);
app.registerAsync(obtenerResenyas);
app.registerAsync(crearResenya);
app.registerAsync(reservarRecurso);
app.registerAsync(cancelarReserva);
app.registerAsync(iniciarReserva);
app.registerAsync(finalizarReserva);
