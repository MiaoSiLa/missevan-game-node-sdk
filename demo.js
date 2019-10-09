const Client = require('./Client')

let appID = 1
let merchantID = 1
let accessID = 'ybmK65l3WSdx55F2dC8idCYkCEevJiFF'
let accessSecret = 'YY7J28iu2UOpiJH8IOh89HoHSvORQv5w78HJJYsdfs9s8SH89ju8J'
let host = 'game.missevan.com'

async function getUserInfo() {
  let client = new Client(appID, merchantID, accessID, accessSecret)
  client.setHost(host)
  let userInfo = await client.queryUserInfo({
    token: '2|5d9d7ad4921419cec8b6fbff|a1469f6fb0c695ff|1570601684|699743338ee826eef4be7cb40354a61719d16d6e3f2fcca8'
  })
  console.log(userInfo)
}

getUserInfo()
