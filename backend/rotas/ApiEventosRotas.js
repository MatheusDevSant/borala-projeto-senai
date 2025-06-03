// ApiEventosRotas.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

// Eventos fictícios como fallback
const eventosFallback = [
  {
    id: 'fake1', nome: 'Evento de Exemplo 1', data: '2025-06-20', local: 'Praça Central',
    cidade: 'São Paulo', estado: 'SP', imagem: 'https://via.placeholder.com/300x200.png?text=Evento+1',
    descricao: 'Evento fictício para exibição.', latitude: -23.5505, longitude: -46.6333,
    categoria: 'Shows'
  },
  {
    id: 'fake2', nome: 'Evento de Exemplo 2', data: '2025-07-10', local: 'Arena RJ',
    cidade: 'Rio de Janeiro', estado: 'RJ', imagem: 'https://via.placeholder.com/300x200.png?text=Evento+2',
    descricao: 'Evento fictício para exibição.', latitude: -22.9068, longitude: -43.1729,
    categoria: 'Esporte'
  },
  {
    id: 'fake3', nome: 'Show de Rock Independente', data: '2025-09-05', local: 'Praça da Liberdade',
    cidade: 'Belo Horizonte', estado: 'MG', imagem: 'https://via.placeholder.com/300x200.png?text=Rock+Independente',
    descricao: 'Banda fictícia para preencher a tela.', latitude: -19.9245, longitude: -43.9352,
    categoria: 'Shows'
  },
  {
    id: 'fake4', nome: 'Cine Arte na Praia', data: '2025-12-10', local: 'Orla de Salvador',
    cidade: 'Salvador', estado: 'BA', imagem: 'https://via.placeholder.com/300x200.png?text=Cinema+na+Praia',
    descricao: 'Sessão fictícia de cinema ao ar livre.', latitude: -12.9714, longitude: -38.5014,
    categoria: 'Cinema'
  },
  {
    id: 'fake5', nome: 'Corrida Noturna Porto Alegre', data: '2025-11-18', local: 'Parque Redenção',
    cidade: 'Porto Alegre', estado: 'RS', imagem: 'https://via.placeholder.com/300x200.png?text=Corrida+Noturna',
    descricao: 'Evento esportivo fictício à noite.', latitude: -30.0346, longitude: -51.2177,
    categoria: 'Esporte'
  }
];

function aplicaFiltros(eventos, { estado, data, categoria }) {
  return eventos.filter(e => {
    const condEstado = !estado || e.estado === estado;
    const condData = !data || (e.data && e.data.startsWith(`2025-${data}`));
    const condCategoria = !categoria || (e.categoria && e.categoria.toLowerCase() === categoria.toLowerCase());
    return condEstado && condData && condCategoria;
  });
}

// GET /api/eventos-externos
router.get('/', async (req, res) => {
  const { estado, data, categoria } = req.query;

  try {
    const resposta = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_KEY}&countryCode=BR&size=100`);
    const dados = await resposta.json();

    let eventos = [];

    if (dados._embedded?.events) {
      const reais = dados._embedded.events
        .filter(e => e._embedded?.venues?.[0]?.location?.latitude && e._embedded?.venues?.[0]?.location?.longitude)
        .map(e => {
          const v = e._embedded.venues[0];
          const id = e.id;
          const nome = e.name;

          if (!id || id === '0' || typeof id !== 'string' || !nome) {
            console.log('Evento ignorado por ID/nome inválido:', id, nome);
            return null;
          }

          return {
            id: id,
            nome: nome,
            data: e.dates.start.localDate,
            local: v.name || 'Local não informado',
            endereco: v.address?.line1 || '',
            cidade: v.city?.name || '',
            estado: v.state?.stateCode || '',
            imagem: e.images[0]?.url || null,
            descricao: e.info || 'Sem descrição disponível',
            latitude: parseFloat(v.location?.latitude),
            longitude: parseFloat(v.location?.longitude),
            categoria: e.classifications?.[0]?.segment?.name || 'Outro'
          };
        })
        .filter(e => e !== null);

      eventos = [...reais, ...eventosFallback];
    } else {
      eventos = eventosFallback;
    }

    const filtrados = aplicaFiltros(eventos, { estado, data, categoria });
    res.json(filtrados);
  } catch (erro) {
    console.error('Erro na API Ticketmaster:', erro.message);
    const filtrados = aplicaFiltros(eventosFallback, { estado, data, categoria });
    res.json(filtrados);
  }
});

// GET /api/eventos-externos/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const eventoFake = eventosFallback.find(e => e.id === id);
  if (eventoFake) return res.json(eventoFake);

  try {
    // Busca evento do banco local se não for fake
    const conexao = require('../configuracoes/banco');
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
      return res.json(resultados[0]);
    }

    // Se não encontrar no banco, tenta buscar na Ticketmaster
    const resposta = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_KEY}`);

    if (!resposta.ok) {
      return res.status(404).json({ erro: 'Evento não encontrado.' });
    }

    const evento = await resposta.json();
    const v = evento._embedded?.venues?.[0] || {};

    const eventoFormatado = {
      id: evento.id,
      nome: evento.name,
      data: evento.dates.start.localDate,
      local: v.name || 'Local não informado',
      endereco: v.address?.line1 || '',
      cidade: v.city?.name || '',
      estado: v.state?.stateCode || '',
      imagem: evento.images?.[0]?.url || '',
      descricao: evento.info || 'Sem descrição disponível',
      latitude: parseFloat(v.location?.latitude) || null,
      longitude: parseFloat(v.location?.longitude) || null,
      categoria: evento.classifications?.[0]?.segment?.name || 'Outro'
    };

    res.json(eventoFormatado);
  } catch (erro) {
    console.error('Erro ao buscar evento por ID:', erro.message);
    res.status(500).json({ erro: 'Erro ao buscar evento.' });
  }
});

module.exports = router;
