// 분석 날짜 값 객체 - 분석 날짜의 유효성 검증과 포맷팅을 담당
export class AnalysisDate {
  private readonly _value: Date;

  constructor(value?: string | Date) {
    if (value) {
      this._value = this.parseDate(value);
    } else {
      this._value = new Date();
    }
    this.validate();
  }

  get value(): Date {
    return new Date(this._value);
  }

  get dateString(): string {
    return this._value.toISOString().split('T')[0];
  }

  get year(): number {
    return this._value.getFullYear();
  }

  get month(): number {
    return this._value.getMonth() + 1;
  }

  get day(): number {
    return this._value.getDate();
  }

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) {
      return new Date(value);
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new Error('유효하지 않은 날짜 형식입니다.');
      }
      return parsed;
    }

    throw new Error('날짜는 Date 객체 또는 문자열이어야 합니다.');
  }

  private validate(): void {
    if (isNaN(this._value.getTime())) {
      throw new Error('유효하지 않은 날짜입니다.');
    }

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    if (this._value < oneYearAgo || this._value > oneYearLater) {
      throw new Error('분석 날짜는 현재 날짜 기준 1년 전후 범위 내여야 합니다.');
    }
  }

  equals(other: AnalysisDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  isSameDay(other: AnalysisDate): boolean {
    return this.dateString === other.dateString;
  }

  toString(): string {
    return this.dateString;
  }
}
