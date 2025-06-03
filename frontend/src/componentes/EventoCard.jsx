import React from 'react';
import '../styles/EventoCard.css';

function EventoCard({ evento }) {
  // Suporte tanto para eventos do banco local quanto da Ticketmaster
  const imagem = evento.imagem || evento.images?.[0]?.url;
  const nome = evento.nome_evento || evento.nome || evento.name;
  const data = evento.data_evento || evento.data || evento.dates?.start?.localDate;
  const local = evento.local_evento || evento.local || evento._embedded?.venues?.[0]?.name;
  const endereco = evento.endereco || evento._embedded?.venues?.[0]?.address?.line1 || '';
  const preco = evento.preco;

  return (
    <div className="evento-card">
      {imagem && <img className="evento-img" src={imagem} alt={nome} />}
      <div className="evento-info">
        <h2>{nome}</h2>
        <p>📍 {local}{endereco ? `, ${endereco}` : ''}</p>
        <p>🗓️ {data}</p>
        {preco !== undefined && (
          <p>💸 Preço: R$ {Number(preco).toFixed(2)}</p>
        )}
        <button className="btn-comprar">Ver Evento</button>
      </div>
    </div>
  );
}

export default EventoCard;
