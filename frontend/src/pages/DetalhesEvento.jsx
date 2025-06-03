import React, { useEffect, useState } from 'react';
import '../styles/Detalhes.css';
import ReservaModal from './ReservaModal';
import ComprarModal from './ComprarModal';

function DetalhesEvento({ idEvento, onClose }) {
  const [evento, setEvento] = useState(null);
  const [tipoIngresso, setTipoIngresso] = useState('inteira');
  const [isReservaOpen, setIsReservaOpen] = useState(false);
  const [isCompraOpen, setIsCompraOpen] = useState(false);

  useEffect(() => {
    if (!idEvento) return;

    fetch(`http://localhost:3001/api/eventos-externos/${idEvento}`)
      .then(res => res.json())
      .then(data => setEvento(data))
      .catch(erro => console.error('Erro ao buscar evento:', erro));
  }, [idEvento]);

  const calcularPrecoFinal = () => {
    if (!evento?.preco) return 0;
    switch (tipoIngresso) {
      case 'meia':
        return evento.preco / 2;
      case 'vip':
        return evento.preco * 2;
      default:
        return evento.preco;
    }
  };

  const handleFinalizarCompra = async (formaPagamento) => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const id_usuario = usuarioLogado?.id_usuario;
    if (!id_usuario) {
      alert('Você precisa estar logado!');
      return;
    }
    try {
      const resposta = await fetch('http://localhost:3001/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario,
          id_evento: idEvento,
          id_forma_pagamento: Number(formaPagamento),
          tipo_ingresso: tipoIngresso,
          valor_pago: calcularPrecoFinal()
        }),
      });
      const data = await resposta.json();
      if (resposta.ok) {
        alert('Compra realizada com sucesso!');
        setIsCompraOpen(false);
        onClose && onClose();
      } else {
        alert(data.erro || 'Erro ao finalizar compra.');
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro);
      alert('Erro no servidor.');
    }
  };

  if (!evento) return null;

  return (
    <div className="evento-modal-overlay">
      <div className="evento-modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{evento.nome_evento || evento.nome}</h2>
        <img
          src={
            evento.imagem ||
            (evento.images && evento.images[0]?.url) ||
            ''
          }
          alt={evento.nome_evento || evento.nome}
          className="imagem-detalhe"
        />
        <p><strong>Descrição:</strong> {evento.descricao}</p>
        <p><strong>Data:</strong> {evento.data_evento || evento.data}</p>
        <p><strong>Local:</strong> {evento.local_evento || evento.local}</p>
        {evento?.preco && (
          <>
            <p><strong>Preço base:</strong> R$ {evento.preco.toFixed(2)}</p>
            <p><strong>Preço final:</strong> R$ {calcularPrecoFinal().toFixed(2)}</p>
          </>
        )}
        <div className="select-ingresso">
          <h3 className="subtitulo-ingresso">Escolha o tipo de ingresso:</h3>
          <select
            value={tipoIngresso}
            onChange={(e) => setTipoIngresso(e.target.value)}
          >
            <option value="inteira">Inteira</option>
            <option value="meia">Meia-entrada</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        <div className="botoes-modal">
          <button className="comprar-btn" onClick={() => setIsCompraOpen(true)}>
            Comprar
          </button>
          <button className="reservar-btn" onClick={() => setIsReservaOpen(true)}>
            Reservar
          </button>
        </div>
      </div>

      <ComprarModal
        evento={evento}
        isOpen={isCompraOpen}
        onClose={() => setIsCompraOpen(false)}
        tipoIngresso={tipoIngresso}
        valorBase={evento?.preco}
        onFinalizarCompra={handleFinalizarCompra}
      />

      <ReservaModal
        evento={evento}
        isOpen={isReservaOpen}
        onClose={() => setIsReservaOpen(false)}
      />
    </div>
  );
}

export default DetalhesEvento;

