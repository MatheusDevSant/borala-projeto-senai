import React, { useEffect, useState } from 'react';
import '../styles/MeusIngressos.css';

function MeusIngressos() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const [ingressos, setIngressos] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/ingressos/usuario/${usuarioLogado.id_usuario}`)
      .then(res => res.json())
      .then(data => setIngressos(data));
  }, [usuarioLogado.id_usuario]);

  return (
    <div className="meus-ingressos">
      <h2>Meus Ingressos</h2>
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
          {ingressos.map(ing => (
            <tr key={ing.id_venda}>
              <td>{ing.nome_evento}</td>
              <td>{ing.data_evento}</td>
              <td>{ing.local_evento}</td>
              <td>{ing.tipo_ingresso}</td>
              <td>{ing.forma}</td>
              <td>R$ {Number(ing.preco_pago).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MeusIngressos;
