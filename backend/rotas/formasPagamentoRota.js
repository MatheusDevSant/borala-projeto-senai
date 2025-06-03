const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

router.get('/', async (req, res) => {
  try {
    const [rows] = await conexao.promise().query('SELECT * FROM forma_pagamento');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar formas de pagamento' });
  }
});

module.exports = router;
