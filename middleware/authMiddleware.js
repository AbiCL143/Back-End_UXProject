const jwt = require('jsonwebtoken');
const Usuario = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar si el token ha expirado o es inválido
        if (!decoded) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        }

        // Buscar al usuario en la base de datos
        const usuario = await Usuario.findById(decoded.id);
        
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Añadir el rol y el ID del usuario a la request para futuras validaciones
        req.user = { id: usuario.ID_usuario, rol: usuario.rol };

        // Proceder a la siguiente función si todo está en orden
        next();
    } catch (error) {
        console.error('Error al procesar el token:', error.message);

        // Diferenciar entre un error de formato del token y otros problemas
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: 'El token ha expirado.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ mensaje: 'Token inválido.' });
        } else {
            // Otros errores no previstos
            return res.status(500).json({ mensaje: 'Error al procesar el token.' });
        }
    }
};

module.exports = authMiddleware;
