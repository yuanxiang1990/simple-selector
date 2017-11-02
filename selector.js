(function () {
    var EXPR = {
        CHUNK:/([a-zA-Z]+|#\w+|\.\w+)(\s*[>~]?\s*)?([a-zA-Z]+|#\w+|\.\w+)?/g,
        ID:/^#(\w+)$/,
        CLASS:/^\.(\w+)$/
    }
    function S(selector) {
        return new S.prototype.init(selector);
    }
    S.prototype = {
        init:function (selector) {
            var match = EXPR.CHUNK.exec(selector);
            if(!match[2]||!match[3]) {
                this['__instance__'] = this.findOne(selector);
                return this;
            }
            else {
                this['__instance__'] = this.find(match);
                return this;
            }
        },
        findOne:function (selector) {
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
            else{
                return document.getElementsByTagName(selector);
            }
        },

        find:function (match) {
            var ret = [];
            var m;
            if(m = EXPR.ID.exec(match[3])){
                ret.push(document.getElementById(m[1]));
                return this.filter(match,ret);
            }
            else if(m = EXPR.CLASS.exec(match[3])){
                ret.push(document.getElementsByClassName(m[1]));
                return this.filter(match,ret);
            }
            return this;
        },

        /**
         * 从右向左过滤
         * */
        filter:function (match,ret) {
            var rel = match[2];
            var top = this.findOne(match[1]);
            if(/\s*/.test(rel)){
                ret.filter(function (node) {
                    var p = node.parentNode;
                    while (p!=null){
                        if(p == top){
                            return true;
                        }
                        p = p.parentNode;
                    }
                    return false;
                })
            }
            return ret;
        }
    }
    S.prototype.init.prototype = S.prototype;
    window.S = S;
})(window,undefined)