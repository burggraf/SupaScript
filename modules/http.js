/*
methods return:
{
  status,       // int
  content_type, // text
  headers,      // jsonb
  content       // text
}
*/
module.exports.header = function(url, value, headers = []) {
    const retval = 
    sql(`select * from http(('HEADER','${url}','${format_headers(headers)}', null, '${encodeURIComponent(value)}'))`)[0];
    return retval;    
}
module.exports.head = function(url, headers = []) {
    const retval = 
    sql(`select * from http(('HEAD','${url}','${format_headers(headers)}', null, null))`)[0];
    return retval;    
}
module.exports.get = function(url, headers = []) {
    const retval = 
    sql(`select * from http(('GET','${url}','${format_headers(headers)}', null, null))`)[0];
    
    return retval;    
}
module.exports.delete = function(url, headers = []) {
    const retval = 
    sql(`select * from http(('DELETE','${url}','${format_headers(headers)}', null, null))`)[0];
    return retval;    
}
module.exports.post = function(url, payload, headers = [], content_type) {
    const params = serializeObject(payload);;
    const retval = 
    sql(`select * from http(('POST','${url}','${format_headers(headers)}', '${content_type || 'application/x-www-form-urlencoded'}', '${params}'))`)[0];
    return retval;    
}
module.exports.put = function(url, payload, headers = [], content_type) {
    const params = serializeObject(payload);;
    const retval = 
    sql(`select * from http(('PUT','${url}','${format_headers(headers)}','${content_type || 'application/x-www-form-urlencoded'}', '${params}'))`)[0];
    return retval;    
}
module.exports.patch = function(url, payload, headers = [], content_type) {
    const params = serializeObject(payload);;
    const retval = 
    sql(`select * from http(('PATCH','${url}','${format_headers(headers)}','${content_type || 'application/x-www-form-urlencoded'}', '${params}'))`)[0];
    return retval;    
}

const serializeObject = function(obj) {
    var pairs = [];
    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) {
            continue;
        }
        if (Object.prototype.toString.call(obj[prop]) == '[object Object]') {
            pairs.push(serializeObject(obj[prop]));
            continue;
        }
        pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
    }
    return pairs.join('&');
}

const format_headers = function(headers) {
    let headers_block;
    if (headers !== null) {
        headers_block = '{';
        headers.map((header) => {
            headers_block += 
                (headers_block === '{' ? '' : ',') +
                '"(' + header[0] + ',\\\"' + header[1] + '\\\")"';
        });
        headers_block += '}';
    } else {
        headers_block = null;
    }
    return headers_block;
}
