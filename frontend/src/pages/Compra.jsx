import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Compras.css'; // Supondo que este seja o arquivo de estilo correto

function Compra() {
    const { idEvento } = useParams();
    const [evento, setEvento] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Busca os detalhes do evento usando o idEvento da URL
        fetch(`http://localhost:3001/api/eventos/${idEvento}`)
            .then(res => res.json())
            .then(data => setEvento(data))
            .catch(erro => console.error('Erro ao buscar evento:', erro));
    }, [idEvento]);

    if (!evento) return <p>Carregando evento...</p>;

    // O componente Compra.jsx serve como uma página de detalhes do evento,
    // que redireciona para o modal de compra ou reserva.
    return (
        <div className="compra-container">
            <h2>{evento.nome_evento}</h2>
            {/* Certifique-se de que evento.foto_evento existe e que o caminho da imagem está correto */}
            <img src={`http://localhost:3001/imagens/${evento.foto_evento}`} alt={evento.nome_evento} />
            <p><strong>Descrição:</strong> {evento.descricao}</p>
            <p><strong>Data:</strong> {evento.data_evento}</p>
            <p><strong>Local:</strong> {evento.local_evento}</p>
            
            <button onClick={() => navigate(`/compra/detalhe/${idEvento}`)}>Comprar Ingresso</button>
            <button onClick={() => navigate(`/reserva/${idEvento}`)}>Reservar Ingresso</button>
        </div>
    );
}

export default Compra;