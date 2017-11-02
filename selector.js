(function () {
    var EXPR = {
        CHUNK:/([a-zA-Z]+|#\w+|\.\w+)(\s*[>~]?\s*)?((?:.|\r|\n)*)?/g,
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
                this['__instance__'] = this.singleFind(selector);
                return this;
            }
            else {
                this['__instance__'] = this.find(match);
                return this;
            }
        },
        singleFind:function (selector) {
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
            ret.push(this.singleFind(match[3]));
            return this.filter(match,ret);
        },

        /**
         * 从右向左过滤
         * */
        filter:function (match,ret) {
            var rel = match[2];
            var top = this.singleFind(match[1]);
            if(/\s*/.test(rel)){
                ret.filter(function (node) {
                    var p = node.parentNode;
                    while (p!=null){
                        for(var i = 0;i<top.length;i++){
                            if(p == top[i]){
                                return true;
                            }
                        }
                        p = p.parentNode;
                    }
                    return false;
                })
            }
            else if(/\s*>\s*/.test(rel)){//父子关系
                ret.filter(function (node) {
                    var p = node.parentNode;
                    for(var i = 0;i<top.length;i++){
                        if(p == top[i]){
                            return true;
                        }
                    }
                    return false;
                });
            }
            return ret;
        }
    }
    S.prototype.init.prototype = S.prototype;
    window.S = S;
})(window,undefined)