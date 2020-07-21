module.exports = {
    port: 9022,
    apiUrl: '',
    acitvityApiUrl: '',
    baseUrl: '/',
    sso: {
        authorize: 'http://tccommon.t.17usoft.com/oauth/authorize',
        token: 'http://tccommon.t.17usoft.com/oauth/token',
        getUserInfo: 'http://tccommon.t.17usoft.com/oauth/rs/getuserinfo',
        logout: 'http://tccommon.t.17usoft.com/oauth/logout',
        clientId: '',
        clientSecret: '',
        redirectUri: 'login',
        grantType: 'authorization_code'
    },
    authority: {
        url: 'http://authority.17usoft.com/Interface/Service.ashx',
        projectCode: ''
    }
}
