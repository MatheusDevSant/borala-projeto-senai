import React, { useEffect, useState } from 'react';
import '../styles/Detalhes.css';
import ReservaModal from './ReservaModal';
import ComprarModal from './ComprarModal';

function DetalhesEvento({ idEvento, onClose }) {
  const [evento, setEvento] = useState(null);
  const [tipoIngresso, setTipoIngresso] = useState('inteira'); // Agora editável
  const [isReservaOpen, setIsReservaOpen] = useState(false);
  const [isCompraOpen, setIsCompraOpen] = useState(false);
  const [formaSelecionada, setFormaSelecionada] = useState('');
  const [precoComprado, setPrecoComprado] = useState(null);

  useEffect(() => {
    if (!idEvento) return;

    fetch(`http://localhost:3001/api/eventos-externos/${idEvento}`)
      .then(res => res.json())
      .then(data => {
        // Log para depuração do evento recebido
        console.log('Evento recebido:', data);
        // Força o preço a ser número, mesmo se vier string
        if (data && (typeof data.preco === "string" || typeof data.preco === "number")) {
          data.preco = Number(data.preco);
        }
        if (data && (typeof data.valor === "string" || typeof data.valor === "number")) {
          data.valor = Number(data.valor);
        }
        if (data && (typeof data.price === "string" || typeof data.price === "number")) {
          data.price = Number(data.price);
        }
        setEvento(data);
      })
      .catch(erro => console.error('Erro ao buscar evento:', erro));
  }, [idEvento]);

  // Sempre pega o preço como número, inclusive se vier string
  const precoEvento =
    (evento && !isNaN(Number(evento.preco)) && Number(evento.preco) > 0) ? Number(evento.preco)
    : (evento && !isNaN(Number(evento.valor)) && Number(evento.valor) > 0) ? Number(evento.valor)
    : (evento && !isNaN(Number(evento.price)) && Number(evento.price) > 0) ? Number(evento.price)
    : 100; // <-- valor padrão para eventos externos sem preço

  // Defina os preços para cada tipo de ingresso
  const precoInteira = precoEvento;
  const precoMeia = precoEvento * 0.5;
  const precoVip = precoEvento * 2;

  const calcularPrecoFinal = () => {
    switch (tipoIngresso) {
      case 'meia':
        return precoMeia;
      case 'vip':
        return precoVip;
      default:
        return precoInteira;
    }
  };

  const handleFinalizarCompra = async (formaPagamento) => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const id_usuario = usuarioLogado?.id_usuario;
    if (!id_usuario) {
      alert('Você precisa estar logado!');
      return;
    }
    // Validação extra detal
    if (!formaPagamento) {
      alert('Selecione uma forma de pagamento.');
      return;
    }
    if (!tipoIngresso) {
      alert('Tipo de ingresso inválido.');
      return;
    }
    if (!precoEvento || isNaN(precoEvento) || precoEvento <= 0) {
      alert(`Preço do evento inválido: ${precoEvento}. Este evento não possui valor definido. Informe um administrador.`);
      return;
    }
    // Log para depuração do preço e dados enviados
    console.log('precoEvento:', precoEvento, 'evento:', evento);
    try {
      // Log para depuração do que está sendo enviado
      console.log('Enviando para compra:', {
        id_usuario,
        id_evento: idEvento,
        id_forma_pagamento: Number(formaPagamento),
        tipo_ingresso: tipoIngresso,
        valor_pago: calcularPrecoFinal()
      });
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
      // Log para depuração da resposta do backend
      console.log('Resposta backend:', data);
      if (resposta.ok) {
        setPrecoComprado(calcularPrecoFinal());
        alert('Compra realizada com sucesso!');
        setIsCompraOpen(false);
        onClose && onClose();
      } else {
        alert(data.erro || 'Erro ao finalizar compra. Verifique os dados e tente novamente.');
        console.error('Erro ao finalizar compra:', data);
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando e acessível em http://localhost:3001');
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
        {precoEvento > 0 && (
          <>
            <p><strong>Preço base:</strong> R$ {Number(precoEvento).toFixed(2)}</p>
            <p><strong>Preço final:</strong> R$ {calcularPrecoFinal().toFixed(2)}</p>
          </>
        )}
        <div className="select-ingresso">
          <h3 className="subtitulo-ingresso">Escolha a melhor opção para você:</h3>
          <label>Tipo de Ingresso:</label>
          <select
            value={tipoIngresso}
            onChange={e => setTipoIngresso(e.target.value)}
            style={{ marginBottom: 12 }}
          >
            <option value="inteira">Inteira</option>
            <option value="meia">Meia</option>
            <option value="vip">VIP</option>
          </select>
          <label>Forma de Pagamento:</label>
          <select
            value={formaSelecionada}
            onChange={e => setFormaSelecionada(e.target.value)}
            style={{ marginBottom: 12 }}
          >
            <option value="">Selecione</option>
            <option value="1">Cartão</option>
            <option value="2">Boleto</option>
            <option value="3">Pix</option>
          </select>
        </div>
        <div className="botoes-modal">
          <button
            className="comprar-btn"
            onClick={() => handleFinalizarCompra(formaSelecionada)}
            disabled={!formaSelecionada}
          >
            Comprar
          </button>
          <button className="reservar-btn" onClick={() => setIsReservaOpen(true)}>
            Reservar
          </button>
        </div>
        {/* Mostra o preço do ingresso comprado */}
        {precoComprado !== null && (
          <div style={{ marginTop: 18, textAlign: "center", color: "#28a745", fontWeight: "bold" }}>
            Você comprou este ingresso por: R$ {Number(precoComprado).toFixed(2)}
          </div>
        )}
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
