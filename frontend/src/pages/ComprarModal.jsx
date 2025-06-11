import React, { useState } from 'react';
import '../styles/ComprarModal.css'; // Verifique se o caminho do CSS está correto

function ComprarModal({ evento, isOpen, onClose, valorBase = 0 }) {
    const [formaPagamento, setFormaPagamento] = useState('cartao');
    const [mensagem, setMensagem] = useState('');
    const [tipoIngresso, setTipoIngresso] = useState('inteira');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Garante que sempre haverá um valor numérico para o preço base
    const precoBase = Number(evento?.preco) > 0
        ? Number(evento.preco)
        : Number(valorBase) > 0
            ? Number(valorBase)
            : 100.00;

    const calcularPrecoFinal = () => {
        switch (tipoIngresso) {
            case 'meia':
                return precoBase / 2;
            case 'vip':
                return precoBase * 2;
            default:
                return precoBase;
        }
    };

    const handleConfirmarCompra = async () => {
        if (!usuarioLogado || !usuarioLogado.id_usuario) {
            alert('Você precisa estar logado para realizar a compra!');
            return;
        }

        let idEventoFinal = evento.id_evento;

        // Lógica de cadastro automático do evento se for externo (sem id_evento do DB)
        if (!idEventoFinal && evento.nome && evento.data) { // Verifique se tem dados mínimos para cadastrar
            console.log('Evento sem ID no DB, tentando cadastrar automaticamente...');
            const eventoParaCadastro = {
                nome_evento: evento.nome,
                // Adapte id_categoria, id_local_evento, id_cidade, id_estado conforme a estrutura do seu evento externo
                // e o que seu endpoint /api/eventos-externos/cadastrar espera.
                // IDs fixos (1, 39, 25) são um fallback. O ideal seria mapear.
                id_categoria: (evento.classifications && evento.classifications[0]?.segment?.name === 'Music') ? 2 : 1, // Exemplo: Música=2, Esporte=1
                id_local_evento: 1, // Precisa ser um ID válido do seu DB
                data_evento: evento.data,
                id_cidade: 39, // ID da cidade de São Paulo
                id_estado: 25, // ID do estado de São Paulo
                preco: evento.preco || 100.00,
                // Inclua lat/lng se for necessário no cadastro externo
                latitude: evento.latitude || null,
                longitude: evento.longitude || null
            };
            try {
                const resp = await fetch('http://localhost:3001/api/eventos-externos/cadastrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventoParaCadastro)
                });
                const dataCadastro = await resp.json();
                if (resp.ok && dataCadastro.id_evento) {
                    idEventoFinal = dataCadastro.id_evento;
                    console.log(`Evento externo cadastrado com ID: ${idEventoFinal}`);
                } else {
                    alert(dataCadastro.erro || 'Erro ao cadastrar evento automaticamente para compra.');
                    return;
                }
            } catch (error) {
                console.error('Erro na requisição de cadastro automático de evento:', error);
                alert('Erro de rede ao cadastrar evento automaticamente.');
                return;
            }
        } else if (!idEventoFinal) {
            alert('Não foi possível obter um ID de evento válido ou cadastrar o evento automaticamente.');
            return;
        }

        const dadosCompra = {
            id_usuario: Number(usuarioLogado.id_usuario),
            id_evento: Number(idEventoFinal),
            id_forma_pagamento: // Mapeia a string para o ID numérico do DB
                formaPagamento === 'cartao' ? 1 :
                formaPagamento === 'boleto' ? 2 :
                formaPagamento === 'pix' ? 3 : null,
            tipo_ingresso: tipoIngresso,
            preco_pago: Number(calcularPrecoFinal())
        };

        // Validação final dos dados a serem enviados
        if (
            !dadosCompra.id_usuario ||
            !dadosCompra.id_evento ||
            !dadosCompra.id_forma_pagamento ||
            !dadosCompra.tipo_ingresso ||
            isNaN(dadosCompra.preco_pago)
        ) {
            alert('Por favor, preencha todos os campos corretamente para a compra!');
            console.error('Dados inválidos para envio de compra:', dadosCompra);
            return;
        }

        console.log('Dados enviados para API de compra:', dadosCompra);

        try {
            const resposta = await fetch('http://localhost:3001/api/compras', { // CHAMA O ENDPOINT DE COMPRA (STATUS PAGO)
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCompra),
            });
            const dataRetorno = await resposta.json();
            if (resposta.ok) {
                setMensagem('Compra realizada com sucesso! ID da venda: ' + dataRetorno.id_venda);
                setTimeout(() => {
                    setMensagem('');
                    onClose && onClose(); // Fecha o modal
                    // Opcional: redirecionar para uma página de "meus ingressos" ou "sucesso"
                    // navigate('/meus-ingressos');
                }, 1500);
            } else {
                alert(dataRetorno.erro || 'Erro ao finalizar compra no servidor.');
            }
        } catch (erro) {
            console.error('Erro na requisição de compra para o backend:', erro);
            alert('Erro de rede ao finalizar compra.');
        }
    };

    if (!isOpen) return null; // Não renderiza se não estiver aberto

    return (
        <div className="comprar-modal-overlay">
            <div className="comprar-modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Finalizar Compra</h2>
                <p><strong>Evento:</strong> {evento.nome_evento || evento.nome}</p>
                <div>
                    <label><strong>Tipo de ingresso:</strong></label>
                    <select value={tipoIngresso} onChange={e => setTipoIngresso(e.target.value)}>
                        <option value="inteira">Inteira</option>
                        <option value="meia">Meia-entrada</option>
                        <option value="vip">VIP</option>
                    </select>
                </div>
                <p><strong>Valor:</strong> R$ {calcularPrecoFinal().toFixed(2)}</p>
                <h3>Forma de pagamento:</h3>
                <div className="pagamento-opcoes">
                    <button
                        className={formaPagamento === 'cartao' ? 'ativo' : ''}
                        onClick={() => setFormaPagamento('cartao')}
                        type="button"
                    >
                        💳 Cartão
                    </button>
                    <button
                        className={formaPagamento === 'boleto' ? 'ativo' : ''}
                        onClick={() => setFormaPagamento('boleto')}
                        type="button"
                    >
                        📄 Boleto
                    </button>
                    <button
                        className={formaPagamento === 'pix' ? 'ativo' : ''}
                        onClick={() => setFormaPagamento('pix')}
                        type="button"
                    >
                        🏦 Pix
                    </button>
                </div>
                <button className="comprar-btn" onClick={handleConfirmarCompra}>
                    Confirmar Compra
                </button>
                {mensagem && <p style={{ color: 'green', marginTop: 10 }}>{mensagem}</p>}
            </div>
        </div>
    );
}

export default ComprarModal;