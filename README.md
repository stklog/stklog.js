# Stklog.js

Easily send your javascript logs to [stklog.io](https://stklog.io).
Stklog.js proxy the standard `console.*` methods to send automatically your logs to stklog.io. 

## Usage
It's really simple, you have to call one stklog init function to give the library your project key, and then you can use the relevant console methods.

```javascript
   stklog_init("<project_key>");
   console.info("info");
   console.warn("warning");
   console.error("error");
```

## Stacks
`Stklog.io` allow you to create stacks which create logical blocks of logs on our plateform for you to have context and insights on what really happened during the request.

Following the javascript language, there is a `console.group` and `console.groupEnd` which you can use to define a new stack on our side. We create a default stack for you when you call the `stklog_init` function, so your logs are always attached to a stack.

```javascript
	stklog_init("<project_key>");
	console.group("newstack");
	console.info("inside newstack");
	console.groupEnd();
```
You can obviously do nested stacks, pretty much with no depth limits. 

```javascript
    stklog_init("<project_key>");
    console.group("newstack");
    console.info("inside newstack");
    
    console.group("nestedstack");
    console.warn("Warning inside nestedstack");
    console.groupEnd();
    
    console.groupEnd();
```

You can pass extra parameters, we advice to put contextual data for you to debug with more efficiency. We will use the second parameter as extra values ONLY IF it's a hash ({}).

```javascript
   stklog_init("<project_key>");
   console.group("newstack", {"username":"Petunia", "age":"42"});
   console.info("inside newstack");
   console.groupEnd();
```

But we strongly advice to use an object, it will be more readable and you can name your values. 
## Logs
We proxy only these methods which we map on syslog' severity levels :

- `console.debug`   -> **debug (7)**
- `console.info`    -> **info (6)**
- `console.log`     -> **notice (5)**
- `console.warn`    -> **warning (4)**
- `console.error`   -> **error (3)**

You can pass extra parameters. We will use the second parameter as extra values ONLY IF it's a hash ({}).

```javascript
   stklog_init("<project_key>");
   console.info("info");
   console.warn("warning", {"extra":"parameters"});
```

However, you can still give other types in 2nd, 3rd, 4th .. parameters, they will be proxied to the original `console.*` methods.

```javascript
   stklog_init("<project_key>");
   console.info("info");
   console.warn("warning", "test", "whatever");
```
In that specific case, it will send the warning log without extra parameter, but the original `console.warn` will still write **warning test whatever**
## Miscellaneous
You can get the current stack's request_id by calling : 

```stklog_get_request_id()```

Really useful if you want to also log your backend request associated to your current context. You just have to pass this `request_id` (usually as a header) to your API during your requests and then use it as a request_id when you define your stack on the backend side.