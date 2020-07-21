const util = require('util')
const  parseString = require('xml2js').parseString
module.exports = util.promisify(parseString)
