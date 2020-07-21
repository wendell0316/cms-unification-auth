const config = require('../../config')
module.exports = () => { //如果是api请求，没有权限的话，就会跳转到401页面
    return (req, res, next) => {
        let auths = req.session.userAuths
        let isAuth = false

        if(req.path.indexOf('/api/') === -1) {
            return next()
        }
        if(auths && Array.isArray(auths) && auths.length > 0 && auths[0].name == 'activityapi') {
            isAuth = auths[0].menu.some(item => req.path.indexOf(item) > -1)
        }else {
            console.log('没有配置基于接口的权限控制')
        }

        if(!isAuth) {
            return res.json({
                code: 401,
                error: "forbidden"
            })
        }

        next()
    }
 }
