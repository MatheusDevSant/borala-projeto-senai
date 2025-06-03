// configuracoes/banco.js

const mysql = require('mysql2');

const conexao = mysql.createPool({
    host: process.env.DB_HOST,    // endereço do banco
    user: process.env.DB_USER,    // usuário do banco
    password: process.env.DB_PASS, // senha do banco
    database: process.env.DB_NAME // nome do banco
});

module.exports = conexao;
