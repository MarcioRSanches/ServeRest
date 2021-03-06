'use strict'

const carrinhosService = require('../services/carrinhos-service')
const constant = require('../utils/constants')
const service = require('../services/usuarios-service')

exports.get = async (req, res) => {
  try {
    const usuarios = await service.getAll(req.query)
    res.status(200).send({ quantidade: usuarios.length, usuarios })
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).send({ message: constant.INTERNAL_ERROR, error })
  }
}

exports.post = async (req, res) => {
  try {
    if (await service.existeUsuario({ email: req.body.email })) {
      return res.status(400).send({ message: constant.EMAIL_JA_USADO })
    }
    const dadosCadastrados = await service.createUser(req.body)
    res.status(201).send({ message: constant.POST_SUCESS, _id: dadosCadastrados._id })
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).send({ message: constant.INTERNAL_ERROR, error })
  }
}

exports.delete = async (req, res) => {
  try {
    const carrinhoDoUsuario = await carrinhosService.getAll({ idUsuario: req.params.id })
    const usuarioTemCarrinho = typeof carrinhoDoUsuario[0] !== 'undefined'
    if (usuarioTemCarrinho) {
      return res.status(400).send({ message: constant.EXCLUIR_USUARIO_COM_CARRINHO, idCarrinho: carrinhoDoUsuario[0]._id })
    }
    const quantidadeRegistrosExcluidos = await service.deleteById(req.params.id)
    const message = quantidadeRegistrosExcluidos === 0 ? constant.DELETE_NONE : constant.DELETE_SUCESS
    res.status(200).send({ message })
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).send({ message: constant.INTERNAL_ERROR, error })
  }
}

exports.put = async (req, res) => {
  try {
    const idInexistenteEEmailRepetido = await service.existeUsuario({ email: req.body.email, $not: { _id: req.params.id } })
    if (idInexistenteEEmailRepetido) {
      return res.status(400).send({ message: constant.EMAIL_JA_USADO })
    }
    const registroCriado = await service.createOrUpdateById(req.params.id, req.body)
    if (registroCriado) { return res.status(201).send({ message: constant.POST_SUCESS, _id: registroCriado._id }) }
    res.status(200).send({ message: constant.PUT_SUCESS })
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).send({ message: constant.INTERNAL_ERROR, error })
  }
}
