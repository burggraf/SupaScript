create or replace function test_lodash()
returns json as $$
    const lodash = require('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.js', false);
    const retval = lodash.sortBy([{ name: 'moss' }, { name: 'jen' }, { name: 'roy' }], 'name')
    
    return retval; 
$$ language plv8;

select test_lodash();
