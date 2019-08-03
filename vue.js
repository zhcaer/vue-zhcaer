(function(global, factory){
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            ( global.Vue = factory());
})(this, function(){
    //报错函数
    var warn = function(msg){
        console.log("[Vue Warn:]" + msg)
    };
    var warn$2;
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
    //配置
    var config = {
        optionMergeStrategies: {}
    };
    //默认策略
    function defaultStrat(parentVal, childVal){
        return childVal === undefined ? parentVal : childVal;
    }
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
                    typeof childVal === 'function' ? childVal.call(this, this) : childVal,
                    typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
                )
            }
        } else {    //实例对象
            return function mergedInstanceDataFn(){
                var defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;
                var instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
                if(instanceData){
                    return mergeData(instanceData, defaultData)
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
    //props、methods、computed选项的自定义策略
    strats.props =
    strats.methods =
    strats.computed = function(parentVal, childVal, vm, key){
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
    function callHook(vm, hook){
        var headers = vm.$options[hook];
        if(headers){
            for(var i=0,j=headers.length; i<j; i++){
                headers[i].call(vm);
            }
        }
    }
    function initProps(vm, props){

    }
    function initMethods(vm, methos){

    }
    function initComputed(vm, computed){

    }
    var isObject = function(obj){
        return obj !== null && typeof obj === 'object';
    };
    var hasProto = "__proto__" in {};
    //开关
    var shouldObserve = true;
    function toggleObServing(value){
        shouldObserve = value;
    }
    //代理原型
    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);
    var methodsToPatch = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse',
    ];
    methodsToPatch.forEach(function(key){
        var cacheMothods = arrayProto[key];
        def(arrayMethods, key, function(){
            var args = [],
                len = arguments.length;
            while(len--){
                args[len] = arguments[len]
            }
            var ob = this.__ob__;
            var inserted;
            var result = cacheMothods.apply(this, args);
            switch(key){
                case "push":
                case "unshift":
                    inserted = args;
                    break;
                case "splice":
                    inserted = args.slice(2);
            }
            if(inserted){
                //监听新添加的数据，加入响应式系统中
                ob.observeArray(inserted);
            }
            //通知依赖更新
            ob.dep.notify();
            return result;
        });
    });
    //响应式系统的核心,将数据对象的属性转化成访问器属性 getter setter
    function defineReactive(obj, key, val, shallow){
        var dep = new Dep();    //收集依赖
        var property = Object.getOwnPropertyDescriptor(obj, key);
        var getter = property && property.get;
        var setter = property && property.set;
        if((!getter || setter) && arguments.length === 2){
            val = obj[key]; //深度观测
        }
        var childOb = !shallow && observe(val);
        Object.defineProperty(obj, key, {
            get: function(){    //依赖收集
                var value = getter ? getter.call(obj) : val;
                if(Dep.target){
                    dep.depend();
                    if(childOb){
                        childOb.dep.depend();
                    }
                }
                return value;
            },
            set: function(newVal){ //调用收集的依赖
                var vaule = getter ? getter.call(obj) : val;
                if(newVal === vaule || (newVal !== newVal && value !== value)){
                    return;
                }
                if(setter){
                    setter.call(obj, newVal)
                } else {
                    val = newVal;
                }
                childOb = !shallow && observe(val);
                dep.notify();
            }
        });

    }
    function Dep() {
        this.subs = [];
    }
    Dep.target = null;
    Dep.prototype.depend = function(){
        console.log("依赖收集");
    };
    Dep.prototype.addSub = function(sub){
        this.subs.push(sub);
    };
    Dep.prototype.notify = function(){
        var subs = this.subs.slice();
        for(var i = 0; i<subs.length; i++){
            subs[i].update();    //依赖更新
        }
    };
    function def(obj, key, val) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: false,   //属性不可枚举
            configurable: true,  //属性可配置
        })
    }
    function Observe(value){
        this.value = value;
        this.vmCount = 0;
        //回调列表->依赖
        this.dep = new Dep();
        //添加__ob__标志
        def(value, "__ob__", this);
        if(Array.isArray(value)){
            //数组的处理
            var augment = hasProto ? protoAugment : copyAugment;
            augment(value, arrayMethods, arrayKeys);
        } else {
            //递归
            this.walk(value);
        }
    }
    Observe.prototype.observeArray = function(items){
        for(var i = 0, j = items.length; i<j; i++){
            observe(items[i])
        }
    };
    Observe.prototype.walk = function walk(obj){
        var keys = Object.keys(obj);
        for(var i=0,j=keys.length; i<j; i++){
            defineReactive(obj, keys[i]);
        }
    };
    function protoAugment(target, src) {    //目标源，代理原型对象
        target.__proto__ = src;
    }
    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
    //兼容IE11以下的浏览器，__proto__
    function copyAugment(target, src, keys) {
        for(var i = 0, j = keys.length; i<j; i++){
            var key = keys[i];
            def(target, key, src[key]);
        }
    }
    //响应式系统的入口
    function observe(value, asRootData){
        if(!isObject(value)){
            return;
        }
        var ob;
        if(hasOwn(value, "__ob__") && value.__ob__ instanceof Observe){
            ob = value.__ob__
        } else if(shouldObserve &&
            (Array.isArray(value) || isPlainObject(value) &&
                Object.isExtensible(value) && //是否可扩展
                !value._isVue)){
            ob = new Observe(value);
        }
        if(ob && asRootData){
            ob.vmCount++;
        }
        return ob;
    }
    var noop = function(){};
    var sharedProperty = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop,
    };
    //代理
    function proxy(target, data, key){
        sharedProperty.get = function(){
            return this[data][key]
        };
        sharedProperty.set = function(val){
            this[data][key] = val;
        };
        Object.defineProperty(target, key, sharedProperty)
    }
    function isReserved(str){
        var c = (str + "").charCodeAt(0);//Unicode编码
        return c === 0x24 || c === 0x5f;
    }
    function getData(data, vm){
        return data.call(vm, vm);
    }
    function initData(vm){
        var data = vm.$options.data;
        data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
        if(!isPlainObject(data)){
            data = {};
            warn("data选项应该为object对象")
        }
        var keys = Object.keys(data);
        var props = vm.$options.props;
        var methods = vm.$options.methods;
        var computed = vm.$options.computed;
        var i = keys.length;
        while(i--){
            var key = keys[i];
            if(methods && hasOwn(methods, key)){
                warn("methods:"+key+"选项已经定义为data的属性。")
            }
            if(props && hasOwn(props, key)){
                warn("props:"+key+"选项已经定义为data的属性。")
            } else if(!isReserved(key)) {
                proxy(vm, "_data", key)
            }
        }
        observe(data, true)
    }
    function initState(vm){
        var opts = vm.$options;
        if(opts.props){
            initProps(vm, opts.props)
        }
        if(opts.methods){
            initMethods(vm, opts.methods)
        }
        if(opts.computed){
            initComputed(vm, opts.computed)
        }
        if(opts.data){
            initData(vm)
        } else {
            observe(vm._data = {}, true)
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
    function initMixin(Vue){
        Vue.prototype._init = function(options){
            var vm = this;
            //有多少个Vue的实例对象
            vm._uid = _uid++;
            //标志
            vm._isVue = true;
            //返回一个选项对象
            vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options, vm);
            //渲染函数的作用域代理
            initProxy(vm);
            //将当前实例添加到父实例的$children属性中,并设置自身的 $parent属性指向父实例
            initLifecycle(vm);
            //执行钩子函数beforCreate
            callHook(vm, "beforeCreate");
            //数据初始化
            initState(vm);
            //执行钩子函数created
            callHook(vm, "created");
            //挂载组件
            if(this.$options.el){
                vm.$mount(this.$options.el);
            }
        };
    }
    //Vue构造函数
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
    //初始化
    initMixin(Vue);
    //初始化全局配置
    initExtend(Vue);
    var inBrowser = typeof window !== 'undefined';
    function query(el){
        if(typeof el === 'string'){
            var element = document.querySelector(el);
            if(!element){
                warn("cannot fine element" + el)
            }
            return element;
        } else {
            return el;
        }
    }
    //runtime运行时构建
    Vue.prototype.$mount = function(el){
        el = el && query(el);
        //挂载组件
        // return mountComponent(this, el);
    };
    //编译器默认选项
    var baseOptions = {
        expectHTML: true,
        modules: [],
        directives: {},
        isPreTag: function(){},
        isUnaryTag: function(){},//单标签
        canBeleftOpenTag: function(){},//闭合标签
        isReservedTag: function(){},//保留标签
        mustUseProp: function(){},//props邦定
        getTagNamespace: function(){},//命名空间
        staticKeys: function(){},//根据modules生成字符串
    };
    var comment = /^<!\--/; //注释节点
    var conditionalComment = /^<!\[/; //条件注释
    var doctype = /^<!DOCTYPE [^>]+>/i; //doctype
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';   //  XML  <前缀+标签名>
    var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
    var startTagOpen = new RegExp(("^<" + qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
    var encodedAttr = /&(?:lt|gt|quot|amp);/g;
    var isPlainTextElement = makeMap("script,style,textarea" ,true);
    var isIgnoreNewlineTag = makeMap('pre,textarea', true);
    var shouldIgnoreFirstNewline = function(tag, html) {
        return tag && isIgnoreNewlineTag(tag) && html[0] === '\n';
    };
    function no(a, b, c){
        return false;
    }
    function decodeAttr(value, shouldDecodeNewlines) {
        var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
        return value.replace(re, function(match) {
            return decodingMap[match];
        })
    }
    function parseHTML(html, options){
        var stack = []; //存储标签名
        var expectHTML = options.expectHTML; //true
        var isUnaryTag$$1 = options.isUnaryTag || no;
        var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
        var index = 0; //字符流的读入位置
        var last, lastTag; //last还未被解析的html字符串  lastTag = 标签名
        while (html) {
            last = html;
            if (!lastTag || !isPlainTextElement(lastTag)) {
                //解析的内容不是在纯文本标签(script style textarea)
                var textEnd = html.indexOf('<');
                if (textEnd === 0) {
                    //第一个字符是 < 注释节点
                    if (comment.test(html)) {
                        var commentEnd = html.indexOf('-->');

                        if (commentEnd >= 0) {
                            advance(commentEnd + 3); //切割(下标)
                            continue
                        }
                    }
                    //第一个字符是 < 条件注释
                    if (conditionalComment.test(html)) {
                        var conditionalEnd = html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            advance(conditionalEnd + 2);
                            continue
                        }
                    }
                    //第一个字符是 < DOCTYPE
                    var doctypeMatch = html.match(doctype);
                    if (doctypeMatch) {
                        advance(doctypeMatch[0].length);
                        continue
                    }
                    //第一个字符是 < 闭合标签
                    var endTagMatch = html.match(endTag);
                    if (endTagMatch) {
                        var curIndex = index;
                        advance(endTagMatch[0].length);
                        parseEndTag(endTagMatch[1], curIndex, index);
                        continue
                    }
                    //第一个字符是 < 标签    名称
                    var startTagMatch = parseStartTag();
                    if (startTagMatch) {
                        handleStartTag(startTagMatch);
                        if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                            advance(1);
                        }
                        continue
                    }
                }
                var text = (void 0),
                    rest = (void 0),
                    next = (void 0);
                if (textEnd >= 0) {
                    rest = html.slice(textEnd);
                    while(
                        !endTag.test(rest) &&
                        !startTagOpen.test(rest) &&
                        !comment.test(rest) &&
                        !conditionalComment.test(rest)
                    ){
                        next = rest.indexof('<', 1);
                        if(next <0){
                            break
                        }
                        textEnd += next;
                        rest = html.slice(textEnd);
                    }
                    text = html.substring(0, textEnd);
                    advance(textEnd);
                }
                if (textEnd < 0) {
                    text = html;
                    html = "";
                }
            } else {
                //是在纯文本标签(script style textarea)
            }
        }
        //字符串切割
        function advance(n) {
            index += n; //index    11 字符流的读入位置
            html = html.substring(n); //删除 0-11
        }
        //获取标签名
        function parseStartTag() {
            var start = html.match(startTagOpen);
            if (start) {
                var match = {
                    tagName: start[1],
                    attrs: [],
                    start: index
                };
                advance(start[0].length);
                var end, attr;
                while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    advance(attr[0].length);
                    match.attrs.push(attr);
                }
                if (end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end = index;
                    return match
                }
            }
        }
        function handleStartTag(match) {
            var tagName = match.tagName;
            var unarySlash = match.unarySlash;

            if (expectHTML) {
                if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    parseEndTag(lastTag);
                }
                if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
                    parseEndTag(tagName);
                }
            }

            var unary = isUnaryTag$$1(tagName) || !!unarySlash;

            var l = match.attrs.length;
            var attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                var args = match.attrs[i];
                var value = args[3] || args[4] || args[5] || '';
                var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ?
                    options.shouldDecodeNewlinesForHref :
                    options.shouldDecodeNewlines;
                attrs[i] = {
                    name: args[1],
                    value: decodeAttr(value, shouldDecodeNewlines)
                };
            }

            if (!unary) {
                stack.push({
                    tag: tagName,
                    lowerCasedTag: tagName.toLowerCase(),
                    attrs: attrs
                });
                lastTag = tagName;
            }

            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end);
            }
        }
        function parseEndTag(tagName, start, end) {
            var pos, lowerCasedTagName;
            if (start == null) {
                start = index;
            }
            if (end == null) {
                end = index;
            }

            // Find the closest opened tag of the same type
            if (tagName) {
                lowerCasedTagName = tagName.toLowerCase();
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                        break
                    }
                }
            } else {
                // If no tag name is provided, clean shop
                pos = 0;
            }

            if (pos >= 0) {
                // Close all the open elements, up the stack
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (i > pos || !tagName &&
                        options.warn
                    ) {
                        options.warn(
                            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
                        );
                    }
                    if (options.end) {
                        options.end(stack[i].tag, start, end);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            } else if (lowerCasedTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end);
                }
            } else if (lowerCasedTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if (options.end) {
                    options.end(tagName, start, end);
                }
            }
        }
    }
    //parse 解析       parser 解析器
    function parse(template, options) {
        //模板字符串词法分析
        parseHTML(template, {
            warn: warn$2,
            expectHTML: options.expectHTML, //true
            isUnaryTag: options.isUnaryTag, //检测元素是否为单标签
            canBeLeftOpenTag: options.canBeLeftOpenTag, //   是否可以补全闭合的标签
            shouldDecodeNewlines: options.shouldDecodeNewlines,
            shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
            shouldKeepComment: options.comments,
            start: function start(tag, attrs, unary) {}
        });
    }
    function createFunction(code, errors) {
        try {
            return new Function(code)
        } catch(err){
            errors.push ({
                err: err,
                code: code
            });
            return noop
        }
    }
    function createCompileToFunctionFn(compile){
        //缓存对象,存储编译的结果
        var cache = Object.create(null);
        return function compileToFunctions(template, options, vm){
            try {
                new Function("return 1")
            } catch(e) {
                if (e.toString().match(/unsafe-eval|CSP/)) {
                    console.error("编译器无法在此环境中正常工作")
                }
            }
            var key = template;
            if(cache[key]){
                return cache[key]
            }
            var compiled = compile(template, options);
            if(compiled.error && compiled.error.length){
                console.log("打印编译的错误信息")
            }
            if(compiled.tips && compiled.tips.length){
                console.log("打印编译的提示信息")
            }
            var res = {};
            var fnGenErrors = [];
            //把函数体字符串变成渲染函数
            res.render = createFunction(compiled.render, fnGenErrors);
            //渲染优化
            // res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
            //     return createFunction(code, fnGenErrors)
            // });
            return (cache[key] = res)
        }
    }
    function createCompilerCreate(baseCompile){
        return function createCompiler(baseOptions){
            function compile(template, options){
                var finalOptions = Object.create(baseOptions);
                //错误信息
                var errors = [];
                //提示信息
                var tips = [];
                //错误、提示信息的收集
                finalOptions.warn = function(msg, tip){
                    (tip ? tips : error).push(msg)
                };
                //检测用户有那些自定义的配置
                if(options){

                }
                var compiled = baseCompile(template, finalOptions);
                compiled.errors = errors;
                compiled.tips = tips;
                return compiled;
            }
            return {
                compiler: compile,
                compileToFunctions: createCompileToFunctionFn(compile),
            }
        }
    }
    //编译器的创建者
    var createCompiler = createCompilerCreate(function baseCompile(template, options) {
        var ast = parse(template.trim(), options);
        return {
            ast: ast,
            render: "函数体字符串",
            staticRenderFns: ""
        }
    });
    //编译器
    var ref$1 = createCompiler(baseOptions);
    var compileToFunctions = ref$1.compileToFunctions;
    var div;
    function getShouldDecode(href) {
        div = div || document.createElement('div');
        div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
        return div.innerHTML.indexOf('&#10;') > 0
    }
    var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
    var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;
    function idToTemplate(id) {
        var el = query(id);
        return el && el.innerHTML;
    }
    //缓存$mount
    var mount = Vue.prototype.$mount;
    //加入模板编译功能的构建
    Vue.prototype.$mount = function(el){
        el = el && query(el);
        if(el === document.body || el === document.documentElement){
            warn("禁止将组件挂载在body或html元素上。")
        }
        var options = this.$options;
        if(!options.render){
            //自定义配置template模板
            template = options.template;
            if(template){
                if(typeof template === 'string'){
                    if(template.charAt(0) === "#"){
                        template = idToTemplate(template);
                    }
                }
            } else if(el) {
                template = getOuterHTML(el);
            }
            if(template){
                //解析成渲染函数
                var ref = compileToFunctions(template, {
                    shouldDecodeNewlines: shouldDecodeNewlines,
                    shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
                    delimiters: options.delimiters,
                    comments: options.comments
                }, this);
                //渲染函数
                options.render = ref.render;
            }
        }
        return mount.call(this, el);
    };
    function getOuterHTML(el) {
        if(el.outerHTML){
            return el.outerHTML;
        } else {
            var con = document.createElement("div");
            con.appendChild(el.cloneNode(true));
            return con.innerHTML;
        }
    }
    return Vue;
});
