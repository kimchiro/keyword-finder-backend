// 키워드 값 객체 - 키워드의 유효성 검증과 정규화를 담당
export class Keyword {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = this.normalize(value);
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('키워드는 문자열이어야 합니다.');
    }

    if (value.trim().length === 0) {
      throw new Error('키워드는 빈 문자열일 수 없습니다.');
    }

    if (value.length > 100) {
      throw new Error('키워드는 100자를 초과할 수 없습니다.');
    }

    // 특수문자 제한 (한글, 영문, 숫자, 공백, 일부 특수문자만 허용)
    const allowedPattern = /^[가-힣a-zA-Z0-9\s\-_().]+$/;
    if (!allowedPattern.test(value)) {
      throw new Error('키워드에 허용되지 않는 특수문자가 포함되어 있습니다.');
    }
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  equals(other: Keyword): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
