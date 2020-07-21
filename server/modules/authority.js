const fetch = require('node-fetch')
const config = require('../../config')
const parseXML = require('./parseXML')
module.exports = {
    async fetchMenus(userid) {
        let postDataTempl =
            `<?xml version="1.0" encoding="gb2312"?>
        <meminfo>
           <trasinf>
              <service>getmenulist</service>
              <projCode>${config.authority.projectCode}</projCode>
           </trasinf>
           <ucom>
              <userId>${userid}</userId>
              <gmtp>1</gmtp>
           </ucom>
        </meminfo>`

        let result = await fetch(config.authority.url, {
            method: 'POST',
            body: postDataTempl,
            headers: {
                'Content-Type': 'application/xml'
            }
        }).catch((e) => {
            console.log(e)
        })

        if (result.ok) {
            let text = await result.text()

            let json = await parseXML(text, {
                explicitArray : false,
                explicitRoot: false,
                mergeAttrs: true
             })

            if (json.st == '1') {
                // 一个菜单权限都没有 menuList 为空字符串，一个为对象，多个为数组
                return json.detailInfo.menuList.menu
            }
        }
    }
}
