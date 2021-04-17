create or replace function test_handlebars()
returns text as $$
    const Handlebars = require('https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.7.7/handlebars.js', false);

    var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
                "{{kids.length}} kids:</p>" +
                "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
    var template = Handlebars.compile(source);

    var data = { "name": "Alan", "hometown": "Somewhere, TX",
                "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
    var retval = template(data);

    return retval; 
$$ language plv8;

select test_handlebars();