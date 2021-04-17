module.exports.request = 
function(options) {
    const retval = sql(`select content from http_get('https://google.com')`)[0].content;
    return retval;
};

/*
get method returns:
{
  status,       // int
  content_type, // text
  headers,      // jsonb
  content       // text
}

 method       | http_method       |
 uri          | character varying |
 headers      | http_header[]     |
 content_type | character varying |
 content      | character varying |

*/
module.exports.header = function(url, value, headers = null) {
    const retval = 
    sql(`select * from http(('HEADER','${url}','${format_headers(headers)}', null, '${encodeURIComponent(value)}'))`)[0];
    return retval;    
}
/*
module.exports.header = function(url, value) {
    const retval = sql(`select * from http_header('${url}', ${value})`)[0];
    return retval;
};
*/
module.exports.head = function(url, headers = null) {
    const retval = 
    sql(`select * from http(('HEAD','${url}','${format_headers(headers)}', null, null))`)[0];
    return retval;    
}
/*
module.exports.head = function(url) {
    const retval = sql(`select * from http_head('${url}')`)[0];
    return retval;
};
*/
/*

    ARRAY[http_header('Authorization','Basic ' || encode(MAILGUN_API_KEY::bytea,'base64'::text))],

*/
module.exports.get = function(url, headers = null) {
    // const retval = 
    // sql(`select * from http(('GET','${url}','{"(Authorization,\\"Basic YXBpOmtleS0xMDY3MDZkODU2YjVkN2JmZDYwNjAzZGVlOWE2YjljNg==\\")"}', null, null))`)[0];
    const retval = 
    sql(`select * from http(('GET','${url}','${format_headers(headers)}', null, null))`)[0];
    
    return retval;    
}
/*
module.exports.get = function(url) {
    const retval = sql(`select * from http_get('${url}')`)[0];
    return retval;
};
*/
module.exports.delete = function(url, headers = null) {
    const retval = 
    sql(`select * from http(('DELETE','${url}','${format_headers(headers)}', null, null))`)[0];
    return retval;    
}
/*
module.exports.delete = function(url) {
    const retval = sql(`select * from http_delete('${url}')`)[0];
    return retval;
};
*/
module.exports.post = function(url, payload, headers = null, content_type) {
    const params = serializeObject(payload);;
    const retval = 
    sql(`select * from http(('POST','${url}','${format_headers(headers)}', '${content_type || 'application/x-www-form-urlencoded'}', '${params}'))`)[0];
    return retval;    
}
/*
module.exports.post = function(url, payload, content_type) {
    const params = serializeObject(payload);;
    const retval = sql(`select * from http_post('${url}','${params}',${content_type || 'application/x-www-form-urlencoded'})`)[0];
    return retval;
}
*/
module.exports.put = function(url, payload, headers = null, content_type) {
    const params = serializeObject(payload);;
    const retval = 
    sql(`select * from http(('PUT','${url}','${format_headers(headers)}','${content_type || 'application/x-www-form-urlencoded'}', '${params}'))`)[0];
    return retval;    
}
/*
module.exports.put = function(url, payload, content_type) {
    const params = serializeObject(payload);;
    const retval = sql(`select * from http_put('${url}','${params}',${content_type || 'application/x-www-form-urlencoded'})`)[0];
    return retval;
}
*/
module.exports.patch = function(url, payload, headers = null, content_type) {
    const params = serializeObject(payload);;
    const retval = 
    sql(`select * from http(('PATCH','${url}','${format_headers(headers)}','${content_type || 'application/x-www-form-urlencoded'}', '${params}'))`)[0];
    return retval;    
}
/*
module.exports.patch = function(url, payload, content_type) {
    const params = serializeObject(payload);;
    const retval = sql(`select * from http_patch('${url}','${params}',${content_type || 'application/x-www-form-urlencoded'})`)[0];
    return retval;
}
*/


/*
const options = {
    hostname: 'whatever.com',
    port: 443,
    path: '/todos',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  */

// {'mykey':'myvalue','mynumber':23,'myjson':{'firstname':'harry','lastname':'styles'}}

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
        // '{"(Authorization,\\"Basic YXBpOmtleS0xMDY3MDZkODU2YjVkN2JmZDYwNjAzZGVlOWE2YjljNg==\\")"}'
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
