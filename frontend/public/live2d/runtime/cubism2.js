(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@pixi/math"), require("@pixi/utils"), require("@pixi/core"), require("@pixi/text"), require("@pixi/display"), require("@pixi/graphics"));
	else if(typeof define === 'function' && define.amd)
		define(["@pixi/math", "@pixi/utils", "@pixi/core", "@pixi/text", "@pixi/display", "@pixi/graphics"], factory);
	else if(typeof exports === 'object')
		exports["live2d"] = factory(require("@pixi/math"), require("@pixi/utils"), require("@pixi/core"), require("@pixi/text"), require("@pixi/display"), require("@pixi/graphics"));
	else
		root["PIXI"] = root["PIXI"] || {}, root["PIXI"]["live2d"] = factory(root["PIXI"], root["PIXI"]["utils"], root["PIXI"], root["PIXI"], root["PIXI"], root["PIXI"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__3__, __WEBPACK_EXTERNAL_MODULE__20__, __WEBPACK_EXTERNAL_MODULE__24__, __WEBPACK_EXTERNAL_MODULE__34__, __WEBPACK_EXTERNAL_MODULE__35__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 166);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "f", function() { return /* reexport */ log_logger; });
__webpack_require__.d(__webpack_exports__, "b", function() { return /* reexport */ clamp; });
__webpack_require__.d(__webpack_exports__, "g", function() { return /* reexport */ rand; });
__webpack_require__.d(__webpack_exports__, "d", function() { return /* reexport */ copyProperty; });
__webpack_require__.d(__webpack_exports__, "c", function() { return /* reexport */ copyArray; });
__webpack_require__.d(__webpack_exports__, "a", function() { return /* reexport */ applyMixins; });
__webpack_require__.d(__webpack_exports__, "e", function() { return /* reexport */ folderName; });

// EXTERNAL MODULE: ./src/config.ts
var config = __webpack_require__(1);

// CONCATENATED MODULE: ./src/utils/log.ts

/**
 * A simple tagged logger.
 *
 * You can replace the methods with your own ones.
 *
 * ```js
 * import { logger } from 'pixi-live2d-display';
 *
 * logger.log = (tag, ...messages) => {
 *     console.log(tag, 'says:', ...messages);
 * };
 * ```
 */
var log_logger;
(function (logger) {
    function log(tag, ...messages) {
        if (config["b" /* config */].logLevel <= config["b" /* config */].LOG_LEVEL_VERBOSE) {
            console.log(`[${tag}]`, ...messages);
        }
    }
    logger.log = log;
    function warn(tag, ...messages) {
        if (config["b" /* config */].logLevel <= config["b" /* config */].LOG_LEVEL_WARNING) {
            console.warn(`[${tag}]`, ...messages);
        }
    }
    logger.warn = warn;
    function error(tag, ...messages) {
        if (config["b" /* config */].logLevel <= config["b" /* config */].LOG_LEVEL_ERROR) {
            console.error(`[${tag}]`, ...messages);
        }
    }
    logger.error = error;
})(log_logger || (log_logger = {}));

// CONCATENATED MODULE: ./src/utils/math.ts
/**
 * These functions can be slightly faster than the ones in Lodash.
 * @packageDocumentation
 */
function clamp(num, lower, upper) {
    return num < lower ? lower : num > upper ? upper : num;
}
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// CONCATENATED MODULE: ./src/utils/obj.ts
/**
 * Copies a property at only if it matches the `type`.
 * @param type - Type expected to match `typeof` on the property.
 * @param from - Source object.
 * @param to - Destination object.
 * @param fromKey - Key of the property in source object.
 * @param toKey - Key of the property in destination object.
 */
// TODO: lint and fix the formatting!
function copyProperty(type, from, to, fromKey, toKey) {
    const value = from[fromKey];
    if (value !== null && typeof value === type) {
        // a type error will occur here, have no idea
        to[toKey] = value;
    }
}
/**
 * Copies an array at `key`, filtering the items that match the `type`.
 * @param type - Type expected to match `typeof` on the items.
 * @param from - Source object.
 * @param to - Destination object.
 * @param fromKey - Key of the array property in source object.
 * @param toKey - Key of the array property in destination object.
 */
function copyArray(type, from, to, fromKey, toKey) {
    const array = from[fromKey];
    if (Array.isArray(array)) {
        to[toKey] = array.filter(item => item !== null && typeof item === type);
    }
}
/**
 * @see {@link https://www.typescriptlang.org/docs/handbook/mixins.html}
 */
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
            }
        });
    });
}

// CONCATENATED MODULE: ./src/utils/string.ts
/**
 * Gets the name of parent folder in a url.
 * @param url - URL of a file.
 * @return Name of the parent folder, or the file itself if it has no parent folder.
 */
function folderName(url) {
    let lastSlashIndex = url.lastIndexOf('/');
    if (lastSlashIndex != -1) {
        url = url.slice(0, lastSlashIndex);
    }
    lastSlashIndex = url.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
        url = url.slice(lastSlashIndex + 1);
    }
    return url;
}

// CONCATENATED MODULE: ./src/utils/index.ts






/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return config; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return VERSION; });
/**
 * Global configs.
 */
var config;
(function (config) {
    config.LOG_LEVEL_VERBOSE = 0;
    config.LOG_LEVEL_WARNING = 1;
    config.LOG_LEVEL_ERROR = 2;
    config.LOG_LEVEL_NONE = 999;
    /**
     * Global log level.
     * @default {@link LOG_LEVEL_WARNING}
     */
    config.logLevel =  true ? config.LOG_LEVEL_WARNING : undefined;
    /**
     * Enabling sound for motions.
     */
    config.sound = true;
    /**
     * Deferring motion and corresponding sound until both are loaded.
     */
    config.motionSync = true;
    /**
     * Default fading duration for motions without such value specified.
     */
    config.motionFadingDuration = 500;
    /**
     * Default fading duration for idle motions without such value specified.
     */
    config.idleMotionFadingDuration = 2000;
    /**
     * Default fading duration for expressions without such value specified.
     */
    config.expressionFadingDuration = 500;
})(config || (config = {}));
/**
 * Consistent with the `version` in package.json.
 */
const VERSION = "0.3.1";


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Live2DLoader; });
/* harmony import */ var _factory_XHRLoader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18);
/* harmony import */ var _utils_middleware__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(19);


class Live2DLoader {
    /**
     * Loads a resource.
     * @return Promise that resolves with the loaded data in a format that's consistent with the specified `type`.
     */
    static load(context) {
        return Object(_utils_middleware__WEBPACK_IMPORTED_MODULE_1__[/* runMiddlewares */ "a"])(this.middlewares, context).then(() => context.result);
    }
}
Live2DLoader.middlewares = [_factory_XHRLoader__WEBPACK_IMPORTED_MODULE_0__[/* XHRLoader */ "a"].loader];


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "a", function() { return /* binding */ Live2DFactory_Live2DFactory; });

// EXTERNAL MODULE: ./src/cubism-common/index.ts
var cubism_common = __webpack_require__(6);

// EXTERNAL MODULE: ./src/factory/Live2DLoader.ts
var Live2DLoader = __webpack_require__(4);

// EXTERNAL MODULE: ./src/utils/index.ts + 4 modules
var utils = __webpack_require__(0);

// EXTERNAL MODULE: ./src/utils/middleware.ts
var middleware = __webpack_require__(19);

// EXTERNAL MODULE: external {"commonjs":"@pixi/core","commonjs2":"@pixi/core","amd":"@pixi/core","root":"PIXI"}
var core_root_PIXI_ = __webpack_require__(20);

// CONCATENATED MODULE: ./src/factory/texture.ts

function createTexture(url, options = {}) {
    var _a;
    const textureOptions = { resourceOptions: { crossorigin: options.crossOrigin } };
    // there's already such a method since Pixi v5.3.0
    if (core_root_PIXI_["Texture"].fromURL) {
        return core_root_PIXI_["Texture"].fromURL(url, textureOptions).catch(e => {
            if (e instanceof Error) {
                throw e;
            }
            // assume e is an ErrorEvent, let's convert it to an Error
            const err = new Error('Texture loading error');
            err.event = e;
            throw err;
        });
    }
    // and in order to provide backward compatibility for older Pixi versions,
    // we have to manually implement this method
    // see https://github.com/pixijs/pixi.js/pull/6687/files
    textureOptions.resourceOptions.autoLoad = false;
    const texture = core_root_PIXI_["Texture"].from(url, textureOptions);
    if (texture.baseTexture.valid) {
        return Promise.resolve(texture);
    }
    const resource = texture.baseTexture.resource;
    // before Pixi v5.2.2, the Promise will not be rejected when loading has failed,
    // we have to manually handle the "error" event
    // see https://github.com/pixijs/pixi.js/pull/6374
    (_a = resource._live2d_load) !== null && _a !== void 0 ? _a : (resource._live2d_load = new Promise((resolve, reject) => {
        const errorHandler = (event) => {
            resource.source.removeEventListener('error', errorHandler);
            // convert the ErrorEvent to an Error
            const err = new Error('Texture loading error');
            err.event = event;
            reject(err);
        };
        resource.source.addEventListener('error', errorHandler);
        resource.load().then(() => resolve(texture)).catch(errorHandler);
    }));
    return resource._live2d_load;
}

// CONCATENATED MODULE: ./src/factory/model-middlewares.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





const TAG = 'Live2DFactory';
/**
 * A middleware that converts the source from a URL to a settings JSON object.
 */
const urlToJSON = (context, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof context.source === 'string') {
        const data = yield Live2DLoader["a" /* Live2DLoader */].load({
            url: context.source,
            type: 'json',
            target: context.live2dModel,
        });
        data.url = context.source;
        context.source = data;
        context.live2dModel.emit('settingsJSONLoaded', data);
    }
    return next();
});
/**
 * A middleware that converts the source from a settings JSON object to a ModelSettings instance.
 */
const jsonToSettings = (context, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (context.source instanceof cubism_common["f" /* ModelSettings */]) {
        context.settings = context.source;
        return next();
    }
    else if (typeof context.source === 'object') {
        const runtime = Live2DFactory_Live2DFactory.findRuntime(context.source);
        if (runtime) {
            const settings = runtime.createModelSettings(context.source);
            context.settings = settings;
            context.live2dModel.emit('settingsLoaded', settings);
            return next();
        }
    }
    throw new TypeError('Unknown settings format.');
});
const waitUntilReady = (context, next) => {
    if (context.settings) {
        const runtime = Live2DFactory_Live2DFactory.findRuntime(context.settings);
        if (runtime) {
            return runtime.ready().then(next);
        }
    }
    return next();
};
/**
 * A middleware that populates the Live2DModel with optional resources.
 * Requires InternalModel in context when all the subsequent middlewares have finished.
 */
const setupOptionals = (context, next) => __awaiter(void 0, void 0, void 0, function* () {
    // wait until all has finished
    yield next();
    const internalModel = context.internalModel;
    if (internalModel) {
        const settings = context.settings;
        const runtime = Live2DFactory_Live2DFactory.findRuntime(settings);
        if (runtime) {
            const tasks = [];
            if (settings.pose) {
                tasks.push(Live2DLoader["a" /* Live2DLoader */].load({
                    settings,
                    url: settings.pose,
                    type: 'json',
                    target: internalModel,
                })
                    .then((data) => {
                    internalModel.pose = runtime.createPose(internalModel.coreModel, data);
                    context.live2dModel.emit('poseLoaded', internalModel.pose);
                })
                    .catch((e) => utils["f" /* logger */].warn(TAG, 'Failed to load pose.\n', e)));
            }
            if (settings.physics) {
                tasks.push(Live2DLoader["a" /* Live2DLoader */].load({
                    settings,
                    url: settings.physics,
                    type: 'json',
                    target: internalModel,
                })
                    .then((data) => {
                    internalModel.physics = runtime.createPhysics(internalModel.coreModel, data);
                    context.live2dModel.emit('physicsLoaded', internalModel.physics);
                })
                    .catch((e) => utils["f" /* logger */].warn(TAG, 'Failed to load physics.\n', e)));
            }
            if (tasks.length) {
                yield Promise.all(tasks);
            }
        }
    }
});
/**
 * A middleware that populates the Live2DModel with essential resources.
 * Requires ModelSettings in context immediately, and InternalModel in context
 * when all the subsequent middlewares have finished.
 */
const setupEssentials = (context, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (context.settings) {
        const live2DModel = context.live2dModel;
        const textureLoadings = context.settings.textures.map(tex => {
            const url = context.settings.resolveURL(tex);
            return createTexture(url, { crossOrigin: context.options.crossOrigin });
        });
        // wait for the internal model to be created
        yield next();
        if (context.internalModel) {
            live2DModel.internalModel = context.internalModel;
            live2DModel.emit('modelLoaded', context.internalModel);
        }
        else {
            throw new TypeError('Missing internal model.');
        }
        live2DModel.textures = yield Promise.all(textureLoadings);
        live2DModel.emit('textureLoaded', live2DModel.textures);
    }
    else {
        throw new TypeError('Missing settings.');
    }
});
/**
 * A middleware that creates the InternalModel. Requires ModelSettings in context.
 */
const createInternalModel = (context, next) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = context.settings;
    if (settings instanceof cubism_common["f" /* ModelSettings */]) {
        const runtime = Live2DFactory_Live2DFactory.findRuntime(settings);
        if (!runtime) {
            throw new TypeError('Unknown model settings.');
        }
        const modelData = yield Live2DLoader["a" /* Live2DLoader */].load({
            settings,
            url: settings.moc,
            type: 'arraybuffer',
            target: context.live2dModel,
        });
        if (!runtime.isValidMoc(modelData)) {
            throw new Error('Invalid moc data');
        }
        const coreModel = runtime.createCoreModel(modelData);
        context.internalModel = runtime.createInternalModel(coreModel, settings, context.options);
        return next();
    }
    throw new TypeError('Missing settings.');
});

// CONCATENATED MODULE: ./src/factory/Live2DFactory.ts
var Live2DFactory_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





/**
 * Handles all the network load tasks.
 *
 * - Model creation: requested by {@link Live2DModel.from}.
 * - Motion loading: implements the load method of MotionManager.
 * - Expression loading: implements the load method of ExpressionManager.
 */
class Live2DFactory_Live2DFactory {
    /**
     * Registers a Live2DRuntime.
     */
    static registerRuntime(runtime) {
        Live2DFactory_Live2DFactory.runtimes.push(runtime);
        // higher version as higher priority
        Live2DFactory_Live2DFactory.runtimes.sort((a, b) => b.version - a.version);
    }
    /**
     * Finds a runtime that matches given source.
     * @param source - Either a settings JSON object or a ModelSettings instance.
     * @return The Live2DRuntime, or undefined if not found.
     */
    static findRuntime(source) {
        for (const runtime of Live2DFactory_Live2DFactory.runtimes) {
            if (runtime.test(source)) {
                return runtime;
            }
        }
    }
    /**
     * Sets up a Live2DModel, populating it with all defined resources.
     * @param live2dModel - The Live2DModel instance.
     * @param source - Can be one of: settings file URL, settings JSON object, ModelSettings instance.
     * @param options - Options for the process.
     * @return Promise that resolves when all resources have been loaded, rejects when error occurs.
     */
    static setupLive2DModel(live2dModel, source, options) {
        return Live2DFactory_awaiter(this, void 0, void 0, function* () {
            const textureLoaded = new Promise(resolve => live2dModel.once('textureLoaded', resolve));
            const modelLoaded = new Promise(resolve => live2dModel.once('modelLoaded', resolve));
            // because the "ready" event is supposed to be emitted after
            // both the internal model and textures have been loaded,
            // we should here wrap the emit() in a then() so it'll
            // be executed after all the handlers of "modelLoaded" and "textureLoaded"
            const readyEventEmitted = Promise.all([textureLoaded, modelLoaded]).then(() => live2dModel.emit('ready'));
            yield Object(middleware["a" /* runMiddlewares */])(Live2DFactory_Live2DFactory.live2DModelMiddlewares, {
                live2dModel,
                source,
                options: options || {},
            });
            // the "load" event should never be emitted before "ready"
            yield readyEventEmitted;
            live2dModel.emit('load');
        });
    }
    /**
     * Loads a Motion and registers the task to {@link motionTasksMap}. The task will be automatically
     * canceled when its owner - the MotionManager instance - has been destroyed.
     * @param motionManager - MotionManager that owns this Motion.
     * @param group - The motion group.
     * @param index - Index in the motion group.
     * @return Promise that resolves with the Motion, or with undefined if it can't be loaded.
     */
    static loadMotion(motionManager, group, index) {
        var _a, _b;
        // errors in this method are always handled
        const handleError = (e) => motionManager.emit('motionLoadError', group, index, e);
        try {
            const definition = (_a = motionManager.definitions[group]) === null || _a === void 0 ? void 0 : _a[index];
            if (!definition) {
                return Promise.resolve(undefined);
            }
            if (!motionManager.listeners('destroy').includes(Live2DFactory_Live2DFactory.releaseTasks)) {
                motionManager.once('destroy', Live2DFactory_Live2DFactory.releaseTasks);
            }
            let tasks = Live2DFactory_Live2DFactory.motionTasksMap.get(motionManager);
            if (!tasks) {
                tasks = {};
                Live2DFactory_Live2DFactory.motionTasksMap.set(motionManager, tasks);
            }
            let taskGroup = tasks[group];
            if (!taskGroup) {
                taskGroup = [];
                tasks[group] = taskGroup;
            }
            const path = motionManager.getMotionFile(definition);
            (_b = taskGroup[index]) !== null && _b !== void 0 ? _b : (taskGroup[index] = Live2DLoader["a" /* Live2DLoader */].load({
                url: path,
                settings: motionManager.settings,
                type: motionManager.motionDataType,
                target: motionManager,
            })
                .then(data => {
                var _a;
                const taskGroup = (_a = Live2DFactory_Live2DFactory.motionTasksMap.get(motionManager)) === null || _a === void 0 ? void 0 : _a[group];
                if (taskGroup) {
                    delete taskGroup[index];
                }
                const motion = motionManager.createMotion(data, group, definition);
                motionManager.emit('motionLoaded', group, index, motion);
                return motion;
            })
                .catch(e => {
                utils["f" /* logger */].warn(motionManager.tag, `Failed to load motion: ${path}\n`, e);
                handleError(e);
            }));
            return taskGroup[index];
        }
        catch (e) {
            utils["f" /* logger */].warn(motionManager.tag, `Failed to load motion at "${group}"[${index}]\n`, e);
            handleError(e);
        }
        return Promise.resolve(undefined);
    }
    /**
     * Loads an Expression and registers the task to {@link expressionTasksMap}. The task will be automatically
     * canceled when its owner - the ExpressionManager instance - has been destroyed.
     * @param expressionManager - ExpressionManager that owns this Expression.
     * @param index - Index of the Expression.
     * @return Promise that resolves with the Expression, or with undefined if it can't be loaded.
     */
    static loadExpression(expressionManager, index) {
        var _a;
        // errors in this method are always handled
        const handleError = (e) => expressionManager.emit('expressionLoadError', index, e);
        try {
            const definition = expressionManager.definitions[index];
            if (!definition) {
                return Promise.resolve(undefined);
            }
            if (!expressionManager.listeners('destroy').includes(Live2DFactory_Live2DFactory.releaseTasks)) {
                expressionManager.once('destroy', Live2DFactory_Live2DFactory.releaseTasks);
            }
            let tasks = Live2DFactory_Live2DFactory.expressionTasksMap.get(expressionManager);
            if (!tasks) {
                tasks = [];
                Live2DFactory_Live2DFactory.expressionTasksMap.set(expressionManager, tasks);
            }
            const path = expressionManager.getExpressionFile(definition);
            (_a = tasks[index]) !== null && _a !== void 0 ? _a : (tasks[index] = Live2DLoader["a" /* Live2DLoader */].load({
                url: path,
                settings: expressionManager.settings,
                type: 'json',
                target: expressionManager,
            })
                .then(data => {
                const tasks = Live2DFactory_Live2DFactory.expressionTasksMap.get(expressionManager);
                if (tasks) {
                    delete tasks[index];
                }
                const expression = expressionManager.createExpression(data, definition);
                expressionManager.emit('expressionLoaded', index, expression);
                return expression;
            })
                .catch(e => {
                utils["f" /* logger */].warn(expressionManager.tag, `Failed to load expression: ${path}\n`, e);
                handleError(e);
            }));
            return tasks[index];
        }
        catch (e) {
            utils["f" /* logger */].warn(expressionManager.tag, `Failed to load expression at [${index}]\n`, e);
            handleError(e);
        }
        return Promise.resolve(undefined);
    }
    static releaseTasks() {
        if (this instanceof cubism_common["g" /* MotionManager */]) {
            Live2DFactory_Live2DFactory.motionTasksMap.delete(this);
        }
        else {
            Live2DFactory_Live2DFactory.expressionTasksMap.delete(this);
        }
    }
}
/**
 * All registered runtimes, sorted by versions in descending order.
 */
Live2DFactory_Live2DFactory.runtimes = [];
Live2DFactory_Live2DFactory.urlToJSON = urlToJSON;
Live2DFactory_Live2DFactory.jsonToSettings = jsonToSettings;
Live2DFactory_Live2DFactory.waitUntilReady = waitUntilReady;
Live2DFactory_Live2DFactory.setupOptionals = setupOptionals;
Live2DFactory_Live2DFactory.setupEssentials = setupEssentials;
Live2DFactory_Live2DFactory.createInternalModel = createInternalModel;
/**
 * Middlewares to run through when setting up a Live2DModel.
 */
Live2DFactory_Live2DFactory.live2DModelMiddlewares = [
    urlToJSON, jsonToSettings, waitUntilReady, setupOptionals, setupEssentials, createInternalModel,
];
/**
 * load tasks of each motion. The structure of each value in this map
 * is the same as respective {@link MotionManager.definitions}.
 */
Live2DFactory_Live2DFactory.motionTasksMap = new WeakMap();
/**
 * Load tasks of each expression.
 */
Live2DFactory_Live2DFactory.expressionTasksMap = new WeakMap();
cubism_common["g" /* MotionManager */].prototype._loadMotion = function (group, index) {
    return Live2DFactory_Live2DFactory.loadMotion(this, group, index);
};
cubism_common["a" /* ExpressionManager */].prototype._loadExpression = function (index) {
    return Live2DFactory_Live2DFactory.loadExpression(this, index);
};


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "d", function() { return _constants__WEBPACK_IMPORTED_MODULE_0__["a"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "e", function() { return _constants__WEBPACK_IMPORTED_MODULE_0__["b"]; });

/* harmony import */ var _ExpressionManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "a", function() { return _ExpressionManager__WEBPACK_IMPORTED_MODULE_1__["a"]; });

/* harmony import */ var _FocusController__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(17);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "b", function() { return _FocusController__WEBPACK_IMPORTED_MODULE_2__["a"]; });

/* harmony import */ var _ModelSettings__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(14);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "f", function() { return _ModelSettings__WEBPACK_IMPORTED_MODULE_3__["a"]; });

/* harmony import */ var _MotionState__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "i", function() { return _MotionState__WEBPACK_IMPORTED_MODULE_4__["a"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "j", function() { return _MotionState__WEBPACK_IMPORTED_MODULE_4__["b"]; });

/* harmony import */ var _MotionManager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(15);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "g", function() { return _MotionManager__WEBPACK_IMPORTED_MODULE_5__["a"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "h", function() { return _MotionManager__WEBPACK_IMPORTED_MODULE_5__["b"]; });

/* harmony import */ var _SoundManager__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(7);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "k", function() { return _SoundManager__WEBPACK_IMPORTED_MODULE_6__["a"]; });

/* harmony import */ var _InternalModel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(16);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "c", function() { return _InternalModel__WEBPACK_IMPORTED_MODULE_7__["a"]; });











/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SoundManager; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33);
/* harmony import */ var lodash_pull__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_pull__WEBPACK_IMPORTED_MODULE_1__);


const TAG = 'SoundManager';
const VOLUME = 0.5;
/**
 * Manages all the sounds.
 */
class SoundManager {
    /**
     * Global volume that applies to all the sounds.
     */
    static get volume() {
        return this._volume;
    }
    static set volume(value) {
        this._volume = (value > 1 ? 1 : value < 0 ? 0 : value) || 0;
        this.audios.forEach(audio => (audio.volume = this._volume));
    }
    // TODO: return an ID?
    /**
     * Creates an audio element and adds it to the {@link audios}.
     * @param file - URL of the sound file.
     * @param onFinish - Callback invoked when the playback has finished.
     * @param onError - Callback invoked when error occurs.
     * @return Created audio element.
     */
    static add(file, onFinish, onError) {
        const audio = new Audio(file);
        audio.volume = this._volume;
        audio.preload = 'auto';
        audio.addEventListener('ended', () => {
            this.dispose(audio);
            onFinish === null || onFinish === void 0 ? void 0 : onFinish();
        });
        audio.addEventListener('error', (e) => {
            this.dispose(audio);
            _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].warn(TAG, `Error occurred on "${file}"`, e.error);
            onError === null || onError === void 0 ? void 0 : onError(e.error);
        });
        this.audios.push(audio);
        return audio;
    }
    /**
     * Plays the sound.
     * @param audio - An audio element.
     * @return Promise that resolves when the audio is ready to play, rejects when error occurs.
     */
    static play(audio) {
        return new Promise((resolve, reject) => {
            var _a;
            // see https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
            (_a = audio.play()) === null || _a === void 0 ? void 0 : _a.catch(e => {
                audio.dispatchEvent(new ErrorEvent('error', { error: e }));
                reject(e);
            });
            if (audio.readyState === audio.HAVE_ENOUGH_DATA) {
                resolve();
            }
            else {
                audio.addEventListener('canplaythrough', resolve);
            }
        });
    }
    /**
     * Disposes an audio element and removes it from {@link audios}.
     * @param audio - An audio element.
     */
    static dispose(audio) {
        audio.pause();
        audio.removeAttribute('src');
        lodash_pull__WEBPACK_IMPORTED_MODULE_1___default()(this.audios, audio);
    }
    /**
     * Destroys all managed audios.
     */
    static destroy() {
        // dispose() removes given audio from the array, so the loop must be backward
        for (let i = this.audios.length - 1; i >= 0; i--) {
            this.dispose(this.audios[i]);
        }
    }
}
/**
 * Audio elements playing or pending to play. Finished audios will be removed automatically.
 */
SoundManager.audios = [];
SoundManager._volume = VOLUME;


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return LOGICAL_WIDTH; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LOGICAL_HEIGHT; });
const LOGICAL_WIDTH = 2;
const LOGICAL_HEIGHT = 2;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(38);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MotionPriority; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return MotionState; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

/**
 * Indicates the motion priority.
 */
var MotionPriority;
(function (MotionPriority) {
    /** States that the model is currently not playing any motion. This priority cannot be applied to a motion. */
    MotionPriority[MotionPriority["NONE"] = 0] = "NONE";
    /** Low priority, used when starting idle motions automatically. */
    MotionPriority[MotionPriority["IDLE"] = 1] = "IDLE";
    /** Medium priority. */
    MotionPriority[MotionPriority["NORMAL"] = 2] = "NORMAL";
    /** High priority. Motions as this priority will always be played regardless of the current priority. */
    MotionPriority[MotionPriority["FORCE"] = 3] = "FORCE";
})(MotionPriority || (MotionPriority = {}));
/**
 * Handles the state of a MotionManager.
 */
class MotionState {
    constructor() {
        /**
         * When enabled, the states will be dumped to the logger when an exception occurs.
         */
        this.debug = false;
        /**
         * Priority of the current motion. Will be `MotionPriority.NONE` if there's no playing motion.
         */
        this.currentPriority = MotionPriority.NONE;
        /**
         * Priority of the reserved motion, which is still in loading and will be played once loaded.
         * Will be `MotionPriority.NONE` if there's no reserved motion.
         */
        this.reservePriority = MotionPriority.NONE;
    }
    /**
     * Reserves the playback for a motion.
     * @param group - The motion group.
     * @param index - Index in the motion group.
     * @param priority - The priority to be applied.
     * @return True if the reserving has succeeded.
     */
    reserve(group, index, priority) {
        if (priority <= MotionPriority.NONE) {
            _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, `Cannot start a motion with MotionPriority.NONE.`);
            return false;
        }
        if (group === this.currentGroup && index === this.currentIndex) {
            _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, `Motion is already playing.`, this.dump(group, index));
            return false;
        }
        if ((group === this.reservedGroup && index === this.reservedIndex) || (group === this.reservedIdleGroup && index === this.reservedIdleIndex)) {
            _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, `Motion is already reserved.`, this.dump(group, index));
            return false;
        }
        if (priority === MotionPriority.IDLE) {
            if (this.currentPriority !== MotionPriority.NONE) {
                _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, `Cannot start idle motion because another motion is playing.`, this.dump(group, index));
                return false;
            }
            if (this.reservedIdleGroup !== undefined) {
                _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, `Cannot start idle motion because another idle motion has reserved.`, this.dump(group, index));
                return false;
            }
            this.setReservedIdle(group, index);
        }
        else {
            if (priority < MotionPriority.FORCE) {
                if (priority <= this.currentPriority) {
                    _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, 'Cannot start motion because another motion is playing as an equivalent or higher priority.', this.dump(group, index));
                    return false;
                }
                if (priority <= this.reservePriority) {
                    _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, 'Cannot start motion because another motion has reserved as an equivalent or higher priority.', this.dump(group, index));
                    return false;
                }
            }
            this.setReserved(group, index, priority);
        }
        return true;
    }
    /**
     * Requests the playback for a motion.
     * @param motion - The Motion, can be undefined.
     * @param group - The motion group.
     * @param index - Index in the motion group.
     * @param priority - The priority to be applied.
     * @return True if the request has been approved, i.e. the motion is allowed to play.
     */
    start(motion, group, index, priority) {
        if (priority === MotionPriority.IDLE) {
            this.setReservedIdle(undefined, undefined);
            if (this.currentPriority !== MotionPriority.NONE) {
                _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, 'Cannot start idle motion because another motion is playing.', this.dump(group, index));
                return false;
            }
        }
        else {
            if (group !== this.reservedGroup || index !== this.reservedIndex) {
                _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].log(this.tag, 'Cannot start motion because another motion has taken the place.', this.dump(group, index));
                return false;
            }
            this.setReserved(undefined, undefined, MotionPriority.NONE);
        }
        if (!motion) {
            return false;
        }
        this.setCurrent(group, index, priority);
        return true;
    }
    /**
     * Notifies the motion playback has finished.
     */
    complete() {
        this.setCurrent(undefined, undefined, MotionPriority.NONE);
    }
    /**
     * Sets the current motion.
     */
    setCurrent(group, index, priority) {
        this.currentPriority = priority;
        this.currentGroup = group;
        this.currentIndex = index;
    }
    /**
     * Sets the reserved motion.
     */
    setReserved(group, index, priority) {
        this.reservePriority = priority;
        this.reservedGroup = group;
        this.reservedIndex = index;
    }
    /**
     * Sets the reserved idle motion.
     */
    setReservedIdle(group, index) {
        this.reservedIdleGroup = group;
        this.reservedIdleIndex = index;
    }
    /**
     * Checks if a Motion is currently playing or has reserved.
     * @return True if active.
     */
    isActive(group, index) {
        return (group === this.currentGroup && index === this.currentIndex)
            || (group === this.reservedGroup && index === this.reservedIndex)
            || (group === this.reservedIdleGroup && index === this.reservedIdleIndex);
    }
    /**
     * Resets the state.
     */
    reset() {
        this.setCurrent(undefined, undefined, MotionPriority.NONE);
        // make sure the reserved motions (if existing) won't start when they are loaded
        this.setReserved(undefined, undefined, MotionPriority.NONE);
        this.setReservedIdle(undefined, undefined);
    }
    /**
     * Checks if an idle motion should be requests to play.
     */
    shouldRequestIdleMotion() {
        return this.currentGroup === undefined && this.reservedIdleGroup === undefined;
    }
    /**
     * Checks if the model's expression should be overridden by the motion.
     */
    shouldOverrideExpression() {
        return this.currentPriority > MotionPriority.IDLE;
    }
    /**
     * Dumps the state for debugging.
     */
    dump(requestedGroup, requestedIndex) {
        if (this.debug) {
            const keys = [
                'currentPriority',
                'reservePriority',
                'currentGroup',
                'currentIndex',
                'reservedGroup',
                'reservedIndex',
                'reservedIdleGroup',
                'reservedIdleIndex',
            ];
            return `\n<Requested> group = "${requestedGroup}", index = ${requestedIndex}\n` + keys.map(key => '[' + key + '] ' + this[key]).join('\n');
        }
        return '';
    }
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(54),
    getValue = __webpack_require__(60);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),
/* 12 */,
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ExpressionManager; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_pixi_utils__WEBPACK_IMPORTED_MODULE_1__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * Abstract expression manager.
 * @emits {@link ExpressionManagerEvents}
 */
class ExpressionManager extends _pixi_utils__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"] {
    constructor(settings, options) {
        super();
        /**
         * The Expressions. The structure is the same as {@link definitions}, initially there's only
         * an empty array, which means all expressions will be `undefined`. When an Expression has
         * been loaded, it'll fill the place in which it should be; when it fails to load,
         * the place will be filled with `null`.
         */
        this.expressions = [];
        /**
         * The pending Expression.
         */
        this.reserveExpressionIndex = -1;
        /**
         * Flags the instance has been destroyed.
         */
        this.destroyed = false;
        this.settings = settings;
        this.tag = `ExpressionManager(${settings.name})`;
    }
    /**
     * Should be called in the constructor of derived class.
     */
    init() {
        this.defaultExpression = this.createExpression({}, undefined);
        this.currentExpression = this.defaultExpression;
        this.stopAllExpressions();
    }
    /**
     * Loads an Expression. Errors in this method will not be thrown,
     * but be emitted with an "expressionLoadError" event.
     * @param index - Index of the expression in definitions.
     * @return Promise that resolves with the Expression, or with undefined if it can't be loaded.
     * @emits {@link ExpressionManagerEvents.expressionLoaded}
     * @emits {@link ExpressionManagerEvents.expressionLoadError}
     */
    loadExpression(index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.definitions[index]) {
                _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].warn(this.tag, `Undefined expression at [${index}]`);
                return undefined;
            }
            if (this.expressions[index] === null) {
                _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].warn(this.tag, `Cannot set expression at [${index}] because it's already failed in loading.`);
                return undefined;
            }
            if (this.expressions[index]) {
                return this.expressions[index];
            }
            const expression = yield this._loadExpression(index);
            this.expressions[index] = expression;
            return expression;
        });
    }
    /**
     * Loads the Expression. Will be implemented by Live2DFactory.
     * @ignore
     */
    _loadExpression(index) {
        throw new Error('Not implemented.');
    }
    /**
     * Sets a random Expression that differs from current one.
     * @return Promise that resolves with true if succeeded, with false otherwise.
     */
    setRandomExpression() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.definitions.length) {
                const availableIndices = [];
                for (let i = 0; i < this.definitions.length; i++) {
                    if (this.expressions[i] !== null
                        && this.expressions[i] !== this.currentExpression
                        && i !== this.reserveExpressionIndex) {
                        availableIndices.push(i);
                    }
                }
                if (availableIndices.length) {
                    const index = Math.floor(Math.random() * availableIndices.length);
                    return this.setExpression(index);
                }
            }
            return false;
        });
    }
    /**
     * Resets model's expression using {@link defaultExpression}.
     */
    resetExpression() {
        this._setExpression(this.defaultExpression);
    }
    /**
     * Restores model's expression to {@link currentExpression}.
     */
    restoreExpression() {
        this._setExpression(this.currentExpression);
    }
    /**
     * Sets an Expression.
     * @param index - Either the index, or the name of the expression.
     * @return Promise that resolves with true if succeeded, with false otherwise.
     */
    setExpression(index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof index !== 'number') {
                index = this.getExpressionIndex(index);
            }
            if (!(index > -1 && index < this.definitions.length)) {
                return false;
            }
            if (index === this.expressions.indexOf(this.currentExpression)) {
                return false;
            }
            this.reserveExpressionIndex = index;
            const expression = yield this.loadExpression(index);
            if (!expression || this.reserveExpressionIndex !== index) {
                return false;
            }
            this.reserveExpressionIndex = -1;
            this.currentExpression = expression;
            this._setExpression(expression);
            return true;
        });
    }
    /**
     * Updates parameters of the core model.
     * @return True if the parameters are actually updated.
     */
    update(model, now) {
        if (!this.isFinished()) {
            return this.updateParameters(model, now);
        }
        return false;
    }
    /**
     * Destroys the instance.
     * @emits {@link ExpressionManagerEvents.destroy}
     */
    destroy() {
        this.destroyed = true;
        this.emit('destroy');
        const self = this;
        self.definitions = undefined;
        self.expressions = undefined;
    }
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ModelSettings; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_pixi_utils__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Parses, and provides access to the settings JSON.
 */
class ModelSettings {
    /**
     * @param json - The settings JSON object.
     * @param json.url - The `url` field must be defined to specify the settings file's URL.
     */
    constructor(json) {
        this.json = json;
        let url = json.url;
        if (typeof url !== 'string') {
            // this is not allowed because it'll typically result in errors, including a
            // fatal error - an OOM that crashes the browser while initializing this cubism2 model,
            // I'm not kidding!
            throw new TypeError('The `url` field in settings JSON must be defined as a string.');
        }
        this.url = url;
        // set default name to folder's name
        this.name = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[/* folderName */ "e"])(this.url);
    }
    /**
     * Resolves a relative path using the {@link url}. This is used to resolve the resource files
     * defined in the settings.
     * @param path - Relative path.
     * @return Resolved path.
     */
    resolveURL(path) {
        return _pixi_utils__WEBPACK_IMPORTED_MODULE_1__["url"].resolve(this.url, path);
    }
    /**
     * Replaces the resource files by running each file through the `replacer`.
     * @param replacer - Invoked with two arguments: `(file, path)`, where `file` is the file definition,
     * and `path` is its property path in the ModelSettings instance. A string must be returned to be the replacement.
     *
     * ```js
     * modelSettings.replaceFiles((file, path) => {
     *     // file = "foo.moc", path = "moc"
     *     // file = "foo.png", path = "textures[0]"
     *     // file = "foo.mtn", path = "motions.idle[0].file"
     *     // file = "foo.motion3.json", path = "motions.idle[0].File"
     *
     *     return "bar/" + file;
     * });
     * ```
     */
    replaceFiles(replacer) {
        this.moc = replacer(this.moc, 'moc');
        if (this.pose !== undefined) {
            (this.pose = replacer(this.pose, 'pose'));
        }
        if (this.physics !== undefined) {
            (this.physics = replacer(this.physics, 'physics'));
        }
        for (let i = 0; i < this.textures.length; i++) {
            this.textures[i] = replacer(this.textures[i], `textures[${i}]`);
        }
    }
    ;
    /**
     * Retrieves all resource files defined in the settings.
     * @return A flat array of the paths of all resource files.
     *
     * ```js
     * modelSettings.getDefinedFiles();
     * // returns: ["foo.moc", "foo.png", ...]
     * ```
     */
    getDefinedFiles() {
        const files = [];
        this.replaceFiles((file) => {
            files.push(file);
            return file;
        });
        return files;
    }
    /**
     * Validates that the files defined in the settings exist in given files. Each file will be
     * resolved by {@link resolveURL} before comparison.
     * @param files - A flat array of file paths.
     * @return All the files which are defined in the settings and also exist in given files,
     * *including the optional files*.
     * @throws Error if any *essential* file is defined in settings but not included in given files.
     */
    validateFiles(files) {
        const assertFileExists = (expectedFile, shouldThrow) => {
            const actualPath = this.resolveURL(expectedFile);
            if (!files.includes(actualPath)) {
                if (shouldThrow) {
                    throw new Error(`File "${expectedFile}" is defined in settings, but doesn't exist in given files`);
                }
                return false;
            }
            return true;
        };
        const essentialFiles = [this.moc, ...this.textures];
        essentialFiles.forEach(texture => assertFileExists(texture, true));
        const definedFiles = this.getDefinedFiles();
        return definedFiles.filter(file => assertFileExists(file, false));
    }
}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return MotionPreloadStrategy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MotionManager; });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _cubism_common_MotionState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var _cubism_common_SoundManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(0);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_pixi_utils__WEBPACK_IMPORTED_MODULE_4__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





/**
 * Indicates how the motions will be preloaded.
 */
var MotionPreloadStrategy;
(function (MotionPreloadStrategy) {
    /** Preload all the motions. */
    MotionPreloadStrategy["ALL"] = "ALL";
    /** Preload only the idle motions. */
    MotionPreloadStrategy["IDLE"] = "IDLE";
    /** No preload. */
    MotionPreloadStrategy["NONE"] = "NONE";
})(MotionPreloadStrategy || (MotionPreloadStrategy = {}));
/**
 * Handles the motion playback.
 * @emits {@link MotionManagerEvents}
 */
class MotionManager extends _pixi_utils__WEBPACK_IMPORTED_MODULE_4__["EventEmitter"] {
    constructor(settings, options) {
        super();
        /**
         * The Motions. The structure is the same as {@link definitions}, initially each group contains
         * an empty array, which means all motions will be `undefined`. When a Motion has been loaded,
         * it'll fill the place in which it should be; when it fails to load, the place will be filled
         * with `null`.
         */
        this.motionGroups = {};
        /**
         * Maintains the state of this MotionManager.
         */
        this.state = new _cubism_common_MotionState__WEBPACK_IMPORTED_MODULE_1__[/* MotionState */ "b"]();
        /**
         * Flags there's a motion playing.
         */
        this.playing = false;
        /**
         * Flags the instances has been destroyed.
         */
        this.destroyed = false;
        this.settings = settings;
        this.tag = `MotionManager(${settings.name})`;
        this.state.tag = this.tag;
    }
    /**
     * Should be called in the constructor of derived class.
     */
    init(options) {
        if (options === null || options === void 0 ? void 0 : options.idleMotionGroup) {
            this.groups.idle = options.idleMotionGroup;
        }
        this.setupMotions(options);
        this.stopAllMotions();
    }
    /**
     * Sets up motions from the definitions, and preloads them according to the preload strategy.
     */
    setupMotions(options) {
        for (const group of Object.keys(this.definitions)) {
            // init with the same structure of definitions
            this.motionGroups[group] = [];
        }
        // preload motions
        let groups;
        switch (options === null || options === void 0 ? void 0 : options.motionPreload) {
            case MotionPreloadStrategy.NONE:
                return;
            case MotionPreloadStrategy.ALL:
                groups = Object.keys(this.definitions);
                break;
            case MotionPreloadStrategy.IDLE:
            default:
                groups = [this.groups.idle];
                break;
        }
        for (const group of groups) {
            if (this.definitions[group]) {
                for (let i = 0; i < this.definitions[group].length; i++) {
                    this.loadMotion(group, i).then();
                }
            }
        }
    }
    /**
     * Loads a Motion in a motion group. Errors in this method will not be thrown,
     * but be emitted with a "motionLoadError" event.
     * @param group - The motion group.
     * @param index - Index in the motion group.
     * @return Promise that resolves with the Motion, or with undefined if it can't be loaded.
     * @emits {@link MotionManagerEvents.motionLoaded}
     * @emits {@link MotionManagerEvents.motionLoadError}
     */
    loadMotion(group, index) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = this.definitions[group]) === null || _a === void 0 ? void 0 : _a[index])) {
                _utils__WEBPACK_IMPORTED_MODULE_3__[/* logger */ "f"].warn(this.tag, `Undefined motion at "${group}"[${index}]`);
                return undefined;
            }
            if (this.motionGroups[group][index] === null) {
                _utils__WEBPACK_IMPORTED_MODULE_3__[/* logger */ "f"].warn(this.tag, `Cannot start motion at "${group}"[${index}] because it's already failed in loading.`);
                return undefined;
            }
            if (this.motionGroups[group][index]) {
                return this.motionGroups[group][index];
            }
            const motion = yield this._loadMotion(group, index);
            if (this.destroyed) {
                return;
            }
            this.motionGroups[group][index] = motion !== null && motion !== void 0 ? motion : null;
            return motion;
        });
    }
    // TODO: remove
    /**
     * Loads the Motion. Will be implemented by Live2DFactory.
     * @ignore
     */
    _loadMotion(group, index) {
        throw new Error('Not implemented.');
    }
    /**
     * Starts a motion as given priority.
     * @param group - The motion group.
     * @param index - Index in the motion group.
     * @param priority - The priority to be applied.
     * @return Promise that resolves with true if the motion is successfully started, with false otherwise.
     */
    startMotion(group, index, priority = _cubism_common_MotionState__WEBPACK_IMPORTED_MODULE_1__[/* MotionPriority */ "a"].NORMAL) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.state.reserve(group, index, priority)) {
                return false;
            }
            const definition = (_a = this.definitions[group]) === null || _a === void 0 ? void 0 : _a[index];
            if (!definition) {
                return false;
            }
            if (this.currentAudio) {
                // TODO: reuse the audio?
                _cubism_common_SoundManager__WEBPACK_IMPORTED_MODULE_2__[/* SoundManager */ "a"].dispose(this.currentAudio);
            }
            let audio;
            if (_config__WEBPACK_IMPORTED_MODULE_0__[/* config */ "b"].sound) {
                const soundURL = this.getSoundFile(definition);
                if (soundURL) {
                    try {
                        // start to load the audio
                        audio = _cubism_common_SoundManager__WEBPACK_IMPORTED_MODULE_2__[/* SoundManager */ "a"].add(this.settings.resolveURL(soundURL), () => this.currentAudio = undefined, () => this.currentAudio = undefined);
                        this.currentAudio = audio;
                    }
                    catch (e) {
                        _utils__WEBPACK_IMPORTED_MODULE_3__[/* logger */ "f"].warn(this.tag, 'Failed to create audio', soundURL, e);
                    }
                }
            }
            const motion = yield this.loadMotion(group, index);
            if (audio) {
                const readyToPlay = _cubism_common_SoundManager__WEBPACK_IMPORTED_MODULE_2__[/* SoundManager */ "a"].play(audio)
                    .catch(e => _utils__WEBPACK_IMPORTED_MODULE_3__[/* logger */ "f"].warn(this.tag, 'Failed to play audio', audio.src, e));
                if (_config__WEBPACK_IMPORTED_MODULE_0__[/* config */ "b"].motionSync) {
                    // wait until the audio is ready
                    yield readyToPlay;
                }
            }
            if (!this.state.start(motion, group, index, priority)) {
                if (audio) {
                    _cubism_common_SoundManager__WEBPACK_IMPORTED_MODULE_2__[/* SoundManager */ "a"].dispose(audio);
                    this.currentAudio = undefined;
                }
                return false;
            }
            _utils__WEBPACK_IMPORTED_MODULE_3__[/* logger */ "f"].log(this.tag, 'Start motion:', this.getMotionName(definition));
            this.emit('motionStart', group, index, audio);
            if (this.state.shouldOverrideExpression()) {
                this.expressionManager && this.expressionManager.resetExpression();
            }
            this.playing = true;
            this._startMotion(motion);
            return true;
        });
    }
    /**
     * Starts a random Motion as given priority.
     * @param group - The motion group.
     * @param priority - The priority to be applied.
     * @return Promise that resolves with true if the motion is successfully started, with false otherwise.
     */
    startRandomMotion(group, priority) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupDefs = this.definitions[group];
            if (groupDefs === null || groupDefs === void 0 ? void 0 : groupDefs.length) {
                const availableIndices = [];
                for (let i = 0; i < groupDefs.length; i++) {
                    if (this.motionGroups[group][i] !== null && !this.state.isActive(group, i)) {
                        availableIndices.push(i);
                    }
                }
                if (availableIndices.length) {
                    const index = Math.floor(Math.random() * availableIndices.length);
                    return this.startMotion(group, availableIndices[index], priority);
                }
            }
            return false;
        });
    }
    /**
     * Stops all playing motions as well as the sound.
     */
    stopAllMotions() {
        this._stopAllMotions();
        this.state.reset();
        if (this.currentAudio) {
            _cubism_common_SoundManager__WEBPACK_IMPORTED_MODULE_2__[/* SoundManager */ "a"].dispose(this.currentAudio);
            this.currentAudio = undefined;
        }
    }
    /**
     * Updates parameters of the core model.
     * @param model - The core model.
     * @param now - Current time in milliseconds.
     * @return True if the parameters have been actually updated.
     */
    update(model, now) {
        var _a, _b;
        if (this.isFinished()) {
            if (this.playing) {
                this.playing = false;
                this.emit('motionFinish');
            }
            if (this.state.shouldOverrideExpression()) {
                (_a = this.expressionManager) === null || _a === void 0 ? void 0 : _a.restoreExpression();
            }
            this.state.complete();
            if (this.state.shouldRequestIdleMotion()) {
                // noinspection JSIgnoredPromiseFromCall
                this.startRandomMotion(this.groups.idle, _cubism_common_MotionState__WEBPACK_IMPORTED_MODULE_1__[/* MotionPriority */ "a"].IDLE);
            }
        }
        let updated = this.updateParameters(model, now);
        updated = ((_b = this.expressionManager) === null || _b === void 0 ? void 0 : _b.update(model, now)) || updated;
        return updated;
    }
    /**
     * Destroys the instance.
     * @emits {@link MotionManagerEvents.destroy}
     */
    destroy() {
        var _a;
        this.destroyed = true;
        this.emit('destroy');
        this.stopAllMotions();
        (_a = this.expressionManager) === null || _a === void 0 ? void 0 : _a.destroy();
        const self = this;
        self.definitions = undefined;
        self.motionGroups = undefined;
    }
}


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InternalModel; });
/* harmony import */ var _cubism_common_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _cubism_common_FocusController__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var _pixi_math__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
/* harmony import */ var _pixi_math__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_pixi_math__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
/* harmony import */ var _pixi_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_pixi_utils__WEBPACK_IMPORTED_MODULE_3__);




const tempBounds = { x: 0, y: 0, width: 0, height: 0 };
/**
 * A wrapper that manages the states of a Live2D core model, and delegates all operations to it.
 * @emits {@link InternalModelEvents}
 */
class InternalModel extends _pixi_utils__WEBPACK_IMPORTED_MODULE_3__["EventEmitter"] {
    constructor() {
        super(...arguments);
        this.focusController = new _cubism_common_FocusController__WEBPACK_IMPORTED_MODULE_1__[/* FocusController */ "a"]();
        /**
         * Original canvas width of the model. Note this doesn't represent the model's real size,
         * as the model can overflow from its canvas.
         */
        this.originalWidth = 0;
        /**
         * Original canvas height of the model. Note this doesn't represent the model's real size,
         * as the model can overflow from its canvas.
         */
        this.originalHeight = 0;
        /**
         * Canvas width of the model, scaled by the `width` of the model's layout.
         */
        this.width = 0;
        /**
         * Canvas height of the model, scaled by the `height` of the model's layout.
         */
        this.height = 0;
        /**
         * Local transformation, calculated from the model's layout.
         */
        this.localTransform = new _pixi_math__WEBPACK_IMPORTED_MODULE_2__["Matrix"]();
        /**
         * The final matrix to draw the model.
         */
        this.drawingMatrix = new _pixi_math__WEBPACK_IMPORTED_MODULE_2__["Matrix"]();
        // TODO: change structure
        /**
         * The hit area definitions, keyed by their names.
         */
        this.hitAreas = {};
        /**
         * Flags whether `gl.UNPACK_FLIP_Y_WEBGL` should be enabled when binding the textures.
         */
        this.textureFlipY = false;
        /**
         * WebGL viewport when drawing the model. The format is `[x, y, width, height]`.
         */
        this.viewport = [0, 0, 0, 0];
        /**
         * Flags this instance has been destroyed.
         */
        this.destroyed = false;
    }
    /**
     * Should be called in the constructor of derived class.
     */
    init() {
        this.setupLayout();
        this.setupHitAreas();
    }
    /**
     * Sets up the model's size and local transform by the model's layout.
     */
    setupLayout() {
        // cast `this` to be mutable
        const self = this;
        const size = this.getSize();
        self.originalWidth = size[0];
        self.originalHeight = size[1];
        const layout = Object.assign({
            width: _cubism_common_constants__WEBPACK_IMPORTED_MODULE_0__[/* LOGICAL_WIDTH */ "b"],
            height: _cubism_common_constants__WEBPACK_IMPORTED_MODULE_0__[/* LOGICAL_HEIGHT */ "a"],
        }, this.getLayout());
        this.localTransform.scale(layout.width / _cubism_common_constants__WEBPACK_IMPORTED_MODULE_0__[/* LOGICAL_WIDTH */ "b"], layout.height / _cubism_common_constants__WEBPACK_IMPORTED_MODULE_0__[/* LOGICAL_HEIGHT */ "a"]);
        self.width = this.originalWidth * this.localTransform.a;
        self.height = this.originalHeight * this.localTransform.d;
        // this calculation differs from Live2D SDK...
        const offsetX = (layout.x !== undefined && layout.x - layout.width / 2)
            || (layout.centerX !== undefined && layout.centerX)
            || (layout.left !== undefined && layout.left - layout.width / 2)
            || (layout.right !== undefined && layout.right + layout.width / 2)
            || 0;
        const offsetY = (layout.y !== undefined && layout.y - layout.height / 2)
            || (layout.centerY !== undefined && layout.centerY)
            || (layout.top !== undefined && layout.top - layout.height / 2)
            || (layout.bottom !== undefined && layout.bottom + layout.height / 2)
            || 0;
        this.localTransform.translate(this.width * offsetX, -this.height * offsetY);
    }
    /**
     * Sets up the hit areas by their definitions in settings.
     */
    setupHitAreas() {
        const definitions = this.getHitAreaDefs().filter(hitArea => hitArea.index >= 0);
        for (const def of definitions) {
            this.hitAreas[def.name] = def;
        }
    }
    /**
     * Hit-test on the model.
     * @param x - Position in model canvas.
     * @param y - Position in model canvas.
     * @return The names of the *hit* hit areas. Can be empty if none is hit.
     */
    hitTest(x, y) {
        return Object.keys(this.hitAreas).filter(hitAreaName => this.isHit(hitAreaName, x, y));
    }
    /**
     * Hit-test for a single hit area.
     * @param hitAreaName - The hit area's name.
     * @param x - Position in model canvas.
     * @param y - Position in model canvas.
     * @return True if hit.
     */
    isHit(hitAreaName, x, y) {
        if (!this.hitAreas[hitAreaName]) {
            return false;
        }
        const drawIndex = this.hitAreas[hitAreaName].index;
        const bounds = this.getDrawableBounds(drawIndex, tempBounds);
        return bounds.x <= x && x <= bounds.x + bounds.width && bounds.y <= y && y <= bounds.y + bounds.height;
    }
    /**
     * Gets a drawable's bounds.
     * @param index - Index of the drawable.
     * @param bounds - Object to store the output values.
     * @return The bounds in model canvas space.
     */
    getDrawableBounds(index, bounds) {
        const vertices = this.getDrawableVertices(index);
        let left = vertices[0];
        let right = vertices[0];
        let top = vertices[1];
        let bottom = vertices[1];
        for (let i = 0; i < vertices.length; i += 2) {
            const vx = vertices[i];
            const vy = vertices[i + 1];
            left = Math.min(vx, left);
            right = Math.max(vx, right);
            top = Math.min(vy, top);
            bottom = Math.max(vy, bottom);
        }
        bounds !== null && bounds !== void 0 ? bounds : (bounds = {});
        bounds.x = left;
        bounds.y = top;
        bounds.width = right - left;
        bounds.height = bottom - top;
        return bounds;
    }
    /**
     * Updates the model's transform.
     * @param transform - The world transform.
     */
    updateTransform(transform) {
        this.drawingMatrix.copyFrom(transform).append(this.localTransform);
    }
    /**
     * Updates the model's parameters.
     * @param dt - Elapsed time in milliseconds from last frame.
     * @param now - Current time in milliseconds.
     */
    update(dt, now) {
        this.focusController.update(dt);
    }
    ;
    /**
     * Destroys the model and all related resources.
     * @emits {@link InternalModelEvents.destroy | destroy}
     */
    destroy() {
        this.destroyed = true;
        this.emit('destroy');
        this.motionManager.destroy();
        this.motionManager = undefined;
    }
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FocusController; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

// Minimum distance to respond
const EPSILON = 0.01;
const MAX_SPEED = 40 / 7.5;
// the time to accelerate to max speed
const ACCELERATION_TIME = 1 / (0.15 * 1000);
/**
 * Interpolates the transition of focus position.
 */
class FocusController {
    constructor() {
        /** The focus position. */
        this.targetX = 0;
        /** The focus position. */
        this.targetY = 0;
        /** Current position. */
        this.x = 0;
        /** Current position. */
        this.y = 0;
        /** Current velocity. */
        this.vx = 0;
        /** Current velocity. */
        this.vy = 0;
    }
    /**
     * Sets the focus position.
     * @param x - X position in range `[-1, 1]`.
     * @param y - Y position in range `[-1, 1]`.
     * @param instant - Should the focus position be instantly applied.
     */
    focus(x, y, instant = false) {
        this.targetX = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[/* clamp */ "b"])(x, -1, 1);
        this.targetY = Object(_utils__WEBPACK_IMPORTED_MODULE_0__[/* clamp */ "b"])(y, -1, 1);
        if (instant) {
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }
    /**
     * Updates the interpolation.
     * @param dt - Delta time in milliseconds.
     */
    update(dt) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        if (Math.abs(dx) < EPSILON && Math.abs(dy) < EPSILON)
            return;
        const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        const maxSpeed = MAX_SPEED / (1000 / dt);
        let ax = maxSpeed * (dx / d) - this.vx;
        let ay = maxSpeed * (dy / d) - this.vy;
        const a = Math.sqrt(Math.pow(ax, 2) + Math.pow(ay, 2));
        const maxA = maxSpeed * ACCELERATION_TIME * dt;
        if (a > maxA) {
            ax *= maxA / a;
            ay *= maxA / a;
        }
        this.vx += ax;
        this.vy += ay;
        const v = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
        const maxV = 0.5 * (Math.sqrt(Math.pow(maxA, 2) + 8 * maxA * d) - maxA);
        if (v > maxV) {
            this.vx *= maxV / v;
            this.vy *= maxV / v;
        }
        this.x += this.vx;
        this.y += this.vy;
    }
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return XHRLoader; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

const TAG = 'XHRLoader';
class NetworkError extends Error {
    constructor(message, url, status, aborted = false) {
        super(message);
        this.url = url;
        this.status = status;
        this.aborted = aborted;
    }
}
/**
 * The basic XHR loader.
 *
 * A network error will be thrown with the following properties:
 * - `url` - The request URL.
 * - `status` - The HTTP status.
 * - `aborted` - True if the error is caused by aborting the XHR.
 */
class XHRLoader {
    /**
     * Creates a managed XHR.
     * @param target - If provided, the XHR will be canceled when receiving an "destroy" event from the target.
     * @param url - The URL.
     * @param type - The XHR response type.
     * @param onload - Load listener.
     * @param onerror - Error handler.
     */
    static createXHR(target, url, type, onload, onerror) {
        const xhr = new XMLHttpRequest();
        XHRLoader.allXhrSet.add(xhr);
        if (target) {
            let xhrSet = XHRLoader.xhrMap.get(target);
            if (!xhrSet) {
                xhrSet = new Set([xhr]);
                XHRLoader.xhrMap.set(target, xhrSet);
            }
            else {
                xhrSet.add(xhr);
            }
            if (!target.listeners('destroy').includes(XHRLoader.cancelXHRs)) {
                target.once('destroy', XHRLoader.cancelXHRs);
            }
        }
        xhr.open('GET', url);
        xhr.responseType = type;
        xhr.onload = () => {
            if ((xhr.status === 200 || xhr.status === 0) && xhr.response) {
                onload(xhr.response);
            }
            else {
                xhr.onerror();
            }
        };
        xhr.onerror = () => {
            _utils__WEBPACK_IMPORTED_MODULE_0__[/* logger */ "f"].warn(TAG, `Failed to load resource as ${xhr.responseType} (Status ${xhr.status}): ${url}`);
            onerror(new NetworkError('Network error.', url, xhr.status));
        };
        xhr.onabort = () => onerror(new NetworkError('Aborted.', url, xhr.status, true));
        xhr.onloadend = () => {
            var _a;
            XHRLoader.allXhrSet.delete(xhr);
            if (target) {
                (_a = XHRLoader.xhrMap.get(target)) === null || _a === void 0 ? void 0 : _a.delete(xhr);
            }
        };
        return xhr;
    }
    /**
     * Cancels all XHRs related to this target.
     */
    static cancelXHRs() {
        var _a;
        (_a = XHRLoader.xhrMap.get(this)) === null || _a === void 0 ? void 0 : _a.forEach(xhr => {
            xhr.abort();
            XHRLoader.allXhrSet.delete(xhr);
        });
        XHRLoader.xhrMap.delete(this);
    }
    /**
     * Release all XHRs.
     */
    static release() {
        XHRLoader.allXhrSet.forEach(xhr => xhr.abort());
        XHRLoader.allXhrSet.clear();
        XHRLoader.xhrMap = new WeakMap();
    }
}
/**
 * All the created XHRs, keyed by their owners respectively.
 */
XHRLoader.xhrMap = new WeakMap();
/**
 * All the created XHRs as a flat array.
 */
XHRLoader.allXhrSet = new Set();
/**
 * Middleware for Live2DLoader.
 */
XHRLoader.loader = (context, next) => {
    return new Promise((resolve, reject) => {
        const xhr = XHRLoader.createXHR(context.target, context.settings ? context.settings.resolveURL(context.url) : context.url, context.type, data => {
            context.result = data;
            resolve();
        }, reject);
        xhr.send();
    });
};


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return runMiddlewares; });
/**
 * Run middlewares with given context.
 * @see https://github.com/koajs/compose/blob/master/index.js
 *
 * @param middleware
 * @param context
 */
function runMiddlewares(middleware, context) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i, err) {
        if (err)
            return Promise.reject(err);
        if (i <= index)
            return Promise.reject(new Error('next() called multiple times'));
        index = i;
        const fn = middleware[i];
        if (!fn)
            return Promise.resolve();
        try {
            return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
}


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__20__;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(22),
    getRawTag = __webpack_require__(56),
    objectToString = __webpack_require__(57);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(9);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 23 */,
/* 24 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__24__;

/***/ }),
/* 25 */
/***/ (function(module, exports) {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),
/* 26 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "h", function() { return /* reexport */ cubism_common["e" /* LOGICAL_WIDTH */]; });
__webpack_require__.d(__webpack_exports__, "g", function() { return /* reexport */ cubism_common["d" /* LOGICAL_HEIGHT */]; });
__webpack_require__.d(__webpack_exports__, "a", function() { return /* reexport */ cubism_common["a" /* ExpressionManager */]; });
__webpack_require__.d(__webpack_exports__, "c", function() { return /* reexport */ cubism_common["b" /* FocusController */]; });
__webpack_require__.d(__webpack_exports__, "m", function() { return /* reexport */ cubism_common["f" /* ModelSettings */]; });
__webpack_require__.d(__webpack_exports__, "p", function() { return /* reexport */ cubism_common["i" /* MotionPriority */]; });
__webpack_require__.d(__webpack_exports__, "q", function() { return /* reexport */ cubism_common["j" /* MotionState */]; });
__webpack_require__.d(__webpack_exports__, "o", function() { return /* reexport */ cubism_common["h" /* MotionPreloadStrategy */]; });
__webpack_require__.d(__webpack_exports__, "n", function() { return /* reexport */ cubism_common["g" /* MotionManager */]; });
__webpack_require__.d(__webpack_exports__, "r", function() { return /* reexport */ cubism_common["k" /* SoundManager */]; });
__webpack_require__.d(__webpack_exports__, "f", function() { return /* reexport */ cubism_common["c" /* InternalModel */]; });
__webpack_require__.d(__webpack_exports__, "k", function() { return /* reexport */ Live2DModel_Live2DModel; });
__webpack_require__.d(__webpack_exports__, "l", function() { return /* reexport */ Live2DTransform_Live2DTransform; });
__webpack_require__.d(__webpack_exports__, "e", function() { return /* reexport */ InteractionMixin; });
__webpack_require__.d(__webpack_exports__, "x", function() { return /* reexport */ config["b" /* config */]; });
__webpack_require__.d(__webpack_exports__, "s", function() { return /* reexport */ config["a" /* VERSION */]; });
__webpack_require__.d(__webpack_exports__, "i", function() { return /* reexport */ Live2DFactory["a" /* Live2DFactory */]; });
__webpack_require__.d(__webpack_exports__, "j", function() { return /* reexport */ Live2DLoader["a" /* Live2DLoader */]; });
__webpack_require__.d(__webpack_exports__, "t", function() { return /* reexport */ XHRLoader["a" /* XHRLoader */]; });
__webpack_require__.d(__webpack_exports__, "b", function() { return /* reexport */ FileLoader_FileLoader; });
__webpack_require__.d(__webpack_exports__, "u", function() { return /* reexport */ ZipLoader_ZipLoader; });
__webpack_require__.d(__webpack_exports__, "B", function() { return /* reexport */ utils["f" /* logger */]; });
__webpack_require__.d(__webpack_exports__, "w", function() { return /* reexport */ utils["b" /* clamp */]; });
__webpack_require__.d(__webpack_exports__, "C", function() { return /* reexport */ utils["g" /* rand */]; });
__webpack_require__.d(__webpack_exports__, "z", function() { return /* reexport */ utils["d" /* copyProperty */]; });
__webpack_require__.d(__webpack_exports__, "y", function() { return /* reexport */ utils["c" /* copyArray */]; });
__webpack_require__.d(__webpack_exports__, "v", function() { return /* reexport */ utils["a" /* applyMixins */]; });
__webpack_require__.d(__webpack_exports__, "A", function() { return /* reexport */ utils["e" /* folderName */]; });
__webpack_require__.d(__webpack_exports__, "d", function() { return /* reexport */ HitAreaFrames_HitAreaFrames; });

// EXTERNAL MODULE: ./src/cubism-common/index.ts
var cubism_common = __webpack_require__(6);

// EXTERNAL MODULE: ./src/factory/Live2DFactory.ts + 2 modules
var Live2DFactory = __webpack_require__(5);

// EXTERNAL MODULE: external {"commonjs":"@pixi/display","commonjs2":"@pixi/display","amd":"@pixi/display","root":"PIXI"}
var display_root_PIXI_ = __webpack_require__(34);

// EXTERNAL MODULE: external {"commonjs":"@pixi/math","commonjs2":"@pixi/math","amd":"@pixi/math","root":"PIXI"}
var math_root_PIXI_ = __webpack_require__(2);

// CONCATENATED MODULE: ./src/InteractionMixin.ts
/**
 * The interaction control split from Live2DModel class for code clarity. This mixin should *only*
 * be used on the Live2DModel.
 */
class InteractionMixin {
    constructor() {
        this._autoInteract = false;
    }
    /**
     * Enables automatic interaction. Only takes effect if Pixi's interaction
     * feature has been enabled (by registering the `PIXI.InteractionManager` into `PIXI.Renderer`).
     */
    get autoInteract() {
        return this._autoInteract;
    }
    set autoInteract(autoInteract) {
        if (autoInteract !== this._autoInteract) {
            if (autoInteract) {
                this.on('pointertap', onTap, this);
            }
            else {
                this.off('pointertap', onTap, this);
            }
            this._autoInteract = autoInteract;
        }
    }
    /**
     * Registers interaction by subscribing to the `PIXI.InteractionManager`.
     */
    registerInteraction(manager) {
        if (manager !== this.interactionManager) {
            this.unregisterInteraction();
            if (this._autoInteract && manager) {
                this.interactionManager = manager;
                manager.on('pointermove', onPointerMove, this);
            }
        }
    }
    /**
     * Unregisters interaction.
     */
    unregisterInteraction() {
        var _a;
        if (this.interactionManager) {
            (_a = this.interactionManager) === null || _a === void 0 ? void 0 : _a.off('pointermove', onPointerMove, this);
            this.interactionManager = undefined;
        }
    }
}
function onTap(event) {
    this.tap(event.data.global.x, event.data.global.y);
}
function onPointerMove(event) {
    this.focus(event.data.global.x, event.data.global.y);
}

// CONCATENATED MODULE: ./src/Live2DTransform.ts

/**
 * Useless class. May be useful in the future.
 */
class Live2DTransform_Live2DTransform extends math_root_PIXI_["Transform"] {
}

// EXTERNAL MODULE: ./src/utils/index.ts + 4 modules
var utils = __webpack_require__(0);

// CONCATENATED MODULE: ./src/Live2DModel.ts
var _a;






const tempPoint = new math_root_PIXI_["Point"]();
const tempMatrix = new math_root_PIXI_["Matrix"]();
// a reference to Ticker class, defaults to window.PIXI.Ticker (when loaded by a <script> tag)
let TickerClass = (_a = window.PIXI) === null || _a === void 0 ? void 0 : _a.Ticker;
/**
 * A wrapper that allows the Live2D model to be used as a DisplayObject in PixiJS.
 *
 * ```js
 * const model = await Live2DModel.from('shizuku.model.json');
 * container.add(model);
 * ```
 * @emits {@link Live2DModelEvents}
 */
class Live2DModel_Live2DModel extends display_root_PIXI_["Container"] {
    constructor(options) {
        super();
        /**
         * Tag for logging.
         */
        this.tag = 'Live2DModel(uninitialized)';
        /**
         * Pixi textures.
         */
        this.textures = [];
        /** @override */
        this.transform = new Live2DTransform_Live2DTransform();
        /**
         * The anchor behaves like the one in `PIXI.Sprite`, where `(0, 0)` means the top left
         * and `(1, 1)` means the bottom right.
         */
        this.anchor = new math_root_PIXI_["ObservablePoint"](this.onAnchorChange, this, 0, 0);
        /**
         * An ID of Gl context that syncs with `renderer.CONTEXT_UID`. Used to check if the GL context has changed.
         */
        this.glContextID = -1;
        /**
         * Elapsed time in milliseconds since created.
         */
        this.elapsedTime = performance.now();
        /**
         * Elapsed time in milliseconds from last frame to this frame.
         */
        this.deltaTime = 0;
        this._autoUpdate = false;
        this.once('modelLoaded', () => this.init(options));
    }
    /**
     * Creates a Live2DModel from given source.
     * @param source - Can be one of: settings file URL, settings JSON object, ModelSettings instance.
     * @param options - Options for the creation.
     * @return Promise that resolves with the Live2DModel.
     */
    static from(source, options) {
        const model = new this(options);
        return Live2DFactory["a" /* Live2DFactory */].setupLive2DModel(model, source, options).then(() => model);
    }
    /**
     * Synchronous version of `Live2DModel.from()`. This method immediately returns a Live2DModel instance,
     * whose resources have not been loaded. Therefore this model can't be manipulated or rendered
     * until the "load" event has been emitted.
     *
     * ```js
     * // no `await` here as it's not a Promise
     * const model = Live2DModel.fromSync('shizuku.model.json');
     *
     * // these will cause errors!
     * // app.stage.addChild(model);
     * // model.motion('tap_body');
     *
     * model.once('load', () => {
     *     // now it's safe
     *     app.stage.addChild(model);
     *     model.motion('tap_body');
     * });
     * ```
     */
    static fromSync(source, options) {
        const model = new this(options);
        Live2DFactory["a" /* Live2DFactory */].setupLive2DModel(model, source, options).then(options === null || options === void 0 ? void 0 : options.onLoad).catch(options === null || options === void 0 ? void 0 : options.onError);
        return model;
    }
    /**
     * Registers the class of `PIXI.Ticker` for auto updating.
     */
    static registerTicker(tickerClass) {
        TickerClass = tickerClass;
    }
    /**
     * Enables automatic updating. Requires {@link Live2DModel.registerTicker} or the global `window.PIXI.Ticker`.
     */
    get autoUpdate() {
        return this._autoUpdate;
    }
    set autoUpdate(autoUpdate) {
        if (autoUpdate) {
            if (!this._destroyed) {
                if (TickerClass) {
                    TickerClass.shared.add(this.onTickerUpdate, this);
                    this._autoUpdate = true;
                }
                else {
                    utils["f" /* logger */].warn(this.tag, 'No Ticker registered, please call Live2DModel.registerTicker(Ticker).');
                }
            }
        }
        else {
            TickerClass === null || TickerClass === void 0 ? void 0 : TickerClass.shared.remove(this.onTickerUpdate, this);
            this._autoUpdate = false;
        }
    }
    // TODO: rename
    /**
     * A handler of the "modelLoaded" event, invoked when the internal model has been loaded.
     */
    init(options) {
        this.tag = `Live2DModel(${this.internalModel.settings.name})`;
        const _options = Object.assign({
            autoUpdate: true,
            autoInteract: true,
        }, options);
        if (_options.autoInteract) {
            this.interactive = true;
        }
        this.autoInteract = _options.autoInteract;
        this.autoUpdate = _options.autoUpdate;
    }
    /**
     * A callback that observes {@link anchor}, invoked when the anchor's values have been changed.
     */
    onAnchorChange() {
        this.pivot.set(this.anchor.x * this.internalModel.width, this.anchor.y * this.internalModel.height);
    }
    /**
     * Shorthand to start a motion.
     * @param group - The motion group.
     * @param index - The index in this group. If not presented, a random motion will be started.
     * @param priority - The motion priority. Defaults to `MotionPriority.NORMAL`.
     * @return Promise that resolves with true if the motion is successfully started, with false otherwise.
     */
    motion(group, index, priority) {
        return index === undefined
            ? this.internalModel.motionManager.startRandomMotion(group, priority)
            : this.internalModel.motionManager.startMotion(group, index, priority);
    }
    /**
     * Shorthand to set an expression.
     * @param id - Either the index, or the name of the expression. If not presented, a random expression will be set.
     * @return Promise that resolves with true if succeeded, with false otherwise.
     */
    expression(id) {
        if (this.internalModel.motionManager.expressionManager) {
            return id === undefined
                ? this.internalModel.motionManager.expressionManager.setRandomExpression()
                : this.internalModel.motionManager.expressionManager.setExpression(id);
        }
        return Promise.resolve(false);
    }
    /**
     * Updates the focus position. This will not cause the model to immediately look at the position,
     * instead the movement will be interpolated.
     * @param x - Position in world space.
     * @param y - Position in world space.
     * @param instant - Should the focus position be instantly applied.
     */
    focus(x, y, instant = false) {
        tempPoint.x = x;
        tempPoint.y = y;
        // we can pass `true` as the third argument to skip the update transform
        // because focus won't take effect until the model is rendered,
        // and a model being rendered will always get transform updated
        this.toModelPosition(tempPoint, tempPoint, true);
        this.internalModel.focusController.focus((tempPoint.x / this.internalModel.originalWidth) * 2 - 1, -((tempPoint.y / this.internalModel.originalHeight) * 2 - 1), instant);
    }
    /**
     * Tap on the model. This will perform a hit-testing, and emit a "hit" event
     * if at least one of the hit areas is hit.
     * @param x - Position in world space.
     * @param y - Position in world space.
     * @emits {@link Live2DModelEvents.hit}
     */
    tap(x, y) {
        const hitAreaNames = this.hitTest(x, y);
        if (hitAreaNames.length) {
            utils["f" /* logger */].log(this.tag, `Hit`, hitAreaNames);
            this.emit('hit', hitAreaNames);
        }
    }
    /**
     * Hit-test on the model.
     * @param x - Position in world space.
     * @param y - Position in world space.
     * @return The names of the *hit* hit areas. Can be empty if none is hit.
     */
    hitTest(x, y) {
        tempPoint.x = x;
        tempPoint.y = y;
        this.toModelPosition(tempPoint, tempPoint);
        return this.internalModel.hitTest(tempPoint.x, tempPoint.y);
    }
    /**
     * Calculates the position in the canvas of original, unscaled Live2D model.
     * @param position - A Point in world space.
     * @param result - A Point to store the new value. Defaults to a new Point.
     * @param skipUpdate - True to skip the update transform.
     * @return The Point in model canvas space.
     */
    toModelPosition(position, result = position.clone(), skipUpdate) {
        if (!skipUpdate) {
            this._recursivePostUpdateTransform();
            if (!this.parent) {
                this.parent = this._tempDisplayObjectParent;
                this.displayObjectUpdateTransform();
                this.parent = null;
            }
            else {
                this.displayObjectUpdateTransform();
            }
        }
        this.transform.worldTransform.applyInverse(position, result);
        this.internalModel.localTransform.applyInverse(result, result);
        return result;
    }
    /**
     * A method required by `PIXI.InteractionManager` to perform hit-testing.
     * @param point - A Point in world space.
     * @return True if the point is inside this model.
     */
    containsPoint(point) {
        return this.getBounds(true).contains(point.x, point.y);
    }
    /** @override */
    _calculateBounds() {
        this._bounds.addFrame(this.transform, 0, 0, this.internalModel.width, this.internalModel.height);
    }
    /**
     * An update callback to be added to `PIXI.Ticker` and invoked every tick.
     */
    onTickerUpdate() {
        this.update(TickerClass.shared.deltaMS);
    }
    /**
     * Updates the model. Note this method just updates the timer,
     * and the actual update will be done right before rendering the model.
     * @param dt - The elapsed time in milliseconds since last frame.
     */
    update(dt) {
        this.deltaTime += dt;
        this.elapsedTime += dt;
        // don't call `this.internalModel.update()` here, because it requires WebGL context
    }
    /** @override */
    _render(renderer) {
        this.registerInteraction(renderer.plugins.interaction);
        // reset certain systems in renderer to make Live2D's drawing system compatible with Pixi
        renderer.batch.reset();
        renderer.geometry.reset();
        renderer.shader.reset();
        renderer.state.reset();
        let shouldUpdateTexture = false;
        // when the WebGL context has changed
        if (this.glContextID !== renderer.CONTEXT_UID) {
            this.glContextID = renderer.CONTEXT_UID;
            this.internalModel.updateWebGLContext(renderer.gl, this.glContextID);
            shouldUpdateTexture = true;
        }
        for (let i = 0; i < this.textures.length; i++) {
            const texture = this.textures[i];
            if (!texture.valid) {
                continue;
            }
            if (shouldUpdateTexture || !texture.baseTexture._glTextures[this.glContextID]) {
                renderer.gl.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, this.internalModel.textureFlipY);
                // let the TextureSystem generate corresponding WebGLTexture, and bind to an arbitrary location
                renderer.texture.bind(texture.baseTexture, 0);
            }
            // bind the WebGLTexture into Live2D core.
            // because the Texture in Pixi can be shared between multiple DisplayObjects,
            // it's unable to know if the WebGLTexture in this Texture has been destroyed (GCed) and regenerated,
            // and therefore we always bind the texture at this moment no matter what
            this.internalModel.bindTexture(i, texture.baseTexture._glTextures[this.glContextID].texture);
            // manually update the GC counter so they won't be GCed while using this model
            texture.baseTexture.touched = renderer.textureGC.count;
        }
        const viewport = renderer.framebuffer.viewport;
        this.internalModel.viewport = [viewport.x, viewport.y, viewport.width, viewport.height];
        // update only if the time has changed, as the model will possibly be updated once but rendered multiple times
        if (this.deltaTime) {
            this.internalModel.update(this.deltaTime, this.elapsedTime);
            this.deltaTime = 0;
        }
        const internalTransform = tempMatrix
            .copyFrom(renderer.globalUniforms.uniforms.projectionMatrix)
            .append(this.worldTransform);
        this.internalModel.updateTransform(internalTransform);
        this.internalModel.draw(renderer.gl);
        // reset WebGL state and texture bindings
        renderer.state.reset();
        renderer.texture.reset();
    }
    /**
     * Destroys the model and all related resources. This takes the same options and also
     * behaves the same as `PIXI.Container#destroy`.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param [options.texture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the texture of the child sprite
     * @param [options.baseTexture=false] - Only used for child Sprites if options.children is set to true
     *  Should it destroy the base texture of the child sprite
     */
    destroy(options) {
        this.emit('destroy');
        // the setters will do the cleanup
        this.autoUpdate = false;
        this.unregisterInteraction();
        if (options === null || options === void 0 ? void 0 : options.texture) {
            this.textures.forEach(texture => texture.destroy(options.baseTexture));
        }
        this.internalModel.destroy();
        super.destroy(options);
    }
}
Object(utils["a" /* applyMixins */])(Live2DModel_Live2DModel, [InteractionMixin]);

// EXTERNAL MODULE: ./src/config.ts
var config = __webpack_require__(1);

// EXTERNAL MODULE: ./src/factory/Live2DLoader.ts
var Live2DLoader = __webpack_require__(4);

// EXTERNAL MODULE: ./src/factory/XHRLoader.ts
var XHRLoader = __webpack_require__(18);

// EXTERNAL MODULE: external {"commonjs":"@pixi/utils","commonjs2":"@pixi/utils","amd":"@pixi/utils","root":["PIXI","utils"]}
var utils_root_PIXI_utils_ = __webpack_require__(3);

// CONCATENATED MODULE: ./src/factory/FileLoader.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * Experimental loader to load resources from uploaded files.
 *
 * This loader relies on
 * [webkitRelativePath](https://developer.mozilla.org/en-US/docs/Web/API/File/webkitRelativePath)
 * to recognize the file path.
 *
 * Though named as a "Loader", this class has nothing to do with Live2DLoader,
 * it only contains a middleware for the Live2DFactory.
 */
class FileLoader_FileLoader {
    /**
     * Resolves the path of a resource file to the object URL.
     * @param settingsURL - Object URL of the settings file.
     * @param filePath - Resource file path.
     * @return Resolved object URL.
     */
    static resolveURL(settingsURL, filePath) {
        var _a;
        const resolved = (_a = FileLoader_FileLoader.filesMap[settingsURL]) === null || _a === void 0 ? void 0 : _a[filePath];
        if (resolved === undefined) {
            throw new Error('Cannot find this file from uploaded files: ' + filePath);
        }
        return resolved;
    }
    /**
     * Consumes the files by storing their object URLs. Files not defined in the settings will be ignored.
     */
    static upload(files, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileMap = {};
            // only consume the files defined in settings
            for (const definedFile of settings.getDefinedFiles()) {
                const actualPath = decodeURI(utils_root_PIXI_utils_["url"].resolve(settings.url, definedFile));
                const actualFile = files.find(file => file.webkitRelativePath === actualPath);
                if (actualFile) {
                    fileMap[definedFile] = URL.createObjectURL(actualFile);
                }
            }
            FileLoader_FileLoader.filesMap[settings._objectURL] = fileMap;
        });
    }
    /**
     * Creates a ModelSettings by given files.
     * @return Promise that resolves with the created ModelSettings.
     */
    static createSettings(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const settingsFile = files.find(file => file.name.endsWith('model.json') || file.name.endsWith('model3.json'));
            if (!settingsFile) {
                throw new TypeError('Settings file not found');
            }
            const settingsText = yield FileLoader_FileLoader.readText(settingsFile);
            const settingsJSON = JSON.parse(settingsText);
            settingsJSON.url = settingsFile.webkitRelativePath;
            const runtime = Live2DFactory["a" /* Live2DFactory */].findRuntime(settingsJSON);
            if (!runtime) {
                throw new Error('Unknown settings JSON');
            }
            const settings = runtime.createModelSettings(settingsJSON);
            settings._objectURL = URL.createObjectURL(settingsFile);
            return settings;
        });
    }
    /**
     * Reads a file as text in UTF-8.
     */
    static readText(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file, 'utf8');
            });
        });
    }
}
/**
 * Stores all the object URLs of uploaded files.
 */
FileLoader_FileLoader.filesMap = {};
/**
 * Middleware for Live2DFactory.
 */
FileLoader_FileLoader.factory = (context, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (Array.isArray(context.source) && context.source[0] instanceof File) {
        const files = context.source;
        let settings = files.settings;
        if (!settings) {
            settings = yield FileLoader_FileLoader.createSettings(files);
        }
        else if (!settings._objectURL) {
            throw new Error('"_objectURL" must be specified in ModelSettings');
        }
        settings.validateFiles(files.map(file => encodeURI(file.webkitRelativePath)));
        yield FileLoader_FileLoader.upload(files, settings);
        // override the default method to resolve URL from uploaded files
        settings.resolveURL = function (url) {
            return FileLoader_FileLoader.resolveURL(this._objectURL, url);
        };
        context.source = settings;
        // clean up when destroying the model
        context.live2dModel.once('modelLoaded', (internalModel) => {
            internalModel.once('destroy', function () {
                const objectURL = this.settings._objectURL;
                URL.revokeObjectURL(objectURL);
                if (FileLoader_FileLoader.filesMap[objectURL]) {
                    for (const resourceObjectURL of Object.values(FileLoader_FileLoader.filesMap[objectURL])) {
                        URL.revokeObjectURL(resourceObjectURL);
                    }
                }
                delete FileLoader_FileLoader.filesMap[objectURL];
            });
        });
    }
    return next();
});
Live2DFactory["a" /* Live2DFactory */].live2DModelMiddlewares.unshift(FileLoader_FileLoader.factory);

// CONCATENATED MODULE: ./src/factory/ZipLoader.ts
var ZipLoader_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * Experimental loader to load resources from a zip file.
 *
 * Though named as a "Loader", this class has nothing to do with Live2DLoader,
 * it only contains a middleware for the Live2DFactory.
 */
class ZipLoader_ZipLoader {
    static unzip(reader, settings) {
        return ZipLoader_awaiter(this, void 0, void 0, function* () {
            const filePaths = yield ZipLoader_ZipLoader.getFilePaths(reader);
            const requiredFilePaths = [];
            // only consume the files defined in settings
            for (const definedFile of settings.getDefinedFiles()) {
                const actualPath = decodeURI(utils_root_PIXI_utils_["url"].resolve(settings.url, definedFile));
                if (filePaths.includes(actualPath)) {
                    requiredFilePaths.push(actualPath);
                }
            }
            const files = yield ZipLoader_ZipLoader.getFiles(reader, requiredFilePaths);
            for (let i = 0; i < files.length; i++) {
                const path = requiredFilePaths[i];
                const file = files[i];
                // let's borrow this property...
                Object.defineProperty(file, 'webkitRelativePath', {
                    value: path,
                });
            }
            return files;
        });
    }
    static createSettings(reader) {
        return ZipLoader_awaiter(this, void 0, void 0, function* () {
            const filePaths = yield ZipLoader_ZipLoader.getFilePaths(reader);
            const settingsFilePath = filePaths.find(path => path.endsWith('model.json') || path.endsWith('model3.json'));
            if (!settingsFilePath) {
                throw new Error('Settings file not found');
            }
            const settingsText = yield ZipLoader_ZipLoader.readText(reader, settingsFilePath);
            if (!settingsText) {
                throw new Error('Empty settings file: ' + settingsFilePath);
            }
            const settingsJSON = JSON.parse(settingsText);
            settingsJSON.url = settingsFilePath;
            const runtime = Live2DFactory["a" /* Live2DFactory */].findRuntime(settingsJSON);
            if (!runtime) {
                throw new Error('Unknown settings JSON');
            }
            return runtime.createModelSettings(settingsJSON);
        });
    }
    static zipReader(data, url) {
        return ZipLoader_awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
    }
    static getFilePaths(reader) {
        return ZipLoader_awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
    }
    static getFiles(reader, paths) {
        return ZipLoader_awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
    }
    static readText(reader, path) {
        return ZipLoader_awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
    }
    static releaseReader(reader) {
        // this method is optional
    }
}
ZipLoader_ZipLoader.ZIP_PROTOCOL = 'zip://';
ZipLoader_ZipLoader.uid = 0;
ZipLoader_ZipLoader.factory = (context, next) => ZipLoader_awaiter(void 0, void 0, void 0, function* () {
    const source = context.source;
    let sourceURL;
    let zipBlob;
    let settings;
    if (typeof source === 'string' && (source.endsWith('.zip') || source.startsWith(ZipLoader_ZipLoader.ZIP_PROTOCOL))) {
        if (source.startsWith(ZipLoader_ZipLoader.ZIP_PROTOCOL)) {
            sourceURL = source.slice(ZipLoader_ZipLoader.ZIP_PROTOCOL.length);
        }
        else {
            sourceURL = source;
        }
        zipBlob = yield Live2DLoader["a" /* Live2DLoader */].load({
            url: sourceURL,
            type: 'blob',
            target: context.live2dModel,
        });
    }
    else if (Array.isArray(source)
        && source.length === 1
        && source[0] instanceof File
        && source[0].name.endsWith('.zip')) {
        zipBlob = source[0];
        sourceURL = URL.createObjectURL(zipBlob);
        settings = source.settings;
    }
    if (zipBlob) {
        if (!zipBlob.size) {
            throw new Error('Empty zip file');
        }
        const reader = yield ZipLoader_ZipLoader.zipReader(zipBlob, sourceURL);
        if (!settings) {
            settings = yield ZipLoader_ZipLoader.createSettings(reader);
        }
        // a fake URL, the only requirement is it should be unique,
        // as FileLoader will use it as the ID of all uploaded files
        settings._objectURL = ZipLoader_ZipLoader.ZIP_PROTOCOL + ZipLoader_ZipLoader.uid + '/' + settings.url;
        const files = yield ZipLoader_ZipLoader.unzip(reader, settings);
        files.settings = settings;
        // pass files to the FileLoader
        context.source = files;
        // clean up when destroying the model
        if (sourceURL.startsWith('blob:')) {
            context.live2dModel.once('modelLoaded', (internalModel) => {
                internalModel.once('destroy', function () {
                    URL.revokeObjectURL(sourceURL);
                });
            });
        }
        ZipLoader_ZipLoader.releaseReader(reader);
    }
    return next();
});
Live2DFactory["a" /* Live2DFactory */].live2DModelMiddlewares.unshift(ZipLoader_ZipLoader.factory);

// CONCATENATED MODULE: ./src/factory/index.ts






// CONCATENATED MODULE: ./src/common.ts
/// <reference path="../core/live2d.d.ts"/>
/// <reference path="../core/live2dcubismcore.d.ts"/>
/// <reference path="../cubism/src/CubismSpec.d.ts"/>
/// <reference path="types/Cubism2Spec.d.ts"/>
/// <reference path="types/helpers.d.ts"/>
/// <reference path="types/shim.d.ts"/>








// EXTERNAL MODULE: external {"commonjs":"@pixi/graphics","commonjs2":"@pixi/graphics","amd":"@pixi/graphics","root":"PIXI"}
var graphics_root_PIXI_ = __webpack_require__(35);

// EXTERNAL MODULE: external {"commonjs":"@pixi/text","commonjs2":"@pixi/text","amd":"@pixi/text","root":"PIXI"}
var text_root_PIXI_ = __webpack_require__(24);

// CONCATENATED MODULE: ./src/tools/HitAreaFrames.ts



const tempBounds = new math_root_PIXI_["Rectangle"]();
class HitAreaFrames_HitAreaFrames extends graphics_root_PIXI_["Graphics"] {
    constructor() {
        super();
        this.initialized = false;
        this.texts = [];
        this.strokeWidth = 4;
        this.normalColor = 0xE31A1A;
        this.activeColor = 0x1EC832;
        this.interactive = true;
        this.on('added', this.init).on('pointermove', this.onPointerMove);
    }
    init() {
        const internalModel = this.parent.internalModel;
        const textStyle = new text_root_PIXI_["TextStyle"]({
            fontSize: 24,
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });
        this.texts = Object.keys(internalModel.hitAreas).map(hitAreaName => {
            const text = new text_root_PIXI_["Text"](hitAreaName, textStyle);
            text.visible = false;
            this.addChild(text);
            return text;
        });
    }
    onPointerMove(e) {
        const hitAreaNames = this.parent.hitTest(e.data.global.x, e.data.global.y);
        this.texts.forEach(text => {
            text.visible = hitAreaNames.includes(text.text);
        });
    }
    /** @override */
    _render(renderer) {
        const internalModel = this.parent.internalModel;
        // extract scale from the transform matrix, and invert it to ease following calculation
        // https://math.stackexchange.com/a/13165
        const scale = 1 / Math.sqrt(Math.pow(this.transform.worldTransform.a, 2) + Math.pow(this.transform.worldTransform.b, 2));
        this.texts.forEach(text => {
            (
            // correct the type definition of this method, the official definition is wrong!
            this.lineStyle)({
                width: this.strokeWidth * scale,
                color: text.visible ? this.activeColor : this.normalColor,
            });
            const bounds = internalModel.getDrawableBounds(internalModel.hitAreas[text.text].index, tempBounds);
            const transform = internalModel.localTransform;
            bounds.x = bounds.x * transform.a + transform.tx;
            bounds.y = bounds.y * transform.d + transform.ty;
            bounds.width = bounds.width * transform.a;
            bounds.height = bounds.height * transform.d;
            this.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
            text.x = bounds.x + this.strokeWidth * scale;
            text.y = bounds.y + this.strokeWidth * scale;
            text.scale.set(scale);
        });
        super._render(renderer);
        this.clear();
    }
}

// CONCATENATED MODULE: ./src/common-browser.ts




/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__(48),
    pullAll = __webpack_require__(62);

/**
 * Removes all given values from `array` using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
 * to remove elements from an array by predicate.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {...*} [values] The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pull(array, 'a', 'c');
 * console.log(array);
 * // => ['b', 'b']
 */
var pull = baseRest(pullAll);

module.exports = pull;


/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__34__;

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__35__;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(11);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(21),
    isObject = __webpack_require__(26);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(55)))

/***/ }),
/* 39 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),
/* 40 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),
/* 41 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var identity = __webpack_require__(25),
    overRest = __webpack_require__(49),
    setToString = __webpack_require__(51);

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__(50);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),
/* 50 */
/***/ (function(module, exports) {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

var baseSetToString = __webpack_require__(52),
    shortOut = __webpack_require__(61);

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var constant = __webpack_require__(53),
    defineProperty = __webpack_require__(36),
    identity = __webpack_require__(25);

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),
/* 53 */
/***/ (function(module, exports) {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(37),
    isMasked = __webpack_require__(58),
    isObject = __webpack_require__(26),
    toSource = __webpack_require__(39);

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),
/* 55 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(22);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 57 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(59);

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(9);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),
/* 60 */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),
/* 61 */
/***/ (function(module, exports) {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var basePullAll = __webpack_require__(63);

/**
 * This method is like `_.pull` except that it accepts an array of values to remove.
 *
 * **Note:** Unlike `_.difference`, this method mutates `array`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @returns {Array} Returns `array`.
 * @example
 *
 * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
 *
 * _.pullAll(array, ['a', 'c']);
 * console.log(array);
 * // => ['b', 'b']
 */
function pullAll(array, values) {
  return (array && array.length && values && values.length)
    ? basePullAll(array, values)
    : array;
}

module.exports = pullAll;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__(40),
    baseIndexOf = __webpack_require__(64),
    baseIndexOfWith = __webpack_require__(68),
    baseUnary = __webpack_require__(41),
    copyArray = __webpack_require__(69);

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * The base implementation of `_.pullAllBy` without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns `array`.
 */
function basePullAll(array, values, iteratee, comparator) {
  var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
      index = -1,
      length = values.length,
      seen = array;

  if (array === values) {
    values = copyArray(values);
  }
  if (iteratee) {
    seen = arrayMap(array, baseUnary(iteratee));
  }
  while (++index < length) {
    var fromIndex = 0,
        value = values[index],
        computed = iteratee ? iteratee(value) : value;

    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
      if (seen !== array) {
        splice.call(seen, fromIndex, 1);
      }
      splice.call(array, fromIndex, 1);
    }
  }
  return array;
}

module.exports = basePullAll;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var baseFindIndex = __webpack_require__(65),
    baseIsNaN = __webpack_require__(66),
    strictIndexOf = __webpack_require__(67);

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

module.exports = baseIndexOf;


/***/ }),
/* 65 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;


/***/ }),
/* 66 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

module.exports = baseIsNaN;


/***/ }),
/* 67 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = strictIndexOf;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

/**
 * This function is like `baseIndexOf` except that it accepts a comparator.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOfWith(array, value, fromIndex, comparator) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (comparator(array[index], value)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOfWith;


/***/ }),
/* 69 */
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const originalUpdateParam = Live2DMotion.prototype.updateParam;
Live2DMotion.prototype.updateParam = function (model, entry) {
    originalUpdateParam.call(this, model, entry);
    if (entry.isFinished() && this.onFinishHandler) {
        this.onFinishHandler(this);
        delete this.onFinishHandler;
    }
};


/***/ }),
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "a", function() { return /* reexport */ Cubism2ExpressionManager_Cubism2ExpressionManager; });
__webpack_require__.d(__webpack_exports__, "b", function() { return /* reexport */ Cubism2InternalModel_Cubism2InternalModel; });
__webpack_require__.d(__webpack_exports__, "c", function() { return /* reexport */ Cubism2ModelSettings_Cubism2ModelSettings; });
__webpack_require__.d(__webpack_exports__, "d", function() { return /* reexport */ Cubism2MotionManager_Cubism2MotionManager; });
__webpack_require__.d(__webpack_exports__, "e", function() { return /* reexport */ Live2DExpression_Live2DExpression; });
__webpack_require__.d(__webpack_exports__, "f", function() { return /* reexport */ Live2DEyeBlink_Live2DEyeBlink; });
__webpack_require__.d(__webpack_exports__, "g", function() { return /* reexport */ Live2DPhysics; });
__webpack_require__.d(__webpack_exports__, "h", function() { return /* reexport */ Live2DPose_Live2DPose; });

// EXTERNAL MODULE: ./src/cubism2/check-runtime.ts
var check_runtime = __webpack_require__(87);

// EXTERNAL MODULE: ./src/cubism2/patch-motion.ts
var patch_motion = __webpack_require__(70);

// EXTERNAL MODULE: ./src/cubism-common/ExpressionManager.ts
var ExpressionManager = __webpack_require__(13);

// EXTERNAL MODULE: ./src/config.ts
var config = __webpack_require__(1);

// CONCATENATED MODULE: ./src/cubism2/Live2DExpression.ts

class Live2DExpression_Live2DExpression extends AMotion {
    constructor(json) {
        super();
        this.params = [];
        this.setFadeIn(json.fade_in > 0 ? json.fade_in : config["b" /* config */].expressionFadingDuration);
        this.setFadeOut(json.fade_out > 0 ? json.fade_out : config["b" /* config */].expressionFadingDuration);
        if (Array.isArray(json.params)) {
            json.params.forEach(param => {
                const calc = param.calc || 'add';
                if (calc === 'add') {
                    const defaultValue = param.def || 0;
                    param.val -= defaultValue;
                }
                else if (calc === 'mult') {
                    const defaultValue = param.def || 1;
                    param.val /= defaultValue;
                }
                this.params.push({
                    calc,
                    val: param.val,
                    id: param.id,
                });
            });
        }
    }
    /** @override */
    updateParamExe(model, time, weight, motionQueueEnt) {
        this.params.forEach(param => {
            // this algorithm seems to be broken for newer Neptunia series models, have no idea
            //
            // switch (param.type) {
            //     case ParamCalcType.Set:
            //         model.setParamFloat(param.id, param.value, weight);
            //         break;
            //     case ParamCalcType.Add:
            //         model.addToParamFloat(param.id, param.value * weight);
            //         break;
            //     case ParamCalcType.Mult:
            //         model.multParamFloat(param.id, param.value, weight);
            //         break;
            // }
            // this works fine for any model
            model.setParamFloat(param.id, param.val * weight);
        });
    }
}

// CONCATENATED MODULE: ./src/cubism2/Cubism2ExpressionManager.ts


class Cubism2ExpressionManager_Cubism2ExpressionManager extends ExpressionManager["a" /* ExpressionManager */] {
    constructor(settings, options) {
        var _a;
        super(settings, options);
        this.queueManager = new MotionQueueManager();
        this.definitions = (_a = this.settings.expressions) !== null && _a !== void 0 ? _a : [];
        this.init();
    }
    isFinished() {
        return this.queueManager.isFinished();
    }
    getExpressionIndex(name) {
        return this.definitions.findIndex(def => def.name === name);
    }
    getExpressionFile(definition) {
        return definition.file;
    }
    createExpression(data, definition) {
        return new Live2DExpression_Live2DExpression(data);
    }
    _setExpression(motion) {
        return this.queueManager.startMotion(motion);
    }
    stopAllExpressions() {
        this.queueManager.stopAllMotions();
    }
    updateParameters(model, dt) {
        return this.queueManager.updateParam(model);
    }
}

// EXTERNAL MODULE: ./src/cubism-common/InternalModel.ts
var InternalModel = __webpack_require__(16);

// EXTERNAL MODULE: ./src/cubism-common/MotionManager.ts
var MotionManager = __webpack_require__(15);

// CONCATENATED MODULE: ./src/cubism2/Cubism2MotionManager.ts




class Cubism2MotionManager_Cubism2MotionManager extends MotionManager["a" /* MotionManager */] {
    constructor(settings, options) {
        super(settings, options);
        this.groups = { idle: 'idle' };
        this.motionDataType = 'arraybuffer';
        this.queueManager = new MotionQueueManager();
        this.definitions = this.settings.motions;
        this.init(options);
    }
    init(options) {
        super.init(options);
        if (this.settings.expressions) {
            this.expressionManager = new Cubism2ExpressionManager_Cubism2ExpressionManager(this.settings, options);
        }
    }
    isFinished() {
        return this.queueManager.isFinished();
    }
    createMotion(data, group, definition) {
        const motion = Live2DMotion.loadMotion(data);
        const defaultFadingDuration = group === this.groups.idle
            ? config["b" /* config */].idleMotionFadingDuration
            : config["b" /* config */].motionFadingDuration;
        motion.setFadeIn(definition.fade_in > 0 ? definition.fade_in : defaultFadingDuration);
        motion.setFadeOut(definition.fade_out > 0 ? definition.fade_out : defaultFadingDuration);
        return motion;
    }
    getMotionFile(definition) {
        return definition.file;
    }
    getMotionName(definition) {
        return definition.file;
    }
    getSoundFile(definition) {
        return definition.sound;
    }
    _startMotion(motion, onFinish) {
        motion.onFinishHandler = onFinish;
        this.queueManager.stopAllMotions();
        return this.queueManager.startMotion(motion);
    }
    _stopAllMotions() {
        this.queueManager.stopAllMotions();
    }
    updateParameters(model, now) {
        return this.queueManager.updateParam(model);
    }
    destroy() {
        super.destroy();
        this.queueManager = undefined;
    }
}

// EXTERNAL MODULE: ./src/utils/index.ts + 4 modules
var utils = __webpack_require__(0);

// CONCATENATED MODULE: ./src/cubism2/Live2DEyeBlink.ts

var EyeState;
(function (EyeState) {
    EyeState[EyeState["Idle"] = 0] = "Idle";
    EyeState[EyeState["Closing"] = 1] = "Closing";
    EyeState[EyeState["Closed"] = 2] = "Closed";
    EyeState[EyeState["Opening"] = 3] = "Opening";
})(EyeState || (EyeState = {}));
class Live2DEyeBlink_Live2DEyeBlink {
    constructor(coreModel) {
        this.coreModel = coreModel;
        this.blinkInterval = 4000;
        this.closingDuration = 100;
        this.closedDuration = 50;
        this.openingDuration = 150;
        this.eyeState = EyeState.Idle;
        this.eyeParamValue = 1;
        this.closedTimer = 0;
        this.nextBlinkTimeLeft = this.blinkInterval;
        this.leftParam = coreModel.getParamIndex('PARAM_EYE_L_OPEN');
        this.rightParam = coreModel.getParamIndex('PARAM_EYE_R_OPEN');
    }
    setEyeParams(value) {
        this.eyeParamValue = Object(utils["b" /* clamp */])(value, 0, 1);
        this.coreModel.setParamFloat(this.leftParam, this.eyeParamValue);
        this.coreModel.setParamFloat(this.rightParam, this.eyeParamValue);
    }
    update(dt) {
        switch (this.eyeState) {
            case EyeState.Idle:
                this.nextBlinkTimeLeft -= dt;
                if (this.nextBlinkTimeLeft < 0) {
                    this.eyeState = EyeState.Closing;
                    this.nextBlinkTimeLeft =
                        this.blinkInterval +
                            this.closingDuration +
                            this.closedDuration +
                            this.openingDuration +
                            Object(utils["g" /* rand */])(0, 2000);
                }
                break;
            case EyeState.Closing:
                this.setEyeParams(this.eyeParamValue + dt / this.closingDuration);
                if (this.eyeParamValue <= 0) {
                    this.eyeState = EyeState.Closed;
                    this.closedTimer = 0;
                }
                break;
            case EyeState.Closed:
                this.closedTimer += dt;
                if (this.closedTimer >= this.closedDuration) {
                    this.eyeState = EyeState.Opening;
                }
                break;
            case EyeState.Opening:
                this.setEyeParams(this.eyeParamValue + dt / this.openingDuration);
                if (this.eyeParamValue >= 1) {
                    this.eyeState = EyeState.Idle;
                }
        }
    }
}

// CONCATENATED MODULE: ./src/cubism2/Cubism2InternalModel.ts



// prettier-ignore
const tempMatrixArray = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]);
class Cubism2InternalModel_Cubism2InternalModel extends InternalModel["a" /* InternalModel */] {
    constructor(coreModel, settings, options) {
        super();
        this.textureFlipY = true;
        /**
         * Number of the drawables in this model.
         */
        this.drawDataCount = 0;
        /**
         * If true, the face culling will always be disabled when drawing the model,
         * regardless of the model's internal flags.
         */
        this.disableCulling = false;
        this.coreModel = coreModel;
        this.settings = settings;
        this.motionManager = new Cubism2MotionManager_Cubism2MotionManager(settings, options);
        this.eyeBlink = new Live2DEyeBlink_Live2DEyeBlink(coreModel);
        this.eyeballXParamIndex = coreModel.getParamIndex('PARAM_EYE_BALL_X');
        this.eyeballYParamIndex = coreModel.getParamIndex('PARAM_EYE_BALL_Y');
        this.angleXParamIndex = coreModel.getParamIndex('PARAM_ANGLE_X');
        this.angleYParamIndex = coreModel.getParamIndex('PARAM_ANGLE_Y');
        this.angleZParamIndex = coreModel.getParamIndex('PARAM_ANGLE_Z');
        this.bodyAngleXParamIndex = coreModel.getParamIndex('PARAM_BODY_ANGLE_X');
        this.breathParamIndex = coreModel.getParamIndex('PARAM_BREATH');
        this.init();
    }
    init() {
        super.init();
        if (this.settings.initParams) {
            this.settings.initParams.forEach(({ id, value }) => this.coreModel.setParamFloat(id, value));
        }
        if (this.settings.initOpacities) {
            this.settings.initOpacities.forEach(({ id, value }) => this.coreModel.setPartsOpacity(id, value));
        }
        this.coreModel.saveParam();
        const arr = this.coreModel.getModelContext()._$aS;
        if (arr === null || arr === void 0 ? void 0 : arr.length) {
            this.drawDataCount = arr.length;
        }
        let culling = this.coreModel.drawParamWebGL.culling;
        Object.defineProperty(this.coreModel.drawParamWebGL, 'culling', {
            set: (v) => culling = v,
            // always return false when disabled
            get: () => this.disableCulling ? false : culling,
        });
        const clipManager = this.coreModel.getModelContext().clipManager;
        const originalSetupClip = clipManager.setupClip;
        // after setupClip(), the GL viewport will be set to [0, 0, canvas.width, canvas.height],
        // so we have to set it back
        clipManager.setupClip = (modelContext, drawParam) => {
            originalSetupClip.call(clipManager, modelContext, drawParam);
            drawParam.gl.viewport(...this.viewport);
        };
    }
    getSize() {
        return [this.coreModel.getCanvasWidth(), this.coreModel.getCanvasHeight()];
    }
    getLayout() {
        const layout = this.settings.layout || {};
        return Object.assign(Object.assign({}, layout), { centerX: layout.center_x, centerY: layout.center_y });
    }
    updateWebGLContext(gl, glContextID) {
        const drawParamWebGL = this.coreModel.drawParamWebGL;
        drawParamWebGL.firstDraw = true;
        drawParamWebGL.setGL(gl);
        drawParamWebGL.glno = glContextID;
        // reset WebGL buffers
        for (const prop in drawParamWebGL) {
            if (drawParamWebGL.hasOwnProperty(prop) && drawParamWebGL[prop] instanceof WebGLBuffer) {
                drawParamWebGL[prop] = null;
            }
        }
        const clipManager = this.coreModel.getModelContext().clipManager;
        clipManager.curFrameNo = glContextID;
        const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        // force Live2D to re-create the framebuffer
        clipManager.getMaskRenderTexture();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    }
    bindTexture(index, texture) {
        this.coreModel.setTexture(index, texture);
    }
    getHitAreaDefs() {
        var _a;
        return ((_a = this.settings.hitAreas) === null || _a === void 0 ? void 0 : _a.map(hitArea => ({
            id: hitArea.id,
            name: hitArea.name,
            index: this.coreModel.getDrawDataIndex(hitArea.id),
        }))) || [];
    }
    getDrawableIDs() {
        const modelContext = this.coreModel.getModelContext();
        const ids = [];
        for (let i = 0; i < this.drawDataCount; i++) {
            const drawData = modelContext.getDrawData(i);
            if (drawData) {
                ids.push(drawData.getDrawDataID().id);
            }
        }
        return ids;
    }
    getDrawableIndex(id) {
        return this.coreModel.getDrawDataIndex(id);
    }
    getDrawableVertices(drawIndex) {
        if (typeof drawIndex === 'string') {
            drawIndex = this.coreModel.getDrawDataIndex(drawIndex);
            if (drawIndex === -1)
                throw new TypeError('Unable to find drawable ID: ' + drawIndex);
        }
        return this.coreModel.getTransformedPoints(drawIndex).slice();
    }
    update(dt, now) {
        var _a, _b, _c;
        super.update(dt, now);
        const model = this.coreModel;
        this.emit('beforeMotionUpdate');
        const motionUpdated = this.motionManager.update(this.coreModel, now);
        this.emit('afterMotionUpdate');
        model.saveParam();
        if (!motionUpdated) {
            (_a = this.eyeBlink) === null || _a === void 0 ? void 0 : _a.update(dt);
        }
        this.updateFocus();
        this.updateNaturalMovements(dt, now);
        (_b = this.physics) === null || _b === void 0 ? void 0 : _b.update(now);
        (_c = this.pose) === null || _c === void 0 ? void 0 : _c.update(dt);
        this.emit('beforeModelUpdate');
        model.update();
        model.loadParam();
    }
    updateFocus() {
        this.coreModel.addToParamFloat(this.eyeballXParamIndex, this.focusController.x);
        this.coreModel.addToParamFloat(this.eyeballYParamIndex, this.focusController.y);
        this.coreModel.addToParamFloat(this.angleXParamIndex, this.focusController.x * 30);
        this.coreModel.addToParamFloat(this.angleYParamIndex, this.focusController.y * 30);
        this.coreModel.addToParamFloat(this.angleZParamIndex, this.focusController.x * this.focusController.y * -30);
        this.coreModel.addToParamFloat(this.bodyAngleXParamIndex, this.focusController.x * 10);
    }
    updateNaturalMovements(dt, now) {
        const t = (now / 1000) * 2 * Math.PI;
        this.coreModel.addToParamFloat(this.angleXParamIndex, 15 * Math.sin(t / 6.5345) * 0.5);
        this.coreModel.addToParamFloat(this.angleYParamIndex, 8 * Math.sin(t / 3.5345) * 0.5);
        this.coreModel.addToParamFloat(this.angleZParamIndex, 10 * Math.sin(t / 5.5345) * 0.5);
        this.coreModel.addToParamFloat(this.bodyAngleXParamIndex, 4 * Math.sin(t / 15.5345) * 0.5);
        this.coreModel.setParamFloat(this.breathParamIndex, 0.5 + 0.5 * Math.sin(t / 3.2345));
    }
    draw(gl) {
        const disableCulling = this.disableCulling;
        // culling must be disabled to get this cubism2 model drawn properly on a framebuffer
        if (gl.getParameter(gl.FRAMEBUFFER_BINDING)) {
            this.disableCulling = true;
        }
        const matrix = this.drawingMatrix;
        // set given 3x3 matrix into a 4x4 matrix
        tempMatrixArray[0] = matrix.a;
        tempMatrixArray[1] = matrix.b;
        tempMatrixArray[4] = matrix.c;
        tempMatrixArray[5] = matrix.d;
        tempMatrixArray[12] = matrix.tx;
        tempMatrixArray[13] = matrix.ty;
        this.coreModel.setMatrix(tempMatrixArray);
        this.coreModel.draw();
        this.disableCulling = disableCulling;
    }
    destroy() {
        super.destroy();
        // cubism2 core has a super dumb memory management so there's basically nothing much to do to release the model
        this.coreModel = undefined;
    }
}

// EXTERNAL MODULE: ./src/cubism-common/ModelSettings.ts
var ModelSettings = __webpack_require__(14);

// CONCATENATED MODULE: ./src/cubism2/Cubism2ModelSettings.ts


class Cubism2ModelSettings_Cubism2ModelSettings extends ModelSettings["a" /* ModelSettings */] {
    constructor(json) {
        super(json);
        this.motions = {};
        if (!Cubism2ModelSettings_Cubism2ModelSettings.isValidJSON(json)) {
            throw new TypeError('Invalid JSON.');
        }
        this.moc = json.model;
        // copy textures array
        Object(utils["c" /* copyArray */])('string', json, this, 'textures', 'textures');
        this.copy(json);
    }
    /**
     * Checks if a JSON object is valid model settings.
     * @param json
     */
    static isValidJSON(json) {
        var _a;
        // should always return a boolean
        return !!json
            && typeof json.model === 'string'
            && ((_a = json.textures) === null || _a === void 0 ? void 0 : _a.length) > 0
            // textures must be an array of strings
            && json.textures.every((item) => typeof item === 'string');
    }
    /**
     * Validates and copies *optional* properties from raw JSON.
     */
    copy(json) {
        Object(utils["d" /* copyProperty */])('string', json, this, 'name', 'name');
        Object(utils["d" /* copyProperty */])('string', json, this, 'pose', 'pose');
        Object(utils["d" /* copyProperty */])('string', json, this, 'physics', 'physics');
        Object(utils["d" /* copyProperty */])('object', json, this, 'layout', 'layout');
        Object(utils["d" /* copyProperty */])('object', json, this, 'motions', 'motions');
        Object(utils["c" /* copyArray */])('object', json, this, 'hit_areas', 'hitAreas');
        Object(utils["c" /* copyArray */])('object', json, this, 'expressions', 'expressions');
        Object(utils["c" /* copyArray */])('object', json, this, 'init_params', 'initParams');
        Object(utils["c" /* copyArray */])('object', json, this, 'init_opacities', 'initOpacities');
    }
    replaceFiles(replace) {
        super.replaceFiles(replace);
        for (const [group, motions] of Object.entries(this.motions)) {
            for (let i = 0; i < motions.length; i++) {
                motions[i].file = replace(motions[i].file, `motions.${group}[${i}].file`);
                if (motions[i].sound !== undefined) {
                    motions[i].sound = replace(motions[i].sound, `motions.${group}[${i}].sound`);
                }
            }
        }
        if (this.expressions) {
            for (let i = 0; i < this.expressions.length; i++) {
                this.expressions[i].file = replace(this.expressions[i].file, `expressions[${i}].file`);
            }
        }
    }
}

// CONCATENATED MODULE: ./src/cubism2/Live2DPhysics.ts
const SRC_TYPE_MAP = {
    x: PhysicsHair.Src.SRC_TO_X,
    y: PhysicsHair.Src.SRC_TO_Y,
    angle: PhysicsHair.Src.SRC_TO_G_ANGLE,
};
const TARGET_TYPE_MAP = {
    x: PhysicsHair.Src.SRC_TO_X,
    y: PhysicsHair.Src.SRC_TO_Y,
    angle: PhysicsHair.Src.SRC_TO_G_ANGLE,
};
class Live2DPhysics {
    constructor(coreModel, json) {
        this.coreModel = coreModel;
        this.physicsHairs = [];
        if (json.physics_hair) {
            this.physicsHairs = json.physics_hair.map(definition => {
                const physicsHair = new PhysicsHair();
                physicsHair.setup(definition.setup.length, definition.setup.regist, definition.setup.mass);
                definition.src.forEach(({ id, ptype, scale, weight }) => {
                    const type = SRC_TYPE_MAP[ptype];
                    if (type) {
                        physicsHair.addSrcParam(type, id, scale, weight);
                    }
                });
                definition.targets.forEach(({ id, ptype, scale, weight }) => {
                    const type = TARGET_TYPE_MAP[ptype];
                    if (type) {
                        physicsHair.addTargetParam(type, id, scale, weight);
                    }
                });
                return physicsHair;
            });
        }
    }
    update(elapsed) {
        this.physicsHairs.forEach(physicsHair => physicsHair.update(this.coreModel, elapsed));
    }
}

// CONCATENATED MODULE: ./src/cubism2/Live2DPose.ts

class Live2DPartsParam {
    constructor(id) {
        this.id = id;
        this.paramIndex = -1;
        this.partsIndex = -1;
        this.link = [];
    }
    initIndex(model) {
        this.paramIndex = model.getParamIndex('VISIBLE:' + this.id);
        this.partsIndex = model.getPartsDataIndex(PartsDataID.getID(this.id));
        model.setParamFloat(this.paramIndex, 1);
    }
}
class Live2DPose_Live2DPose {
    constructor(coreModel, json) {
        this.coreModel = coreModel;
        this.opacityAnimDuration = 500;
        this.partsGroups = [];
        if (json.parts_visible) {
            this.partsGroups = json.parts_visible.map(({ group }) => group.map(({ id, link }) => {
                const parts = new Live2DPartsParam(id);
                if (link) {
                    parts.link = link.map(l => new Live2DPartsParam(l));
                }
                return parts;
            }));
            this.init();
        }
    }
    init() {
        this.partsGroups.forEach(group => {
            group.forEach(parts => {
                parts.initIndex(this.coreModel);
                if (parts.paramIndex >= 0) {
                    const visible = this.coreModel.getParamFloat(parts.paramIndex) !== 0;
                    this.coreModel.setPartsOpacity(parts.partsIndex, visible ? 1 : 0);
                    this.coreModel.setParamFloat(parts.paramIndex, visible ? 1 : 0);
                    if (parts.link.length > 0) {
                        parts.link.forEach(p => p.initIndex(this.coreModel));
                    }
                }
            });
        });
    }
    normalizePartsOpacityGroup(partsGroup, dt) {
        const model = this.coreModel;
        const phi = 0.5;
        const maxBackOpacity = 0.15;
        let visibleOpacity = 1;
        let visibleIndex = partsGroup.findIndex(({ paramIndex, partsIndex }) => partsIndex >= 0 && model.getParamFloat(paramIndex) !== 0);
        if (visibleIndex >= 0) {
            const originalOpacity = model.getPartsOpacity(partsGroup[visibleIndex].partsIndex);
            visibleOpacity = Object(utils["b" /* clamp */])(originalOpacity + dt / this.opacityAnimDuration, 0, 1);
        }
        else {
            visibleIndex = 0;
            visibleOpacity = 1;
        }
        partsGroup.forEach(({ partsIndex }, index) => {
            if (partsIndex >= 0) {
                if (visibleIndex == index) {
                    model.setPartsOpacity(partsIndex, visibleOpacity);
                }
                else {
                    let opacity = model.getPartsOpacity(partsIndex);
                    // I can't understand this part, so just leave it original
                    let a1;
                    if (visibleOpacity < phi) {
                        a1 = (visibleOpacity * (phi - 1)) / phi + 1;
                    }
                    else {
                        a1 = ((1 - visibleOpacity) * phi) / (1 - phi);
                    }
                    let backOp = (1 - a1) * (1 - visibleOpacity);
                    if (backOp > maxBackOpacity) {
                        a1 = 1 - maxBackOpacity / (1 - visibleOpacity);
                    }
                    if (opacity > a1) {
                        opacity = a1;
                    }
                    model.setPartsOpacity(partsIndex, opacity);
                }
            }
        });
    }
    copyOpacity(partsGroup) {
        const model = this.coreModel;
        partsGroup.forEach(({ partsIndex, link }) => {
            if (partsIndex >= 0 && link) {
                const opacity = model.getPartsOpacity(partsIndex);
                link.forEach(({ partsIndex }) => {
                    if (partsIndex >= 0) {
                        model.setPartsOpacity(partsIndex, opacity);
                    }
                });
            }
        });
    }
    update(dt) {
        this.partsGroups.forEach(partGroup => {
            this.normalizePartsOpacityGroup(partGroup, dt);
            this.copyOpacity(partGroup);
        });
    }
}

// EXTERNAL MODULE: ./src/factory/Live2DFactory.ts + 2 modules
var Live2DFactory = __webpack_require__(5);

// CONCATENATED MODULE: ./src/cubism2/factory.ts





Live2DFactory["a" /* Live2DFactory */].registerRuntime({
    version: 2,
    test(source) {
        return source instanceof Cubism2ModelSettings_Cubism2ModelSettings || Cubism2ModelSettings_Cubism2ModelSettings.isValidJSON(source);
    },
    ready() {
        return Promise.resolve();
    },
    isValidMoc(modelData) {
        if (modelData.byteLength < 3) {
            return false;
        }
        const view = new Int8Array(modelData, 0, 3);
        return String.fromCharCode(...view) === 'moc';
    },
    createModelSettings(json) {
        return new Cubism2ModelSettings_Cubism2ModelSettings(json);
    },
    createCoreModel(data) {
        const model = Live2DModelWebGL.loadModel(data);
        const error = Live2D.getError();
        if (error)
            throw error;
        return model;
    },
    createInternalModel(coreModel, settings, options) {
        return new Cubism2InternalModel_Cubism2InternalModel(coreModel, settings, options);
    },
    createPose(coreModel, data) {
        return new Live2DPose_Live2DPose(coreModel, data);
    },
    createPhysics(coreModel, data) {
        return new Live2DPhysics(coreModel, data);
    },
});

// CONCATENATED MODULE: ./src/cubism2/index.ts













/***/ }),
/* 86 */,
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

if (!window.Live2D) {
    throw new Error('Cannot find Cubism 2 runtime. Did you forget to include the live2d.min.js?');
}


/***/ }),
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(32);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LOGICAL_WIDTH", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["h"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LOGICAL_HEIGHT", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["g"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpressionManager", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["a"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FocusController", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["c"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ModelSettings", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["m"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MotionPriority", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["p"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MotionState", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["q"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MotionPreloadStrategy", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["o"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MotionManager", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["n"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SoundManager", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["r"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InternalModel", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["f"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DModel", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["k"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DTransform", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["l"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InteractionMixin", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["e"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "config", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["x"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VERSION", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["s"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DFactory", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["i"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DLoader", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["j"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "XHRLoader", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["t"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FileLoader", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["b"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ZipLoader", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["u"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "logger", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["B"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "clamp", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["w"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "rand", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["C"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "copyProperty", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["z"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "copyArray", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["y"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "applyMixins", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["v"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "folderName", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["A"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HitAreaFrames", function() { return _common__WEBPACK_IMPORTED_MODULE_0__["d"]; });

/* harmony import */ var _cubism2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(85);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cubism2ExpressionManager", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["a"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cubism2InternalModel", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["b"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cubism2ModelSettings", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["c"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cubism2MotionManager", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["d"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DExpression", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["e"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DEyeBlink", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["f"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DPhysics", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["g"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Live2DPose", function() { return _cubism2__WEBPACK_IMPORTED_MODULE_1__["h"]; });





/***/ })
/******/ ]);
});
//# sourceMappingURL=cubism2.js.map