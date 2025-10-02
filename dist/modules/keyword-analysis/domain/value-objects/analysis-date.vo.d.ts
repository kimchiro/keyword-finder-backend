export declare class AnalysisDate {
    private readonly _value;
    constructor(value?: string | Date);
    get value(): Date;
    get dateString(): string;
    get year(): number;
    get month(): number;
    get day(): number;
    private parseDate;
    private validate;
    equals(other: AnalysisDate): boolean;
    isSameDay(other: AnalysisDate): boolean;
    toString(): string;
}
