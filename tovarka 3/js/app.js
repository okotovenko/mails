(() => {
    "use strict";
    const flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(webP.height == 2);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = support === true ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    let gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                const headerElement = document.querySelector(headerItem);
                if (!headerElement.classList.contains("_header-scroll")) {
                    headerElement.style.cssText = `transition-duration: 0s;`;
                    headerElement.classList.add("_header-scroll");
                    headerItemHeight = headerElement.offsetHeight;
                    headerElement.classList.remove("_header-scroll");
                    setTimeout((() => {
                        headerElement.style.cssText = ``;
                    }), 0);
                } else headerItemHeight = headerElement.offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            if (typeof SmoothScroll !== "undefined") (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            FLS(`[gotoBlock]: Юхуу...едем к ${targetBlock}`);
        } else FLS(`[gotoBlock]: Ой ой..Такого блока нет на странице: ${targetBlock}`);
    };
    function formFieldsInit(options = {
        viewPass: false,
        autoHeight: false
    }) {
        const formFields = document.querySelectorAll("input[placeholder],textarea[placeholder]");
        if (formFields.length) formFields.forEach((formField => {
            if (!formField.hasAttribute("data-placeholder-nohide")) formField.dataset.placeholder = formField.placeholder;
        }));
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
                if (targetElement.dataset.placeholder) targetElement.placeholder = "";
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                formValidate.removeError(targetElement);
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
                if (targetElement.dataset.placeholder) targetElement.placeholder = targetElement.dataset.placeholder;
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                if (targetElement.hasAttribute("data-validate")) formValidate.validateInput(targetElement);
            }
        }));
        if (options.viewPass) document.addEventListener("click", (function(e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
                targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
                targetElement.classList.toggle("_viewpass-active");
            }
        }));
        if (options.autoHeight) {
            const textareas = document.querySelectorAll("textarea[data-autoheight]");
            if (textareas.length) {
                textareas.forEach((textarea => {
                    const startHeight = textarea.hasAttribute("data-autoheight-min") ? Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
                    const maxHeight = textarea.hasAttribute("data-autoheight-max") ? Number(textarea.dataset.autoheightMax) : 1 / 0;
                    setHeight(textarea, Math.min(startHeight, maxHeight));
                    textarea.addEventListener("input", (() => {
                        if (textarea.scrollHeight > startHeight) {
                            textarea.style.height = `auto`;
                            setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
                        }
                    }));
                }));
                function setHeight(textarea, height) {
                    textarea.style.height = `${height}px`;
                }
            }
        }
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if (formRequiredItem.dataset.required === "email") {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    function formSubmit() {
        const forms = document.forms;
        if (forms.length) for (const form of forms) {
            form.addEventListener("submit", (function(e) {
                const form = e.target;
                formSubmitAction(form, e);
            }));
            form.addEventListener("reset", (function(e) {
                const form = e.target;
                formValidate.formClean(form);
            }));
        }
        async function formSubmitAction(form, e) {
            const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
            if (error === 0) {
                const ajax = form.hasAttribute("data-ajax");
                if (ajax) {
                    e.preventDefault();
                    const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
                    const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
                    const formData = new FormData(form);
                    form.classList.add("_sending");
                    const response = await fetch(formAction, {
                        method: formMethod,
                        body: formData
                    });
                    if (response.ok) {
                        let responseResult = await response.json();
                        form.classList.remove("_sending");
                        formSent(form, responseResult);
                    } else {
                        alert("Ошибка");
                        form.classList.remove("_sending");
                    }
                } else if (form.hasAttribute("data-dev")) {
                    e.preventDefault();
                    formSent(form);
                }
            } else {
                e.preventDefault();
                if (form.querySelector("._form-error") && form.hasAttribute("data-goto-error")) {
                    const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : "._form-error";
                    gotoBlock(formGoToErrorClass, true, 1e3);
                }
            }
        }
        function formSent(form, responseResult = ``) {
            document.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    form
                }
            }));
            setTimeout((() => {
                if (flsModules.popup) {
                    const popup = form.dataset.popupMessage;
                    popup ? flsModules.popup.open(popup) : null;
                }
            }), 0);
            formValidate.formClean(form);
            formLogging(`Форма отправлена!`);
        }
        function formLogging(message) {
            FLS(`[Формы]: ${message}`);
        }
    }
    /*!
 * dist/inputmask
 * https://github.com/RobinHerbots/Inputmask
 * Copyright (c) 2010 - 2023 Robin Herbots
 * Licensed under the MIT license
 * Version: 5.0.9-beta.31
 */
    !function(e, t) {
        if ("object" == typeof exports && "object" == typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else {
            var n = t();
            for (var i in n) ("object" == typeof exports ? exports : e)[i] = n[i];
        }
    }("undefined" != typeof self ? self : void 0, (function() {
        return function() {
            "use strict";
            var e = {
                3976: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = void 0;
                    var i = n(2839), a = {
                        _maxTestPos: 500,
                        placeholder: "_",
                        optionalmarker: [ "[", "]" ],
                        quantifiermarker: [ "{", "}" ],
                        groupmarker: [ "(", ")" ],
                        alternatormarker: "|",
                        escapeChar: "\\",
                        mask: null,
                        regex: null,
                        oncomplete: function() {},
                        onincomplete: function() {},
                        oncleared: function() {},
                        repeat: 0,
                        greedy: !1,
                        autoUnmask: !1,
                        removeMaskOnSubmit: !1,
                        clearMaskOnLostFocus: !0,
                        insertMode: !0,
                        insertModeVisual: !0,
                        clearIncomplete: !1,
                        alias: null,
                        onKeyDown: function() {},
                        onBeforeMask: null,
                        onBeforePaste: function(e, t) {
                            return "function" == typeof t.onBeforeMask ? t.onBeforeMask.call(this, e, t) : e;
                        },
                        onBeforeWrite: null,
                        onUnMask: null,
                        showMaskOnFocus: !0,
                        showMaskOnHover: !0,
                        onKeyValidation: function() {},
                        skipOptionalPartCharacter: " ",
                        numericInput: !1,
                        rightAlign: !1,
                        undoOnEscape: !0,
                        radixPoint: "",
                        _radixDance: !1,
                        groupSeparator: "",
                        keepStatic: null,
                        positionCaretOnTab: !0,
                        tabThrough: !1,
                        supportsInputType: [ "text", "tel", "url", "password", "search" ],
                        ignorables: Object.keys(i.ignorables),
                        isComplete: null,
                        preValidation: null,
                        postValidation: null,
                        staticDefinitionSymbol: void 0,
                        jitMasking: !1,
                        nullable: !0,
                        inputEventOnly: !1,
                        noValuePatching: !1,
                        positionCaretOnClick: "lvp",
                        casing: null,
                        inputmode: "text",
                        importDataAttributes: !0,
                        shiftPositions: !0,
                        usePrototypeDefinitions: !0,
                        validationEventTimeOut: 3e3,
                        substitutes: {}
                    };
                    t.default = a;
                },
                7392: function(e, t) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = void 0;
                    t.default = {
                        9: {
                            validator: "[0-9０-９]",
                            definitionSymbol: "*"
                        },
                        a: {
                            validator: "[A-Za-zА-яЁёÀ-ÿµ]",
                            definitionSymbol: "*"
                        },
                        "*": {
                            validator: "[0-9０-９A-Za-zА-яЁёÀ-ÿµ]"
                        }
                    };
                },
                253: function(e, t) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = function(e, t, n) {
                        if (void 0 === n) return e.__data ? e.__data[t] : null;
                        e.__data = e.__data || {}, e.__data[t] = n;
                    };
                },
                3776: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.Event = void 0, t.off = function(e, t) {
                        var n, i;
                        f(this[0]) && e && (n = this[0].eventRegistry, i = this[0], e.split(" ").forEach((function(e) {
                            var a = o(e.split("."), 2);
                            (function(e, i) {
                                var a, r, o = [];
                                if (e.length > 0) if (void 0 === t) for (a = 0, r = n[e][i].length; a < r; a++) o.push({
                                    ev: e,
                                    namespace: i && i.length > 0 ? i : "global",
                                    handler: n[e][i][a]
                                }); else o.push({
                                    ev: e,
                                    namespace: i && i.length > 0 ? i : "global",
                                    handler: t
                                }); else if (i.length > 0) for (var l in n) for (var s in n[l]) if (s === i) if (void 0 === t) for (a = 0, 
                                r = n[l][s].length; a < r; a++) o.push({
                                    ev: l,
                                    namespace: s,
                                    handler: n[l][s][a]
                                }); else o.push({
                                    ev: l,
                                    namespace: s,
                                    handler: t
                                });
                                return o;
                            })(a[0], a[1]).forEach((function(e) {
                                var t = e.ev, a = e.handler;
                                !function(e, t, a) {
                                    if (e in n == 1) if (i.removeEventListener ? i.removeEventListener(e, a, !1) : i.detachEvent && i.detachEvent("on".concat(e), a), 
                                    "global" === t) for (var r in n[e]) n[e][r].splice(n[e][r].indexOf(a), 1); else n[e][t].splice(n[e][t].indexOf(a), 1);
                                }(t, e.namespace, a);
                            }));
                        })));
                        return this;
                    }, t.on = function(e, t) {
                        if (f(this[0])) {
                            var n = this[0].eventRegistry, i = this[0];
                            e.split(" ").forEach((function(e) {
                                var a = o(e.split("."), 2), r = a[0], l = a[1];
                                !function(e, a) {
                                    i.addEventListener ? i.addEventListener(e, t, !1) : i.attachEvent && i.attachEvent("on".concat(e), t), 
                                    n[e] = n[e] || {}, n[e][a] = n[e][a] || [], n[e][a].push(t);
                                }(r, void 0 === l ? "global" : l);
                            }));
                        }
                        return this;
                    }, t.trigger = function(e) {
                        var t = arguments;
                        if (f(this[0])) for (var n = this[0].eventRegistry, a = this[0], o = "string" == typeof e ? e.split(" ") : [ e.type ], l = 0; l < o.length; l++) {
                            var s = o[l].split("."), c = s[0], p = s[1] || "global";
                            if (void 0 !== u && "global" === p) {
                                var d, h = {
                                    bubbles: !0,
                                    cancelable: !0,
                                    composed: !0,
                                    detail: arguments[1]
                                };
                                if (u.createEvent) {
                                    try {
                                        if ("input" === c) h.inputType = "insertText", d = new InputEvent(c, h); else d = new CustomEvent(c, h);
                                    } catch (e) {
                                        (d = u.createEvent("CustomEvent")).initCustomEvent(c, h.bubbles, h.cancelable, h.detail);
                                    }
                                    e.type && (0, i.default)(d, e), a.dispatchEvent(d);
                                } else (d = u.createEventObject()).eventType = c, d.detail = arguments[1], e.type && (0, 
                                i.default)(d, e), a.fireEvent("on" + d.eventType, d);
                            } else if (void 0 !== n[c]) {
                                arguments[0] = arguments[0].type ? arguments[0] : r.default.Event(arguments[0]), 
                                arguments[0].detail = arguments.slice(1);
                                var v = n[c];
                                ("global" === p ? Object.values(v).flat() : v[p]).forEach((function(e) {
                                    return e.apply(a, t);
                                }));
                            }
                        }
                        return this;
                    };
                    var i = s(n(600)), a = s(n(9380)), r = s(n(4963));
                    function o(e, t) {
                        return function(e) {
                            if (Array.isArray(e)) return e;
                        }(e) || function(e, t) {
                            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                            if (null != n) {
                                var i, a, r, o, l = [], s = !0, c = !1;
                                try {
                                    if (r = (n = n.call(e)).next, 0 === t) {
                                        if (Object(n) !== n) return;
                                        s = !1;
                                    } else for (;!(s = (i = r.call(n)).done) && (l.push(i.value), l.length !== t); s = !0) ;
                                } catch (e) {
                                    c = !0, a = e;
                                } finally {
                                    try {
                                        if (!s && null != n.return && (o = n.return(), Object(o) !== o)) return;
                                    } finally {
                                        if (c) throw a;
                                    }
                                }
                                return l;
                            }
                        }(e, t) || function(e, t) {
                            if (!e) return;
                            if ("string" == typeof e) return l(e, t);
                            var n = Object.prototype.toString.call(e).slice(8, -1);
                            "Object" === n && e.constructor && (n = e.constructor.name);
                            if ("Map" === n || "Set" === n) return Array.from(e);
                            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return l(e, t);
                        }(e, t) || function() {
                            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        }();
                    }
                    function l(e, t) {
                        (null == t || t > e.length) && (t = e.length);
                        for (var n = 0, i = new Array(t); n < t; n++) i[n] = e[n];
                        return i;
                    }
                    function s(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    var c, u = a.default.document;
                    function f(e) {
                        return e instanceof Element;
                    }
                    t.Event = c, "function" == typeof a.default.CustomEvent ? t.Event = c = a.default.CustomEvent : a.default.Event && u && u.createEvent ? (t.Event = c = function(e, t) {
                        t = t || {
                            bubbles: !1,
                            cancelable: !1,
                            composed: !0,
                            detail: void 0
                        };
                        var n = u.createEvent("CustomEvent");
                        return n.initCustomEvent(e, t.bubbles, t.cancelable, t.detail), n;
                    }, c.prototype = a.default.Event.prototype) : "undefined" != typeof Event && (t.Event = c = Event);
                },
                600: function(e, t) {
                    function n(e) {
                        return n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, n(e);
                    }
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = function e() {
                        var t, i, a, r, o, l, s = arguments[0] || {}, c = 1, u = arguments.length, f = !1;
                        "boolean" == typeof s && (f = s, s = arguments[c] || {}, c++);
                        "object" !== n(s) && "function" != typeof s && (s = {});
                        for (;c < u; c++) if (null != (t = arguments[c])) for (i in t) a = s[i], s !== (r = t[i]) && (f && r && ("[object Object]" === Object.prototype.toString.call(r) || (o = Array.isArray(r))) ? (o ? (o = !1, 
                        l = a && Array.isArray(a) ? a : []) : l = a && "[object Object]" === Object.prototype.toString.call(a) ? a : {}, 
                        s[i] = e(f, l, r)) : void 0 !== r && (s[i] = r));
                        return s;
                    };
                },
                4963: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = void 0;
                    var i = l(n(600)), a = l(n(9380)), r = l(n(253)), o = n(3776);
                    function l(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    var s = a.default.document;
                    function c(e) {
                        return e instanceof c ? e : this instanceof c ? void (null != e && e !== a.default && (this[0] = e.nodeName ? e : void 0 !== e[0] && e[0].nodeName ? e[0] : s.querySelector(e), 
                        void 0 !== this[0] && null !== this[0] && (this[0].eventRegistry = this[0].eventRegistry || {}))) : new c(e);
                    }
                    c.prototype = {
                        on: o.on,
                        off: o.off,
                        trigger: o.trigger
                    }, c.extend = i.default, c.data = r.default, c.Event = o.Event;
                    var u = c;
                    t.default = u;
                },
                9845: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.mobile = t.iphone = t.ie = void 0;
                    var i, a = (i = n(9380)) && i.__esModule ? i : {
                        default: i
                    };
                    var r = a.default.navigator && a.default.navigator.userAgent || "", o = r.indexOf("MSIE ") > 0 || r.indexOf("Trident/") > 0, l = a.default.navigator && a.default.navigator.userAgentData && a.default.navigator.userAgentData.mobile || a.default.navigator && a.default.navigator.maxTouchPoints || "ontouchstart" in a.default, s = /iphone/i.test(r);
                    t.iphone = s, t.mobile = l, t.ie = o;
                },
                7184: function(e, t) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = function(e) {
                        return e.replace(n, "\\$1");
                    };
                    var n = new RegExp("(\\" + [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ].join("|\\") + ")", "gim");
                },
                6030: function(e, t, n) {
                    function i(e) {
                        return i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, i(e);
                    }
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.EventHandlers = void 0;
                    var a, r = n(8711), o = n(2839), l = n(9845), s = n(7215), c = n(7760), u = n(4713), f = (a = n(9380)) && a.__esModule ? a : {
                        default: a
                    };
                    function p() {
                        /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ p = function() {
                            return e;
                        };
                        var e = {}, t = Object.prototype, n = t.hasOwnProperty, a = Object.defineProperty || function(e, t, n) {
                            e[t] = n.value;
                        }, r = "function" == typeof Symbol ? Symbol : {}, o = r.iterator || "@@iterator", l = r.asyncIterator || "@@asyncIterator", s = r.toStringTag || "@@toStringTag";
                        function c(e, t, n) {
                            return Object.defineProperty(e, t, {
                                value: n,
                                enumerable: !0,
                                configurable: !0,
                                writable: !0
                            }), e[t];
                        }
                        try {
                            c({}, "");
                        } catch (e) {
                            c = function(e, t, n) {
                                return e[t] = n;
                            };
                        }
                        function u(e, t, n, i) {
                            var r = t && t.prototype instanceof h ? t : h, o = Object.create(r.prototype), l = new E(i || []);
                            return a(o, "_invoke", {
                                value: w(e, n, l)
                            }), o;
                        }
                        function f(e, t, n) {
                            try {
                                return {
                                    type: "normal",
                                    arg: e.call(t, n)
                                };
                            } catch (e) {
                                return {
                                    type: "throw",
                                    arg: e
                                };
                            }
                        }
                        e.wrap = u;
                        var d = {};
                        function h() {}
                        function v() {}
                        function m() {}
                        var g = {};
                        c(g, o, (function() {
                            return this;
                        }));
                        var y = Object.getPrototypeOf, k = y && y(y(M([])));
                        k && k !== t && n.call(k, o) && (g = k);
                        var b = m.prototype = h.prototype = Object.create(g);
                        function x(e) {
                            [ "next", "throw", "return" ].forEach((function(t) {
                                c(e, t, (function(e) {
                                    return this._invoke(t, e);
                                }));
                            }));
                        }
                        function P(e, t) {
                            function r(a, o, l, s) {
                                var c = f(e[a], e, o);
                                if ("throw" !== c.type) {
                                    var u = c.arg, p = u.value;
                                    return p && "object" == i(p) && n.call(p, "__await") ? t.resolve(p.__await).then((function(e) {
                                        r("next", e, l, s);
                                    }), (function(e) {
                                        r("throw", e, l, s);
                                    })) : t.resolve(p).then((function(e) {
                                        u.value = e, l(u);
                                    }), (function(e) {
                                        return r("throw", e, l, s);
                                    }));
                                }
                                s(c.arg);
                            }
                            var o;
                            a(this, "_invoke", {
                                value: function(e, n) {
                                    function i() {
                                        return new t((function(t, i) {
                                            r(e, n, t, i);
                                        }));
                                    }
                                    return o = o ? o.then(i, i) : i();
                                }
                            });
                        }
                        function w(e, t, n) {
                            var i = "suspendedStart";
                            return function(a, r) {
                                if ("executing" === i) throw new Error("Generator is already running");
                                if ("completed" === i) {
                                    if ("throw" === a) throw r;
                                    return j();
                                }
                                for (n.method = a, n.arg = r; ;) {
                                    var o = n.delegate;
                                    if (o) {
                                        var l = S(o, n);
                                        if (l) {
                                            if (l === d) continue;
                                            return l;
                                        }
                                    }
                                    if ("next" === n.method) n.sent = n._sent = n.arg; else if ("throw" === n.method) {
                                        if ("suspendedStart" === i) throw i = "completed", n.arg;
                                        n.dispatchException(n.arg);
                                    } else "return" === n.method && n.abrupt("return", n.arg);
                                    i = "executing";
                                    var s = f(e, t, n);
                                    if ("normal" === s.type) {
                                        if (i = n.done ? "completed" : "suspendedYield", s.arg === d) continue;
                                        return {
                                            value: s.arg,
                                            done: n.done
                                        };
                                    }
                                    "throw" === s.type && (i = "completed", n.method = "throw", n.arg = s.arg);
                                }
                            };
                        }
                        function S(e, t) {
                            var n = t.method, i = e.iterator[n];
                            if (void 0 === i) return t.delegate = null, "throw" === n && e.iterator.return && (t.method = "return", 
                            t.arg = void 0, S(e, t), "throw" === t.method) || "return" !== n && (t.method = "throw", 
                            t.arg = new TypeError("The iterator does not provide a '" + n + "' method")), d;
                            var a = f(i, e.iterator, t.arg);
                            if ("throw" === a.type) return t.method = "throw", t.arg = a.arg, t.delegate = null, 
                            d;
                            var r = a.arg;
                            return r ? r.done ? (t[e.resultName] = r.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", 
                            t.arg = void 0), t.delegate = null, d) : r : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), 
                            t.delegate = null, d);
                        }
                        function O(e) {
                            var t = {
                                tryLoc: e[0]
                            };
                            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), 
                            this.tryEntries.push(t);
                        }
                        function _(e) {
                            var t = e.completion || {};
                            t.type = "normal", delete t.arg, e.completion = t;
                        }
                        function E(e) {
                            this.tryEntries = [ {
                                tryLoc: "root"
                            } ], e.forEach(O, this), this.reset(!0);
                        }
                        function M(e) {
                            if (e) {
                                var t = e[o];
                                if (t) return t.call(e);
                                if ("function" == typeof e.next) return e;
                                if (!isNaN(e.length)) {
                                    var i = -1, a = function t() {
                                        for (;++i < e.length; ) if (n.call(e, i)) return t.value = e[i], t.done = !1, t;
                                        return t.value = void 0, t.done = !0, t;
                                    };
                                    return a.next = a;
                                }
                            }
                            return {
                                next: j
                            };
                        }
                        function j() {
                            return {
                                value: void 0,
                                done: !0
                            };
                        }
                        return v.prototype = m, a(b, "constructor", {
                            value: m,
                            configurable: !0
                        }), a(m, "constructor", {
                            value: v,
                            configurable: !0
                        }), v.displayName = c(m, s, "GeneratorFunction"), e.isGeneratorFunction = function(e) {
                            var t = "function" == typeof e && e.constructor;
                            return !!t && (t === v || "GeneratorFunction" === (t.displayName || t.name));
                        }, e.mark = function(e) {
                            return Object.setPrototypeOf ? Object.setPrototypeOf(e, m) : (e.__proto__ = m, c(e, s, "GeneratorFunction")), 
                            e.prototype = Object.create(b), e;
                        }, e.awrap = function(e) {
                            return {
                                __await: e
                            };
                        }, x(P.prototype), c(P.prototype, l, (function() {
                            return this;
                        })), e.AsyncIterator = P, e.async = function(t, n, i, a, r) {
                            void 0 === r && (r = Promise);
                            var o = new P(u(t, n, i, a), r);
                            return e.isGeneratorFunction(n) ? o : o.next().then((function(e) {
                                return e.done ? e.value : o.next();
                            }));
                        }, x(b), c(b, s, "Generator"), c(b, o, (function() {
                            return this;
                        })), c(b, "toString", (function() {
                            return "[object Generator]";
                        })), e.keys = function(e) {
                            var t = Object(e), n = [];
                            for (var i in t) n.push(i);
                            return n.reverse(), function e() {
                                for (;n.length; ) {
                                    var i = n.pop();
                                    if (i in t) return e.value = i, e.done = !1, e;
                                }
                                return e.done = !0, e;
                            };
                        }, e.values = M, E.prototype = {
                            constructor: E,
                            reset: function(e) {
                                if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, 
                                this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(_), 
                                !e) for (var t in this) "t" === t.charAt(0) && n.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = void 0);
                            },
                            stop: function() {
                                this.done = !0;
                                var e = this.tryEntries[0].completion;
                                if ("throw" === e.type) throw e.arg;
                                return this.rval;
                            },
                            dispatchException: function(e) {
                                if (this.done) throw e;
                                var t = this;
                                function i(n, i) {
                                    return o.type = "throw", o.arg = e, t.next = n, i && (t.method = "next", t.arg = void 0), 
                                    !!i;
                                }
                                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                                    var r = this.tryEntries[a], o = r.completion;
                                    if ("root" === r.tryLoc) return i("end");
                                    if (r.tryLoc <= this.prev) {
                                        var l = n.call(r, "catchLoc"), s = n.call(r, "finallyLoc");
                                        if (l && s) {
                                            if (this.prev < r.catchLoc) return i(r.catchLoc, !0);
                                            if (this.prev < r.finallyLoc) return i(r.finallyLoc);
                                        } else if (l) {
                                            if (this.prev < r.catchLoc) return i(r.catchLoc, !0);
                                        } else {
                                            if (!s) throw new Error("try statement without catch or finally");
                                            if (this.prev < r.finallyLoc) return i(r.finallyLoc);
                                        }
                                    }
                                }
                            },
                            abrupt: function(e, t) {
                                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                                    var a = this.tryEntries[i];
                                    if (a.tryLoc <= this.prev && n.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                                        var r = a;
                                        break;
                                    }
                                }
                                r && ("break" === e || "continue" === e) && r.tryLoc <= t && t <= r.finallyLoc && (r = null);
                                var o = r ? r.completion : {};
                                return o.type = e, o.arg = t, r ? (this.method = "next", this.next = r.finallyLoc, 
                                d) : this.complete(o);
                            },
                            complete: function(e, t) {
                                if ("throw" === e.type) throw e.arg;
                                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, 
                                this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), 
                                d;
                            },
                            finish: function(e) {
                                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                                    var n = this.tryEntries[t];
                                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), _(n), d;
                                }
                            },
                            catch: function(e) {
                                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                                    var n = this.tryEntries[t];
                                    if (n.tryLoc === e) {
                                        var i = n.completion;
                                        if ("throw" === i.type) {
                                            var a = i.arg;
                                            _(n);
                                        }
                                        return a;
                                    }
                                }
                                throw new Error("illegal catch attempt");
                            },
                            delegateYield: function(e, t, n) {
                                return this.delegate = {
                                    iterator: M(e),
                                    resultName: t,
                                    nextLoc: n
                                }, "next" === this.method && (this.arg = void 0), d;
                            }
                        }, e;
                    }
                    function d(e, t) {
                        var n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                        if (!n) {
                            if (Array.isArray(e) || (n = function(e, t) {
                                if (!e) return;
                                if ("string" == typeof e) return h(e, t);
                                var n = Object.prototype.toString.call(e).slice(8, -1);
                                "Object" === n && e.constructor && (n = e.constructor.name);
                                if ("Map" === n || "Set" === n) return Array.from(e);
                                if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return h(e, t);
                            }(e)) || t && e && "number" == typeof e.length) {
                                n && (e = n);
                                var i = 0, a = function() {};
                                return {
                                    s: a,
                                    n: function() {
                                        return i >= e.length ? {
                                            done: !0
                                        } : {
                                            done: !1,
                                            value: e[i++]
                                        };
                                    },
                                    e: function(e) {
                                        throw e;
                                    },
                                    f: a
                                };
                            }
                            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        }
                        var r, o = !0, l = !1;
                        return {
                            s: function() {
                                n = n.call(e);
                            },
                            n: function() {
                                var e = n.next();
                                return o = e.done, e;
                            },
                            e: function(e) {
                                l = !0, r = e;
                            },
                            f: function() {
                                try {
                                    o || null == n.return || n.return();
                                } finally {
                                    if (l) throw r;
                                }
                            }
                        };
                    }
                    function h(e, t) {
                        (null == t || t > e.length) && (t = e.length);
                        for (var n = 0, i = new Array(t); n < t; n++) i[n] = e[n];
                        return i;
                    }
                    function v(e, t, n, i, a, r, o) {
                        try {
                            var l = e[r](o), s = l.value;
                        } catch (e) {
                            return void n(e);
                        }
                        l.done ? t(s) : Promise.resolve(s).then(i, a);
                    }
                    var m, g, y = {
                        keyEvent: function(e, t, n, i, a) {
                            var f = this.inputmask, p = f.opts, d = f.dependencyLib, h = f.maskset, v = this, m = d(v), g = e.key, k = r.caret.call(f, v), b = p.onKeyDown.call(this, e, r.getBuffer.call(f), k, p);
                            if (void 0 !== b) return b;
                            if (g === o.keys.Backspace || g === o.keys.Delete || l.iphone && g === o.keys.BACKSPACE_SAFARI || e.ctrlKey && g === o.keys.x && !("oncut" in v)) e.preventDefault(), 
                            s.handleRemove.call(f, v, g, k), (0, c.writeBuffer)(v, r.getBuffer.call(f, !0), h.p, e, v.inputmask._valueGet() !== r.getBuffer.call(f).join("")); else if (g === o.keys.End || g === o.keys.PageDown) {
                                e.preventDefault();
                                var x = r.seekNext.call(f, r.getLastValidPosition.call(f));
                                r.caret.call(f, v, e.shiftKey ? k.begin : x, x, !0);
                            } else g === o.keys.Home && !e.shiftKey || g === o.keys.PageUp ? (e.preventDefault(), 
                            r.caret.call(f, v, 0, e.shiftKey ? k.begin : 0, !0)) : p.undoOnEscape && g === o.keys.Escape && !0 !== e.altKey ? ((0, 
                            c.checkVal)(v, !0, !1, f.undoValue.split("")), m.trigger("click")) : g !== o.keys.Insert || e.shiftKey || e.ctrlKey || void 0 !== f.userOptions.insertMode ? !0 === p.tabThrough && g === o.keys.Tab ? !0 === e.shiftKey ? (k.end = r.seekPrevious.call(f, k.end, !0), 
                            !0 === u.getTest.call(f, k.end - 1).match.static && k.end--, k.begin = r.seekPrevious.call(f, k.end, !0), 
                            k.begin >= 0 && k.end > 0 && (e.preventDefault(), r.caret.call(f, v, k.begin, k.end))) : (k.begin = r.seekNext.call(f, k.begin, !0), 
                            k.end = r.seekNext.call(f, k.begin, !0), k.end < h.maskLength && k.end--, k.begin <= h.maskLength && (e.preventDefault(), 
                            r.caret.call(f, v, k.begin, k.end))) : e.shiftKey || p.insertModeVisual && !1 === p.insertMode && (g === o.keys.ArrowRight ? setTimeout((function() {
                                var e = r.caret.call(f, v);
                                r.caret.call(f, v, e.begin);
                            }), 0) : g === o.keys.ArrowLeft && setTimeout((function() {
                                var e = r.translatePosition.call(f, v.inputmask.caretPos.begin);
                                r.translatePosition.call(f, v.inputmask.caretPos.end);
                                f.isRTL ? r.caret.call(f, v, e + (e === h.maskLength ? 0 : 1)) : r.caret.call(f, v, e - (0 === e ? 0 : 1));
                            }), 0)) : s.isSelection.call(f, k) ? p.insertMode = !p.insertMode : (p.insertMode = !p.insertMode, 
                            r.caret.call(f, v, k.begin, k.begin));
                            return f.isComposing = g == o.keys.Process || g == o.keys.Unidentified, f.ignorable = p.ignorables.includes(g), 
                            y.keypressEvent.call(this, e, t, n, i, a);
                        },
                        keypressEvent: function(e, t, n, i, a) {
                            var l = this.inputmask || this, u = l.opts, f = l.dependencyLib, p = l.maskset, d = l.el, h = f(d), v = e.key;
                            if (!0 === t || e.ctrlKey && e.altKey || !(e.ctrlKey || e.metaKey || l.ignorable)) {
                                if (v) {
                                    var m, g = t ? {
                                        begin: a,
                                        end: a
                                    } : r.caret.call(l, d);
                                    v = u.substitutes[v] || v, p.writeOutBuffer = !0;
                                    var y = s.isValid.call(l, g, v, i, void 0, void 0, void 0, t);
                                    if (!1 !== y && (r.resetMaskSet.call(l, !0), m = void 0 !== y.caret ? y.caret : r.seekNext.call(l, y.pos.begin ? y.pos.begin : y.pos), 
                                    p.p = m), m = u.numericInput && void 0 === y.caret ? r.seekPrevious.call(l, m) : m, 
                                    !1 !== n && (setTimeout((function() {
                                        u.onKeyValidation.call(d, v, y);
                                    }), 0), p.writeOutBuffer && !1 !== y)) {
                                        var k = r.getBuffer.call(l);
                                        (0, c.writeBuffer)(d, k, m, e, !0 !== t);
                                    }
                                    if (e.preventDefault(), t) return !1 !== y && (y.forwardPosition = m), y;
                                }
                            } else v === o.keys.Enter && l.undoValue !== l._valueGet(!0) && (l.undoValue = l._valueGet(!0), 
                            setTimeout((function() {
                                h.trigger("change");
                            }), 0));
                        },
                        pasteEvent: (m = p().mark((function e(t) {
                            var n, i, a, o, l, s;
                            return p().wrap((function(e) {
                                for (;;) switch (e.prev = e.next) {
                                  case 0:
                                    n = function(e, n, i, a, l) {
                                        var s = r.caret.call(e, n, void 0, void 0, !0), u = i.substr(0, s.begin), f = i.substr(s.end, i.length);
                                        if (u == (e.isRTL ? r.getBufferTemplate.call(e).slice().reverse() : r.getBufferTemplate.call(e)).slice(0, s.begin).join("") && (u = ""), 
                                        f == (e.isRTL ? r.getBufferTemplate.call(e).slice().reverse() : r.getBufferTemplate.call(e)).slice(s.end).join("") && (f = ""), 
                                        a = u + a + f, e.isRTL && !0 !== o.numericInput) {
                                            a = a.split("");
                                            var p, h = d(r.getBufferTemplate.call(e));
                                            try {
                                                for (h.s(); !(p = h.n()).done; ) {
                                                    var v = p.value;
                                                    a[0] === v && a.shift();
                                                }
                                            } catch (e) {
                                                h.e(e);
                                            } finally {
                                                h.f();
                                            }
                                            a = a.reverse().join("");
                                        }
                                        var m = a;
                                        if ("function" == typeof l) {
                                            if (!1 === (m = l.call(e, m, o))) return !1;
                                            m || (m = i);
                                        }
                                        (0, c.checkVal)(n, !0, !1, m.toString().split(""), t);
                                    }, i = this, a = this.inputmask, o = a.opts, l = a._valueGet(!0), a.skipInputEvent = !0, 
                                    t.clipboardData && t.clipboardData.getData ? s = t.clipboardData.getData("text/plain") : f.default.clipboardData && f.default.clipboardData.getData && (s = f.default.clipboardData.getData("Text")), 
                                    n(a, i, l, s, o.onBeforePaste), t.preventDefault();

                                  case 7:
                                  case "end":
                                    return e.stop();
                                }
                            }), e, this);
                        })), g = function() {
                            var e = this, t = arguments;
                            return new Promise((function(n, i) {
                                var a = m.apply(e, t);
                                function r(e) {
                                    v(a, n, i, r, o, "next", e);
                                }
                                function o(e) {
                                    v(a, n, i, r, o, "throw", e);
                                }
                                r(void 0);
                            }));
                        }, function(e) {
                            return g.apply(this, arguments);
                        }),
                        inputFallBackEvent: function(e) {
                            var t = this.inputmask, n = t.opts, i = t.dependencyLib;
                            var a, s = this, f = s.inputmask._valueGet(!0), p = (t.isRTL ? r.getBuffer.call(t).slice().reverse() : r.getBuffer.call(t)).join(""), d = r.caret.call(t, s, void 0, void 0, !0);
                            if (p !== f) {
                                if (a = function(e, i, a) {
                                    for (var o, l, s, c = e.substr(0, a.begin).split(""), f = e.substr(a.begin).split(""), p = i.substr(0, a.begin).split(""), d = i.substr(a.begin).split(""), h = c.length >= p.length ? c.length : p.length, v = f.length >= d.length ? f.length : d.length, m = "", g = [], y = "~"; c.length < h; ) c.push(y);
                                    for (;p.length < h; ) p.push(y);
                                    for (;f.length < v; ) f.unshift(y);
                                    for (;d.length < v; ) d.unshift(y);
                                    var k = c.concat(f), b = p.concat(d);
                                    for (l = 0, o = k.length; l < o; l++) switch (s = u.getPlaceholder.call(t, r.translatePosition.call(t, l)), 
                                    m) {
                                      case "insertText":
                                        b[l - 1] === k[l] && a.begin == k.length - 1 && g.push(k[l]), l = o;
                                        break;

                                      case "insertReplacementText":
                                      case "deleteContentBackward":
                                        k[l] === y ? a.end++ : l = o;
                                        break;

                                      default:
                                        k[l] !== b[l] && (k[l + 1] !== y && k[l + 1] !== s && void 0 !== k[l + 1] || (b[l] !== s || b[l + 1] !== y) && b[l] !== y ? b[l + 1] === y && b[l] === k[l + 1] ? (m = "insertText", 
                                        g.push(k[l]), a.begin--, a.end--) : k[l] !== s && k[l] !== y && (k[l + 1] === y || b[l] !== k[l] && b[l + 1] === k[l + 1]) ? (m = "insertReplacementText", 
                                        g.push(k[l]), a.begin--) : k[l] === y ? (m = "deleteContentBackward", (r.isMask.call(t, r.translatePosition.call(t, l), !0) || b[l] === n.radixPoint) && a.end++) : l = o : (m = "insertText", 
                                        g.push(k[l]), a.begin--, a.end--));
                                    }
                                    return {
                                        action: m,
                                        data: g,
                                        caret: a
                                    };
                                }(f, p, d), (s.inputmask.shadowRoot || s.ownerDocument).activeElement !== s && s.focus(), 
                                (0, c.writeBuffer)(s, r.getBuffer.call(t)), r.caret.call(t, s, d.begin, d.end, !0), 
                                !l.mobile && t.skipNextInsert && "insertText" === e.inputType && "insertText" === a.action && t.isComposing) return !1;
                                switch ("insertCompositionText" === e.inputType && "insertText" === a.action && t.isComposing ? t.skipNextInsert = !0 : t.skipNextInsert = !1, 
                                a.action) {
                                  case "insertText":
                                  case "insertReplacementText":
                                    a.data.forEach((function(e, n) {
                                        var a = new i.Event("keypress");
                                        a.key = e, t.ignorable = !1, y.keypressEvent.call(s, a);
                                    })), setTimeout((function() {
                                        t.$el.trigger("keyup");
                                    }), 0);
                                    break;

                                  case "deleteContentBackward":
                                    var h = new i.Event("keydown");
                                    h.key = o.keys.Backspace, y.keyEvent.call(s, h);
                                    break;

                                  default:
                                    (0, c.applyInputValue)(s, f), r.caret.call(t, s, d.begin, d.end, !0);
                                }
                                e.preventDefault();
                            }
                        },
                        setValueEvent: function(e) {
                            var t = this.inputmask, n = this, i = e && e.detail ? e.detail[0] : arguments[1];
                            void 0 === i && (i = n.inputmask._valueGet(!0)), (0, c.applyInputValue)(n, i), (e.detail && void 0 !== e.detail[1] || void 0 !== arguments[2]) && r.caret.call(t, n, e.detail ? e.detail[1] : arguments[2]);
                        },
                        focusEvent: function(e) {
                            var t = this.inputmask, n = t.opts, i = t && t._valueGet();
                            n.showMaskOnFocus && i !== r.getBuffer.call(t).join("") && (0, c.writeBuffer)(this, r.getBuffer.call(t), r.seekNext.call(t, r.getLastValidPosition.call(t))), 
                            !0 !== n.positionCaretOnTab || !1 !== t.mouseEnter || s.isComplete.call(t, r.getBuffer.call(t)) && -1 !== r.getLastValidPosition.call(t) || y.clickEvent.apply(this, [ e, !0 ]), 
                            t.undoValue = t && t._valueGet(!0);
                        },
                        invalidEvent: function(e) {
                            this.inputmask.validationEvent = !0;
                        },
                        mouseleaveEvent: function() {
                            var e = this.inputmask, t = e.opts, n = this;
                            e.mouseEnter = !1, t.clearMaskOnLostFocus && (n.inputmask.shadowRoot || n.ownerDocument).activeElement !== n && (0, 
                            c.HandleNativePlaceholder)(n, e.originalPlaceholder);
                        },
                        clickEvent: function(e, t) {
                            var n = this.inputmask;
                            n.clicked++;
                            var i = this;
                            if ((i.inputmask.shadowRoot || i.ownerDocument).activeElement === i) {
                                var a = r.determineNewCaretPosition.call(n, r.caret.call(n, i), t);
                                void 0 !== a && r.caret.call(n, i, a);
                            }
                        },
                        cutEvent: function(e) {
                            var t = this.inputmask, n = t.maskset, i = this, a = r.caret.call(t, i), l = t.isRTL ? r.getBuffer.call(t).slice(a.end, a.begin) : r.getBuffer.call(t).slice(a.begin, a.end), u = t.isRTL ? l.reverse().join("") : l.join("");
                            f.default.navigator && f.default.navigator.clipboard ? f.default.navigator.clipboard.writeText(u) : f.default.clipboardData && f.default.clipboardData.getData && f.default.clipboardData.setData("Text", u), 
                            s.handleRemove.call(t, i, o.keys.Delete, a), (0, c.writeBuffer)(i, r.getBuffer.call(t), n.p, e, t.undoValue !== t._valueGet(!0));
                        },
                        blurEvent: function(e) {
                            var t = this.inputmask, n = t.opts, i = t.dependencyLib;
                            t.clicked = 0;
                            var a = i(this), o = this;
                            if (o.inputmask) {
                                (0, c.HandleNativePlaceholder)(o, t.originalPlaceholder);
                                var l = o.inputmask._valueGet(), u = r.getBuffer.call(t).slice();
                                "" !== l && (n.clearMaskOnLostFocus && (-1 === r.getLastValidPosition.call(t) && l === r.getBufferTemplate.call(t).join("") ? u = [] : c.clearOptionalTail.call(t, u)), 
                                !1 === s.isComplete.call(t, u) && (setTimeout((function() {
                                    a.trigger("incomplete");
                                }), 0), n.clearIncomplete && (r.resetMaskSet.call(t, !1), u = n.clearMaskOnLostFocus ? [] : r.getBufferTemplate.call(t).slice())), 
                                (0, c.writeBuffer)(o, u, void 0, e)), l = t._valueGet(!0), t.undoValue !== l && ("" != l || t.undoValue != r.getBufferTemplate.call(t).join("") || t.undoValue == r.getBufferTemplate.call(t).join("") && t.maskset.validPositions.length > 0) && (t.undoValue = l, 
                                a.trigger("change"));
                            }
                        },
                        mouseenterEvent: function() {
                            var e = this.inputmask, t = e.opts.showMaskOnHover, n = this;
                            if (e.mouseEnter = !0, (n.inputmask.shadowRoot || n.ownerDocument).activeElement !== n) {
                                var i = (e.isRTL ? r.getBufferTemplate.call(e).slice().reverse() : r.getBufferTemplate.call(e)).join("");
                                t && (0, c.HandleNativePlaceholder)(n, i);
                            }
                        },
                        submitEvent: function() {
                            var e = this.inputmask, t = e.opts;
                            e.undoValue !== e._valueGet(!0) && e.$el.trigger("change"), -1 === r.getLastValidPosition.call(e) && e._valueGet && e._valueGet() === r.getBufferTemplate.call(e).join("") && e._valueSet(""), 
                            t.clearIncomplete && !1 === s.isComplete.call(e, r.getBuffer.call(e)) && e._valueSet(""), 
                            t.removeMaskOnSubmit && (e._valueSet(e.unmaskedvalue(), !0), setTimeout((function() {
                                (0, c.writeBuffer)(e.el, r.getBuffer.call(e));
                            }), 0));
                        },
                        resetEvent: function() {
                            var e = this.inputmask;
                            e.refreshValue = !0, setTimeout((function() {
                                (0, c.applyInputValue)(e.el, e._valueGet(!0));
                            }), 0);
                        }
                    };
                    t.EventHandlers = y;
                },
                9716: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.EventRuler = void 0;
                    var i, a = (i = n(2394)) && i.__esModule ? i : {
                        default: i
                    }, r = n(2839), o = n(8711), l = n(7760);
                    var s = {
                        on: function(e, t, n) {
                            var i = e.inputmask.dependencyLib, s = function(t) {
                                t.originalEvent && (t = t.originalEvent || t, arguments[0] = t);
                                var s, c = this, u = c.inputmask, f = u ? u.opts : void 0;
                                if (void 0 === u && "FORM" !== this.nodeName) {
                                    var p = i.data(c, "_inputmask_opts");
                                    i(c).off(), p && new a.default(p).mask(c);
                                } else {
                                    if ([ "submit", "reset", "setvalue" ].includes(t.type) || "FORM" === this.nodeName || !(c.disabled || c.readOnly && !("keydown" === t.type && t.ctrlKey && t.key === r.keys.c || !1 === f.tabThrough && t.key === r.keys.Tab))) {
                                        switch (t.type) {
                                          case "input":
                                            if (!0 === u.skipInputEvent) return u.skipInputEvent = !1, t.preventDefault();
                                            break;

                                          case "click":
                                          case "focus":
                                            return u.validationEvent ? (u.validationEvent = !1, e.blur(), (0, l.HandleNativePlaceholder)(e, (u.isRTL ? o.getBufferTemplate.call(u).slice().reverse() : o.getBufferTemplate.call(u)).join("")), 
                                            setTimeout((function() {
                                                e.focus();
                                            }), f.validationEventTimeOut), !1) : (s = arguments, void setTimeout((function() {
                                                e.inputmask && n.apply(c, s);
                                            }), 0));
                                        }
                                        var d = n.apply(c, arguments);
                                        return !1 === d && (t.preventDefault(), t.stopPropagation()), d;
                                    }
                                    t.preventDefault();
                                }
                            };
                            [ "submit", "reset" ].includes(t) ? (s = s.bind(e), null !== e.form && i(e.form).on(t, s)) : i(e).on(t, s), 
                            e.inputmask.events[t] = e.inputmask.events[t] || [], e.inputmask.events[t].push(s);
                        },
                        off: function(e, t) {
                            if (e.inputmask && e.inputmask.events) {
                                var n = e.inputmask.dependencyLib, i = e.inputmask.events;
                                for (var a in t && ((i = [])[t] = e.inputmask.events[t]), i) {
                                    for (var r = i[a]; r.length > 0; ) {
                                        var o = r.pop();
                                        [ "submit", "reset" ].includes(a) ? null !== e.form && n(e.form).off(a, o) : n(e).off(a, o);
                                    }
                                    delete e.inputmask.events[a];
                                }
                            }
                        }
                    };
                    t.EventRuler = s;
                },
                219: function(e, t, n) {
                    var i = p(n(2394)), a = n(2839), r = p(n(7184)), o = n(8711), l = n(4713);
                    function s(e, t) {
                        return function(e) {
                            if (Array.isArray(e)) return e;
                        }(e) || function(e, t) {
                            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                            if (null != n) {
                                var i, a, r, o, l = [], s = !0, c = !1;
                                try {
                                    if (r = (n = n.call(e)).next, 0 === t) {
                                        if (Object(n) !== n) return;
                                        s = !1;
                                    } else for (;!(s = (i = r.call(n)).done) && (l.push(i.value), l.length !== t); s = !0) ;
                                } catch (e) {
                                    c = !0, a = e;
                                } finally {
                                    try {
                                        if (!s && null != n.return && (o = n.return(), Object(o) !== o)) return;
                                    } finally {
                                        if (c) throw a;
                                    }
                                }
                                return l;
                            }
                        }(e, t) || function(e, t) {
                            if (!e) return;
                            if ("string" == typeof e) return c(e, t);
                            var n = Object.prototype.toString.call(e).slice(8, -1);
                            "Object" === n && e.constructor && (n = e.constructor.name);
                            if ("Map" === n || "Set" === n) return Array.from(e);
                            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return c(e, t);
                        }(e, t) || function() {
                            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        }();
                    }
                    function c(e, t) {
                        (null == t || t > e.length) && (t = e.length);
                        for (var n = 0, i = new Array(t); n < t; n++) i[n] = e[n];
                        return i;
                    }
                    function u(e) {
                        return u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, u(e);
                    }
                    function f(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var i = t[n];
                            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), 
                            Object.defineProperty(e, (a = i.key, r = void 0, r = function(e, t) {
                                if ("object" !== u(e) || null === e) return e;
                                var n = e[Symbol.toPrimitive];
                                if (void 0 !== n) {
                                    var i = n.call(e, t || "default");
                                    if ("object" !== u(i)) return i;
                                    throw new TypeError("@@toPrimitive must return a primitive value.");
                                }
                                return ("string" === t ? String : Number)(e);
                            }(a, "string"), "symbol" === u(r) ? r : String(r)), i);
                        }
                        var a, r;
                    }
                    function p(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    var d = i.default.dependencyLib, h = function() {
                        function e(t, n, i) {
                            !function(e, t) {
                                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
                            }(this, e), this.mask = t, this.format = n, this.opts = i, this._date = new Date(1, 0, 1), 
                            this.initDateObject(t, this.opts);
                        }
                        var t, n, i;
                        return t = e, (n = [ {
                            key: "date",
                            get: function() {
                                return void 0 === this._date && (this._date = new Date(1, 0, 1), this.initDateObject(void 0, this.opts)), 
                                this._date;
                            }
                        }, {
                            key: "initDateObject",
                            value: function(e, t) {
                                var n;
                                for (P(t).lastIndex = 0; n = P(t).exec(this.format); ) {
                                    var i = new RegExp("\\d+$").exec(n[0]), a = i ? n[0][0] + "x" : n[0], r = void 0;
                                    if (void 0 !== e) {
                                        if (i) {
                                            var o = P(t).lastIndex, l = M(n.index, t);
                                            P(t).lastIndex = o, r = e.slice(0, e.indexOf(l.nextMatch[0]));
                                        } else r = e.slice(0, g[a] && g[a][4] || a.length);
                                        e = e.slice(r.length);
                                    }
                                    Object.prototype.hasOwnProperty.call(g, a) && this.setValue(this, r, a, g[a][2], g[a][1]);
                                }
                            }
                        }, {
                            key: "setValue",
                            value: function(e, t, n, i, a) {
                                if (void 0 !== t && (e[i] = "ampm" === i ? t : t.replace(/[^0-9]/g, "0"), e["raw" + i] = t.replace(/\s/g, "_")), 
                                void 0 !== a) {
                                    var r = e[i];
                                    ("day" === i && 29 === parseInt(r) || "month" === i && 2 === parseInt(r)) && (29 !== parseInt(e.day) || 2 !== parseInt(e.month) || "" !== e.year && void 0 !== e.year || e._date.setFullYear(2012, 1, 29)), 
                                    "day" === i && (m = !0, 0 === parseInt(r) && (r = 1)), "month" === i && (m = !0), 
                                    "year" === i && (m = !0, r.length < 4 && (r = O(r, 4, !0))), "" === r || isNaN(r) || a.call(e._date, r), 
                                    "ampm" === i && a.call(e._date, r);
                                }
                            }
                        }, {
                            key: "reset",
                            value: function() {
                                this._date = new Date(1, 0, 1);
                            }
                        }, {
                            key: "reInit",
                            value: function() {
                                this._date = void 0, this.date;
                            }
                        } ]) && f(t.prototype, n), i && f(t, i), Object.defineProperty(t, "prototype", {
                            writable: !1
                        }), e;
                    }(), v = (new Date).getFullYear(), m = !1, g = {
                        d: [ "[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", Date.prototype.getDate ],
                        dd: [ "0[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", function() {
                            return O(Date.prototype.getDate.call(this), 2);
                        } ],
                        ddd: [ "" ],
                        dddd: [ "" ],
                        m: [ "[1-9]|1[012]", function(e) {
                            var t = e ? parseInt(e) : 0;
                            return t > 0 && t--, Date.prototype.setMonth.call(this, t);
                        }, "month", function() {
                            return Date.prototype.getMonth.call(this) + 1;
                        } ],
                        mm: [ "0[1-9]|1[012]", function(e) {
                            var t = e ? parseInt(e) : 0;
                            return t > 0 && t--, Date.prototype.setMonth.call(this, t);
                        }, "month", function() {
                            return O(Date.prototype.getMonth.call(this) + 1, 2);
                        } ],
                        mmm: [ "" ],
                        mmmm: [ "" ],
                        yy: [ "[0-9]{2}", Date.prototype.setFullYear, "year", function() {
                            return O(Date.prototype.getFullYear.call(this), 2);
                        } ],
                        yyyy: [ "[0-9]{4}", Date.prototype.setFullYear, "year", function() {
                            return O(Date.prototype.getFullYear.call(this), 4);
                        } ],
                        h: [ "[1-9]|1[0-2]", Date.prototype.setHours, "hours", Date.prototype.getHours ],
                        hh: [ "0[1-9]|1[0-2]", Date.prototype.setHours, "hours", function() {
                            return O(Date.prototype.getHours.call(this), 2);
                        } ],
                        hx: [ function(e) {
                            return "[0-9]{".concat(e, "}");
                        }, Date.prototype.setHours, "hours", function(e) {
                            return Date.prototype.getHours;
                        } ],
                        H: [ "1?[0-9]|2[0-3]", Date.prototype.setHours, "hours", Date.prototype.getHours ],
                        HH: [ "0[0-9]|1[0-9]|2[0-3]", Date.prototype.setHours, "hours", function() {
                            return O(Date.prototype.getHours.call(this), 2);
                        } ],
                        Hx: [ function(e) {
                            return "[0-9]{".concat(e, "}");
                        }, Date.prototype.setHours, "hours", function(e) {
                            return function() {
                                return O(Date.prototype.getHours.call(this), e);
                            };
                        } ],
                        M: [ "[1-5]?[0-9]", Date.prototype.setMinutes, "minutes", Date.prototype.getMinutes ],
                        MM: [ "0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setMinutes, "minutes", function() {
                            return O(Date.prototype.getMinutes.call(this), 2);
                        } ],
                        s: [ "[1-5]?[0-9]", Date.prototype.setSeconds, "seconds", Date.prototype.getSeconds ],
                        ss: [ "0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]", Date.prototype.setSeconds, "seconds", function() {
                            return O(Date.prototype.getSeconds.call(this), 2);
                        } ],
                        l: [ "[0-9]{3}", Date.prototype.setMilliseconds, "milliseconds", function() {
                            return O(Date.prototype.getMilliseconds.call(this), 3);
                        }, 3 ],
                        L: [ "[0-9]{2}", Date.prototype.setMilliseconds, "milliseconds", function() {
                            return O(Date.prototype.getMilliseconds.call(this), 2);
                        }, 2 ],
                        t: [ "[ap]", k, "ampm", b, 1 ],
                        tt: [ "[ap]m", k, "ampm", b, 2 ],
                        T: [ "[AP]", k, "ampm", b, 1 ],
                        TT: [ "[AP]M", k, "ampm", b, 2 ],
                        Z: [ ".*", void 0, "Z", function() {
                            var e = this.toString().match(/\((.+)\)/)[1];
                            e.includes(" ") && (e = (e = e.replace("-", " ").toUpperCase()).split(" ").map((function(e) {
                                return s(e, 1)[0];
                            })).join(""));
                            return e;
                        } ],
                        o: [ "" ],
                        S: [ "" ]
                    }, y = {
                        isoDate: "yyyy-mm-dd",
                        isoTime: "HH:MM:ss",
                        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
                    };
                    function k(e) {
                        var t = this.getHours();
                        e.toLowerCase().includes("p") ? this.setHours(t + 12) : e.toLowerCase().includes("a") && t >= 12 && this.setHours(t - 12);
                    }
                    function b() {
                        var e = this.getHours();
                        return (e = e || 12) >= 12 ? "PM" : "AM";
                    }
                    function x(e) {
                        var t = new RegExp("\\d+$").exec(e[0]);
                        if (t && void 0 !== t[0]) {
                            var n = g[e[0][0] + "x"].slice("");
                            return n[0] = n[0](t[0]), n[3] = n[3](t[0]), n;
                        }
                        if (g[e[0]]) return g[e[0]];
                    }
                    function P(e) {
                        if (!e.tokenizer) {
                            var t = [], n = [];
                            for (var i in g) if (/\.*x$/.test(i)) {
                                var a = i[0] + "\\d+";
                                -1 === n.indexOf(a) && n.push(a);
                            } else -1 === t.indexOf(i[0]) && t.push(i[0]);
                            e.tokenizer = "(" + (n.length > 0 ? n.join("|") + "|" : "") + t.join("+|") + ")+?|.", 
                            e.tokenizer = new RegExp(e.tokenizer, "g");
                        }
                        return e.tokenizer;
                    }
                    function w(e, t, n) {
                        if (!m) return !0;
                        if (void 0 === e.rawday || !isFinite(e.rawday) && new Date(e.date.getFullYear(), isFinite(e.rawmonth) ? e.month : e.date.getMonth() + 1, 0).getDate() >= e.day || "29" == e.day && (!isFinite(e.rawyear) || void 0 === e.rawyear || "" === e.rawyear) || new Date(e.date.getFullYear(), isFinite(e.rawmonth) ? e.month : e.date.getMonth() + 1, 0).getDate() >= e.day) return t;
                        if ("29" == e.day) {
                            var i = M(t.pos, n);
                            if (i.targetMatch && "yyyy" === i.targetMatch[0] && t.pos - i.targetMatchIndex == 2) return t.remove = t.pos + 1, 
                            t;
                        } else if ("02" == e.month && "30" == e.day && void 0 !== t.c) return e.day = "03", 
                        e.date.setDate(3), e.date.setMonth(1), t.insert = [ {
                            pos: t.pos,
                            c: "0"
                        }, {
                            pos: t.pos + 1,
                            c: t.c
                        } ], t.caret = o.seekNext.call(this, t.pos + 1), t;
                        return !1;
                    }
                    function S(e, t, n, i) {
                        var a, o, l = "";
                        for (P(n).lastIndex = 0; a = P(n).exec(e); ) if (void 0 === t) if (o = x(a)) l += "(" + o[0] + ")"; else switch (a[0]) {
                          case "[":
                            l += "(";
                            break;

                          case "]":
                            l += ")?";
                            break;

                          default:
                            l += (0, r.default)(a[0]);
                        } else if (o = x(a)) if (!0 !== i && o[3]) l += o[3].call(t.date); else o[2] ? l += t["raw" + o[2]] : l += a[0]; else l += a[0];
                        return l;
                    }
                    function O(e, t, n) {
                        for (e = String(e), t = t || 2; e.length < t; ) e = n ? e + "0" : "0" + e;
                        return e;
                    }
                    function _(e, t, n) {
                        return "string" == typeof e ? new h(e, t, n) : e && "object" === u(e) && Object.prototype.hasOwnProperty.call(e, "date") ? e : void 0;
                    }
                    function E(e, t) {
                        return S(t.inputFormat, {
                            date: e
                        }, t);
                    }
                    function M(e, t) {
                        var n, i, a = 0, r = 0;
                        for (P(t).lastIndex = 0; i = P(t).exec(t.inputFormat); ) {
                            var o = new RegExp("\\d+$").exec(i[0]);
                            if ((a += r = o ? parseInt(o[0]) : i[0].length) >= e + 1) {
                                n = i, i = P(t).exec(t.inputFormat);
                                break;
                            }
                        }
                        return {
                            targetMatchIndex: a - r,
                            nextMatch: i,
                            targetMatch: n
                        };
                    }
                    i.default.extendAliases({
                        datetime: {
                            mask: function(e) {
                                return e.numericInput = !1, g.S = e.i18n.ordinalSuffix.join("|"), e.inputFormat = y[e.inputFormat] || e.inputFormat, 
                                e.displayFormat = y[e.displayFormat] || e.displayFormat || e.inputFormat, e.outputFormat = y[e.outputFormat] || e.outputFormat || e.inputFormat, 
                                e.placeholder = "" !== e.placeholder ? e.placeholder : e.inputFormat.replace(/[[\]]/, ""), 
                                e.regex = S(e.inputFormat, void 0, e), e.min = _(e.min, e.inputFormat, e), e.max = _(e.max, e.inputFormat, e), 
                                null;
                            },
                            placeholder: "",
                            inputFormat: "isoDateTime",
                            displayFormat: null,
                            outputFormat: null,
                            min: null,
                            max: null,
                            skipOptionalPartCharacter: "",
                            i18n: {
                                dayNames: [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
                                monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
                                ordinalSuffix: [ "st", "nd", "rd", "th" ]
                            },
                            preValidation: function(e, t, n, i, a, r, o, l) {
                                if (l) return !0;
                                if (isNaN(n) && e[t] !== n) {
                                    var s = M(t, a);
                                    if (s.nextMatch && s.nextMatch[0] === n && s.targetMatch[0].length > 1) {
                                        var c = g[s.targetMatch[0]][0];
                                        if (new RegExp(c).test("0" + e[t - 1])) return e[t] = e[t - 1], e[t - 1] = "0", 
                                        {
                                            fuzzy: !0,
                                            buffer: e,
                                            refreshFromBuffer: {
                                                start: t - 1,
                                                end: t + 1
                                            },
                                            pos: t + 1
                                        };
                                    }
                                }
                                return !0;
                            },
                            postValidation: function(e, t, n, i, a, r, o, s) {
                                var c, u;
                                if (o) return !0;
                                if (!1 === i && (((c = M(t + 1, a)).targetMatch && c.targetMatchIndex === t && c.targetMatch[0].length > 1 && void 0 !== g[c.targetMatch[0]] || (c = M(t + 2, a)).targetMatch && c.targetMatchIndex === t + 1 && c.targetMatch[0].length > 1 && void 0 !== g[c.targetMatch[0]]) && (u = g[c.targetMatch[0]][0]), 
                                void 0 !== u && (void 0 !== r.validPositions[t + 1] && new RegExp(u).test(n + "0") ? (e[t] = n, 
                                e[t + 1] = "0", i = {
                                    pos: t + 2,
                                    caret: t
                                }) : new RegExp(u).test("0" + n) && (e[t] = "0", e[t + 1] = n, i = {
                                    pos: t + 2
                                })), !1 === i)) return i;
                                if (i.fuzzy && (e = i.buffer, t = i.pos), (c = M(t, a)).targetMatch && c.targetMatch[0] && void 0 !== g[c.targetMatch[0]]) {
                                    var f = g[c.targetMatch[0]];
                                    u = f[0];
                                    var p = e.slice(c.targetMatchIndex, c.targetMatchIndex + c.targetMatch[0].length);
                                    if (!1 === new RegExp(u).test(p.join("")) && 2 === c.targetMatch[0].length && r.validPositions[c.targetMatchIndex] && r.validPositions[c.targetMatchIndex + 1] && (r.validPositions[c.targetMatchIndex + 1].input = "0"), 
                                    "year" == f[2]) for (var d = l.getMaskTemplate.call(this, !1, 1, void 0, !0), h = t + 1; h < e.length; h++) e[h] = d[h], 
                                    r.validPositions.splice(t + 1, 1);
                                }
                                var m = i, y = _(e.join(""), a.inputFormat, a);
                                return m && !isNaN(y.date.getTime()) && (a.prefillYear && (m = function(e, t, n) {
                                    if (e.year !== e.rawyear) {
                                        var i = v.toString(), a = e.rawyear.replace(/[^0-9]/g, ""), r = i.slice(0, a.length), o = i.slice(a.length);
                                        if (2 === a.length && a === r) {
                                            var l = new Date(v, e.month - 1, e.day);
                                            e.day == l.getDate() && (!n.max || n.max.date.getTime() >= l.getTime()) && (e.date.setFullYear(v), 
                                            e.year = i, t.insert = [ {
                                                pos: t.pos + 1,
                                                c: o[0]
                                            }, {
                                                pos: t.pos + 2,
                                                c: o[1]
                                            } ]);
                                        }
                                    }
                                    return t;
                                }(y, m, a)), m = function(e, t, n, i, a) {
                                    if (!t) return t;
                                    if (t && n.min && !isNaN(n.min.date.getTime())) {
                                        var r;
                                        for (e.reset(), P(n).lastIndex = 0; r = P(n).exec(n.inputFormat); ) {
                                            var o;
                                            if ((o = x(r)) && o[3]) {
                                                for (var l = o[1], s = e[o[2]], c = n.min[o[2]], u = n.max ? n.max[o[2]] : c, f = [], p = !1, d = 0; d < c.length; d++) void 0 !== i.validPositions[d + r.index] || p ? (f[d] = s[d], 
                                                p = p || s[d] > c[d]) : (f[d] = c[d], "year" === o[2] && s.length - 1 == d && c != u && (f = (parseInt(f.join("")) + 1).toString().split("")), 
                                                "ampm" === o[2] && c != u && n.min.date.getTime() > e.date.getTime() && (f[d] = u[d]));
                                                l.call(e._date, f.join(""));
                                            }
                                        }
                                        t = n.min.date.getTime() <= e.date.getTime(), e.reInit();
                                    }
                                    return t && n.max && (isNaN(n.max.date.getTime()) || (t = n.max.date.getTime() >= e.date.getTime())), 
                                    t;
                                }(y, m = w.call(this, y, m, a), a, r)), void 0 !== t && m && i.pos !== t ? {
                                    buffer: S(a.inputFormat, y, a).split(""),
                                    refreshFromBuffer: {
                                        start: t,
                                        end: i.pos
                                    },
                                    pos: i.caret || i.pos
                                } : m;
                            },
                            onKeyDown: function(e, t, n, i) {
                                e.ctrlKey && e.key === a.keys.ArrowRight && (this.inputmask._valueSet(E(new Date, i)), 
                                d(this).trigger("setvalue"));
                            },
                            onUnMask: function(e, t, n) {
                                return t ? S(n.outputFormat, _(e, n.inputFormat, n), n, !0) : t;
                            },
                            casing: function(e, t, n, i) {
                                return 0 == t.nativeDef.indexOf("[ap]") ? e.toLowerCase() : 0 == t.nativeDef.indexOf("[AP]") ? e.toUpperCase() : e;
                            },
                            onBeforeMask: function(e, t) {
                                return "[object Date]" === Object.prototype.toString.call(e) && (e = E(e, t)), e;
                            },
                            insertMode: !1,
                            insertModeVisual: !1,
                            shiftPositions: !1,
                            keepStatic: !1,
                            inputmode: "numeric",
                            prefillYear: !0
                        }
                    });
                },
                3851: function(e, t, n) {
                    var i, a = (i = n(2394)) && i.__esModule ? i : {
                        default: i
                    }, r = n(8711), o = n(4713);
                    a.default.extendDefinitions({
                        A: {
                            validator: "[A-Za-zА-яЁёÀ-ÿµ]",
                            casing: "upper"
                        },
                        "&": {
                            validator: "[0-9A-Za-zА-яЁёÀ-ÿµ]",
                            casing: "upper"
                        },
                        "#": {
                            validator: "[0-9A-Fa-f]",
                            casing: "upper"
                        }
                    });
                    var l = new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]");
                    function s(e, t, n, i, a) {
                        return n - 1 > -1 && "." !== t.buffer[n - 1] ? (e = t.buffer[n - 1] + e, e = n - 2 > -1 && "." !== t.buffer[n - 2] ? t.buffer[n - 2] + e : "0" + e) : e = "00" + e, 
                        l.test(e);
                    }
                    a.default.extendAliases({
                        cssunit: {
                            regex: "[+-]?[0-9]+\\.?([0-9]+)?(px|em|rem|ex|%|in|cm|mm|pt|pc)"
                        },
                        url: {
                            regex: "(https?|ftp)://.*",
                            autoUnmask: !1,
                            keepStatic: !1,
                            tabThrough: !0
                        },
                        ip: {
                            mask: "i{1,3}.j{1,3}.k{1,3}.l{1,3}",
                            definitions: {
                                i: {
                                    validator: s
                                },
                                j: {
                                    validator: s
                                },
                                k: {
                                    validator: s
                                },
                                l: {
                                    validator: s
                                }
                            },
                            onUnMask: function(e, t, n) {
                                return e;
                            },
                            inputmode: "decimal",
                            substitutes: {
                                ",": "."
                            }
                        },
                        email: {
                            mask: function(e) {
                                var t = e.separator, n = e.quantifier, i = "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}.-{1,63}[.-{1,63}][.-{1,63}]", a = i;
                                if (t) for (var r = 0; r < n; r++) a += "[".concat(t).concat(i, "]");
                                return a;
                            },
                            greedy: !1,
                            casing: "lower",
                            separator: null,
                            quantifier: 5,
                            skipOptionalPartCharacter: "",
                            onBeforePaste: function(e, t) {
                                return (e = e.toLowerCase()).replace("mailto:", "");
                            },
                            definitions: {
                                "*": {
                                    validator: "[0-9１-９A-Za-zА-яЁёÀ-ÿµ!#$%&'*+/=?^_`{|}~-]"
                                },
                                "-": {
                                    validator: "[0-9A-Za-z-]"
                                }
                            },
                            onUnMask: function(e, t, n) {
                                return e;
                            },
                            inputmode: "email"
                        },
                        mac: {
                            mask: "##:##:##:##:##:##"
                        },
                        vin: {
                            mask: "V{13}9{4}",
                            definitions: {
                                V: {
                                    validator: "[A-HJ-NPR-Za-hj-npr-z\\d]",
                                    casing: "upper"
                                }
                            },
                            clearIncomplete: !0,
                            autoUnmask: !0
                        },
                        ssn: {
                            mask: "999-99-9999",
                            postValidation: function(e, t, n, i, a, l, s) {
                                var c = o.getMaskTemplate.call(this, !0, r.getLastValidPosition.call(this), !0, !0);
                                return /^(?!219-09-9999|078-05-1120)(?!666|000|9.{2}).{3}-(?!00).{2}-(?!0{4}).{4}$/.test(c.join(""));
                            }
                        }
                    });
                },
                207: function(e, t, n) {
                    var i = l(n(2394)), a = l(n(7184)), r = n(8711), o = n(2839);
                    function l(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    var s = i.default.dependencyLib;
                    function c(e, t) {
                        for (var n = "", a = 0; a < e.length; a++) i.default.prototype.definitions[e.charAt(a)] || t.definitions[e.charAt(a)] || t.optionalmarker[0] === e.charAt(a) || t.optionalmarker[1] === e.charAt(a) || t.quantifiermarker[0] === e.charAt(a) || t.quantifiermarker[1] === e.charAt(a) || t.groupmarker[0] === e.charAt(a) || t.groupmarker[1] === e.charAt(a) || t.alternatormarker === e.charAt(a) ? n += "\\" + e.charAt(a) : n += e.charAt(a);
                        return n;
                    }
                    function u(e, t, n, i) {
                        if (e.length > 0 && t > 0 && (!n.digitsOptional || i)) {
                            var a = e.indexOf(n.radixPoint), r = !1;
                            n.negationSymbol.back === e[e.length - 1] && (r = !0, e.length--), -1 === a && (e.push(n.radixPoint), 
                            a = e.length - 1);
                            for (var o = 1; o <= t; o++) isFinite(e[a + o]) || (e[a + o] = "0");
                        }
                        return r && e.push(n.negationSymbol.back), e;
                    }
                    function f(e, t) {
                        var n = 0;
                        for (var i in "+" === e && (n = r.seekNext.call(this, t.validPositions.length - 1)), 
                        t.tests) if ((i = parseInt(i)) >= n) for (var a = 0, o = t.tests[i].length; a < o; a++) if ((void 0 === t.validPositions[i] || "-" === e) && t.tests[i][a].match.def === e) return i + (void 0 !== t.validPositions[i] && "-" !== e ? 1 : 0);
                        return n;
                    }
                    function p(e, t) {
                        for (var n = -1, i = 0, a = t.validPositions.length; i < a; i++) {
                            var r = t.validPositions[i];
                            if (r && r.match.def === e) {
                                n = i;
                                break;
                            }
                        }
                        return n;
                    }
                    function d(e, t, n, i, a) {
                        var r = t.buffer ? t.buffer.indexOf(a.radixPoint) : -1, o = (-1 !== r || i && a.jitMasking) && new RegExp(a.definitions[9].validator).test(e);
                        return a._radixDance && -1 !== r && o && null == t.validPositions[r] ? {
                            insert: {
                                pos: r === n ? r + 1 : r,
                                c: a.radixPoint
                            },
                            pos: n
                        } : o;
                    }
                    i.default.extendAliases({
                        numeric: {
                            mask: function(e) {
                                e.repeat = 0, e.groupSeparator === e.radixPoint && e.digits && "0" !== e.digits && ("." === e.radixPoint ? e.groupSeparator = "," : "," === e.radixPoint ? e.groupSeparator = "." : e.groupSeparator = ""), 
                                " " === e.groupSeparator && (e.skipOptionalPartCharacter = void 0), e.placeholder.length > 1 && (e.placeholder = e.placeholder.charAt(0)), 
                                "radixFocus" === e.positionCaretOnClick && "" === e.placeholder && (e.positionCaretOnClick = "lvp");
                                var t = "0", n = e.radixPoint;
                                !0 === e.numericInput && void 0 === e.__financeInput ? (t = "1", e.positionCaretOnClick = "radixFocus" === e.positionCaretOnClick ? "lvp" : e.positionCaretOnClick, 
                                e.digitsOptional = !1, isNaN(e.digits) && (e.digits = 2), e._radixDance = !1, n = "," === e.radixPoint ? "?" : "!", 
                                "" !== e.radixPoint && void 0 === e.definitions[n] && (e.definitions[n] = {}, e.definitions[n].validator = "[" + e.radixPoint + "]", 
                                e.definitions[n].placeholder = e.radixPoint, e.definitions[n].static = !0, e.definitions[n].generated = !0)) : (e.__financeInput = !1, 
                                e.numericInput = !0);
                                var i, r = "[+]";
                                if (r += c(e.prefix, e), "" !== e.groupSeparator ? (void 0 === e.definitions[e.groupSeparator] && (e.definitions[e.groupSeparator] = {}, 
                                e.definitions[e.groupSeparator].validator = "[" + e.groupSeparator + "]", e.definitions[e.groupSeparator].placeholder = e.groupSeparator, 
                                e.definitions[e.groupSeparator].static = !0, e.definitions[e.groupSeparator].generated = !0), 
                                r += e._mask(e)) : r += "9{+}", void 0 !== e.digits && 0 !== e.digits) {
                                    var o = e.digits.toString().split(",");
                                    isFinite(o[0]) && o[1] && isFinite(o[1]) ? r += n + t + "{" + e.digits + "}" : (isNaN(e.digits) || parseInt(e.digits) > 0) && (e.digitsOptional || e.jitMasking ? (i = r + n + t + "{0," + e.digits + "}", 
                                    e.keepStatic = !0) : r += n + t + "{" + e.digits + "}");
                                } else e.inputmode = "numeric";
                                return r += c(e.suffix, e), r += "[-]", i && (r = [ i + c(e.suffix, e) + "[-]", r ]), 
                                e.greedy = !1, function(e) {
                                    void 0 === e.parseMinMaxOptions && (null !== e.min && (e.min = e.min.toString().replace(new RegExp((0, 
                                    a.default)(e.groupSeparator), "g"), ""), "," === e.radixPoint && (e.min = e.min.replace(e.radixPoint, ".")), 
                                    e.min = isFinite(e.min) ? parseFloat(e.min) : NaN, isNaN(e.min) && (e.min = Number.MIN_VALUE)), 
                                    null !== e.max && (e.max = e.max.toString().replace(new RegExp((0, a.default)(e.groupSeparator), "g"), ""), 
                                    "," === e.radixPoint && (e.max = e.max.replace(e.radixPoint, ".")), e.max = isFinite(e.max) ? parseFloat(e.max) : NaN, 
                                    isNaN(e.max) && (e.max = Number.MAX_VALUE)), e.parseMinMaxOptions = "done");
                                }(e), "" !== e.radixPoint && e.substituteRadixPoint && (e.substitutes["." == e.radixPoint ? "," : "."] = e.radixPoint), 
                                r;
                            },
                            _mask: function(e) {
                                return "(" + e.groupSeparator + "999){+|1}";
                            },
                            digits: "*",
                            digitsOptional: !0,
                            enforceDigitsOnBlur: !1,
                            radixPoint: ".",
                            positionCaretOnClick: "radixFocus",
                            _radixDance: !0,
                            groupSeparator: "",
                            allowMinus: !0,
                            negationSymbol: {
                                front: "-",
                                back: ""
                            },
                            prefix: "",
                            suffix: "",
                            min: null,
                            max: null,
                            SetMaxOnOverflow: !1,
                            step: 1,
                            inputType: "text",
                            unmaskAsNumber: !1,
                            roundingFN: Math.round,
                            inputmode: "decimal",
                            shortcuts: {
                                k: "1000",
                                m: "1000000"
                            },
                            placeholder: "0",
                            greedy: !1,
                            rightAlign: !0,
                            insertMode: !0,
                            autoUnmask: !1,
                            skipOptionalPartCharacter: "",
                            usePrototypeDefinitions: !1,
                            stripLeadingZeroes: !0,
                            substituteRadixPoint: !0,
                            definitions: {
                                0: {
                                    validator: d
                                },
                                1: {
                                    validator: d,
                                    definitionSymbol: "9"
                                },
                                9: {
                                    validator: "[0-9０-９٠-٩۰-۹]",
                                    definitionSymbol: "*"
                                },
                                "+": {
                                    validator: function(e, t, n, i, a) {
                                        return a.allowMinus && ("-" === e || e === a.negationSymbol.front);
                                    }
                                },
                                "-": {
                                    validator: function(e, t, n, i, a) {
                                        return a.allowMinus && e === a.negationSymbol.back;
                                    }
                                }
                            },
                            preValidation: function(e, t, n, i, a, r, o, l) {
                                var s = this;
                                if (!1 !== a.__financeInput && n === a.radixPoint) return !1;
                                var c = e.indexOf(a.radixPoint), u = t;
                                if (t = function(e, t, n, i, a) {
                                    return a._radixDance && a.numericInput && t !== a.negationSymbol.back && e <= n && (n > 0 || t == a.radixPoint) && (void 0 === i.validPositions[e - 1] || i.validPositions[e - 1].input !== a.negationSymbol.back) && (e -= 1), 
                                    e;
                                }(t, n, c, r, a), "-" === n || n === a.negationSymbol.front) {
                                    if (!0 !== a.allowMinus) return !1;
                                    var d = !1, h = p("+", r), v = p("-", r);
                                    return -1 !== h && (d = [ h, v ]), !1 !== d ? {
                                        remove: d,
                                        caret: u - a.negationSymbol.back.length
                                    } : {
                                        insert: [ {
                                            pos: f.call(s, "+", r),
                                            c: a.negationSymbol.front,
                                            fromIsValid: !0
                                        }, {
                                            pos: f.call(s, "-", r),
                                            c: a.negationSymbol.back,
                                            fromIsValid: void 0
                                        } ],
                                        caret: u + a.negationSymbol.back.length
                                    };
                                }
                                if (n === a.groupSeparator) return {
                                    caret: u
                                };
                                if (l) return !0;
                                if (-1 !== c && !0 === a._radixDance && !1 === i && n === a.radixPoint && void 0 !== a.digits && (isNaN(a.digits) || parseInt(a.digits) > 0) && c !== t) {
                                    var m = f.call(s, a.radixPoint, r);
                                    return r.validPositions[m] && (r.validPositions[m].generatedInput = r.validPositions[m].generated || !1), 
                                    {
                                        caret: a._radixDance && t === c - 1 ? c + 1 : c
                                    };
                                }
                                if (!1 === a.__financeInput) if (i) {
                                    if (a.digitsOptional) return {
                                        rewritePosition: o.end
                                    };
                                    if (!a.digitsOptional) {
                                        if (o.begin > c && o.end <= c) return n === a.radixPoint ? {
                                            insert: {
                                                pos: c + 1,
                                                c: "0",
                                                fromIsValid: !0
                                            },
                                            rewritePosition: c
                                        } : {
                                            rewritePosition: c + 1
                                        };
                                        if (o.begin < c) return {
                                            rewritePosition: o.begin - 1
                                        };
                                    }
                                } else if (!a.showMaskOnHover && !a.showMaskOnFocus && !a.digitsOptional && a.digits > 0 && "" === this.__valueGet.call(this.el)) return {
                                    rewritePosition: c
                                };
                                return {
                                    rewritePosition: t
                                };
                            },
                            postValidation: function(e, t, n, i, a, r, o) {
                                if (!1 === i) return i;
                                if (o) return !0;
                                if (null !== a.min || null !== a.max) {
                                    var l = a.onUnMask(e.slice().reverse().join(""), void 0, s.extend({}, a, {
                                        unmaskAsNumber: !0
                                    }));
                                    if (null !== a.min && l < a.min && (l.toString().length > a.min.toString().length || l < 0)) return !1;
                                    if (null !== a.max && l > a.max) return !!a.SetMaxOnOverflow && {
                                        refreshFromBuffer: !0,
                                        buffer: u(a.max.toString().replace(".", a.radixPoint).split(""), a.digits, a).reverse()
                                    };
                                }
                                return i;
                            },
                            onUnMask: function(e, t, n) {
                                if ("" === t && !0 === n.nullable) return t;
                                var i = e.replace(n.prefix, "");
                                return i = (i = i.replace(n.suffix, "")).replace(new RegExp((0, a.default)(n.groupSeparator), "g"), ""), 
                                "" !== n.placeholder.charAt(0) && (i = i.replace(new RegExp(n.placeholder.charAt(0), "g"), "0")), 
                                n.unmaskAsNumber ? ("" !== n.radixPoint && -1 !== i.indexOf(n.radixPoint) && (i = i.replace(a.default.call(this, n.radixPoint), ".")), 
                                i = (i = i.replace(new RegExp("^" + (0, a.default)(n.negationSymbol.front)), "-")).replace(new RegExp((0, 
                                a.default)(n.negationSymbol.back) + "$"), ""), Number(i)) : i;
                            },
                            isComplete: function(e, t) {
                                var n = (t.numericInput ? e.slice().reverse() : e).join("");
                                return n = (n = (n = (n = (n = n.replace(new RegExp("^" + (0, a.default)(t.negationSymbol.front)), "-")).replace(new RegExp((0, 
                                a.default)(t.negationSymbol.back) + "$"), "")).replace(t.prefix, "")).replace(t.suffix, "")).replace(new RegExp((0, 
                                a.default)(t.groupSeparator) + "([0-9]{3})", "g"), "$1"), "," === t.radixPoint && (n = n.replace((0, 
                                a.default)(t.radixPoint), ".")), isFinite(n);
                            },
                            onBeforeMask: function(e, t) {
                                var n = t.radixPoint || ",";
                                isFinite(t.digits) && (t.digits = parseInt(t.digits)), "number" != typeof e && "number" !== t.inputType || "" === n || (e = e.toString().replace(".", n));
                                var i = "-" === e.charAt(0) || e.charAt(0) === t.negationSymbol.front, r = e.split(n), o = r[0].replace(/[^\-0-9]/g, ""), l = r.length > 1 ? r[1].replace(/[^0-9]/g, "") : "", s = r.length > 1;
                                e = o + ("" !== l ? n + l : l);
                                var c = 0;
                                if ("" !== n && (c = t.digitsOptional ? t.digits < l.length ? t.digits : l.length : t.digits, 
                                "" !== l || !t.digitsOptional)) {
                                    var f = Math.pow(10, c || 1);
                                    e = e.replace((0, a.default)(n), "."), isNaN(parseFloat(e)) || (e = (t.roundingFN(parseFloat(e) * f) / f).toFixed(c)), 
                                    e = e.toString().replace(".", n);
                                }
                                if (0 === t.digits && -1 !== e.indexOf(n) && (e = e.substring(0, e.indexOf(n))), 
                                null !== t.min || null !== t.max) {
                                    var p = e.toString().replace(n, ".");
                                    null !== t.min && p < t.min ? e = t.min.toString().replace(".", n) : null !== t.max && p > t.max && (e = t.max.toString().replace(".", n));
                                }
                                return i && "-" !== e.charAt(0) && (e = "-" + e), u(e.toString().split(""), c, t, s).join("");
                            },
                            onBeforeWrite: function(e, t, n, i) {
                                function r(e, t) {
                                    if (!1 !== i.__financeInput || t) {
                                        var n = e.indexOf(i.radixPoint);
                                        -1 !== n && e.splice(n, 1);
                                    }
                                    if ("" !== i.groupSeparator) for (;-1 !== (n = e.indexOf(i.groupSeparator)); ) e.splice(n, 1);
                                    return e;
                                }
                                var o, l;
                                if (i.stripLeadingZeroes && (l = function(e, t) {
                                    var n = new RegExp("(^" + ("" !== t.negationSymbol.front ? (0, a.default)(t.negationSymbol.front) + "?" : "") + (0, 
                                    a.default)(t.prefix) + ")(.*)(" + (0, a.default)(t.suffix) + ("" != t.negationSymbol.back ? (0, 
                                    a.default)(t.negationSymbol.back) + "?" : "") + "$)").exec(e.slice().reverse().join("")), i = n ? n[2] : "", r = !1;
                                    return i && (i = i.split(t.radixPoint.charAt(0))[0], r = new RegExp("^[0" + t.groupSeparator + "]*").exec(i)), 
                                    !(!r || !(r[0].length > 1 || r[0].length > 0 && r[0].length < i.length)) && r;
                                }(t, i))) for (var c = t.join("").lastIndexOf(l[0].split("").reverse().join("")) - (l[0] == l.input ? 0 : 1), f = l[0] == l.input ? 1 : 0, p = l[0].length - f; p > 0; p--) this.maskset.validPositions.splice(c + p, 1), 
                                delete t[c + p];
                                if (e) switch (e.type) {
                                  case "blur":
                                  case "checkval":
                                    if (null !== i.min) {
                                        var d = i.onUnMask(t.slice().reverse().join(""), void 0, s.extend({}, i, {
                                            unmaskAsNumber: !0
                                        }));
                                        if (null !== i.min && d < i.min) return {
                                            refreshFromBuffer: !0,
                                            buffer: u(i.min.toString().replace(".", i.radixPoint).split(""), i.digits, i).reverse()
                                        };
                                    }
                                    if (t[t.length - 1] === i.negationSymbol.front) {
                                        var h = new RegExp("(^" + ("" != i.negationSymbol.front ? (0, a.default)(i.negationSymbol.front) + "?" : "") + (0, 
                                        a.default)(i.prefix) + ")(.*)(" + (0, a.default)(i.suffix) + ("" != i.negationSymbol.back ? (0, 
                                        a.default)(i.negationSymbol.back) + "?" : "") + "$)").exec(r(t.slice(), !0).reverse().join(""));
                                        0 == (h ? h[2] : "") && (o = {
                                            refreshFromBuffer: !0,
                                            buffer: [ 0 ]
                                        });
                                    } else if ("" !== i.radixPoint) t.indexOf(i.radixPoint) === i.suffix.length && (o && o.buffer ? o.buffer.splice(0, 1 + i.suffix.length) : (t.splice(0, 1 + i.suffix.length), 
                                    o = {
                                        refreshFromBuffer: !0,
                                        buffer: r(t)
                                    }));
                                    if (i.enforceDigitsOnBlur) {
                                        var v = (o = o || {}) && o.buffer || t.slice().reverse();
                                        o.refreshFromBuffer = !0, o.buffer = u(v, i.digits, i, !0).reverse();
                                    }
                                }
                                return o;
                            },
                            onKeyDown: function(e, t, n, i) {
                                var a, r = s(this);
                                if (3 != e.location) {
                                    var l, c = e.key;
                                    if ((l = i.shortcuts && i.shortcuts[c]) && l.length > 1) return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) * parseInt(l)), 
                                    r.trigger("setvalue"), !1;
                                }
                                if (e.ctrlKey) switch (e.key) {
                                  case o.keys.ArrowUp:
                                    return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) + parseInt(i.step)), 
                                    r.trigger("setvalue"), !1;

                                  case o.keys.ArrowDown:
                                    return this.inputmask.__valueSet.call(this, parseFloat(this.inputmask.unmaskedvalue()) - parseInt(i.step)), 
                                    r.trigger("setvalue"), !1;
                                }
                                if (!e.shiftKey && (e.key === o.keys.Delete || e.key === o.keys.Backspace || e.key === o.keys.BACKSPACE_SAFARI) && n.begin !== t.length) {
                                    if (t[e.key === o.keys.Delete ? n.begin - 1 : n.end] === i.negationSymbol.front) return a = t.slice().reverse(), 
                                    "" !== i.negationSymbol.front && a.shift(), "" !== i.negationSymbol.back && a.pop(), 
                                    r.trigger("setvalue", [ a.join(""), n.begin ]), !1;
                                    if (!0 === i._radixDance) {
                                        var f = t.indexOf(i.radixPoint);
                                        if (i.digitsOptional) {
                                            if (0 === f) return (a = t.slice().reverse()).pop(), r.trigger("setvalue", [ a.join(""), n.begin >= a.length ? a.length : n.begin ]), 
                                            !1;
                                        } else if (-1 !== f && (n.begin < f || n.end < f || e.key === o.keys.Delete && (n.begin === f || n.begin - 1 === f))) {
                                            var p = void 0;
                                            return n.begin === n.end && (e.key === o.keys.Backspace || e.key === o.keys.BACKSPACE_SAFARI ? n.begin++ : e.key === o.keys.Delete && n.begin - 1 === f && (p = s.extend({}, n), 
                                            n.begin--, n.end--)), (a = t.slice().reverse()).splice(a.length - n.begin, n.begin - n.end + 1), 
                                            a = u(a, i.digits, i).join(""), p && (n = p), r.trigger("setvalue", [ a, n.begin >= a.length ? f + 1 : n.begin ]), 
                                            !1;
                                        }
                                    }
                                }
                            }
                        },
                        currency: {
                            prefix: "",
                            groupSeparator: ",",
                            alias: "numeric",
                            digits: 2,
                            digitsOptional: !1
                        },
                        decimal: {
                            alias: "numeric"
                        },
                        integer: {
                            alias: "numeric",
                            inputmode: "numeric",
                            digits: 0
                        },
                        percentage: {
                            alias: "numeric",
                            min: 0,
                            max: 100,
                            suffix: " %",
                            digits: 0,
                            allowMinus: !1
                        },
                        indianns: {
                            alias: "numeric",
                            _mask: function(e) {
                                return "(" + e.groupSeparator + "99){*|1}(" + e.groupSeparator + "999){1|1}";
                            },
                            groupSeparator: ",",
                            radixPoint: ".",
                            placeholder: "0",
                            digits: 2,
                            digitsOptional: !1
                        }
                    });
                },
                9380: function(e, t) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = void 0;
                    var n = !("undefined" == typeof window || !window.document || !window.document.createElement) ? window : {};
                    t.default = n;
                },
                7760: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.HandleNativePlaceholder = function(e, t) {
                        var n = e ? e.inputmask : this;
                        if (l.ie) {
                            if (e.inputmask._valueGet() !== t && (e.placeholder !== t || "" === e.placeholder)) {
                                var i = r.getBuffer.call(n).slice(), a = e.inputmask._valueGet();
                                if (a !== t) {
                                    var o = r.getLastValidPosition.call(n);
                                    -1 === o && a === r.getBufferTemplate.call(n).join("") ? i = [] : -1 !== o && u.call(n, i), 
                                    p(e, i);
                                }
                            }
                        } else e.placeholder !== t && (e.placeholder = t, "" === e.placeholder && e.removeAttribute("placeholder"));
                    }, t.applyInputValue = c, t.checkVal = f, t.clearOptionalTail = u, t.unmaskedvalue = function(e) {
                        var t = e ? e.inputmask : this, n = t.opts, i = t.maskset;
                        if (e) {
                            if (void 0 === e.inputmask) return e.value;
                            e.inputmask && e.inputmask.refreshValue && c(e, e.inputmask._valueGet(!0));
                        }
                        for (var a = [], o = i.validPositions, l = 0, s = o.length; l < s; l++) o[l] && o[l].match && (1 != o[l].match.static || Array.isArray(i.metadata) && !0 !== o[l].generatedInput) && a.push(o[l].input);
                        var u = 0 === a.length ? "" : (t.isRTL ? a.reverse() : a).join("");
                        if ("function" == typeof n.onUnMask) {
                            var f = (t.isRTL ? r.getBuffer.call(t).slice().reverse() : r.getBuffer.call(t)).join("");
                            u = n.onUnMask.call(t, f, u, n);
                        }
                        return u;
                    }, t.writeBuffer = p;
                    var i = n(2839), a = n(4713), r = n(8711), o = n(7215), l = n(9845), s = n(6030);
                    function c(e, t) {
                        var n = e ? e.inputmask : this, i = n.opts;
                        e.inputmask.refreshValue = !1, "function" == typeof i.onBeforeMask && (t = i.onBeforeMask.call(n, t, i) || t), 
                        f(e, !0, !1, t = (t || "").toString().split("")), n.undoValue = n._valueGet(!0), 
                        (i.clearMaskOnLostFocus || i.clearIncomplete) && e.inputmask._valueGet() === r.getBufferTemplate.call(n).join("") && -1 === r.getLastValidPosition.call(n) && e.inputmask._valueSet("");
                    }
                    function u(e) {
                        e.length = 0;
                        for (var t, n = a.getMaskTemplate.call(this, !0, 0, !0, void 0, !0); void 0 !== (t = n.shift()); ) e.push(t);
                        return e;
                    }
                    function f(e, t, n, i, l) {
                        var c = e ? e.inputmask : this, u = c.maskset, f = c.opts, d = c.dependencyLib, h = i.slice(), v = "", m = -1, g = void 0, y = f.skipOptionalPartCharacter;
                        f.skipOptionalPartCharacter = "", r.resetMaskSet.call(c, !1), c.clicked = 0, m = f.radixPoint ? r.determineNewCaretPosition.call(c, {
                            begin: 0,
                            end: 0
                        }, !1, !1 === f.__financeInput ? "radixFocus" : void 0).begin : 0, u.p = m, c.caretPos = {
                            begin: m
                        };
                        var k = [], b = c.caretPos;
                        if (h.forEach((function(e, t) {
                            if (void 0 !== e) {
                                var i = new d.Event("_checkval");
                                i.key = e, v += e;
                                var o = r.getLastValidPosition.call(c, void 0, !0);
                                !function(e, t) {
                                    for (var n = a.getMaskTemplate.call(c, !0, 0).slice(e, r.seekNext.call(c, e, !1, !1)).join("").replace(/'/g, ""), i = n.indexOf(t); i > 0 && " " === n[i - 1]; ) i--;
                                    var o = 0 === i && !r.isMask.call(c, e) && (a.getTest.call(c, e).match.nativeDef === t.charAt(0) || !0 === a.getTest.call(c, e).match.static && a.getTest.call(c, e).match.nativeDef === "'" + t.charAt(0) || " " === a.getTest.call(c, e).match.nativeDef && (a.getTest.call(c, e + 1).match.nativeDef === t.charAt(0) || !0 === a.getTest.call(c, e + 1).match.static && a.getTest.call(c, e + 1).match.nativeDef === "'" + t.charAt(0)));
                                    if (!o && i > 0 && !r.isMask.call(c, e, !1, !0)) {
                                        var l = r.seekNext.call(c, e);
                                        c.caretPos.begin < l && (c.caretPos = {
                                            begin: l
                                        });
                                    }
                                    return o;
                                }(m, v) ? (g = s.EventHandlers.keypressEvent.call(c, i, !0, !1, n, c.caretPos.begin)) && (m = c.caretPos.begin + 1, 
                                v = "") : g = s.EventHandlers.keypressEvent.call(c, i, !0, !1, n, o + 1), g ? (void 0 !== g.pos && u.validPositions[g.pos] && !0 === u.validPositions[g.pos].match.static && void 0 === u.validPositions[g.pos].alternation && (k.push(g.pos), 
                                c.isRTL || (g.forwardPosition = g.pos + 1)), p.call(c, void 0, r.getBuffer.call(c), g.forwardPosition, i, !1), 
                                c.caretPos = {
                                    begin: g.forwardPosition,
                                    end: g.forwardPosition
                                }, b = c.caretPos) : void 0 === u.validPositions[t] && h[t] === a.getPlaceholder.call(c, t) && r.isMask.call(c, t, !0) ? c.caretPos.begin++ : c.caretPos = b;
                            }
                        })), k.length > 0) {
                            var x, P, w = r.seekNext.call(c, -1, void 0, !1);
                            if (!o.isComplete.call(c, r.getBuffer.call(c)) && k.length <= w || o.isComplete.call(c, r.getBuffer.call(c)) && k.length > 0 && k.length !== w && 0 === k[0]) for (var S = w; void 0 !== (x = k.shift()); ) {
                                var O = new d.Event("_checkval");
                                if ((P = u.validPositions[x]).generatedInput = !0, O.key = P.input, (g = s.EventHandlers.keypressEvent.call(c, O, !0, !1, n, S)) && void 0 !== g.pos && g.pos !== x && u.validPositions[g.pos] && !0 === u.validPositions[g.pos].match.static) k.push(g.pos); else if (!g) break;
                                S++;
                            }
                        }
                        t && p.call(c, e, r.getBuffer.call(c), g ? g.forwardPosition : c.caretPos.begin, l || new d.Event("checkval"), l && ("input" === l.type && c.undoValue !== r.getBuffer.call(c).join("") || "paste" === l.type)), 
                        f.skipOptionalPartCharacter = y;
                    }
                    function p(e, t, n, a, l) {
                        var s = e ? e.inputmask : this, c = s.opts, u = s.dependencyLib;
                        if (a && "function" == typeof c.onBeforeWrite) {
                            var f = c.onBeforeWrite.call(s, a, t, n, c);
                            if (f) {
                                if (f.refreshFromBuffer) {
                                    var p = f.refreshFromBuffer;
                                    o.refreshFromBuffer.call(s, !0 === p ? p : p.start, p.end, f.buffer || t), t = r.getBuffer.call(s, !0);
                                }
                                void 0 !== n && (n = void 0 !== f.caret ? f.caret : n);
                            }
                        }
                        if (void 0 !== e && (e.inputmask._valueSet(t.join("")), void 0 === n || void 0 !== a && "blur" === a.type || r.caret.call(s, e, n, void 0, void 0, void 0 !== a && "keydown" === a.type && (a.key === i.keys.Delete || a.key === i.keys.Backspace)), 
                        !0 === l)) {
                            var d = u(e), h = e.inputmask._valueGet();
                            e.inputmask.skipInputEvent = !0, d.trigger("input"), setTimeout((function() {
                                h === r.getBufferTemplate.call(s).join("") ? d.trigger("cleared") : !0 === o.isComplete.call(s, t) && d.trigger("complete");
                            }), 0);
                        }
                    }
                },
                2394: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = void 0;
                    var i = n(157), a = v(n(4963)), r = v(n(9380)), o = n(2391), l = n(4713), s = n(8711), c = n(7215), u = n(7760), f = n(9716), p = v(n(7392)), d = v(n(3976));
                    function h(e) {
                        return h = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, h(e);
                    }
                    function v(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    var m = r.default.document, g = "_inputmask_opts";
                    function y(e, t, n) {
                        if (!(this instanceof y)) return new y(e, t, n);
                        this.dependencyLib = a.default, this.el = void 0, this.events = {}, this.maskset = void 0, 
                        !0 !== n && ("[object Object]" === Object.prototype.toString.call(e) ? t = e : (t = t || {}, 
                        e && (t.alias = e)), this.opts = a.default.extend(!0, {}, this.defaults, t), this.noMasksCache = t && void 0 !== t.definitions, 
                        this.userOptions = t || {}, k(this.opts.alias, t, this.opts)), this.refreshValue = !1, 
                        this.undoValue = void 0, this.$el = void 0, this.skipInputEvent = !1, this.validationEvent = !1, 
                        this.ignorable = !1, this.maxLength, this.mouseEnter = !1, this.clicked = 0, this.originalPlaceholder = void 0, 
                        this.isComposing = !1, this.hasAlternator = !1;
                    }
                    function k(e, t, n) {
                        var i = y.prototype.aliases[e];
                        return i ? (i.alias && k(i.alias, void 0, n), a.default.extend(!0, n, i), a.default.extend(!0, n, t), 
                        !0) : (null === n.mask && (n.mask = e), !1);
                    }
                    y.prototype = {
                        dataAttribute: "data-inputmask",
                        defaults: d.default,
                        definitions: p.default,
                        aliases: {},
                        masksCache: {},
                        get isRTL() {
                            return this.opts.isRTL || this.opts.numericInput;
                        },
                        mask: function(e) {
                            var t = this;
                            return "string" == typeof e && (e = m.getElementById(e) || m.querySelectorAll(e)), 
                            (e = e.nodeName ? [ e ] : Array.isArray(e) ? e : [].slice.call(e)).forEach((function(e, n) {
                                var l = a.default.extend(!0, {}, t.opts);
                                if (function(e, t, n, i) {
                                    function o(t, a) {
                                        var o = "" === i ? t : i + "-" + t;
                                        null !== (a = void 0 !== a ? a : e.getAttribute(o)) && ("string" == typeof a && (0 === t.indexOf("on") ? a = r.default[a] : "false" === a ? a = !1 : "true" === a && (a = !0)), 
                                        n[t] = a);
                                    }
                                    if (!0 === t.importDataAttributes) {
                                        var l, s, c, u, f = e.getAttribute(i);
                                        if (f && "" !== f && (f = f.replace(/'/g, '"'), s = JSON.parse("{" + f + "}")), 
                                        s) for (u in c = void 0, s) if ("alias" === u.toLowerCase()) {
                                            c = s[u];
                                            break;
                                        }
                                        for (l in o("alias", c), n.alias && k(n.alias, n, t), t) {
                                            if (s) for (u in c = void 0, s) if (u.toLowerCase() === l.toLowerCase()) {
                                                c = s[u];
                                                break;
                                            }
                                            o(l, c);
                                        }
                                    }
                                    a.default.extend(!0, t, n), ("rtl" === e.dir || t.rightAlign) && (e.style.textAlign = "right");
                                    ("rtl" === e.dir || t.numericInput) && (e.dir = "ltr", e.removeAttribute("dir"), 
                                    t.isRTL = !0);
                                    return Object.keys(n).length;
                                }(e, l, a.default.extend(!0, {}, t.userOptions), t.dataAttribute)) {
                                    var s = (0, o.generateMaskSet)(l, t.noMasksCache);
                                    void 0 !== s && (void 0 !== e.inputmask && (e.inputmask.opts.autoUnmask = !0, e.inputmask.remove()), 
                                    e.inputmask = new y(void 0, void 0, !0), e.inputmask.opts = l, e.inputmask.noMasksCache = t.noMasksCache, 
                                    e.inputmask.userOptions = a.default.extend(!0, {}, t.userOptions), e.inputmask.el = e, 
                                    e.inputmask.$el = (0, a.default)(e), e.inputmask.maskset = s, a.default.data(e, g, t.userOptions), 
                                    i.mask.call(e.inputmask));
                                }
                            })), e && e[0] && e[0].inputmask || this;
                        },
                        option: function(e, t) {
                            return "string" == typeof e ? this.opts[e] : "object" === h(e) ? (a.default.extend(this.userOptions, e), 
                            this.el && !0 !== t && this.mask(this.el), this) : void 0;
                        },
                        unmaskedvalue: function(e) {
                            if (this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), 
                            void 0 === this.el || void 0 !== e) {
                                var t = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e, this.opts) || e).split("");
                                u.checkVal.call(this, void 0, !1, !1, t), "function" == typeof this.opts.onBeforeWrite && this.opts.onBeforeWrite.call(this, void 0, s.getBuffer.call(this), 0, this.opts);
                            }
                            return u.unmaskedvalue.call(this, this.el);
                        },
                        remove: function() {
                            if (this.el) {
                                a.default.data(this.el, g, null);
                                var e = this.opts.autoUnmask ? (0, u.unmaskedvalue)(this.el) : this._valueGet(this.opts.autoUnmask);
                                e !== s.getBufferTemplate.call(this).join("") ? this._valueSet(e, this.opts.autoUnmask) : this._valueSet(""), 
                                f.EventRuler.off(this.el), Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this.el), "value") && this.__valueGet && Object.defineProperty(this.el, "value", {
                                    get: this.__valueGet,
                                    set: this.__valueSet,
                                    configurable: !0
                                }) : m.__lookupGetter__ && this.el.__lookupGetter__("value") && this.__valueGet && (this.el.__defineGetter__("value", this.__valueGet), 
                                this.el.__defineSetter__("value", this.__valueSet)), this.el.inputmask = void 0;
                            }
                            return this.el;
                        },
                        getemptymask: function() {
                            return this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), 
                            (this.isRTL ? s.getBufferTemplate.call(this).reverse() : s.getBufferTemplate.call(this)).join("");
                        },
                        hasMaskedValue: function() {
                            return !this.opts.autoUnmask;
                        },
                        isComplete: function() {
                            return this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), 
                            c.isComplete.call(this, s.getBuffer.call(this));
                        },
                        getmetadata: function() {
                            if (this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), 
                            Array.isArray(this.maskset.metadata)) {
                                var e = l.getMaskTemplate.call(this, !0, 0, !1).join("");
                                return this.maskset.metadata.forEach((function(t) {
                                    return t.mask !== e || (e = t, !1);
                                })), e;
                            }
                            return this.maskset.metadata;
                        },
                        isValid: function(e) {
                            if (this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache), 
                            e) {
                                var t = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e, this.opts) || e).split("");
                                u.checkVal.call(this, void 0, !0, !1, t);
                            } else e = this.isRTL ? s.getBuffer.call(this).slice().reverse().join("") : s.getBuffer.call(this).join("");
                            for (var n = s.getBuffer.call(this), i = s.determineLastRequiredPosition.call(this), a = n.length - 1; a > i && !s.isMask.call(this, a); a--) ;
                            return n.splice(i, a + 1 - i), c.isComplete.call(this, n) && e === (this.isRTL ? s.getBuffer.call(this).slice().reverse().join("") : s.getBuffer.call(this).join(""));
                        },
                        format: function(e, t) {
                            this.maskset = this.maskset || (0, o.generateMaskSet)(this.opts, this.noMasksCache);
                            var n = ("function" == typeof this.opts.onBeforeMask && this.opts.onBeforeMask.call(this, e, this.opts) || e).split("");
                            u.checkVal.call(this, void 0, !0, !1, n);
                            var i = this.isRTL ? s.getBuffer.call(this).slice().reverse().join("") : s.getBuffer.call(this).join("");
                            return t ? {
                                value: i,
                                metadata: this.getmetadata()
                            } : i;
                        },
                        setValue: function(e) {
                            this.el && (0, a.default)(this.el).trigger("setvalue", [ e ]);
                        },
                        analyseMask: o.analyseMask
                    }, y.extendDefaults = function(e) {
                        a.default.extend(!0, y.prototype.defaults, e);
                    }, y.extendDefinitions = function(e) {
                        a.default.extend(!0, y.prototype.definitions, e);
                    }, y.extendAliases = function(e) {
                        a.default.extend(!0, y.prototype.aliases, e);
                    }, y.format = function(e, t, n) {
                        return y(t).format(e, n);
                    }, y.unmask = function(e, t) {
                        return y(t).unmaskedvalue(e);
                    }, y.isValid = function(e, t) {
                        return y(t).isValid(e);
                    }, y.remove = function(e) {
                        "string" == typeof e && (e = m.getElementById(e) || m.querySelectorAll(e)), (e = e.nodeName ? [ e ] : e).forEach((function(e) {
                            e.inputmask && e.inputmask.remove();
                        }));
                    }, y.setValue = function(e, t) {
                        "string" == typeof e && (e = m.getElementById(e) || m.querySelectorAll(e)), (e = e.nodeName ? [ e ] : e).forEach((function(e) {
                            e.inputmask ? e.inputmask.setValue(t) : (0, a.default)(e).trigger("setvalue", [ t ]);
                        }));
                    }, y.dependencyLib = a.default, r.default.Inputmask = y;
                    var b = y;
                    t.default = b;
                },
                5296: function(e, t, n) {
                    function i(e) {
                        return i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, i(e);
                    }
                    var a = d(n(9380)), r = d(n(2394));
                    function o(e, t) {
                        for (var n = 0; n < t.length; n++) {
                            var a = t[n];
                            a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), 
                            Object.defineProperty(e, (r = a.key, o = void 0, o = function(e, t) {
                                if ("object" !== i(e) || null === e) return e;
                                var n = e[Symbol.toPrimitive];
                                if (void 0 !== n) {
                                    var a = n.call(e, t || "default");
                                    if ("object" !== i(a)) return a;
                                    throw new TypeError("@@toPrimitive must return a primitive value.");
                                }
                                return ("string" === t ? String : Number)(e);
                            }(r, "string"), "symbol" === i(o) ? o : String(o)), a);
                        }
                        var r, o;
                    }
                    function l(e) {
                        var t = u();
                        return function() {
                            var n, a = p(e);
                            if (t) {
                                var r = p(this).constructor;
                                n = Reflect.construct(a, arguments, r);
                            } else n = a.apply(this, arguments);
                            return function(e, t) {
                                if (t && ("object" === i(t) || "function" == typeof t)) return t;
                                if (void 0 !== t) throw new TypeError("Derived constructors may only return object or undefined");
                                return function(e) {
                                    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                                    return e;
                                }(e);
                            }(this, n);
                        };
                    }
                    function s(e) {
                        var t = "function" == typeof Map ? new Map : void 0;
                        return s = function(e) {
                            if (null === e || (n = e, -1 === Function.toString.call(n).indexOf("[native code]"))) return e;
                            var n;
                            if ("function" != typeof e) throw new TypeError("Super expression must either be null or a function");
                            if (void 0 !== t) {
                                if (t.has(e)) return t.get(e);
                                t.set(e, i);
                            }
                            function i() {
                                return c(e, arguments, p(this).constructor);
                            }
                            return i.prototype = Object.create(e.prototype, {
                                constructor: {
                                    value: i,
                                    enumerable: !1,
                                    writable: !0,
                                    configurable: !0
                                }
                            }), f(i, e);
                        }, s(e);
                    }
                    function c(e, t, n) {
                        return c = u() ? Reflect.construct.bind() : function(e, t, n) {
                            var i = [ null ];
                            i.push.apply(i, t);
                            var a = new (Function.bind.apply(e, i));
                            return n && f(a, n.prototype), a;
                        }, c.apply(null, arguments);
                    }
                    function u() {
                        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                        if (Reflect.construct.sham) return !1;
                        if ("function" == typeof Proxy) return !0;
                        try {
                            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function() {}))), 
                            !0;
                        } catch (e) {
                            return !1;
                        }
                    }
                    function f(e, t) {
                        return f = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(e, t) {
                            return e.__proto__ = t, e;
                        }, f(e, t);
                    }
                    function p(e) {
                        return p = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(e) {
                            return e.__proto__ || Object.getPrototypeOf(e);
                        }, p(e);
                    }
                    function d(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    var h = a.default.document;
                    if (h && h.head && h.head.attachShadow && a.default.customElements && void 0 === a.default.customElements.get("input-mask")) {
                        var v = function(e) {
                            !function(e, t) {
                                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                                e.prototype = Object.create(t && t.prototype, {
                                    constructor: {
                                        value: e,
                                        writable: !0,
                                        configurable: !0
                                    }
                                }), Object.defineProperty(e, "prototype", {
                                    writable: !1
                                }), t && f(e, t);
                            }(s, e);
                            var t, n, i, a = l(s);
                            function s() {
                                var e;
                                !function(e, t) {
                                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
                                }(this, s);
                                var t = (e = a.call(this)).getAttributeNames(), n = e.attachShadow({
                                    mode: "closed"
                                }), i = h.createElement("input");
                                for (var o in i.type = "text", n.appendChild(i), t) Object.prototype.hasOwnProperty.call(t, o) && i.setAttribute(t[o], e.getAttribute(t[o]));
                                var l = new r.default;
                                return l.dataAttribute = "", l.mask(i), i.inputmask.shadowRoot = n, e;
                            }
                            return t = s, n && o(t.prototype, n), i && o(t, i), Object.defineProperty(t, "prototype", {
                                writable: !1
                            }), t;
                        }(s(HTMLElement));
                        a.default.customElements.define("input-mask", v);
                    }
                },
                2839: function(e, t) {
                    function n(e) {
                        return n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, n(e);
                    }
                    function i(e, t) {
                        return function(e) {
                            if (Array.isArray(e)) return e;
                        }(e) || function(e, t) {
                            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                            if (null != n) {
                                var i, a, r, o, l = [], s = !0, c = !1;
                                try {
                                    if (r = (n = n.call(e)).next, 0 === t) {
                                        if (Object(n) !== n) return;
                                        s = !1;
                                    } else for (;!(s = (i = r.call(n)).done) && (l.push(i.value), l.length !== t); s = !0) ;
                                } catch (e) {
                                    c = !0, a = e;
                                } finally {
                                    try {
                                        if (!s && null != n.return && (o = n.return(), Object(o) !== o)) return;
                                    } finally {
                                        if (c) throw a;
                                    }
                                }
                                return l;
                            }
                        }(e, t) || function(e, t) {
                            if (!e) return;
                            if ("string" == typeof e) return a(e, t);
                            var n = Object.prototype.toString.call(e).slice(8, -1);
                            "Object" === n && e.constructor && (n = e.constructor.name);
                            if ("Map" === n || "Set" === n) return Array.from(e);
                            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return a(e, t);
                        }(e, t) || function() {
                            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                        }();
                    }
                    function a(e, t) {
                        (null == t || t > e.length) && (t = e.length);
                        for (var n = 0, i = new Array(t); n < t; n++) i[n] = e[n];
                        return i;
                    }
                    function r(e, t) {
                        var n = Object.keys(e);
                        if (Object.getOwnPropertySymbols) {
                            var i = Object.getOwnPropertySymbols(e);
                            t && (i = i.filter((function(t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            }))), n.push.apply(n, i);
                        }
                        return n;
                    }
                    function o(e, t, i) {
                        return (t = function(e) {
                            var t = function(e, t) {
                                if ("object" !== n(e) || null === e) return e;
                                var i = e[Symbol.toPrimitive];
                                if (void 0 !== i) {
                                    var a = i.call(e, t || "default");
                                    if ("object" !== n(a)) return a;
                                    throw new TypeError("@@toPrimitive must return a primitive value.");
                                }
                                return ("string" === t ? String : Number)(e);
                            }(e, "string");
                            return "symbol" === n(t) ? t : String(t);
                        }(t)) in e ? Object.defineProperty(e, t, {
                            value: i,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0
                        }) : e[t] = i, e;
                    }
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.keys = t.keyCode = t.ignorables = void 0, t.toKey = function(e, t) {
                        return c[e] || (t ? String.fromCharCode(e) : String.fromCharCode(e).toLowerCase());
                    }, t.toKeyCode = function(e) {
                        return s[e];
                    };
                    var l = {
                        Alt: 18,
                        AltGraph: 18,
                        ArrowDown: 40,
                        ArrowLeft: 37,
                        ArrowRight: 39,
                        ArrowUp: 38,
                        Backspace: 8,
                        CapsLock: 20,
                        Control: 17,
                        ContextMenu: 93,
                        Dead: 221,
                        Delete: 46,
                        End: 35,
                        Escape: 27,
                        F1: 112,
                        F2: 113,
                        F3: 114,
                        F4: 115,
                        F5: 116,
                        F6: 117,
                        F7: 118,
                        F8: 119,
                        F9: 120,
                        F10: 121,
                        F11: 122,
                        F12: 123,
                        Home: 36,
                        Insert: 45,
                        NumLock: 144,
                        PageDown: 34,
                        PageUp: 33,
                        Pause: 19,
                        PrintScreen: 44,
                        Process: 229,
                        Shift: 16,
                        ScrollLock: 145,
                        Tab: 9,
                        Unidentified: 229
                    };
                    t.ignorables = l;
                    var s = function(e) {
                        for (var t = 1; t < arguments.length; t++) {
                            var n = null != arguments[t] ? arguments[t] : {};
                            t % 2 ? r(Object(n), !0).forEach((function(t) {
                                o(e, t, n[t]);
                            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : r(Object(n)).forEach((function(t) {
                                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                            }));
                        }
                        return e;
                    }({
                        c: 67,
                        x: 88,
                        z: 90,
                        BACKSPACE_SAFARI: 127,
                        Enter: 13,
                        Meta_LEFT: 91,
                        Meta_RIGHT: 92,
                        Space: 32
                    }, l);
                    t.keyCode = s;
                    var c = Object.entries(s).reduce((function(e, t) {
                        var n = i(t, 2), a = n[0], r = n[1];
                        return e[r] = void 0 === e[r] ? a : e[r], e;
                    }), {}), u = Object.entries(s).reduce((function(e, t) {
                        var n = i(t, 2), a = n[0];
                        n[1];
                        return e[a] = "Space" === a ? " " : a, e;
                    }), {});
                    t.keys = u;
                },
                2391: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.analyseMask = function(e, t, n) {
                        var i, o, l, s, c, u, f = /(?:[?*+]|\{[0-9+*]+(?:,[0-9+*]*)?(?:\|[0-9+*]*)?\})|[^.?*+^${[]()|\\]+|./g, p = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, d = !1, h = new a.default, v = [], m = [], g = !1;
                        function y(e, i, a) {
                            a = void 0 !== a ? a : e.matches.length;
                            var o = e.matches[a - 1];
                            if (t) {
                                if (0 === i.indexOf("[") || d && /\\d|\\s|\\w|\\p/i.test(i) || "." === i) {
                                    var l = n.casing ? "i" : "";
                                    /^\\p\{.*}$/i.test(i) && (l += "u"), e.matches.splice(a++, 0, {
                                        fn: new RegExp(i, l),
                                        static: !1,
                                        optionality: !1,
                                        newBlockMarker: void 0 === o ? "master" : o.def !== i,
                                        casing: null,
                                        def: i,
                                        placeholder: void 0,
                                        nativeDef: i
                                    });
                                } else d && (i = i[i.length - 1]), i.split("").forEach((function(t, i) {
                                    o = e.matches[a - 1], e.matches.splice(a++, 0, {
                                        fn: /[a-z]/i.test(n.staticDefinitionSymbol || t) ? new RegExp("[" + (n.staticDefinitionSymbol || t) + "]", n.casing ? "i" : "") : null,
                                        static: !0,
                                        optionality: !1,
                                        newBlockMarker: void 0 === o ? "master" : o.def !== t && !0 !== o.static,
                                        casing: null,
                                        def: n.staticDefinitionSymbol || t,
                                        placeholder: void 0 !== n.staticDefinitionSymbol ? t : void 0,
                                        nativeDef: (d ? "'" : "") + t
                                    });
                                }));
                                d = !1;
                            } else {
                                var s = n.definitions && n.definitions[i] || n.usePrototypeDefinitions && r.default.prototype.definitions[i];
                                s && !d ? e.matches.splice(a++, 0, {
                                    fn: s.validator ? "string" == typeof s.validator ? new RegExp(s.validator, n.casing ? "i" : "") : new function() {
                                        this.test = s.validator;
                                    } : new RegExp("."),
                                    static: s.static || !1,
                                    optionality: s.optional || !1,
                                    defOptionality: s.optional || !1,
                                    newBlockMarker: void 0 === o || s.optional ? "master" : o.def !== (s.definitionSymbol || i),
                                    casing: s.casing,
                                    def: s.definitionSymbol || i,
                                    placeholder: s.placeholder,
                                    nativeDef: i,
                                    generated: s.generated
                                }) : (e.matches.splice(a++, 0, {
                                    fn: /[a-z]/i.test(n.staticDefinitionSymbol || i) ? new RegExp("[" + (n.staticDefinitionSymbol || i) + "]", n.casing ? "i" : "") : null,
                                    static: !0,
                                    optionality: !1,
                                    newBlockMarker: void 0 === o ? "master" : o.def !== i && !0 !== o.static,
                                    casing: null,
                                    def: n.staticDefinitionSymbol || i,
                                    placeholder: void 0 !== n.staticDefinitionSymbol ? i : void 0,
                                    nativeDef: (d ? "'" : "") + i
                                }), d = !1);
                            }
                        }
                        function k() {
                            if (v.length > 0) {
                                if (y(s = v[v.length - 1], o), s.isAlternator) {
                                    c = v.pop();
                                    for (var e = 0; e < c.matches.length; e++) c.matches[e].isGroup && (c.matches[e].isGroup = !1);
                                    v.length > 0 ? (s = v[v.length - 1]).matches.push(c) : h.matches.push(c);
                                }
                            } else y(h, o);
                        }
                        function b(e) {
                            var t = new a.default(!0);
                            return t.openGroup = !1, t.matches = e, t;
                        }
                        function x() {
                            if ((l = v.pop()).openGroup = !1, void 0 !== l) if (v.length > 0) {
                                if ((s = v[v.length - 1]).matches.push(l), s.isAlternator) {
                                    for (var e = (c = v.pop()).matches[0].matches ? c.matches[0].matches.length : 1, t = 0; t < c.matches.length; t++) c.matches[t].isGroup = !1, 
                                    c.matches[t].alternatorGroup = !1, null === n.keepStatic && e < (c.matches[t].matches ? c.matches[t].matches.length : 1) && (n.keepStatic = !0), 
                                    e = c.matches[t].matches ? c.matches[t].matches.length : 1;
                                    v.length > 0 ? (s = v[v.length - 1]).matches.push(c) : h.matches.push(c);
                                }
                            } else h.matches.push(l); else k();
                        }
                        function P(e) {
                            var t = e.pop();
                            return t.isQuantifier && (t = b([ e.pop(), t ])), t;
                        }
                        t && (n.optionalmarker[0] = void 0, n.optionalmarker[1] = void 0);
                        for (;i = t ? p.exec(e) : f.exec(e); ) {
                            if (o = i[0], t) {
                                switch (o.charAt(0)) {
                                  case "?":
                                    o = "{0,1}";
                                    break;

                                  case "+":
                                  case "*":
                                    o = "{" + o + "}";
                                    break;

                                  case "|":
                                    if (0 === v.length) {
                                        var w = b(h.matches);
                                        w.openGroup = !0, v.push(w), h.matches = [], g = !0;
                                    }
                                }
                                switch (o) {
                                  case "\\d":
                                    o = "[0-9]";
                                    break;

                                  case "\\p":
                                    o += p.exec(e)[0], o += p.exec(e)[0];
                                }
                            }
                            if (d) k(); else switch (o.charAt(0)) {
                              case "$":
                              case "^":
                                t || k();
                                break;

                              case n.escapeChar:
                                d = !0, t && k();
                                break;

                              case n.optionalmarker[1]:
                              case n.groupmarker[1]:
                                x();
                                break;

                              case n.optionalmarker[0]:
                                v.push(new a.default(!1, !0));
                                break;

                              case n.groupmarker[0]:
                                v.push(new a.default(!0));
                                break;

                              case n.quantifiermarker[0]:
                                var S = new a.default(!1, !1, !0), O = (o = o.replace(/[{}?]/g, "")).split("|"), _ = O[0].split(","), E = isNaN(_[0]) ? _[0] : parseInt(_[0]), M = 1 === _.length ? E : isNaN(_[1]) ? _[1] : parseInt(_[1]), j = isNaN(O[1]) ? O[1] : parseInt(O[1]);
                                "*" !== E && "+" !== E || (E = "*" === M ? 0 : 1), S.quantifier = {
                                    min: E,
                                    max: M,
                                    jit: j
                                };
                                var T = v.length > 0 ? v[v.length - 1].matches : h.matches;
                                (i = T.pop()).isGroup || (i = b([ i ])), T.push(i), T.push(S);
                                break;

                              case n.alternatormarker:
                                if (v.length > 0) {
                                    var A = (s = v[v.length - 1]).matches[s.matches.length - 1];
                                    u = s.openGroup && (void 0 === A.matches || !1 === A.isGroup && !1 === A.isAlternator) ? v.pop() : P(s.matches);
                                } else u = P(h.matches);
                                if (u.isAlternator) v.push(u); else if (u.alternatorGroup ? (c = v.pop(), u.alternatorGroup = !1) : c = new a.default(!1, !1, !1, !0), 
                                c.matches.push(u), v.push(c), u.openGroup) {
                                    u.openGroup = !1;
                                    var D = new a.default(!0);
                                    D.alternatorGroup = !0, v.push(D);
                                }
                                break;

                              default:
                                k();
                            }
                        }
                        g && x();
                        for (;v.length > 0; ) l = v.pop(), h.matches.push(l);
                        h.matches.length > 0 && (!function e(i) {
                            i && i.matches && i.matches.forEach((function(a, r) {
                                var o = i.matches[r + 1];
                                (void 0 === o || void 0 === o.matches || !1 === o.isQuantifier) && a && a.isGroup && (a.isGroup = !1, 
                                t || (y(a, n.groupmarker[0], 0), !0 !== a.openGroup && y(a, n.groupmarker[1]))), 
                                e(a);
                            }));
                        }(h), m.push(h));
                        (n.numericInput || n.isRTL) && function e(t) {
                            for (var i in t.matches = t.matches.reverse(), t.matches) if (Object.prototype.hasOwnProperty.call(t.matches, i)) {
                                var a = parseInt(i);
                                if (t.matches[i].isQuantifier && t.matches[a + 1] && t.matches[a + 1].isGroup) {
                                    var r = t.matches[i];
                                    t.matches.splice(i, 1), t.matches.splice(a + 1, 0, r);
                                }
                                void 0 !== t.matches[i].matches ? t.matches[i] = e(t.matches[i]) : t.matches[i] = ((o = t.matches[i]) === n.optionalmarker[0] ? o = n.optionalmarker[1] : o === n.optionalmarker[1] ? o = n.optionalmarker[0] : o === n.groupmarker[0] ? o = n.groupmarker[1] : o === n.groupmarker[1] && (o = n.groupmarker[0]), 
                                o);
                            }
                            var o;
                            return t;
                        }(m[0]);
                        return m;
                    }, t.generateMaskSet = function(e, t) {
                        var n;
                        function a(e, t) {
                            var n = t.repeat, i = t.groupmarker, a = t.quantifiermarker, r = t.keepStatic;
                            if (n > 0 || "*" === n || "+" === n) {
                                var s = "*" === n ? 0 : "+" === n ? 1 : n;
                                e = i[0] + e + i[1] + a[0] + s + "," + n + a[1];
                            }
                            if (!0 === r) {
                                var c = e.match(new RegExp("(.)\\[([^\\]]*)\\]", "g"));
                                c && c.forEach((function(t, n) {
                                    var i = function(e, t) {
                                        return function(e) {
                                            if (Array.isArray(e)) return e;
                                        }(e) || function(e, t) {
                                            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                                            if (null != n) {
                                                var i, a, r, o, l = [], s = !0, c = !1;
                                                try {
                                                    if (r = (n = n.call(e)).next, 0 === t) {
                                                        if (Object(n) !== n) return;
                                                        s = !1;
                                                    } else for (;!(s = (i = r.call(n)).done) && (l.push(i.value), l.length !== t); s = !0) ;
                                                } catch (e) {
                                                    c = !0, a = e;
                                                } finally {
                                                    try {
                                                        if (!s && null != n.return && (o = n.return(), Object(o) !== o)) return;
                                                    } finally {
                                                        if (c) throw a;
                                                    }
                                                }
                                                return l;
                                            }
                                        }(e, t) || function(e, t) {
                                            if (!e) return;
                                            if ("string" == typeof e) return l(e, t);
                                            var n = Object.prototype.toString.call(e).slice(8, -1);
                                            "Object" === n && e.constructor && (n = e.constructor.name);
                                            if ("Map" === n || "Set" === n) return Array.from(e);
                                            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return l(e, t);
                                        }(e, t) || function() {
                                            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
                                        }();
                                    }(t.split("["), 2), a = i[0], r = i[1];
                                    r = r.replace("]", ""), e = e.replace(new RegExp("".concat((0, o.default)(a), "\\[").concat((0, 
                                    o.default)(r), "\\]")), a.charAt(0) === r.charAt(0) ? "(".concat(a, "|").concat(a).concat(r, ")") : "".concat(a, "[").concat(r, "]"));
                                }));
                            }
                            return e;
                        }
                        function s(e, n, o) {
                            var l, s, c = !1;
                            return null !== e && "" !== e || ((c = null !== o.regex) ? e = (e = o.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (c = !0, 
                            e = ".*")), 1 === e.length && !1 === o.greedy && 0 !== o.repeat && (o.placeholder = ""), 
                            e = a(e, o), s = c ? "regex_" + o.regex : o.numericInput ? e.split("").reverse().join("") : e, 
                            null !== o.keepStatic && (s = "ks_" + o.keepStatic + s), void 0 === r.default.prototype.masksCache[s] || !0 === t ? (l = {
                                mask: e,
                                maskToken: r.default.prototype.analyseMask(e, c, o),
                                validPositions: [],
                                _buffer: void 0,
                                buffer: void 0,
                                tests: {},
                                excludes: {},
                                metadata: n,
                                maskLength: void 0,
                                jitOffset: {}
                            }, !0 !== t && (r.default.prototype.masksCache[s] = l, l = i.default.extend(!0, {}, r.default.prototype.masksCache[s]))) : l = i.default.extend(!0, {}, r.default.prototype.masksCache[s]), 
                            l;
                        }
                        "function" == typeof e.mask && (e.mask = e.mask(e));
                        if (Array.isArray(e.mask)) {
                            if (e.mask.length > 1) {
                                null === e.keepStatic && (e.keepStatic = !0);
                                var c = e.groupmarker[0];
                                return (e.isRTL ? e.mask.reverse() : e.mask).forEach((function(t) {
                                    c.length > 1 && (c += e.alternatormarker), void 0 !== t.mask && "function" != typeof t.mask ? c += t.mask : c += t;
                                })), s(c += e.groupmarker[1], e.mask, e);
                            }
                            e.mask = e.mask.pop();
                        }
                        n = e.mask && void 0 !== e.mask.mask && "function" != typeof e.mask.mask ? s(e.mask.mask, e.mask, e) : s(e.mask, e.mask, e);
                        null === e.keepStatic && (e.keepStatic = !1);
                        return n;
                    };
                    var i = s(n(4963)), a = s(n(9695)), r = s(n(2394)), o = s(n(7184));
                    function l(e, t) {
                        (null == t || t > e.length) && (t = e.length);
                        for (var n = 0, i = new Array(t); n < t; n++) i[n] = e[n];
                        return i;
                    }
                    function s(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                },
                157: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.mask = function() {
                        var e = this, t = this.opts, n = this.el, u = this.dependencyLib;
                        o.EventRuler.off(n);
                        var f = function(t, n) {
                            "textarea" !== t.tagName.toLowerCase() && n.ignorables.push(i.keys.Enter);
                            var l = t.getAttribute("type"), s = "input" === t.tagName.toLowerCase() && n.supportsInputType.includes(l) || t.isContentEditable || "textarea" === t.tagName.toLowerCase();
                            if (!s) if ("input" === t.tagName.toLowerCase()) {
                                var c = document.createElement("input");
                                c.setAttribute("type", l), s = "text" === c.type, c = null;
                            } else s = "partial";
                            return !1 !== s ? function(t) {
                                var i, l;
                                function s() {
                                    return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== a.getLastValidPosition.call(e) || !0 !== n.nullable ? (this.inputmask.shadowRoot || this.ownerDocument).activeElement === this && n.clearMaskOnLostFocus ? (e.isRTL ? r.clearOptionalTail.call(e, a.getBuffer.call(e).slice()).reverse() : r.clearOptionalTail.call(e, a.getBuffer.call(e).slice())).join("") : i.call(this) : "" : i.call(this);
                                }
                                function c(e) {
                                    l.call(this, e), this.inputmask && (0, r.applyInputValue)(this, e);
                                }
                                if (!t.inputmask.__valueGet) {
                                    if (!0 !== n.noValuePatching) {
                                        if (Object.getOwnPropertyDescriptor) {
                                            var f = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t), "value") : void 0;
                                            f && f.get && f.set ? (i = f.get, l = f.set, Object.defineProperty(t, "value", {
                                                get: s,
                                                set: c,
                                                configurable: !0
                                            })) : "input" !== t.tagName.toLowerCase() && (i = function() {
                                                return this.textContent;
                                            }, l = function(e) {
                                                this.textContent = e;
                                            }, Object.defineProperty(t, "value", {
                                                get: s,
                                                set: c,
                                                configurable: !0
                                            }));
                                        } else document.__lookupGetter__ && t.__lookupGetter__("value") && (i = t.__lookupGetter__("value"), 
                                        l = t.__lookupSetter__("value"), t.__defineGetter__("value", s), t.__defineSetter__("value", c));
                                        t.inputmask.__valueGet = i, t.inputmask.__valueSet = l;
                                    }
                                    t.inputmask._valueGet = function(t) {
                                        return e.isRTL && !0 !== t ? i.call(this.el).split("").reverse().join("") : i.call(this.el);
                                    }, t.inputmask._valueSet = function(t, n) {
                                        l.call(this.el, null == t ? "" : !0 !== n && e.isRTL ? t.split("").reverse().join("") : t);
                                    }, void 0 === i && (i = function() {
                                        return this.value;
                                    }, l = function(e) {
                                        this.value = e;
                                    }, function(t) {
                                        if (u.valHooks && (void 0 === u.valHooks[t] || !0 !== u.valHooks[t].inputmaskpatch)) {
                                            var i = u.valHooks[t] && u.valHooks[t].get ? u.valHooks[t].get : function(e) {
                                                return e.value;
                                            }, o = u.valHooks[t] && u.valHooks[t].set ? u.valHooks[t].set : function(e, t) {
                                                return e.value = t, e;
                                            };
                                            u.valHooks[t] = {
                                                get: function(t) {
                                                    if (t.inputmask) {
                                                        if (t.inputmask.opts.autoUnmask) return t.inputmask.unmaskedvalue();
                                                        var r = i(t);
                                                        return -1 !== a.getLastValidPosition.call(e, void 0, void 0, t.inputmask.maskset.validPositions) || !0 !== n.nullable ? r : "";
                                                    }
                                                    return i(t);
                                                },
                                                set: function(e, t) {
                                                    var n = o(e, t);
                                                    return e.inputmask && (0, r.applyInputValue)(e, t), n;
                                                },
                                                inputmaskpatch: !0
                                            };
                                        }
                                    }(t.type), function(e) {
                                        o.EventRuler.on(e, "mouseenter", (function() {
                                            var e = this, t = e.inputmask._valueGet(!0);
                                            t != (e.inputmask.isRTL ? a.getBuffer.call(e.inputmask).slice().reverse() : a.getBuffer.call(e.inputmask)).join("") && (0, 
                                            r.applyInputValue)(e, t);
                                        }));
                                    }(t));
                                }
                            }(t) : t.inputmask = void 0, s;
                        }(n, t);
                        if (!1 !== f) {
                            e.originalPlaceholder = n.placeholder, e.maxLength = void 0 !== n ? n.maxLength : void 0, 
                            -1 === e.maxLength && (e.maxLength = void 0), "inputMode" in n && null === n.getAttribute("inputmode") && (n.inputMode = t.inputmode, 
                            n.setAttribute("inputmode", t.inputmode)), !0 === f && (t.showMaskOnFocus = t.showMaskOnFocus && -1 === [ "cc-number", "cc-exp" ].indexOf(n.autocomplete), 
                            l.iphone && (t.insertModeVisual = !1, n.setAttribute("autocorrect", "off")), o.EventRuler.on(n, "submit", c.EventHandlers.submitEvent), 
                            o.EventRuler.on(n, "reset", c.EventHandlers.resetEvent), o.EventRuler.on(n, "blur", c.EventHandlers.blurEvent), 
                            o.EventRuler.on(n, "focus", c.EventHandlers.focusEvent), o.EventRuler.on(n, "invalid", c.EventHandlers.invalidEvent), 
                            o.EventRuler.on(n, "click", c.EventHandlers.clickEvent), o.EventRuler.on(n, "mouseleave", c.EventHandlers.mouseleaveEvent), 
                            o.EventRuler.on(n, "mouseenter", c.EventHandlers.mouseenterEvent), o.EventRuler.on(n, "paste", c.EventHandlers.pasteEvent), 
                            o.EventRuler.on(n, "cut", c.EventHandlers.cutEvent), o.EventRuler.on(n, "complete", t.oncomplete), 
                            o.EventRuler.on(n, "incomplete", t.onincomplete), o.EventRuler.on(n, "cleared", t.oncleared), 
                            !0 !== t.inputEventOnly && o.EventRuler.on(n, "keydown", c.EventHandlers.keyEvent), 
                            (l.mobile || t.inputEventOnly) && n.removeAttribute("maxLength"), o.EventRuler.on(n, "input", c.EventHandlers.inputFallBackEvent)), 
                            o.EventRuler.on(n, "setvalue", c.EventHandlers.setValueEvent), a.getBufferTemplate.call(e).join(""), 
                            e.undoValue = e._valueGet(!0);
                            var p = (n.inputmask.shadowRoot || n.ownerDocument).activeElement;
                            if ("" !== n.inputmask._valueGet(!0) || !1 === t.clearMaskOnLostFocus || p === n) {
                                (0, r.applyInputValue)(n, n.inputmask._valueGet(!0), t);
                                var d = a.getBuffer.call(e).slice();
                                !1 === s.isComplete.call(e, d) && t.clearIncomplete && a.resetMaskSet.call(e, !1), 
                                t.clearMaskOnLostFocus && p !== n && (-1 === a.getLastValidPosition.call(e) ? d = [] : r.clearOptionalTail.call(e, d)), 
                                (!1 === t.clearMaskOnLostFocus || t.showMaskOnFocus && p === n || "" !== n.inputmask._valueGet(!0)) && (0, 
                                r.writeBuffer)(n, d), p === n && a.caret.call(e, n, a.seekNext.call(e, a.getLastValidPosition.call(e)));
                            }
                        }
                    };
                    var i = n(2839), a = n(8711), r = n(7760), o = n(9716), l = n(9845), s = n(7215), c = n(6030);
                },
                9695: function(e, t) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.default = function(e, t, n, i) {
                        this.matches = [], this.openGroup = e || !1, this.alternatorGroup = !1, this.isGroup = e || !1, 
                        this.isOptional = t || !1, this.isQuantifier = n || !1, this.isAlternator = i || !1, 
                        this.quantifier = {
                            min: 1,
                            max: 1
                        };
                    };
                },
                3194: function() {
                    Array.prototype.includes || Object.defineProperty(Array.prototype, "includes", {
                        value: function(e, t) {
                            if (null == this) throw new TypeError('"this" is null or not defined');
                            var n = Object(this), i = n.length >>> 0;
                            if (0 === i) return !1;
                            for (var a = 0 | t, r = Math.max(a >= 0 ? a : i - Math.abs(a), 0); r < i; ) {
                                if (n[r] === e) return !0;
                                r++;
                            }
                            return !1;
                        }
                    });
                },
                9302: function() {
                    var e = Function.bind.call(Function.call, Array.prototype.reduce), t = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable), n = Function.bind.call(Function.call, Array.prototype.concat), i = Object.keys;
                    Object.entries || (Object.entries = function(a) {
                        return e(i(a), (function(e, i) {
                            return n(e, "string" == typeof i && t(a, i) ? [ [ i, a[i] ] ] : []);
                        }), []);
                    });
                },
                7149: function() {
                    function e(t) {
                        return e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                            return typeof e;
                        } : function(e) {
                            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                        }, e(t);
                    }
                    "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" === e("test".__proto__) ? function(e) {
                        return e.__proto__;
                    } : function(e) {
                        return e.constructor.prototype;
                    });
                },
                4013: function() {
                    String.prototype.includes || (String.prototype.includes = function(e, t) {
                        return "number" != typeof t && (t = 0), !(t + e.length > this.length) && -1 !== this.indexOf(e, t);
                    });
                },
                8711: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.caret = function(e, t, n, i, r) {
                        var o, l = this, s = this.opts;
                        if (void 0 === t) return "selectionStart" in e && "selectionEnd" in e ? (t = e.selectionStart, 
                        n = e.selectionEnd) : a.default.getSelection ? (o = a.default.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== e && o.commonAncestorContainer !== e || (t = o.startOffset, 
                        n = o.endOffset) : document.selection && document.selection.createRange && (n = (t = 0 - (o = document.selection.createRange()).duplicate().moveStart("character", -e.inputmask._valueGet().length)) + o.text.length), 
                        {
                            begin: i ? t : f.call(l, t),
                            end: i ? n : f.call(l, n)
                        };
                        if (Array.isArray(t) && (n = l.isRTL ? t[0] : t[1], t = l.isRTL ? t[1] : t[0]), 
                        void 0 !== t.begin && (n = l.isRTL ? t.begin : t.end, t = l.isRTL ? t.end : t.begin), 
                        "number" == typeof t) {
                            t = i ? t : f.call(l, t), n = "number" == typeof (n = i ? n : f.call(l, n)) ? n : t;
                            var c = parseInt(((e.ownerDocument.defaultView || a.default).getComputedStyle ? (e.ownerDocument.defaultView || a.default).getComputedStyle(e, null) : e.currentStyle).fontSize) * n;
                            if (e.scrollLeft = c > e.scrollWidth ? c : 0, e.inputmask.caretPos = {
                                begin: t,
                                end: n
                            }, s.insertModeVisual && !1 === s.insertMode && t === n && (r || n++), e === (e.inputmask.shadowRoot || e.ownerDocument).activeElement) if ("setSelectionRange" in e) e.setSelectionRange(t, n); else if (a.default.getSelection) {
                                if (o = document.createRange(), void 0 === e.firstChild || null === e.firstChild) {
                                    var u = document.createTextNode("");
                                    e.appendChild(u);
                                }
                                o.setStart(e.firstChild, t < e.inputmask._valueGet().length ? t : e.inputmask._valueGet().length), 
                                o.setEnd(e.firstChild, n < e.inputmask._valueGet().length ? n : e.inputmask._valueGet().length), 
                                o.collapse(!0);
                                var p = a.default.getSelection();
                                p.removeAllRanges(), p.addRange(o);
                            } else e.createTextRange && ((o = e.createTextRange()).collapse(!0), o.moveEnd("character", n), 
                            o.moveStart("character", t), o.select());
                        }
                    }, t.determineLastRequiredPosition = function(e) {
                        var t, n, i = this, a = i.maskset, l = i.dependencyLib, c = r.getMaskTemplate.call(i, !0, s.call(i), !0, !0), u = c.length, f = s.call(i), p = {}, d = a.validPositions[f], h = void 0 !== d ? d.locator.slice() : void 0;
                        for (t = f + 1; t < c.length; t++) h = (n = r.getTestTemplate.call(i, t, h, t - 1)).locator.slice(), 
                        p[t] = l.extend(!0, {}, n);
                        var v = d && void 0 !== d.alternation ? d.locator[d.alternation] : void 0;
                        for (t = u - 1; t > f && ((n = p[t]).match.optionality || n.match.optionalQuantifier && n.match.newBlockMarker || v && (v !== p[t].locator[d.alternation] && 1 != n.match.static || !0 === n.match.static && n.locator[d.alternation] && o.checkAlternationMatch.call(i, n.locator[d.alternation].toString().split(","), v.toString().split(",")) && "" !== r.getTests.call(i, t)[0].def)) && c[t] === r.getPlaceholder.call(i, t, n.match); t--) u--;
                        return e ? {
                            l: u,
                            def: p[u] ? p[u].match : void 0
                        } : u;
                    }, t.determineNewCaretPosition = function(e, t, n) {
                        var i = this, a = i.maskset, o = i.opts;
                        t && (i.isRTL ? e.end = e.begin : e.begin = e.end);
                        if (e.begin === e.end) {
                            switch (n = n || o.positionCaretOnClick) {
                              case "none":
                                break;

                              case "select":
                                e = {
                                    begin: 0,
                                    end: l.call(i).length
                                };
                                break;

                              case "ignore":
                                e.end = e.begin = u.call(i, s.call(i));
                                break;

                              case "radixFocus":
                                if (i.clicked > 1 && 0 == a.validPositions.length) break;
                                if (function(e) {
                                    if ("" !== o.radixPoint && 0 !== o.digits) {
                                        var t = a.validPositions;
                                        if (void 0 === t[e] || t[e].input === r.getPlaceholder.call(i, e)) {
                                            if (e < u.call(i, -1)) return !0;
                                            var n = l.call(i).indexOf(o.radixPoint);
                                            if (-1 !== n) {
                                                for (var s = 0, c = t.length; s < c; s++) if (t[s] && n < s && t[s].input !== r.getPlaceholder.call(i, s)) return !1;
                                                return !0;
                                            }
                                        }
                                    }
                                    return !1;
                                }(e.begin)) {
                                    var f = l.call(i).join("").indexOf(o.radixPoint);
                                    e.end = e.begin = o.numericInput ? u.call(i, f) : f;
                                    break;
                                }

                              default:
                                var p = e.begin, d = s.call(i, p, !0), h = u.call(i, -1 !== d || c.call(i, 0) ? d : -1);
                                if (p <= h) e.end = e.begin = c.call(i, p, !1, !0) ? p : u.call(i, p); else {
                                    var v = a.validPositions[d], m = r.getTestTemplate.call(i, h, v ? v.match.locator : void 0, v), g = r.getPlaceholder.call(i, h, m.match);
                                    if ("" !== g && l.call(i)[h] !== g && !0 !== m.match.optionalQuantifier && !0 !== m.match.newBlockMarker || !c.call(i, h, o.keepStatic, !0) && m.match.def === g) {
                                        var y = u.call(i, h);
                                        (p >= y || p === h) && (h = y);
                                    }
                                    e.end = e.begin = h;
                                }
                            }
                            return e;
                        }
                    }, t.getBuffer = l, t.getBufferTemplate = function() {
                        var e = this.maskset;
                        void 0 === e._buffer && (e._buffer = r.getMaskTemplate.call(this, !1, 1), void 0 === e.buffer && (e.buffer = e._buffer.slice()));
                        return e._buffer;
                    }, t.getLastValidPosition = s, t.isMask = c, t.resetMaskSet = function(e) {
                        var t = this.maskset;
                        t.buffer = void 0, !0 !== e && (t.validPositions = [], t.p = 0);
                        !1 === e && (t.tests = {});
                    }, t.seekNext = u, t.seekPrevious = function(e, t) {
                        var n = this, i = e - 1;
                        if (e <= 0) return 0;
                        for (;i > 0 && (!0 === t && (!0 !== r.getTest.call(n, i).match.newBlockMarker || !c.call(n, i, void 0, !0)) || !0 !== t && !c.call(n, i, void 0, !0)); ) i--;
                        return i;
                    }, t.translatePosition = f;
                    var i, a = (i = n(9380)) && i.__esModule ? i : {
                        default: i
                    }, r = n(4713), o = n(7215);
                    function l(e) {
                        var t = this, n = t.maskset;
                        return void 0 !== n.buffer && !0 !== e || (n.buffer = r.getMaskTemplate.call(t, !0, s.call(t), !0), 
                        void 0 === n._buffer && (n._buffer = n.buffer.slice())), n.buffer;
                    }
                    function s(e, t, n) {
                        var i = this.maskset, a = -1, r = -1, o = n || i.validPositions;
                        void 0 === e && (e = -1);
                        for (var l = 0, s = o.length; l < s; l++) o[l] && (t || !0 !== o[l].generatedInput) && (l <= e && (a = l), 
                        l >= e && (r = l));
                        return -1 === a || a == e ? r : -1 == r || e - a < r - e ? a : r;
                    }
                    function c(e, t, n) {
                        var i = this, a = this.maskset, o = r.getTestTemplate.call(i, e).match;
                        if ("" === o.def && (o = r.getTest.call(i, e).match), !0 !== o.static) return o.fn;
                        if (!0 === n && void 0 !== a.validPositions[e] && !0 !== a.validPositions[e].generatedInput) return !0;
                        if (!0 !== t && e > -1) {
                            if (n) {
                                var l = r.getTests.call(i, e);
                                return l.length > 1 + ("" === l[l.length - 1].match.def ? 1 : 0);
                            }
                            var s = r.determineTestTemplate.call(i, e, r.getTests.call(i, e)), c = r.getPlaceholder.call(i, e, s.match);
                            return s.match.def !== c;
                        }
                        return !1;
                    }
                    function u(e, t, n) {
                        var i = this;
                        void 0 === n && (n = !0);
                        for (var a = e + 1; "" !== r.getTest.call(i, a).match.def && (!0 === t && (!0 !== r.getTest.call(i, a).match.newBlockMarker || !c.call(i, a, void 0, !0)) || !0 !== t && !c.call(i, a, void 0, n)); ) a++;
                        return a;
                    }
                    function f(e) {
                        var t = this.opts, n = this.el;
                        return !this.isRTL || "number" != typeof e || t.greedy && "" === t.placeholder || !n || (e = this._valueGet().length - e) < 0 && (e = 0), 
                        e;
                    }
                },
                4713: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.determineTestTemplate = c, t.getDecisionTaker = o, t.getMaskTemplate = function(e, t, n, i, a) {
                        var r = this, o = this.opts, u = this.maskset, f = o.greedy;
                        a && o.greedy && (o.greedy = !1, r.maskset.tests = {});
                        t = t || 0;
                        var d, h, v, m, g = [], y = 0;
                        do {
                            if (!0 === e && u.validPositions[y]) h = (v = a && u.validPositions[y].match.optionality && void 0 === u.validPositions[y + 1] && (!0 === u.validPositions[y].generatedInput || u.validPositions[y].input == o.skipOptionalPartCharacter && y > 0) ? c.call(r, y, p.call(r, y, d, y - 1)) : u.validPositions[y]).match, 
                            d = v.locator.slice(), g.push(!0 === n ? v.input : !1 === n ? h.nativeDef : l.call(r, y, h)); else {
                                h = (v = s.call(r, y, d, y - 1)).match, d = v.locator.slice();
                                var k = !0 !== i && (!1 !== o.jitMasking ? o.jitMasking : h.jit);
                                (m = (m || u.validPositions[y - 1]) && h.static && h.def !== o.groupSeparator && null === h.fn) || !1 === k || void 0 === k || "number" == typeof k && isFinite(k) && k > y ? g.push(!1 === n ? h.nativeDef : l.call(r, g.length, h)) : m = !1;
                            }
                            y++;
                        } while (!0 !== h.static || "" !== h.def || t > y);
                        "" === g[g.length - 1] && g.pop();
                        !1 === n && void 0 !== u.maskLength || (u.maskLength = y - 1);
                        return o.greedy = f, g;
                    }, t.getPlaceholder = l, t.getTest = u, t.getTestTemplate = s, t.getTests = p, t.isSubsetOf = f;
                    var i, a = (i = n(2394)) && i.__esModule ? i : {
                        default: i
                    };
                    function r(e, t) {
                        var n = (null != e.alternation ? e.mloc[o(e)] : e.locator).join("");
                        if ("" !== n) for (;n.length < t; ) n += "0";
                        return n;
                    }
                    function o(e) {
                        var t = e.locator[e.alternation];
                        return "string" == typeof t && t.length > 0 && (t = t.split(",")[0]), void 0 !== t ? t.toString() : "";
                    }
                    function l(e, t, n) {
                        var i = this.opts, a = this.maskset;
                        if (void 0 !== (t = t || u.call(this, e).match).placeholder || !0 === n) return "function" == typeof t.placeholder ? t.placeholder(i) : t.placeholder;
                        if (!0 === t.static) {
                            if (e > -1 && void 0 === a.validPositions[e]) {
                                var r, o = p.call(this, e), l = [];
                                if (o.length > 1 + ("" === o[o.length - 1].match.def ? 1 : 0)) for (var s = 0; s < o.length; s++) if ("" !== o[s].match.def && !0 !== o[s].match.optionality && !0 !== o[s].match.optionalQuantifier && (!0 === o[s].match.static || void 0 === r || !1 !== o[s].match.fn.test(r.match.def, a, e, !0, i)) && (l.push(o[s]), 
                                !0 === o[s].match.static && (r = o[s]), l.length > 1 && /[0-9a-bA-Z]/.test(l[0].match.def))) return i.placeholder.charAt(e % i.placeholder.length);
                            }
                            return t.def;
                        }
                        return i.placeholder.charAt(e % i.placeholder.length);
                    }
                    function s(e, t, n) {
                        return this.maskset.validPositions[e] || c.call(this, e, p.call(this, e, t ? t.slice() : t, n));
                    }
                    function c(e, t) {
                        var n = this.opts, i = 0, a = function(e, t) {
                            var n = 0, i = !1;
                            t.forEach((function(e) {
                                e.match.optionality && (0 !== n && n !== e.match.optionality && (i = !0), (0 === n || n > e.match.optionality) && (n = e.match.optionality));
                            })), n && (0 == e || 1 == t.length ? n = 0 : i || (n = 0));
                            return n;
                        }(e, t);
                        e = e > 0 ? e - 1 : 0;
                        var o, l, s, c = r(u.call(this, e));
                        n.greedy && t.length > 1 && "" === t[t.length - 1].match.def && (i = 1);
                        for (var f = 0; f < t.length - i; f++) {
                            var p = t[f];
                            o = r(p, c.length);
                            var d = Math.abs(o - c);
                            (void 0 === l || "" !== o && d < l || s && !n.greedy && s.match.optionality && s.match.optionality - a > 0 && "master" === s.match.newBlockMarker && (!p.match.optionality || p.match.optionality - a < 1 || !p.match.newBlockMarker) || s && !n.greedy && s.match.optionalQuantifier && !p.match.optionalQuantifier) && (l = d, 
                            s = p);
                        }
                        return s;
                    }
                    function u(e, t) {
                        var n = this.maskset;
                        return n.validPositions[e] ? n.validPositions[e] : (t || p.call(this, e))[0];
                    }
                    function f(e, t, n) {
                        function i(e) {
                            for (var t, n = [], i = -1, a = 0, r = e.length; a < r; a++) if ("-" === e.charAt(a)) for (t = e.charCodeAt(a + 1); ++i < t; ) n.push(String.fromCharCode(i)); else i = e.charCodeAt(a), 
                            n.push(e.charAt(a));
                            return n.join("");
                        }
                        return e.match.def === t.match.nativeDef || !(!(n.regex || e.match.fn instanceof RegExp && t.match.fn instanceof RegExp) || !0 === e.match.static || !0 === t.match.static) && -1 !== i(t.match.fn.toString().replace(/[[\]/]/g, "")).indexOf(i(e.match.fn.toString().replace(/[[\]/]/g, "")));
                    }
                    function p(e, t, n) {
                        var i, r, o = this, l = this.dependencyLib, s = this.maskset, u = this.opts, p = this.el, d = s.maskToken, h = t ? n : 0, v = t ? t.slice() : [ 0 ], m = [], g = !1, y = t ? t.join("") : "";
                        function k(t, n, r, l) {
                            function c(r, l, d) {
                                function v(e, t) {
                                    var n = 0 === t.matches.indexOf(e);
                                    return n || t.matches.every((function(i, a) {
                                        return !0 === i.isQuantifier ? n = v(e, t.matches[a - 1]) : Object.prototype.hasOwnProperty.call(i, "matches") && (n = v(e, i)), 
                                        !n;
                                    })), n;
                                }
                                function x(e, t, n) {
                                    var i, a;
                                    if ((s.tests[e] || s.validPositions[e]) && (s.tests[e] || [ s.validPositions[e] ]).every((function(e, r) {
                                        if (e.mloc[t]) return i = e, !1;
                                        var o = void 0 !== n ? n : e.alternation, l = void 0 !== e.locator[o] ? e.locator[o].toString().indexOf(t) : -1;
                                        return (void 0 === a || l < a) && -1 !== l && (i = e, a = l), !0;
                                    })), i) {
                                        var r = i.locator[i.alternation];
                                        return (i.mloc[t] || i.mloc[r] || i.locator).slice((void 0 !== n ? n : i.alternation) + 1);
                                    }
                                    return void 0 !== n ? x(e, t) : void 0;
                                }
                                function P(e, t) {
                                    var n = e.alternation, i = void 0 === t || n === t.alternation && -1 === e.locator[n].toString().indexOf(t.locator[n]);
                                    if (!i && n > t.alternation) for (var a = t.alternation; a < n; a++) if (e.locator[a] !== t.locator[a]) {
                                        n = a, i = !0;
                                        break;
                                    }
                                    if (i) {
                                        e.mloc = e.mloc || {};
                                        var r = e.locator[n];
                                        if (void 0 !== r) {
                                            if ("string" == typeof r && (r = r.split(",")[0]), void 0 === e.mloc[r] && (e.mloc[r] = e.locator.slice()), 
                                            void 0 !== t) {
                                                for (var o in t.mloc) "string" == typeof o && (o = o.split(",")[0]), void 0 === e.mloc[o] && (e.mloc[o] = t.mloc[o]);
                                                e.locator[n] = Object.keys(e.mloc).join(",");
                                            }
                                            return !0;
                                        }
                                        e.alternation = void 0;
                                    }
                                    return !1;
                                }
                                function w(e, t) {
                                    if (e.locator.length !== t.locator.length) return !1;
                                    for (var n = e.alternation + 1; n < e.locator.length; n++) if (e.locator[n] !== t.locator[n]) return !1;
                                    return !0;
                                }
                                if (h > e + u._maxTestPos) throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + s.mask;
                                if (h === e && void 0 === r.matches) {
                                    if (m.push({
                                        match: r,
                                        locator: l.reverse(),
                                        cd: y,
                                        mloc: {}
                                    }), !r.optionality || void 0 !== d || !(u.definitions && u.definitions[r.nativeDef] && u.definitions[r.nativeDef].optional || a.default.prototype.definitions[r.nativeDef] && a.default.prototype.definitions[r.nativeDef].optional)) return !0;
                                    g = !0, h = e;
                                } else if (void 0 !== r.matches) {
                                    if (r.isGroup && d !== r) return function() {
                                        if (r = c(t.matches[t.matches.indexOf(r) + 1], l, d)) return !0;
                                    }();
                                    if (r.isOptional) return function() {
                                        var t = r, a = m.length;
                                        if (r = k(r, n, l, d), m.length > 0) {
                                            if (m.forEach((function(e, t) {
                                                t >= a && (e.match.optionality = e.match.optionality ? e.match.optionality + 1 : 1);
                                            })), i = m[m.length - 1].match, void 0 !== d || !v(i, t)) return r;
                                            g = !0, h = e;
                                        }
                                    }();
                                    if (r.isAlternator) return function() {
                                        o.hasAlternator = !0;
                                        var i, a, v, y = r, k = [], b = m.slice(), S = l.length, O = !1, _ = n.length > 0 ? n.shift() : -1;
                                        if (-1 === _ || "string" == typeof _) {
                                            var E, M = h, j = n.slice(), T = [];
                                            if ("string" == typeof _) T = _.split(","); else for (E = 0; E < y.matches.length; E++) T.push(E.toString());
                                            if (void 0 !== s.excludes[e]) {
                                                for (var A = T.slice(), D = 0, L = s.excludes[e].length; D < L; D++) {
                                                    var B = s.excludes[e][D].toString().split(":");
                                                    l.length == B[1] && T.splice(T.indexOf(B[0]), 1);
                                                }
                                                0 === T.length && (delete s.excludes[e], T = A);
                                            }
                                            (!0 === u.keepStatic || isFinite(parseInt(u.keepStatic)) && M >= u.keepStatic) && (T = T.slice(0, 1));
                                            for (var C = 0; C < T.length; C++) {
                                                E = parseInt(T[C]), m = [], n = "string" == typeof _ && x(h, E, S) || j.slice();
                                                var R = y.matches[E];
                                                if (R && c(R, [ E ].concat(l), d)) r = !0; else if (0 === C && (O = !0), R && R.matches && R.matches.length > y.matches[0].matches.length) break;
                                                i = m.slice(), h = M, m = [];
                                                for (var I = 0; I < i.length; I++) {
                                                    var F = i[I], N = !1;
                                                    F.match.jit = F.match.jit || O, F.alternation = F.alternation || S, P(F);
                                                    for (var V = 0; V < k.length; V++) {
                                                        var G = k[V];
                                                        if ("string" != typeof _ || void 0 !== F.alternation && T.includes(F.locator[F.alternation].toString())) {
                                                            if (F.match.nativeDef === G.match.nativeDef) {
                                                                N = !0, P(G, F);
                                                                break;
                                                            }
                                                            if (f(F, G, u)) {
                                                                P(F, G) && (N = !0, k.splice(k.indexOf(G), 0, F));
                                                                break;
                                                            }
                                                            if (f(G, F, u)) {
                                                                P(G, F);
                                                                break;
                                                            }
                                                            if (v = G, !0 === (a = F).match.static && !0 !== v.match.static && v.match.fn.test(a.match.def, s, e, !1, u, !1)) {
                                                                w(F, G) || void 0 !== p.inputmask.userOptions.keepStatic ? P(F, G) && (N = !0, k.splice(k.indexOf(G), 0, F)) : u.keepStatic = !0;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    N || k.push(F);
                                                }
                                            }
                                            m = b.concat(k), h = e, g = m.length > 0, r = k.length > 0, n = j.slice();
                                        } else r = c(y.matches[_] || t.matches[_], [ _ ].concat(l), d);
                                        if (r) return !0;
                                    }();
                                    if (r.isQuantifier && d !== t.matches[t.matches.indexOf(r) - 1]) return function() {
                                        for (var a = r, o = !1, f = n.length > 0 ? n.shift() : 0; f < (isNaN(a.quantifier.max) ? f + 1 : a.quantifier.max) && h <= e; f++) {
                                            var p = t.matches[t.matches.indexOf(a) - 1];
                                            if (r = c(p, [ f ].concat(l), p)) {
                                                if (m.forEach((function(t, n) {
                                                    (i = b(p, t.match) ? t.match : m[m.length - 1].match).optionalQuantifier = f >= a.quantifier.min, 
                                                    i.jit = (f + 1) * (p.matches.indexOf(i) + 1) > a.quantifier.jit, i.optionalQuantifier && v(i, p) && (g = !0, 
                                                    h = e, u.greedy && null == s.validPositions[e - 1] && f > a.quantifier.min && -1 != [ "*", "+" ].indexOf(a.quantifier.max) && (m.pop(), 
                                                    y = void 0), o = !0, r = !1), !o && i.jit && (s.jitOffset[e] = p.matches.length - p.matches.indexOf(i));
                                                })), o) break;
                                                return !0;
                                            }
                                        }
                                    }();
                                    if (r = k(r, n, l, d)) return !0;
                                } else h++;
                            }
                            for (var d = n.length > 0 ? n.shift() : 0; d < t.matches.length; d++) if (!0 !== t.matches[d].isQuantifier) {
                                var v = c(t.matches[d], [ d ].concat(r), l);
                                if (v && h === e) return v;
                                if (h > e) break;
                            }
                        }
                        function b(e, t) {
                            var n = -1 != e.matches.indexOf(t);
                            return n || e.matches.forEach((function(e, i) {
                                void 0 === e.matches || n || (n = b(e, t));
                            })), n;
                        }
                        if (e > -1) {
                            if (void 0 === t) {
                                for (var x, P = e - 1; void 0 === (x = s.validPositions[P] || s.tests[P]) && P > -1; ) P--;
                                void 0 !== x && P > -1 && (v = function(e, t) {
                                    var n, i = [];
                                    return Array.isArray(t) || (t = [ t ]), t.length > 0 && (void 0 === t[0].alternation || !0 === u.keepStatic ? 0 === (i = c.call(o, e, t.slice()).locator.slice()).length && (i = t[0].locator.slice()) : t.forEach((function(e) {
                                        "" !== e.def && (0 === i.length ? (n = e.alternation, i = e.locator.slice()) : e.locator[n] && -1 === i[n].toString().indexOf(e.locator[n]) && (i[n] += "," + e.locator[n]));
                                    }))), i;
                                }(P, x), y = v.join(""), h = P);
                            }
                            if (s.tests[e] && s.tests[e][0].cd === y) return s.tests[e];
                            for (var w = v.shift(); w < d.length; w++) if (k(d[w], v, [ w ]) && h === e || h > e) break;
                        }
                        return (0 === m.length || g) && m.push({
                            match: {
                                fn: null,
                                static: !0,
                                optionality: !1,
                                casing: null,
                                def: "",
                                placeholder: ""
                            },
                            locator: [],
                            mloc: {},
                            cd: y
                        }), void 0 !== t && s.tests[e] ? r = l.extend(!0, [], m) : (s.tests[e] = l.extend(!0, [], m), 
                        r = s.tests[e]), m.forEach((function(e) {
                            e.match.optionality = e.match.defOptionality || !1;
                        })), r;
                    }
                },
                7215: function(e, t, n) {
                    Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.alternate = l, t.checkAlternationMatch = function(e, t, n) {
                        for (var i, a = this.opts.greedy ? t : t.slice(0, 1), r = !1, o = void 0 !== n ? n.split(",") : [], l = 0; l < o.length; l++) -1 !== (i = e.indexOf(o[l])) && e.splice(i, 1);
                        for (var s = 0; s < e.length; s++) if (a.includes(e[s])) {
                            r = !0;
                            break;
                        }
                        return r;
                    }, t.handleRemove = function(e, t, n, o, s) {
                        var c = this, u = this.maskset, f = this.opts;
                        if ((f.numericInput || c.isRTL) && (t === a.keys.Backspace ? t = a.keys.Delete : t === a.keys.Delete && (t = a.keys.Backspace), 
                        c.isRTL)) {
                            var p = n.end;
                            n.end = n.begin, n.begin = p;
                        }
                        var d, h = r.getLastValidPosition.call(c, void 0, !0);
                        n.end >= r.getBuffer.call(c).length && h >= n.end && (n.end = h + 1);
                        t === a.keys.Backspace ? n.end - n.begin < 1 && (n.begin = r.seekPrevious.call(c, n.begin)) : t === a.keys.Delete && n.begin === n.end && (n.end = r.isMask.call(c, n.end, !0, !0) ? n.end + 1 : r.seekNext.call(c, n.end) + 1);
                        if (!1 !== (d = v.call(c, n))) {
                            if (!0 !== o && !1 !== f.keepStatic || null !== f.regex && -1 !== i.getTest.call(c, n.begin).match.def.indexOf("|")) {
                                var m = l.call(c, !0);
                                if (m) {
                                    var g = void 0 !== m.caret ? m.caret : m.pos ? r.seekNext.call(c, m.pos.begin ? m.pos.begin : m.pos) : r.getLastValidPosition.call(c, -1, !0);
                                    (t !== a.keys.Delete || n.begin > g) && n.begin;
                                }
                            }
                            !0 !== o && (u.p = t === a.keys.Delete ? n.begin + d : n.begin, u.p = r.determineNewCaretPosition.call(c, {
                                begin: u.p,
                                end: u.p
                            }, !1, !1 === f.insertMode && t === a.keys.Backspace ? "none" : void 0).begin);
                        }
                    }, t.isComplete = c, t.isSelection = u, t.isValid = f, t.refreshFromBuffer = d, 
                    t.revalidateMask = v;
                    var i = n(4713), a = n(2839), r = n(8711), o = n(6030);
                    function l(e, t, n, a, o, s) {
                        var c, u, p, d, h, v, m, g, y, k, b, x = this, P = this.dependencyLib, w = this.opts, S = x.maskset, O = P.extend(!0, [], S.validPositions), _ = P.extend(!0, {}, S.tests), E = !1, M = !1, j = void 0 !== o ? o : r.getLastValidPosition.call(x);
                        if (s && (k = s.begin, b = s.end, s.begin > s.end && (k = s.end, b = s.begin)), 
                        -1 === j && void 0 === o) c = 0, u = (d = i.getTest.call(x, c)).alternation; else for (;j >= 0; j--) if ((p = S.validPositions[j]) && void 0 !== p.alternation) {
                            if (j <= (e || 0) && d && d.locator[p.alternation] !== p.locator[p.alternation]) break;
                            c = j, u = S.validPositions[c].alternation, d = p;
                        }
                        if (void 0 !== u) {
                            m = parseInt(c), S.excludes[m] = S.excludes[m] || [], !0 !== e && S.excludes[m].push((0, 
                            i.getDecisionTaker)(d) + ":" + d.alternation);
                            var T = [], A = -1;
                            for (h = m; m < r.getLastValidPosition.call(x, void 0, !0) + 1; h++) -1 === A && e <= h && void 0 !== t && (T.push(t), 
                            A = T.length - 1), (v = S.validPositions[m]) && !0 !== v.generatedInput && (void 0 === s || h < k || h >= b) && T.push(v.input), 
                            S.validPositions.splice(m, 1);
                            for (-1 === A && void 0 !== t && (T.push(t), A = T.length - 1); void 0 !== S.excludes[m] && S.excludes[m].length < 10; ) {
                                for (S.tests = {}, r.resetMaskSet.call(x, !0), E = !0, h = 0; h < T.length && (g = E.caret || 0 == w.insertMode && null != g ? r.seekNext.call(x, g) : r.getLastValidPosition.call(x, void 0, !0) + 1, 
                                y = T[h], E = f.call(x, g, y, !1, a, !0)); h++) h === A && (M = E), 1 == e && E && (M = {
                                    caretPos: h
                                });
                                if (E) break;
                                if (r.resetMaskSet.call(x), d = i.getTest.call(x, m), S.validPositions = P.extend(!0, [], O), 
                                S.tests = P.extend(!0, {}, _), !S.excludes[m]) {
                                    M = l.call(x, e, t, n, a, m - 1, s);
                                    break;
                                }
                                if (null != d.alternation) {
                                    var D = (0, i.getDecisionTaker)(d);
                                    if (-1 !== S.excludes[m].indexOf(D + ":" + d.alternation)) {
                                        M = l.call(x, e, t, n, a, m - 1, s);
                                        break;
                                    }
                                    for (S.excludes[m].push(D + ":" + d.alternation), h = m; h < r.getLastValidPosition.call(x, void 0, !0) + 1; h++) S.validPositions.splice(m);
                                } else delete S.excludes[m];
                            }
                        }
                        return M && !1 === w.keepStatic || delete S.excludes[m], M;
                    }
                    function s(e, t, n) {
                        var i = this.opts, r = this.maskset;
                        switch (i.casing || t.casing) {
                          case "upper":
                            e = e.toUpperCase();
                            break;

                          case "lower":
                            e = e.toLowerCase();
                            break;

                          case "title":
                            var o = r.validPositions[n - 1];
                            e = 0 === n || o && o.input === String.fromCharCode(a.keyCode.Space) ? e.toUpperCase() : e.toLowerCase();
                            break;

                          default:
                            if ("function" == typeof i.casing) {
                                var l = Array.prototype.slice.call(arguments);
                                l.push(r.validPositions), e = i.casing.apply(this, l);
                            }
                        }
                        return e;
                    }
                    function c(e) {
                        var t = this, n = this.opts, a = this.maskset;
                        if ("function" == typeof n.isComplete) return n.isComplete(e, n);
                        if ("*" !== n.repeat) {
                            var o = !1, l = r.determineLastRequiredPosition.call(t, !0), s = l.l;
                            if (void 0 === l.def || l.def.newBlockMarker || l.def.optionality || l.def.optionalQuantifier) {
                                o = !0;
                                for (var c = 0; c <= s; c++) {
                                    var u = i.getTestTemplate.call(t, c).match;
                                    if (!0 !== u.static && void 0 === a.validPositions[c] && (!1 === u.optionality || void 0 === u.optionality || u.optionality && 0 == u.newBlockMarker) && (!1 === u.optionalQuantifier || void 0 === u.optionalQuantifier) || !0 === u.static && "" != u.def && e[c] !== i.getPlaceholder.call(t, c, u)) {
                                        o = !1;
                                        break;
                                    }
                                }
                            }
                            return o;
                        }
                    }
                    function u(e) {
                        var t = this.opts.insertMode ? 0 : 1;
                        return this.isRTL ? e.begin - e.end > t : e.end - e.begin > t;
                    }
                    function f(e, t, n, a, o, p, m) {
                        var g = this, y = this.dependencyLib, k = this.opts, b = g.maskset;
                        n = !0 === n;
                        var x = e;
                        function P(e) {
                            if (void 0 !== e) {
                                if (void 0 !== e.remove && (Array.isArray(e.remove) || (e.remove = [ e.remove ]), 
                                e.remove.sort((function(e, t) {
                                    return g.isRTL ? e.pos - t.pos : t.pos - e.pos;
                                })).forEach((function(e) {
                                    v.call(g, {
                                        begin: e,
                                        end: e + 1
                                    });
                                })), e.remove = void 0), void 0 !== e.insert && (Array.isArray(e.insert) || (e.insert = [ e.insert ]), 
                                e.insert.sort((function(e, t) {
                                    return g.isRTL ? t.pos - e.pos : e.pos - t.pos;
                                })).forEach((function(e) {
                                    "" !== e.c && f.call(g, e.pos, e.c, void 0 === e.strict || e.strict, void 0 !== e.fromIsValid ? e.fromIsValid : a);
                                })), e.insert = void 0), e.refreshFromBuffer && e.buffer) {
                                    var t = e.refreshFromBuffer;
                                    d.call(g, !0 === t ? t : t.start, t.end, e.buffer), e.refreshFromBuffer = void 0;
                                }
                                void 0 !== e.rewritePosition && (x = e.rewritePosition, e = !0);
                            }
                            return e;
                        }
                        function w(t, n, o) {
                            var l = !1;
                            return i.getTests.call(g, t).every((function(c, f) {
                                var p = c.match;
                                if (r.getBuffer.call(g, !0), !1 !== (l = (!p.jit || void 0 !== b.validPositions[r.seekPrevious.call(g, t)]) && (null != p.fn ? p.fn.test(n, b, t, o, k, u.call(g, e)) : (n === p.def || n === k.skipOptionalPartCharacter) && "" !== p.def && {
                                    c: i.getPlaceholder.call(g, t, p, !0) || p.def,
                                    pos: t
                                }))) {
                                    var d = void 0 !== l.c ? l.c : n, h = t;
                                    return d = d === k.skipOptionalPartCharacter && !0 === p.static ? i.getPlaceholder.call(g, t, p, !0) || p.def : d, 
                                    !0 !== (l = P(l)) && void 0 !== l.pos && l.pos !== t && (h = l.pos), !0 !== l && void 0 === l.pos && void 0 === l.c ? !1 : (!1 === v.call(g, e, y.extend({}, c, {
                                        input: s.call(g, d, p, h)
                                    }), a, h) && (l = !1), !1);
                                }
                                return !0;
                            })), l;
                        }
                        void 0 !== e.begin && (x = g.isRTL ? e.end : e.begin);
                        var S = !0, O = y.extend(!0, [], b.validPositions);
                        if (!1 === k.keepStatic && void 0 !== b.excludes[x] && !0 !== o && !0 !== a) for (var _ = x; _ < (g.isRTL ? e.begin : e.end); _++) void 0 !== b.excludes[_] && (b.excludes[_] = void 0, 
                        delete b.tests[_]);
                        if ("function" == typeof k.preValidation && !0 !== a && !0 !== p && (S = P(S = k.preValidation.call(g, r.getBuffer.call(g), x, t, u.call(g, e), k, b, e, n || o))), 
                        !0 === S) {
                            if (S = w(x, t, n), (!n || !0 === a) && !1 === S && !0 !== p) {
                                var E = b.validPositions[x];
                                if (!E || !0 !== E.match.static || E.match.def !== t && t !== k.skipOptionalPartCharacter) {
                                    if (k.insertMode || void 0 === b.validPositions[r.seekNext.call(g, x)] || e.end > x) {
                                        var M = !1;
                                        if (b.jitOffset[x] && void 0 === b.validPositions[r.seekNext.call(g, x)] && !1 !== (S = f.call(g, x + b.jitOffset[x], t, !0, !0)) && (!0 !== o && (S.caret = x), 
                                        M = !0), e.end > x && (b.validPositions[x] = void 0), !M && !r.isMask.call(g, x, k.keepStatic && 0 === x)) for (var j = x + 1, T = r.seekNext.call(g, x, !1, 0 !== x); j <= T; j++) if (!1 !== (S = w(j, t, n))) {
                                            S = h.call(g, x, void 0 !== S.pos ? S.pos : j) || S, x = j;
                                            break;
                                        }
                                    }
                                } else S = {
                                    caret: r.seekNext.call(g, x)
                                };
                            }
                            g.hasAlternator && !0 !== o && !n && (o = !0, !1 === S && k.keepStatic && (c.call(g, r.getBuffer.call(g)) || 0 === x) ? S = l.call(g, x, t, n, a, void 0, e) : (u.call(g, e) && b.tests[x] && b.tests[x].length > 1 && k.keepStatic || 1 == S && !0 !== k.numericInput && b.tests[x] && b.tests[x].length > 1 && r.getLastValidPosition.call(g, void 0, !0) > x) && (S = l.call(g, !0))), 
                            !0 === S && (S = {
                                pos: x
                            });
                        }
                        if ("function" == typeof k.postValidation && !0 !== a && !0 !== p) {
                            var A = k.postValidation.call(g, r.getBuffer.call(g, !0), void 0 !== e.begin ? g.isRTL ? e.end : e.begin : e, t, S, k, b, n, m);
                            void 0 !== A && (S = !0 === A ? S : A);
                        }
                        S && void 0 === S.pos && (S.pos = x), !1 === S || !0 === p ? (r.resetMaskSet.call(g, !0), 
                        b.validPositions = y.extend(!0, [], O)) : h.call(g, void 0, x, !0);
                        var D = P(S);
                        void 0 !== g.maxLength && r.getBuffer.call(g).length > g.maxLength && !a && (r.resetMaskSet.call(g, !0), 
                        b.validPositions = y.extend(!0, [], O), D = !1);
                        return D;
                    }
                    function p(e, t, n) {
                        for (var a = this.maskset, r = !1, o = i.getTests.call(this, e), l = 0; l < o.length; l++) {
                            if (o[l].match && (o[l].match.nativeDef === t.match[n.shiftPositions ? "def" : "nativeDef"] && (!n.shiftPositions || !t.match.static) || o[l].match.nativeDef === t.match.nativeDef || n.regex && !o[l].match.static && o[l].match.fn.test(t.input, a, e, !1, n))) {
                                r = !0;
                                break;
                            }
                            if (o[l].match && o[l].match.def === t.match.nativeDef) {
                                r = void 0;
                                break;
                            }
                        }
                        return !1 === r && void 0 !== a.jitOffset[e] && (r = p.call(this, e + a.jitOffset[e], t, n)), 
                        r;
                    }
                    function d(e, t, n) {
                        var i, a, l = this, s = this.maskset, c = this.opts, u = this.dependencyLib, f = c.skipOptionalPartCharacter, p = l.isRTL ? n.slice().reverse() : n;
                        if (c.skipOptionalPartCharacter = "", !0 === e) r.resetMaskSet.call(l, !1), e = 0, 
                        t = n.length, a = r.determineNewCaretPosition.call(l, {
                            begin: 0,
                            end: 0
                        }, !1).begin; else {
                            for (i = e; i < t; i++) s.validPositions.splice(e, 0);
                            a = e;
                        }
                        var d = new u.Event("keypress");
                        for (i = e; i < t; i++) {
                            d.key = p[i].toString(), l.ignorable = !1;
                            var h = o.EventHandlers.keypressEvent.call(l, d, !0, !1, !1, a);
                            !1 !== h && void 0 !== h && (a = h.forwardPosition);
                        }
                        c.skipOptionalPartCharacter = f;
                    }
                    function h(e, t, n) {
                        var a = this, o = this.maskset, l = this.dependencyLib;
                        if (void 0 === e) for (e = t - 1; e > 0 && !o.validPositions[e]; e--) ;
                        for (var s = e; s < t; s++) if (void 0 === o.validPositions[s] && !r.isMask.call(a, s, !1)) if (0 == s ? i.getTest.call(a, s) : o.validPositions[s - 1]) {
                            var c = i.getTests.call(a, s).slice();
                            "" === c[c.length - 1].match.def && c.pop();
                            var u, p = i.determineTestTemplate.call(a, s, c);
                            if (p && (!0 !== p.match.jit || "master" === p.match.newBlockMarker && (u = o.validPositions[s + 1]) && !0 === u.match.optionalQuantifier) && ((p = l.extend({}, p, {
                                input: i.getPlaceholder.call(a, s, p.match, !0) || p.match.def
                            })).generatedInput = !0, v.call(a, s, p, !0), !0 !== n)) {
                                var d = o.validPositions[t].input;
                                return o.validPositions[t] = void 0, f.call(a, t, d, !0, !0);
                            }
                        }
                    }
                    function v(e, t, n, a) {
                        var o = this, l = this.maskset, s = this.opts, c = this.dependencyLib;
                        function u(e, t, n) {
                            var i = t[e];
                            if (void 0 !== i && !0 === i.match.static && !0 !== i.match.optionality && (void 0 === t[0] || void 0 === t[0].alternation)) {
                                var a = n.begin <= e - 1 ? t[e - 1] && !0 === t[e - 1].match.static && t[e - 1] : t[e - 1], r = n.end > e + 1 ? t[e + 1] && !0 === t[e + 1].match.static && t[e + 1] : t[e + 1];
                                return a && r;
                            }
                            return !1;
                        }
                        var d = 0, h = void 0 !== e.begin ? e.begin : e, v = void 0 !== e.end ? e.end : e, m = !0;
                        if (e.begin > e.end && (h = e.end, v = e.begin), a = void 0 !== a ? a : h, void 0 === n && (h !== v || s.insertMode && void 0 !== l.validPositions[a] || void 0 === t || t.match.optionalQuantifier || t.match.optionality)) {
                            var g, y = c.extend(!0, [], l.validPositions), k = r.getLastValidPosition.call(o, void 0, !0);
                            for (l.p = h, g = k; g >= h; g--) l.validPositions.splice(g, 1), void 0 === t && delete l.tests[g + 1];
                            var b, x, P = a, w = P;
                            for (t && (l.validPositions[a] = c.extend(!0, {}, t), w++, P++), null == y[v] && l.jitOffset[v] && (v += l.jitOffset[v] + 1), 
                            g = t ? v : v - 1; g <= k; g++) {
                                if (void 0 !== (b = y[g]) && !0 !== b.generatedInput && (g >= v || g >= h && u(g, y, {
                                    begin: h,
                                    end: v
                                }))) {
                                    for (;"" !== i.getTest.call(o, w).match.def; ) {
                                        if (!1 !== (x = p.call(o, w, b, s)) || "+" === b.match.def) {
                                            "+" === b.match.def && r.getBuffer.call(o, !0);
                                            var S = f.call(o, w, b.input, "+" !== b.match.def, !0);
                                            if (m = !1 !== S, P = (S.pos || w) + 1, !m && x) break;
                                        } else m = !1;
                                        if (m) {
                                            void 0 === t && b.match.static && g === e.begin && d++;
                                            break;
                                        }
                                        if (!m && r.getBuffer.call(o), w > l.maskLength) break;
                                        w++;
                                    }
                                    "" == i.getTest.call(o, w).match.def && (m = !1), w = P;
                                }
                                if (!m) break;
                            }
                            if (!m) return l.validPositions = c.extend(!0, [], y), r.resetMaskSet.call(o, !0), 
                            !1;
                        } else t && i.getTest.call(o, a).match.cd === t.match.cd && (l.validPositions[a] = c.extend(!0, {}, t));
                        return r.resetMaskSet.call(o, !0), d;
                    }
                }
            }, t = {};
            function n(i) {
                var a = t[i];
                if (void 0 !== a) return a.exports;
                var r = t[i] = {
                    exports: {}
                };
                return e[i](r, r.exports, n), r.exports;
            }
            var i = {};
            return function() {
                var e, t = i;
                Object.defineProperty(t, "__esModule", {
                    value: !0
                }), t.default = void 0, n(7149), n(3194), n(9302), n(4013), n(3851), n(219), n(207), 
                n(5296);
                var a = ((e = n(2394)) && e.__esModule ? e : {
                    default: e
                }).default;
                t.default = a;
            }(), i;
        }();
    }));
    var selector = document.getElementById("tel");
    var im = new Inputmask("+38 (099) 999-99-99");
    im.mask(selector);
    function ssr_window_esm_isObject(obj) {
        return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
    }
    function extend(target, src) {
        if (target === void 0) target = {};
        if (src === void 0) src = {};
        Object.keys(src).forEach((key => {
            if (typeof target[key] === "undefined") target[key] = src[key]; else if (ssr_window_esm_isObject(src[key]) && ssr_window_esm_isObject(target[key]) && Object.keys(src[key]).length > 0) extend(target[key], src[key]);
        }));
    }
    const ssrDocument = {
        body: {},
        addEventListener() {},
        removeEventListener() {},
        activeElement: {
            blur() {},
            nodeName: ""
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        getElementById() {
            return null;
        },
        createEvent() {
            return {
                initEvent() {}
            };
        },
        createElement() {
            return {
                children: [],
                childNodes: [],
                style: {},
                setAttribute() {},
                getElementsByTagName() {
                    return [];
                }
            };
        },
        createElementNS() {
            return {};
        },
        importNode() {
            return null;
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        }
    };
    function ssr_window_esm_getDocument() {
        const doc = typeof document !== "undefined" ? document : {};
        extend(doc, ssrDocument);
        return doc;
    }
    const ssrWindow = {
        document: ssrDocument,
        navigator: {
            userAgent: ""
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        },
        history: {
            replaceState() {},
            pushState() {},
            go() {},
            back() {}
        },
        CustomEvent: function CustomEvent() {
            return this;
        },
        addEventListener() {},
        removeEventListener() {},
        getComputedStyle() {
            return {
                getPropertyValue() {
                    return "";
                }
            };
        },
        Image() {},
        Date() {},
        screen: {},
        setTimeout() {},
        clearTimeout() {},
        matchMedia() {
            return {};
        },
        requestAnimationFrame(callback) {
            if (typeof setTimeout === "undefined") {
                callback();
                return null;
            }
            return setTimeout(callback, 0);
        },
        cancelAnimationFrame(id) {
            if (typeof setTimeout === "undefined") return;
            clearTimeout(id);
        }
    };
    function ssr_window_esm_getWindow() {
        const win = typeof window !== "undefined" ? window : {};
        extend(win, ssrWindow);
        return win;
    }
    function utils_classesToTokens(classes) {
        if (classes === void 0) classes = "";
        return classes.trim().split(" ").filter((c => !!c.trim()));
    }
    function deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach((key => {
            try {
                object[key] = null;
            } catch (e) {}
            try {
                delete object[key];
            } catch (e) {}
        }));
    }
    function utils_nextTick(callback, delay) {
        if (delay === void 0) delay = 0;
        return setTimeout(callback, delay);
    }
    function utils_now() {
        return Date.now();
    }
    function utils_getComputedStyle(el) {
        const window = ssr_window_esm_getWindow();
        let style;
        if (window.getComputedStyle) style = window.getComputedStyle(el, null);
        if (!style && el.currentStyle) style = el.currentStyle;
        if (!style) style = el.style;
        return style;
    }
    function utils_getTranslate(el, axis) {
        if (axis === void 0) axis = "x";
        const window = ssr_window_esm_getWindow();
        let matrix;
        let curTransform;
        let transformMatrix;
        const curStyle = utils_getComputedStyle(el);
        if (window.WebKitCSSMatrix) {
            curTransform = curStyle.transform || curStyle.webkitTransform;
            if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map((a => a.replace(",", "."))).join(", ");
            transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
        } else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
            matrix = transformMatrix.toString().split(",");
        }
        if (axis === "x") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); else curTransform = parseFloat(matrix[4]);
        if (axis === "y") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); else curTransform = parseFloat(matrix[5]);
        return curTransform || 0;
    }
    function utils_isObject(o) {
        return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
    }
    function isNode(node) {
        if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") return node instanceof HTMLElement;
        return node && (node.nodeType === 1 || node.nodeType === 11);
    }
    function utils_extend() {
        const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
        const noExtend = [ "__proto__", "constructor", "prototype" ];
        for (let i = 1; i < arguments.length; i += 1) {
            const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
            if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
                const keysArray = Object.keys(Object(nextSource)).filter((key => noExtend.indexOf(key) < 0));
                for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
                    const nextKey = keysArray[nextIndex];
                    const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== void 0 && desc.enumerable) if (utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]); else if (!utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) {
                        to[nextKey] = {};
                        if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]);
                    } else to[nextKey] = nextSource[nextKey];
                }
            }
        }
        return to;
    }
    function utils_setCSSProperty(el, varName, varValue) {
        el.style.setProperty(varName, varValue);
    }
    function animateCSSModeScroll(_ref) {
        let {swiper, targetPosition, side} = _ref;
        const window = ssr_window_esm_getWindow();
        const startPosition = -swiper.translate;
        let startTime = null;
        let time;
        const duration = swiper.params.speed;
        swiper.wrapperEl.style.scrollSnapType = "none";
        window.cancelAnimationFrame(swiper.cssModeFrameID);
        const dir = targetPosition > startPosition ? "next" : "prev";
        const isOutOfBound = (current, target) => dir === "next" && current >= target || dir === "prev" && current <= target;
        const animate = () => {
            time = (new Date).getTime();
            if (startTime === null) startTime = time;
            const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
            const easeProgress = .5 - Math.cos(progress * Math.PI) / 2;
            let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
            if (isOutOfBound(currentPosition, targetPosition)) currentPosition = targetPosition;
            swiper.wrapperEl.scrollTo({
                [side]: currentPosition
            });
            if (isOutOfBound(currentPosition, targetPosition)) {
                swiper.wrapperEl.style.overflow = "hidden";
                swiper.wrapperEl.style.scrollSnapType = "";
                setTimeout((() => {
                    swiper.wrapperEl.style.overflow = "";
                    swiper.wrapperEl.scrollTo({
                        [side]: currentPosition
                    });
                }));
                window.cancelAnimationFrame(swiper.cssModeFrameID);
                return;
            }
            swiper.cssModeFrameID = window.requestAnimationFrame(animate);
        };
        animate();
    }
    function utils_elementChildren(element, selector) {
        if (selector === void 0) selector = "";
        return [ ...element.children ].filter((el => el.matches(selector)));
    }
    function showWarning(text) {
        try {
            console.warn(text);
            return;
        } catch (err) {}
    }
    function utils_createElement(tag, classes) {
        if (classes === void 0) classes = [];
        const el = document.createElement(tag);
        el.classList.add(...Array.isArray(classes) ? classes : utils_classesToTokens(classes));
        return el;
    }
    function elementPrevAll(el, selector) {
        const prevEls = [];
        while (el.previousElementSibling) {
            const prev = el.previousElementSibling;
            if (selector) {
                if (prev.matches(selector)) prevEls.push(prev);
            } else prevEls.push(prev);
            el = prev;
        }
        return prevEls;
    }
    function elementNextAll(el, selector) {
        const nextEls = [];
        while (el.nextElementSibling) {
            const next = el.nextElementSibling;
            if (selector) {
                if (next.matches(selector)) nextEls.push(next);
            } else nextEls.push(next);
            el = next;
        }
        return nextEls;
    }
    function elementStyle(el, prop) {
        const window = ssr_window_esm_getWindow();
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function utils_elementIndex(el) {
        let child = el;
        let i;
        if (child) {
            i = 0;
            while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i += 1;
            return i;
        }
        return;
    }
    function utils_elementParents(el, selector) {
        const parents = [];
        let parent = el.parentElement;
        while (parent) {
            if (selector) {
                if (parent.matches(selector)) parents.push(parent);
            } else parents.push(parent);
            parent = parent.parentElement;
        }
        return parents;
    }
    function elementOuterSize(el, size, includeMargins) {
        const window = ssr_window_esm_getWindow();
        if (includeMargins) return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
        return el.offsetWidth;
    }
    function utils_makeElementsArray(el) {
        return (Array.isArray(el) ? el : [ el ]).filter((e => !!e));
    }
    let support;
    function calcSupport() {
        const window = ssr_window_esm_getWindow();
        const document = ssr_window_esm_getDocument();
        return {
            smoothScroll: document.documentElement && document.documentElement.style && "scrollBehavior" in document.documentElement.style,
            touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
    }
    function getSupport() {
        if (!support) support = calcSupport();
        return support;
    }
    let deviceCached;
    function calcDevice(_temp) {
        let {userAgent} = _temp === void 0 ? {} : _temp;
        const support = getSupport();
        const window = ssr_window_esm_getWindow();
        const platform = window.navigator.platform;
        const ua = userAgent || window.navigator.userAgent;
        const device = {
            ios: false,
            android: false
        };
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
        const windows = platform === "Win32";
        let macos = platform === "MacIntel";
        const iPadScreens = [ "1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810" ];
        if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
            ipad = ua.match(/(Version)\/([\d.]+)/);
            if (!ipad) ipad = [ 0, 1, "13_0_0" ];
            macos = false;
        }
        if (android && !windows) {
            device.os = "android";
            device.android = true;
        }
        if (ipad || iphone || ipod) {
            device.os = "ios";
            device.ios = true;
        }
        return device;
    }
    function getDevice(overrides) {
        if (overrides === void 0) overrides = {};
        if (!deviceCached) deviceCached = calcDevice(overrides);
        return deviceCached;
    }
    let browser;
    function calcBrowser() {
        const window = ssr_window_esm_getWindow();
        const device = getDevice();
        let needPerspectiveFix = false;
        function isSafari() {
            const ua = window.navigator.userAgent.toLowerCase();
            return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
        }
        if (isSafari()) {
            const ua = String(window.navigator.userAgent);
            if (ua.includes("Version/")) {
                const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num => Number(num)));
                needPerspectiveFix = major < 16 || major === 16 && minor < 2;
            }
        }
        const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
        const isSafariBrowser = isSafari();
        const need3dFix = isSafariBrowser || isWebView && device.ios;
        return {
            isSafari: needPerspectiveFix || isSafariBrowser,
            needPerspectiveFix,
            need3dFix,
            isWebView
        };
    }
    function getBrowser() {
        if (!browser) browser = calcBrowser();
        return browser;
    }
    function Resize(_ref) {
        let {swiper, on, emit} = _ref;
        const window = ssr_window_esm_getWindow();
        let observer = null;
        let animationFrame = null;
        const resizeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("beforeResize");
            emit("resize");
        };
        const createObserver = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            observer = new ResizeObserver((entries => {
                animationFrame = window.requestAnimationFrame((() => {
                    const {width, height} = swiper;
                    let newWidth = width;
                    let newHeight = height;
                    entries.forEach((_ref2 => {
                        let {contentBoxSize, contentRect, target} = _ref2;
                        if (target && target !== swiper.el) return;
                        newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
                        newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
                    }));
                    if (newWidth !== width || newHeight !== height) resizeHandler();
                }));
            }));
            observer.observe(swiper.el);
        };
        const removeObserver = () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (observer && observer.unobserve && swiper.el) {
                observer.unobserve(swiper.el);
                observer = null;
            }
        };
        const orientationChangeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("orientationchange");
        };
        on("init", (() => {
            if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
                createObserver();
                return;
            }
            window.addEventListener("resize", resizeHandler);
            window.addEventListener("orientationchange", orientationChangeHandler);
        }));
        on("destroy", (() => {
            removeObserver();
            window.removeEventListener("resize", resizeHandler);
            window.removeEventListener("orientationchange", orientationChangeHandler);
        }));
    }
    function Observer(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const observers = [];
        const window = ssr_window_esm_getWindow();
        const attach = function(target, options) {
            if (options === void 0) options = {};
            const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            const observer = new ObserverFunc((mutations => {
                if (swiper.__preventObserver__) return;
                if (mutations.length === 1) {
                    emit("observerUpdate", mutations[0]);
                    return;
                }
                const observerUpdate = function observerUpdate() {
                    emit("observerUpdate", mutations[0]);
                };
                if (window.requestAnimationFrame) window.requestAnimationFrame(observerUpdate); else window.setTimeout(observerUpdate, 0);
            }));
            observer.observe(target, {
                attributes: typeof options.attributes === "undefined" ? true : options.attributes,
                childList: typeof options.childList === "undefined" ? true : options.childList,
                characterData: typeof options.characterData === "undefined" ? true : options.characterData
            });
            observers.push(observer);
        };
        const init = () => {
            if (!swiper.params.observer) return;
            if (swiper.params.observeParents) {
                const containerParents = utils_elementParents(swiper.hostEl);
                for (let i = 0; i < containerParents.length; i += 1) attach(containerParents[i]);
            }
            attach(swiper.hostEl, {
                childList: swiper.params.observeSlideChildren
            });
            attach(swiper.wrapperEl, {
                attributes: false
            });
        };
        const destroy = () => {
            observers.forEach((observer => {
                observer.disconnect();
            }));
            observers.splice(0, observers.length);
        };
        extendParams({
            observer: false,
            observeParents: false,
            observeSlideChildren: false
        });
        on("init", init);
        on("destroy", destroy);
    }
    var eventsEmitter = {
        on(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            events.split(" ").forEach((event => {
                if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
                self.eventsListeners[event][method](handler);
            }));
            return self;
        },
        once(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            function onceHandler() {
                self.off(events, onceHandler);
                if (onceHandler.__emitterProxy) delete onceHandler.__emitterProxy;
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                handler.apply(self, args);
            }
            onceHandler.__emitterProxy = handler;
            return self.on(events, onceHandler, priority);
        },
        onAny(handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            if (self.eventsAnyListeners.indexOf(handler) < 0) self.eventsAnyListeners[method](handler);
            return self;
        },
        offAny(handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsAnyListeners) return self;
            const index = self.eventsAnyListeners.indexOf(handler);
            if (index >= 0) self.eventsAnyListeners.splice(index, 1);
            return self;
        },
        off(events, handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            events.split(" ").forEach((event => {
                if (typeof handler === "undefined") self.eventsListeners[event] = []; else if (self.eventsListeners[event]) self.eventsListeners[event].forEach(((eventHandler, index) => {
                    if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) self.eventsListeners[event].splice(index, 1);
                }));
            }));
            return self;
        },
        emit() {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            let events;
            let data;
            let context;
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
            if (typeof args[0] === "string" || Array.isArray(args[0])) {
                events = args[0];
                data = args.slice(1, args.length);
                context = self;
            } else {
                events = args[0].events;
                data = args[0].data;
                context = args[0].context || self;
            }
            data.unshift(context);
            const eventsArray = Array.isArray(events) ? events : events.split(" ");
            eventsArray.forEach((event => {
                if (self.eventsAnyListeners && self.eventsAnyListeners.length) self.eventsAnyListeners.forEach((eventHandler => {
                    eventHandler.apply(context, [ event, ...data ]);
                }));
                if (self.eventsListeners && self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler => {
                    eventHandler.apply(context, data);
                }));
            }));
            return self;
        }
    };
    function updateSize() {
        const swiper = this;
        let width;
        let height;
        const el = swiper.el;
        if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) width = swiper.params.width; else width = el.clientWidth;
        if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) height = swiper.params.height; else height = el.clientHeight;
        if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) return;
        width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
        height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
        if (Number.isNaN(width)) width = 0;
        if (Number.isNaN(height)) height = 0;
        Object.assign(swiper, {
            width,
            height,
            size: swiper.isHorizontal() ? width : height
        });
    }
    function updateSlides() {
        const swiper = this;
        function getDirectionPropertyValue(node, label) {
            return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
        }
        const params = swiper.params;
        const {wrapperEl, slidesEl, size: swiperSize, rtlTranslate: rtl, wrongRTL} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        const slides = utils_elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
        const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
        let snapGrid = [];
        const slidesGrid = [];
        const slidesSizesGrid = [];
        let offsetBefore = params.slidesOffsetBefore;
        if (typeof offsetBefore === "function") offsetBefore = params.slidesOffsetBefore.call(swiper);
        let offsetAfter = params.slidesOffsetAfter;
        if (typeof offsetAfter === "function") offsetAfter = params.slidesOffsetAfter.call(swiper);
        const previousSnapGridLength = swiper.snapGrid.length;
        const previousSlidesGridLength = swiper.slidesGrid.length;
        let spaceBetween = params.spaceBetween;
        let slidePosition = -offsetBefore;
        let prevSlideSize = 0;
        let index = 0;
        if (typeof swiperSize === "undefined") return;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        swiper.virtualSize = -spaceBetween;
        slides.forEach((slideEl => {
            if (rtl) slideEl.style.marginLeft = ""; else slideEl.style.marginRight = "";
            slideEl.style.marginBottom = "";
            slideEl.style.marginTop = "";
        }));
        if (params.centeredSlides && params.cssMode) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
        }
        const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
        if (gridEnabled) swiper.grid.initSlides(slides); else if (swiper.grid) swiper.grid.unsetSlides();
        let slideSize;
        const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key => typeof params.breakpoints[key].slidesPerView !== "undefined")).length > 0;
        for (let i = 0; i < slidesLength; i += 1) {
            slideSize = 0;
            let slide;
            if (slides[i]) slide = slides[i];
            if (gridEnabled) swiper.grid.updateSlide(i, slide, slides);
            if (slides[i] && elementStyle(slide, "display") === "none") continue;
            if (params.slidesPerView === "auto") {
                if (shouldResetSlideSize) slides[i].style[swiper.getDirectionLabel("width")] = ``;
                const slideStyles = getComputedStyle(slide);
                const currentTransform = slide.style.transform;
                const currentWebKitTransform = slide.style.webkitTransform;
                if (currentTransform) slide.style.transform = "none";
                if (currentWebKitTransform) slide.style.webkitTransform = "none";
                if (params.roundLengths) slideSize = swiper.isHorizontal() ? elementOuterSize(slide, "width", true) : elementOuterSize(slide, "height", true); else {
                    const width = getDirectionPropertyValue(slideStyles, "width");
                    const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
                    const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
                    const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
                    const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
                    const boxSizing = slideStyles.getPropertyValue("box-sizing");
                    if (boxSizing && boxSizing === "border-box") slideSize = width + marginLeft + marginRight; else {
                        const {clientWidth, offsetWidth} = slide;
                        slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
                    }
                }
                if (currentTransform) slide.style.transform = currentTransform;
                if (currentWebKitTransform) slide.style.webkitTransform = currentWebKitTransform;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
            } else {
                slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
                if (slides[i]) slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
            }
            if (slides[i]) slides[i].swiperSlideSize = slideSize;
            slidesSizesGrid.push(slideSize);
            if (params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
            } else {
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
            swiper.virtualSize += slideSize + spaceBetween;
            prevSlideSize = slideSize;
            index += 1;
        }
        swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
        if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
        if (params.setWrapperSize) wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
        if (gridEnabled) swiper.grid.updateWrapperSize(slideSize, snapGrid);
        if (!params.centeredSlides) {
            const newSlidesGrid = [];
            for (let i = 0; i < snapGrid.length; i += 1) {
                let slidesGridItem = snapGrid[i];
                if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
                if (snapGrid[i] <= swiper.virtualSize - swiperSize) newSlidesGrid.push(slidesGridItem);
            }
            snapGrid = newSlidesGrid;
            if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) snapGrid.push(swiper.virtualSize - swiperSize);
        }
        if (isVirtual && params.loop) {
            const size = slidesSizesGrid[0] + spaceBetween;
            if (params.slidesPerGroup > 1) {
                const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
                const groupSize = size * params.slidesPerGroup;
                for (let i = 0; i < groups; i += 1) snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
            }
            for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
                if (params.slidesPerGroup === 1) snapGrid.push(snapGrid[snapGrid.length - 1] + size);
                slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
                swiper.virtualSize += size;
            }
        }
        if (snapGrid.length === 0) snapGrid = [ 0 ];
        if (spaceBetween !== 0) {
            const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
            slides.filter(((_, slideIndex) => {
                if (!params.cssMode || params.loop) return true;
                if (slideIndex === slides.length - 1) return false;
                return true;
            })).forEach((slideEl => {
                slideEl.style[key] = `${spaceBetween}px`;
            }));
        }
        if (params.centeredSlides && params.centeredSlidesBounds) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const maxSnap = allSlidesSize - swiperSize;
            snapGrid = snapGrid.map((snap => {
                if (snap <= 0) return -offsetBefore;
                if (snap > maxSnap) return maxSnap + offsetAfter;
                return snap;
            }));
        }
        if (params.centerInsufficientSlides) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
            if (allSlidesSize + offsetSize < swiperSize) {
                const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
                snapGrid.forEach(((snap, snapIndex) => {
                    snapGrid[snapIndex] = snap - allSlidesOffset;
                }));
                slidesGrid.forEach(((snap, snapIndex) => {
                    slidesGrid[snapIndex] = snap + allSlidesOffset;
                }));
            }
        }
        Object.assign(swiper, {
            slides,
            snapGrid,
            slidesGrid,
            slidesSizesGrid
        });
        if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
            const addToSnapGrid = -swiper.snapGrid[0];
            const addToSlidesGrid = -swiper.slidesGrid[0];
            swiper.snapGrid = swiper.snapGrid.map((v => v + addToSnapGrid));
            swiper.slidesGrid = swiper.slidesGrid.map((v => v + addToSlidesGrid));
        }
        if (slidesLength !== previousSlidesLength) swiper.emit("slidesLengthChange");
        if (snapGrid.length !== previousSnapGridLength) {
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            swiper.emit("snapGridLengthChange");
        }
        if (slidesGrid.length !== previousSlidesGridLength) swiper.emit("slidesGridLengthChange");
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        swiper.emit("slidesUpdated");
        if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
            const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
            const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
            if (slidesLength <= params.maxBackfaceHiddenSlides) {
                if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
            } else if (hasClassBackfaceClassAdded) swiper.el.classList.remove(backFaceHiddenClass);
        }
    }
    function updateAutoHeight(speed) {
        const swiper = this;
        const activeSlides = [];
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let newHeight = 0;
        let i;
        if (typeof speed === "number") swiper.setTransition(speed); else if (speed === true) swiper.setTransition(swiper.params.speed);
        const getSlideByIndex = index => {
            if (isVirtual) return swiper.slides[swiper.getSlideIndexByData(index)];
            return swiper.slides[index];
        };
        if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) if (swiper.params.centeredSlides) (swiper.visibleSlides || []).forEach((slide => {
            activeSlides.push(slide);
        })); else for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
        } else activeSlides.push(getSlideByIndex(swiper.activeIndex));
        for (i = 0; i < activeSlides.length; i += 1) if (typeof activeSlides[i] !== "undefined") {
            const height = activeSlides[i].offsetHeight;
            newHeight = height > newHeight ? height : newHeight;
        }
        if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
    }
    function updateSlidesOffset() {
        const swiper = this;
        const slides = swiper.slides;
        const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
        for (let i = 0; i < slides.length; i += 1) slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
    }
    const toggleSlideClasses$1 = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesProgress(translate) {
        if (translate === void 0) translate = this && this.translate || 0;
        const swiper = this;
        const params = swiper.params;
        const {slides, rtlTranslate: rtl, snapGrid} = swiper;
        if (slides.length === 0) return;
        if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
        let offsetCenter = -translate;
        if (rtl) offsetCenter = translate;
        swiper.visibleSlidesIndexes = [];
        swiper.visibleSlides = [];
        let spaceBetween = params.spaceBetween;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        for (let i = 0; i < slides.length; i += 1) {
            const slide = slides[i];
            let slideOffset = slide.swiperSlideOffset;
            if (params.cssMode && params.centeredSlides) slideOffset -= slides[0].swiperSlideOffset;
            const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const slideBefore = -(offsetCenter - slideOffset);
            const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
            const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
            const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
            if (isVisible) {
                swiper.visibleSlides.push(slide);
                swiper.visibleSlidesIndexes.push(i);
            }
            toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
            toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
            slide.progress = rtl ? -slideProgress : slideProgress;
            slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
        }
    }
    function updateProgress(translate) {
        const swiper = this;
        if (typeof translate === "undefined") {
            const multiplier = swiper.rtlTranslate ? -1 : 1;
            translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
        }
        const params = swiper.params;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        let {progress, isBeginning, isEnd, progressLoop} = swiper;
        const wasBeginning = isBeginning;
        const wasEnd = isEnd;
        if (translatesDiff === 0) {
            progress = 0;
            isBeginning = true;
            isEnd = true;
        } else {
            progress = (translate - swiper.minTranslate()) / translatesDiff;
            const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
            const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
            isBeginning = isBeginningRounded || progress <= 0;
            isEnd = isEndRounded || progress >= 1;
            if (isBeginningRounded) progress = 0;
            if (isEndRounded) progress = 1;
        }
        if (params.loop) {
            const firstSlideIndex = swiper.getSlideIndexByData(0);
            const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
            const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
            const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
            const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
            const translateAbs = Math.abs(translate);
            if (translateAbs >= firstSlideTranslate) progressLoop = (translateAbs - firstSlideTranslate) / translateMax; else progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
            if (progressLoop > 1) progressLoop -= 1;
        }
        Object.assign(swiper, {
            progress,
            progressLoop,
            isBeginning,
            isEnd
        });
        if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
        if (isBeginning && !wasBeginning) swiper.emit("reachBeginning toEdge");
        if (isEnd && !wasEnd) swiper.emit("reachEnd toEdge");
        if (wasBeginning && !isBeginning || wasEnd && !isEnd) swiper.emit("fromEdge");
        swiper.emit("progress", progress);
    }
    const toggleSlideClasses = (slideEl, condition, className) => {
        if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className); else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
    };
    function updateSlidesClasses() {
        const swiper = this;
        const {slides, params, slidesEl, activeIndex} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const getFilteredSlide = selector => utils_elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
        let activeSlide;
        let prevSlide;
        let nextSlide;
        if (isVirtual) if (params.loop) {
            let slideIndex = activeIndex - swiper.virtual.slidesBefore;
            if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
            if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        } else activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`); else if (gridEnabled) {
            activeSlide = slides.filter((slideEl => slideEl.column === activeIndex))[0];
            nextSlide = slides.filter((slideEl => slideEl.column === activeIndex + 1))[0];
            prevSlide = slides.filter((slideEl => slideEl.column === activeIndex - 1))[0];
        } else activeSlide = slides[activeIndex];
        if (activeSlide) if (!gridEnabled) {
            nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !nextSlide) nextSlide = slides[0];
            prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !prevSlide === 0) prevSlide = slides[slides.length - 1];
        }
        slides.forEach((slideEl => {
            toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
            toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
            toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
        }));
        swiper.emitSlidesClasses();
    }
    const processLazyPreloader = (swiper, imageEl) => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
        const slideEl = imageEl.closest(slideSelector());
        if (slideEl) {
            let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (!lazyEl && swiper.isElement) if (slideEl.shadowRoot) lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`); else requestAnimationFrame((() => {
                if (slideEl.shadowRoot) {
                    lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                    if (lazyEl) lazyEl.remove();
                }
            }));
            if (lazyEl) lazyEl.remove();
        }
    };
    const unlazy = (swiper, index) => {
        if (!swiper.slides[index]) return;
        const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
        if (imageEl) imageEl.removeAttribute("loading");
    };
    const preload = swiper => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        let amount = swiper.params.lazyPreloadPrevNext;
        const len = swiper.slides.length;
        if (!len || !amount || amount < 0) return;
        amount = Math.min(amount, len);
        const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
        const activeIndex = swiper.activeIndex;
        if (swiper.params.grid && swiper.params.grid.rows > 1) {
            const activeColumn = activeIndex;
            const preloadColumns = [ activeColumn - amount ];
            preloadColumns.push(...Array.from({
                length: amount
            }).map(((_, i) => activeColumn + slidesPerView + i)));
            swiper.slides.forEach(((slideEl, i) => {
                if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
            }));
            return;
        }
        const slideIndexLastInView = activeIndex + slidesPerView - 1;
        if (swiper.params.rewind || swiper.params.loop) for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
            const realIndex = (i % len + len) % len;
            if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
        } else for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) unlazy(swiper, i);
    };
    function getActiveIndexByTranslate(swiper) {
        const {slidesGrid, params} = swiper;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        let activeIndex;
        for (let i = 0; i < slidesGrid.length; i += 1) if (typeof slidesGrid[i + 1] !== "undefined") {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) activeIndex = i; else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) activeIndex = i + 1;
        } else if (translate >= slidesGrid[i]) activeIndex = i;
        if (params.normalizeSlideIndex) if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
        return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
        const swiper = this;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        const {snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex} = swiper;
        let activeIndex = newActiveIndex;
        let snapIndex;
        const getVirtualRealIndex = aIndex => {
            let realIndex = aIndex - swiper.virtual.slidesBefore;
            if (realIndex < 0) realIndex = swiper.virtual.slides.length + realIndex;
            if (realIndex >= swiper.virtual.slides.length) realIndex -= swiper.virtual.slides.length;
            return realIndex;
        };
        if (typeof activeIndex === "undefined") activeIndex = getActiveIndexByTranslate(swiper);
        if (snapGrid.indexOf(translate) >= 0) snapIndex = snapGrid.indexOf(translate); else {
            const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
            snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
        }
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        if (activeIndex === previousIndex && !swiper.params.loop) {
            if (snapIndex !== previousSnapIndex) {
                swiper.snapIndex = snapIndex;
                swiper.emit("snapIndexChange");
            }
            return;
        }
        if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
            swiper.realIndex = getVirtualRealIndex(activeIndex);
            return;
        }
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        let realIndex;
        if (swiper.virtual && params.virtual.enabled && params.loop) realIndex = getVirtualRealIndex(activeIndex); else if (gridEnabled) {
            const firstSlideInColumn = swiper.slides.filter((slideEl => slideEl.column === activeIndex))[0];
            let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
            if (Number.isNaN(activeSlideIndex)) activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
            realIndex = Math.floor(activeSlideIndex / params.grid.rows);
        } else if (swiper.slides[activeIndex]) {
            const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
            if (slideIndex) realIndex = parseInt(slideIndex, 10); else realIndex = activeIndex;
        } else realIndex = activeIndex;
        Object.assign(swiper, {
            previousSnapIndex,
            snapIndex,
            previousRealIndex,
            realIndex,
            previousIndex,
            activeIndex
        });
        if (swiper.initialized) preload(swiper);
        swiper.emit("activeIndexChange");
        swiper.emit("snapIndexChange");
        if (swiper.initialized || swiper.params.runCallbacksOnInit) {
            if (previousRealIndex !== realIndex) swiper.emit("realIndexChange");
            swiper.emit("slideChange");
        }
    }
    function updateClickedSlide(el, path) {
        const swiper = this;
        const params = swiper.params;
        let slide = el.closest(`.${params.slideClass}, swiper-slide`);
        if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) [ ...path.slice(path.indexOf(el) + 1, path.length) ].forEach((pathEl => {
            if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) slide = pathEl;
        }));
        let slideFound = false;
        let slideIndex;
        if (slide) for (let i = 0; i < swiper.slides.length; i += 1) if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
        }
        if (slide && slideFound) {
            swiper.clickedSlide = slide;
            if (swiper.virtual && swiper.params.virtual.enabled) swiper.clickedIndex = parseInt(slide.getAttribute("data-swiper-slide-index"), 10); else swiper.clickedIndex = slideIndex;
        } else {
            swiper.clickedSlide = void 0;
            swiper.clickedIndex = void 0;
            return;
        }
        if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) swiper.slideToClickedSlide();
    }
    var update = {
        updateSize,
        updateSlides,
        updateAutoHeight,
        updateSlidesOffset,
        updateSlidesProgress,
        updateProgress,
        updateSlidesClasses,
        updateActiveIndex,
        updateClickedSlide
    };
    function getSwiperTranslate(axis) {
        if (axis === void 0) axis = this.isHorizontal() ? "x" : "y";
        const swiper = this;
        const {params, rtlTranslate: rtl, translate, wrapperEl} = swiper;
        if (params.virtualTranslate) return rtl ? -translate : translate;
        if (params.cssMode) return translate;
        let currentTranslate = utils_getTranslate(wrapperEl, axis);
        currentTranslate += swiper.cssOverflowAdjustment();
        if (rtl) currentTranslate = -currentTranslate;
        return currentTranslate || 0;
    }
    function setTranslate(translate, byController) {
        const swiper = this;
        const {rtlTranslate: rtl, params, wrapperEl, progress} = swiper;
        let x = 0;
        let y = 0;
        const z = 0;
        if (swiper.isHorizontal()) x = rtl ? -translate : translate; else y = translate;
        if (params.roundLengths) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        swiper.previousTranslate = swiper.translate;
        swiper.translate = swiper.isHorizontal() ? x : y;
        if (params.cssMode) wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y; else if (!params.virtualTranslate) {
            if (swiper.isHorizontal()) x -= swiper.cssOverflowAdjustment(); else y -= swiper.cssOverflowAdjustment();
            wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        }
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== progress) swiper.updateProgress(translate);
        swiper.emit("setTranslate", swiper.translate, byController);
    }
    function minTranslate() {
        return -this.snapGrid[0];
    }
    function maxTranslate() {
        return -this.snapGrid[this.snapGrid.length - 1];
    }
    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
        if (translate === void 0) translate = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (translateBounds === void 0) translateBounds = true;
        const swiper = this;
        const {params, wrapperEl} = swiper;
        if (swiper.animating && params.preventInteractionOnTransition) return false;
        const minTranslate = swiper.minTranslate();
        const maxTranslate = swiper.maxTranslate();
        let newTranslate;
        if (translateBounds && translate > minTranslate) newTranslate = minTranslate; else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate; else newTranslate = translate;
        swiper.updateProgress(newTranslate);
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            if (speed === 0) wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate; else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: -newTranslate,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: -newTranslate,
                    behavior: "smooth"
                });
            }
            return true;
        }
        if (speed === 0) {
            swiper.setTransition(0);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionEnd");
            }
        } else {
            swiper.setTransition(speed);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionStart");
            }
            if (!swiper.animating) {
                swiper.animating = true;
                if (!swiper.onTranslateToWrapperTransitionEnd) swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed) return;
                    if (e.target !== this) return;
                    swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
                    swiper.onTranslateToWrapperTransitionEnd = null;
                    delete swiper.onTranslateToWrapperTransitionEnd;
                    swiper.animating = false;
                    if (runCallbacks) swiper.emit("transitionEnd");
                };
                swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
            }
        }
        return true;
    }
    var translate = {
        getTranslate: getSwiperTranslate,
        setTranslate,
        minTranslate,
        maxTranslate,
        translateTo
    };
    function setTransition(duration, byController) {
        const swiper = this;
        if (!swiper.params.cssMode) {
            swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
            swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
        }
        swiper.emit("setTransition", duration, byController);
    }
    function transitionEmit(_ref) {
        let {swiper, runCallbacks, direction, step} = _ref;
        const {activeIndex, previousIndex} = swiper;
        let dir = direction;
        if (!dir) if (activeIndex > previousIndex) dir = "next"; else if (activeIndex < previousIndex) dir = "prev"; else dir = "reset";
        swiper.emit(`transition${step}`);
        if (runCallbacks && activeIndex !== previousIndex) {
            if (dir === "reset") {
                swiper.emit(`slideResetTransition${step}`);
                return;
            }
            swiper.emit(`slideChangeTransition${step}`);
            if (dir === "next") swiper.emit(`slideNextTransition${step}`); else swiper.emit(`slidePrevTransition${step}`);
        }
    }
    function transitionStart(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        if (params.cssMode) return;
        if (params.autoHeight) swiper.updateAutoHeight();
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "Start"
        });
    }
    function transitionEnd(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        swiper.animating = false;
        if (params.cssMode) return;
        swiper.setTransition(0);
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "End"
        });
    }
    var transition = {
        setTransition,
        transitionStart,
        transitionEnd
    };
    function slideTo(index, speed, runCallbacks, internal, initial) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") index = parseInt(index, 10);
        const swiper = this;
        let slideIndex = index;
        if (slideIndex < 0) slideIndex = 0;
        const {params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled} = swiper;
        if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) return false;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
        let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        const translate = -snapGrid[snapIndex];
        if (params.normalizeSlideIndex) for (let i = 0; i < slidesGrid.length; i += 1) {
            const normalizedTranslate = -Math.floor(translate * 100);
            const normalizedGrid = Math.floor(slidesGrid[i] * 100);
            const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
            if (typeof slidesGrid[i + 1] !== "undefined") {
                if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) slideIndex = i; else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) slideIndex = i + 1;
            } else if (normalizedTranslate >= normalizedGrid) slideIndex = i;
        }
        if (swiper.initialized && slideIndex !== activeIndex) {
            if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) return false;
            if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) if ((activeIndex || 0) !== slideIndex) return false;
        }
        if (slideIndex !== (previousIndex || 0) && runCallbacks) swiper.emit("beforeSlideChangeStart");
        swiper.updateProgress(translate);
        let direction;
        if (slideIndex > activeIndex) direction = "next"; else if (slideIndex < activeIndex) direction = "prev"; else direction = "reset";
        if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
            swiper.updateActiveIndex(slideIndex);
            if (params.autoHeight) swiper.updateAutoHeight();
            swiper.updateSlidesClasses();
            if (params.effect !== "slide") swiper.setTranslate(translate);
            if (direction !== "reset") {
                swiper.transitionStart(runCallbacks, direction);
                swiper.transitionEnd(runCallbacks, direction);
            }
            return false;
        }
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            const t = rtl ? translate : -translate;
            if (speed === 0) {
                const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
                if (isVirtual) {
                    swiper.wrapperEl.style.scrollSnapType = "none";
                    swiper._immediateVirtual = true;
                }
                if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
                    swiper._cssModeVirtualInitialSet = true;
                    requestAnimationFrame((() => {
                        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                    }));
                } else wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                if (isVirtual) requestAnimationFrame((() => {
                    swiper.wrapperEl.style.scrollSnapType = "";
                    swiper._immediateVirtual = false;
                }));
            } else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: t,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: t,
                    behavior: "smooth"
                });
            }
            return true;
        }
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (speed === 0) swiper.transitionEnd(runCallbacks, direction); else if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onSlideToWrapperTransitionEnd) swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                if (!swiper || swiper.destroyed) return;
                if (e.target !== this) return;
                swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
                swiper.onSlideToWrapperTransitionEnd = null;
                delete swiper.onSlideToWrapperTransitionEnd;
                swiper.transitionEnd(runCallbacks, direction);
            };
            swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        }
        return true;
    }
    function slideToLoop(index, speed, runCallbacks, internal) {
        if (index === void 0) index = 0;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") {
            const indexAsNumber = parseInt(index, 10);
            index = indexAsNumber;
        }
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
        let newIndex = index;
        if (swiper.params.loop) if (swiper.virtual && swiper.params.virtual.enabled) newIndex += swiper.virtual.slidesBefore; else {
            let targetSlideIndex;
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                targetSlideIndex = swiper.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex))[0].column;
            } else targetSlideIndex = swiper.getSlideIndexByData(newIndex);
            const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
            const {centeredSlides} = swiper.params;
            let slidesPerView = swiper.params.slidesPerView;
            if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
                slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
                if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
            }
            let needLoopFix = cols - targetSlideIndex < slidesPerView;
            if (centeredSlides) needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
            if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) needLoopFix = false;
            if (needLoopFix) {
                const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
                swiper.loopFix({
                    direction,
                    slideTo: true,
                    activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
                    slideRealIndex: direction === "next" ? swiper.realIndex : void 0
                });
            }
            if (gridEnabled) {
                const slideIndex = newIndex * swiper.params.grid.rows;
                newIndex = swiper.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex))[0].column;
            } else newIndex = swiper.getSlideIndexByData(newIndex);
        }
        requestAnimationFrame((() => {
            swiper.slideTo(newIndex, speed, runCallbacks, internal);
        }));
        return swiper;
    }
    function slideNext(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {enabled, params, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let perGroup = params.slidesPerGroup;
        if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
        const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "next"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
            if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
                requestAnimationFrame((() => {
                    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
                }));
                return true;
            }
        }
        if (params.rewind && swiper.isEnd) return swiper.slideTo(0, speed, runCallbacks, internal);
        return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }
    function slidePrev(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params, snapGrid, slidesGrid, rtlTranslate, enabled, animating} = swiper;
        if (!enabled || swiper.destroyed) return swiper;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "prev"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
        }
        const translate = rtlTranslate ? swiper.translate : -swiper.translate;
        function normalize(val) {
            if (val < 0) return -Math.floor(Math.abs(val));
            return Math.floor(val);
        }
        const normalizedTranslate = normalize(translate);
        const normalizedSnapGrid = snapGrid.map((val => normalize(val)));
        let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
        if (typeof prevSnap === "undefined" && params.cssMode) {
            let prevSnapIndex;
            snapGrid.forEach(((snap, snapIndex) => {
                if (normalizedTranslate >= snap) prevSnapIndex = snapIndex;
            }));
            if (typeof prevSnapIndex !== "undefined") prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
        let prevIndex = 0;
        if (typeof prevSnap !== "undefined") {
            prevIndex = slidesGrid.indexOf(prevSnap);
            if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
            if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
                prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
                prevIndex = Math.max(prevIndex, 0);
            }
        }
        if (params.rewind && swiper.isBeginning) {
            const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
            return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
        } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
            requestAnimationFrame((() => {
                swiper.slideTo(prevIndex, speed, runCallbacks, internal);
            }));
            return true;
        }
        return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }
    function slideReset(speed, runCallbacks, internal) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }
    function slideToClosest(speed, runCallbacks, internal, threshold) {
        if (runCallbacks === void 0) runCallbacks = true;
        if (threshold === void 0) threshold = .5;
        const swiper = this;
        if (swiper.destroyed) return;
        if (typeof speed === "undefined") speed = swiper.params.speed;
        let index = swiper.activeIndex;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
        const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        if (translate >= swiper.snapGrid[snapIndex]) {
            const currentSnap = swiper.snapGrid[snapIndex];
            const nextSnap = swiper.snapGrid[snapIndex + 1];
            if (translate - currentSnap > (nextSnap - currentSnap) * threshold) index += swiper.params.slidesPerGroup;
        } else {
            const prevSnap = swiper.snapGrid[snapIndex - 1];
            const currentSnap = swiper.snapGrid[snapIndex];
            if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) index -= swiper.params.slidesPerGroup;
        }
        index = Math.max(index, 0);
        index = Math.min(index, swiper.slidesGrid.length - 1);
        return swiper.slideTo(index, speed, runCallbacks, internal);
    }
    function slideToClickedSlide() {
        const swiper = this;
        if (swiper.destroyed) return;
        const {params, slidesEl} = swiper;
        const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
        let slideToIndex = swiper.clickedIndex;
        let realIndex;
        const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
        if (params.loop) {
            if (swiper.animating) return;
            realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
            if (params.centeredSlides) if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex); else if (slideToIndex > swiper.slides.length - slidesPerView) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex);
        } else swiper.slideTo(slideToIndex);
    }
    var slide = {
        slideTo,
        slideToLoop,
        slideNext,
        slidePrev,
        slideReset,
        slideToClosest,
        slideToClickedSlide
    };
    function loopCreate(slideRealIndex) {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        const initSlides = () => {
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            slides.forEach(((el, index) => {
                el.setAttribute("data-swiper-slide-index", index);
            }));
        };
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
        const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
        const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
        const addBlankSlides = amountOfSlides => {
            for (let i = 0; i < amountOfSlides; i += 1) {
                const slideEl = swiper.isElement ? utils_createElement("swiper-slide", [ params.slideBlankClass ]) : utils_createElement("div", [ params.slideClass, params.slideBlankClass ]);
                swiper.slidesEl.append(slideEl);
            }
        };
        if (shouldFillGroup) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else if (shouldFillGrid) {
            if (params.loopAddBlankSlides) {
                const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
                addBlankSlides(slidesToAdd);
                swiper.recalcSlides();
                swiper.updateSlides();
            } else showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
            initSlides();
        } else initSlides();
        swiper.loopFix({
            slideRealIndex,
            direction: params.centeredSlides ? void 0 : "next"
        });
    }
    function loopFix(_temp) {
        let {slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex, byController, byMousewheel} = _temp === void 0 ? {} : _temp;
        const swiper = this;
        if (!swiper.params.loop) return;
        swiper.emit("beforeLoopFix");
        const {slides, allowSlidePrev, allowSlideNext, slidesEl, params} = swiper;
        const {centeredSlides} = params;
        swiper.allowSlidePrev = true;
        swiper.allowSlideNext = true;
        if (swiper.virtual && params.virtual.enabled) {
            if (slideTo) if (!params.centeredSlides && swiper.snapIndex === 0) swiper.slideTo(swiper.virtual.slides.length, 0, false, true); else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true); else if (swiper.snapIndex === swiper.snapGrid.length - 1) swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
            swiper.allowSlidePrev = allowSlidePrev;
            swiper.allowSlideNext = allowSlideNext;
            swiper.emit("loopFix");
            return;
        }
        let slidesPerView = params.slidesPerView;
        if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic(); else {
            slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
            if (centeredSlides && slidesPerView % 2 === 0) slidesPerView += 1;
        }
        const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
        let loopedSlides = slidesPerGroup;
        if (loopedSlides % slidesPerGroup !== 0) loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
        loopedSlides += params.loopAdditionalSlides;
        swiper.loopedSlides = loopedSlides;
        const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
        if (slides.length < slidesPerView + loopedSlides) showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"); else if (gridEnabled && params.grid.fill === "row") showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
        const prependSlidesIndexes = [];
        const appendSlidesIndexes = [];
        let activeIndex = swiper.activeIndex;
        if (typeof activeSlideIndex === "undefined") activeSlideIndex = swiper.getSlideIndex(slides.filter((el => el.classList.contains(params.slideActiveClass)))[0]); else activeIndex = activeSlideIndex;
        const isNext = direction === "next" || !direction;
        const isPrev = direction === "prev" || !direction;
        let slidesPrepended = 0;
        let slidesAppended = 0;
        const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
        const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
        const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === "undefined" ? -slidesPerView / 2 + .5 : 0);
        if (activeColIndexWithShift < loopedSlides) {
            slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
            for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) {
                    const colIndexToPrepend = cols - index - 1;
                    for (let i = slides.length - 1; i >= 0; i -= 1) if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
                } else prependSlidesIndexes.push(cols - index - 1);
            }
        } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
            slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
            for (let i = 0; i < slidesAppended; i += 1) {
                const index = i - Math.floor(i / cols) * cols;
                if (gridEnabled) slides.forEach(((slide, slideIndex) => {
                    if (slide.column === index) appendSlidesIndexes.push(slideIndex);
                })); else appendSlidesIndexes.push(index);
            }
        }
        swiper.__preventObserver__ = true;
        requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
        if (isPrev) prependSlidesIndexes.forEach((index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.prepend(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        }));
        if (isNext) appendSlidesIndexes.forEach((index => {
            slides[index].swiperLoopMoveDOM = true;
            slidesEl.append(slides[index]);
            slides[index].swiperLoopMoveDOM = false;
        }));
        swiper.recalcSlides();
        if (params.slidesPerView === "auto") swiper.updateSlides(); else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) swiper.slides.forEach(((slide, slideIndex) => {
            swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
        }));
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        if (slideTo) if (prependSlidesIndexes.length > 0 && isPrev) {
            if (typeof slideRealIndex === "undefined") {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                    swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
                    if (setTranslate) {
                        swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                        swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                    }
                }
            } else if (setTranslate) {
                const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
                swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
                swiper.touchEventsData.currentTranslate = swiper.translate;
            }
        } else if (appendSlidesIndexes.length > 0 && isNext) if (typeof slideRealIndex === "undefined") {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                if (setTranslate) {
                    swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                    swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
                }
            }
        } else {
            const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
            swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.controller && swiper.controller.control && !byController) {
            const loopParams = {
                slideRealIndex,
                direction,
                setTranslate,
                activeSlideIndex,
                byController: true
            };
            if (Array.isArray(swiper.controller.control)) swiper.controller.control.forEach((c => {
                if (!c.destroyed && c.params.loop) c.loopFix({
                    ...loopParams,
                    slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
                });
            })); else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) swiper.controller.control.loopFix({
                ...loopParams,
                slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
            });
        }
        swiper.emit("loopFix");
    }
    function loopDestroy() {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        swiper.recalcSlides();
        const newSlidesOrder = [];
        swiper.slides.forEach((slideEl => {
            const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
            newSlidesOrder[index] = slideEl;
        }));
        swiper.slides.forEach((slideEl => {
            slideEl.removeAttribute("data-swiper-slide-index");
        }));
        newSlidesOrder.forEach((slideEl => {
            slidesEl.append(slideEl);
        }));
        swiper.recalcSlides();
        swiper.slideTo(swiper.realIndex, 0);
    }
    var loop = {
        loopCreate,
        loopFix,
        loopDestroy
    };
    function setGrabCursor(moving) {
        const swiper = this;
        if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        el.style.cursor = "move";
        el.style.cursor = moving ? "grabbing" : "grab";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    function unsetGrabCursor() {
        const swiper = this;
        if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    var grabCursor = {
        setGrabCursor,
        unsetGrabCursor
    };
    function closestElement(selector, base) {
        if (base === void 0) base = this;
        function __closestFrom(el) {
            if (!el || el === ssr_window_esm_getDocument() || el === ssr_window_esm_getWindow()) return null;
            if (el.assignedSlot) el = el.assignedSlot;
            const found = el.closest(selector);
            if (!found && !el.getRootNode) return null;
            return found || __closestFrom(el.getRootNode().host);
        }
        return __closestFrom(base);
    }
    function preventEdgeSwipe(swiper, event, startX) {
        const window = ssr_window_esm_getWindow();
        const {params} = swiper;
        const edgeSwipeDetection = params.edgeSwipeDetection;
        const edgeSwipeThreshold = params.edgeSwipeThreshold;
        if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
            if (edgeSwipeDetection === "prevent") {
                event.preventDefault();
                return true;
            }
            return false;
        }
        return true;
    }
    function onTouchStart(event) {
        const swiper = this;
        const document = ssr_window_esm_getDocument();
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        const data = swiper.touchEventsData;
        if (e.type === "pointerdown") {
            if (data.pointerId !== null && data.pointerId !== e.pointerId) return;
            data.pointerId = e.pointerId;
        } else if (e.type === "touchstart" && e.targetTouches.length === 1) data.touchId = e.targetTouches[0].identifier;
        if (e.type === "touchstart") {
            preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
            return;
        }
        const {params, touches, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (swiper.animating && params.preventInteractionOnTransition) return;
        if (!swiper.animating && params.cssMode && params.loop) swiper.loopFix();
        let targetEl = e.target;
        if (params.touchEventsTarget === "wrapper") if (!swiper.wrapperEl.contains(targetEl)) return;
        if ("which" in e && e.which === 3) return;
        if ("button" in e && e.button > 0) return;
        if (data.isTouched && data.isMoved) return;
        const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
        const eventPath = e.composedPath ? e.composedPath() : e.path;
        if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) targetEl = eventPath[0];
        const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
        const isTargetShadow = !!(e.target && e.target.shadowRoot);
        if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
            swiper.allowClick = true;
            return;
        }
        if (params.swipeHandler) if (!targetEl.closest(params.swipeHandler)) return;
        touches.currentX = e.pageX;
        touches.currentY = e.pageY;
        const startX = touches.currentX;
        const startY = touches.currentY;
        if (!preventEdgeSwipe(swiper, e, startX)) return;
        Object.assign(data, {
            isTouched: true,
            isMoved: false,
            allowTouchCallbacks: true,
            isScrolling: void 0,
            startMoving: void 0
        });
        touches.startX = startX;
        touches.startY = startY;
        data.touchStartTime = utils_now();
        swiper.allowClick = true;
        swiper.updateSize();
        swiper.swipeDirection = void 0;
        if (params.threshold > 0) data.allowThresholdMove = false;
        let preventDefault = true;
        if (targetEl.matches(data.focusableElements)) {
            preventDefault = false;
            if (targetEl.nodeName === "SELECT") data.isTouched = false;
        }
        if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl) document.activeElement.blur();
        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) e.preventDefault();
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) swiper.freeMode.onTouchStart();
        swiper.emit("touchStart", e);
    }
    function onTouchMove(event) {
        const document = ssr_window_esm_getDocument();
        const swiper = this;
        const data = swiper.touchEventsData;
        const {params, touches, rtlTranslate: rtl, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        if (e.type === "pointermove") {
            if (data.touchId !== null) return;
            const id = e.pointerId;
            if (id !== data.pointerId) return;
        }
        let targetTouch;
        if (e.type === "touchmove") {
            targetTouch = [ ...e.changedTouches ].filter((t => t.identifier === data.touchId))[0];
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        } else targetTouch = e;
        if (!data.isTouched) {
            if (data.startMoving && data.isScrolling) swiper.emit("touchMoveOpposite", e);
            return;
        }
        const pageX = targetTouch.pageX;
        const pageY = targetTouch.pageY;
        if (e.preventedByNestedSwiper) {
            touches.startX = pageX;
            touches.startY = pageY;
            return;
        }
        if (!swiper.allowTouchMove) {
            if (!e.target.matches(data.focusableElements)) swiper.allowClick = false;
            if (data.isTouched) {
                Object.assign(touches, {
                    startX: pageX,
                    startY: pageY,
                    currentX: pageX,
                    currentY: pageY
                });
                data.touchStartTime = utils_now();
            }
            return;
        }
        if (params.touchReleaseOnEdges && !params.loop) if (swiper.isVertical()) {
            if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
                data.isTouched = false;
                data.isMoved = false;
                return;
            }
        } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) return;
        if (document.activeElement) if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
            data.isMoved = true;
            swiper.allowClick = false;
            return;
        }
        if (data.allowTouchCallbacks) swiper.emit("touchMove", e);
        touches.previousX = touches.currentX;
        touches.previousY = touches.currentY;
        touches.currentX = pageX;
        touches.currentY = pageY;
        const diffX = touches.currentX - touches.startX;
        const diffY = touches.currentY - touches.startY;
        if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
        if (typeof data.isScrolling === "undefined") {
            let touchAngle;
            if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) data.isScrolling = false; else if (diffX * diffX + diffY * diffY >= 25) {
                touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
                data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
            }
        }
        if (data.isScrolling) swiper.emit("touchMoveOpposite", e);
        if (typeof data.startMoving === "undefined") if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) data.startMoving = true;
        if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
            data.isTouched = false;
            return;
        }
        if (!data.startMoving) return;
        swiper.allowClick = false;
        if (!params.cssMode && e.cancelable) e.preventDefault();
        if (params.touchMoveStopPropagation && !params.nested) e.stopPropagation();
        let diff = swiper.isHorizontal() ? diffX : diffY;
        let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
        if (params.oneWayMovement) {
            diff = Math.abs(diff) * (rtl ? 1 : -1);
            touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
        }
        touches.diff = diff;
        diff *= params.touchRatio;
        if (rtl) {
            diff = -diff;
            touchesDiff = -touchesDiff;
        }
        const prevTouchesDirection = swiper.touchesDirection;
        swiper.swipeDirection = diff > 0 ? "prev" : "next";
        swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
        const isLoop = swiper.params.loop && !params.cssMode;
        const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
        if (!data.isMoved) {
            if (isLoop && allowLoopFix) swiper.loopFix({
                direction: swiper.swipeDirection
            });
            data.startTranslate = swiper.getTranslate();
            swiper.setTransition(0);
            if (swiper.animating) {
                const evt = new window.CustomEvent("transitionend", {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        bySwiperTouchMove: true
                    }
                });
                swiper.wrapperEl.dispatchEvent(evt);
            }
            data.allowMomentumBounce = false;
            if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(true);
            swiper.emit("sliderFirstMove", e);
        }
        let loopFixed;
        (new Date).getTime();
        if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
            Object.assign(touches, {
                startX: pageX,
                startY: pageY,
                currentX: pageX,
                currentY: pageY,
                startTranslate: data.currentTranslate
            });
            data.loopSwapReset = true;
            data.startTranslate = data.currentTranslate;
            return;
        }
        swiper.emit("sliderMove", e);
        data.isMoved = true;
        data.currentTranslate = diff + data.startTranslate;
        let disableParentSwiper = true;
        let resistanceRatio = params.resistanceRatio;
        if (params.touchReleaseOnEdges) resistanceRatio = 0;
        if (diff > 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] : swiper.minTranslate())) swiper.loopFix({
                direction: "prev",
                setTranslate: true,
                activeSlideIndex: 0
            });
            if (data.currentTranslate > swiper.minTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
            }
        } else if (diff < 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] : swiper.maxTranslate())) swiper.loopFix({
                direction: "next",
                setTranslate: true,
                activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
            });
            if (data.currentTranslate < swiper.maxTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
            }
        }
        if (disableParentSwiper) e.preventedByNestedSwiper = true;
        if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && !swiper.allowSlideNext) data.currentTranslate = data.startTranslate;
        if (params.threshold > 0) if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
            if (!data.allowThresholdMove) {
                data.allowThresholdMove = true;
                touches.startX = touches.currentX;
                touches.startY = touches.currentY;
                data.currentTranslate = data.startTranslate;
                touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
                return;
            }
        } else {
            data.currentTranslate = data.startTranslate;
            return;
        }
        if (!params.followFinger || params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode) swiper.freeMode.onTouchMove();
        swiper.updateProgress(data.currentTranslate);
        swiper.setTranslate(data.currentTranslate);
    }
    function onTouchEnd(event) {
        const swiper = this;
        const data = swiper.touchEventsData;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        let targetTouch;
        const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
        if (!isTouchEvent) {
            if (data.touchId !== null) return;
            if (e.pointerId !== data.pointerId) return;
            targetTouch = e;
        } else {
            targetTouch = [ ...e.changedTouches ].filter((t => t.identifier === data.touchId))[0];
            if (!targetTouch || targetTouch.identifier !== data.touchId) return;
        }
        if ([ "pointercancel", "pointerout", "pointerleave", "contextmenu" ].includes(e.type)) {
            const proceed = [ "pointercancel", "contextmenu" ].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
            if (!proceed) return;
        }
        data.pointerId = null;
        data.touchId = null;
        const {params, touches, rtlTranslate: rtl, slidesGrid, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && e.pointerType === "mouse") return;
        if (data.allowTouchCallbacks) swiper.emit("touchEnd", e);
        data.allowTouchCallbacks = false;
        if (!data.isTouched) {
            if (data.isMoved && params.grabCursor) swiper.setGrabCursor(false);
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(false);
        const touchEndTime = utils_now();
        const timeDiff = touchEndTime - data.touchStartTime;
        if (swiper.allowClick) {
            const pathTree = e.path || e.composedPath && e.composedPath();
            swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
            swiper.emit("tap click", e);
            if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) swiper.emit("doubleTap doubleClick", e);
        }
        data.lastClickTime = utils_now();
        utils_nextTick((() => {
            if (!swiper.destroyed) swiper.allowClick = true;
        }));
        if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
            data.isTouched = false;
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        let currentPos;
        if (params.followFinger) currentPos = rtl ? swiper.translate : -swiper.translate; else currentPos = -data.currentTranslate;
        if (params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled) {
            swiper.freeMode.onTouchEnd({
                currentPos
            });
            return;
        }
        const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
        let stopIndex = 0;
        let groupSize = swiper.slidesSizesGrid[0];
        for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
            const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
            if (typeof slidesGrid[i + increment] !== "undefined") {
                if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
                    stopIndex = i;
                    groupSize = slidesGrid[i + increment] - slidesGrid[i];
                }
            } else if (swipeToLast || currentPos >= slidesGrid[i]) {
                stopIndex = i;
                groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
            }
        }
        let rewindFirstIndex = null;
        let rewindLastIndex = null;
        if (params.rewind) if (swiper.isBeginning) rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1; else if (swiper.isEnd) rewindFirstIndex = 0;
        const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
        const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (timeDiff > params.longSwipesMs) {
            if (!params.longSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (swiper.swipeDirection === "next") if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment); else swiper.slideTo(stopIndex);
            if (swiper.swipeDirection === "prev") if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + increment); else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) swiper.slideTo(rewindLastIndex); else swiper.slideTo(stopIndex);
        } else {
            if (!params.shortSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
            if (!isNavButtonTarget) {
                if (swiper.swipeDirection === "next") swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
                if (swiper.swipeDirection === "prev") swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
            } else if (e.target === swiper.navigation.nextEl) swiper.slideTo(stopIndex + increment); else swiper.slideTo(stopIndex);
        }
    }
    function onResize() {
        const swiper = this;
        const {params, el} = swiper;
        if (el && el.offsetWidth === 0) return;
        if (params.breakpoints) swiper.setBreakpoint();
        const {allowSlideNext, allowSlidePrev, snapGrid} = swiper;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateSlidesClasses();
        const isVirtualLoop = isVirtual && params.loop;
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) swiper.slideTo(swiper.slides.length - 1, 0, false, true); else if (swiper.params.loop && !isVirtual) swiper.slideToLoop(swiper.realIndex, 0, false, true); else swiper.slideTo(swiper.activeIndex, 0, false, true);
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            clearTimeout(swiper.autoplay.resizeTimeout);
            swiper.autoplay.resizeTimeout = setTimeout((() => {
                if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) swiper.autoplay.resume();
            }), 500);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
    }
    function onClick(e) {
        const swiper = this;
        if (!swiper.enabled) return;
        if (!swiper.allowClick) {
            if (swiper.params.preventClicks) e.preventDefault();
            if (swiper.params.preventClicksPropagation && swiper.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }
    function onScroll() {
        const swiper = this;
        const {wrapperEl, rtlTranslate, enabled} = swiper;
        if (!enabled) return;
        swiper.previousTranslate = swiper.translate;
        if (swiper.isHorizontal()) swiper.translate = -wrapperEl.scrollLeft; else swiper.translate = -wrapperEl.scrollTop;
        if (swiper.translate === 0) swiper.translate = 0;
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== swiper.progress) swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
        swiper.emit("setTranslate", swiper.translate, false);
    }
    function onLoad(e) {
        const swiper = this;
        processLazyPreloader(swiper, e.target);
        if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) return;
        swiper.update();
    }
    function onDocumentTouchStart() {
        const swiper = this;
        if (swiper.documentTouchHandlerProceeded) return;
        swiper.documentTouchHandlerProceeded = true;
        if (swiper.params.touchReleaseOnEdges) swiper.el.style.touchAction = "auto";
    }
    const events = (swiper, method) => {
        const document = ssr_window_esm_getDocument();
        const {params, el, wrapperEl, device} = swiper;
        const capture = !!params.nested;
        const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
        const swiperMethod = method;
        document[domMethod]("touchstart", swiper.onDocumentTouchStart, {
            passive: false,
            capture
        });
        el[domMethod]("touchstart", swiper.onTouchStart, {
            passive: false
        });
        el[domMethod]("pointerdown", swiper.onTouchStart, {
            passive: false
        });
        document[domMethod]("touchmove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("pointermove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("touchend", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerup", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointercancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("touchcancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerout", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerleave", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("contextmenu", swiper.onTouchEnd, {
            passive: true
        });
        if (params.preventClicks || params.preventClicksPropagation) el[domMethod]("click", swiper.onClick, true);
        if (params.cssMode) wrapperEl[domMethod]("scroll", swiper.onScroll);
        if (params.updateOnWindowResize) swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true); else swiper[swiperMethod]("observerUpdate", onResize, true);
        el[domMethod]("load", swiper.onLoad, {
            capture: true
        });
    };
    function attachEvents() {
        const swiper = this;
        const {params} = swiper;
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
        swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
        if (params.cssMode) swiper.onScroll = onScroll.bind(swiper);
        swiper.onClick = onClick.bind(swiper);
        swiper.onLoad = onLoad.bind(swiper);
        events(swiper, "on");
    }
    function detachEvents() {
        const swiper = this;
        events(swiper, "off");
    }
    var events$1 = {
        attachEvents,
        detachEvents
    };
    const isGridEnabled = (swiper, params) => swiper.grid && params.grid && params.grid.rows > 1;
    function setBreakpoint() {
        const swiper = this;
        const {realIndex, initialized, params, el} = swiper;
        const breakpoints = params.breakpoints;
        if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
        const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
        if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : void 0;
        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = isGridEnabled(swiper, params);
        const isMultiRow = isGridEnabled(swiper, breakpointParams);
        const wasGrabCursor = swiper.params.grabCursor;
        const isGrabCursor = breakpointParams.grabCursor;
        const wasEnabled = params.enabled;
        if (wasMultiRow && !isMultiRow) {
            el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        } else if (!wasMultiRow && isMultiRow) {
            el.classList.add(`${params.containerModifierClass}grid`);
            if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") el.classList.add(`${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        }
        if (wasGrabCursor && !isGrabCursor) swiper.unsetGrabCursor(); else if (!wasGrabCursor && isGrabCursor) swiper.setGrabCursor();
        [ "navigation", "pagination", "scrollbar" ].forEach((prop => {
            if (typeof breakpointParams[prop] === "undefined") return;
            const wasModuleEnabled = params[prop] && params[prop].enabled;
            const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
            if (wasModuleEnabled && !isModuleEnabled) swiper[prop].disable();
            if (!wasModuleEnabled && isModuleEnabled) swiper[prop].enable();
        }));
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
        const wasLoop = params.loop;
        if (directionChanged && initialized) swiper.changeDirection();
        utils_extend(swiper.params, breakpointParams);
        const isEnabled = swiper.params.enabled;
        const hasLoop = swiper.params.loop;
        Object.assign(swiper, {
            allowTouchMove: swiper.params.allowTouchMove,
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev
        });
        if (wasEnabled && !isEnabled) swiper.disable(); else if (!wasEnabled && isEnabled) swiper.enable();
        swiper.currentBreakpoint = breakpoint;
        swiper.emit("_beforeBreakpoint", breakpointParams);
        if (initialized) if (needsReLoop) {
            swiper.loopDestroy();
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (!wasLoop && hasLoop) {
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (wasLoop && !hasLoop) swiper.loopDestroy();
        swiper.emit("breakpoint", breakpointParams);
    }
    function getBreakpoint(breakpoints, base, containerEl) {
        if (base === void 0) base = "window";
        if (!breakpoints || base === "container" && !containerEl) return;
        let breakpoint = false;
        const window = ssr_window_esm_getWindow();
        const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
        const points = Object.keys(breakpoints).map((point => {
            if (typeof point === "string" && point.indexOf("@") === 0) {
                const minRatio = parseFloat(point.substr(1));
                const value = currentHeight * minRatio;
                return {
                    value,
                    point
                };
            }
            return {
                value: point,
                point
            };
        }));
        points.sort(((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10)));
        for (let i = 0; i < points.length; i += 1) {
            const {point, value} = points[i];
            if (base === "window") {
                if (window.matchMedia(`(min-width: ${value}px)`).matches) breakpoint = point;
            } else if (value <= containerEl.clientWidth) breakpoint = point;
        }
        return breakpoint || "max";
    }
    var breakpoints = {
        setBreakpoint,
        getBreakpoint
    };
    function prepareClasses(entries, prefix) {
        const resultClasses = [];
        entries.forEach((item => {
            if (typeof item === "object") Object.keys(item).forEach((classNames => {
                if (item[classNames]) resultClasses.push(prefix + classNames);
            })); else if (typeof item === "string") resultClasses.push(prefix + item);
        }));
        return resultClasses;
    }
    function addClasses() {
        const swiper = this;
        const {classNames, params, rtl, el, device} = swiper;
        const suffixes = prepareClasses([ "initialized", params.direction, {
            "free-mode": swiper.params.freeMode && params.freeMode.enabled
        }, {
            autoheight: params.autoHeight
        }, {
            rtl
        }, {
            grid: params.grid && params.grid.rows > 1
        }, {
            "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
        }, {
            android: device.android
        }, {
            ios: device.ios
        }, {
            "css-mode": params.cssMode
        }, {
            centered: params.cssMode && params.centeredSlides
        }, {
            "watch-progress": params.watchSlidesProgress
        } ], params.containerModifierClass);
        classNames.push(...suffixes);
        el.classList.add(...classNames);
        swiper.emitContainerClasses();
    }
    function swiper_core_removeClasses() {
        const swiper = this;
        const {el, classNames} = swiper;
        el.classList.remove(...classNames);
        swiper.emitContainerClasses();
    }
    var classes = {
        addClasses,
        removeClasses: swiper_core_removeClasses
    };
    function checkOverflow() {
        const swiper = this;
        const {isLocked: wasLocked, params} = swiper;
        const {slidesOffsetBefore} = params;
        if (slidesOffsetBefore) {
            const lastSlideIndex = swiper.slides.length - 1;
            const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
            swiper.isLocked = swiper.size > lastSlideRightEdge;
        } else swiper.isLocked = swiper.snapGrid.length === 1;
        if (params.allowSlideNext === true) swiper.allowSlideNext = !swiper.isLocked;
        if (params.allowSlidePrev === true) swiper.allowSlidePrev = !swiper.isLocked;
        if (wasLocked && wasLocked !== swiper.isLocked) swiper.isEnd = false;
        if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? "lock" : "unlock");
    }
    var checkOverflow$1 = {
        checkOverflow
    };
    var defaults = {
        init: true,
        direction: "horizontal",
        oneWayMovement: false,
        swiperElementNodeName: "SWIPER-CONTAINER",
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: false,
        updateOnWindowResize: true,
        resizeObserver: true,
        nested: false,
        createElements: false,
        eventsPrefix: "swiper",
        enabled: true,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: false,
        userAgent: null,
        url: null,
        edgeSwipeDetection: false,
        edgeSwipeThreshold: 20,
        autoHeight: false,
        setWrapperSize: false,
        virtualTranslate: false,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: true,
        centerInsufficientSlides: false,
        watchOverflow: true,
        roundLengths: false,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: true,
        allowTouchMove: true,
        threshold: 5,
        touchMoveStopPropagation: false,
        touchStartPreventDefault: true,
        touchStartForcePreventDefault: false,
        touchReleaseOnEdges: false,
        uniqueNavElements: true,
        resistance: true,
        resistanceRatio: .85,
        watchSlidesProgress: false,
        grabCursor: false,
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        loop: false,
        loopAddBlankSlides: true,
        loopAdditionalSlides: 0,
        loopPreventsSliding: true,
        rewind: false,
        allowSlidePrev: true,
        allowSlideNext: true,
        swipeHandler: null,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: true,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideBlankClass: "swiper-slide-blank",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideFullyVisibleClass: "swiper-slide-fully-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: true,
        _emitClasses: false
    };
    function moduleExtendParams(params, allModulesParams) {
        return function extendParams(obj) {
            if (obj === void 0) obj = {};
            const moduleParamName = Object.keys(obj)[0];
            const moduleParams = obj[moduleParamName];
            if (typeof moduleParams !== "object" || moduleParams === null) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (params[moduleParamName] === true) params[moduleParamName] = {
                enabled: true
            };
            if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) params[moduleParamName].auto = true;
            if ([ "pagination", "scrollbar" ].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) params[moduleParamName].auto = true;
            if (!(moduleParamName in params && "enabled" in moduleParams)) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) params[moduleParamName].enabled = true;
            if (!params[moduleParamName]) params[moduleParamName] = {
                enabled: false
            };
            utils_extend(allModulesParams, obj);
        };
    }
    const prototypes = {
        eventsEmitter,
        update,
        translate,
        transition,
        slide,
        loop,
        grabCursor,
        events: events$1,
        breakpoints,
        checkOverflow: checkOverflow$1,
        classes
    };
    const extendedDefaults = {};
    class swiper_core_Swiper {
        constructor() {
            let el;
            let params;
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") params = args[0]; else [el, params] = args;
            if (!params) params = {};
            params = utils_extend({}, params);
            if (el && !params.el) params.el = el;
            const document = ssr_window_esm_getDocument();
            if (params.el && typeof params.el === "string" && document.querySelectorAll(params.el).length > 1) {
                const swipers = [];
                document.querySelectorAll(params.el).forEach((containerEl => {
                    const newParams = utils_extend({}, params, {
                        el: containerEl
                    });
                    swipers.push(new swiper_core_Swiper(newParams));
                }));
                return swipers;
            }
            const swiper = this;
            swiper.__swiper__ = true;
            swiper.support = getSupport();
            swiper.device = getDevice({
                userAgent: params.userAgent
            });
            swiper.browser = getBrowser();
            swiper.eventsListeners = {};
            swiper.eventsAnyListeners = [];
            swiper.modules = [ ...swiper.__modules__ ];
            if (params.modules && Array.isArray(params.modules)) swiper.modules.push(...params.modules);
            const allModulesParams = {};
            swiper.modules.forEach((mod => {
                mod({
                    params,
                    swiper,
                    extendParams: moduleExtendParams(params, allModulesParams),
                    on: swiper.on.bind(swiper),
                    once: swiper.once.bind(swiper),
                    off: swiper.off.bind(swiper),
                    emit: swiper.emit.bind(swiper)
                });
            }));
            const swiperParams = utils_extend({}, defaults, allModulesParams);
            swiper.params = utils_extend({}, swiperParams, extendedDefaults, params);
            swiper.originalParams = utils_extend({}, swiper.params);
            swiper.passedParams = utils_extend({}, params);
            if (swiper.params && swiper.params.on) Object.keys(swiper.params.on).forEach((eventName => {
                swiper.on(eventName, swiper.params.on[eventName]);
            }));
            if (swiper.params && swiper.params.onAny) swiper.onAny(swiper.params.onAny);
            Object.assign(swiper, {
                enabled: swiper.params.enabled,
                el,
                classNames: [],
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                isHorizontal() {
                    return swiper.params.direction === "horizontal";
                },
                isVertical() {
                    return swiper.params.direction === "vertical";
                },
                activeIndex: 0,
                realIndex: 0,
                isBeginning: true,
                isEnd: false,
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: false,
                cssOverflowAdjustment() {
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                allowSlideNext: swiper.params.allowSlideNext,
                allowSlidePrev: swiper.params.allowSlidePrev,
                touchEventsData: {
                    isTouched: void 0,
                    isMoved: void 0,
                    allowTouchCallbacks: void 0,
                    touchStartTime: void 0,
                    isScrolling: void 0,
                    currentTranslate: void 0,
                    startTranslate: void 0,
                    allowThresholdMove: void 0,
                    focusableElements: swiper.params.focusableElements,
                    lastClickTime: 0,
                    clickTimeout: void 0,
                    velocities: [],
                    allowMomentumBounce: void 0,
                    startMoving: void 0,
                    pointerId: null,
                    touchId: null
                },
                allowClick: true,
                allowTouchMove: swiper.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0
                },
                imagesToLoad: [],
                imagesLoaded: 0
            });
            swiper.emit("_swiper");
            if (swiper.params.init) swiper.init();
            return swiper;
        }
        getDirectionLabel(property) {
            if (this.isHorizontal()) return property;
            return {
                width: "height",
                "margin-top": "margin-left",
                "margin-bottom ": "margin-right",
                "margin-left": "margin-top",
                "margin-right": "margin-bottom",
                "padding-left": "padding-top",
                "padding-right": "padding-bottom",
                marginRight: "marginBottom"
            }[property];
        }
        getSlideIndex(slideEl) {
            const {slidesEl, params} = this;
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            const firstSlideIndex = utils_elementIndex(slides[0]);
            return utils_elementIndex(slideEl) - firstSlideIndex;
        }
        getSlideIndexByData(index) {
            return this.getSlideIndex(this.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === index))[0]);
        }
        recalcSlides() {
            const swiper = this;
            const {slidesEl, params} = swiper;
            swiper.slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        }
        enable() {
            const swiper = this;
            if (swiper.enabled) return;
            swiper.enabled = true;
            if (swiper.params.grabCursor) swiper.setGrabCursor();
            swiper.emit("enable");
        }
        disable() {
            const swiper = this;
            if (!swiper.enabled) return;
            swiper.enabled = false;
            if (swiper.params.grabCursor) swiper.unsetGrabCursor();
            swiper.emit("disable");
        }
        setProgress(progress, speed) {
            const swiper = this;
            progress = Math.min(Math.max(progress, 0), 1);
            const min = swiper.minTranslate();
            const max = swiper.maxTranslate();
            const current = (max - min) * progress + min;
            swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        emitContainerClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const cls = swiper.el.className.split(" ").filter((className => className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0));
            swiper.emit("_containerClasses", cls.join(" "));
        }
        getSlideClasses(slideEl) {
            const swiper = this;
            if (swiper.destroyed) return "";
            return slideEl.className.split(" ").filter((className => className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0)).join(" ");
        }
        emitSlidesClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const updates = [];
            swiper.slides.forEach((slideEl => {
                const classNames = swiper.getSlideClasses(slideEl);
                updates.push({
                    slideEl,
                    classNames
                });
                swiper.emit("_slideClass", slideEl, classNames);
            }));
            swiper.emit("_slideClasses", updates);
        }
        slidesPerViewDynamic(view, exact) {
            if (view === void 0) view = "current";
            if (exact === void 0) exact = false;
            const swiper = this;
            const {params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex} = swiper;
            let spv = 1;
            if (typeof params.slidesPerView === "number") return params.slidesPerView;
            if (params.centeredSlides) {
                let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
                let breakLoop;
                for (let i = activeIndex + 1; i < slides.length; i += 1) if (slides[i] && !breakLoop) {
                    slideSize += Math.ceil(slides[i].swiperSlideSize);
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
                for (let i = activeIndex - 1; i >= 0; i -= 1) if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize;
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
            } else if (view === "current") for (let i = activeIndex + 1; i < slides.length; i += 1) {
                const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                if (slideInView) spv += 1;
            } else for (let i = activeIndex - 1; i >= 0; i -= 1) {
                const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                if (slideInView) spv += 1;
            }
            return spv;
        }
        update() {
            const swiper = this;
            if (!swiper || swiper.destroyed) return;
            const {snapGrid, params} = swiper;
            if (params.breakpoints) swiper.setBreakpoint();
            [ ...swiper.el.querySelectorAll('[loading="lazy"]') ].forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl);
            }));
            swiper.updateSize();
            swiper.updateSlides();
            swiper.updateProgress();
            swiper.updateSlidesClasses();
            function setTranslate() {
                const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
                const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
                swiper.setTranslate(newTranslate);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            let translated;
            if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
                setTranslate();
                if (params.autoHeight) swiper.updateAutoHeight();
            } else {
                if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
                    const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
                    translated = swiper.slideTo(slides.length - 1, 0, false, true);
                } else translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
                if (!translated) setTranslate();
            }
            if (params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
            swiper.emit("update");
        }
        changeDirection(newDirection, needUpdate) {
            if (needUpdate === void 0) needUpdate = true;
            const swiper = this;
            const currentDirection = swiper.params.direction;
            if (!newDirection) newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
            if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") return swiper;
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
            swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
            swiper.emitContainerClasses();
            swiper.params.direction = newDirection;
            swiper.slides.forEach((slideEl => {
                if (newDirection === "vertical") slideEl.style.width = ""; else slideEl.style.height = "";
            }));
            swiper.emit("changeDirection");
            if (needUpdate) swiper.update();
            return swiper;
        }
        changeLanguageDirection(direction) {
            const swiper = this;
            if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
            swiper.rtl = direction === "rtl";
            swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
            if (swiper.rtl) {
                swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "rtl";
            } else {
                swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "ltr";
            }
            swiper.update();
        }
        mount(element) {
            const swiper = this;
            if (swiper.mounted) return true;
            let el = element || swiper.params.el;
            if (typeof el === "string") el = document.querySelector(el);
            if (!el) return false;
            el.swiper = swiper;
            if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) swiper.isElement = true;
            const getWrapperSelector = () => `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
            const getWrapper = () => {
                if (el && el.shadowRoot && el.shadowRoot.querySelector) {
                    const res = el.shadowRoot.querySelector(getWrapperSelector());
                    return res;
                }
                return utils_elementChildren(el, getWrapperSelector())[0];
            };
            let wrapperEl = getWrapper();
            if (!wrapperEl && swiper.params.createElements) {
                wrapperEl = utils_createElement("div", swiper.params.wrapperClass);
                el.append(wrapperEl);
                utils_elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl => {
                    wrapperEl.append(slideEl);
                }));
            }
            Object.assign(swiper, {
                el,
                wrapperEl,
                slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
                hostEl: swiper.isElement ? el.parentNode.host : el,
                mounted: true,
                rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
                rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
                wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
            });
            return true;
        }
        init(el) {
            const swiper = this;
            if (swiper.initialized) return swiper;
            const mounted = swiper.mount(el);
            if (mounted === false) return swiper;
            swiper.emit("beforeInit");
            if (swiper.params.breakpoints) swiper.setBreakpoint();
            swiper.addClasses();
            swiper.updateSize();
            swiper.updateSlides();
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            if (swiper.params.grabCursor && swiper.enabled) swiper.setGrabCursor();
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true); else swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
            if (swiper.params.loop) swiper.loopCreate();
            swiper.attachEvents();
            const lazyElements = [ ...swiper.el.querySelectorAll('[loading="lazy"]') ];
            if (swiper.isElement) lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            lazyElements.forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl); else imageEl.addEventListener("load", (e => {
                    processLazyPreloader(swiper, e.target);
                }));
            }));
            preload(swiper);
            swiper.initialized = true;
            preload(swiper);
            swiper.emit("init");
            swiper.emit("afterInit");
            return swiper;
        }
        destroy(deleteInstance, cleanStyles) {
            if (deleteInstance === void 0) deleteInstance = true;
            if (cleanStyles === void 0) cleanStyles = true;
            const swiper = this;
            const {params, el, wrapperEl, slides} = swiper;
            if (typeof swiper.params === "undefined" || swiper.destroyed) return null;
            swiper.emit("beforeDestroy");
            swiper.initialized = false;
            swiper.detachEvents();
            if (params.loop) swiper.loopDestroy();
            if (cleanStyles) {
                swiper.removeClasses();
                el.removeAttribute("style");
                wrapperEl.removeAttribute("style");
                if (slides && slides.length) slides.forEach((slideEl => {
                    slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                    slideEl.removeAttribute("style");
                    slideEl.removeAttribute("data-swiper-slide-index");
                }));
            }
            swiper.emit("destroy");
            Object.keys(swiper.eventsListeners).forEach((eventName => {
                swiper.off(eventName);
            }));
            if (deleteInstance !== false) {
                swiper.el.swiper = null;
                deleteProps(swiper);
            }
            swiper.destroyed = true;
            return null;
        }
        static extendDefaults(newDefaults) {
            utils_extend(extendedDefaults, newDefaults);
        }
        static get extendedDefaults() {
            return extendedDefaults;
        }
        static get defaults() {
            return defaults;
        }
        static installModule(mod) {
            if (!swiper_core_Swiper.prototype.__modules__) swiper_core_Swiper.prototype.__modules__ = [];
            const modules = swiper_core_Swiper.prototype.__modules__;
            if (typeof mod === "function" && modules.indexOf(mod) < 0) modules.push(mod);
        }
        static use(module) {
            if (Array.isArray(module)) {
                module.forEach((m => swiper_core_Swiper.installModule(m)));
                return swiper_core_Swiper;
            }
            swiper_core_Swiper.installModule(module);
            return swiper_core_Swiper;
        }
    }
    Object.keys(prototypes).forEach((prototypeGroup => {
        Object.keys(prototypes[prototypeGroup]).forEach((protoMethod => {
            swiper_core_Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
        }));
    }));
    swiper_core_Swiper.use([ Resize, Observer ]);
    function create_element_if_not_defined_createElementIfNotDefined(swiper, originalParams, params, checkProps) {
        if (swiper.params.createElements) Object.keys(checkProps).forEach((key => {
            if (!params[key] && params.auto === true) {
                let element = utils_elementChildren(swiper.el, `.${checkProps[key]}`)[0];
                if (!element) {
                    element = utils_createElement("div", checkProps[key]);
                    element.className = checkProps[key];
                    swiper.el.append(element);
                }
                params[key] = element;
                originalParams[key] = element;
            }
        }));
        return params;
    }
    function Navigation(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        extendParams({
            navigation: {
                nextEl: null,
                prevEl: null,
                hideOnClick: false,
                disabledClass: "swiper-button-disabled",
                hiddenClass: "swiper-button-hidden",
                lockClass: "swiper-button-lock",
                navigationDisabledClass: "swiper-navigation-disabled"
            }
        });
        swiper.navigation = {
            nextEl: null,
            prevEl: null
        };
        function getEl(el) {
            let res;
            if (el && typeof el === "string" && swiper.isElement) {
                res = swiper.el.querySelector(el);
                if (res) return res;
            }
            if (el) {
                if (typeof el === "string") res = [ ...document.querySelectorAll(el) ];
                if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) res = swiper.el.querySelector(el); else if (res && res.length === 1) res = res[0];
            }
            if (el && !res) return el;
            return res;
        }
        function toggleEl(el, disabled) {
            const params = swiper.params.navigation;
            el = utils_makeElementsArray(el);
            el.forEach((subEl => {
                if (subEl) {
                    subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
                    if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
                    if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
                }
            }));
        }
        function update() {
            const {nextEl, prevEl} = swiper.navigation;
            if (swiper.params.loop) {
                toggleEl(prevEl, false);
                toggleEl(nextEl, false);
                return;
            }
            toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
            toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
        }
        function onPrevClick(e) {
            e.preventDefault();
            if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slidePrev();
            emit("navigationPrev");
        }
        function onNextClick(e) {
            e.preventDefault();
            if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slideNext();
            emit("navigationNext");
        }
        function init() {
            const params = swiper.params.navigation;
            swiper.params.navigation = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
                nextEl: "swiper-button-next",
                prevEl: "swiper-button-prev"
            });
            if (!(params.nextEl || params.prevEl)) return;
            let nextEl = getEl(params.nextEl);
            let prevEl = getEl(params.prevEl);
            Object.assign(swiper.navigation, {
                nextEl,
                prevEl
            });
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const initButton = (el, dir) => {
                if (el) el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                if (!swiper.enabled && el) el.classList.add(...params.lockClass.split(" "));
            };
            nextEl.forEach((el => initButton(el, "next")));
            prevEl.forEach((el => initButton(el, "prev")));
        }
        function destroy() {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const destroyButton = (el, dir) => {
                el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
            };
            nextEl.forEach((el => destroyButton(el, "next")));
            prevEl.forEach((el => destroyButton(el, "prev")));
        }
        on("init", (() => {
            if (swiper.params.navigation.enabled === false) disable(); else {
                init();
                update();
            }
        }));
        on("toEdge fromEdge lock unlock", (() => {
            update();
        }));
        on("destroy", (() => {
            destroy();
        }));
        on("enable disable", (() => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            if (swiper.enabled) {
                update();
                return;
            }
            [ ...nextEl, ...prevEl ].filter((el => !!el)).forEach((el => el.classList.add(swiper.params.navigation.lockClass)));
        }));
        on("click", ((_s, e) => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = utils_makeElementsArray(nextEl);
            prevEl = utils_makeElementsArray(prevEl);
            const targetEl = e.target;
            if (swiper.params.navigation.hideOnClick && !prevEl.includes(targetEl) && !nextEl.includes(targetEl)) {
                if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
                let isHidden;
                if (nextEl.length) isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass); else if (prevEl.length) isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
                if (isHidden === true) emit("navigationShow"); else emit("navigationHide");
                [ ...nextEl, ...prevEl ].filter((el => !!el)).forEach((el => el.classList.toggle(swiper.params.navigation.hiddenClass)));
            }
        }));
        const enable = () => {
            swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
            init();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
            destroy();
        };
        Object.assign(swiper.navigation, {
            enable,
            disable,
            update,
            init,
            destroy
        });
    }
    function classes_to_selector_classesToSelector(classes) {
        if (classes === void 0) classes = "";
        return `.${classes.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
    }
    function Pagination(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const pfx = "swiper-pagination";
        extendParams({
            pagination: {
                el: null,
                bulletElement: "span",
                clickable: false,
                hideOnClick: false,
                renderBullet: null,
                renderProgressbar: null,
                renderFraction: null,
                renderCustom: null,
                progressbarOpposite: false,
                type: "bullets",
                dynamicBullets: false,
                dynamicMainBullets: 1,
                formatFractionCurrent: number => number,
                formatFractionTotal: number => number,
                bulletClass: `${pfx}-bullet`,
                bulletActiveClass: `${pfx}-bullet-active`,
                modifierClass: `${pfx}-`,
                currentClass: `${pfx}-current`,
                totalClass: `${pfx}-total`,
                hiddenClass: `${pfx}-hidden`,
                progressbarFillClass: `${pfx}-progressbar-fill`,
                progressbarOppositeClass: `${pfx}-progressbar-opposite`,
                clickableClass: `${pfx}-clickable`,
                lockClass: `${pfx}-lock`,
                horizontalClass: `${pfx}-horizontal`,
                verticalClass: `${pfx}-vertical`,
                paginationDisabledClass: `${pfx}-disabled`
            }
        });
        swiper.pagination = {
            el: null,
            bullets: []
        };
        let bulletSize;
        let dynamicBulletIndex = 0;
        function isPaginationDisabled() {
            return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
        }
        function setSideBullets(bulletEl, position) {
            const {bulletActiveClass} = swiper.params.pagination;
            if (!bulletEl) return;
            bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
            if (bulletEl) {
                bulletEl.classList.add(`${bulletActiveClass}-${position}`);
                bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
                if (bulletEl) bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
            }
        }
        function onBulletClick(e) {
            const bulletEl = e.target.closest(classes_to_selector_classesToSelector(swiper.params.pagination.bulletClass));
            if (!bulletEl) return;
            e.preventDefault();
            const index = utils_elementIndex(bulletEl) * swiper.params.slidesPerGroup;
            if (swiper.params.loop) {
                if (swiper.realIndex === index) return;
                swiper.slideToLoop(index);
            } else swiper.slideTo(index);
        }
        function update() {
            const rtl = swiper.rtl;
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            el = utils_makeElementsArray(el);
            let current;
            let previousIndex;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
            const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
            if (swiper.params.loop) {
                previousIndex = swiper.previousRealIndex || 0;
                current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
            } else if (typeof swiper.snapIndex !== "undefined") {
                current = swiper.snapIndex;
                previousIndex = swiper.previousSnapIndex;
            } else {
                previousIndex = swiper.previousIndex || 0;
                current = swiper.activeIndex || 0;
            }
            if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
                const bullets = swiper.pagination.bullets;
                let firstIndex;
                let lastIndex;
                let midIndex;
                if (params.dynamicBullets) {
                    bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height", true);
                    el.forEach((subEl => {
                        subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
                    }));
                    if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
                        dynamicBulletIndex += current - (previousIndex || 0);
                        if (dynamicBulletIndex > params.dynamicMainBullets - 1) dynamicBulletIndex = params.dynamicMainBullets - 1; else if (dynamicBulletIndex < 0) dynamicBulletIndex = 0;
                    }
                    firstIndex = Math.max(current - dynamicBulletIndex, 0);
                    lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
                    midIndex = (lastIndex + firstIndex) / 2;
                }
                bullets.forEach((bulletEl => {
                    const classesToRemove = [ ...[ "", "-next", "-next-next", "-prev", "-prev-prev", "-main" ].map((suffix => `${params.bulletActiveClass}${suffix}`)) ].map((s => typeof s === "string" && s.includes(" ") ? s.split(" ") : s)).flat();
                    bulletEl.classList.remove(...classesToRemove);
                }));
                if (el.length > 1) bullets.forEach((bullet => {
                    const bulletIndex = utils_elementIndex(bullet);
                    if (bulletIndex === current) bullet.classList.add(...params.bulletActiveClass.split(" ")); else if (swiper.isElement) bullet.setAttribute("part", "bullet");
                    if (params.dynamicBullets) {
                        if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        if (bulletIndex === firstIndex) setSideBullets(bullet, "prev");
                        if (bulletIndex === lastIndex) setSideBullets(bullet, "next");
                    }
                })); else {
                    const bullet = bullets[current];
                    if (bullet) bullet.classList.add(...params.bulletActiveClass.split(" "));
                    if (swiper.isElement) bullets.forEach(((bulletEl, bulletIndex) => {
                        bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
                    }));
                    if (params.dynamicBullets) {
                        const firstDisplayedBullet = bullets[firstIndex];
                        const lastDisplayedBullet = bullets[lastIndex];
                        for (let i = firstIndex; i <= lastIndex; i += 1) if (bullets[i]) bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        setSideBullets(firstDisplayedBullet, "prev");
                        setSideBullets(lastDisplayedBullet, "next");
                    }
                }
                if (params.dynamicBullets) {
                    const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
                    const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
                    const offsetProp = rtl ? "right" : "left";
                    bullets.forEach((bullet => {
                        bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
                    }));
                }
            }
            el.forEach(((subEl, subElIndex) => {
                if (params.type === "fraction") {
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.currentClass)).forEach((fractionEl => {
                        fractionEl.textContent = params.formatFractionCurrent(current + 1);
                    }));
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.totalClass)).forEach((totalEl => {
                        totalEl.textContent = params.formatFractionTotal(total);
                    }));
                }
                if (params.type === "progressbar") {
                    let progressbarDirection;
                    if (params.progressbarOpposite) progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal"; else progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
                    const scale = (current + 1) / total;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (progressbarDirection === "horizontal") scaleX = scale; else scaleY = scale;
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.progressbarFillClass)).forEach((progressEl => {
                        progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
                        progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
                    }));
                }
                if (params.type === "custom" && params.renderCustom) {
                    subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
                    if (subElIndex === 0) emit("paginationRender", subEl);
                } else {
                    if (subElIndex === 0) emit("paginationRender", subEl);
                    emit("paginationUpdate", subEl);
                }
                if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
            }));
        }
        function render() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
            let el = swiper.pagination.el;
            el = utils_makeElementsArray(el);
            let paginationHTML = "";
            if (params.type === "bullets") {
                let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
                if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) numberOfBullets = slidesLength;
                for (let i = 0; i < numberOfBullets; i += 1) if (params.renderBullet) paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass); else paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
            if (params.type === "fraction") if (params.renderFraction) paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass); else paginationHTML = `<span class="${params.currentClass}"></span>` + " / " + `<span class="${params.totalClass}"></span>`;
            if (params.type === "progressbar") if (params.renderProgressbar) paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass); else paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
            swiper.pagination.bullets = [];
            el.forEach((subEl => {
                if (params.type !== "custom") subEl.innerHTML = paginationHTML || "";
                if (params.type === "bullets") swiper.pagination.bullets.push(...subEl.querySelectorAll(classes_to_selector_classesToSelector(params.bulletClass)));
            }));
            if (params.type !== "custom") emit("paginationRender", el[0]);
        }
        function init() {
            swiper.params.pagination = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
                el: "swiper-pagination"
            });
            const params = swiper.params.pagination;
            if (!params.el) return;
            let el;
            if (typeof params.el === "string" && swiper.isElement) el = swiper.el.querySelector(params.el);
            if (!el && typeof params.el === "string") el = [ ...document.querySelectorAll(params.el) ];
            if (!el) el = params.el;
            if (!el || el.length === 0) return;
            if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
                el = [ ...swiper.el.querySelectorAll(params.el) ];
                if (el.length > 1) el = el.filter((subEl => {
                    if (utils_elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
                    return true;
                }))[0];
            }
            if (Array.isArray(el) && el.length === 1) el = el[0];
            Object.assign(swiper.pagination, {
                el
            });
            el = utils_makeElementsArray(el);
            el.forEach((subEl => {
                if (params.type === "bullets" && params.clickable) subEl.classList.add(...(params.clickableClass || "").split(" "));
                subEl.classList.add(params.modifierClass + params.type);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                if (params.type === "bullets" && params.dynamicBullets) {
                    subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
                    dynamicBulletIndex = 0;
                    if (params.dynamicMainBullets < 1) params.dynamicMainBullets = 1;
                }
                if (params.type === "progressbar" && params.progressbarOpposite) subEl.classList.add(params.progressbarOppositeClass);
                if (params.clickable) subEl.addEventListener("click", onBulletClick);
                if (!swiper.enabled) subEl.classList.add(params.lockClass);
            }));
        }
        function destroy() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => {
                    subEl.classList.remove(params.hiddenClass);
                    subEl.classList.remove(params.modifierClass + params.type);
                    subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                    if (params.clickable) {
                        subEl.classList.remove(...(params.clickableClass || "").split(" "));
                        subEl.removeEventListener("click", onBulletClick);
                    }
                }));
            }
            if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl => subEl.classList.remove(...params.bulletActiveClass.split(" "))));
        }
        on("changeDirection", (() => {
            if (!swiper.pagination || !swiper.pagination.el) return;
            const params = swiper.params.pagination;
            let {el} = swiper.pagination;
            el = utils_makeElementsArray(el);
            el.forEach((subEl => {
                subEl.classList.remove(params.horizontalClass, params.verticalClass);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            }));
        }));
        on("init", (() => {
            if (swiper.params.pagination.enabled === false) disable(); else {
                init();
                render();
                update();
            }
        }));
        on("activeIndexChange", (() => {
            if (typeof swiper.snapIndex === "undefined") update();
        }));
        on("snapIndexChange", (() => {
            update();
        }));
        on("snapGridLengthChange", (() => {
            render();
            update();
        }));
        on("destroy", (() => {
            destroy();
        }));
        on("enable disable", (() => {
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass)));
            }
        }));
        on("lock unlock", (() => {
            update();
        }));
        on("click", ((_s, e) => {
            const targetEl = e.target;
            const el = utils_makeElementsArray(swiper.pagination.el);
            if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
                if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
                const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
                if (isHidden === true) emit("paginationShow"); else emit("paginationHide");
                el.forEach((subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass)));
            }
        }));
        const enable = () => {
            swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass)));
            }
            init();
            render();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = utils_makeElementsArray(el);
                el.forEach((subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass)));
            }
            destroy();
        };
        Object.assign(swiper.pagination, {
            enable,
            disable,
            render,
            update,
            init,
            destroy
        });
    }
    function initSliders() {
        if (document.querySelector(".slider__slider")) new swiper_core_Swiper(".slider__slider", {
            modules: [ Navigation, Pagination ],
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 30,
            autoHeight: true,
            speed: 500,
            loop: true,
            autoplay: {
                delay: 12e3,
                disableOnInteraction: false
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
            navigation: {
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next"
            },
            on: {}
        });
    }
    window.addEventListener("load", (function(e) {
        initSliders();
    }));
    let addWindowScrollEvent = false;
    function pageNavigation() {
        document.addEventListener("click", pageNavigationAction);
        document.addEventListener("watcherCallback", pageNavigationAction);
        function pageNavigationAction(e) {
            if (e.type === "click") {
                const targetElement = e.target;
                if (targetElement.closest("[data-goto]")) {
                    const gotoLink = targetElement.closest("[data-goto]");
                    const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
                    const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
                    const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 500;
                    const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
                    if (flsModules.fullpage) {
                        const fullpageSectionId = +document.querySelector(`${gotoLinkSelector}[data-fp-section]`);
                        flsModules.fullpage.switchingSection(fullpageSectionId);
                    } else gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
                    e.preventDefault();
                }
            } else if (e.type === "watcherCallback" && e.detail) {
                const entry = e.detail.entry;
                const targetElement = entry.target;
                if (targetElement.dataset.watch === "navigator") {
                    document.querySelector(`[data-goto]._navigator-active`);
                    let navigatorCurrentItem;
                    if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`); else if (targetElement.classList.length) for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index];
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                            break;
                        }
                    }
                    if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null; else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
                }
            }
        }
        if (getHash()) {
            let goToHash;
            if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`; else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
            goToHash ? gotoBlock(goToHash, true, 500, 20) : null;
        }
    }
    function headerScroll() {
        addWindowScrollEvent = true;
        const header = document.querySelector("header.header");
        const headerShow = header.hasAttribute("data-scroll-show");
        const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
        const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
        let scrollDirection = 0;
        let timer;
        document.addEventListener("windowScroll", (function(e) {
            const scrollTop = window.scrollY;
            clearTimeout(timer);
            if (scrollTop >= startPoint) {
                !header.classList.contains("_header-scroll") ? header.classList.add("_header-scroll") : null;
                if (headerShow) {
                    if (scrollTop > scrollDirection) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null; else !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    timer = setTimeout((() => {
                        !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    }), headerShowTimer);
                }
            } else {
                header.classList.contains("_header-scroll") ? header.classList.remove("_header-scroll") : null;
                if (headerShow) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null;
            }
            scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
        }));
    }
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    function preloader() {
        window.addEventListener("load", (function() {
            document.body.classList.add("loaded_hiding");
            window.setTimeout((function() {
                document.body.classList.add("loaded");
                document.body.classList.remove("loaded_hiding");
            }), 500);
        }));
    }
    function counter() {
        var now = (new Date).getTime();
        var countDownDate = new Date(now + 6 * 60 * 60 * 1e3).getTime();
        var countdownFunction = setInterval((function() {
            var now = (new Date).getTime();
            var distance = countDownDate - now;
            var hours = Math.floor(distance % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
            var minutes = Math.floor(distance % (1e3 * 60 * 60) / (1e3 * 60));
            var seconds = Math.floor(distance % (1e3 * 60) / 1e3);
            document.getElementById("hours").innerHTML = hours;
            document.getElementById("minutes").innerHTML = minutes;
            document.getElementById("seconds").innerHTML = seconds;
            if (distance < 0) {
                clearInterval(countdownFunction);
                document.getElementById("timer").innerHTML = "EXPIRED";
            }
        }), 1e3);
    }
    window["FLS"] = false;
    isWebp();
    menuInit();
    formFieldsInit({
        viewPass: false,
        autoHeight: false
    });
    formSubmit();
    pageNavigation();
    headerScroll();
    preloader();
    counter();
})();