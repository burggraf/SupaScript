create or replace function test_underscore()
returns json as $$
    const _ = require('https://cdn.jsdelivr.net/npm/underscore@1.12.1/underscore-min.js');
    const retval = _.map([1, 2, 3], function(num){ return num * 3; });
    return retval;
$$ language plv8;

select test_underscore();
