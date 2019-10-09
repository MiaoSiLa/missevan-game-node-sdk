signature = require('./src/Signature')
https = require('./src/Https')

// 请求方法
const METHOD_POST = 'POST'
const METHOD_GET = 'GET'

// 查询用户信息
const API_USER_INFO = '/api/userinfo';
// 查询订单
const API_GET_ORDER = '/api/get-order';

// Node Client SDK 版本
const SDK_VERSION = "1.0.0";

/**
 * Class Client
 *
 * @package MaoerGame
 */
class Client
{
  /**
   * Client constructor.
   *
   * @param {Number} appID 游戏 ID
   * @param {Number} merchantID 商户 ID
   * @param {String} accessID 游戏服务端对应的 ID
   * @param {String} accessSecret 游戏服务端对应的密钥
   */
  constructor(appID, merchantID, accessID, accessSecret) {
    this.config = {
      appID: appID,
      merchantID: merchantID,
      accessID: accessID,
      accessSecret: accessSecret,
    }
    this.host = ''
    this.port = 443
  }

  /**
   * 设置网关地址
   *
   * @param {String} url
   */
  setHost(host, port) {
    this.host = host
    this.port = port || 443
  }

  /**
   * 发起请求
   *
   * @param {String} method GET|POST
   * @param {String} api 例 /api/userinfo
   * @param {Object} params k-v 键值对
   * @param {Object} header k-v 键值对
   * @return string json body string
   * @throws {Error}
   */
  async request(method, api, params, header) {
    header = header || {}
    header = Object.assign(getDefaultHeader(), header)
    let uri = `https://${this.host}:${this.port}${api}`
    if (this.port === 80 || this.port === 443 ) {
      uri = `https://${this.host}${api}`
    }
    let publicParams = {
      app_id: this.config.appID,
      merchant_id: this.config.merchantID,
      access_id: this.config.accessID,
    }
    params = Object.assign(publicParams, params)
    let sign = ''
    if (METHOD_GET === method) {
      sign = signature.buildSign(this.config.accessSecret, method, uri, {GET: params}, header)
    } else {
      sign = signature.buildSign(this.config.accessSecret, method, uri, {POST: params}, header)
    }
    header.Authorization = sign
    let resp = await https.ajaxAsync({
      method: method,
      hostname: this.host,
      port: this.port,
      path: api,
      params: params,
      headers: header,
      dataType: 'json',
    })
    return resp
  }

  /**
   * 查询用户信息
   *
   * @param {Object} params 请求参数（不含公共参数），例 { token: "test|token" } 详见 API 文档
   * @return {Object}
   * @throws {Error}
   */
  async queryUserInfo(params) {
    return await this.request(METHOD_GET, API_USER_INFO, params)
  }

  /**
   * 查询订单
   *
   * @param {Object} params 请求参数（不含公共参数），例 { tr_no: "10000000900000000090123456789012" } 详见 API 文档
   * @return {Object}
   * @throws {Error}
   */
  async queryOrder(params) {
    return await this.request(METHOD_GET, API_GET_ORDER, params);
  }
}

/**
 * 获取默认请求头
 *
 * @return Object
 */
function getDefaultHeader() {
  let date = new Date()
  return {
    'Accept': 'application/json',
    'User-Agent': `MaoerGameSDK NodeClient/${SDK_VERSION}`,
    'X-M-Date':  date.toGMTString(),
    'X-M-Nonce': parseInt((date.getTime() / 1000) + (Math.random() * 9000 + 1000)).toString()
  }
}

module.exports = Client