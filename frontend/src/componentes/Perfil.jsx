import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Perfil.css';
import fotoUsuario from '../images/perfil.png';

function Perfil({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (!isOpen) return; // só busca quando abre

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado) {
      console.log('Nenhum usuário logado');
      setUsuario(null);
      return;
    }

    fetch(`http://localhost:3001/api/usuarios/${usuarioLogado.id_usuario}`)
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(err => console.error('Erro ao buscar usuário:', err));
  }, [isOpen]); // refetch quando abrir

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    setUsuario(null); // <-- Limpa o estado do usuário para sumir os dados imediatamente
    navigate('/');    // Redireciona para home
};

  const handleAtualizarDados = () => {
    navigate('/atualizar-dados');
    onClose();
  };

  const handleVerIngressos = () => {
    navigate('/meus-ingressos');
    onClose();
  };

  const handleMomentos = () => {
    navigate('/momentos');
    onClose();
  };

  if (!isOpen) return null; // não renderiza se não está aberto

  return (
    <div className={`perfil-lateral perfil-slide open`}>
      <button className="modal-close" onClick={onClose}>X</button>
      {usuario ? (
        <>
          <img
            src={usuario.foto_usuario ? `/images/${usuario.foto_usuario}` : fotoUsuario}
            alt="Foto de perfil"
            className="foto-perfil"
          />
          <h2>Bem-vindo, {usuario.nome}!</h2>

          <div className="perfil-dados">
            <h3>🗂️Seus Dados</h3>
            <p><strong>Nome completo:</strong> {usuario.nome}</p>
            <p><strong>Email:</strong> {usuario.email_outros || usuario.email_google}</p>
            <p><strong>Telefone:</strong> {usuario.telefone}</p>
            <p><strong>Endereço:</strong> {usuario.endereco}</p>
            <button onClick={handleAtualizarDados}>Atualizar Dados</button>
          </div>

          <div className="perfil-box">
            <h3>🎟️Seus rolês estão aqui</h3>
            <p>Acesse seus ingressos e fique por dentro dos próximos eventos!</p>
            <button onClick={handleVerIngressos}>Ver Ingressos</button>
          </div>

          <div className="perfil-box">
            <h3>✨ Vem conferir as experiências que você viveu com a gente!</h3>
            <button onClick={handleMomentos}>Momentos que Vivi</button>
          </div>

          <button className="sair-btn" onClick={handleLogout}>Sair</button>
        </>
      ) : (
        <div className="perfil-nao-logado">
          <h2>Você não está logado!</h2>
          <p>Volte para a <a href="/">página inicial</a> ou faça login novamente!</p>
        </div>
      )}
    </div>
  );
}

export default Perfil;
