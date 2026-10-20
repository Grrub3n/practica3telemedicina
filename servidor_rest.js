var express = require("express");
var app = express();
var conexion = require("./conexion_mysql.js")

var datosServidor= require("./datos.js");

var jwt = require("jwt-simple");
var clave = "miSecretoMasOscuro"

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


app.use("/appCliente", express.static("cliente_rest")); 
app.use(express.json()); 

app.listen(3000, function(){console.log("Servidor escuchando en http://localhost:3000")} );

//LOGIN
app.post("/api/gestores/login",function(req,res){
    var login= req.body.login;
    var password= req.body.password;
    var encontrado= null;

    var sql = "SELECT * FROM gestores";
    conexion.query(sql, function (err, gestores) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for(let i=0;i<gestores.length;i++){
                if (gestores[i].usuario===login && gestores[i].password===password){
                    encontrado=gestores[i];
                    break;
                }
            }

            if (encontrado!=null){
                var contenido = {
                    usuario: encontrado.id,
                    expira: Date.now() + 60 * 60 * 1000
                };

                var token = jwt.encode(contenido, clave);

                res.status(201).json({
                    id: encontrado.id,
                    token: token
                });
            }
            else{
                res.status(403).json({error: "Usuario o contrasenya incorrecta"});
            }
        }
    });  

    
})

app.use("/api", function (req, res, next) {
    var token = req.query.token;

    if (!token) {
        res.status(301).json("No se ha encontrado token");
        return;
    }

    var contenidoToken;

    try {
        contenidoToken = jwt.decode(token, clave);
    } catch (error) {
        res.status(301).json("El token es incorrecto");
        return;
    }

    console.log("El contenido del token es:", contenidoToken);

    if (
        !contenidoToken ||
        !contenidoToken.expira ||
        !contenidoToken.usuario
    ) {
        res.status(301).json("El formato del token no es adecuado");
        return;
    }

    if (contenidoToken.expira < Date.now()) {
        res.status(301).json("El token ha expirado");
        return;
    }

    next();
});

//GET

app.get("/api/ubicaciones", function(req,res){
    var sql = "SELECT * FROM ubicaciones";
    conexion.query(sql, function (err, ubicaciones) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            console.log("Ubicaciones:", ubicaciones);
            res.status(200).json(ubicaciones);
        }
    });   
});
app.get("/api/categorias",function(req,res){
    var sql = "SELECT * FROM categorias";
    conexion.query(sql, function (err, categorias) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            console.log("Categorias:", categorias);
            res.status(200).json(categorias);
        }
    });   
})
app.get("/api/modelos",function(req,res){
    var sql = "SELECT * FROM modelos";
    conexion.query(sql, function (err, modelos) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            console.log("Modelos:", modelos);
            res.status(200).json(modelos);
        }
    });   
})

app.get("/api/gestores/:id", function(req,res){
    if (isNaN(req.params.id)){
        res.status(404).json({error:"No es un numero"});
        return
    }
    var id= parseInt(req.params.id);

    var sql = "SELECT * FROM gestores";
    conexion.query(sql, function (err, gestores) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } 
        
        else {
            for (let i=0; gestores.length>i;i++){
                if(gestores[i].id===id){
                    var devolver={
                        id:gestores[i].id,
                        nombre:gestores[i].nombre,
                        apellidos:gestores[i].apellidos,
                        usuario:gestores[i].usuario
                    }
                    console.log("Devolver: ",devolver);
                    res.status(200).json(devolver);
                    return;
                }
            }
            res.status(404).json({error:"Error, usuario no encontrado"})
        }
    });   
})

app.get("/api/sanitarios/:id",function(req,res){
    if (isNaN(req.params.id)){
        res.status(404).json({error:"No es un numero"});
        return;
    }

    var id= parseInt(req.params.id);

    var sql = "SELECT * FROM sanitarios";
    conexion.query(sql, function (err, sanitarios) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for (let i=0;sanitarios.length>i;i++){
                if (sanitarios[i].id==id){
                    var devolver={
                        id:sanitarios[i].id,
                        nombre:sanitarios[i].nombre,
                        apellidos:sanitarios[i].apellidos,
                        usuario:sanitarios[i].usuario
                    }
                    console.log("Devolver: "+ devolver);
                    res.status(200).json(devolver);
                    return
                }
            }
            res.status(404).json({error:"Usuario no encontrado"})
        }
    });   
    
})

app.get("/api/recursos",function(req,res){
    var categoria= req.query.categoria;
    var modelo= req.query.modelo;
    var ubicacion= req.query.ubicacion;
    var estado= req.query.estado;
    var lista=[];

    var sql = "SELECT * FROM recursos";
    conexion.query(sql, function (err, recursos) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            var sql = "SELECT * FROM modelos";
            conexion.query(sql, function (err, modelos) {
                if (err) {
                    console.log("Error al realizar la select", err);
                    res.status(500).json("Error al realizar la consulta");
                } else {
                    for (let i=0; recursos.length>i;i++){
                        var cumple=true;
                        var existe=false;
                
                        if(modelo!=undefined && modelo!=recursos[i].modelo ){
                            cumple=false;
                        }
                        if(ubicacion!=undefined && ubicacion!=recursos[i].ubicacion){
                            cumple=false;
                        }
                        if(estado!=undefined && estado!=recursos[i].estado){
                            cumple=false;
                        }
                        if(categoria!=undefined){
                            for (let j=0;j<modelos.length;j++){
                                if (modelos[j].id==recursos[i].modelo){
                                    existe=true;
                                    if (modelos[j].categoria!=categoria){
                                        cumple=false;
                                    }
                                    break;
                                }
                            }
                        }
                        else{
                            existe=true;
                        }
                        if (existe==false){
                            cumple=false;
                        }
                        if (cumple){
                            lista.push(recursos[i]);
                        }
                    }
                    
                    res.status(200).json(lista);
                }
            }); 
            
        }
    });   
})

app.get("/api/recursos/:id",function(req,res){
    if (isNaN(req.params.id)){
        res.status(404).json({error:"error al introducir id"});
        return;
    }
    var id=parseInt(req.params.id);
    
    var sql = "SELECT * FROM recursos";
    conexion.query(sql, function (err, recursos) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for (let i=0;recursos.length>i;i++){
                if (recursos[i].id==id){
                    console.log("Salida: ", recursos[i]);
                    res.status(200).json(recursos[i]);
                    return
                }
            }
            res.status(404).json({error:"error, id no encontrado"});
        }
    });   
    
})

app.get("/api/recursos/:id/reservas", function(req, res) {  
    if (isNaN(req.params.id)) {
        res.status(404).json({error:"id invalido"});
        return;
    }

    var id = parseInt(req.params.id);
    var reservasRecurso=[];

    var sql = "SELECT * FROM reservas";
    conexion.query(sql, function (err, reservas) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            var sql = "SELECT * FROM sanitarios";
            conexion.query(sql, function (err, sanitarios) {
                if (err) {
                    console.log("Error al realizar la select", err);
                    res.status(500).json("Error al realizar la consulta");
                } else {
                    for (var i = 0; i < reservas.length; i++) {
                        if (reservas[i].recurso==id) {
                            var nombreSanitario = "-";
                            for (var j=0;j<sanitarios.length;j++) {
                                if (sanitarios[j].id==reservas[i].sanitario) {
                                    nombreSanitario=sanitarios[j].nombre + " " + sanitarios[j].apellidos;
                                    break;
                                }
                            }

                            reservasRecurso.push({
                                nombre_sanitario: nombreSanitario,
                                fecha_peticion: reservas[i].fecha_peticion,
                                fecha_inicio: reservas[i].fecha_inicio,
                                fecha_fin: reservas[i].fecha_fin,
                                horas_estimadas: reservas[i].horas_estimadas
                            });
                        }
                    }

                    res.status(200).json(reservasRecurso);
                                }
                            });   
                }
    });   

    
});
app.get("/api/recursos/:id/resenyas", function(req, res) {
    if (isNaN(req.params.id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    var id = parseInt(req.params.id);
    var resenyasRecurso = [];
    var sql = "SELECT * FROM resenyas";
    conexion.query(sql, function (err, resenyas) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            var sql = "SELECT * FROM sanitarios";
            conexion.query(sql, function (err, sanitarios) {
                if (err) {
                    console.log("Error al realizar la select", err);
                    res.status(500).json("Error al realizar la consulta");
                } else {
                    
                    for (var i = 0; i < resenyas.length; i++) {
                        if (resenyas[i].recurso==id) {
                            var nombreSanitario="-";
                            for (var j = 0; j < sanitarios.length; j++) {
                                if (sanitarios[j].id == resenyas[i].sanitario) {
                                    nombreSanitario = sanitarios[j].nombre + " " + sanitarios[j].apellidos;
                                    break;
                                }
                            }

                            resenyasRecurso.push({
                                nombre_sanitario: nombreSanitario,
                                descripcion: resenyas[i].descripcion,
                                fecha: resenyas[i].fecha,
                                valor: resenyas[i].valor
                            });
                        }
                    }
                    res.status(200).json(resenyasRecurso); 
                        
                }
            });             
        }
    }); 

    
});

//POST

app.post("/api/gestores",function(req,res){
    var nuevo_gestor=req.body;//{nombre, apellidos, usuario, password}

    var sql = "SELECT * FROM gestores";
    conexion.query(sql, function (err, gestores) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } 
        else {
            for(let i=0;gestores.length>i;i++){
                if(gestores[i].usuario=== nuevo_gestor.usuario){
                    res.status(403).json({error:"El usuario ya existe"});
                    return;
                }
            }
            var id_max=0;
            for (let i=0; gestores.length>i;i++){
                if (gestores[i].id>id_max){
                    id_max=gestores[i].id;
                }
            }
            var nuevo_id=id_max+1;
            nuevo_gestor.id=nuevo_id;
            var sql = "INSERT INTO gestores (id, nombre, apellidos, usuario, password) VALUES ('" + nuevo_gestor.id + "','" + nuevo_gestor.nombre + "','" + nuevo_gestor.apellidos + "','" + nuevo_gestor.usuario + "','" + nuevo_gestor.password + "')";
            conexion.query(sql, function (err, resultado) {
                if (err) {
                    console.log("Error al realizar el insert", err);
                    res.status(500).json("Error al realizar la insercion");
                } else {
                    console.log("Insertado:", resultado);
                    res.status(201).json({id:nuevo_gestor.id});
                }
            });
            
        }
    });   

    
})

app.post("/api/recursos",function(req,res){
    var nuevoRecurso= req.body; // modelo, ubicacion, numero_serie, estado

    var maxid=0;

    var sql = "SELECT * FROM recursos";
    conexion.query(sql, function (err, recursos) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for (let i=0;recursos.length>i;i++){
                if (recursos[i].id>=maxid){
                    maxid=recursos[i].id;
                    maxid=maxid+1;
                }
            }
            nuevoRecurso.id=maxid;

            var sql = "INSERT INTO recursos (id, modelo, ubicacion, numero_serie, estado) VALUES ('" + nuevoRecurso.id + "','" + nuevoRecurso.modelo + "','" + nuevoRecurso.ubicacion + "','" + nuevoRecurso.numero_serie + "','" + nuevoRecurso.estado + "')";
            conexion.query(sql, function (err, resultado) {
                if (err) {
                    console.log("Error al realizar el insert", err);
                    res.status(500).json("Error al realizar la insercion");
                } else {
                    console.log("Insertado:", resultado);
                    res.status(201).json({id:nuevoRecurso.id});
                }
            });
            
        }
    });

    
})

//PUT

app.put("/api/gestores/:id",function(req,res){
    if(isNaN(req.params.id)){
        res.status(404).json({error:"No es un numero"});
        return
    }


    var id= parseInt(req.params.id);
    var nombre= req.body.nombre;
    var apellidos= req.body.apellidos;
    var usuario=req.body.usuario;
    var password=req.body.password;
    
    var sql = "SELECT * FROM gestores";
    conexion.query(sql, function (err, gestores) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for (let i=0;i<gestores.length;i++){
                if (gestores[i].id===id){
                    for (let j=0;j<gestores.length;j++){
                        if (gestores[j].usuario==usuario && gestores[j].id!=id){
                            res.status(403).json({error:"error, usuario repetido"})
                            return
                        }
                    }
                    var sql = "UPDATE gestores SET nombre = '"
                    + nombre + "', apellidos = '"
                    + apellidos + "', usuario = '"
                    + usuario + "', password = '"
                    + password + "' WHERE id = " + id;
                    conexion.query(sql, function (err, resultado) {
                        if (err) {
                            console.log("Error al realizar el update", err);
                            res.status(500).json("Error al realizar la actualización");
                        } else {
                            console.log("Actualizado:", resultado);
                            res.status(200).json({
                                id: id,
                                nombre: nombre,
                                apellidos: apellidos,
                                usuario: usuario,
                                password: password
                            });
                            return
                        }
                    });
                    return
                    
                }
            }
            res.status(404).json({error:"error al cambiar los datos"})
        }
    }); 

    
})

app.put("/api/recursos/:id", function(req,res){
    if (isNaN(req.params.id)){
        res.status(404).json({error:"Error, id incorrecto"});
        return;
    }

    var id = parseInt(req.params.id);
    var modelo = req.body.modelo;
    var ubicacion = req.body.ubicacion;
    var numero_serie = req.body.numero_serie;
    var estado = req.body.estado;

    var sql = "SELECT * FROM recursos";
    conexion.query(sql, function (err, recursos) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for (let i=0; i<recursos.length; i++){
                if (recursos[i].id == id){

                    var sql = "UPDATE recursos SET modelo = '"
                    + modelo + "', ubicacion = '"
                    + ubicacion + "', numero_serie = '"
                    + numero_serie + "', estado = '"
                    + estado + "' WHERE id = " + id;

                    conexion.query(sql, function (err, resultado) {
                        if (err) {
                            console.log("Error al realizar el update", err);
                            res.status(500).json("Error al realizar la actualización");
                        } else {
                            console.log("Actualizado:", resultado);
                            res.status(200).json({
                                id: id,
                                modelo: modelo,
                                ubicacion: ubicacion,
                                numero_serie: numero_serie,
                                estado: estado
                            });
                        }
                    });

                    return;
                }
            }

            res.status(404).json({error:"Error al cambiar datos"});
        }
    });
});

//DELETE

app.delete("/api/recursos/:id",function(req,res){
    if (isNaN(req.params.id)){
        res.status(404).json({error:"Error, id no es un numero"})
        return;
    }

    var id= req.params.id
    var sql = "SELECT * FROM recursos";
    conexion.query(sql, function (err, recursos) {
        if (err) {
            console.log("Error al realizar la select", err);
            res.status(500).json("Error al realizar la consulta");
        } else {
            for(let i=0;recursos.length>i;i++){
                if (recursos[i].id==id){
                    var sql = "DELETE FROM recursos WHERE id = " + id;
                    conexion.query(sql, function (err, resultado) {
                        if (err) {
                            console.log("Error al realizar el delete", err);
                            res.status(500).json("Error al realizar el borrado");
                        } else {
                            console.log("Recurso borrado:", resultado);
                            res.status(200).json({mensaje:"Elemento eliminado"})
                            return;
                        }
                    });
                    return;
                }
            }
            res.status(404).json({erros:"Error, id no encontrado"})
        }
    });   

    
})
