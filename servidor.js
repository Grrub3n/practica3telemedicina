require("./servidor_rest.js")
require("./servidor_rpc.js")
require("./servidor_ws.js")

//cordova plugin add community-cordova-plugin-nfc
//set "JAVA_HOME=C:\Program Files\Java\jdk-17.0.20.1"
//set "PATH=%JAVA_HOME%\bin;%PATH%"
//cordova run android --device

/*
En el código javascript de tu aplicación para leer una etiqueta NFC:
document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() { // Espero a que cordova esté inicializado
    // Escuchar cualquier etiqueta NDEF cercana
    nfc.addNdefListener(
        function (nfcEvent) {
        var tag = nfcEvent.tag;
        console.log("Etiqueta detectada:", JSON.stringify(tag));
        // Decodificar el mensaje NDEF
        var payload = tag.ndefMessage[0].payload;
        // Los primeros bytes son el idioma
        var languageCodeLength = payload[0] & 0x3F;
        // Quitar el idioma
        var text = nfc.bytesToString(payload.slice(1 + languageCodeLength));
        alert("Contenido de la etiqueta: " + text);
    },
    function () {
    console.log("Escuchador NFC activado con éxito.");
    },
    function (error) {
    console.log("Error al iniciar el escuchador NFC: " + error);
    }
);
Para escribir en una etiqueta:
function escribirNFC(texto) {
    // Crear un registro de texto NDEF
    console.log("Escribiendo en NFC: " + texto);
    var record = ndef.textRecord(texto);
    nfc.write( // Escribir el cuando el dispositivo toque la etiqueta
    [record], function () {
        alert("¡Escritura en NFC exitosa!");
    },
    function (error) {
        console.log("Error al escribir en NFC", error);
        alert("Error al escribir: " + JSON.stringify(error));
    }
    );
}
*/