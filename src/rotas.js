const express = require('express')
const rotas = express.Router()

const conta= require('./controladores/controladorConta')
const transacao = require('./controladores/controladorTransacao')
const verificarConta = require('./intermediarios/intermediarioConta')
const { depositoOuSaque, transferenciaOuSaldo } = require('./intermediarios/intermediarioTransacao')

rotas.get('/contas', conta.todasAsContas)
rotas.post('/contas', verificarConta, conta.criarConta)
rotas.put('/contas/:numeroConta/usuario', verificarConta, conta.atualizarConta)
rotas.delete('/contas/:numeroConta', conta.excluirConta)
rotas.get('/contas/saldo', transferenciaOuSaldo, conta.saldo)
rotas.get('/contas/extrato', conta.extrato)

rotas.post('/transacoes/depositar', depositoOuSaque, transacao.depositar)
rotas.post('/transacoes/sacar', depositoOuSaque, transacao.sacar)
rotas.post('/transacoes/transferir', transferenciaOuSaldo, transacao.transferir)

module.exports = rotas