document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("miBoton").addEventListener("click", () => {
    if (conexion) {
        conexion.close();
        conexion = null;
        document.getElementById("cuerpoAvisos").innerHTML = "";
    }
  });
});

var anterior="A"
var recursoActivoId = null;
var usuarioActivoId= null;
var tokenActual= null;

var conexion=null;



function cargarFiltros() {
    // Categorías
    rest.get(`/api/categorias?token=${tokenActual}`, function(estado,respuesta) {
        if (estado==200){
            let select = document.getElementById("filtroCategoria");
            select.innerHTML= '<option value="">Todos</option>';
            for (let i=0;i<respuesta.length;i++){
                let opt = document.createElement("option");
                opt.value = respuesta[i].id;
                opt.textContent = respuesta[i].nombre;
                select.appendChild(opt);
            }
        }
    });

    // Modelos
    rest.get(`/api/modelos?token=${tokenActual}`, function(estado, respuesta) {
        if (estado==200){
            let select= document.getElementById("filtroModelo");
            select.innerHTML = '<option value="">Todos</option>';
            for (let i=0;i<respuesta.length;i++){
                let opt=document.createElement("option");
                opt.value=respuesta[i].id;
                opt.textContent=respuesta[i].nombre;
                select.appendChild(opt);
            }
        }
    });

    // Ubicaciones
    rest.get(`/api/ubicaciones?token=${tokenActual}`, function(estado,respuesta) {
        if (estado==200){
            let select=document.getElementById("filtroUbicacion");
            select.innerHTML='<option value="">Todos</option>';
            for (let i=0;i<respuesta.length;i++){
                let opt=document.createElement("option");
                opt.value=respuesta[i].id;
                opt.textContent=respuesta[i].nombre;
                select.appendChild(opt);
            }
        }
    });
}

function cargarTablaRecursos() {
    let categoria = document.getElementById("filtroCategoria").value;
    let modelo = document.getElementById("filtroModelo").value;
    let ubicacion = document.getElementById("filtroUbicacion").value;
    let estado = document.getElementById("filtroEstado").value;

    let url = `/api/recursos?`;
    if (categoria) url += `categoria=${categoria}&`;
    if (modelo) url += `modelo=${modelo}&`;
    if (ubicacion) url += `ubicacion=${ubicacion}&`;
    if (estado !== "") url += `estado=${estado}&`;
    url += `token=${tokenActual}`;

    rest.get(url, function(estadoReq, recursos) {
        if (estadoReq==200) {
            let tabla=document.getElementById("tablaRecursos");
            tabla.innerHTML= `
                <tr>
                    <th>N. Serie</th>
                    <th>Categoría</th>
                    <th>Modelo</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            `;

            for (let i=0;i<recursos.length; i++) {
                let r=recursos[i];

                // Obtener modelo y categoría
                rest.get(`/api/modelos?token=${tokenActual}`, function(eMod, modelos) {
                    let modeloR="-";
                    let categoriaR= "-";
                    for (let j=0; j<modelos.length; j++) {
                        if (modelos[j].id==r.modelo) {
                            modeloR=modelos[j].nombre;
                            categoriaR=modelos[j].categoria;
                            break;
                        }
                    }

                    // Obtener nombre de categoría
                    rest.get(`/api/categorias?token=${tokenActual}`, function(eCat, categorias) {
                        let catNombre= "-";
                        for (let k = 0; k < categorias.length; k++) {
                            if (categorias[k].id==categoriaR) {
                                catNombre=categorias[k].nombre;
                                break;
                            }
                        }

                        // Obtener ubicación
                        rest.get(`/api/ubicaciones?token=${tokenActual}`, function(eUbi, ubicaciones) {
                            let ubicNombre = "-";
                            for (let l = 0; l < ubicaciones.length; l++) {
                                if (ubicaciones[l].id==r.ubicacion) {
                                    ubicNombre = ubicaciones[l].nombre;
                                    break;
                                }
                            }

                            let fila = document.createElement("tr");
                            fila.innerHTML = `
                                <td>${r.numero_serie}</td>
                                <td>${catNombre}</td>
                                <td>${modeloR}</td>
                                <td>${ubicNombre}</td>
                                <td>${r.estado==0?"Operativo":"No operativo"}</td>
                                <td>
                                    <button id="ficha${r.id}">Abrir</button>
                                    <button id="borrar${r.id}">X</button>
                                    
                                </td>
                            `;
                            tabla.appendChild(fila);

                            document.getElementById(`borrar${r.id}`).addEventListener("click", function() {
                                if (!confirm("¿Seguro que quieres borrar este recurso?")) return;
                                rest.delete(`/api/recursos/${r.id}?token=${tokenActual}`, function(estadoDel, resp) {
                                    if (estadoDel == 200) {
                                        alert("Recurso eliminado");
                                        cargarTablaRecursos(); // recarga la tabla
                                    } else {
                                        alert("Error al eliminar recurso");
                                    }
                                });
                            });

                            document.getElementById(`ficha${r.id}`).addEventListener("click", function() {
                                recursoActivoId=r.id;
                                document.getElementById("inicio").style.display="none";
                                document.getElementById("ficha").style.display="block";
                                cargarFichaRecurso();

                            });

                        });
                    });
                });
            }
        }
    });
}





// APARTADO A
document.getElementById("botonRegistro").addEventListener("click",function(){
    anterior="A"
    document.getElementById("usuario").value="";
    document.getElementById("password").value="";

    document.getElementById("acceso").style.display="none";
    document.getElementById("registro").style.display="block"
    
})

document.getElementById("botonLogin").addEventListener("click",function(){
    anterior="A"
    var usuario= document.getElementById("usuario").value;
    var password= document.getElementById("password").value;
    
    if (usuario==""||password==""){
        alert("Introduce usuario y contrasenya");
        return;
    }

    rest.post("/api/gestores/login",{login: usuario, password: password},function(estado, respuesta){
        if (estado==403){
            alert("Error/Datos incorrectos")
        }
        else if(estado==201){
            var usuario_activo=respuesta.id;
            tokenActual=respuesta.token;
            rest.get(`/api/gestores/${usuario_activo}?token=${tokenActual}`,function(estado,respuesta){
                if (estado==404){
                    alert ("Error con el id")
                }
                else if (estado==200){
                    usuarioActivoId = respuesta.id;
                    document.getElementById("usuario_activo").textContent= "Bienvenido "+respuesta.nombre+" "+ respuesta.apellidos;
                    document.getElementById("usuario").value="";
                    document.getElementById("password").value="";
                    document.getElementById("acceso").style.display="none";
                    document.getElementById("inicio").style.display="block";
                    cargarFiltros();
                    conexion = new WebSocket("ws://localhost:4444", "rpc");
                    conexion.addEventListener("open", function () {
                        console.log("Conectado");
                        conexion.send(JSON.stringify({
                            operacion: "identificar",
                            id: usuarioActivoId,
                            tipo: "gestor",
                            nombre: respuesta.nombre + " " + respuesta.apellidos
                        }));
                        eventosWS();
                    });

                }
            
            
            
            })
            
        }

    })
})

//APARTADO B
document.getElementById("botonVolverLogin").addEventListener("click", function() {
    // Limpiar formulario
    document.getElementById("usuarioRegistro").value= "";
    document.getElementById("passwordRegistro").value= "";
    document.getElementById("nombreRegistro").value= "";
    document.getElementById("apellidosRegistro").value= "";

    document.getElementById("registro").style.display="none";

    if (anterior=="inicio") {
        document.getElementById("inicio").style.display= "block";
    } else {
        document.getElementById("acceso").style.display= "block";
    }
});


document.getElementById("botonRegistrar").addEventListener("click", function() {
    var nombre = document.getElementById("nombreRegistro").value;
    var apellidos = document.getElementById("apellidosRegistro").value;
    var usuario = document.getElementById("usuarioRegistro").value;
    var password = document.getElementById("passwordRegistro").value;

    if (!nombre || !apellidos || !usuario || !password) {
        alert("Completa todos los campos");
        return;
    }

    if (usuarioActivoId) {
        // Editar usuario existente
        rest.put(`/api/gestores/${usuarioActivoId}?token=${tokenActual}`, {
            nombre: nombre,
            apellidos: apellidos,
            usuario: usuario,
            password: password}, function(estado, respuesta) {
            if (estado==200) {
                alert("Datos actualizados");
                document.getElementById("registro").style.display="none";
                document.getElementById("inicio").style.display="block";
                document.getElementById("usuario_activo").textContent="Bienvenido " + respuesta.nombre + " " + respuesta.apellidos;        
                cargarFiltros();
                
            } else {
                alert("Error al actualizar datos");
            }
        });
    } else {
        // Registro normal
        rest.post(`/api/gestores?token=${tokenActual}`, {
            nombre: nombre,
            apellidos: apellidos,
            usuario: usuario,
            password: password
        }, function(estado, respuesta) {
            if (estado == 403) {
                alert("El usuario ya existe");
            } 
            else if (estado == 201) {
                alert("Registro completado");
                document.getElementById("registro").style.display = "none";
                document.getElementById("acceso").style.display = "block";
            } 
            else {
                alert("Error inesperado: " + estado);
            }
        });
    }
});



//APARTADO C
document.getElementById("buscarRecursos").addEventListener("click", cargarTablaRecursos);

document.getElementById("editarDatos").addEventListener("click", function() {
    if (!usuarioActivoId) {
        alert("No hay usuario activo");
        return;
    }

    anterior = "inicio"; // Para volver a inicio
    document.getElementById("inicio").style.display="none";
    document.getElementById("registro").style.display="block";

    // Cargar datos del usuario activo
    rest.get(`/api/gestores/${usuarioActivoId}?token=${tokenActual}`, function(estado, respuesta) {
        if (estado == 200) {
            document.getElementById("nombreRegistro").value=respuesta.nombre;
            document.getElementById("apellidosRegistro").value=respuesta.apellidos;
            document.getElementById("usuarioRegistro").value=respuesta.usuario;
            document.getElementById("passwordRegistro").value="";
        } else {
            alert("Error cargando datos del usuario");
        }
    });
});
document.getElementById("salir").addEventListener("click", function() {
    // Limpiar formulario de login
    document.getElementById("usuario").value="";
    document.getElementById("password").value="";

    document.getElementById("inicio").style.display="none";
    document.getElementById("acceso").style.display="block";

    // Limpiar usuario activo
    document.getElementById("usuario_activo").textContent="";
    usuarioActivoId=null;

    // Reiniciar tabla 
    document.getElementById("tablaRecursos").innerHTML=`
        <tr>
            <th>N. Serie</th>
            <th>Categoría</th>
            <th>Modelo</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Acciones</th>
        </tr>
    `;
    if (conexion) {
        conexion.close();
        conexion = null;
        document.getElementById("cuerpoAvisos").innerHTML = "";
    }
});

function cargarFichaRecurso() {

    if (!recursoActivoId) return;

    rest.get(`/api/recursos/${recursoActivoId}?token=${tokenActual}`, function(estado, recurso) {

        if (estado==200) {

            let div = document.getElementById("ficha");

            div.innerHTML = `
                <h2>Recurso ${recurso.numero_serie}</h2>

                <h3>Datos recurso</h3>

                <label>Categoría:</label>
                <select id="fCategoria"></select><br>

                <label>Modelo:</label>
                <select id="fModelo"></select><br>

                <label>Nº Serie:</label>
                <input type="text" id="fNumero" value="${recurso.numero_serie}"><br>

                <label>Ubicación:</label>
                <select id="fUbicacion"></select><br>

                <label>Estado:</label>
                <select id="fEstado">
                    <option value="0" ${recurso.estado==0?"selected":""}>Operativo</option>
                    <option value="1" ${recurso.estado==1?"selected":""}>No operativo</option>
                </select><br><br>

                <button id="guardarRecurso">Guardar</button>
                <button id="volverInicio">Volver</button>

                <h3>Reseñas</h3>
                <table id="tablaResenyas">
                    <tr>
                        <th>Usuario</th>
                        <th>Comentario</th>
                    </tr>
                </table>

                <h3>Reservas</h3>
                <table id="tablaReservas">
                    <tr>
                        <th>Usuario</th>
                        <th>Fecha inicio</th>
                        <th>Fecha fin</th>
                    </tr>
                </table>
            `;
            cargarModelos(recurso.modelo);
            cargarUbicaciones(recurso.ubicacion);
            cargarCategorias(recurso.categoria);
            cargarReservas();
            cargarResenyas();

            document.getElementById("volverInicio").addEventListener("click", function() {
                document.getElementById("ficha").style.display = "none";
                document.getElementById("inicio").style.display = "block";
            });

            document.getElementById("guardarRecurso").addEventListener("click", function() {

                let numero = document.getElementById("fNumero").value;
                let modelo = document.getElementById("fModelo").value;
                let ubicacion = document.getElementById("fUbicacion").value;
                let estadoNuevo = document.getElementById("fEstado").value;
                let categoria = document.getElementById("fCategoria").value;

                rest.put(`/api/recursos/${recursoActivoId}?token=${tokenActual}`, {
                    numero_serie: numero,
                    modelo: modelo,
                    ubicacion: ubicacion,
                    categoria: categoria,
                    estado: estadoNuevo
                }, function(est, resp) {
                    if (est==200) {
                        alert("Recurso actualizado");
                        cargarTablaRecursos();
                    } else {
                        alert("Error actualizando recurso");
                    }
                });

            });

        } else {
            alert("Error cargando recurso");
        }

    });

}

function cargarModelos(modeloActual) {

    rest.get(`/api/modelos?token=${tokenActual}`, function(estado, modelos) {

        if (estado==200) {

            let select=document.getElementById("fModelo");
            select.innerHTML= "";

            for (let i=0; i<modelos.length; i++) {

                let option= document.createElement("option");
                option.value= modelos[i].id;
                option.textContent= modelos[i].nombre;

                if (modelos[i].id==modeloActual) {
                    option.selected=true;
                }

                select.appendChild(option);
            }
        }

    });

}

function cargarUbicaciones(ubicacionActual) {

    rest.get(`/api/ubicaciones?token=${tokenActual}`, function(estado, ubicaciones) {

        if (estado==200) {

            let select= document.getElementById("fUbicacion");
            select.innerHTML= "";

            for (let i=0; i<ubicaciones.length; i++) {

                let option=document.createElement("option");
                option.value=ubicaciones[i].id;
                option.textContent=ubicaciones[i].nombre;

                if (ubicaciones[i].id==ubicacionActual) {
                    option.selected=true;
                }

                select.appendChild(option);
            }
        }

    });

}

function cargarCategorias(categoriaActual) {

    rest.get(`/api/categorias?token=${tokenActual}`, function(estado, categorias) {

        if (estado==200) {

            let select=document.getElementById("fCategoria");
            select.innerHTML= "";

            for (let i=0; i<categorias.length; i++) {

                let option=document.createElement("option");
                option.value=categorias[i].id;
                option.textContent=categorias[i].nombre;

                if (categorias[i].id==categoriaActual) {
                    option.selected=true;
                }

                select.appendChild(option);
            }
        }

    });

}
function cargarResenyas() {

    rest.get(`/api/recursos/${recursoActivoId}/resenyas?token=${tokenActual}`, function(estado, resenyas) {

        if (estado==200) {

            let tabla=document.getElementById("tablaResenyas");
            tabla.innerHTML = `
                <tr>
                    <th>Sanitario</th>
                    <th>Comentario</th>
                    <th>Valoración</th>
                    <th>Fecha</th>
                </tr>
            `;

            for (let i=0; i<resenyas.length; i++) {

                let fila = document.createElement("tr");

                // Formatear fecha 
                let fecha = new Date(resenyas[i].fecha);
                let fechaStr = fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString();
                fila.innerHTML = `
                    <td>${resenyas[i].nombre_sanitario}</td>
                    <td>${resenyas[i].descripcion}</td>
                    <td>${resenyas[i].valor}</td>
                    <td>${fechaStr}</td>
                `;

                tabla.appendChild(fila);
            }
        }

    });
}

function cargarReservas() {

    rest.get(`/api/recursos/${recursoActivoId}/reservas?token=${tokenActual}`, function(estado, reservas) {

        if (estado==200) {

            let tabla = document.getElementById("tablaReservas");
            tabla.innerHTML = `
                <tr>
                    <th>Sanitario</th>
                    <th>Fecha petición</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Horas estimadas</th>
                </tr>
            `;

            const ahora = new Date();

            for (let i=0;i<reservas.length; i++) {

                let fila=document.createElement("tr");

                let fechaPeticion=new Date(reservas[i].fecha_peticion);
                let fechaInicio=reservas[i].fecha_inicio ? new Date(reservas[i].fecha_inicio) : null;
                let fechaFin=reservas[i].fecha_fin ? new Date(reservas[i].fecha_fin) : null;
                let horasEstimadas=reservas[i].horas_estimadas;

               
                let color = "#ffffff"; // blanco 
                if (!fechaInicio) {
                    color = "#b3ffb3"; // verde pastel, pendiente
                } else if (fechaFin && fechaFin < ahora) {
                    color = "#ffffff"; // blanco, finalizada
                } else if (fechaInicio && (!fechaFin || fechaFin > ahora)) {
                    const finEstimado = new Date(fechaInicio.getTime() + horasEstimadas * 60 * 60 * 1000);
                    if (ahora > finEstimado) {
                        color = "#ffb3b3"; // rojo pastel, sobrepasado
                    } else {
                        color = "#b3d9ff"; // azul pastel, en uso
                    }
                }

                fila.style.backgroundColor = color;

                fila.innerHTML = `
                    <td>${reservas[i].nombre_sanitario}</td>
                    <td>${fechaPeticion.toLocaleDateString()} ${fechaPeticion.toLocaleTimeString()}</td>
                    <td>${fechaInicio ? fechaInicio.toLocaleDateString() + " " + fechaInicio.toLocaleTimeString() : "-"}</td>
                    <td>${fechaFin ? fechaFin.toLocaleDateString() + " " + fechaFin.toLocaleTimeString() : "-"}</td>
                    <td>${horasEstimadas}</td>
                `;

                tabla.appendChild(fila);
            }
        }

    });
}

document.getElementById("anadirRecurso").addEventListener("click", function() {
    recursoActivoId = null; 
    document.getElementById("inicio").style.display = "none";
    document.getElementById("ficha").style.display = "block";
    let div = document.getElementById("ficha");
    div.innerHTML = `
        <h2>Nuevo Recurso</h2>

        <h3>Datos recurso</h3>

        <label>Categoría:</label>
        <select id="fCategoria"></select><br>

        <label>Modelo:</label>
        <select id="fModelo"></select><br>

        <label>Nº Serie:</label>
        <input type="text" id="fNumero" value=""><br>

        <label>Ubicación:</label>
        <select id="fUbicacion"></select><br>

        <label>Estado:</label>
        <select id="fEstado">
            <option value="0">Operativo</option>
            <option value="1">No operativo</option>
        </select><br><br>

        <button id="guardarRecurso">Guardar</button>
        <button id="volverInicio">Volver</button>
    `;

    document.getElementById("volverInicio").addEventListener("click", function() {
        document.getElementById("ficha").style.display = "none";
        document.getElementById("inicio").style.display = "block";
    });

    cargarCategorias(null);
    cargarModelos(null);
    cargarUbicaciones(null);

    document.getElementById("guardarRecurso").addEventListener("click", function() {
        let numero = document.getElementById("fNumero").value.trim();
        let modelo = parseInt(document.getElementById("fModelo").value);
        let ubicacion = parseInt(document.getElementById("fUbicacion").value);
        let estadoNuevo = parseInt(document.getElementById("fEstado").value);
        let categoria = parseInt(document.getElementById("fCategoria").value);

        if (!numero || !modelo || !ubicacion || !categoria) {
            alert("Completa todos los campos");
            return;
        }

        rest.post(`/api/recursos?token=${tokenActual}`, {
            numero_serie: numero,
            modelo: modelo,
            ubicacion: ubicacion,
            categoria: categoria,
            estado: estadoNuevo
        }, function(estado, resp) {
            if (estado==201) {
                alert("Recurso creado");
                document.getElementById("ficha").style.display = "none";
                document.getElementById("inicio").style.display = "block";
                cargarTablaRecursos();
                rest.get(`/api/modelos?token=${tokenActual}`, function(estado,respuesta){
                    if (estado==200){
                        for (let i=0;i<respuesta.length;i++){
                            if (respuesta[i].id==modelo){
                                modelows=respuesta[i].nombre;
                                break;
                            }
                        }
                        rest.get(`/api/categorias?token=${tokenActual}`, function(estado,respuesta){
                            if (estado==200){
                                for (let j=0;j<respuesta.length;j++){
                                    if (respuesta[j].id==categoria){
                                        categoriaws=respuesta[j].nombre;
                                        break;
                                    }
                                }
                                conexion.send(JSON.stringify({
                                    operacion: "nueva_reserva",
                                    categoria: categoriaws,
                                    modelo: modelows,
                                    numero_serie: numero,
                                }));
                            }
                        });
                    }
                });

            } 
            else if (estado==403) {
                alert("El número de serie ya existe");
            } 
            else {
                alert("Error al crear recurso: " + estado);
            }
        });
    });
});

//Telemedicina

document.getElementById("Eministerio").addEventListener("click", function() {

    let id_area = 1; 

    // Fecha de envío en formato YYYY-MM-DD
    let ahora = new Date();
    let fecha = ahora.getFullYear() + "-" +
        String(ahora.getMonth() + 1).padStart(2, "0") + "-" +
        String(ahora.getDate()).padStart(2, "0");

    // Obtener todos los recursos
    rest.get(`/api/recursos?token=${tokenActual}`, function(estado, recursos) {

        if (estado != 200) {
            alert("Error al obtener los recursos");
            return;
        }

        let datos = [];
        let pendientes = recursos.length;

        // Si no hay recursos, enviar un array vacío
        if (pendientes == 0) {
            enviarDatosMinisterio(id_area, fecha, datos);
            return;
        }

        // Recorrer todos los recursos
        for (let i = 0; i < recursos.length; i++) {

            let recurso = recursos[i];

            // Obtener modelo y categoría del recurso
            rest.get(`/api/modelos?token=${tokenActual}`, function(estadoMod, modelos) {

                if (estadoMod != 200) {
                    alert("Error al obtener los modelos");
                    return;
                }

                let modelo = null;

                for (let j = 0; j < modelos.length; j++) {
                    if (modelos[j].id == recurso.modelo) {
                        modelo = modelos[j];
                        break;
                    }
                }

                if (!modelo) {
                    pendientes--;
                    if (pendientes == 0) {
                        enviarDatosMinisterio(id_area, fecha, datos);
                    }
                    return;
                }

                rest.get(`/api/categorias?token=${tokenActual}`, function(estadoCat, categorias) {

                    if (estadoCat != 200) {
                        alert("Error al obtener las categorías");
                        return;
                    }

                    let categoriaNombre = "";

                    for (let k = 0; k < categorias.length; k++) {
                        if (categorias[k].id == modelo.categoria) {
                            categoriaNombre = categorias[k].nombre;
                            break;
                        }
                    }

                    // Obtener reservas del recurso
                    rest.get("/api/recursos/" + recurso.id + "/reservas" + `?token=${tokenActual}`,
                        function(estadoRes, reservas) {

                            if (estadoRes != 200) {
                                alert("Error al obtener las reservas");
                                return;
                            }

                            for (let j = 0; j < reservas.length; j++) {

                                let r = reservas[j];

                                // Separar nombre y apellidos
                                let partes = r.nombre_sanitario.split(" ");
                                let nombre = partes.shift();
                                let apellidos = partes.join(" ");

                                datos.push({
                                    nombre: nombre,
                                    apellidos: apellidos,
                                    categoria: categoriaNombre,
                                    horas_estimadas: r.horas_estimadas,
                                    fec_pet: r.fecha_peticion,
                                    fec_ini: r.fecha_inicio,
                                    fecha_fin: r.fecha_fin
                                });
                            }

                            pendientes--;

                            if (pendientes == 0) {
                                enviarDatosMinisterio(id_area, fecha, datos);
                            }
                        }
                    );
                });
            });
        }
    });
});




// Enviar los datos al Ministerio
function enviarDatosMinisterio(id_area, fecha, datos) {

    let cuerpo = {
        id_area: id_area,
        fecha: fecha,
        datos: datos
    };

    console.log("Datos que se van a enviar:", cuerpo);

    rest.post(
        "https://undefined.ua.es/telemedicina/api/datos",
        cuerpo,
        function(estado, respuesta) {

            console.log("Respuesta del Ministerio:", estado, respuesta);

            if (estado == 200 || estado == 201) {
                alert("Datos enviados correctamente. Reservas enviadas: " + datos.length);
            } else {
                alert("Error al enviar los datos. Código: " + estado);
            }
        }
    );
}


function cargarRankingMinisterio() {
    console.log("Iniciando carga del ranking...");

    rest.get(
        "https://undefined.ua.es/telemedicina/api/datos",
        function(estado, respuesta) {
            console.log("Estado de la petición:", estado);
            console.log("Respuesta recibida:", respuesta);

            if (estado != 200) {
                console.error("Error al obtener los datos del Ministerio");
                return;
            }

            if (!Array.isArray(respuesta)) {
                console.error("La respuesta no es un array:", respuesta);
                return;
            }

            let areas = {};

            respuesta.forEach(function(registro) {
                let idArea = registro.id_area;

                if (idArea === undefined || idArea === null) {
                    return;
                }

                if (areas[idArea] === undefined) {
                    areas[idArea] = 0;
                }

                if (Array.isArray(registro.datos)) {
                    areas[idArea] += registro.datos.length;
                }
            });

            let ranking = Object.keys(areas).map(function(id) {
                return {
                    id_area: Number(id),
                    reservas: areas[id]
                };
            });

            ranking.sort(function(a, b) {
                return b.reservas - a.reservas;
            });

            let cuerpo = document.getElementById("cuerpoRanking");

            if (!cuerpo) {
                console.error("No se encuentra el elemento #cuerpoRanking");
                return;
            }

            cuerpo.innerHTML = "";

            ranking.forEach(function(area, i) {
                let fila = document.createElement("tr");

                let posicion = document.createElement("td");
                posicion.textContent = i + 1;

                let nombre = document.createElement("td");
                nombre.textContent = obtenerNombreArea(area.id_area);

                let reservas = document.createElement("td");
                reservas.textContent = area.reservas;

                fila.appendChild(posicion);
                fila.appendChild(nombre);
                fila.appendChild(reservas);
                cuerpo.appendChild(fila);
            });

            console.log("Ranking cargado correctamente.");
        }
    );
}
document.getElementById("botonRanking").addEventListener("click", function() {
    cargarRankingMinisterio();
});

function obtenerNombreArea(id) {
    let nombres = {
        1: "Alergología",
        2: "Anestesiología",
        3: "Cardiología",
        4: "Cirugía General",
        5: "Dermatología",
        6: "Aparato Digestivo",
        7: "Endocrinología",
        8: "Ginecología",
        9: "Hematología",
        10: "Medicina Interna",
        11: "Neumología",
        12: "Neurología",
        13: "Oftalmología",
        14: "Oncología",
        15: "Pediatría",
        16: "Psiquiatría",
        17: "Traumatología",
        18: "Urología"
    };

    return nombres[id] || "Área " + id;
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
                break; 
                
        }
            
    });
}
