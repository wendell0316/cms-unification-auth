const express = require('express')
const router = express.Router()

let login = require('./login')
let logout = require('./logout')

// 单点登录成功跳转的页面
router.get('/login', login)

router.get('/logout', logout)

module.exports = router
