import React, { useState } from 'react';
import '../styles/ComprarModal.css';

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
    if (!usuarioLogado) {
      alert('Você precisa estar logado!');
      return;
    }

    let idEventoFinal = evento.id_evento;

    // Se não houver id_evento, cadastrar evento automaticamente
    if (!idEventoFinal) {
      // Ajuste os campos conforme o que você tem no evento externo
      const eventoParaCadastro = {
        nome_evento: evento.nome,
        id_categoria: 1, // ou defina conforme sua lógica
        id_local_evento: 1, // ou defina conforme sua lógica
        data_evento: evento.data,
        id_cidade: 39, // ou defina conforme sua lógica
        id_estado: 25, // ou defina conforme sua lógica
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

    const dadosCompra = {
      id_usuario: Number(usuarioLogado.id_usuario),
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

    // Validação dos campos
    if (
      !dadosCompra.id_usuario ||
      !dadosCompra.id_evento ||
      !dadosCompra.id_forma_pagamento ||
      !dadosCompra.tipo_ingresso ||
      isNaN(dadosCompra.preco_pago)
    ) {
      alert('Preencha todos os campos corretamente!');
      console.log('Dados inválidos:', dadosCompra);
      return;
    }

    console.log('Dados enviados para compra:', dadosCompra);

    try {
      const resposta = await fetch('http://localhost:3001/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCompra),
      });
      const data = await resposta.json();
      if (resposta.ok) {
        setMensagem('Compra realizada com sucesso!');
        setTimeout(() => {
          setMensagem('');
          onClose && onClose();
        }, 1500);
      } else {
        alert(data.erro || 'Erro ao finalizar compra.');
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro);
      alert('Erro no servidor.');
    }
  };

  if (!isOpen) return null;

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
