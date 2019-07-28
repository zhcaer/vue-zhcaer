(function(global, factory){
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            ( global.Vue = factory());
})(this, function(){
    //报错函数
    var warn = function(msg){
        console.log("[Vue Warn:]" + msg)
    };
    //Vue的实例个数
    var _uid = 0;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    //判断obj对象中是否有key属性
    var hasOwn = function (obj, key){
        hasOwnProperty.call(obj, key)
    };
    //判断是否Object对象
    function isPlainObject(obj){
        return toString.call(obj) === "[object Object]"
    }
    //拷贝对象
    function extend(to, _form) {
        for (var key in _form) {
            to[key] = _form[key]
        }
        return to;
    }
    //资源选项
    var ASSET_TYPES = [
        'component',
        'directive',
        'filter'
    ];
    //钩子函数
    var LIFECYCLE_HOOKS = [
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'beforeDestroy',
        'destroyed',
        'activated',
        'deactivated',
        'errorCaptured'
    ];
    //HTML元素
    var isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template,blockquote,iframe,tfoot'
    );
    //SVG元素
    var isSVG = makeMap(
        'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
        'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
        true
    );
    var isBuiltInTag = makeMap("slot,component", true); //保留标签
    var isReservedTag = function(tag){
        return isHTMLTag(tag) || isSVG(tag)
    };
    function makeMap(str, toLowerCase){
        var map = {};
        var list = str.split(",");
        var key;
        for(key in list){
            map[list[key]] = true;
        }
        return toLowerCase ? function(val){
            return map[val.toLowerCase()]
        } : function(val){
            return map[val]
        }
    }
    function resolveConstructorOptions(Ctor){
        var options = Ctor.options;
        //判断Ctor.Super = Vue
        return options;
    }
    function validateComponentName(name){
        //检测组件名称是否规范
        if(!/^[a-zA-Z][\w-]*$/.test(name)){
            warn("组件的名称必须是由字母或中横线组成，且必须以字母开头。" + name)
        }
        //检测组件名称是否是内置保留标签或的HTML、SVG元素
        if(isBuiltInTag(name) || isReservedTag(name)){
            warn("不要把内置保留标签或HTML、SVG元素作为组件的名称。" + name);
        }
    }
    function checkComponents(options){
        for(var key in options.components){
            validateComponentName(key)
        }
    }
    //默认策略
    var defaultStrat = function(parentVal, childVal){
        return childVal === undefined ? parentVal : childVal;
    };
    var config = {
        optionMergeStrategies: {}
    };
    //自定义策略
    var strats = config.optionMergeStrategies;
    //el选项的自定义策略
    strats.el = function (parent, child, vm, key){
        if(!vm){
            warn("选项"+key+"只能在Vue的实例中使用。");
        }
        return defaultStrat(parent, child);
    };
    function mergeData(to, _form){
        if(!_form){
            return to;
        }
        //选项的终极合并
    }
    function mergeDataorFn(parentVal, childVal, vm){
        if(!vm){    //组件、子类
            if(!childVal){
                return parentVal;
            }
            if(!parentVal){
                return childVal;
            }
            return function mergeDataFn(parentVal, childVal){
                mergeData(
                    typeof childVal === 'function' ? childVal.call(vm, vm) : childVal,
                    typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal
                )
            }
        } else {    //实例对象
            return function mergedInstanceDataFn(){
                var defaultData = typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal;
                var instanceData = typeof childVal === 'function' ? childVal.call(this, this) : childVal;
                if(instanceData){
                    mergeData(instanceData, defaultData)
                } else {
                    return defaultData;
                }
            }
        }
    }
    //data选项的自定义策略
    strats.data = function(parentVal, childVal, vm, key){
        //组件、子类
        if(!vm){
            if(childVal && typeof childVal !== 'function'){
                warn("在组件或子类中，data选项必须是个function")
            }
            return mergeDataorFn(parentVal, childVal)
        }
        //实例对象
        return mergeDataorFn(parentVal, childVal, vm)
    };
    function mergeHook(parentVal, childVal){
        return childVal ?
            parentVal ?
                parentVal.concat(childVal) :
                Array.isArray(childVal) ? childVal : [childVal] : parentVal;
    }
    //钩子函数的自定义策略
    LIFECYCLE_HOOKS.forEach(function(hook){
        strats[hook] = mergeHook;
    });
    function assertObjectType(name, value, vm){
        if(!isPlainObject(value)){
            warn("选项"+name+"的值无效，必须是个对象。")
        }
    }
    function mergeAssets(parentVal, childVal, vm, key){
        //继承实例原型上的内置组件
        var res = Object.create(parentVal || null);
        if(childVal){
            assertObjectType(key, childVal, vm);
            return extend(res, childVal);
        }
        return res;
    }
    //资源选项自定义策略
    ASSET_TYPES.forEach(function(type){
        strats[type + 's'] = mergeAssets;
    });
    //watch的自定义策略
    strats.watch = function(parentVal, childVal, vm, key){
        if(!childVal){
            return Object.create(parentVal || null)
        }
        assertObjectType(key, childVal, vm);
        if(!parentVal){
            return childVal
        }
        var res = {};
        extend(res, parentVal)
        for(var key in childVal){
            var parent = res[key];
            var child = childVal[key];
            if(parent && !Array.isArray(parent)){
                parent = [parent]
            }
            res[key] = parent ? parent.concat(child) : Array.isArray(child) ? child : [child];
        }
        return res;
    };
    //props选项的自定义策略
    strats.props = function(parentVal, childVal, vm, key){
        if(!parentVal){
            return childVal;
        }
        var res = Object.create(null);
        extend(res, parentVal);
        if(childVal){
            extend(res, childVal)
        }
        return res;
    };
    function normalizeDirectives(options){
        var dirs = options.directives;
        if(dirs){
            for(var key in dirs){
                var def = dirs[key];
                if(typeof def === 'function'){
                    dirs[key] = {
                        bind: def,
                        update: def
                    }
                }
            }
        }
    }
    var camelizeRE = /-(\w)/g;
    function camelize(str){
        //将中横线转成驼峰形式的命名
        return str.replace(camelizeRE, function(_, c){
            return c ? c.toUpperCase() : "";
        })
    }
    function normalizeProps(options){
        var props = options.props;
        if(!props){
            return;
        }
        var res = {};
        var i,val,name;
        if(Array.isArray(props)){
            i = props.length;
            while (i--){
                val = props[i];
                if(typeof val === 'string'){
                    name = camelize(val);
                    res[name] = {
                        type: null
                    }
                } else {
                    warn("使用数组时，应该用字符串来定义:" + val)
                }
            }
        } else if(isPlainObject(props)){
            for(var key in props){
                val = props[key]
                name = camelize(key);
                res[name] = isPlainObject(val) ? val : {
                    type: null
                }
            }
        } else {
            warn("props应该为数组或对象")
        }
        options.props = res;
    }
    function mergeOptions(parent, child, vm){
        //组件规范检测
        checkComponents(child);
        //规范props选项
        normalizeProps(child);
        //规范directives指令选项
        normalizeDirectives(child);
        var options = {};
        var key;
        for(key in parent){
            mergeField(key)
        }
        for(key in child){
            if(!(hasOwn(parent, key))){
                mergeField(key)
            }
        }
        function mergeField(key){
            //默认策略、自定义策略
            var result = strats[key] || defaultStrat;
            options[key] = result(parent[key], child[key], vm, key)
        }
        return options;
    }
    function isNative(Ctor) {
        return typeof Ctor === "function" && /native code/.test(Proxy.toString());
    }
    var hasProxy = typeof Proxy !== "undefined" && isNative(Proxy);
    function warnNonPresent(target, key) {
        warn("属性或方法" + key+"未在实例对象上定义,渲染功能正在尝试访问这个不存在的属性.")
    }
    var allowedGlobals = makeMap(
        'Infinity,undefined,NaN,isFinite,isNaN,' +
        'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
        'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
        'require'
    );
    var hasHeader = {
        has: function (target, key) {
            var has = key in target;
            //key是否是全局对象或内置方法
            var isAllowed = allowedGlobals(key) || (typeof key === "string" && key.charAt(0, "_"));
            if(!has || !isAllowed){
                warnNonPresent(target, key)
            }
            return has;
        }
    };
    var getHeader = {
        get: function (target, key) {
            if(typeof key === 'string' && !(key in target)){
                warnNonPresent(target, key);
                return target[key];
            }
        }
    };
    function  initProxy(vm) {
        //es6  proxy  检测
        if(hasProxy){
            var options = vm.$options;
            //拦截哪些操作
            var Headers = options.render && options.render.withStripped ? getHeader : hasHeader;
            vm._renderProxy = new Proxy(vm, Headers)
        } else {
            vm._renderProxy = vm;
        }
    }
    function initLifecycle(vm) {
        var options = vm.$options;
        //父实例引用父组件
        var parent = options.parent;
        //获取父组件且组件不是抽象组件
        if(parent && options.abstract){
            //自动侦测过程
            while(parent.$options.abstract && parent.$parent){
                //非抽象组件的父组件
                parent = parent.$parent;
                //添加当前实例到父组件的$children属性中
                parent.$children.push(vm);
            }
        }
        // $parent的值指向父级
        vm.$parent = parent;
        //设置$root
        vm.$root = parent ? parent.$root : vm;
        //当前实例的子组件实例数组
        vm.$children = [];
        vm.$refs = {};
        vm._watcher = null;
        vm._inactive = null;
        vm._directInactive = false;
        //是否挂载
        vm._isMounted = false;
        //是否销毁
        vm._isDestroyed = false;
        //是否正在销毁
        vm._isBeingDestroyed = false;
    }
    function initMixin(Vue){
        Vue.prototype._init = function(options){
            var vm = this;
            //有多少个Vue的实例对象
            vm._uid = _uid++;
            //返回一个选项对象
            vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options, vm);
            //渲染函数的作用域代理
            initProxy(vm)
            //将当前实例添加到父实例的$children属性中,并设置自身的 $parent属性指向父实例
            initLifecycle(vm)
        };
    }
    //构造函数
    function Vue(options){
        //安全机制
        if(!(this instanceof Vue)){
            warn("Vue是构造函数，必须用new关键字调用。")
        }
        //初始化
        this._init(options)
    }
    function initExtend(Vue){
        Vue.extend = function(extendOptions){
            extendOptions = extendOptions || {};
            var Super = this;
            var Sub = function(options){
                this._init(options);
            };
            Sub.prototype = Object.create(Super.prototype);
            Sub.prototype.constructor = Sub;
            Sub.options = mergeOptions(Super.options, extendOptions);
            Sub.extend = Super.extend;
            return Sub;
        }
    }
    //全局API
    Vue.options = {
        components: {   //内置组件
            keepAlive:{},
            transition:{},
            transitionGroup:{}
        },
        directives: {},
        _base: Vue
    };
    //初始化
    initMixin(Vue);
    //初始化全局配置函数
    initExtend(Vue)
    return Vue;
});
