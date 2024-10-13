// routes/usuario.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // Importar el middleware
const Usuario = require('../models/User'); // Ruta al modelo de Usuario

// Ruta para crear un nuevo usuario y para registrarse
router.post('/', async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);

        // Validar que el rol sea 0 o 1
        if (nuevoUsuario.rol !== 0 && nuevoUsuario.rol !== 1) {
            return res.status(400).json({ mensaje: 'El rol debe ser 0 o 1' });
        }

        // Encriptar la contraseña antes de guardar
        nuevoUsuario.contraseña = await bcrypt.hash(nuevoUsuario.contraseña, 10);

        // Guardar el nuevo usuario
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
});

// Ruta para registrar un nuevo usuario
router.post('/registro', async (req, res) => {
    const { nombre, apellido_p, apellido_m, usuario, correo, contraseña, rol } = req.body;

    try {
        const existingUser = await Usuario.findOne({ usuario });
        if (existingUser) {
            return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso' });
        }

        const existingEmail = await Usuario.findOne({ correo });
        if (existingEmail) {
            return res.status(400).json({ mensaje: 'El correo ya está en uso' });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const nuevoUsuario = new Usuario({
            nombre,
            apellido_p,
            apellido_m,
            usuario,
            correo,
            contraseña: hashedPassword,
            rol
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
});

// Ruta para iniciar sesión
router.post('/iniciar-sesion', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const contrasenaCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contrasenaCorrecta) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: usuario._id.toString(), rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
});

// Ruta para obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, async (req, res) => {
    // Verificar si el usuario es admin
    if (req.user.rol !== 0) {
        return res.status(403).json({ mensaje: 'Acceso denegado: Solo el administrador puede ver todos los usuarios' });
    }

    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
});

// Ruta para obtener un usuario por su ID_usuario
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ ID_usuario: req.params.id });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener usuario' });
    }
});

// Ruta para modificar un usuario por su ID_usuario
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, contraseña, rol } = req.body; // Incluye rol, pero restringido a admin
        const updateData = { nombre, correo };

        // Permitir que el administrador (rol: 0) modifique cualquier usuario
        // y que un usuario normal modifique solo su propia información
        if (req.user.rol !== 0 && req.user.id !== id) {
            return res.status(403).json({ mensaje: 'Acceso denegado: No tienes permisos para modificar este usuario.' });
        }

        // Solo permitir que el administrador modifique el rol
        if (rol && req.user.rol === 0) {
            updateData.rol = rol; // Solo el admin puede cambiar el rol
        } else if (rol && req.user.rol !== 0) {
            return res.status(403).json({ mensaje: 'Acceso denegado: No puedes modificar el rol.' });
        }

        // Si se proporciona una nueva contraseña, encriptarla
        if (contraseña) {
            updateData.contraseña = await bcrypt.hash(contraseña, 10);
        }

        // Buscar el usuario por su ID_usuario
        const usuarioModificado = await Usuario.findOneAndUpdate(
            { ID_usuario: id },  // Actualizar basado en el ID_usuario
            updateData,
            { new: true } // Retornar el documento actualizado
        );

        // Si no se encuentra el usuario
        if (!usuarioModificado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.status(200).json({
            mensaje: 'Usuario modificado con éxito',
            usuario: usuarioModificado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar usuario' });
    }
});


// Ruta para eliminar un usuario por su ID_usuario (solo admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Verificar si el usuario tiene rol 0 (administrador)
        if (req.user.rol !== 0) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo los administradores pueden eliminar usuarios.' });
        }

        // Buscar y eliminar el usuario por su ID_usuario
        const usuarioEliminado = await Usuario.findOneAndDelete({ ID_usuario: req.params.id });

        if (!usuarioEliminado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.status(204).json(); // No hay contenido que devolver
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
});


module.exports = router;
