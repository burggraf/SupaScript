# console module
This built-in module emulates the JavaScript `console` object.


### Quick example:
-  Add `console` statements inside your function.

```js
create or replace function test_console() returns text as $$
  console.time('test-my-loop');
  console.log('logged to the console at:', new Date());
  for (let x = 0; x < 100000; x++) {
    const busyWork = 'this is loop #' + x.toString();
  }
  console.timeEnd('test-my-loop'); // profiling FTW!
  return 'ok';
$$ language plv8;
```

-  Run your function.

```sql
select test_console();
```

-  Check the results.

```sql
select log_type,content from supascript_log order by created desc limit 100;
```
We log additional data into the supascript_log that you may or may not find useful, including `created, _catalog, _user, _schema, _schemas, _pid` (time created, current catalog, current user, current schema, current schema path setting, current process id).


## Methods
- All methods (exept `time` write a record to the `supascript_log` PostgreSQL table.
- Currently, the only difference between `log`, `info`, `warn`, and `error` is that `supascript_log.log_type` is set to 'LOG', 'INFO', 'WARN' or 'ERROR' when the item is logged.  This allows you to filter out the type of log records you want to see, though, which is quite handy.

### log()
#### parameters
- any or none

#### example
```js
console.log('log a string', 42, new Date(), {'key': 'value'});
```
### info()
#### parameters
- any or none

#### example
```js
console.info('log a string', 42, new Date(), {'key': 'value'});
```

### warn()
#### parameters
- any or none

#### example
```js
console.warn('log a string', 42, new Date(), {'key': 'value'});
```

### error()
#### parameters
- any or none

#### example
```js
console.error('log a string', 42, new Date(), {'key': 'value'});
```

### assert
Accepts an expression as the first parameter.  If the expression evaluates to false, the message is written to the log table.  Otherwise it's not.
#### parameters
- expression (boolean)
- followed by any other parameters

#### example
```js
console.assert(x > 10, 'x was not greater than 10!');
```

### time
Starts a timer which can be optionally named.  Unlimited multiple timers can run simultaneously as long as they have unique names.
#### parameters
- name (string) (optional)

#### example
```js
console.time('my-timer');
// do some work here
console.timeEnd('my-timer');
```

### timeEnd
Log the time interval since the start of the named timer (in milliseconds).
#### parameters
- name (string) (optional) (the name must match a timer started with `console.time()`)

#### example
```js
console.time('my-timer');
// do some work here
console.timeEnd('my-timer');
```
