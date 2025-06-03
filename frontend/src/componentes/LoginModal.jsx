import React, { useState } from 'react';
import '../styles/LoginModal.css';

function LoginModal({ isOpen, onClose }) {
  // Estados do cadastro
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [cpfCadastro, setCpfCadastro] = useState('');
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [telefoneCadastro, setTelefoneCadastro] = useState('');
  const [enderecoCadastro, setEnderecoCadastro] = useState('');

  // Estados do login
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailLogin,
          senha: senhaLogin,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Bem-vindo, ${data.nome}!`);
        localStorage.setItem('usuarioLogado', JSON.stringify(data)); // Salva no localStorage
        onClose();
      } else {
        const data = await response.json();
        alert('Erro: ' + data.erro);
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      alert('Erro ao conectar com o servidor.');
    }
  };

  // Função de cadastro
  const handleCadastro = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/usuarios/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCadastro,
          cpf: cpfCadastro,
          email_outros: emailCadastro,
          telefone: telefoneCadastro,
          endereco: enderecoCadastro,
          id_cidade: 1,
          id_estado: 1,
          senha: senhaCadastro
        })
      });

      if (response.ok) {
        alert('Usuário cadastrado com sucesso!');
        onClose();
        // Limpar os campos do cadastro
        setNomeCadastro('');
        setCpfCadastro('');
        setTelefoneCadastro('');
        setEnderecoCadastro('');
        setEmailCadastro('');
        setSenhaCadastro('');
      } else {
        const data = await response.json();
        alert('Erro: ' + data.erro);
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      alert('Erro ao conectar com o servidor');
    }
  };

  // Evita renderizar se o modal não está aberto
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        
        <h2>Bem-vindo!</h2>

        {/* Seção de Login */}
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={emailLogin}
            onChange={(e) => setEmailLogin(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={senhaLogin}
            onChange={(e) => setSenhaLogin(e.target.value)}
            required
          />
          <div className="form-links">
            <p href="#">Esqueci minha senha</p>
            <button type="submit" className="login-btn">Acessar</button>
          </div>
        </form>

        {/* Seção de Cadastro */}
        <h3>Cadastre-se</h3>
        <input 
          type="text" 
          placeholder="Nome completo" 
          value={nomeCadastro}
          onChange={(e) => setNomeCadastro(e.target.value)}
          required
        />
        <input 
          type="text" 
          placeholder="CPF" 
          value={cpfCadastro}
          onChange={(e) => setCpfCadastro(e.target.value)}
          required
        />
        <input 
          type="text" 
          placeholder="Telefone" 
          value={telefoneCadastro}
          onChange={(e) => setTelefoneCadastro(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Endereço" 
          value={enderecoCadastro}
          onChange={(e) => setEnderecoCadastro(e.target.value)}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={emailCadastro}
          onChange={(e) => setEmailCadastro(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senhaCadastro}
          onChange={(e) => setSenhaCadastro(e.target.value)}
          required
        />
        <button className="google-btn" onClick={handleCadastro}>Cadastrar</button>
        <hr />
      </div>
    </div>
  );
}

export default LoginModal;
