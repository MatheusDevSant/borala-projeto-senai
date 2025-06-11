const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

function filtroData(req) {
  const { dataInicio, dataFim } = req.query;
  let where = '';
  const params = [];
  if (dataInicio) {
    where += (where ? ' AND ' : 'WHERE ') + 'data_compra_bilhete >= ?';
    params.push(dataInicio);
  }
  if (dataFim) {
    where += (where ? ' AND ' : 'WHERE ') + 'data_compra_bilhete <= ?';
    params.push(dataFim);
  }
  return { where, params };
}

function filtroAdmin(req) {
  const { categoria, status } = req.query;
  let where = '';
  const params = [];
  if (categoria) {
    where += (where ? ' AND ' : 'WHERE ') + 'e.id_categoria = ?';
    params.push(categoria);
  }
  if (status) {
    where += (where ? ' AND ' : 'WHERE ') + 'v.id_status = ?';
    params.push(status);
  }
  return { where, params };
}

router.get('/resumo', async (req, res) => {
  try {
    const [[{ usuarios }]] = await conexao.promise().query('SELECT COUNT(*) AS usuarios FROM usuarios');
    const [[{ eventos }]] = await conexao.promise().query('SELECT COUNT(*) AS eventos FROM eventos');
    const [[{ vendas }]] = await conexao.promise().query('SELECT COUNT(*) AS vendas FROM vendas WHERE id_status = 2');
    const [[{ reservas }]] = await conexao.promise().query('SELECT COUNT(*) AS reservas FROM vendas WHERE id_status = 1');
    res.json({ usuarios, eventos, vendas, reservas });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar resumo admin.' });
  }
});

router.get('/vendas-por-categoria', async (req, res) => {
  try {
    const { where, params } = filtroAdmin(req);
    // LEFT JOIN para mostrar todas as categorias, mesmo sem vendas
    const [rows] = await conexao.promise().query(
      `SELECT cat.categoria, COUNT(v.id_venda) AS total
       FROM categorias cat
       LEFT JOIN eventos e ON e.id_categoria = cat.id_categoria
       LEFT JOIN vendas v ON v.id_evento = e.id_evento ${where ? where.replace('WHERE', 'AND') : ''}
       GROUP BY cat.categoria
       ORDER BY cat.categoria`, params
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar vendas por categoria.' });
  }
});

router.get('/vendas-por-mes', async (req, res) => {
  try {
    const { where, params } = filtroAdmin(req);
    const [rows] = await conexao.promise().query(
      `SELECT DATE_FORMAT(data_compra_bilhete, '%Y-%m') as mes, COUNT(*) as total
       FROM vendas v
       JOIN eventos e ON v.id_evento = e.id_evento
       ${where}
       GROUP BY mes
       ORDER BY mes`, params
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar vendas por mês.' });
  }
});

router.get('/vendas-por-forma', async (req, res) => {
  try {
    const { where, params } = filtroAdmin(req);
    const [rows] = await conexao.promise().query(
      `SELECT 
         COALESCE(f.forma, 'Não pago') as forma, 
         COUNT(*) as total
       FROM vendas v
       LEFT JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
       JOIN eventos e ON v.id_evento = e.id_evento
       ${where}
       GROUP BY forma`, params
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar vendas por forma de pagamento.' });
  }
});

router.get('/ultimos-usuarios', async (req, res) => {
  try {
    const [rows] = await conexao.promise().query(
      `SELECT id_usuario, nome, email_outros, email_google, telefone, data_cadastro
       FROM usuarios
       ORDER BY id_usuario DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar últimos usuários.' });
  }
});

router.get('/ultimos-eventos', async (req, res) => {
  try {
    const [rows] = await conexao.promise().query(
      `SELECT e.id_evento, e.nome_evento, c.categoria, e.data_evento, le.local_evento
       FROM eventos e
       JOIN categorias c ON e.id_categoria = c.id_categoria
       JOIN local_evento le ON e.id_local_evento = le.id_local_evento
       ORDER BY e.id_evento DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar últimos eventos.' });
  }
});

// Nova rota para listar categorias (para o filtro)
router.get('/categorias', async (req, res) => {
  try {
    const [rows] = await conexao.promise().query('SELECT id_categoria, categoria FROM categorias');
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar categorias.' });
  }
});

router.get('/valor-total', async (req, res) => {
  try {
    const { where, params } = filtroAdmin(req);
    const [[{ valor }]] = await conexao.promise().query(
      `SELECT SUM(v.preco_pago) as valor
       FROM vendas v
       JOIN eventos e ON v.id_evento = e.id_evento
       ${where}`, params
    );
    res.json({ valor: valor || 0 });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar valor total.' });
  }
});

router.get('/top-eventos', async (req, res) => {
  try {
    const [rows] = await conexao.promise().query(
      `SELECT e.nome_evento, COUNT(*) as total
       FROM vendas v
       JOIN eventos e ON v.id_evento = e.id_evento
       GROUP BY e.nome_evento
       ORDER BY total DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar top eventos.' });
  }
});

router.get('/ultimas-vendas', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const [rows] = await conexao.promise().query(
      `SELECT v.id_venda, u.nome as usuario, e.nome_evento, v.data_compra_bilhete, v.preco_pago, f.forma, s.status
       FROM vendas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       JOIN eventos e ON v.id_evento = e.id_evento
       LEFT JOIN forma_pagamento f ON v.id_forma_pagamento = f.id_forma_pagamento
       JOIN status s ON v.id_status = s.id_status
       ORDER BY v.data_compra_bilhete DESC
       LIMIT ? OFFSET ?`, [limit, offset]
    );
    // Total de vendas para paginação
    const [[{ total }]] = await conexao.promise().query(
      `SELECT COUNT(*) as total FROM vendas`
    );
    res.json({ vendas: rows, total });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar últimas vendas.' });
  }
});

// Total de usuários
router.get('/total-usuarios', (req, res) => {
  conexao.query('SELECT COUNT(*) AS total FROM usuarios', (erro, resultados) => {
    if (erro) return res.status(500).json({ erro: 'Erro ao buscar total de usuários' });
    res.json(resultados[0]);
  });
});

// Total de vendas
router.get('/total-vendas', (req, res) => {
  conexao.query('SELECT COUNT(*) AS total FROM vendas', (erro, resultados) => {
    if (erro) return res.status(500).json({ erro: 'Erro ao buscar total de vendas' });
    res.json(resultados[0]);
  });
});

// Faturamento total
router.get('/faturamento', (req, res) => {
  conexao.query('SELECT SUM(preco_pago) AS total FROM vendas WHERE preco_pago IS NOT NULL', (erro, resultados) => {
    if (erro) return res.status(500).json({ erro: 'Erro ao buscar faturamento' });
    res.json(resultados[0]);
  });
});

module.exports = router;
