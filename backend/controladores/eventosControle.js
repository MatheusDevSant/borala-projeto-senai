// eventosControle.js
const conexao = require('../configuracoes/banco');

// Função para listar eventos com filtros opcionais
async function buscarEventos(req, res) {
  const { cidade, data, categoria } = req.query;
  let sql = `
    SELECT e.*, e.preco, le.local_evento, c.cidade, cat.categoria
    FROM eventos e
    JOIN local_evento le ON e.id_local_evento = le.id_local_evento
    JOIN cidades c ON e.id_cidade = c.id_cidade
    JOIN categorias cat ON e.id_categoria = cat.id_categoria
    WHERE 1 = 1
  `;
  const params = [];

  if (cidade) {
    sql += ` AND c.cidade LIKE ?`;
    params.push(`%${cidade}%`);
  }

  if (data) {
    sql += ` AND MONTH(e.data_evento) = ?`;
    params.push(data);
  }

  if (categoria) {
    sql += ` AND (cat.categoria = ? OR e.id_categoria = ?)`;
    params.push(categoria, categoria);
  }

  try {
    const [resultados] = await conexao.promise().query(sql, params);
    res.json(resultados);
  } catch (erro) {
    console.error('Erro ao listar eventos:', erro);
    res.status(500).json({ erro: 'Erro no servidor ao listar eventos' });
  }
}

module.exports = { buscarEventos };
