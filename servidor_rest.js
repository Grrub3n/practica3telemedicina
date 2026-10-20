var express = require("express");
var app = express();
var datosServidor= require("./datos.js");

var jwt = require("jwt-simple");
var clave = "miSecretoMasOscuro"
const { createClient } =require ('@supabase/supabase-js');

const supabaseUrl= 'https://ozyuhnxhjvlpsemkdxwa.supabase.co';
const supabaseKey= 'sb_publishable_iahRQ_vvzRdeZUram-RIng_lzm7STHo';
const supabase= createClient(supabaseUrl,supabaseKey);
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

app.post('/api/gestores/login', asyncRoute(async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({
            error: 'Debes introducir usuario y contraseña.'
        });
    }

    const { data: gestor, error } = await supabase
        .from('gestores')
        .select('id, usuario, password')
        .eq('usuario', usuario)
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!gestor || gestor.password !== password) {
        return res.status(401).json({
            error: 'Usuario o contraseña incorrectos.'
        });
    }

    const token = jwt.encode({
        usuario: gestor.id,
        expira: Date.now() + 60 * 60 * 1000
    }, clave);

    res.json({
        token: token,
        id: gestor.id,
        usuario: gestor.usuario
    });
}));

// ==================================================
// AUTENTICACIÓN DE LAS RUTAS /api
// ==================================================

app.use('/api', (req, res, next) => {
    const token = req.query.token;

    if (!token) {
        return res.status(401).json({
            error: 'Falta el token de autenticación.'
        });
    }

    try {
        const datos = jwt.decode(token, clave);

        if (!datos.usuario || !datos.expira || datos.expira < Date.now()) {
            return res.status(401).json({
                error: 'El token ha caducado o no es válido.'
            });
        }

        req.usuario = datos.usuario;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido.'
        });
    }
});

// ==================================================
// OBTENER UBICACIONES
// ==================================================

app.get('/api/ubicaciones', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('ubicaciones')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
}));

// ==================================================
// OBTENER CATEGORÍAS
// ==================================================

app.get('/api/categorias', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('categorias')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
}));

// ==================================================
// OBTENER MODELOS
// ==================================================

app.get('/api/modelos', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('modelos')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
}));

// ==================================================
// OBTENER UN GESTOR
// ==================================================

app.get('/api/gestores/:id', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('gestores')
        .select('id, nombre, apellidos, usuario')
        .eq('id', req.params.id)
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            error: 'Gestor no encontrado.'
        });
    }

    res.json(data);
}));

// ==================================================
// OBTENER UN SANITARIO
// ==================================================

app.get('/api/sanitarios/:id', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('sanitarios')
        .select('id, nombre, apellidos, usuario')
        .eq('id', req.params.id)
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            error: 'Sanitario no encontrado.'
        });
    }

    res.json(data);
}));

// ==================================================
// OBTENER RECURSOS CON FILTROS
// ==================================================

app.get('/api/recursos', asyncRoute(async (req, res) => {
    const { categoria, modelo, ubicacion, estado } = req.query;

    let consulta = supabase
        .from('recursos')
        .select('*');

    if (modelo) {
        consulta = consulta.eq('modelo', modelo);
    }

    if (ubicacion) {
        consulta = consulta.eq('ubicacion', ubicacion);
    }

    if (estado) {
        consulta = consulta.eq('estado', estado);
    }

    const { data: recursos, error } = await consulta;

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // La categoría se obtiene a través de los modelos.
    if (categoria) {
        const { data: modelos, error: errorModelos } = await supabase
            .from('modelos')
            .select('id')
            .eq('categoria', categoria);

        if (errorModelos) {
            return res.status(500).json({
                error: errorModelos.message
            });
        }

        const idsModelos = new Set(
            modelos.map(modelo => String(modelo.id))
        );

        const recursosFiltrados = recursos.filter(recurso =>
            idsModelos.has(String(recurso.modelo))
        );

        return res.json(recursosFiltrados);
    }

    res.json(recursos);
}));

// ==================================================
// OBTENER UN RECURSO
// ==================================================

app.get('/api/recursos/:id', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('recursos')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            error: 'Recurso no encontrado.'
        });
    }

    res.json(data);
}));

// ==================================================
// OBTENER RESERVAS DE UN RECURSO
// ==================================================

app.get('/api/recursos/:id/reservas', asyncRoute(async (req, res) => {
    const { data: reservas, error } = await supabase
        .from('reservas')
        .select('sanitario, fecha_peticion, fecha_inicio, fecha_fin, horas_estimadas')
        .eq('recurso', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (reservas.length === 0) {
        return res.json([]);
    }

    const idsSanitarios = [
        ...new Set(reservas.map(r => r.sanitario).filter(id => id != null))
    ];

    let sanitarios = [];

    if (idsSanitarios.length > 0) {
        const { data, error: errorSanitarios } = await supabase
            .from('sanitarios')
            .select('id, nombre, apellidos')
            .in('id', idsSanitarios);

        if (errorSanitarios) {
            return res.status(500).json({
                error: errorSanitarios.message
            });
        }

        sanitarios = data;
    }

    const resultado = reservas.map(reserva => {
        const sanitario = sanitarios.find(
            s => String(s.id) === String(reserva.sanitario)
        );

        return {
            ...reserva,
            nombre_sanitario: sanitario
                ? `${sanitario.nombre} ${sanitario.apellidos}`
                : '-'
        };
    });

    res.json(resultado);
}));

// ==================================================
// OBTENER RESEÑAS DE UN RECURSO
// ==================================================

app.get('/api/recursos/:id/resenyas', asyncRoute(async (req, res) => {
    const { data: resenyas, error } = await supabase
        .from('resenyas')
        .select('sanitario, descripcion, fecha, valor')
        .eq('recurso', req.params.id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (resenyas.length === 0) {
        return res.json([]);
    }

    const idsSanitarios = [
        ...new Set(resenyas.map(r => r.sanitario).filter(id => id != null))
    ];

    let sanitarios = [];

    if (idsSanitarios.length > 0) {
        const { data, error: errorSanitarios } = await supabase
            .from('sanitarios')
            .select('id, nombre, apellidos')
            .in('id', idsSanitarios);

        if (errorSanitarios) {
            return res.status(500).json({
                error: errorSanitarios.message
            });
        }

        sanitarios = data;
    }

    const resultado = resenyas.map(resenya => {
        const sanitario = sanitarios.find(
            s => String(s.id) === String(resenya.sanitario)
        );

        return {
            ...resenya,
            nombre_sanitario: sanitario
                ? `${sanitario.nombre} ${sanitario.apellidos}`
                : '-'
        };
    });

    res.json(resultado);
}));

// ==================================================
// CREAR UN GESTOR
// ==================================================

app.post('/api/gestores', asyncRoute(async (req, res) => {
    const { nombre, apellidos, usuario, password } = req.body;

    if (!nombre || !apellidos || !usuario || !password) {
        return res.status(400).json({
            error: 'Faltan datos obligatorios.'
        });
    }

    const { data: existente, error: errorBusqueda } = await supabase
        .from('gestores')
        .select('id')
        .eq('usuario', usuario)
        .maybeSingle();

    if (errorBusqueda) {
        return res.status(500).json({
            error: errorBusqueda.message
        });
    }

    if (existente) {
        return res.status(409).json({
            error: 'Ese usuario ya existe.'
        });
    }

    const { data, error } = await supabase
        .from('gestores')
        .insert({
            nombre,
            apellidos,
            usuario,
            password
        })
        .select('id')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
        mensaje: 'Gestor creado correctamente.',
        id: data.id
    });
}));

// ==================================================
// CREAR UN RECURSO
// ==================================================

app.post('/api/recursos', asyncRoute(async (req, res) => {
    const {
        nombre,
        descripcion,
        modelo,
        ubicacion,
        estado
    } = req.body;

    const { data, error } = await supabase
        .from('recursos')
        .insert({
            nombre,
            descripcion,
            modelo,
            ubicacion,
            estado
        })
        .select('id')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
        mensaje: 'Recurso creado correctamente.',
        id: data.id
    });
}));

// ==================================================
// MODIFICAR UN GESTOR
// ==================================================

app.put('/api/gestores/:id', asyncRoute(async (req, res) => {
    const id = req.params.id;
    const { nombre, apellidos, usuario, password } = req.body;

    const { data: gestor, error: errorGestor } = await supabase
        .from('gestores')
        .select('id')
        .eq('id', id)
        .maybeSingle();

    if (errorGestor) {
        return res.status(500).json({
            error: errorGestor.message
        });
    }

    if (!gestor) {
        return res.status(404).json({
            error: 'Gestor no encontrado.'
        });
    }

    if (usuario) {
        const { data: repetido, error: errorUsuario } = await supabase
            .from('gestores')
            .select('id')
            .eq('usuario', usuario)
            .neq('id', id)
            .maybeSingle();

        if (errorUsuario) {
            return res.status(500).json({
                error: errorUsuario.message
            });
        }

        if (repetido) {
            return res.status(409).json({
                error: 'Ese usuario ya está siendo utilizado.'
            });
        }
    }

    const cambios = {};

    if (nombre !== undefined) cambios.nombre = nombre;
    if (apellidos !== undefined) cambios.apellidos = apellidos;
    if (usuario !== undefined) cambios.usuario = usuario;
    if (password !== undefined) cambios.password = password;

    if (Object.keys(cambios).length === 0) {
        return res.status(400).json({
            error: 'No se han enviado campos para modificar.'
        });
    }

    const { data, error } = await supabase
        .from('gestores')
        .update(cambios)
        .eq('id', id)
        .select('id, nombre, apellidos, usuario')
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
}));

// ==================================================
// MODIFICAR UN RECURSO
// ==================================================

app.put('/api/recursos/:id', asyncRoute(async (req, res) => {
    const id = req.params.id;

    const {
        nombre,
        descripcion,
        modelo,
        ubicacion,
        estado
    } = req.body;

    const cambios = {};

    if (nombre !== undefined) cambios.nombre = nombre;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (modelo !== undefined) cambios.modelo = modelo;
    if (ubicacion !== undefined) cambios.ubicacion = ubicacion;
    if (estado !== undefined) cambios.estado = estado;

    if (Object.keys(cambios).length === 0) {
        return res.status(400).json({
            error: 'No se han enviado campos para modificar.'
        });
    }

    const { data, error } = await supabase
        .from('recursos')
        .update(cambios)
        .eq('id', id)
        .select('*')
        .maybeSingle();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data) {
        return res.status(404).json({
            error: 'Recurso no encontrado.'
        });
    }

    res.json(data);
}));

// ==================================================
// ELIMINAR UN RECURSO
// ==================================================

app.delete('/api/recursos/:id', asyncRoute(async (req, res) => {
    const { data, error } = await supabase
        .from('recursos')
        .delete()
        .eq('id', req.params.id)
        .select('id');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({
            error: 'Recurso no encontrado.'
        });
    }

    res.json({
        mensaje: 'Recurso eliminado correctamente.'
    });
}));

// ==================================================
// MANEJO GLOBAL DE ERRORES
// ==================================================

app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: 'Error interno del servidor.'
    });
});

// ==================================================
// INICIAR SERVIDOR
// ==================================================

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
