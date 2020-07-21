const config = require('../../config')

module.exports = (req, res) => {
  let accessToken = req.session.accessToken
  //清除当前用户的session
  req.session = null
  return res.redirect(`${config.sso.logout}?access_token=${accessToken}`)
}
