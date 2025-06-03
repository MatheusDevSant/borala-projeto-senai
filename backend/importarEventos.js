// importarEventos.js
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importarEventosExternos() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_borala'
  });

  try {
    const resposta = await axios.get('http://localhost:3001/api/eventos-externos');
    const eventos = resposta.data;

    for (const ev of eventos) {
      const nome_evento = ev.nome;

      if (!nome_evento || nome_evento.trim() === '') {
        console.log('⚠️ Evento ignorado por nome inválido:', nome_evento);
        continue;
      }

      const local = ev.local;
      const data_evento = ev.data;
      const latitude = ev.latitude || null;
      const longitude = ev.longitude || null;
      const preco = 100.00; // Valor fixo por padrão

      // Verifica ou insere local
      let [rowsLocal] = await conn.execute(
        'SELECT id_local_evento FROM local_evento WHERE local_evento = ? LIMIT 1',
        [local]
      );

      let id_local_evento;
      if (rowsLocal.length > 0) {
        id_local_evento = rowsLocal[0].id_local_evento;
      } else {
        const [resultLocal] = await conn.execute(
          'INSERT INTO local_evento (local_evento) VALUES (?)',
          [local]
        );
        id_local_evento = resultLocal.insertId;
      }

      // Checar se já existe evento com mesmo nome, data e local
      const [jaExiste] = await conn.execute(
        `SELECT 1 FROM eventos 
         WHERE nome_evento = ? AND data_evento = ? AND id_local_evento = ? LIMIT 1`,
        [nome_evento, data_evento, id_local_evento]
      );

      if (jaExiste.length > 0) {
        console.log(`🔁 Evento já existe: ${nome_evento}`);
        continue;
      }

      // Valores temporários — ajuste conforme enriquecer os dados
      const id_categoria = 1;
      // Ajuste id_cidade e id_estado conforme necessário (exemplo: 1)
      const id_cidade = 1;
      const id_estado = 1;

      // Inserção
      try {
        await conn.execute(
          `INSERT INTO eventos 
           (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco, latitude, longitude)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nome_evento,
            id_categoria,
            id_local_evento,
            data_evento,
            id_cidade,
            id_estado,
            preco,
            latitude,
            longitude
          ]
        );
        console.log(`✅ Evento inserido: ${nome_evento}`);
      } catch (erroInsert) {
        console.error(`❌ Erro ao inserir evento "${nome_evento}":`, erroInsert.message);
      }
    }
  } catch (erro) {
    console.error('❌ Erro ao buscar eventos da API:', erro.message);
  } finally {
    await conn.end();
  }
}

importarEventosExternos();
