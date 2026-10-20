// Crear un servidor HTTP
var http = require("http");
var httpServer = http.createServer();

// Crear servidor WS
// Necesita tener instalado el módulo websocket:
// npm install websocket
var WebSocketServer = require("websocket").server; // instalar previamente: npm install websocket
var wsServer = new WebSocketServer({
	httpServer: httpServer
});


// Iniciar el servidor HTTP en un puerto
var puerto = 4444;
httpServer.listen(puerto, function () {
	console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});

var clientes = []; // array de los clientes que se conectan

wsServer.on("request", function (request) {

    var connection = request.accept("rpc", request.origin);

    var cliente = {
    connection: connection,
    id: null,
    tipo: null,
    nombre: null
    };

    clientes.push(cliente);

    console.log("Cliente conectado. Total:", clientes.length);

    connection.on("message", function (message) {

        if (message.type === "utf8") {

            var msg = JSON.parse(message.utf8Data);

            switch (msg.operacion) {
                case "identificar":
                    cliente.tipo = msg.tipo;
                    cliente.id = msg.id;
                    cliente.nombre = msg.nombre;
                    console.log("Cliente identificado como:", cliente.nombre, "Tipo:", cliente.tipo);
                    break;         
                case "nueva_resenya":
                    if (cliente.tipo !== "sanitario") return;
                    var fecha = new Date().toLocaleString();
                    for (var i = 0; i < clientes.length; i++) {
                        if (clientes[i].tipo == "gestor") {
                            clientes[i].connection.sendUTF(JSON.stringify({
                                operacion: "nueva_resenya",
                                fecha: fecha,
                                origen: cliente.nombre,
                                categoria: msg.categoria,
                                modelo: msg.modelo,
                                codigo: msg.codigo,
                                puntuacion: msg.puntuacion
                            }));

                        }
                    }
                    break;
                case "nueva_reserva":
                    if (cliente.tipo !== "gestor") return;
                    var fecha = new Date().toLocaleString();
                    for (var i=0; i<clientes.length; i++) {
                        if (clientes[i].tipo == "sanitario") {
                            clientes[i].connection.sendUTF(JSON.stringify({
                                operacion: "nueva_reserva",
                                fecha: fecha,
                                origen: cliente.nombre,
                                categoria: msg.categoria,
                                modelo: msg.modelo,
                                numero_serie: msg.numero_serie,
                            }));
                        }
                    }
                    break;
                case "iniciarReserva":
                    if (cliente.tipo !== "sanitario") return;
                    var fecha = new Date().toLocaleString();
                    for (var i=0; i<clientes.length; i++) {
                        if (clientes[i].tipo == "sanitario" && clientes[i].id != cliente.id) {
                            clientes[i].connection.sendUTF(JSON.stringify({
                                operacion: "iniciarReserva",
                                fecha: fecha,
                                origen: cliente.nombre,
                                categoria: msg.categoria,
                                modelo: msg.modelo,
                                numero_serie: msg.numero_serie,
                            }));
                        }
                    }
                    break;
                case "finalizarReserva":
                    if (cliente.tipo !== "sanitario") return;
                    var fecha = new Date().toLocaleString();
                    for (var i=0; i<clientes.length; i++) {
                        if (clientes[i].tipo == "sanitario" && clientes[i].id !=cliente.id) {
                            clientes[i].connection.sendUTF(JSON.stringify({
                                operacion: "finalizarReserva",
                                fecha: fecha,
                                origen: cliente.nombre,
                                categoria: msg.categoria,
                                modelo: msg.modelo,
                                numero_serie: msg.numero_serie,
                            }));
                        }
                    }
                // Aquí se podrían añadir más casos para otras operaciones      
            }
            
        }
    });

    connection.on("close", function () {

        for (var i = 0; i < clientes.length; i++) {
            if (clientes[i].connection === connection) {
                clientes.splice(i, 1);

                break;
            }
        }

        console.log("Cliente desconectado. Total:", clientes.length);
    });

});

