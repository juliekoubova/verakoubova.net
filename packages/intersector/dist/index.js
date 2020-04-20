"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var stimulus_1 = require("stimulus");
var IntersectorController = /** @class */ (function (_super) {
    __extends(IntersectorController, _super);
    function IntersectorController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntersectorController.prototype.connect = function () {
        if (!window.IntersectionObserver) {
            return;
        }
        this.intersectionObserver = new IntersectionObserver(this.intersect.bind(this), { threshold: this.threshold });
    };
    IntersectorController.prototype.disconnect = function () {
        var _a;
        (_a = this.intersectionObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.intersectionObserver = undefined;
    };
    IntersectorController.prototype.observe = function (target) {
        var _a;
        (_a = this.intersectionObserver) === null || _a === void 0 ? void 0 : _a.observe(target);
    };
    IntersectorController.prototype.unobserve = function (target) {
        var _a;
        (_a = this.intersectionObserver) === null || _a === void 0 ? void 0 : _a.unobserve(target);
    };
    return IntersectorController;
}(stimulus_1.Controller));
exports.IntersectorController = IntersectorController;
//# sourceMappingURL=index.js.map