// backend/rotas/vendasRota.js - REESCRITO (para rota de Reserva PURA)
const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco');
// REMOVIDOS fetch e mercadopago pois esta rota é APENAS para RESERVA simples.
// const fetch = require('node-fetch');
// const mercadopago = require('mercadopago');
require('dotenv').config(); // Ainda necessário se outras rotas usarem .env


// ✅ ROTA: Realizar RESERVA de ingresso (STATUS 'RESERVADO')
router.post('/reservar', async (req, res) => {
    // Para uma RESERVA PURA, data_compra_bilhete e id_forma_pagamento serão NULL.
    const { id_usuario, id_evento, tipo_ingresso, preco_pago } = req.body;

    // Validação básica dos dados recebidos para reserva
    if (!id_usuario || !id_evento || tipo_ingresso === undefined || preco_pago === undefined || typeof preco_pago !== 'number') {
        console.error('Erro: Dados incompletos ou inválidos para a reserva.', req.body);
        return res.status(400).json({ erro: 'Dados incompletos ou inválidos para reserva.' });
    }

    try {
        // Buscar o ID do status 'Reservado' do banco de dados
        let id_status_reservado;
        try {
            const [statusReservadoRows] = await conexao.promise().query(
                `SELECT id_status FROM ${'`'}status${'`'} WHERE status = 'Reservado' LIMIT 1`
            );
            id_status_reservado = statusReservadoRows.length > 0 ? statusReservadoRows[0].id_status : 1; // Fallback para ID 1
        } catch (error) {
            console.error('Erro ao buscar ID do status "Reservado" no DB:', error);
            id_status_reservado = 1; // Fallback em caso de erro
        }

        // Inserir reserva no banco de dados com status 'Reservado'
        // data_compra_bilhete e id_forma_pagamento SÃO DEFINITIVAMENTE NULL para reserva inicial
        const sql = `
            INSERT INTO vendas
            (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, preco_pago)
            VALUES (?, ?, ?, NOW(), NULL, NULL, ?);
        `;
        const params = [
            id_status_reservado, // ID do status 'Reservado'
            id_usuario,
            id_evento,
            preco_pago // preco_pago (valor total da reserva)
        ];

        const [resultado] = await conexao.promise().execute(sql, params);

        console.log(`✅ RESERVA PURA registrada com sucesso! ID da reserva: ${resultado.insertId}`);
        res.status(201).json({
            mensagem: 'Reserva registrada com sucesso!',
            id_reserva: resultado.insertId
            // NÃO ENVIA link_pagamento aqui, pois esta é uma reserva pura
        });

    } catch (erro) {
        console.error('❌ Erro no processo de reserva no DB:', erro);
        res.status(500).json({ erro: 'Erro ao processar a reserva.' });
    }
});

// ✅ ROTA: Buscar reservas de um usuário específico (mantida)
router.get('/usuario/:id/reservas', (req, res) => {
    const idUsuario = req.params.id;

    const sql = `
        SELECT v.*, e.nome_evento, e.data_evento, le.local_evento, cat.categoria AS nome_categoria, st.status AS nome_status
        FROM vendas v
        JOIN eventos e ON v.id_evento = e.id_evento
        JOIN local_evento le ON e.id_local_evento = le.id_local_evento
        JOIN categorias cat ON e.id_categoria = cat.id_categoria
        JOIN ${'`'}status${'`'} st ON v.id_status = st.id_status -- Adicionado para pegar o nome do status
        WHERE v.id_usuario = ? AND v.id_status = (SELECT id_status FROM ${'`'}status${'`'} WHERE status = 'Reservado')
        ORDER BY v.data_reserva_bilhete DESC
    `;

    conexao.promise().query(sql, [idUsuario])
        .then(([resultados]) => {
            res.json(resultados);
        })
        .catch(erro => {
            console.error('Erro ao buscar reservas:', erro);
            res.status(500).json({ erro: 'Erro ao buscar reservas do usuário.' });
        });
});

// ✅ ROTA: Cancelar uma reserva por ID (mantida)
router.delete('/cancelar/:id', (req, res) => {
    const idReserva = req.params.id;

    // TODO: Considerar mudar para UPDATE status = 'Cancelado' em vez de DELETE
    const sql = 'DELETE FROM vendas WHERE id_venda = ?';

    conexao.promise().execute(sql, [idReserva])
        .then(([resultado]) => {
            if (resultado.affectedRows > 0) {
                res.json({ mensagem: 'Reserva cancelada com sucesso.' });
            } else {
                res.status(404).json({ mensagem: 'Reserva não encontrada.' });
            }
        })
        .catch(erro => {
            console.error('Erro ao cancelar reserva:', erro);
            res.status(500).json({ erro: 'Erro ao cancelar a reserva.' });
        });
});

module.exports = router;