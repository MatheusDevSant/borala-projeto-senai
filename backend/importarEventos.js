// importarEventos.js - REESCRITO PARA DEBUG E CORREÇÃO DA CATEGORIA
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importarEventosExternos() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'db_borala'
    });

    try {
        console.log('Iniciando importação de eventos externos...');

        // NOTA: Se 'http://localhost:3001/api/eventos-externos' é um proxy para a Ticketmaster,
        // então a estrutura do JSON 'ev' (evento) virá de lá.
        // Se for a própria API da Ticketmaster direta, ajuste a URL e os parâmetros como discutimos.
        const resposta = await axios.get('http://localhost:3001/api/eventos-externos');
        const eventos = resposta.data; // Assumindo que 'resposta.data' já é o array de eventos

        if (!eventos || eventos.length === 0) {
            console.log('Nenhum evento encontrado na API externa. Encerrando.');
            return;
        }

        console.log(`Recebidos ${eventos.length} eventos para processar.`);

        for (const ev of eventos) {
            console.log('\n--- Processando novo evento ---');
            // Log do evento bruto para inspeção completa
            console.log('DEBUG: Estrutura completa do evento recebido:', JSON.stringify(ev, null, 2));

            const nome_evento = ev.nome;

            if (!nome_evento || nome_evento.trim() === '') {
                console.log('⚠️ Evento ignorado por nome inválido ou vazio:', nome_evento);
                continue;
            }

            const local = ev.local;
            const data_evento = ev.data;
            const latitude = ev.latitude || null;
            const longitude = ev.longitude || null;
            const preco = ev.preco || 100.00; // Preferência por preço do evento se existir, senão padrão

            // --- Lógica para CATEGORIA ---
            let categoria_nome_raw = 'Indefinido'; // Valor inicial para debug

            // Tente pegar a categoria de diferentes lugares na estrutura do evento 'ev'
            // A ordem aqui é importante - a primeira que encontrar será usada
            if (ev.categoria) {
                categoria_nome_raw = ev.categoria;
            } else if (ev.classifications && ev.classifications[0] && ev.classifications[0].segment && ev.classifications[0].segment.name) {
                categoria_nome_raw = ev.classifications[0].segment.name;
            } else if (ev.segment) {
                categoria_nome_raw = ev.segment;
            } else if (ev.tipo) {
                categoria_nome_raw = ev.tipo;
            } else {
                categoria_nome_raw = 'Outros'; // Fallback final se nada for encontrado
            }

            console.log(`DEBUG: Categoria bruta identificada para "${nome_evento}": "${categoria_nome_raw}"`);

            // Tradução e mapeamento para categorias do seu DB
            let categoria_nome_final = categoria_nome_raw; // Começa com o valor bruto
            switch (categoria_nome_raw.toLowerCase()) {
                case 'sports':
                case 'esporte':
                    categoria_nome_final = 'Esporte';
                    break;
                case 'music':
                case 'shows':
                case 'música':
                    categoria_nome_final = 'Música';
                    break;
                case 'workshop':
                case 'oficina':
                    categoria_nome_final = 'Oficina';
                    break;
                case 'lecture':
                case 'palestra':
                    categoria_nome_final = 'Palestra';
                    break;
                case 'cinema':
                    categoria_nome_final = 'Cinema';
                    break;
                case 'teatro':
                    categoria_nome_final = 'Teatro';
                    break;
                case 'other':
                case 'outros':
                default: // Qualquer coisa que não encaixe em cima
                    categoria_nome_final = 'Outros';
                    break;
            }

            console.log(`DEBUG: Categoria mapeada para o DB para "${nome_evento}": "${categoria_nome_final}"`);

            // Busca ou cria o ID da categoria no seu banco de dados
            let id_categoria;
            let [rowsCategoria] = await conn.execute(
                'SELECT id_categoria FROM categorias WHERE categoria = ? LIMIT 1',
                [categoria_nome_final]
            );

            if (rowsCategoria.length > 0) {
                id_categoria = rowsCategoria[0].id_categoria;
                console.log(`DEBUG: Categoria "${categoria_nome_final}" encontrada no DB com ID: ${id_categoria}`);
            } else {
                // Se a categoria mapeada não existir, insere-a
                const [resultCategoria] = await conn.execute(
                    'INSERT INTO categorias (categoria) VALUES (?)',
                    [categoria_nome_final]
                );
                id_categoria = resultCategoria.insertId;
                console.log(`🆕 Categoria "${categoria_nome_final}" criada no DB com ID: ${id_categoria}`);
            }

            // --- Lógica para LOCAL DO EVENTO ---
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
            console.log(`DEBUG: Local "${local}" mapeado para ID: ${id_local_evento}`);


            // --- Lógica para ESTADO e CIDADE ---
            let id_estado_final = null;
            let id_cidade_final = null;
            let uf_estado_raw = ev.estado || null; // Supondo que 'ev.estado' traga a UF (ex: SP, RJ)
            let nome_cidade_raw = ev.cidade || null; // Supondo que 'ev.cidade' traga o nome da cidade

            // Se estado e cidade foram fornecidos na API
            if (uf_estado_raw && nome_cidade_raw) {
                // 1. Busca ou cria o estado
                let [estadoRows] = await conn.execute(
                    'SELECT id_estado FROM uf_estados WHERE UF_estado = ? LIMIT 1',
                    [uf_estado_raw]
                );
                if (estadoRows.length > 0) {
                    id_estado_final = estadoRows[0].id_estado;
                    console.log(`DEBUG: Estado "${uf_estado_raw}" encontrado com ID: ${id_estado_final}`);
                } else {
                    // Cria novo estado (pegando o próximo ID ou usando a lógica de ON DUPLICATE KEY UPDATE se preferir)
                    // NOTA: Para IDs fixos e auto-incrementais não gerados pelo DB, MAX(id) + 1 é arriscado em ambiente multi-threaded.
                    // Para estados, o ideal é ter os IDs pré-populados ou usar ON DUPLICATE KEY UPDATE.
                    // Mantendo sua lógica original de buscar o MAX ID e inserir
                    const [maxEstado] = await conn.execute('SELECT MAX(id_estado) as maxId FROM uf_estados');
                    const novo_id_estado = (maxEstado[0].maxId || 27) + 1; // 27 é o último ID padrão que você tem
                    await conn.execute(
                        'INSERT INTO uf_estados (id_estado, UF_estado, Estado) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Estado=VALUES(Estado)',
                        [novo_id_estado, uf_estado_raw, uf_estado_raw]
                    );
                    id_estado_final = novo_id_estado;
                    console.log(`🆕 Estado "${uf_estado_raw}" criado com ID: ${id_estado_final}`);
                }

                // 2. Busca ou cria a cidade
                let [cidadeRows] = await conn.execute(
                    'SELECT id_cidade FROM cidades WHERE LOWER(cidade) = LOWER(?) AND id_estado = ? LIMIT 1',
                    [nome_cidade_raw, id_estado_final]
                );
                if (cidadeRows.length > 0) {
                    id_cidade_final = cidadeRows[0].id_cidade;
                    console.log(`DEBUG: Cidade "${nome_cidade_raw}" encontrada com ID: ${id_cidade_final}`);
                } else {
                    const [maxCidade] = await conn.execute('SELECT MAX(id_cidade) as maxId FROM cidades');
                    const novo_id_cidade = (maxCidade[0].maxId || 100) + 1; // 100 é um valor de fallback
                    await conn.execute(
                        'INSERT INTO cidades (id_cidade, id_estado, cidade) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cidade=VALUES(cidade)',
                        [novo_id_cidade, id_estado_final, nome_cidade_raw]
                    );
                    id_cidade_final = novo_id_cidade;
                    console.log(`🆕 Cidade "${nome_cidade_raw}" criada com ID: ${id_cidade_final}`);
                }
            } else {
                console.log('DEBUG: Não foi possível determinar cidade/estado do evento. Usando defaults.');
                // Se não houver cidade/estado na API, você pode usar um ID padrão ou ignorar a inserção se for NOT NULL
                id_estado_final = (await conn.execute('SELECT id_estado FROM uf_estados WHERE UF_estado = "SP" LIMIT 1'))[0][0]?.id_estado || 25; // Default para SP
                id_cidade_final = (await conn.execute('SELECT id_cidade FROM cidades WHERE cidade = "São Paulo" AND id_estado = ? LIMIT 1', [id_estado_final]))[0][0]?.id_cidade || 39; // Default para São Paulo
            }


            // Checar se já existe evento com nome, data e local para evitar duplicatas
            const [jaExiste] = await conn.execute(
                `SELECT 1 FROM eventos
                 WHERE nome_evento = ? AND data_evento = ? AND id_local_evento = ? LIMIT 1`,
                [nome_evento, data_evento, id_local_evento]
            );

            if (jaExiste.length > 0) {
                console.log(`🔁 Evento já existe no DB, ignorando: "${nome_evento}"`);
                continue;
            }

            // Inserção final do evento no banco de dados
            try {
                await conn.execute(
                    `INSERT INTO eventos
                     (nome_evento, id_categoria, id_local_evento, data_evento, id_cidade, id_estado, preco, latitude, longitude)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        nome_evento,
                        id_categoria, // ID da categoria que foi buscado/criado
                        id_local_evento,
                        data_evento,
                        id_cidade_final,
                        id_estado_final,
                        preco,
                        latitude,
                        longitude
                    ]
                );
                console.log(`✅ Evento inserido com sucesso: "${nome_evento}" (Categoria: ${categoria_nome_final} - ID: ${id_categoria})`);
            } catch (erroInsert) {
                console.error(`❌ ERRO FATAL ao inserir evento "${nome_evento}":`, erroInsert.message);
                console.error('Dados do evento que causaram o erro:', {
                    nome_evento,
                    id_categoria,
                    id_local_evento,
                    data_evento,
                    id_cidade_final,
                    id_estado_final,
                    preco,
                    latitude,
                    longitude
                });
            }
        }
        console.log('\n--- Importação de eventos externos concluída ---');
    } catch (erro) {
        console.error('❌ ERRO GERAL na importação de eventos:', erro.message);
        if (erro.response) {
            console.error('Detalhes da resposta da API externa (se houver):', erro.response.data);
            console.error('Status da resposta da API externa:', erro.response.status);
        }
    } finally {
        await conn.end();
        console.log('Conexão com o banco de dados fechada.');
    }
}

// Inicia o processo de importação
importarEventosExternos();