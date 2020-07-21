const authorizer = require('../modules/authorizer')
const config = require('../../config')
module.exports = () => {
  return (req, res, next) => {
    if(!req.session.accessToken && req.path != `${config.baseUrl}login` && req.path != `${config.baseUrl}logout`) { //如果没登陆 重定向到单点登录的页面

      let redirectUrl = authorizer.generateAuthUrl(`${req.protocol}://${req.headers.host}`, req.originalUrl)

      if(req.path.indexOf(`${config.baseUrl}api/`) !== -1) {
          redirectUrl = authorizer.generateAuthUrl(`${req.protocol}://${req.headers.host}`, config.baseUrl)
          return res.json({
              code: 302,
              redirect: redirectUrl
          })
        }
      return res.redirect(redirectUrl)
    }

    if(req.session.userInfo && (req.cookies.user != req.session.userInfo.username)) {
      res.cookie('user', req.session.userInfo.username)
      res.cookie('userid', req.session.userInfo.workId)
    }
    //console.log('req.session.userAuths:')
    //console.log(JSON.stringify(req.session))
    if(req.session.userAuths && Array.isArray(req.session.userAuths)){
        if(req.session.userAuths.length > 1 && req.session.userAuths[1].menuNames){
            res.cookie('menu',JSON.stringify(req.session.userAuths[1].menuNames))
        }else{
            console.log('没有配置基于菜单的权限控制')
            res.cookie('menu',JSON.stringify([]))
        }
    }
    next()
  }
}
