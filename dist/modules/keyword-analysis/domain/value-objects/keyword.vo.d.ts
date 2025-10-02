export declare class Keyword {
    private readonly _value;
    constructor(value: string);
    get value(): string;
    private validate;
    private normalize;
    equals(other: Keyword): boolean;
    toString(): string;
}
