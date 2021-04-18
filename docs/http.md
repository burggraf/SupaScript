# http module
This built-in module works like the NodeJS built-ins for "http" and "https".
### Quick example:
```
const http = require('http');
const res = http.get('https://www.google.com');
if (res.status === 200) {
	return (res.content);
} else {
	throw (res);
}
```


## Return Object
All methods return the a JSON response object with the following fields:

- status int
- content_type text
- headers json
- content text

Example response: ```
{ "status": 200, "content_type": "application/json",  "headers": [{"field": "Access-Control-Allow-Credentials",      "value": "true"},{"field": "Date","value": "Sun, 18 Apr 2021 00:54:14 GMT"}], "content": "text-result-here" }
```

## Methods
### GET
```
http.get(<url>, <headers>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`headers` (optional) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`

### POST
```
http.post(<url>, <payload>, <headers>, <content-type>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`payload` form object sent to the server encoded as html-safe field-value pairs `field1=value2&field2=value2` (while this is sent as field value pairs and automatically gets uri-encoded, you can send it as an object, which is much easier)

`headers` (optional [array of arrays]) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`

`content-type` (optional string) defaults to `application/x-www-form-urlencoded`

### PUT
```
http.put(<url>, <payload>, <headers>, <content-type>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`payload` form object sent to the server encoded as html-safe field-value pairs `field1=value2&field2=value2` (while this is sent as field value pairs and automatically gets uri-encoded, you can send it as an object, which is much easier)

`headers` (optional [array of arrays]) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`

`content-type` (optional string) defaults to `application/x-www-form-urlencoded`

### PATCH
```
http.patch(<url>, <payload>, <headers>, <content-type>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`payload` form object sent to the server encoded as html-safe field-value pairs `field1=value2&field2=value2` (while this is sent as field value pairs and automatically gets uri-encoded, you can send it as an object, which is much easier)

`headers` (optional [array of arrays]) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`

`content-type` (optional string) defaults to `application/x-www-form-urlencoded`

### DELETE
```
http.delete(<url>, <headers>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`headers` (optional) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`


### HEAD
```
http.head(<url>, <headers>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`headers` (optional) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`

### HEADER
```
http.header(<url>, <value>, <headers>)
```
parameters:

`url` this can be http or https and accepts a full querystring

`value` the name of the header you want to retrieve, passed as a string

`headers` (optional) sent as an array of arrays: i.e. `[ [ "header-1", "value-1"], ["header-2", "value-2"] ]`

## Examples

### Simple Get
```
create or replace function test_http_get()
returns text as $$

  const http = require('http');
  
  const res = http.post('https://api.host.com/v1/api-get-endpoint');

  return res.content; // res.status, res['content-type'], res.headers, res.content

$$ language plv8;

select test_http_get();

```

### Simple Post
```
create or replace function test_http_post()
returns text as $$

  const http = require('http');
  
  const res = http.post('https://api.host.com/v1/api-post-endpoint', {
  	"first_name": "John",
  	"last_name": "Adams",
  	"age": 43,
  	"date_sent": new Date(),
  	"active": true
  });

  return res.content; // res.status, res['content-type'], res.headers, res.content

$$ language plv8;

select test_http_post();

```
### Basic Authentication
Why do they call it "basic authentication" when it always takes me all day to figure out how to encode it correctly?

```
create or replace function test_basic_authentication()
returns text as $$

  const http = require('http');
  // get base64 polyfills for btoa() and atob()
  const base64lib = require('https://raw.githubusercontent.com/davidchambers/Base64.js/master/base64.js');
  const encoded = base64lib.btoa('api:key-00000000000000000000000000000000');
  
  const res = http.get('https://api.host.com/v1/api-endpoint',
      [['Authorization', 'Basic ' + encoded]]
  );

  return res.content; // res.status, res['content-type'], res.headers, res.content

$$ language plv8;

select test_basic_authentication();
```
