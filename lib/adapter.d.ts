import type { Adapter, Model } from 'casbin';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
export declare class PrismaAdapter implements Adapter {
    #private;
    filtered: boolean;
    isFiltered(): boolean;
    enableFiltered(enabled: boolean): void;
    /**
     * @param option It should be PrismaClientOptions or PrismaClient.
     * You should later call open() to activate it.
     */
    constructor(option?: Prisma.PrismaClientOptions | PrismaClient);
    loadPolicy(model: Model): Promise<void>;
    /**
     * loadFilteredPolicy loads policy rules that match the filter from the storage;
     * use an empty string for selecting all values in a certain field.
     */
    loadFilteredPolicy(model: Model, filter: {
        [key: string]: string[][];
    }): Promise<void>;
    savePolicy(model: Model): Promise<boolean>;
    addPolicy(sec: string, ptype: string, rule: string[]): Promise<void>;
    addPolicies(sec: string, ptype: string, rules: string[][]): Promise<void>;
    removePolicy(sec: string, ptype: string, rule: string[]): Promise<void>;
    removePolicies(sec: string, ptype: string, rules: string[][]): Promise<void>;
    removeFilteredPolicy(sec: string, ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<void>;
    close(): Promise<any>;
    static newAdapter(option?: Prisma.PrismaClientOptions | PrismaClient): Promise<PrismaAdapter>;
}
