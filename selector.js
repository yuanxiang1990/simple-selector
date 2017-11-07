(function () {
    var EXPR = {
        CHUNK: /(?:([^ >+~,\+)]+)+)(\s*[>+~]?\s*)?((?:.|\r|\n)*)/g,
        ATTR: /([\.\#]*\w*)((\[((\w+)([\^*!]*\=)(?:'*(\w+)'*))\]))(.*)/,
        ID: /^#(\w+)$/,
        CLASS: /^\.(\w+)$/,
    }, chunker = EXPR.CHUNK;

    function S(selector,context) {
        return new S.prototype.init(selector,context);
    }

    S.prototype = {
        /**
         *
         * @param selector
         * @param context 暂时只支持S类型
         * @returns {S}
         */
        init: function (selector,context) {
            this.context = context||document;
            this['__instance__'] = this._find(selector);
            return this;
        },
        /**
         * 调用原生dom查找方法
         * @param selector
         */
        singleFind: function (selector) {
            var m,context = this['__instance__']||this.context.__instance__||[document],ret = [];
            /**
             * ID选择器
             */
            if (m = EXPR.ID.exec(selector)) {
                for(var i=0;i<context.length;i++){
                    ret = ret.concat(this.toArray(context[i].getElementById(m[1])));
                }
            }
            /**
             * CLASS选择器
             */
            else if (m = EXPR.CLASS.exec(selector)) {
                for(var i=0;i<context.length;i++){
                    ret = ret.concat(this.toArray(context[i].getElementsByClassName(m[1])));
                }
            }
            /**
             * 属性选择器
             */
            else if (m = EXPR.ATTR.exec(selector)) {
                if (m[1]) {
                    ret = this.toArray(this.singleFind(m[1]));
                }
                else {
                    for(var i=0;i<context.length;i++) {
                        ret = ret.concat(this.toArray(context[i].getElementsByTagName("*")));
                    }
                }
                do {
                    var attrStr = m[8];
                    ret = this.filterAttr(ret, m[5], m[7]);
                    EXPR.ATTR.exec(attrStr);
                }
                while (attrStr);
            }
            else {//default tag
                for(var i=0;i<context.length;i++){
                    ret = ret.concat(this.toArray(context[i].getElementsByTagName(selector)));
                }
            }
            return ret;
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
        _find: function (selector) {
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
                ret = ret.concat(this.singleFind(parts.pop()));
                return this.filter(parts, ret);
            }
        },
        find:function (selector) {
            return new this.init(selector,this);
        },
        /**
         * 从右到左过滤
         * @param parts
         * @param ret
         * @returns {*}
         */
        filter: function (parts, ret) {
            if (parts.length == 0) {
                return ret;
            }
            var rel = parts.pop();
            var top = this.singleFind(parts.pop());
            if (/^\s*$/.test(rel)) {
                ret = ret.filter(function (node) {
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
            else if (/^\s*>\s*$/.test(rel)) {//父子关系
                ret = ret.filter(function (node) {
                    var p = node.parentNode;
                    for (var i = 0; i < top.length; i++) {
                        if (p == top[i]) {
                            return true;
                        }
                    }
                    return false;
                });
            }
            else if(/^\s*\+\s*$/.test(rel)){//匹配所有紧接在 prev 元素后的 next 元素
                ret = ret.filter(function (node) {
                    var p = node.previousSibling;
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
            if (this.type(obj) == "Array") {
                return obj;
            }
            if (this.type(obj) == "HTMLCollection") {
                for (var i = 0; i < obj.length; i++) {
                    a.push(obj[i]);
                }
            }
            else if (!this.type(obj) == "Null") {
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