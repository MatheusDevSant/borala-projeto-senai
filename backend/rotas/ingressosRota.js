const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

// Ingressos do usuário logado
router.get('/usuario/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [rows] = await conexao.promise().query(
      `SELECT v.*, e.nome_evento, e.data_evento, e.local_evento, f.forma
       FROM vendas v
       JOIN eventos e ON v.id_evento = e.id_evento
       JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
       WHERE v.id_usuario = ?
       ORDER BY v.data_compra_bilhete DESC`,
      [id_usuario]
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar ingressos do usuário.' });
  }
});

// Todos os ingressos (admin)
router.get('/admin', async (req, res) => {
  try {
    const [rows] = await conexao.promise().query(
      `SELECT v.*, e.nome_evento, e.data_evento, e.local_evento, f.forma, u.nome as nome_usuario
       FROM vendas v
       JOIN eventos e ON v.id_evento = e.id_evento
       JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       ORDER BY v.data_compra_bilhete DESC`
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar ingressos.' });
  }
});

module.exports = router;
