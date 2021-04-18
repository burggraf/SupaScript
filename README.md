# SupaScript: NodeJS for PostgreSQL and Supabase

- JavaScript-based, NodeJS-like, Deno-inspired extensions for Supabase.
- Use `require()` to import node js modules into plv8 PostgreSQL from any location on the web, similar to [Deno](https://deno.land/).
- `sql()` helper function to give easy access to PostgreSQL databases 
- `exec()` helper function to make it easy to call other SupaScript or PlpgSQL functions
- Built-in support (like NodeJS built-ins) for:
	- `require("http")` [see documentation](./docs/http.md): easy interface to make web calls and send headers, etc. for GET, POST, PUT, PATCH, DELETE, HEAD, HEADER
- Polyfills
	- Base64: btoa(), atob()
- Packaged as a PostgreSQL extension

## Installation
```sql
CREATE EXTENSION SUPASCRIPT CASCADE
```

## Quick Syntax and Sample:
```js
const module_name = require(<url-or-module-name>, <autoload>);
```
where

* `url-or-module-name`: either the public url of the node js module or a module name you've put into the plv8_js_modules table manually.

* `autoload`: (optional) boolean:  true if you want this module to be loaded automatically when the plv8 extension starts up, otherwise false

Sample function:
```sql
create or replace function test_underscore()
returns json as $$
    const _ = require('https://cdn.jsdelivr.net/npm/underscore@1.12.1/underscore-min.js');
    const retval = _.map([1, 2, 3], function(num){ return num * 3; });
    return retval;
$$ language plv8;
```
## Make writing PostgreSQL modules fun again
Can you write JavaScript in your sleep? Me too.
Can you write PlpgSql queries to save your life? Me either.

Enter our masked hero from heaven: [PLV8](https://plv8.github.io)

So how do I write nifty JavaScript modules for Supabase / Postgres?

### Automatic Installation
```sql
CREATE EXTENSION SUPASCRIPT CASCADE
```
### Manual Installation
1.  Turn on the plv8 extension for Supabase (Database / Extensions / PLV8 / ON)
2.  (Since you're already there, turn on the HTTP extension, which is required for loading modules over the web.)
3.  Run the main sql block in your Supabase SQL window (comment out the \echo line at the top)
4.  Write a function!

```sql
create or replace function hello_javascript(name text)
returns json as $$
    const retval = { message: `Hello, my good friend ${name}!` };
    return retval; 
$$ language plv8;
```

The syntax is a little weird, but you'll get used to it.  You need to add a data type after any function parameters.  You need to add the return type after the function name (and parameters).  You need to delimit the function with $$ pairs.  You have to add "language plv8" at the end.  Not so bad.  Cut and paste from a template if you can't remember all that (like I can't.)

Now, you've got all that JavaScript goodness flowing, and it hits you -- What?  I can't access the huge world of Node JS libraries?  What do you expect me to do -- write JavaScript from scratch like an animal?  Forget it!

Enter **SupaScript**.

Load the extension or run the SQL code, and now you can use `require()`.  Since you don't have access to a file system, though, you can't use npm install.  So we need to have a way to load those neato node_modules.  How do we do it?

## Method 1:  load from the web automatically
This is the easiest (and preferred) method.

```
const module = require('https://url-to-public-function');
```
Here's how we'd use the popular Moment JS library:
```
create or replace function test_momentjs()
returns json as $$
    const moment = require('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.js', false);
    const retval = moment().add(7, 'days');
    
    return retval; 
$$ language plv8;
```
Then just call this function from SQL:
```
select test_momentjs();
```

Where do I find the url?  Hunt around on the library documentation page to find a CDN version of the library or look for documentation that shows how to load the library in HTML with a <SCRIPT> command.

## Method 2:  manually load the library into your plv8_js_modules table
This isn't the ideal method, but you can do this on your own if you want.  Basically you load the source code for the module into the table.  But you need to deal with escaping the single-quotes and all that fun stuff.  Try Method 1 first, there's really no downside as long as you choose a compatible library and you can access it from the internet the first time you use it.  See below for details on how all this works.

## How it works
The first time you call require(url) the following stuff happens:

1.  If your requested module is cached, we return it from the cache.  Super fast!  Woohoo!  Otherwise...
2.  We check to see if the url (or module name if you loaded it manually) exists in the `plv8_js_modules` table.  If it does, we load the source for the module from the database and then `eval()` it.  Yes, we're using `eval()`, and that's how this is all possible.  We know about the security vulnerabilities with `eval()` but in this case, it's a necessary evil.  If you've got a better way, hit me up on GitHub.
3.  If the module isn't in our `plv8_js_modules` table, we use the `http_get()` function from [pgsql-http](https://github.com/pramsey/pgsql-http) to load the source into a variable, then we store it in the plv8_js_modules for later.  Later when we need it, we can get it from the database, then cache it.

So it goes: 
1.  Are you in the cache?  Load you now!
2.  Are you in the database?  Load you from the database and cache you for next time!
3.  First time being called, ever?  We'll load you over http, write you to the database, and you're all set and loaded for next time!

If you call `require(url, true)` that "true" parameter means "autoload this module" so that it gets loaded into the cache when PLV8 starts up. Only do this with modules you need to have ready to go immediately.  False essentially lazy-loads this module the first time it's called after startup.

## Requirements:
1.  Supabase database (or any PostgreSQL database, probably, as long as it's a current-enough version).
2.  The [PLV8](https://plv8.github.io) extension loaded.  If you load the SupaScript extension, this will be loaded automatically with `cascade`.  If you're installing manually, make sure you've loaded the PLV8 extension.
3.  The [pgsql-http](https://github.com/pramsey/pgsql-http) extension loaded.  (Same issues as #2 above.)

## BONUS FUNCTIONS
### sql(sql_statement, arguments)
#### Accessing the PostgreSQL database from inside JavaScript
We've included a bonus function to streamline access to your PostgreSQL database.
```js
<result> = sql(<sql_statement>, <optional array of arguments>);
```
This maps directly to plv8.execute() -- SEE: [plv8 documentation here](https://plv8.github.io/#database-access-via-spi)

Example usage:
```js
var json_result = sql('SELECT * FROM tbl');
var num_affected = sql('DELETE FROM tbl WHERE price > $1', [ 1000 ]);
```

### exec(function_name, arguments)
#### Execute a PostgreSQL function and return a result
```js
<result> = exec(<function_name>, <optional array of arguments>);
```

To execute another PostgreSQL function that you've created, you need to call it via SQL with "select function_name(parm1, parm2, etc)".  This can get ugly and unwieldy, as shown below:

**the ugly way**
```js
const html_email = sql('select prepare_message(\'invitation to join org\', \'{"name": "Mark", "orgname": "Acme Corp", "url": "https://acme.com"}\')')[0].prepare_message;
```
Nobody should have to escape nested delimiters.  Also notice the sql result is an array of results (with one result) with the result stuffed into a property with the name of the function.  Ugh!

Calling with sql results in this JSON that requires that you add [0].function_name to the end of the call:
```js
[{"prepare_message":"prepared message text goes here"}]
```
Too much work, and too ugly.

Enter **"exec"**, so you can call it like this:
```js
const html_email = exec('prepare_message', ['invitation to join org', '{"name": "Mark", "orgname": "Acme Corp", "url": "https://acme.com"}']);
```
The result is just the result of the function.  Much cleaner, much easier.

Just note: exec calls exactly two parameters:
1.  the name of the function you want to call
2.  an optional array of parameters you want to pass to the function

### require("http")
#### Like the NodeJS built-in, but easier
This is a SupaScript (JavaScript) wrapper around [pgsql-http](https://github.com/pramsey/pgsql-http).
See the full documentation here:  [http module](./docs/http.md)

## Troubleshooting
If you need to reload a module for some reason, just remove the module's entry from your **plv8_js_modules** table.  Or just wipe it out:  **delete from plv8_js_modules;**

Sometimes a module won't work.  If you're using the minified version, try the non-minified version of the library.  Or vice-versa.  Not every library is going to work, especailly anything that requires a DOM, or access to hardware, or things like socket.io.  This is just basic JavsScript stuff -- it's not going dispense Pepsi and shoot out rainbows.  But it's still very cool and will save you eons of programming time.
### There is NO EVENT LOOP
There's no event loop here -- go back in your time machine to 1998, before you knew what Google was, and all programming was simple, and synchronous, and you could still keep your shoes on going through airport security.  Don't try using promises, async / await, or anyting else that's fancy.  Code it like your grandpa would, on a brand new Pentium-based screamer with a big-honkin' CRT monitor that uses more energy than a Tesla Model S.

## Credits
This is based on the great work of Ryan McGrath here:  [Deep Dive Into PLV8](https://rymc.io/blog/2016/a-deep-dive-into-plv8)

