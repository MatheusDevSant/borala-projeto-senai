import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Table } from "@/components/ui/table"; // shadcn/ui Table se você já adicionou

function AdminDashboard() {
  const [ingressos, setIngressos] = useState([]);
  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/ingressos/admin')
      .then(res => res.json())
      .then(data => {
        setIngressos(data);
        // Exemplo: agrupar por tipo_ingresso para gráfico
        const tipos = {};
        data.forEach(item => {
          tipos[item.tipo_ingresso] = (tipos[item.tipo_ingresso] || 0) + 1;
        });
        setGrafico(Object.keys(tipos).map(tipo => ({ tipo, qtd: tipos[tipo] })));
      });
  }, []);

  return (
    <div>
      <h2>Dashboard Administrativo</h2>
      <BarChart width={400} height={250} data={grafico}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tipo" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="qtd" fill="#4caf50" />
      </BarChart>
      <Table>
        <thead>
          <tr>
            <th>Usuário</th>
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
              <td>{ing.nome_usuario}</td>
              <td>{ing.nome_evento}</td>
              <td>{ing.data_evento}</td>
              <td>{ing.local_evento}</td>
              <td>{ing.tipo_ingresso}</td>
              <td>{ing.forma}</td>
              <td>R$ {Number(ing.preco_pago).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AdminDashboard;
