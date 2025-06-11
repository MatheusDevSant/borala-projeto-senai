const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

// Buscar categorias dos eventos do usuário (DEVE VIR PRIMEIRO)
router.get('/categorias/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const sql = `
        SELECT cat.categoria, COUNT(*) AS total
        FROM vendas v
        JOIN eventos e ON v.id_evento = e.id_evento
        JOIN categorias cat ON e.id_categoria = cat.id_categoria
        WHERE v.id_usuario = ?
        GROUP BY cat.categoria
    `;
    conexao.query(sql, [id_usuario], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao buscar dados.' });
        }
        res.json(resultados);
    });
});

// Buscar eventos do usuário
router.get('/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;

    const sql = `
        SELECT 
            c.categoria,
            e.nome_evento,
            le.local_evento,
            e.data_evento,
            v.preco_pago
        FROM vendas v
        JOIN eventos e ON v.id_evento = e.id_evento
        JOIN categorias c ON e.id_categoria = c.id_categoria
        JOIN local_evento le ON e.id_local_evento = le.id_local_evento
        WHERE v.id_usuario = ?
        ORDER BY e.data_evento DESC
    `;

    conexao.query(sql, [id_usuario], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar momentos:', erro); // MELHORE O LOG
            return res.status(500).json({ erro: 'Erro ao buscar momentos', detalhes: erro.message });
        }

        res.json(resultados);
    });
});

module.exports = router;
