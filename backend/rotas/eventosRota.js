// rotas/eventosRota.js
const express = require('express');
const router = express.Router();
const { buscarEventos } = require('../controladores/eventosControle');

// Rota: GET /api/eventos
router.get('/', buscarEventos);

// Rota: GET /api/eventos/:id (detalhes de um evento do banco local)
router.get('/:id', async (req, res) => {
  const conexao = require('../configuracoes/banco');
  const id = req.params.id;
  try {
    const [resultados] = await conexao.promise().query(
      `SELECT e.*, le.local_evento, c.cidade, cat.categoria
       FROM eventos e
       JOIN local_evento le ON e.id_local_evento = le.id_local_evento
       JOIN cidades c ON e.id_cidade = c.id_cidade
       JOIN categorias cat ON e.id_categoria = cat.id_categoria
       WHERE e.id_evento = ? LIMIT 1`,
      [id]
    );
    if (resultados.length > 0) {
      res.json(resultados[0]);
    } else {
      res.status(404).json({ erro: 'Evento não encontrado.' });
    }
  } catch (erro) {
    console.error('Erro ao buscar evento por ID:', erro);
    res.status(500).json({ erro: 'Erro ao buscar evento.' });
  }
});

module.exports = router;
