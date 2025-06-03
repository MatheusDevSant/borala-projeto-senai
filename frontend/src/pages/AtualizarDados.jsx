import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AtualizarDados.css';

function AtualizarDados() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    senha: ''
  });

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3001/api/usuarios/${usuarioLogado.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setUsuario(data);
        setFormData({
          nome: data.nome,
          email: data.email_outros || data.email_google || '',
          telefone: data.telefone || '',
          endereco: data.endereco || '',
          senha: data.senha || ''
        });
      })
      .catch(err => console.error('Erro ao buscar dados:', err));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    fetch(`http://localhost:3001/api/usuarios/${usuarioLogado.id_usuario}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: formData.nome,
        email_outros: formData.email,
        email_google: formData.email, // envia o mesmo valor para ambos
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.senha
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.mensagem || 'Dados atualizados!');
      navigate('/perfil');
    })
    .catch(err => {
      console.error('Erro:', err);
      alert('Erro ao atualizar dados.');
    });
  };

  if (!usuario) return <p>Carregando...</p>;

  return (
    <div className="atualizar-dados">
      <h2>Atualizar Seus Dados</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome Completo</label>
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Telefone</label>
        <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} />

        <label>Endereço</label>
        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} />

        <label>Senha</label>
        <input type="password" name="senha" value={formData.senha} onChange={handleChange} required />

        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
}

export default AtualizarDados;
