const https = require('https')
const querystring = require('querystring')

const STATUS_CODE_SUCCESS = 200
/**
 * 发送请求（Async）
 * @param options 请求设置
 * @param encoding 可选值： utf8 binary
 */
async function requestAsync(options, encoding = 'utf8') {
    let postData = ''
    if (options.params) {
        postData = querystring.stringify(options.params)
        if (options.method === 'GET') {
            options.path += `?${postData}`
        }
    }
    return new Promise(function (resolve, reject) {
        let req = https.request(options, function(res) {
            res.setEncoding(encoding)
            let data = ''
            res.on('data', function(chunk) {
                data += chunk
            });
            res.on('end', function() {
                let result = {}
                if (options.dataType === 'json') {
                    try {
                        result = JSON.parse(data)
                    } catch (e) {
                        throw new Error(`response body json parse err: ${e.message}, body data: ${data}`)
                    }
                } else {
                    result = {statusCode: res.statusCode, data: data, headers: res.headers}
                }
                resolve(result)
            })
        })
        req.on('error', (e) => {
            resolve({code: -1, errmsg: e.message});
        })
        if (postData && options.method === 'POST') {
            req.write(postData)
        }
        req.end()
    })
}

/**
 * 发送请求
 * @param options 请求设置
 * @param encoding 可选值： utf8 binary
 */
function request(options, cb, encoding = 'utf8') {
    let postData = ''
    if (options.params) {
        postData = querystring.stringify(options.params)
    }
    if (!options.dataType) {
        options.dataType = 'html'
    }
    let req = https.request(options, function(res) {
        res.setEncoding(encoding);
        var data = ''
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            if (options.dataType === 'json' ) {
                data = JSON.parse(data)
            }
            cb(data)
        });
    });
    req.on('error', (e) => {
        throw new e
    })
    req.write(postData)
    req.end()
}

exports.request = request
exports.ajaxAsync = requestAsync
