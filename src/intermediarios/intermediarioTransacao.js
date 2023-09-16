const { indexConta } = require('../funcoes/utilidades')
const { contas } = require('../bancodedados')

const depositoOuSaque = (req, res, next) => {
  const numero_conta = parseInt(req.body.numero_conta)
  const valor = parseInt(req.body.valor)
  const index = indexConta(numero_conta)

  if (!numero_conta || !valor) {
    return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios!' })
  }
  if (index === -1) {
    return res.status(404).json({ mensagem: 'Número da conta é inválido!' })
  }

  next()
}

const transferenciaOuSaldo = (req, res, next) => {
  try {
    let numero_conta = req.body.numero_conta_origem || req.query.numero_conta
    let senha = req.body.senha || req.query.senha

    if (numero_conta === undefined || senha === undefined) {
      return res.status(400).json({ mensagem: 'O número da conta e a senha são obrigatórios' })
    }
    
    numero_conta = parseInt(numero_conta)
    senha = senha.toString().trim()
    const index = indexConta(numero_conta)

    if (index === -1) {
      return res.status(404).json({ mensagem: 'Numero da conta é inválido!' })
    }
    if (senha !== contas[index].usuario.senha) {
      return res.status(401).json({ mensagem: 'Senha inválida!' })
    }

    next()
  } catch (e) {
    res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
  }
}

module.exports = {
  depositoOuSaque,
  transferenciaOuSaldo,
}
