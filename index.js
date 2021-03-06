'use strict'

const senadores = require('senadores-base')
const pMap = require('p-map')
const pAll = require('p-all')
const utils = require('./utils')
const getViajesNacionales = utils.getViajesNacionales
const getPeriodo = utils.getPeriodo
const getViajesExtranjeros = utils.getViajesExtranjeros

// Get travels details for senators
// (any, obj) -> arr
module.exports = function senadoresViajes (query, options) {
  const defaultOptions = {
    periodo: new Date().getFullYear(),
    tipo: 'todos',
    cantidadSenadores: -1,
    incluyeSenador: false
  }
  options = Object.assign(defaultOptions, options)

  let senadoresBase = senadores(query)

  const mapper = (senador, index) => {
    switch (options.tipo) {
      case 'todos':
        const actions = [
          () => getViajesNacionales(senador, index, senadoresBase, getPeriodo(options.periodo)),
          () => getViajesExtranjeros(senador, getPeriodo(options.periodo))
        ]
        return pAll(actions).then(result => {
          if (options.incluyeSenador) return { senador, nacionales: result[0], extranjeros: result[1] }
          return { nacionales: result[0], extranjeros: result[1] }
        })
      case 'nacionales':
        return getViajesNacionales(senador, index, senadoresBase, getPeriodo(options.periodo), options.incluyeSenador)
      case 'extranjeros':
        return getViajesExtranjeros(senador, getPeriodo(options.periodo), options.incluyeSenador)
      default:
        throw new Error(`[senadores-viajes]: Error - tipo de retorno '${options.tipo}' no conocido.`)
    }
  }
  senadoresBase = options.cantidadSenadores && options.cantidadSenadores > -1
          ? senadoresBase.slice(0, options.cantidadSenadores)
          : senadoresBase
  return pMap(senadoresBase, mapper)
}
