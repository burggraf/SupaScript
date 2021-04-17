create or replace function test_ejs()
returns text as $$
    const ejs = require('https://cdn.jsdelivr.net/npm/ejs@3.1.6/ejs.js', false);

    users = ['geddy', 'neil', 'alex'];

    // Just one template
    ejs.render('<p>[?= users.join(" | "); ?]</p>', {users: users}, {delimiter: '?', openDelimiter: '[', closeDelimiter: ']'});
    // => '<p>geddy | neil | alex</p>'

    // Or globally
    ejs.delimiter = '?';
    ejs.openDelimiter = '[';
    ejs.closeDelimiter = ']';
    retval = ejs.render('<p>[?= users.join(" | "); ?]</p>', {users: users});
    // => '<p>geddy | neil | alex</p>'

    return retval; 
$$ language plv8;

select test_ejs();
