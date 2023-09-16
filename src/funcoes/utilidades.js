const bancodedados = require('../bancodedados')
const { format } = require('date-fns')
const fsPromises = require('fs/promises')

function indexConta(valor) {
  return bancodedados.contas.findIndex((conta) => conta.numero === valor)
}

function registrarDepositoOuSaque(campo, numero, valor) {
  const data = new Date()

  try {
    campo.push({
      data: format(data, 'dd-MM-yyyy HH:mm:ss'),
      numero,
      valor,
    })
  } catch (e) {
    throw e
  }
}

async function gravarDados(operacao, index, dadosAtualizados) {
  try {
    const bancoAtualizado = JSON.parse(JSON.stringify(bancodedados))
    const { contas, saques, depositos, transferencias } = bancoAtualizado

    function adicionarConta() {
      contas.push(dadosAtualizados)
    }
    function atualizarConta() {
      Object.assign(contas[index].usuario, dadosAtualizados)
    }
    function excluirConta() {
      contas.splice(index, 1)
    }
    function depositarOuSacar() {
      const conta = contas[index]
      const numero = conta.numero
      if (operacao === 'depositar') {
        conta.saldo += dadosAtualizados
        registrarDepositoOuSaque(depositos, numero, dadosAtualizados)
      } else if (operacao === 'sacar') {
        conta.saldo -= dadosAtualizados
        registrarDepositoOuSaque(saques, numero, dadosAtualizados)
      }
    }
    function transferir() {
      const { indexOrigem, indexDestino } = index
      const numero_conta_origem = contas[indexOrigem].numero
      const numero_conta_destino = contas[indexDestino].numero
      contas[indexOrigem].saldo -= dadosAtualizados
      contas[indexDestino].saldo += dadosAtualizados
      const data = new Date()
      const dados = {
        data: format(data, 'dd-MM-yyyy HH:mm:ss'),
        numero_conta_origem,
        numero_conta_destino,
        valor: dadosAtualizados,
      }
      transferencias.push(dados)
    }
    switch (operacao) {
      case 'contas':
        adicionarConta()
        break
      case 'atualizar':
        atualizarConta()
        break
      case 'excluir':
        excluirConta()
        break
      case 'depositar':
      case 'sacar':
        depositarOuSacar()
        break
      case 'transferir':
        transferir()
        break
      default:
        throw new Error('Operação inválida')
    }
    const banco = JSON.stringify(bancoAtualizado, null, 2)
    await fsPromises.writeFile(
      './src/bancodedados.js',
      `const bancodedados = ${banco}\n\nmodule.exports = bancodedados`
    )
  } catch (e) {
    throw new Error('Falha ao atualizar os dados do banco de dados ' + e)
  }
}

module.exports = {
  indexConta,
  registrarDepositoOuSaque,
  gravarDados,
}
