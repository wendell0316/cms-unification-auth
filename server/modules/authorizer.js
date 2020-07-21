const uuid = require('uuid')
const config = require('../../config')
const querystring = require('querystring')
const fetch = require('node-fetch')

module.exports = {
  /**
   * 生成跳转登录页的url
   * @param {string} rootUrl - 当前站点的url 如http://xxx.com/xxx
   * @param {string} requestUrl - 当前请求的url，用于登录成功后返回用
   * @returns {string} authUrl - 跳转登录页的url
   */
  generateAuthUrl (rootUrl, requestUrl) {
    let ssoConfig = config.sso
    let state = uuid.v4().replace(/-/g, '')
    let authUrl = ssoConfig.authorize +
      `?response_type=code&scope=read&client_id=${ssoConfig.clientId}&state=${state}&redirect_uri=${rootUrl}${config.baseUrl}${ssoConfig.redirectUri}&return_uri=${requestUrl}`
    return authUrl
  },

  /**
   * 获取accessToken
   * @param {string} code - 登录成功后返回带的code参数
   */
  async fetchAccessToken (rootUrl, code) {
    let sso = config.sso
    let tokenUrl = sso.token
    let param = {
      client_id: sso.clientId,
      client_secret: sso.clientSecret,
      redirect_uri: `${rootUrl}${config.baseUrl}${sso.redirectUri}`,
      code: code,
      grant_type: sso.grantType
    }

    let accessToken = await fetch(tokenUrl, {
      method: 'POST',
      body: querystring.stringify(param),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch((e) => {
      console.log('fetch accessToken')
      console.log(e)
    })

    let accessTokenJson = await accessToken.json().catch((e) => {
      console.log(e)
    })


    return accessTokenJson.access_token
  },

  /**
   * 通过accessToken获取用户信息
   * @param {string} accessToken
   */
  async fetchUserInfo (accessToken) {
    let sso = config.sso
    let userInfoUrl = sso.getUserInfo
    let userInfo = await fetch(userInfoUrl, {
      method: 'POST',
      body: 'access_token=' + accessToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch((e) => {
      console.log('fetch accessToken')
      console.log(e)
    })

    let userInfoJson = await userInfo.json().catch((e) => {
      console.log(e)
    })

    return userInfoJson
  }
}
