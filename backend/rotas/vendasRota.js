// vendasRota.js
const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');
const fetch = require('node-fetch');
const mercadopago = require('mercadopago');
require('dotenv').config();

// Não use mercadopago.configure

// ✅ ROTA: Realizar RESERVA de ingresso + integração com Mercado Pago
router.post('/reservar', async (req, res) => {
  const { id_usuario, id_evento, id_forma_pagamento, valor_pago } = req.body;

  if (!id_usuario || !id_evento || !id_forma_pagamento) {
    return res.status(400).json({ erro: 'Dados incompletos para reserva.' });
  }

  try {
    // Busca dados do evento externo
    const eventoRes = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id_evento}.json?apikey=${process.env.TICKETMASTER_KEY}`);
    const evento = await eventoRes.json();

    if (!evento || !evento.name || !evento.dates?.start?.localDate) {
      return res.status(404).json({ erro: 'Evento não encontrado na API externa.' });
    }

    // Define o preço (exemplo fixo, ideal seria buscar do evento)
    const preco = valor_pago !== undefined ? valor_pago : 100.00;

    // Criar preferência de pagamento
    const preference = {
      items: [
        {
          title: evento.name,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: preco
        }
      ],
      payment_methods: {
        excluded_payment_types: []
      },
      back_urls: {
        success: "http://localhost:3000/sucesso",
        failure: "http://localhost:3000/erro"
      },
      auto_return: "approved"
    };

    // Passe o access_token diretamente na chamada
    const resposta = await mercadopago.preferences.create(preference, {
      access_token: process.env.MERCADOPAGO_TOKEN
    });

    // Inserir reserva no banco
    const id_status = 1; // 1 = reservado
    const sql = `
      INSERT INTO vendas 
      (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento${valor_pago !== undefined ? ', valor_pago' : ''})
      VALUES (?, ?, ?, NOW(), NOW(), ?${valor_pago !== undefined ? ', ?' : ''})
    `;

    const params = [id_status, id_usuario, id_evento, id_forma_pagamento];
    if (valor_pago !== undefined) params.push(valor_pago);

    conexao.query(sql, params, (erro, resultado) => {
      if (erro) {
        console.error('Erro ao inserir reserva:', erro);
        return res.status(500).json({ erro: 'Erro ao registrar reserva no banco.' });
      }

      res.status(201).json({ 
        mensagem: 'Reserva registrada com sucesso!', 
        id_reserva: resultado.insertId,
        link_pagamento: resposta.body.init_point
      });
    });

  } catch (erro) {
    console.error('Erro externo ao reservar ingresso:', erro);
    res.status(500).json({ erro: 'Erro ao processar a reserva com dados do evento.' });
  }
});

// ✅ ROTA: Buscar reservas de um usuário específico
router.get('/usuario/:id/reservas', (req, res) => {
  const idUsuario = req.params.id;

  const sql = `
    SELECT v.*, e.nome_evento, e.data_evento, le.local_evento
    FROM vendas v
    JOIN eventos e ON v.id_evento = e.id_evento
    JOIN local_evento le ON e.id_local_evento = le.id_local_evento
    WHERE v.id_usuario = ? AND v.id_status = 1
  `;

  conexao.query(sql, [idUsuario], (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar reservas:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar reservas do usuário.' });
    }

    res.json(resultados);
  });
});

// ✅ ROTA: Cancelar uma reserva por ID
router.delete('/cancelar/:id', (req, res) => {
  const idReserva = req.params.id;

  const sql = 'DELETE FROM vendas WHERE id_venda = ?';

  conexao.query(sql, [idReserva], (erro, resultado) => {
    if (erro) {
      console.error('Erro ao cancelar reserva:', erro);
      return res.status(500).json({ erro: 'Erro ao cancelar a reserva.' });
    }

    res.json({ mensagem: 'Reserva cancelada com sucesso.' });
  });
});

module.exports = router;
