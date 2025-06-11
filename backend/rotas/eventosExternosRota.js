const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');

router.post('/cadastrar', async (req, res) => {
  let { nome_evento, id_categoria, categoria_nome, id_local_evento, data_evento, id_cidade, id_estado, preco } = req.body;

  // Validação dos campos obrigatórios (debug extra)
  if (!nome_evento || !id_categoria || !id_local_evento || !data_evento || !id_cidade || !id_estado) {
    console.error('❌ Dados obrigatórios ausentes:', req.body);
    return res.status(400).json({ erro: 'Dados obrigatórios ausentes para cadastro de evento.' });
  }

  // Verifique se a cidade realmente existe no banco antes de tentar inserir
  try {
    const [cidadeRows] = await conexao.promise().query(
      'SELECT id_cidade FROM cidades WHERE id_cidade = ? AND id_estado = ? LIMIT 1',
      [id_cidade, id_estado]
    );
    if (cidadeRows.length === 0) {
      console.error(`❌ Cidade/Estado não encontrados no banco para cadastro de evento: id_cidade=${id_cidade}, id_estado=${id_estado}`);
      return res.status(400).json({ erro: 'Cidade/Estado não encontrados no banco.' });
    }
  } catch (err) {
    console.error('❌ Erro ao validar cidade/estado:', err);
    return res.status(500).json({ erro: 'Erro ao validar cidade/estado.' });
  }

  // Mapeamento de nome para id_categoria
  if (!id_categoria && categoria_nome) {
    // Exemplo simples, ajuste conforme suas categorias
    const categoriasMap = {
      'Sports': 1,
      'Esporte': 1,
      'Music': 2,
      'Música': 2,
      'Palestra': 3,
      'Workshop': 4,
      'Oficina': 4
    };
    id_categoria = categoriasMap[categoria_nome] || 1; // Default para Esporte se não encontrar
  }

  // Validação dos campos obrigatórios
  if (!nome_evento || !id_categoria || !id_local_evento || !data_evento || !id_cidade || !id_estado) {
    return res.status(400).json({ erro: 'Dados obrigatórios ausentes para cadastro de evento.' });
  }

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
