"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MomentPipe = void 0;
const core_1 = require("@angular/core");
const moment = require("moment");
let MomentPipe = class MomentPipe {
    transform(value, ...args) {
        if (value === undefined || value === null)
            return '';
        const [format] = args;
        if (format === "fromNow")
            return moment(value).fromNow();
        return moment(value).format(format);
    }
};
MomentPipe = __decorate([
    core_1.Pipe({
        name: 'momentPipe'
    })
], MomentPipe);
exports.MomentPipe = MomentPipe;
//# sourceMappingURL=momentPipe.js.map