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
  const [fotoPreview, setFotoPreview] = useState(null); // Para mostrar preview

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
        // Ajuste aqui: sempre prefixe com o backend se não for URL absoluta
        if (data.foto_usuario) {
          setFotoPreview(
            data.foto_usuario.startsWith('http')
              ? data.foto_usuario
              : `http://localhost:3001${data.foto_usuario}`
          );
        } else {
          setFotoPreview(null);
        }
      })
      .catch(err => console.error('Erro ao buscar dados:', err));
  }, [navigate]);

  // Novo: upload da foto ao selecionar arquivo
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFotoPreview(URL.createObjectURL(file));

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado || !usuarioLogado.id_usuario) {
      alert('Usuário não identificado. Faça login novamente.');
      setFotoPreview(null);
      navigate('/');
      return;
    }
    const formDataFoto = new FormData();
    formDataFoto.append('foto', file);
    formDataFoto.append('id_usuario', usuarioLogado.id_usuario);

    try {
      const resp = await fetch('http://localhost:3001/api/upload-foto', {
        method: 'POST',
        body: formDataFoto
      });
      const data = await resp.json();
      // CORREÇÃO: só mostra erro se resp.ok for false
      if (resp.ok && data.caminho) {
        setFotoPreview(`http://localhost:3001${data.caminho}`);
        const usuarioAtualizado = { ...usuarioLogado, foto_usuario: data.caminho };
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
      } else if (!resp.ok) {
        alert(data.erro || 'Erro ao enviar foto');
      }
      // Se resp.ok for true mas não tem caminho, não mostra erro
    } catch (err) {
      alert('Erro ao enviar foto');
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Garante que só envie o caminho relativo da foto
    let fotoParaSalvar = null;
    if (fotoPreview) {
      // Se for um blob local, não envie nada
      if (fotoPreview.startsWith('blob:')) {
        fotoParaSalvar = usuario?.foto_usuario || null;
      } else if (fotoPreview.startsWith('http://localhost:3001/')) {
        fotoParaSalvar = fotoPreview.replace('http://localhost:3001', '');
      } else if (fotoPreview.startsWith('/images/')) {
        fotoParaSalvar = fotoPreview;
      } else {
        fotoParaSalvar = null;
      }
    }

    fetch(`http://localhost:3001/api/usuarios/${usuarioLogado.id_usuario}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: formData.nome,
        email_outros: formData.email,
        email_google: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.senha,
        foto_usuario: fotoParaSalvar
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
        <label>Foto de Perfil</label>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              marginBottom: 10,
              border: '3px solid #ff8c00',
              background: '#fafafa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#ccc' }}>Sem foto</span>
            )}
          </div>
          <input
            id="foto-perfil-input"
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            style={{
              background: '#ff8c00',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em',
              marginTop: 5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
            onClick={() => document.getElementById('foto-perfil-input').click()}
          >
            Alterar foto
          </button>
        </div>

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
