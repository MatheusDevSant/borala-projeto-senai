const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const conexao = require('../configuracoes/banco');

// Configuração do multer para salvar na pasta public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    // Nome do arquivo: usuario-<id>-timestamp.ext
    const ext = path.extname(file.originalname);
    const nome = `usuario-${req.body.id_usuario}-${Date.now()}${ext}`;
    cb(null, nome);
  }
});
const upload = multer({ storage });

// Rota para upload da foto de perfil
router.post('/', upload.single('foto'), (req, res) => {
  const id_usuario = req.body.id_usuario;
  if (!req.file || !id_usuario) {
    return res.status(400).json({ erro: 'Arquivo ou id_usuario não enviado.' });
  }

  // Caminho relativo para acessar a imagem pelo frontend
  const caminho = `/images/${req.file.filename}`;

  // Atualiza o campo foto_usuario no banco de dados
  conexao.query(
    'UPDATE usuarios SET foto_usuario = ? WHERE id_usuario = ?',
    [caminho, id_usuario],
    (erro) => {
      if (erro) {
        console.error('Erro ao atualizar foto_usuario:', erro);
        return res.status(500).json({ erro: 'Erro ao atualizar foto do usuário.' });
      }
      res.json({ mensagem: 'Foto enviada com sucesso!', caminho });
    }
  );
});

module.exports = router;
