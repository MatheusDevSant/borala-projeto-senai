const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

// Ingressos do usuário logado
router.get('/usuario/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const [rows] = await conexao.promise().query(
       `SELECT
        v.*,
        e.nome_evento,
        e.data_evento,
        l.local_evento, -- CORRIGIDO: Agora seleciona da tabela 'local_evento' (alias 'l')
        f.forma
    FROM vendas v
    JOIN eventos e ON v.id_evento = e.id_evento
    JOIN local_evento l ON e.id_local_evento = l.id_local_evento -- JOIN ADICIONADO
    LEFT JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
    ORDER BY v.data_criacao DESC`,
      [id_usuario]
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar ingressos do usuário.' });
  }
});

// Todos os ingressos (admin)
router.get('/admin', (req, res) => {
  try {
    const sql = `SELECT
            v.*,
            e.nome_evento,
            e.data_evento,
            l.local_evento, -- COLUNA CORRIGIDA: Agora vem da tabela 'local_evento' (alias 'l')
            f.forma,
            u.nome AS nome_usuario
        FROM vendas v
        JOIN ${'`'}status${'`'} st ON v.id_status = st.id_status -- Adicionei o join com status (bom para ter o nome do status)
        JOIN usuarios u ON v.id_usuario = u.id_usuario
        JOIN eventos e ON v.id_evento = e.id_evento
        JOIN local_evento l ON e.id_local_evento = l.id_local_evento -- JOIN ADICIONADO para 'local_evento'
        LEFT JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
        ORDER BY v.data_criacao DESC; -- Use data_criacao, já que agora ela existe`;
;
    conexao.query(sql, [], (erro, resultados) => {
      if (erro) {
        console.error('Erro ao buscar ingressos admin:', erro);
        return res.status(500).json({ erro: 'Erro ao buscar ingressos.' });
      }
      res.json(resultados);
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar ingressos.' });
  }
});

module.exports = router;
