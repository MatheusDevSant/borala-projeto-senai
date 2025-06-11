// backend/rotas/comprasRota.js - REESCRITO
const express = require('express');
const router = express.Router();
const conexao = require('../configuracoes/banco'); // Sua conexão com o DB

// POST /api/compras - PARA REGISTRAR UMA COMPRA FINALIZADA (STATUS 'PAGO')
router.post('/', (req, res) => {
    const { id_usuario, id_evento, id_forma_pagamento, tipo_ingresso, valor_pago, nome_evento, data_evento } = req.body;

    // Log para depuração
    console.log('Dados recebidos para compra:', req.body);

    // Validação dos campos obrigatórios
    if (
        !id_usuario ||
        !id_evento ||
        !id_forma_pagamento ||
        !tipo_ingresso ||
        valor_pago === undefined ||
        valor_pago === null ||
        isNaN(Number(valor_pago)) ||
        Number(valor_pago) <= 0
    ) {
        return res.status(400).json({ erro: 'Dados incompletos ou inválidos para compra.' });
    }

    // Busca o evento no banco. Se não existir, cria um evento "externo" antes de registrar a venda.
    conexao.query(
        'SELECT id_evento FROM eventos WHERE id_evento = ?',
        [id_evento],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao buscar evento:', erro);
                return res.status(500).json({ erro: 'Erro ao buscar evento.' });
            }
            if (resultados.length === 0) {
                // Evento não existe, cria um evento "externo" com id_evento AUTO_INCREMENT
                const nomeEventoFinal = nome_evento || 'Evento Externo';
                const dataEventoFinal = data_evento || new Date().toISOString().slice(0, 10);
                const id_categoria = 7; // "Outros"
                const id_local_evento = 1;
                const id_cidade = 39;
                const id_estado = 25;
                const preco = valor_pago;

                conexao.query(
                    `INSERT INTO eventos (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [nomeEventoFinal, id_categoria, id_local_evento, dataEventoFinal, id_cidade, id_estado, preco],
                    function (erro2, resultadoEvento) {
                        if (erro2) {
                            console.error('Erro ao criar evento externo:', erro2);
                            return res.status(500).json({ erro: 'Erro ao criar evento externo.' });
                        }
                        // Usa o insertId gerado pelo banco
                        const novoIdEvento = resultadoEvento.insertId;

                        // Após criar o evento, insira a venda diretamente
                        const sqlVenda = `
                            INSERT INTO vendas
                            (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
                            VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?)
                        `;
                        conexao.query(
                            sqlVenda,
                            [2, id_usuario, novoIdEvento, id_forma_pagamento, tipo_ingresso, valor_pago],
                            (erroVenda, resultadoVenda) => {
                                if (erroVenda) {
                                    console.error('Erro ao registrar compra após criar evento:', erroVenda);
                                    return res.status(500).json({ erro: 'Erro ao registrar compra.' });
                                }
                                res.status(201).json({ mensagem: 'Compra registrada com sucesso!' });
                            }
                        );
                    }
                );
                return;
            }

            // Insere a venda (status = 2 = Pago)
            const sql = `
                INSERT INTO vendas
                (id_status, id_usuario, id_evento, data_reserva_bilhete, data_compra_bilhete, id_forma_pagamento, tipo_ingresso, preco_pago)
                VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?)
            `;
            conexao.query(
                sql,
                [2, id_usuario, id_evento, id_forma_pagamento, tipo_ingresso, valor_pago],
                (erro, resultado) => {
                    if (erro) {
                        console.error('Erro ao registrar compra:', erro);
                        return res.status(500).json({ erro: 'Erro ao registrar compra.' });
                    }
                    res.status(201).json({ mensagem: 'Compra registrada com sucesso!' });
                }
            );
        }
    );
});

module.exports = router;