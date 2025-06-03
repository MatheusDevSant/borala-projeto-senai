// servidor.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const conexao = require('./configuracoes/banco');

// Cria a aplicação Express
const app = express();

// Teste de conexão com o banco de dados
conexao.query('SELECT 1', (erro) => {
    if (erro) {
        console.error('❌ Erro ao conectar com o banco de dados:', erro);
    } else {
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    }
});

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000' // libera apenas para o React em dev
}));
app.use(express.json());

// Rotas
const ApiEventosRotas = require('./rotas/ApiEventosRotas');
app.use('/api/eventos-externos', ApiEventosRotas);

const usuariosRota = require('./rotas/usuariosRota');
app.use('/api/usuarios', usuariosRota);

const loginRota = require('./rotas/loginRota');
app.use('/api/usuarios/login', loginRota); // ✅ alterado para bater com o front

const comprasRota = require('./rotas/comprasRota');
app.use('/api/compras', comprasRota);

const eventosRota = require('./rotas/eventosRota');
app.use('/api/eventos', eventosRota);

const formasPagamentoRota = require('./rotas/formasPagamentoRota');
app.use('/api/formas-pagamento', formasPagamentoRota);

const ingressosRota = require('./rotas/ingressosRota');
app.use('/api/ingressos', ingressosRota);

const vendasRota = require('./rotas/vendasRota');
app.use('/api/vendas', vendasRota);

// Cria a aba de momentos
const momentosRota = require('./rotas/momentosRota');
app.use('/api/momentos', momentosRota);

const eventosExternosRota = require('./rotas/eventosExternosRota');
app.use('/api/eventos-externos', eventosExternosRota);

// Porta
const PORTA = process.env.PORTA || 3001;
app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));
