import React, { useState } from 'react';
import '../styles/Reserva.css';

function ReservaModal({ evento, isOpen, onClose }) {
    const [etapa, setEtapa] = useState(1);
    const [cpf, setCpf] = useState('');
    const [tipoIngresso, setTipoIngresso] = useState('inteira');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    const calcularPrecoFinal = () => {
        const preco = evento?.preco ?? 100.00;
        if (!preco) return 0;
        switch (tipoIngresso) {
            case 'meia':
                return preco / 2;
            case 'vip':
                return preco * 2;
            default:
                return preco;
        }
    };

    const handleProximaEtapa = () => setEtapa(2);

    const handleFechar = () => {
        setEtapa(1);
        setCpf('');
        setTipoIngresso('inteira');
        setMensagemSucesso('');
        onClose();
    };

    const handleConfirmarReserva = async () => {
        if (!usuarioLogado || !usuarioLogado.id_usuario) {
            alert('Você precisa estar logado para realizar a reserva!');
            return;
        }

        let idEventoFinal = evento.id_evento;

        if (!idEventoFinal && evento.nome && evento.data) {
            const eventoParaCadastro = {
                nome_evento: evento.nome,
                id_categoria: (evento.classifications && evento.classifications[0]?.segment?.name === 'Music') ? 2 : 1,
                id_local_evento: 1,
                data_evento: evento.data,
                id_cidade: 39,
                id_estado: 25,
                preco: evento.preco || 100.00,
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
                } else {
                    alert(dataCadastro.erro || 'Erro ao cadastrar evento automaticamente para reserva.');
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

        const dadosReserva = {
            id_usuario: Number(usuarioLogado.id_usuario),
            id_evento: Number(idEventoFinal),
            tipo_ingresso: tipoIngresso,
            preco_pago: Number(calcularPrecoFinal())
        };

        if (
            !dadosReserva.id_usuario ||
            !dadosReserva.id_evento ||
            !dadosReserva.tipo_ingresso ||
            isNaN(dadosReserva.preco_pago)
        ) {
            alert('Por favor, preencha todos os campos corretamente para a reserva!');
            console.error('Dados inválidos para envio de reserva:', dadosReserva);
            return;
        }

        try {
            const resposta = await fetch('http://localhost:3001/api/vendas/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosReserva)
            });
            const resultado = await resposta.json();
            if (resposta.ok) {
                setMensagemSucesso('Reserva realizada com sucesso!');
                setEtapa(3);
            } else {
                alert(resultado.erro || 'Erro ao realizar reserva no servidor.');
            }
        } catch (erro) {
            console.error('Erro na requisição de reserva para o backend:', erro);
            alert('Erro de rede ao reservar.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="reserva-modal-overlay">
            <div className="reserva-modal-content">
                {etapa === 1 && (
                    <>
                        <button className="modal-close" onClick={handleFechar}>X</button>
                        <h2>⚠️ AVISO SOBRE A SUA RESERVA</h2>
                        <p>
                            Finalize o pagamento em até 24h para garantir seu ingresso.
                            Depois disso, ele volta pro site e pode ser de outra pessoa 😬
                        </p>
                        <button onClick={handleProximaEtapa}>Prosseguir</button>
                    </>
                )}

                {etapa === 2 && (
                    <>
                        <button className="modal-close" onClick={handleFechar}>X</button>
                        <h2>🎟️ RESERVA DE INGRESSOS</h2>
                        <p><strong>Evento:</strong> {evento.nome_evento || evento.nome}</p>
                        <div>
                            <label>Nome do comprador:</label>
                            <input type="text" value={usuarioLogado?.nome || ''} disabled />
                        </div>
                        <div>
                            <label>CPF do comprador:</label>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                placeholder="Insira seu CPF"
                            />
                        </div>
                        <div>
                            <label><strong>Tipo de ingresso:</strong></label>
                            <select value={tipoIngresso} onChange={e => setTipoIngresso(e.target.value)}>
                                <option value="inteira">Inteira</option>
                                <option value="meia">Meia-entrada</option>
                                <option value="vip">VIP</option>
                            </select>
                        </div>
                        <div className="total">
                            <strong>Total:</strong> R$ {calcularPrecoFinal().toFixed(2)}
                        </div>
                        <button onClick={handleConfirmarReserva} style={{ marginTop: '15px' }}>
                            Confirmar Reserva
                        </button>
                    </>
                )}

                {etapa === 3 && (
                    <>
                        <button className="modal-close" onClick={handleFechar}>X</button>
                        <h2>✅ Reserva Confirmada</h2>
                        <p>{mensagemSucesso}</p>
                        <p>
                            Fique de olho no seu e-mail, te mandamos todos os detalhes por lá 😉
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default ReservaModal;
