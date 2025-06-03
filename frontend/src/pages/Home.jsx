import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import DetalhesEvento from '../pages/DetalhesEvento';

function Home() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [estado, setEstado] = useState('');
  const [mes, setMes] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/eventos-externos')
      .then(res => res.json())
      .then(data => setEventos(data || []))
      .catch(err => console.error('Erro ao buscar eventos:', err));
  }, []);

  useEffect(() => {
    document.body.style.overflow = eventoSelecionado ? 'hidden' : 'auto';
  }, [eventoSelecionado]);

  const buscarEventos = () => {
    let url = 'http://localhost:3001/api/eventos-externos';
    const queryParams = [];

    if (estado) queryParams.push(`estado=${estado}`);
    if (mes) queryParams.push(`data=${mes}`);

    if (queryParams.length) {
      url += `?${queryParams.join('&')}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setEventos(data || []))
      .catch(err => console.error('Erro ao buscar eventos filtrados:', err));
  };

  const filtrarPorCategoria = (categoria) => {
    let categoriaId;
    switch (categoria) {
      case 'Shows': categoriaId = 1; break;
      case 'Teatro': categoriaId = 2; break;
      case 'Esporte': categoriaId = 3; break;
      case 'Cinema': categoriaId = 4; break;
      default: return;
    }

    fetch(`http://localhost:3001/api/eventos-externos?categoria=${categoriaId}`)
      .then(res => res.json())
      .then(data => setEventos(data || []))
      .catch(err => console.error('Erro ao buscar por categoria:', err));
  };

  return (
    <div className="home">
      <header className="banner">
        <div className="banner-content">
          <h1>SUA JORNADA ATÉ O MELHOR EVENTO COMEÇA COM UM CLIQUE!</h1>
          <div className="filtros">
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Selecione um estado</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="BA">Bahia</option>
              <option value="RS">Rio Grande do Sul</option>
            </select>

            <select value={mes} onChange={(e) => setMes(e.target.value)}>
              <option value="">Selecione o mês</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>

            <button onClick={buscarEventos}>Buscar</button>
          </div>
        </div>
      </header>

      <section className="categorias">
        <h2>Categorias de Eventos</h2>
        <div className="categorias-cards">
          {['Shows', 'Teatro', 'Esporte', 'Cinema'].map((cat) => (
            <div
              key={cat}
              className="categoria-card"
              onClick={() => filtrarPorCategoria(cat)}
            >
              {cat === 'Shows' && '🎶 '}
              {cat === 'Teatro' && '🎭 '}
              {cat === 'Esporte' && '⚽ '}
              {cat === 'Cinema' && '🎬 '}
              {cat}
            </div>
          ))}
        </div>
      </section>

      <section className="carrossel">
        <h2>Eventos Disponíveis</h2>
        <div className="eventos-lista">
          {eventos.length === 0 ? (
            <p>Nenhum evento encontrado.</p>
          ) : (
            eventos.map(evento => (
              <div key={evento.id || evento.id_evento} className="evento-card">
                <h3>{evento.nome}</h3>
                <img src={evento.imagem} alt={evento.nome} />
                <p>Data: {evento.data}</p>
                <p>Local: {evento.local}</p>
                
                <button onClick={() => setEventoSelecionado(evento.id || evento.id_evento)}>
                  Ver Detalhes
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {eventoSelecionado && (
        <DetalhesEvento
          idEvento={eventoSelecionado}
          onClose={() => setEventoSelecionado(null)}
        />
      )}

      <footer className="footer">
        <p>&copy; 2025 BoraLá - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

export default Home;
