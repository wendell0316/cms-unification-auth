const config = require('../../config')
const authorizer = require('../modules/authorizer')
const authority = require('../modules/authority')

module.exports = async (req, res) => {
    let code = req.query.code
    let returnUri = req.query.returnUri
    let sso = config.sso
    let tokenApi = sso.token
    let accessToken = req.session.accessToken



    console.log(`code: ${code}`)
    console.log(`returnUri: ${returnUri}`)

    if (!code || accessToken) {
        return res.redirect( returnUri || '/')
    }

    accessToken = await authorizer.fetchAccessToken(`${req.protocol}://${req.headers.host}`, code).catch((e) => {
        console.log(e)
    })

    console.log(`accessToken: ${accessToken}`)

    if(!accessToken) {
        return res.end('登录失败！')
    }

    req.session.accessToken = accessToken // 存储获取的accessToken

    let userInfo = await authorizer.fetchUserInfo(accessToken).catch((e) => {
        console.log(e)
    })

    if (userInfo) {
        // 取需要的数据存储，减少cookie大小
        req.session.userInfo = {
            username: userInfo.username || '',
            userId: userInfo.userId || '', // 查权限会用到
            workId: userInfo.workId || '' // 工号
        }
        req.cookies.user = userInfo.username || ''
        let res = await authority.fetchMenus(userInfo.userId).catch((e) => {
            console.log(e)
        })

        if(res) {
            let userAuths
            if(Array.isArray(res)) {
                userAuths = res
            } else {
                userAuths = [res]
            }

            req.session.userAuths = handleAuthority(userAuths)
        }
    }

    return res.redirect(returnUri || '/')
}

function handleAuthority (auths) {
    let newAuths = []
    for(let auth of auths) {
        let obj = Object.create(null)
        let newMenus = []
        let newMenuNames = []
        obj.name = auth.name
        if(auth.menu) {
            //console.log(JSON.stringify(auth))
            //auth demo:
            // {"id":"93188","name":"activityapi","title":"活动平台管理系统","url":"/activityapi","orderNo":"1","mtype":"0","hasPermission":"1","remark":"","menu":[{"id":"93189","name":"activity","title":"活动","url":"/activity","orderNo":"1","mtype":"0","hasPermission":"1","remark":""},{"id":"93191","name":"module","title":"组件","url":"/module","orderNo":"2","mtype":"0","hasPermission":"1","remark":"","menu":{"id":"95906","name":"list","title":"列表","url":"/getModuleList","orderNo":"1","mtype":"0","hasPermission":"1","remark":""}},{"id":"93671","name":"upload","title":"上传","url":"/upload","orderNo":"4","mtype":"0","hasPermission":"1","remark":""},{"id":"94054","name":"image","title":"图片","url":"/image","orderNo":"5","mtype":"0","hasPermission":"1","remark":""},{"id":"94087","name":"air","title":"航线专题","url":"/air","orderNo":"6","mtype":"0","hasPermission":"1","remark":""},{"id":"94282","name":"log","title":"日志","url":"/log","orderNo":"8","mtype":"0","hasPermission":"1","remark":""}]}
            if(auth.name == 'activityapi') {
                if(Array.isArray(auth.menu)){
                    for(let menu of auth.menu) {
                        if(menu.menu){
                            if(Array.isArray(menu.menu)){
                                for(let subMenu of menu.menu) {
                                    newMenus.push(menu.url + subMenu.url)
                                }
                            }else{
                                let subMenu = menu.menu
                                newMenus.push(menu.url + subMenu.url)
                            }
                        }else{
                            newMenus.push(menu.url)
                        }

                    }
                }else{
                    newMenus.push(auth.menu.url)
                }
                console.log(newMenus)
            }else if(auth.name == 'activitymenu'){
                if(Array.isArray(auth.menu)){
                    for(let menu of auth.menu) {
                        if(menu.menu){
                            newMenuNames.push(menu.name)
                            if(Array.isArray(menu.menu)){
                                for(let subMenu of menu.menu) {
                                    newMenuNames.push(subMenu.name)
                                }
                            }else{
                                let subMenu = menu.menu
                                newMenuNames.push(subMenu.name)
                            }
                        }else{
                            newMenuNames.push(menu.name)
                        }

                    }
                }else{
                    newMenuNames.push(auth.menu.name)
                }
                console.log(newMenuNames)
            }
        }

        obj.menu = newMenus //api的地址配置列表
        obj.menuNames = newMenuNames //菜单的router.name匹配列表
        newAuths.push(obj)
    }

    return newAuths
}
