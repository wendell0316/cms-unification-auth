const fs = require('fs')
const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const compression = require('compression')
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser')
const app = express()
const cookieSession = require('cookie-session')
const auth = require('./server/middleware/auth')
const apiAuth = require('./server/middleware/apiauth')

const config = require(`./config`)
const setDevServer = require('./build/setDevServer')

// 路由
const routers = require('./server/router')

const env = process.env.NODE_ENV || 'development'

let indexHTML

let apiBase = `${config.baseUrl}api`

// 静态资源
app.use(`${config.baseUrl}dist`, express.static(path.resolve('./dist')))

// app.use(config.baseUrl, favicon(path.join(__dirname, `./favicon.ico`)))

// 健康检查
app.get('/apmanager/health', (req, res) => {
    res.end(process.env.NODE_ENV)
})

app.use(cookieParser())

app.use(cookieSession({
    name: 'tob',
    keys: ['drThMQvi'],
    maxAge: 24 * 60 * 60 * 1000
}))

app.use(auth()) //单点登录

app.use(apiAuth()) //统一权限

app.use(compression({threshold: 0}))
// 接口转发，注意中间件的顺序

// app.use(apiBase, createProxyMiddleware({
//     target: config.apiUrl,
//     changeOrigin: true,
//     pathRewrite: {
//         [apiBase]: '/newguestadmin'
//     },
//     onProxyReq: (proxyReq, req, res) => {
//         let userInfo = req.session.userInfo || {}
//         proxyReq.setHeader('staffId', userInfo.workId || '')
//         proxyReq.setHeader('staffName', encodeURIComponent(userInfo.username) || '')
//     },
//     onProxyRes: (proxyRes, req, res) => {

//         proxyRes.headers['Content-Type'] = 'application/json'

//     },
//     onError: (err, req, res) => {
//         console.log(err)
//     }

// }))

// let apiUrl = 'http://tcflightfrontapi.17usoft.com/frontservice/',
//     apiBaseTc = `${config.baseUrl}json`
// app.use(apiBaseTc, createProxyMiddleware({
//     target: apiUrl,
//     changeOrigin: true,
//     pathRewrite: {
//         [apiBaseTc]: '/json'
//     },
//     onProxyReq (ProxyReq, req, res) {
//         console.log("ProxyReq:" + ProxyReq.path)
//         console.log('....')
//     }
// }))





app.use(express.json()) // for parsing application/json

app.use(express.urlencoded({  // for parsing application/x-www-form-urlencoded
    extended: true
}))

app.use(config.baseUrl, routers)
console.log(env)
if (env === 'development') {
    console.log('1')
    setDevServer(app, {
        indexUpdated: html => {
            console.log('********** html ************')
            console.log(html)
            indexHTML = html
        }
    })
} else {
    indexHTML = fs.readFileSync(path.resolve('./dist/static/index.html'), 'utf-8')
}
console.log('3')
app.get(config.baseUrl, (req, res) => {

    if (!indexHTML) {
        res.end('waiting for compilation... refresh in a moment.')
    }

    res.setHeader('Content-Type', 'text/html')

    res.end(indexHTML)
})

// 优先读取系统环境变量
const port = process.env['PORT0'] || config.port

app.listen(port, () => {
    console.log(`server started at localhost: ${port}`)
})
