// Signature 签名处理
const crypto = require('crypto')

/**
 * 生成签名
 *
 * @param {String} accessSecret 签名密钥
 * @param {String} method GET|POST 请求方式
 * @param {String} uri 请求地址
 * @param {Object} params 结构 { "GET"： [], "POST": [], "RAW_BODY": '', "FILES": [] }
 * @param {Object} headers
 * @param {String} contentType
 * @return {String}
 *
 * @throws \Exception
 */
function buildSign(accessSecret, method, uri, params, headers, contentType) {
  contentType = contentType || 'application/x-www-form-urlencoded'
  params = processParams(params)
  let canonicalUrl = uriEncode(uri, false)
  let canonicalQueryStr = getCanonicalQueryStr(params['GET'])
  let canonicalHeaders = getCanonicalHeaders(headers)
  let canonicalBody = ''
  let strToSign = method + "\n"
    + canonicalUrl + "\n"
    + canonicalQueryStr + "\n"
    + canonicalHeaders + "\n"
  if (method === 'POST') {
    canonicalBody = getCanonicalBody(contentType, params)
    strToSign += canonicalBody + "\n"
  }
  return base64_encode(hash_hmac('sha256', strToSign, accessSecret))
}

/**
 * 转义 uri 字符
 *
 * @param {String} uri
 * @param {Boolean} encodeSlash
 * @return String
 */
function uriEncode(uri, encodeSlash) {
  if (uri === '') {
    return uri
  }
  let chars = uri.toString().split('')
  let charsArr = []
  for (let char of chars) {
    if ((char >= 'A' && char <= 'Z')
      || (char >= 'a' && char <= 'z')
      || (char >= '0' && char <= '9')
      || char === '_' || char === '-' || char === '~' || char === '.') {
      charsArr.push(char)
    } else if (char === '/') {
      charsArr.push(encodeSlash ? '%2F' : char)
    } else {
      charsArr.push('%' + (char.charCodeAt().toString(16).toUpperCase()))
    }
  }
  return charsArr.join('')
}

function processParams(params) {
  if (!params.hasOwnProperty('GET')) {
    params['GET'] = []
  }
  if (!params.hasOwnProperty('POST')) {
    params['POST'] = []
  }
  if (!params.hasOwnProperty('RAW_BODY')) {
    params['RAW_BODY'] = ''
  }
  if (!params.hasOwnProperty('FILES' )) {
    params['FILES'] = []
  }
  return params
}

/**
 * 获得用于验签的 Query 参数字符串
 *
 * @param {Object} queryParams
 * @return {String}
 */
function getCanonicalQueryStr(queryParams) {
  return formatRequestKeyValue(queryParams)
}

/**
 * 格式化请求中的 body 及 query 参数
 *
 * @param {Object} params 参数
 * @return {String} 格式化后的参数字符串
 */
function formatRequestKeyValue(params) {
  let str = ''
  if (Object.keys(params).length === 0) {
    return str
  }
  let paramsArr = []
  for (let paramName in params) {
    paramsArr.push([paramName, uriEncode(paramName) + '=' + uriEncode(params[paramName])])
  }
  paramsArr.sort(function (a, b) {
    return a[0].localeCompare(b[0])
  })
  let paramsFormat = []
  for (let paramArr of paramsArr) {
    paramsFormat.push(paramArr[1])
  }
  return paramsFormat.join('&')
}

/**
 * 获得用于验签的 header 字符串
 *
 * @param {Object} headers
 * @return {String}
 */
function getCanonicalHeaders(headers)
{
  let headerNames = Object.getOwnPropertyNames(headers)
  let pattern_xm = /^(x-m-.*)$/i
  let needHeaders = [['equip_id', 'equip_id:']]
  for (name of headerNames) {
    if (name.match(pattern_xm)) {
      needHeaders.push([name, name.toLowerCase() + ':' + headers[name].trim()])
    }
  }
  needHeaders.sort(function (a, b) {
    return a[0].localeCompare(b[0])
  })
  let headerFormat = []
  for (let needHeader of needHeaders) {
    headerFormat.push(needHeader[1])
  }
  return headerFormat.join("\n")
}

/**
 * 获得用于验签的 body 字符串
 *
 * @param {String} contentType
 * @param {Object} params 结构 { "GET"： [], "POST": [], "RAW_BODY": '', "FILES": [] }
 * @return {String}
 * @throws {Error}
 */
function getCanonicalBody(contentType, params) {
  let content = ''
  if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
    content = getPostParamStr(params.POST)
  } else if (contentType.indexOf('multipart/form-data') !== -1) {
    content = getPostParamStr(params.POST)
    if (params.FILES.length !== 0) {
      // todo
    }
  } else if (contentType.indexOf('application/json') !== -1) {
    content = params['RAW_BODY']
  } else if (contentType === '' && params['RAW_BODY'] === '') {
    content = ''
  } else {
    throw new Error('不支持的 MIME 类型')
  }
  return base64_encode(hash('sha256', content))
}

/**
 * 获得 POST 参数用于验签的字符串
 *
 * @param {Object} postParams
 * @return {String}
 */
function getPostParamStr(postParams) {
  return formatRequestKeyValue(postParams)
}

/**
 * base64 解密（以 utf-8 编码解密）
 *
 * @param {String} str 需要解密的字符串
 * @return {String} 已解密的字符串
 */
function base64_encode(str) {
  return Buffer.from(str, 'utf-8').toString('base64')
}

/**
 * 使用 hash 加密
 *
 * @param {String} algorithm 加密算法名  (i.e. "md5", "sha256")
 * @param {String} data 需要进行加密的数据
 * @return {BinaryType}
 */
function hash(algorithm, data) {
  return crypto.createHash(algorithm, data).update(data).digest()
}

/**
 * 使用 Hmac 加密
 *
 * @param {String} algorithm 加密算法名  (i.e. "md5", "sha256")
 * @param {String} data 需要进行加密的数据
 * @param {String} key 加密密钥
 * @return {BinaryType}
 */
function hash_hmac(algorithm, data, key) {
  return crypto.createHmac(algorithm, key).update(data).digest()
}

exports.buildSign = buildSign