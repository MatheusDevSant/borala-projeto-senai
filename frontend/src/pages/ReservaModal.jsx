import React, { useState } from 'react';
import '../styles/Reserva.css';

function ReservaModal({ evento, isOpen, onClose }) {
  const [etapa, setEtapa] = useState(1);
  const [cpf, setCpf] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('cartao');
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
    setFormaPagamento('');
    setTipoIngresso('inteira');
    setMensagemSucesso('');
    onClose();
  };

  const handleConfirmarReserva = async () => {
    if (!usuarioLogado) {
      alert('Você precisa estar logado para reservar!');
      return;
    }

    let idEventoFinal = evento.id_evento;

    // Cadastro automático do evento se necessário
    if (!idEventoFinal) {
      const eventoParaCadastro = {
        nome_evento: evento.nome,
        id_categoria: 1,
        id_local_evento: 1,
        data_evento: evento.data,
        id_cidade: 39,
        id_estado: 25,
        preco: evento.preco || 100.00
      };
      const resp = await fetch('http://localhost:3001/api/eventos-externos/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoParaCadastro)
      });
      const data = await resp.json();
      if (data.id_evento) {
        idEventoFinal = data.id_evento;
      } else {
        alert('Erro ao cadastrar evento automaticamente.');
        return;
      }
    }

    const dadosReserva = {
      id_usuario: usuarioLogado.id_usuario,
      id_evento: Number(idEventoFinal),
      id_forma_pagamento:
        formaPagamento === 'cartao'
          ? 1
          : formaPagamento === 'boleto'
          ? 2
          : 3,
      tipo_ingresso: tipoIngresso,
      preco_pago: Number(calcularPrecoFinal())
    };

    // ...validação dos campos se quiser...

    try {
      const resposta = await fetch('http://localhost:3001/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosReserva)
      });
      const resultado = await resposta.json();
      if (resposta.ok) {
        setMensagemSucesso('Reserva realizada com sucesso!');
        setEtapa(3);
      } else {
        alert(resultado.erro || 'Erro ao realizar reserva.');
      }
    } catch (erro) {
      console.error('Erro ao reservar:', erro);
      alert('Erro na requisição.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reserva-modal-overlay">
      <div className="reserva-modal-content">
        {/* Etapa 1 - Aviso */}
        {etapa === 1 && (
          <>
            <h2>⚠️ AVISO SOBRE A SUA RESERVA</h2>
            <p>
              Finalize o pagamento em até 24h para garantir seu ingresso.
              Depois disso, ele volta pro site e pode ser de outra pessoa 😬
            </p>
            <button onClick={handleProximaEtapa}>Prosseguir</button>
          </>
        )}

        {/* Etapa 2 - Formulário */}
        {etapa === 2 && (
          <>
            <h2>🎟️ RESERVA DE INGRESSOS</h2>
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
            <h3>Selecione a forma de pagamento:</h3>
            <div className="pagamento-opcoes">
              <button
                className={formaPagamento === 'cartao' ? 'ativo' : ''}
                onClick={() => setFormaPagamento('cartao')}
              >
                💳 Cartão
              </button>
              <button
                className={formaPagamento === 'boleto' ? 'ativo' : ''}
                onClick={() => setFormaPagamento('boleto')}
              >
                📄 Boleto
              </button>
              <button
                className={formaPagamento === 'pix' ? 'ativo' : ''}
                onClick={() => setFormaPagamento('pix')}
              >
                🏦 Pix
              </button>
            </div>
            <button onClick={handleConfirmarReserva} style={{ marginTop: '15px' }}>
              Confirmar Reserva
            </button>
          </>
        )}

        {/* Etapa 3 - Confirmação */}
        {etapa === 3 && (
          <>
            <h2>✅ Reserva Confirmada</h2>
            <p>{mensagemSucesso}</p>
            <p>
              Fique de olho no seu e-mail, te mandamos todos os detalhes por lá 😉
            </p>
            <button onClick={handleFechar}>Fechar</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ReservaModal;