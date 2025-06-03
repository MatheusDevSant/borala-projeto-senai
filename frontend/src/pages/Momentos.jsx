import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../styles/Momentos.css';

function MomentosVivi() {
  const [momentos, setMomentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agrupadosPorCategoria, setAgrupadosPorCategoria] = useState([]);
  const [agrupadosPorMes, setAgrupadosPorMes] = useState([]);

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      alert('Você precisa estar logado para ver seus momentos.');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/vendas/usuario/${usuarioLogado.id_usuario}/momentos`)
      .then(res => res.json())
      .then(data => {
        setMomentos(data);
        setLoading(false);

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

        // Agrupar por mês para gráfico de barras
        const meses = {};
        data.forEach(item => {
          const mes = new Date(item.data_evento).toLocaleString('pt-BR', { month: 'short' });
          meses[mes] = (meses[mes] || 0) + 1;
        });
        const mesesArray = Object.keys(meses).map(key => ({
          name: key,
          qtd: meses[key],
        }));
        setAgrupadosPorMes(mesesArray);
      })
      .catch(err => {
        console.error('Erro ao buscar momentos:', err);
        setLoading(false);
      });
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9932CC'];

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
            <PieChart width={300} height={300}>
              <Pie
                data={agrupadosPorCategoria}
                cx="50%"
                cy="50%"
                outerRadius={100}
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

          {/* Gráfico de Meses */}
          <div className="chart-box">
            <h3>Eventos por Mês</h3>
            <BarChart width={350} height={300} data={agrupadosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qtd" fill="#ff8c00" />
            </BarChart>
          </div>

          {/* Listagem de eventos */}
          <div className="momentos-lista">
            <h3>Histórico de Eventos</h3>
            {momentos.map((evento) => (
              <div key={evento.id_venda} className="momento-card">
                <h4>{evento.nome_evento}</h4>
                <p><strong>Local:</strong> {evento.local_evento}</p>
                <p><strong>Data:</strong> {new Date(evento.data_evento).toLocaleDateString()}</p>
                <p><strong>Categoria:</strong> {evento.categoria}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MomentosVivi;
