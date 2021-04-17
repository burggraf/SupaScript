create or replace function test_mustache()
returns text as $$
    const Mustache = require('https://unpkg.com/mustache@latest', false);

    const template = 'Welcome to Mustache, {{ name }}!'

    var retval = Mustache.render(template, { name: 'Luke' });

    return retval; 
$$ language plv8;
