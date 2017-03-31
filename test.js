(function toto() {
    stklog_init("72089d33-fbd9-4f82-9060-c5fc2eda193e");
    console.info("info");
    console.warn("warning");
    console.group("test", { "header": "myvalue" });
    console.error("YES");
    console.group("testception");
    console.info("inside ception");
    console.groupEnd("testception");
    console.groupEnd("test");
    console.info("infoend");
})();