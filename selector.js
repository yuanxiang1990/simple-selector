(function () {
    var EXPR = {
        CHUNK: /(?:([^ >+~,\+)]+)+)(\s*[>~]?\s*)?((?:.|\r|\n)*)/g,
        ATTR: /([\.\#]*\w*)((\[((\w+)([\^*!]*\=)(\w+))\]))(.*)/,
        ID: /^#(\w+)$/,
        CLASS: /^\.(\w+)$/,
    }, chunker = EXPR.CHUNK;

    function S(selector) {
        return new S.prototype.init(selector);
    }

    S.prototype = {
        init: function (selector) {
            this['__instance__'] = this.toArray(this.find(selector));
            return this;
        },
        /**
         * 调用原生dom查找方法
         * @param selector
         */
        singleFind: function (selector) {
            var m;
            /**
             * ID选择器
             */
            if (m = EXPR.ID.exec(selector)) {
                return document.getElementById(m[1]);
            }
            /**
             * CLASS选择器
             */
            else if (m = EXPR.CLASS.exec(selector)) {
                return document.getElementsByClassName(m[1]);
            }
            /**
             * 属性选择器
             */
            else if (m = EXPR.ATTR.exec(selector)) {
                if (m[1]) {
                    var ret = this.singleFind(m[1]);
                }
                else {
                    var ret = document.body.getElementsByTagName("*")
                }
                do {
                    var attrStr = m[8];
                    ret = this.filterAttr(ret, m[5], m[7]);
                    EXPR.ATTR.exec(attrStr);
                }
                while (attrStr);
                return ret;
            }
            else {//default tag
                return document.getElementsByTagName(selector);
            }
        },
        /**
         * 属性过滤器
         * @param ret
         * @param name
         * @param val
         */
        filterAttr: function (ret, name, val) {
            var r = [];
            for (var i = 0; i < ret.length; i++) {
                if (ret[i].getAttribute(name) == val) {
                    r.push(ret[i]);
                }
            }
            return r;
        },
        /**
         * 核心dom查找方法
         * @param parts
         * @returns {*}
         */
        find: function (selector) {
            var soFar = selector,
                m, parts = [];
            /**
             * chunker拆分
             */
            do {
                chunker.exec("");
                m = chunker.exec(soFar);
                if (m) {
                    soFar = m[3];
                    parts.push(m[1]);
                    soFar && m[2] && parts.push(m[2]);
                }
            }
            while (m);

            var ret = [];
            if (parts.length == 0) {
                return null;
            }
            else if (parts.length == 1) {
                return this.singleFind(parts.pop());
            }
            else {
                ret.push(this.singleFind(parts.pop()));
                return this.filter(parts, ret);
            }
        },
        /**
         * 从右到左过滤
         * @param parts
         * @param ret
         * @returns {*}
         */
        filter: function (parts, ret) {
            var rel = parts.pop();
            var top = this.singleFind(parts.pop());
            if (parts.length == 0) {
                return ret;
            }
            if (/\s*/.test(rel)) {
                ret.filter(function (node) {
                    var p = node.parentNode;
                    while (p != null) {
                        for (var i = 0; i < top.length; i++) {
                            if (p == top[i]) {
                                return true;
                            }
                        }
                        p = p.parentNode;
                    }
                    return false;
                })
            }
            else if (/\s*>\s*/.test(rel)) {//父子关系
                ret.filter(function (node) {
                    var p = node.parentNode;
                    for (var i = 0; i < top.length; i++) {
                        if (p == top[i]) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            return this.filter(parts, ret);
        },
        toArray: function (obj) {
            var a = [];
            if (this.type(obj) == "HTMLCollection") {
                for (var i = 0; i < obj.length; i++) {
                    a.push(obj[i]);
                }
            }
            else {
                a[0] = obj;
            }
            return a;
        },
        type: function (obj) {
            return Object.prototype.toString.call(obj).match(/\[object\s*(\w+)\]/)[1];
        }
    }

    S.prototype.init.prototype = S.prototype;
    window.S = S;
})(window, undefined)