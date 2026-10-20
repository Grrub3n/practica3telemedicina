document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("miBoton").addEventListener("click", () => {
    if (conexion) {
        conexion.close();
        conexion = null;
        document.getElementById("cuerpoAvisos").innerHTML = "";
    }
  });
});

var app= rpc("192.168.231.125","gestion_pacientes");

var obtenerCategorias=app.procedure("obtenerCategorias");
var obtenerModelos=app.procedure("obtenerModelos");
var loginSanitario= app.procedure("loginSanitario");
var crearSanitario=app.procedure("crearSanitario");
var actualizarSanitario=app.procedure("actualizarSanitario");
var obtenerSanitario=app.procedure("obtenerSanitario");
var tiempoPendiente=app.procedure("tiempoPendiente");
var obtenerResenyas=app.procedure("obtenerResenyas");
var obtenerReservas=app.procedure("obtenerReservas");
var obtenerRecursos=app.procedure("obtenerRecursos");
var crearResenya=app.procedure("crearResenya");
var reservarRecurso=app.procedure("reservarRecurso");
var cancelarReserva=app.procedure("cancelarReserva");
var iniciarReserva=app.procedure("iniciarReserva");
var finalizarReserva=app.procedure("finalizarReserva");

//mis queridisimas globales
var anterior="login"
var loginActual=null;
var nombreActual=null;
var resenyaActual=null;
var resenyaActualNombre=null;
var datosResenya=null;

//mi conex a websocket
var conexion = null;

function actualizarNombre(){
    obtenerSanitario(loginActual,function(datosSanitario){
        var nombre=datosSanitario.nombre;
        var apellidos=datosSanitario.apellidos;
        nombreActual=`${nombre} ${apellidos}`
        document.getElementById("nombreUsuario").textContent=`Bienvenido ${nombreActual}`
        
    })
}
function loginActualizarNombre(){
    obtenerSanitario(loginActual,function(datosSanitario){
        var nombre=datosSanitario.nombre;
        var apellidos=datosSanitario.apellidos;
        nombreActual=`${nombre} ${apellidos}`
        document.getElementById("nombreUsuario").textContent=`Bienvenido ${nombreActual}`
        conexion.send(JSON.stringify({
            operacion: "identificar",
            id: loginActual,
            tipo: "sanitario",
            nombre: nombreActual
        }));
    })
}


function limpiarRegistro(){
    document.getElementById("registroNombre").value = "";
        document.getElementById("registroApellidos").value = "";
        document.getElementById("registroLogin").value = "";
        document.getElementById("registroPassword").value = "";
}

function cargarCategoriasNuevaReserva() {
    var select = document.getElementById("nuevaReservaCategoria");
    select.innerHTML = "";

    obtenerCategorias(function(categorias){
        for (let i = 0; i < categorias.length; i++) {
            let option = document.createElement("option");
            option.value = categorias[i].id;
            option.textContent = categorias[i].nombre;
            select.appendChild(option);
        }

        if (categorias.length > 0) {
            cargarModelosNuevaReserva(categorias[0].id);
        }
    });
}
function cargarModelosNuevaReserva(idCategoria) {
    var select = document.getElementById("nuevaReservaModelo");
    select.innerHTML = "";

    obtenerModelos(function(modelos){
        for (let i = 0; i < modelos.length; i++) {
            if (modelos[i].categoria == idCategoria) {
                let option = document.createElement("option");
                option.value = modelos[i].id;
                option.textContent = modelos[i].nombre;
                select.appendChild(option);
            }
        }

        if (select.value) {
            cargarRecursosNuevaReserva(select.value);
        }
    });
}

// ============================================================
// CONTROL DE CARGAS DE LAS TABLAS
// Evita que respuestas asíncronas antiguas vuelvan a pintar
// filas después de una nueva carga.
// ============================================================

var cargaPendientes = 0;
var cargaRealizadas = 0;


// ============================================================
// NUEVA RESERVA
// ============================================================

function cargarRecursosNuevaReserva(idModelo) {

    var tbody = document.getElementById("nuevaReservaTabla");
    tbody.innerHTML = "";

    function obtenerHorasValidas() {

        var horasInput = document.getElementById("nuevaReservaHoras").value;
        var horas = parseFloat(horasInput);

        if (isNaN(horas) || horas <= 0) {
            alert("Introduce horas válidas (positivas, se permiten medias horas).");
            return null;
        }

        if (horas > 6) {
            alert("No puedes reservar más de 6 horas.");
            return null;
        }

        return Math.round(horas * 2) / 2;
    }


    obtenerRecursos(idModelo, function(listaRecursos) {

        if (!listaRecursos) return;

        for (var i = 0; i < listaRecursos.length; i++) {

            (function(recurso) {

                tiempoPendiente(recurso.id, function(horasPendientes) {

                    obtenerResenyas(recurso.id, function(resenyas) {

                        var media = 0;

                        if (resenyas && resenyas.length > 0) {

                            var suma = 0;

                            for (var j = 0; j < resenyas.length; j++) {
                                suma += resenyas[j].valor;
                            }

                            media = suma / resenyas.length;
                        }


                        // Crear fila
                        var tr = document.createElement("tr");


                        // Número de serie
                        var tdSerie = document.createElement("td");
                        tdSerie.textContent = recurso.numero_serie;


                        // Tiempo pendiente
                        var tdHoras = document.createElement("td");

                        if (horasPendientes === 0) {
                            tdHoras.textContent = "Disponible";
                        } else {
                            tdHoras.textContent = horasPendientes.toFixed(2);
                        }


                        // Valoración
                        var tdMedia = document.createElement("td");
                        tdMedia.textContent = media.toFixed(2);


                        // Botón reservar
                        var tdBtn = document.createElement("td");
                        var btn = document.createElement("button");

                        btn.textContent = "Reservar";


                        btn.onclick = function() {

                            var horasEst = obtenerHorasValidas();

                            if (horasEst === null) {
                                return;
                            }

                            btn.disabled = true;


                            console.log(
                                "Creando reserva para recurso:",
                                recurso.id,
                                "Horas:",
                                horasEst,
                                "Tiempo pendiente:",
                                horasPendientes
                            );


                            reservarRecurso(
                                recurso.id,
                                loginActual,
                                horasEst,
                                function(idReserva) {

                                    if (!idReserva) {

                                        console.log(
                                            "Error al crear la reserva"
                                        );

                                        alert("Error al crear la reserva");
                                        btn.disabled = false;
                                        return;
                                    }


                                    console.log(
                                        "Reserva creada:",
                                        idReserva
                                    );


                                    // =================================================
                                    // RECURSO LIBRE
                                    // =================================================

                                    if (horasPendientes === 0) {

                                        console.log(
                                            "Recurso libre. Iniciando reserva:",
                                            idReserva
                                        );


                                        // IMPORTANTE:
                                        // NO recargamos las tablas hasta que
                                        // iniciarReserva haya terminado.

                                        iniciarReserva(
                                            idReserva,
                                            function(inicioCorrecto) {

                                                if (!inicioCorrecto) {

                                                    console.log(
                                                        "Error al iniciar reserva:",
                                                        idReserva
                                                    );

                                                    alert("Error al iniciar reserva");
                                                    btn.disabled = false;
                                                    return;
                                                }


                                                console.log(
                                                    "Reserva iniciada correctamente:",
                                                    idReserva
                                                );


                                                // Ahora sí podemos recargar
                                                cargarRecursosNuevaReserva(idModelo);
                                                cargarReservasPendientes();
                                                cargarReservasRealizadas();


                                                document.getElementById("inicio").style.display = "block";
                                                document.getElementById("nuevaReserva").style.display = "none";
                                                document.getElementById("nuevaReservaHoras").value = null;
                                            }
                                        );

                                    }


                                    // =================================================
                                    // RECURSO OCUPADO
                                    // =================================================

                                    else {

                                        console.log(
                                            "Recurso ocupado."
                                        );

                                        console.log(
                                            "Reserva queda pendiente:",
                                            idReserva
                                        );


                                        // NO iniciarReserva().
                                        //
                                        // La reserva permanece:
                                        //
                                        // fecha_inicio = NULL
                                        // fecha_fin = NULL
                                        //
                                        // Por tanto aparece en pendientes.

                                        cargarRecursosNuevaReserva(idModelo);
                                        cargarReservasPendientes();
                                        cargarReservasRealizadas();


                                        document.getElementById("inicio").style.display = "block";
                                        document.getElementById("nuevaReserva").style.display = "none";
                                        document.getElementById("nuevaReservaHoras").value = null;
                                    }
                                }
                            );
                        };


                        tdBtn.appendChild(btn);

                        tr.appendChild(tdSerie);
                        tr.appendChild(tdHoras);
                        tr.appendChild(tdMedia);
                        tr.appendChild(tdBtn);

                        tbody.appendChild(tr);

                    });
                });

            })(listaRecursos[i]);
        }
    });
}



// ============================================================
// RESERVAS PENDIENTES
// ============================================================

function cargarReservasPendientes() {

    // Nueva generación de carga
    cargaPendientes++;

    var miCarga = cargaPendientes;

    var tbody = document.getElementById("tablaPendientes");

    tbody.innerHTML = "";


    obtenerReservas(loginActual, function(listaReservas) {

        // Si ya se ha iniciado otra carga después de esta,
        // ignoramos completamente esta respuesta.
        if (miCarga !== cargaPendientes) return;


        for (let i = 0; i < listaReservas.length; i++) {

            let reserva = listaReservas[i];


            // SOLO pendientes
            //
            // Si tiene fecha_inicio, ya está en realizadas.
            if (reserva.fecha_inicio !== null) {
                continue;
            }


            (function(reserva) {

                obtenerModelos(function(modelos) {

                    if (miCarga !== cargaPendientes) return;


                    for (let j = 0; j < modelos.length; j++) {

                        let modelo = modelos[j];


                        obtenerRecursos(modelo.id, function(listaRecursos) {

                            if (miCarga !== cargaPendientes) return;

                            if (!listaRecursos) return;


                            for (let k = 0; k < listaRecursos.length; k++) {

                                let recurso = listaRecursos[k];


                                if (recurso.id === reserva.recurso) {

                                    obtenerCategorias(function(categorias) {

                                        if (miCarga !== cargaPendientes) return;


                                        var categoria = null;


                                        for (let m = 0; m < categorias.length; m++) {

                                            if (categorias[m].id === modelo.categoria) {

                                                categoria = categorias[m];
                                                break;
                                            }
                                        }


                                        if (!categoria) return;


                                        tiempoPendiente(recurso.id, function(horas) {

                                            if (miCarga !== cargaPendientes) return;


                                            var tr = document.createElement("tr");


                                            // Categoría
                                            var tdCategoria = document.createElement("td");
                                            tdCategoria.textContent = categoria.nombre;


                                            // Modelo
                                            var tdModelo = document.createElement("td");
                                            tdModelo.textContent = modelo.nombre;


                                            // Número de serie
                                            var tdSerie = document.createElement("td");
                                            tdSerie.textContent = recurso.numero_serie;


                                            // Fecha petición
                                            var tdFecha = document.createElement("td");
                                            tdFecha.textContent =
                                                new Date(reserva.fecha_peticion).toLocaleString();


                                            // Tiempo pendiente
                                            var tdHoras = document.createElement("td");
                                            tdHoras.textContent = horas.toFixed(2);


                                            // =================================================
                                            // BOTÓN RETIRAR
                                            // =================================================

                                            var tdRetirar = document.createElement("td");


                                            // SOLO aparece cuando ya está disponible
                                            if (horas === 0) {

                                                var btnR = document.createElement("button");

                                                btnR.textContent = "Retirar";


                                                btnR.onclick = function() {

                                                    btnR.disabled = true;


                                                    iniciarReserva(
                                                        reserva.id,
                                                        function(inicioCorrecto) {

                                                            if (!inicioCorrecto) {

                                                                alert("No se puede iniciar la reserva.");
                                                                btnR.disabled = false;
                                                                return;
                                                            }


                                                            console.log(
                                                                "Reserva iniciada desde pendientes:",
                                                                reserva.id
                                                            );


                                                            cargarReservasPendientes();
                                                            cargarReservasRealizadas();


                                                            conexion.send(JSON.stringify({
                                                                operacion: "iniciarReserva",
                                                                modelo: modelo.nombre,
                                                                numero_serie: recurso.numero_serie,
                                                                categoria: categoria.nombre
                                                            }));
                                                        }
                                                    );
                                                };


                                                tdRetirar.appendChild(btnR);
                                            }


                                            // =================================================
                                            // BOTÓN CANCELAR
                                            // =================================================

                                            var tdCancelar = document.createElement("td");

                                            var btnC = document.createElement("button");

                                            btnC.textContent = "Cancelar";


                                            btnC.onclick = function() {

                                                btnC.disabled = true;


                                                cancelarReserva(
                                                    reserva.id,
                                                    function(resultado) {

                                                        if (!resultado) {

                                                            alert("No se pudo cancelar la reserva.");
                                                            btnC.disabled = false;
                                                            return;
                                                        }


                                                        console.log(
                                                            "Reserva cancelada:",
                                                            reserva.id
                                                        );


                                                        cargarReservasPendientes();
                                                        cargarReservasRealizadas();
                                                    }
                                                );
                                            };


                                            tdCancelar.appendChild(btnC);


                                            // Añadir fila
                                            tr.appendChild(tdCategoria);
                                            tr.appendChild(tdModelo);
                                            tr.appendChild(tdSerie);
                                            tr.appendChild(tdFecha);
                                            tr.appendChild(tdHoras);
                                            tr.appendChild(tdRetirar);
                                            tr.appendChild(tdCancelar);


                                            tbody.appendChild(tr);

                                        });
                                    });

                                    return;
                                }
                            }
                        });
                    }
                });

            })(reserva);
        }
    });
}



// ============================================================
// RESERVAS REALIZADAS
// ============================================================

function cargarReservasRealizadas() {

    // Nueva generación de carga
    cargaRealizadas++;

    var miCarga = cargaRealizadas;

    var tbody = document.getElementById("tablaRealizadas");

    tbody.innerHTML = "";


    obtenerReservas(loginActual, function(listaReservas) {

        if (miCarga !== cargaRealizadas) return;


        for (var i = 0; i < listaReservas.length; i++) {

            var reserva = listaReservas[i];


            // SOLO reservas iniciadas
            //
            // Si fecha_inicio existe, pertenece a realizadas,
            // aunque todavía no tenga fecha_fin.
            if (reserva.fecha_inicio === null) {
                continue;
            }


            (function(reservaCopia) {

                obtenerModelos(function(modelos) {

                    if (miCarga !== cargaRealizadas) return;


                    for (var j = 0; j < modelos.length; j++) {

                        (function(modeloCopia) {

                            obtenerRecursos(
                                modeloCopia.id,
                                function(listaRecursos) {

                                    if (miCarga !== cargaRealizadas) return;

                                    if (!listaRecursos) return;


                                    for (var k = 0; k < listaRecursos.length; k++) {

                                        (function(recursoCopia) {


                                            if (
                                                recursoCopia.id !==
                                                reservaCopia.recurso
                                            ) {
                                                return;
                                            }


                                            obtenerCategorias(function(categorias) {

                                                if (miCarga !== cargaRealizadas) return;


                                                var categoriaCopia = null;


                                                for (
                                                    var m = 0;
                                                    m < categorias.length;
                                                    m++
                                                ) {

                                                    if (
                                                        categorias[m].id ===
                                                        modeloCopia.categoria
                                                    ) {

                                                        categoriaCopia =
                                                            categorias[m];

                                                        break;
                                                    }
                                                }


                                                if (!categoriaCopia) return;


                                                var tr =
                                                    document.createElement("tr");


                                                // Categoría
                                                var tdCategoria =
                                                    document.createElement("td");

                                                tdCategoria.textContent =
                                                    categoriaCopia.nombre;


                                                // Modelo
                                                var tdModelo =
                                                    document.createElement("td");

                                                tdModelo.textContent =
                                                    modeloCopia.nombre;


                                                // Serie
                                                var tdSerie =
                                                    document.createElement("td");

                                                tdSerie.textContent =
                                                    recursoCopia.numero_serie;


                                                // Horas
                                                var tdHoras =
                                                    document.createElement("td");

                                                tdHoras.textContent =
                                                    reservaCopia.horas_estimadas.toFixed(2);


                                                // Inicio
                                                var tdInicio =
                                                    document.createElement("td");

                                                tdInicio.textContent =
                                                    new Date(
                                                        reservaCopia.fecha_inicio
                                                    ).toLocaleString();


                                                // Fin / Devolver
                                                var tdFin =
                                                    document.createElement("td");


                                                if (reservaCopia.fecha_fin) {

                                                    tdFin.textContent =
                                                        new Date(
                                                            reservaCopia.fecha_fin
                                                        ).toLocaleString();

                                                } else {

                                                    var btnFin =
                                                        document.createElement("button");

                                                    btnFin.textContent =
                                                        "Devolver";


                                                    (function(reservaBoton) {

                                                        btnFin.onclick =
                                                            function() {

                                                                btnFin.disabled =
                                                                    true;


                                                                finalizarReserva(
                                                                    reservaBoton.id,
                                                                    function(resultado) {

                                                                        if (!resultado) {

                                                                            alert(
                                                                                "No se pudo finalizar la reserva."
                                                                            );

                                                                            btnFin.disabled =
                                                                                false;

                                                                            return;
                                                                        }


                                                                        console.log(
                                                                            "Reserva finalizada desde el cliente:",
                                                                            reservaBoton.id
                                                                        );


                                                                        cargarReservasRealizadas();
                                                                        cargarReservasPendientes();


                                                                        conexion.send(JSON.stringify({
                                                                            operacion: "finalizarReserva",
                                                                            modelo: modeloCopia.nombre,
                                                                            numero_serie: recursoCopia.numero_serie,
                                                                            categoria: categoriaCopia.nombre
                                                                        }));
                                                                    }
                                                                );
                                                            };

                                                    })(reservaCopia);


                                                    tdFin.appendChild(btnFin);
                                                }


                                                // =================================================
                                                // RESEÑA
                                                // =================================================

                                                var tdResenya =
                                                    document.createElement("td");

                                                var btnRes =
                                                    document.createElement("button");

                                                btnRes.textContent =
                                                    "Reseña";


                                                (function(
                                                    reservaBoton,
                                                    recursoBoton
                                                ) {

                                                    btnRes.onclick =
                                                        function() {

                                                            datosResenya = {
                                                                recurso:
                                                                    reservaBoton.recurso,

                                                                codigo:
                                                                    recursoBoton.numero_serie,

                                                                modelo:
                                                                    modeloCopia.nombre,

                                                                categoria:
                                                                    categoriaCopia.nombre
                                                            };


                                                            resenyaActual =
                                                                reservaBoton.recurso;

                                                            resenyaActualNombre =
                                                                recursoBoton.numero_serie;


                                                            document.getElementById(
                                                                "nombreRecurso"
                                                            ).textContent =
                                                                `Recurso: ${resenyaActualNombre}`;


                                                            document.getElementById(
                                                                "resenya"
                                                            ).style.display =
                                                                "block";


                                                            document.getElementById(
                                                                "inicio"
                                                            ).style.display =
                                                                "none";
                                                        };

                                                })(
                                                    reservaCopia,
                                                    recursoCopia
                                                );


                                                tdResenya.appendChild(
                                                    btnRes
                                                );


                                                // Añadir fila
                                                tr.appendChild(tdCategoria);
                                                tr.appendChild(tdModelo);
                                                tr.appendChild(tdSerie);
                                                tr.appendChild(tdHoras);
                                                tr.appendChild(tdInicio);
                                                tr.appendChild(tdFin);
                                                tr.appendChild(tdResenya);


                                                tbody.appendChild(tr);

                                            });

                                        })(listaRecursos[k]);
                                    }

                                }
                            );

                        })(modelos[j]);
                    }

                });

            })(reserva);
        }
    });
}

window.onload=function(){

document.getElementById("loginEntrar").addEventListener("click",function(){
    var usuario=document.getElementById("loginUsuario").value;
    var password=document.getElementById("loginPassword").value;
    loginSanitario(usuario,password, function(idSanitario){
        if (idSanitario) {
            loginActual=idSanitario;
            alert("Login correcto");

            conexion = new WebSocket("ws://192.168.231.125:4444", "rpc");
            conexion.addEventListener("open", function () {
                console.log("Conectado");
                loginActualizarNombre();
                eventosWS();
            });
            

            document.getElementById("login").style.display="none";
            document.getElementById("inicio").style.display="block";
            anterior="login"
            cargarReservasPendientes();
            cargarReservasRealizadas();
            document.getElementById("loginUsuario").value="";
            document.getElementById("loginPassword").value="";
            
        } 
        else {
            alert("Usario o contraseña incorrecta");
        }
    })
})

document.getElementById("loginRegistrar").addEventListener("click",function(){
    document.getElementById("login").style.display="none";
    document.getElementById("registro").style.display="block";
    anterior="login"
})

document.getElementById("registroGuardar").addEventListener("click", function(){
    var nombre=document.getElementById("registroNombre").value;
    var apellidos=document.getElementById("registroApellidos").value;
    var usuario=document.getElementById("registroLogin").value;
    var password=document.getElementById("registroPassword").value;
    var nuevoSanitario={nombre:nombre,apellidos:apellidos,usuario:usuario,password:password}
    if (anterior=="login"){
        crearSanitario(nuevoSanitario,function(idSanitario){
            if (idSanitario){
                limpiarRegistro();
                alert("Sanitario creado correctamente")
                document.getElementById("registro").style.display="none";
                document.getElementById("login").style.display="block";
            }
            else{
                alert("Error: usuario ya existente o datos incorrectos")
            }  
        })
    }
    if (anterior=="inicio"){
        actualizarSanitario(loginActual,nuevoSanitario,function(idSanitario){
            if (idSanitario){
                limpiarRegistro();
                document.getElementById("registro").style.display="none";
                document.getElementById("inicio").style.display="block";
                alert("Datos cambiados correctamente")
                actualizarNombre();
            }
            else{
                alert("Error: usuario ya existente o datos incorrectos")
            }  
        })        
    }                    
  
})

document.getElementById("registroCancelar").addEventListener("click",function(){
    if (anterior=="login"){
        limpiarRegistro();
        document.getElementById("registro").style.display="none";
        document.getElementById("login").style.display="block";
    }
    if (anterior=="inicio"){
        limpiarRegistro();
        document.getElementById("registro").style.display="none";
        document.getElementById("inicio").style.display="block";
        cargarReservasPendientes();
        cargarReservasRealizadas();
    }
})

document.getElementById("inicioRegistrar").addEventListener("click",function(){  
    obtenerSanitario(loginActual,function(datosSanitario){
        document.getElementById("registroNombre").value=datosSanitario.nombre;
        document.getElementById("registroApellidos").value=datosSanitario.apellidos;
        document.getElementById("registroLogin").value=datosSanitario.usuario;
        document.getElementById("inicio").style.display="none";
        document.getElementById("registro").style.display="block";
    })
    anterior="inicio"
})

document.getElementById("inicioSalir").addEventListener("click",function(){
    if (conexion) {
        conexion.close();
        conexion = null;
        document.getElementById("cuerpoAvisos").innerHTML = "";
    }
    document.getElementById("inicio").style.display="none";
    document.getElementById("login").style.display="block";
})



document.getElementById("resenyaCancelar").addEventListener("click",function(){
    document.getElementById("comentario").value="";
    document.getElementById("valoracion").value=5;
    document.getElementById("inicio").style.display="block";
    document.getElementById("resenya").style.display="none";
})

document.getElementById("resenyaGuardar").addEventListener("click", function(){

    var comentarioResenya = document.getElementById("comentario").value.trim();
    var valoracionResenya = parseInt(document.getElementById("valoracion").value);

    if (comentarioResenya == "" || isNaN(valoracionResenya)){
        alert("Rellena los campos vacíos");
        return;
    }
    
    if (valoracionResenya>5 || valoracionResenya<1){
        alert("Solo valores del 1 al 5")
        return;
    }

    crearResenya(resenyaActual, loginActual, valoracionResenya, comentarioResenya, function(idResenya){
        if(idResenya){
            alert(`Reseña creada correctamente para el recurso ${resenyaActualNombre}`);

            document.getElementById("comentario").value = "";
            document.getElementById("valoracion").value = 5;

            document.getElementById("inicio").style.display = "block";
            document.getElementById("resenya").style.display = "none";
            conexion.send(JSON.stringify({
                operacion: "nueva_resenya",
                categoria: datosResenya.categoria,
                modelo: datosResenya.modelo,
                codigo: datosResenya.codigo,
                puntuacion: valoracionResenya
            }));
            }
        else{
            alert("Error al crear reseña");
        }

        
    });

});

document.getElementById("inicioNuevaReserva").addEventListener("click",function(){
    document.getElementById("inicio").style.display="none";
    document.getElementById("nuevaReserva").style.display="block";
    cargarCategoriasNuevaReserva();
})

var selectCategoria = document.getElementById("nuevaReservaCategoria");
selectCategoria.addEventListener("change", function() {
    cargarModelosNuevaReserva(this.value);
});

var selectModelo = document.getElementById("nuevaReservaModelo");
selectModelo.addEventListener("change", function() {
    cargarRecursosNuevaReserva(this.value);
});

document.getElementById("nuevaReservaCancelar").addEventListener("click",function(){
    document.getElementById("nuevaReserva").style.display="none";
    document.getElementById("inicio").style.display="block";
    document.getElementById("nuevaReservaHoras").value=null;
})

}

    
function eventosWS() {
    conexion.addEventListener("message", function (msg) {
        console.log("Mensaje recibido del servidor:", msg.data);
        msg = JSON.parse(msg.data); // pasar cadena a objeto
        switch (msg.operacion) {
            case "nueva_resenya":
                var tbody = document.getElementById("cuerpoAvisos");

                var tr = document.createElement("tr");
                tr.style.backgroundColor = "green";
                tr.style.color = "white";

                var tdFecha = document.createElement("td");
                tdFecha.textContent = msg.fecha;

                var tdOrigen = document.createElement("td");
                tdOrigen.textContent = msg.origen;

                var tdTexto = document.createElement("td");
                tdTexto.textContent =
                    `SE HA CREADO UNA RESEÑA PARA ${msg.categoria} ` +
                    `MODELO ${msg.modelo} ` +
                    `CON CÓDIGO ${msg.codigo} ` +
                    `Y PUNTUACIÓN ${msg.puntuacion}`;

                tr.appendChild(tdFecha);
                tr.appendChild(tdOrigen);
                tr.appendChild(tdTexto);

                tbody.appendChild(tr);

                break;
            case "nueva_reserva":
                var tbody = document.getElementById("cuerpoAvisos");

                var tr = document.createElement("tr");
                tr.style.backgroundColor = "blue";
                tr.style.color = "white";

                var tdFecha = document.createElement("td");
                tdFecha.textContent = msg.fecha;

                var tdOrigen = document.createElement("td");
                tdOrigen.textContent = msg.origen;

                var tdTexto = document.createElement("td");
                tdTexto.textContent =
                    `SE HA CREADO UNA RESERVA PARA ${msg.categoria} ` +
                    `MODELO ${msg.modelo} ` +
                    `CON NÚMERO DE SERIE ${msg.numero_serie}`;

                tr.appendChild(tdFecha);
                tr.appendChild(tdOrigen);
                tr.appendChild(tdTexto);

                tbody.appendChild(tr);
                break;
            case "iniciarReserva":
                var tbody = document.getElementById("cuerpoAvisos");

                var tr = document.createElement("tr");
                tr.style.backgroundColor = "red";
                tr.style.color = "white";

                var tdFecha = document.createElement("td");
                tdFecha.textContent = msg.fecha;

                var tdOrigen = document.createElement("td");
                tdOrigen.textContent = msg.origen;

                var tdTexto = document.createElement("td");
                tdTexto.textContent =
                    `SE HA INICIADO UNA RESERVA PARA ${msg.categoria} ` +
                    `MODELO ${msg.modelo} ` +
                    `CON NÚMERO DE SERIE ${msg.numero_serie}`;

                tr.appendChild(tdFecha);
                tr.appendChild(tdOrigen);
                tr.appendChild(tdTexto);

                tbody.appendChild(tr);
                cargarReservasRealizadas();
                cargarReservasPendientes();
                break; 
            case "finalizarReserva":
                var tbody = document.getElementById("cuerpoAvisos");

                var tr = document.createElement("tr");
                tr.style.backgroundColor = "red";
                tr.style.color = "white";

                var tdFecha = document.createElement("td");
                tdFecha.textContent = msg.fecha;

                var tdOrigen = document.createElement("td");
                tdOrigen.textContent = msg.origen;

                var tdTexto = document.createElement("td");
                tdTexto.textContent =
                    `SE HA FINALIZADO UNA RESERVA PARA ${msg.categoria} ` +
                    `MODELO ${msg.modelo} ` +
                    `CON NÚMERO DE SERIE ${msg.numero_serie}`;

                tr.appendChild(tdFecha);
                tr.appendChild(tdOrigen);
                tr.appendChild(tdTexto);

                tbody.appendChild(tr);
                cargarReservasRealizadas();
                cargarReservasPendientes();
                break; 
                
        }
            
    });
}


var nfcProcesando = false;
var nfcEscribiendo = false;
var ultimoCodigoNFC = "";
var ultimoTiempoNFC = 0;
var codigoPendienteEscritura = "";

// Esperar a que Cordova este preparado
document.addEventListener("deviceready", iniciarNFC, false);

function iniciarNFC() {
    if (
        typeof nfc === "undefined" ||
        typeof ndef === "undefined"
    ) {
        console.error("El plugin NFC no esta disponible.");
        mostrarEstadoNFC("NFC no disponible.");
        return;
    }

    console.log("Plugin NFC preparado.");

    // BOTON PARA SOLICITAR LA ESCRITURA
    var botonEscribir = document.getElementById("escribirNFC");

    if (botonEscribir) {
        botonEscribir.addEventListener("click", function () {
            var campoCodigo = document.getElementById("codigoRecursoNFC");
            var codigo = campoCodigo.value.trim();
            if (codigo=="") {
                alert("Introduce el codigo.");
                return;
            }

            codigoPendienteEscritura=codigo;
            nfcEscribiendo=true;

            mostrarEstadoNFC(
                "Acerca la etiqueta NFC al movil para escribir el codigo"
            );
        });
    }

    nfc.addNdefListener(
        function (evento) {
            var tag = evento.tag;

            if (
                nfcEscribiendo &&
                codigoPendienteEscritura !== ""
            ) {
                var codigoAEscribir = codigoPendienteEscritura;

                nfc.write(
                    [ndef.textRecord(codigoAEscribir)],
                    function () {
                        console.log(
                            "Codigo escrito en NFC:",
                            codigoAEscribir
                        );

                        mostrarEstadoNFC(
                            "Codigo escrito correctamente: " +
                            codigoAEscribir
                        );

                        codigoPendienteEscritura = "";

                        setTimeout(function () {
                            nfcEscribiendo = false;
                        }, 1500);

                        alert("Codigo escrito correctamente.");
                    },
                    function (error) {
                        console.error(
                            "Error al escribir NFC:",
                            error
                        );

                        mostrarEstadoNFC(
                            "Error al escribir en la etiqueta NFC."
                        );

                        codigoPendienteEscritura = "";
                        nfcEscribiendo = false;

                        alert(
                            "No se ha podido escribir en la etiqueta NFC."
                        );
                    }
                );

                return;
            }
            if (nfcEscribiendo) {
                return;
            }

            if (
                !tag.ndefMessage ||
                tag.ndefMessage.length === 0
            ) {
                console.log("Etiqueta sin contenido NDEF.");
                return;
            }

            var payload = tag.ndefMessage[0].payload;

            var longitudIdioma = payload[0] & 0x3F;

            var codigoLeido = nfc.bytesToString(
                payload.slice(1 + longitudIdioma)
            ).trim();
            if (codigoLeido=== "") {
                console.log("La etiqueta no contiene un codigo valido.");
                return;
            }
            console.log("Codigo NFC leido:", codigoLeido);
            procesarCodigoNFC(codigoLeido);
        },
        function () {
            console.log("Lector NFC activado correctamente.");
        },
        function (error) {
            console.error(
                "Error al activar el lector NFC:",
                error
            );

            mostrarEstadoNFC(
                "Error al activar el lector NFC."
            );
        }
    );
}


// Actualizar el mensaje del formulario
function mostrarEstadoNFC(texto) {
    var elemento = document.getElementById("estadoNFC");

    if (elemento) {
        elemento.textContent = texto;
    }
}

function buscarRecursoPorCodigo(codigo, callback) {

    obtenerModelos(function (modelos) {
        var indice = 0;
        function buscarSiguienteModelo() {
            if (!modelos||indice>= modelos.length) {
                callback(null);
                return;
            }
            var modelo = modelos[indice++];
            obtenerRecursos(modelo.id, function (recursos) {
                recursos = recursos || [];
                for (var i=0; i<recursos.length; i++) {
                    if (
                        String(recursos[i].numero_serie).trim() ===
                        String(codigo).trim()
                    ) {
                        callback({
                            recurso: recursos[i],
                            modelo: modelo
                        });
                        return;
                    }
                }
                buscarSiguienteModelo();
            });
        }
        buscarSiguienteModelo();
    });
}



function notificarCambioNFC(operacion, modelo, recurso) {
    if (
        !conexion ||
        conexion.readyState !== WebSocket.OPEN
    ) {
        console.log("WebSocket no conectado; no se envia el aviso.");
        return;
    }
    obtenerCategorias(function (categorias) {
        var categoria = null;
        for (var i = 0; i < categorias.length; i++) {
            if (String(categorias[i].id) === String(modelo.categoria)) {
                categoria = categorias[i];
                break;
            }
        }
        conexion.send(JSON.stringify({
            operacion: operacion,
            modelo: modelo.nombre,
            numero_serie: recurso.numero_serie,
            categoria: categoria ? categoria.nombre : ""
        }));
    });
}

function procesarCodigoNFC(codigo) {
    console.log("NFC: procesando codigo:", codigo);
    if (!loginActual) {
        mostrarEstadoNFC("Inicia sesion antes de utilizar NFC.");
        return;
    }
    var ahora = Date.now();
    if (
        nfcProcesando ||
        (
            codigo === ultimoCodigoNFC &&
            ahora - ultimoTiempoNFC < 2500
        )
    ) {
        return;
    }

    nfcProcesando = true;
    ultimoCodigoNFC = codigo;
    ultimoTiempoNFC = ahora;

    mostrarEstadoNFC("Buscando recurso " + codigo);
    buscarRecursoPorCodigo(codigo, function(datos) {
        if (!datos) {
            mostrarEstadoNFC("No existe el recurso " + codigo + ".");
            nfcProcesando = false;
            return;
        }
        var recurso = datos.recurso;
        var modelo = datos.modelo;
        obtenerReservas(loginActual, function(reservas) {
            reservas = reservas || [];
            var activa = reservas.find(function(r) {
                return String(r.recurso) === String(recurso.id) &&
                    r.fecha_inicio != null &&
                    r.fecha_fin == null;
            });
            if (activa) {
                finalizarReserva(activa.id, function(resultado) {
                    if (!resultado) {
                        mostrarEstadoNFC("No se pudo devolver el recurso.");
                        nfcProcesando = false;
                        return;
                    }
                    mostrarEstadoNFC("Recurso devuelto: " + codigo);
                    cargarReservasPendientes();
                    cargarReservasRealizadas();
                    notificarCambioNFC("finalizarReserva", modelo, recurso);
                    nfcProcesando = false;
                });
                return;
            }
            var pendiente = reservas.find(function(r) {
                return String(r.recurso) === String(recurso.id) &&
                    r.fecha_inicio == null &&
                    r.fecha_fin == null;
            });
            tiempoPendiente(recurso.id, function(horasPendientes) {
                console.log("Horas pendientes del recurso:", horasPendientes);
                if (horasPendientes !== 0) {
                    if (pendiente) {
                        mostrarEstadoNFC(
                            "El recurso está ocupado. Tu reserva sigue pendiente."
                        );
                        nfcProcesando = false;
                        return;
                    }
                    reservarRecurso(recurso.id, loginActual, 1, function(idReserva) {
                        if (!idReserva) {
                            mostrarEstadoNFC("No se pudo crear la reserva pendiente.");
                            nfcProcesando = false;
                            return;
                        }
                        mostrarEstadoNFC(
                            "Recurso ocupado: reserva pendiente creada."
                        );
                        cargarReservasPendientes();
                        cargarReservasRealizadas();
                        notificarCambioNFC("nueva_reserva", modelo, recurso);
                        nfcProcesando = false;
                    });
                    return;
                }
                if (pendiente) {
                    iniciarReserva(pendiente.id, function(resultado) {
                        if (!resultado) {
                            mostrarEstadoNFC("No se pudo retirar el recurso.");
                            nfcProcesando = false;
                            return;
                        }
                        mostrarEstadoNFC("Recurso retirado: " + codigo);
                        cargarReservasPendientes();
                        cargarReservasRealizadas();
                        notificarCambioNFC("iniciarReserva", modelo, recurso);
                        nfcProcesando = false;
                    });
                    return;
                }
                reservarRecurso(recurso.id, loginActual, 1, function(idReserva) {
                    if (!idReserva) {
                        mostrarEstadoNFC("No se pudo crear la reserva.");
                        nfcProcesando = false;
                        return;
                    }
                    iniciarReserva(idReserva, function(resultado) {
                        if (!resultado) {
                            mostrarEstadoNFC(
                                "Reserva creada, pero no se pudo retirar el recurso."
                            );
                            cargarReservasPendientes();
                            nfcProcesando = false;
                            return;
                        }
                        mostrarEstadoNFC(
                            "Reserva creada y recurso retirado: " + codigo
                        );
                        cargarReservasPendientes();
                        cargarReservasRealizadas();
                        notificarCambioNFC("iniciarReserva", modelo, recurso);
                        nfcProcesando = false;
                    });
                });
            });
        });
    });
}

