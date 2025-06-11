import React, { useEffect, useState } from 'react';
import '../styles/MeusIngressos.css';
import bannerImg from '../images/festivais-internacionais.jpg'; // importação da imagem

function MeusIngressos() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const [comprados, setComprados] = useState([]);
  const [reservados, setReservados] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/ingressos/usuario/${usuarioLogado.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setComprados(data.filter(ing => ing.id_status === 2));
        setReservados(data.filter(ing => ing.id_status === 1));
      });
  }, [usuarioLogado.id_usuario]);

  return (
    <>
      {/* Banner tela inteira */}
      <div
        style={{
          width: '100vw',
          height: '220px',
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 0,
          marginBottom: '32px',
          position: 'relative',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
      <div className="meus-ingressos">
        <h2>Meus Ingressos</h2>

        <h3>Ingressos Comprados</h3>
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Data</th>
              <th>Local</th>
              <th>Tipo</th>
              <th>Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {comprados.length === 0 ? (
              <tr><td colSpan={6}>Nenhum ingresso comprado.</td></tr>
            ) : (
              comprados.map(ing => (
                <tr key={ing.id_venda}>
                  <td>{ing.nome_evento}</td>
                  <td>{ing.data_evento}</td>
                  <td>{ing.local_evento}</td>
                  <td>{ing.tipo_ingresso}</td>
                  <td>{ing.forma}</td>
                  <td>R$ {Number(ing.preco_pago).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <h3>Ingressos Reservados</h3>
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Data</th>
              <th>Local</th>
              <th>Tipo</th>
              <th>Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {reservados.length === 0 ? (
              <tr><td colSpan={6}>Nenhuma reserva ativa.</td></tr>
            ) : (
              reservados.map(ing => (
                <tr key={ing.id_venda}>
                  <td>{ing.nome_evento}</td>
                  <td>{ing.data_evento}</td>
                  <td>{ing.local_evento}</td>
                  <td>{ing.tipo_ingresso}</td>
                  <td>{ing.forma}</td>
                  <td>R$ {Number(ing.preco_pago).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default MeusIngressos;
