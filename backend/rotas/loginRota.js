const express = require('express');
const router = express.Router();
const { autenticarUsuario } = require('../controladores/loginControle');

// POST /api/usuarios/login
router.post('/', autenticarUsuario);

module.exports = router;
