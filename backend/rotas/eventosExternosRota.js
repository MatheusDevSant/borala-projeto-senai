const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

router.post('/cadastrar', async (req, res) => {
  const { nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco } = req.body;
  try {
    // Verifica se já existe
    const [existe] = await conexao.promise().query(
      'SELECT id_evento FROM eventos WHERE nome_evento = ? AND data_evento = ? AND id_local_evento = ? LIMIT 1',
      [nome_evento, data_evento, id_local_evento]
    );
    if (existe.length > 0) {
      return res.json({ id_evento: existe[0].id_evento });
    }
    // Insere novo evento
    const [resultado] = await conexao.promise().query(
      `INSERT INTO eventos (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco || 100.00]
    );
    res.json({ id_evento: resultado.insertId });
  } catch (erro) {
    console.error('Erro ao cadastrar evento externo:', erro);
    res.status(500).json({ erro: 'Erro ao cadastrar evento.' });
  }
});

module.exports = router;
