(function () {
    var EXPR = {
        CHUNK:/([a-zA-Z]+|#\w+|\.\w+)(\s*[>~]?\s*)?((?:.|\r|\n)*)/g,
        ID:/^#(\w+)$/,
        CLASS:/^\.(\w+)$/
    }, chunker = EXPR.CHUNK;
    function S(selector) {
        return new S.prototype.init(selector);
    }
    S.prototype = {
        init:function (selector) {
            var soFar = selector,
            m,parts = [];
            /**
             * chunker拆分
             */
            do{
                chunker.exec( "" );
                m = chunker.exec( soFar );
                if ( m ) {
                    soFar = m[3];
                    parts.push( m[1] );
                    m[2]&&parts.push( m[2] );
                }
            }
            while(m);
            this['__instance__'] = this.find(parts);
            return this;
        },
        /**
         * 调用原生dom查找方法
         * @param selector
         */
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
        /**
         * 核心dom查找方法
         * @param parts
         * @returns {*}
         */
        find:function (parts) {
            var ret = [];
            if(parts.length==0){
                return null;
            }
            else if(parts.length==1){
                return this.singleFind(parts.pop());
            }
            else{
                ret.push(this.singleFind(parts.pop()));
                return this.filter(parts,ret);
            }
        },
        /**
         * 从右到左过滤
         * @param parts
         * @param ret
         * @returns {*}
         */
        filter:function (parts,ret) {
            var rel = parts.pop();
            var top = this.singleFind(parts.pop());
            if(parts.length==0){
                return ret;
            }
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
            return this.filter(parts,ret);
        }
    }
    S.prototype.init.prototype = S.prototype;
    window.S = S;
})(window,undefined)