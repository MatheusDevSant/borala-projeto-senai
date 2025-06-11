import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import '../styles/Momentos.css';

function MomentosVivi() {
  const [momentos, setMomentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agrupadosPorCategoria, setAgrupadosPorCategoria] = useState([]);
  const [eventosPorMes, setEventosPorMes] = useState([]);

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      alert('Você precisa estar logado para ver seus momentos.');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/momentos/${usuarioLogado.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        // Garante que momentos seja sempre um array
        setMomentos(Array.isArray(data) ? data : []);
        setLoading(false);
        
        console.log('Dados recebidos de momentos:', data); // ADICIONE ESTA LINHA
        // Agrupar por categoria para gráfico de pizza
        const categorias = {};
        data.forEach(item => {
          categorias[item.categoria] = (categorias[item.categoria] || 0) + 1;
        });
        const categoriasArray = Object.keys(categorias).map(key => ({
          name: key,
          value: categorias[key],
        }));
        setAgrupadosPorCategoria(categoriasArray);

        // Agrupar por mês para tabela
        const meses = {};
        data.forEach(item => {
          const dataObj = new Date(item.data_evento);
          const mes = dataObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
          meses[mes] = (meses[mes] || 0) + 1;
        });
        const mesesArray = Object.keys(meses).map(key => ({
          mes: key,
          qtd: meses[key],
        }));
        setEventosPorMes(mesesArray);
      })
      .catch(err => {
        setMomentos([]);
        console.error('Erro ao buscar momentos:', err);
        setLoading(false);
      });
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9932CC', '#e57c00', '#ff8c00'];

  return (
    <div className="momentos-vivi">
      <h2>✨ Momentos que Vivi</h2>
      {loading ? (
        <p>Carregando seus momentos...</p>
      ) : momentos.length === 0 ? (
        <p>Você ainda não participou de eventos anteriores.</p>
      ) : (
        <>
          {/* Gráfico de Categorias */}
          <div className="chart-box">
            <h3>Eventos por Categoria</h3>
            <PieChart width={320} height={320}>
              <Pie
                data={agrupadosPorCategoria}
                cx="50%"
                cy="50%"
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {agrupadosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* Tabela de eventos por mês */}
          <div className="momentos-tabela-mes">
            <h3>Quantidade de Eventos por Mês</h3>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {eventosPorMes.map((linha, idx) => (
                  <tr key={idx}>
                    <td>{linha.mes}</td>
                    <td>{linha.qtd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Listagem de eventos detalhada */}
          <div className="momentos-lista">
            <h3>Histórico de Eventos</h3>
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Local</th>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {momentos.map((evento, idx) => (
                  <tr key={idx}>
                    <td>{evento.nome_evento}</td>
                    <td>{evento.local_evento}</td>
                    <td>{new Date(evento.data_evento).toLocaleDateString()}</td>
                    <td>{evento.categoria}</td>
                    <td>{evento.valor_pago ? `R$ ${Number(evento.valor_pago).toFixed(2)}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MomentosVivi;
