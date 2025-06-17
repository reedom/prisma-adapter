"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PrismaAdapter_option, _PrismaAdapter_prisma, _PrismaAdapter_open, _PrismaAdapter_loadPolicyLine, _PrismaAdapter_savePolicyLine;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAdapter = void 0;
const casbin_1 = require("casbin");
const client_1 = require("@prisma/client");
class PrismaAdapter {
    isFiltered() {
        return this.filtered;
    }
    enableFiltered(enabled) {
        this.filtered = enabled;
    }
    /**
     * @param option It should be PrismaClientOptions or PrismaClient.
     * You should later call open() to activate it.
     */
    constructor(option) {
        _PrismaAdapter_option.set(this, void 0);
        _PrismaAdapter_prisma.set(this, void 0);
        this.filtered = false;
        _PrismaAdapter_open.set(this, () => __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _PrismaAdapter_option, "f")) {
                __classPrivateFieldSet(this, _PrismaAdapter_option, {}, "f");
            }
            if (!__classPrivateFieldGet(this, _PrismaAdapter_prisma, "f")) {
                __classPrivateFieldSet(this, _PrismaAdapter_prisma, new client_1.PrismaClient(__classPrivateFieldGet(this, _PrismaAdapter_option, "f")), "f");
            }
            yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").$connect();
        }));
        _PrismaAdapter_loadPolicyLine.set(this, (line, model) => {
            const result = line.ptype +
                ', ' +
                [line.v0, line.v1, line.v2, line.v3, line.v4, line.v5]
                    .filter((n) => n)
                    .join(', ');
            casbin_1.Helper.loadPolicyLine(result, model);
        });
        _PrismaAdapter_savePolicyLine.set(this, (ptype, rule) => {
            const line = { ptype };
            if (rule.length > 0) {
                line.v0 = rule[0];
            }
            if (rule.length > 1) {
                line.v1 = rule[1];
            }
            if (rule.length > 2) {
                line.v2 = rule[2];
            }
            if (rule.length > 3) {
                line.v3 = rule[3];
            }
            if (rule.length > 4) {
                line.v4 = rule[4];
            }
            if (rule.length > 5) {
                line.v5 = rule[5];
            }
            return line;
        });
        if (option instanceof client_1.PrismaClient) {
            __classPrivateFieldSet(this, _PrismaAdapter_prisma, option, "f");
        }
        else {
            __classPrivateFieldSet(this, _PrismaAdapter_option, option, "f");
        }
    }
    loadPolicy(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.findMany();
            for (const line of lines) {
                __classPrivateFieldGet(this, _PrismaAdapter_loadPolicyLine, "f").call(this, line, model);
            }
        });
    }
    /**
     * loadFilteredPolicy loads policy rules that match the filter from the storage;
     * use an empty string for selecting all values in a certain field.
     */
    loadFilteredPolicy(model, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereFilter = Object.keys(filter)
                .map((ptype) => {
                const policyPatterns = filter[ptype];
                return policyPatterns.map((policyPattern) => {
                    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ ptype }, (policyPattern[0] && { v0: policyPattern[0] })), (policyPattern[1] && { v1: policyPattern[1] })), (policyPattern[2] && { v2: policyPattern[2] })), (policyPattern[3] && { v3: policyPattern[3] })), (policyPattern[4] && { v4: policyPattern[4] })), (policyPattern[5] && { v5: policyPattern[5] }));
                });
            })
                .flat();
            const lines = yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.findMany({
                where: {
                    OR: whereFilter,
                },
            });
            lines.forEach((line) => __classPrivateFieldGet(this, _PrismaAdapter_loadPolicyLine, "f").call(this, line, model));
            this.enableFiltered(true);
        });
    }
    savePolicy(model) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").$executeRaw `DELETE FROM casbin_rule;`;
            const lines = [];
            const savePolicyType = (ptype) => {
                const astMap = model.model.get(ptype);
                if (astMap) {
                    for (const [ptype, ast] of astMap) {
                        for (const rule of ast.policy) {
                            const line = __classPrivateFieldGet(this, _PrismaAdapter_savePolicyLine, "f").call(this, ptype, rule);
                            lines.push(line);
                        }
                    }
                }
            };
            savePolicyType('p');
            savePolicyType('g');
            // https://github.com/prisma/prisma-client-js/issues/332
            yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.createMany({ data: lines });
            return true;
        });
    }
    addPolicy(sec, ptype, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = __classPrivateFieldGet(this, _PrismaAdapter_savePolicyLine, "f").call(this, ptype, rule);
            yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.create({ data: line });
        });
    }
    addPolicies(sec, ptype, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const processes = [];
            for (const rule of rules) {
                const line = __classPrivateFieldGet(this, _PrismaAdapter_savePolicyLine, "f").call(this, ptype, rule);
                const p = __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.create({ data: line });
                processes.push(p);
            }
            // https://github.com/prisma/prisma-client-js/issues/332
            yield Promise.all(processes);
        });
    }
    removePolicy(sec, ptype, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = __classPrivateFieldGet(this, _PrismaAdapter_savePolicyLine, "f").call(this, ptype, rule);
            yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.deleteMany({ where: line });
        });
    }
    removePolicies(sec, ptype, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            const processes = [];
            for (const rule of rules) {
                const line = __classPrivateFieldGet(this, _PrismaAdapter_savePolicyLine, "f").call(this, ptype, rule);
                const p = __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.deleteMany({ where: line });
                processes.push(p);
            }
            // https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/transactions#bulk-operations
            yield Promise.all(processes);
        });
    }
    removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const line = { ptype };
            const idx = fieldIndex + fieldValues.length;
            if (fieldIndex <= 0 && 0 < idx) {
                line.v0 = fieldValues[0 - fieldIndex];
            }
            if (fieldIndex <= 1 && 1 < idx) {
                line.v1 = fieldValues[1 - fieldIndex];
            }
            if (fieldIndex <= 2 && 2 < idx) {
                line.v2 = fieldValues[2 - fieldIndex];
            }
            if (fieldIndex <= 3 && 3 < idx) {
                line.v3 = fieldValues[3 - fieldIndex];
            }
            if (fieldIndex <= 4 && 4 < idx) {
                line.v4 = fieldValues[4 - fieldIndex];
            }
            if (fieldIndex <= 5 && 5 < idx) {
                line.v5 = fieldValues[5 - fieldIndex];
            }
            yield __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").casbinRule.deleteMany({ where: line });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _PrismaAdapter_prisma, "f").$disconnect();
        });
    }
    static newAdapter(option) {
        return __awaiter(this, void 0, void 0, function* () {
            const a = new PrismaAdapter(option);
            yield __classPrivateFieldGet(a, _PrismaAdapter_open, "f").call(a);
            return a;
        });
    }
}
exports.PrismaAdapter = PrismaAdapter;
_PrismaAdapter_option = new WeakMap(), _PrismaAdapter_prisma = new WeakMap(), _PrismaAdapter_open = new WeakMap(), _PrismaAdapter_loadPolicyLine = new WeakMap(), _PrismaAdapter_savePolicyLine = new WeakMap();
