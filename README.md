### Node Client for Maoer Game SDK

#### 安装方式

```sh
cd /Your project directory
npm install maoer-game-sdk
```

#### 应用示例（见 ./demo.js）

```js
const Client = require('maoer-game-sdk')

// 初始化配置
let client = new Client(appID, merchantID, accessID, accessSecret)

// 设置网关地址
client.setHost(host)

// 请求 API
let userInfo = await client.queryUserInfo({ token: 'test_token' })

console.log(userInfo)
```

#### API

| API | 方法 | 说明 |
|---|---|---|
| /api/userinfo | queryUserInfo(params) | 查询用户信息 |
| /api/get-order | queryOrder(params) | 查询订单 |
