// rotas/comprasRota.js
const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

// POST /api/compras
router.post('/', (req, res) => {
  console.log('Dados recebidos na compra:', req.body); // Adicione esta linha para depuração
  const { id_usuario, id_evento, id_forma_pagamento, preco_pago } = req.body;

  if (!id_usuario || !id_evento || !id_forma_pagamento) {
    return res.status(400).json({ erro: 'Dados incompletos.' });
  }

  const id_status = 1; // Exemplo: 1 = Reservado
  const sql = `
    INSERT INTO vendas (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, preco_pago)
    VALUES (?, ?, ?, NOW(), NOW(), ?, ?)
  `;

  const params = [id_status, id_usuario, id_evento, id_forma_pagamento, preco_pago];

  conexao.query(sql, params, (erro, resultado) => {
    if (erro) {
      console.error('Erro ao registrar a venda:', erro);
      return res.status(500).json({ erro: 'Erro ao registrar a venda.' });
    }
    res.json({ mensagem: 'Compra registrada com sucesso!', id_venda: resultado.insertId });
  });
});

module.exports = router;
module.exports = router;
