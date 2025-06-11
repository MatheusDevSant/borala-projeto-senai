import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [ingressos, setIngressos] = useState([]);
  const [totais, setTotais] = useState({
    usuarios: 0,
    eventos: 0,
    vendas: 0,
    reservas: 0
  });
  const [vendasPorCategoria, setVendasPorCategoria] = useState([]);
  const [vendasPorMes, setVendasPorMes] = useState([]);
  const [vendasPorForma, setVendasPorForma] = useState([]);
  const [ultimosUsuarios, setUltimosUsuarios] = useState([]);
  const [ultimosEventos, setUltimosEventos] = useState([]);
  const [ultimasVendas, setUltimasVendas] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);

  // Buscar categorias para o filtro
  useEffect(() => {
    fetch('http://localhost:3001/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []));
  }, []);

  // Função para buscar dados com filtro
  function buscarDados() {
    const params = [];
    if (categoriaFiltro) params.push(`categoria=${categoriaFiltro}`);
    if (statusFiltro) params.push(`status=${statusFiltro}`);
    const query = params.length ? `?${params.join('&')}` : '';

    fetch(`http://localhost:3001/api/admin/vendas-por-categoria${query}`)
      .then(res => res.json())
      .then(data => setVendasPorCategoria(Array.isArray(data) ? data : []));

    fetch(`http://localhost:3001/api/admin/vendas-por-mes${query}`)
      .then(res => res.json())
      .then(data => setVendasPorMes(Array.isArray(data) ? data : []));

    fetch(`http://localhost:3001/api/admin/vendas-por-forma${query}`)
      .then(res => res.json())
      .then(data => setVendasPorForma(Array.isArray(data) ? data : []));

    // Buscar valor total vendido
    fetch(`http://localhost:3001/api/admin/valor-total${query}`)
      .then(res => res.json())
      .then(data => setValorTotal(data.valor || 0));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    buscarDados();

    fetch('http://localhost:3001/api/ingressos/admin')
      .then(res => res.json())
      .then(data => {
        console.log('Ingressos:', data);
        if (Array.isArray(data)) {
          setIngressos(data);
        } else {
          setIngressos([]);
          console.error('Resposta inesperada para ingressos:', data);
        }
      });

    fetch('http://localhost:3001/api/admin/resumo')
      .then(res => res.json())
      .then(data => {
        console.log('Totais:', data); // Adicione este log
        setTotais(data);
      });

    fetch('http://localhost:3001/api/admin/ultimos-usuarios')
      .then(res => res.json())
      .then(data => setUltimosUsuarios(Array.isArray(data) ? data : []));

    fetch('http://localhost:3001/api/admin/ultimos-eventos')
      .then(res => res.json())
      .then(data => setUltimosEventos(Array.isArray(data) ? data : []));

    fetch('http://localhost:3001/api/admin/ultimas-vendas')
      .then(res => res.json())
      .then(data => setUltimasVendas(Array.isArray(data) ? data : []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const COLORS = ['#d35400', '#FFBB28', '#FF8042', '#ff8c00', '#9932CC', '#0088FE', '#00C49F'];

  return (
    <div className="admin-dashboard">
      <h2 style={{ marginBottom: 24 }}>Dashboard Administrativo</h2>
      <div className="admin-cards">
        <div className="admin-card">
          <h3>Usuários</h3>
          <p>{totais.usuarios}</p>
        </div>
        <div className="admin-card">
          <h3>Eventos</h3>
          <p>{totais.eventos}</p>
        </div>
        <div className="admin-card">
          <h3>Vendas</h3>
          <p>{totais.vendas}</p>
        </div>
        <div className="admin-card">
          <h3>Reservas</h3>
          <p>{totais.reservas}</p>
        </div>
        <div className="admin-card">
          <h3>Valor Total Vendido</h3>
          <p>R$ {Number(valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="admin-filtros">
        <label>
          Categoria:
          <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
            <option value="">Todas</option>
            {categorias.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>{cat.categoria}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 16 }}>
          Status:
          <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
            <option value="">Todos</option>
            <option value="1">Reservado</option>
            <option value="2">Pago</option>
            <option value="3">Cancelado</option>
          </select>
        </label>
        <button style={{ marginLeft: 16 }} onClick={buscarDados}>Filtrar</button>
      </div>

      {/* Gráficos */}
      <div className="admin-graficos">
        <div className="admin-grafico-card">
          <h4>Vendas por Categoria</h4>
          {vendasPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vendasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#d35400" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-grafico-vazio">Sem dados</div>
          )}
        </div>
        <div className="admin-grafico-card">
          <h4>Vendas por Mês</h4>
          {vendasPorMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#d35400" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-grafico-vazio">Sem dados</div>
          )}
        </div>
        <div className="admin-grafico-card">
          <h4>Vendas por Forma de Pagamento</h4>
          {vendasPorForma.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={vendasPorForma}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#d35400"
                  dataKey="total"
                  nameKey="forma"
                  label
                >
                  {vendasPorForma.map((entry, index) => (
                    <Cell key={`cell-forma-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-grafico-vazio">Sem dados</div>
          )}
        </div>
      </div>

      {/* Tabela de ingressos */}
      <div className="admin-tabela-box">
        <h3>Ingressos</h3>
        <div className="admin-tabela-scroll">
          <table>
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
          </table>
        </div>
      </div>

      {/* Últimos usuários */}
      <div className="admin-tabela-box">
        <h3>Últimos Usuários Cadastrados</h3>
        <div className="admin-tabela-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {ultimosUsuarios.map(usuario => (
                <tr key={usuario.id_usuario}>
                  <td>{usuario.id_usuario}</td>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email_outros || usuario.email_google}</td>
                  <td>{usuario.telefone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimos eventos */}
      <div className="admin-tabela-box">
        <h3>Últimos Eventos Cadastrados</h3>
        <div className="admin-tabela-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {ultimosEventos.map(evento => (
                <tr key={evento.id_evento}>
                  <td>{evento.id_evento}</td>
                  <td>{evento.nome_evento}</td>
                  <td>{evento.categoria}</td>
                  <td>{new Date(evento.data_evento).toLocaleDateString()}</td>
                  <td>{evento.local_evento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="admin-tabela-box">
        <h3>Últimas Vendas Realizadas</h3>
        <div className="admin-tabela-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Evento</th>
                <th>Data</th>
                <th>Status</th>
                <th>Pagamento</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVendas.map(venda => (
                <tr key={venda.id_venda}>
                  <td>{venda.id_venda}</td>
                  <td>{venda.usuario}</td>
                  <td>{venda.nome_evento}</td>
                  <td>{venda.data_compra_bilhete ? new Date(venda.data_compra_bilhete).toLocaleDateString() : '-'}</td>
                  <td>{venda.status}</td>
                  <td>{venda.forma || '-'}</td>
                  <td>R$ {Number(venda.preco_pago).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; // AdminDashboard.jsx