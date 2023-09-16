const verificarConta = (req, res, next) => {
  try {
    const dados = req.body
    const camposObrigatorios = ['nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'senha']

    for (const campo of camposObrigatorios) {
      if (!dados[campo] || dados[campo].trim() === '') {
        return res.status(400).json({mensagem: `${campo.charAt(0).toUpperCase() + campo.slice(1)} não preenchido`})
      }
    }

    next()
  } catch (e) {
    res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
  }
}

module.exports = verificarConta
