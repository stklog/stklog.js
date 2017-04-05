(function() {
    var __request_ids = [__generate__UUID()];
    var __cache = { "logs": [], "stacks": [] };
    var __url = "https://api.stklog.io";
    var error_print = undefined;
    var project_key = "";

    window.stklog_init = function(p_key) {
        'use strict';
        project_key = p_key;
        var handled_method = [
            // level is based on syslog values
            // we don't use log, since we need a way to write to the console when something is going wrong on our side.
            { "func": "debug", "level": 7 },
            { "func": "info", "level": 6 },
            { "func": "log", "level": 5 },
            { "func": "warn", "level": 4 },
            { "func": "error", "level": 3 },
        ];
        __create_stack("main");
        __group();
        __group_end();
        for (var i = 0; i < handled_method.length; i++) {
            __override_method(handled_method[i]);
        }
        setInterval(__send_stacks, 5000);
        setInterval(__send_logs, 7500);
        window.addEventListener("beforeunload", __send_all);
    };
    window.stklog_get_request_id = function() { return __request_ids[__request_ids.length - 1]; }

    function __send_all() {
        __send_stacks();
        __send_logs();
    }

    function __send_stacks() {
        if (__cache.stacks.length > 0) {
            __send("/stacks", __cache.stacks.slice(), function(err, data) {
                if (err) {
                    error_print("POST on " + __url + endpoint + " failed with answer :");
                    error_print(err);
                }
                __cache.stacks = [];
            });
        }
    }

    function __send_logs() {
        if (__cache.logs.length > 0) {
            __send("/logs", __cache.logs.slice(), function(err, data) {
                __cache.logs = [];
                if (err) {
                    error_print("POST on " + __url + endpoint + " failed with answer :");
                    error_print(err);
                }
            });
        }
    }

    function __send(endpoint, array, done) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", __url + endpoint, true);
        xhttp.onerror = function() {
            done(xhttp.response);
        };
        xhttp.onload = function() {
            done(null, xhttp.response);
        };
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Stklog-Project-Key", project_key);
        xhttp.send(JSON.stringify(array));
    }

    function __parse_stacktrace(error) {
        var array_error = error.stack.match(/[^\r\n]+/g);
        var last_trace = array_error[array_error.length - 1];
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec(last_trace);
        return matches[1];
    }

    function __parse_line_file(error) {
        var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
        var obj = { "filename": "", "line": 0 };
        if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
            var last_trace = __parse_stacktrace(error);
            var array = last_trace.trim().split(":");
            obj.filename = array[0] + ":" + array[1];
            obj.line = parseInt(array[2]);
        } else if (error.stack) {
            var last_trace = __parse_stacktrace(error);
            var array = last_trace.trim().split(":");
            obj.filename = array[0] + ":" + array[1];
            obj.line = parseInt(array[2]);
        }
        return obj;
    }

    function __group() {
        var original_group = console.group;
        console.group = function() {
            original_group.apply(window, arguments);
            var args = Array.prototype.slice.call(arguments);
            __request_ids.push(__generate__UUID());
            __create_stack(args.shift(), args.shift());
        };
    }

    function __group_end() {
        var original_group_end = console.groupEnd;
        console.groupEnd = function() {
            original_group_end.apply(window, arguments);
            if (__request_ids.length > 1) {
                __request_ids.pop();
            }
        };
    }

    function __get_parent_request_id() { return (__request_ids.length > 1) ? __request_ids[__request_ids.length - 2] : undefined; }

    function __create_stack(name, extra) {
        var meta = __parse_line_file(new Error());
        var current_date = new Date();
        var stack = {
            "request_id": stklog_get_request_id(),
            "timestamp": current_date.toISOString(),
            "line": meta.line,
            "file": meta.filename,
            "hostname": (location.hostname.length > 0) ? location.hostname : "null"
        };
        if (extra && !isArray(extra) && isObject(extra)) {
            stack.extra = extra;
        }
        if (typeof name != "undefined") {
            stack.name = name;
        }
        var parent_request_id = __get_parent_request_id();
        if (typeof parent_request_id != "undefined") {
            stack.parent_request_id = parent_request_id;
        }
        __cache.stacks.push(stack);
    }

    function __create_log(message, extra, level) {
        var meta = __parse_line_file(new Error());
        var current_date = new Date();
        var log = {
            "message": message,
            "level": level,
            "timestamp": current_date.toISOString(),
            "line": meta.line,
            "file": meta.filename,
            "request_id": stklog_get_request_id(),
        };
        if (extra && !isArray(extra) && isObject(extra)) {
            log.extra = extra;
        }
        if (typeof level == "undefined") {
            log.level = 7;
        }
        __cache.logs.push(log)
    }

    function __override_method(method_meta) {
        var level = method_meta.level;
        var original_method = console[method_meta.func];
        if (method_meta.func == "error") {
            error_print = original_method;
        }
        console[method_meta.func] = function() {
            var args = Array.prototype.slice.call(arguments);
            original_method.apply(window, arguments);
            __create_log(args.shift(), args.shift(), level);
        };
    }

    function __generate__UUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    function isArray(obj) {
        return isObject(obj) && (obj instanceof Array);
    }

    function isObject(obj) {
        return obj && (typeof obj === "object");
    }
})();