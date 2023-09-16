const bancodedados = require('../bancodedados')
const { contas } = bancodedados
const { indexConta, gravarDados } = require('../funcoes/utilidades')

const transacao = {
  depositar: async (req, res) => {
    try {
      const numero_conta = parseInt(req.body.numero_conta)
      const valor = parseInt(req.body.valor)
      const index = indexConta(numero_conta)

      if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor não pode ser menor ou igual a zero!' })
      }

      await gravarDados('depositar', index, valor)
      res.status(204).send()
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },

  sacar: async (req, res) => {
    try {
      const numero_conta = parseInt(req.body.numero_conta)
      const valor = parseInt(req.body.valor)
      const index = indexConta(numero_conta)
      const saldo = contas[index].saldo
      let senha = ''
      const senhaDaConta = contas[index].usuario.senha

      if (req.body.senha !== undefined) {
        senha = req.body.senha.toString()
      }
      if (senha.trim() === '') {
        return res.status(400).json({ mensagem: 'Informe a senha' })
      }
      if (senha !== senhaDaConta) {
        return res.status(401).json({ mensagem: 'Senha inválida!' })
      }
      if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor não pode ser menor ou igual a zero!' })
      }
      if (saldo - valor < 0) {
        return res.status(403).json({
          mensagem: `O valor da conta não pode ser menor que zero! Valor disponível: ${saldo}`,
        })
      }

      await gravarDados('sacar', index, valor)
      res.status(204).send()
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },

  transferir: async (req, res) => {
    try {
      const numero_conta_origem = parseInt(req.body.numero_conta_origem)
      const numero_conta_destino = parseInt(req.body.numero_conta_destino)
      const valor = parseInt(req.body.valor)

      const indexOrigem = indexConta(numero_conta_origem)
      const indexDestino = indexConta(numero_conta_destino)
      const saldoConta = contas[indexOrigem].saldo

      if (indexDestino === -1) {
        return res.status(404).json({ mensagem: 'Numero da conta de destino é inválido!' })
      }
      if (!valor) {
        return res.status(400).json({ mensagem: 'O valor não pode ser menor ou igual a zero!' })
      }
      if (!saldoConta || saldoConta - valor < 0) {
        return res.status(403).json({ mensagem: 'Saldo insuficiente!' })
      }

      await gravarDados('transferir', { indexOrigem, indexDestino }, valor)
      res.status(204).send()
    } catch (e) {
      res.status(500).json({ mensagem: `Erro do servidor: ${e.message}` })
    }
  },
}

module.exports = transacao
