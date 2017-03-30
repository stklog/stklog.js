var __cache_logs = [];
(function init() {
    'use strict';
    var handled_method = [
        // level is based on syslog values
        { "func": "debug", "level": 7 },
        { "func": "info", "level": 6 },
        // log here is considered as notice in syslog however we could consider it's debug since the output is similar
        { "func": "log", "level": 5 },
        { "func": "warn", "level": 4 },
        { "func": "error", "level": 3 },
    ];
    __create_stack();
    __group();
    __group_end();
    for (var i = 0; i < handled_method.length; i++) {
        __override_method(handled_method[i]);
    }
    // console.log("log", {});
    // console.debug("debug");
    // console.info("info");
    // console.warn("warning");
    // console.error("error");
    // console.group("stack");
    // console.log("inside stack");
    // console.group("stackinside");
    // console.warn("warning inside stack");
    // console.groupEnd("stackinside");
    // console.log("inside stack end");
    // console.groupEnd("stack");
    // console.log(console);
})();

function __group() {
    var original_group = console.group;
    console.group = function() {
        original_group.apply(window, arguments);
    };
}

function __group_end() {
    var original_group_end = console.groupEnd;
    console.groupEnd = function() {
        original_group_end.apply(window, arguments);
    };
}

function __create_stack() {

}

function __create_log(message, extra, level) {
    var log = { "message": message, "level": level, "extra": extra }
    __cache_logs.push(log)
}

function __override_method(method_meta) {
    var level = method_meta.level;
    var original_method = console[method_meta.func];
    console[method_meta.func] = function() {
        var args = Array.prototype.slice.call(arguments);
        original_method.apply(window, arguments);
        __create_log(args.shift(), args, level);
    };
}