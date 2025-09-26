import { describe, expect, it } from "vitest";

describe('circom matchers', () => {
  it('works', () => {
    expect(1).toEqual(1);
  });

  it('works for real', () => {
    expect(`
    pragma circom 2.2.2;
    template Test() {}
    component main = Test();
    `).toCircomExecOk();
  });

  it('works for real', () => {
    expect(`
    pragma circom 2.2.2;
    template Test() {}
    component main = Test();
    `).toCircomExecOk();
  });

  it('can receive an object', () => {
    expect({
      source: `
        pragma circom 2.2.2;
        template Test() {}
        component main = Test();
    `
    }).toCircomExecOk();
  });

  it('can receive an object with signals', () => {
    expect({
      source: `
        pragma circom 2.2.2;
        template Test() {}
        component main = Test();
    `,
      signals: {}
    }).toCircomExecOk();
  });

  it('can uses signals received', () => {
    expect({
      source: `
        pragma circom 2.2.2;
        template Test() {
          input signal a;
          a === 5;
        }
        component main = Test();
    `,
      signals: { a: '5'}
    }).toCircomExecOk();
  });
})
