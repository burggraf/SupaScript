CREATE OR REPLACE FUNCTION supascript_init() RETURNS VOID 
AS $$

    /* plv8.execute('set search_path to "$user", public, auth, extensions'); */
    this.moduleCache = {};

    // execute a Postgresql function
    // i.e. exec('my_function',['parm1', 123, {"item_name": "test json object"}])
    this.exec = function(function_name, parms) {
      var func = plv8.find_function(function_name);
      return func(...parms);
    }

    this.load = function(key, source) {
        var module = {exports: {}};
        try {
            eval("(function(module, exports) {" + source + "; })")(module, module.exports);
        } catch (err) {
            plv8.elog(ERROR, `eval error in source: ${err} (SOURCE): ${source}`);
        }

        // store in cache
        moduleCache[key] = module.exports;
        return module.exports;
    };

    // execute a sql statement against the Postgresql database with optional args
    // i.e. sql('select * from people where first_name = $1 and last_name = $2', ['John', 'Smith'])
    this.sql = function(sql_statement, args) {
      if (args) {
        return plv8.execute(sql_statement, args);
      } else {
        return plv8.execute(sql_statement);
      }
    };

    // emulate node.js "require", with automatic download from the internet via CDN sites
    // optional autoload (boolean) parameter allows the module to be preloaded later
    // i.e. var myModule = require('https://some.cdn.com/module_content.js', true)
    this.require = function(module, autoload) {
        if (module === 'http' || module === 'https') {
          // emulate NodeJS require('http')
          module = 'https://raw.githubusercontent.com/burggraf/SupaScript/main/modules/http.js';
        }
        if(moduleCache[module])
            return moduleCache[module];
        var rows = plv8.execute(
            'select source from supascript_js_modules where module = $1',
            [module]
        );

        if (rows.length === 0 && module.substr(0,4) === 'http') {
            try {
                source = plv8.execute(`SELECT content FROM http_get('${module}');`)[0].content;
            } catch (err) {
                plv8.elog(ERROR, `Could not load module through http: ${module}`, JSON.stringify(err));
            }
            try {
                /* the line below is written purely for esthetic reasons, so as not to mess up the online source editor */
                /* when using standard regExp expressions, the single-quote char messes up the code highlighting */
                /* in the editor and everything looks funky */
                const quotedSource = source.replace(new RegExp(String.fromCharCode(39), 'g'), String.fromCharCode(39, 39));

                plv8.execute(`insert into supascript_js_modules (module, autoload, source) values ('${module}', ${autoload ? true : false}, '${quotedSource}')`);
            } catch (err) {
                plv8.elog(ERROR, `Error inserting module into supascript_js_modules: ${err} ${module}, ${autoload ? true : false}, '${plv8.quote_literal(source)}'`);
            }
            return load(module, source);
        } else if(rows.length === 0) {
            plv8.elog(NOTICE, `Could not load module: ${module}`);
            return null;
        } else {
            return load(module, rows[0].source);
        }

    };

    // Grab modules worth auto-loading at context start and let them cache
    var query = `select module, source from supascript_js_modules where autoload = true`;
    plv8.execute(query).forEach(function(row) {
        this.load(row.module, row.source);
    });
$$ LANGUAGE PLV8;
/* SET search_path TO "$user", public, auth, extensions; */

