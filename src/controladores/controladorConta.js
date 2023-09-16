const bancodedados = require('../bancodedados')
const { contas, saques, depositos, transferencias } = bancodedados
const { indexConta, gravarDados } = require('../funcoes/utilidades')

const conta = {
  todasAsContas: (req, res) => {
    const { senha_banco } = req.query

    try {
      if (!senha_banco) {
        return res.status(400).json({ mensagem: 'Informe a senha!' })
      }
      if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ mensagem: 'A senha informada é inválida!' })
      }

      res.json(contas)
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },

  criarConta: async (req, res) => {
    const dados = req.body

    try {
      const contaCPF = contas.find((conta) => conta.usuario.cpf === dados.cpf)
      const contaEmail = contas.find((conta) => conta.usuario.email === dados.email)

      if (contaCPF) {
        return res.status(422).json({ mensagem: 'CPF já cadastrado' })
      }
      if (contaEmail) {
        return res.status(422).json({ mensagem: 'E-mail já cadastrado!' })
      }

      const numero = contas.reduce((id, conta) => {
        return Math.max(id, conta.numero) + 1
      }, 1)

      const novaConta = {
        numero,
        saldo: 0,
        usuario: {
          ...dados,
        },
      }

      await gravarDados('contas', null, novaConta)
      res.status(201).send()
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },

  atualizarConta: async (req, res) => {
    const dados = req.body
    const numeroConta = parseInt(req.params.numeroConta)
    const contaAtual = contas[indexConta(numeroConta)]

    try {
      const contaCPF = contas.find((conta) => conta.usuario.cpf === dados.cpf)
      const contaEmail = contas.find((conta) => conta.usuario.email === dados.email)

      if (!contaAtual) {
        return res.status(404).json({ mensagem: 'Número da conta é inválido!' })
      }
      if (contaCPF && contaCPF.numero !== contaAtual.numero) {
        return res.status(422).json({ mensagem: 'O CPF informado já existe em outro cadastro!' })
      }
      if (contaEmail && contaEmail.numero !== contaAtual.numero) {
        return res.status(422).json({ mensagem: 'O email informado já existe em outro cadastro' })
      }

      await gravarDados('atualizar', indexConta(numeroConta), dados)
      res.status(204).send()
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },

  excluirConta: async (req, res) => {
    const numeroConta = parseInt(req.params.numeroConta)
    const conta = contas.find((conta) => conta.numero === numeroConta)

    try {
      if (!conta) {
        return res.status(404).json({ mensagem: 'Número da conta é inválido!' })
      }
      if (conta.saldo !== 0) {
        return res
          .status(403)
          .json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' })
      }
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }

    await gravarDados('excluir', indexConta(numeroConta))
    res.status(204).send()
  },

  saldo: (req, res) => {
    try {
      const numero_conta = parseInt(req.query.numero_conta)
      const saldo = contas[indexConta(numero_conta)].saldo

      res.status(200).json({ saldo })
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },

  extrato: (req, res) => {
    try {
      const numero_conta = parseInt(req.query.numero_conta)
      const senha = req.query.senha
      const index = indexConta(numero_conta)

      if (!numero_conta) {
        return res.status(400).json({ mensagem: 'Informe a conta bancária!' })
      }
      if (index === -1) {
        return res.status(404).json({ mensagem: 'Conta bancária não encontada!' })
      }
      if (!senha.trim()) {
        return res.status(400).json({ mensagem: 'Informe a senha!' })
      }
      if (senha !== contas[index].usuario.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' })
      }

      const deposito = saques
        ? depositos.filter((deposito) => deposito.numero === numero_conta)
        : []
      const saque = saques ? saques.filter((saque) => saque.numero === numero_conta) : []
      const enviadas = transferencias.filter(
        (enviado) => enviado.numero_conta_origem === numero_conta
      )
      const recebidas = transferencias.filter(
        (enviado) => enviado.numero_conta_destino === numero_conta
      )
      if (
        Object.keys(deposito).length === 0 &&
        Object.keys(saque).length === 0 &&
        Object.keys(enviadas).length === 0 &&
        Object.keys(recebidas).length === 0
      ) {
        return res.status(404).json({ mensagem: 'Nenhuma operação realizada!' })
      }

      const dados = {
        saque: saque.length > 0 ? saque : undefined,
        deposito: deposito.length > 0 ? deposito : undefined,
        transferenciasEnviadas: enviadas.length > 0 ? enviadas : undefined,
        transferenciasRecebidas: recebidas.length > 0 ? recebidas : undefined,
      }

      res.status(200).json(dados)
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },
}

module.exports = conta
