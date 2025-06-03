const bcrypt = require('bcrypt');

async function gerarSenha() {
  const senhaCriptografada = await bcrypt.hash('minhaSenha123', 10);
  console.log('Senha criptografada:', senhaCriptografada);
}

gerarSenha();
