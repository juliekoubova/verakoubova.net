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
var ResizerController = /** @class */ (function (_super) {
    __extends(ResizerController, _super);
    function ResizerController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handler = _this.resized.bind(_this);
        return _this;
    }
    ResizerController.prototype.connect = function () {
        addEventListener('orientationchange', this.handler, { passive: true });
        addEventListener('resize', this.handler, { passive: true });
        this.resized();
    };
    ResizerController.prototype.disconnect = function () {
        removeEventListener('orientationchange', this.handler);
        removeEventListener('resize', this.handler);
    };
    return ResizerController;
}(stimulus_1.Controller));
exports.ResizerController = ResizerController;
//# sourceMappingURL=index.js.map