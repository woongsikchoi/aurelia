import { expect } from 'chai';
import {
  ISignaler,
  LifecycleFlags
} from '@aurelia/runtime';
import { MockPropertySubscriber, eachCartesianJoinFactory } from '@aurelia/testing';
import { DI } from '@aurelia/kernel';

describe('ISignaler', function () {
  type $1 = [string, ISignaler, MockPropertySubscriber[]];
  type $2 = [string, string[]];
  type $3 = [string, LifecycleFlags];
  type $4 = [string, (sut: ISignaler) => void];
  type $5 = [string, (sut: ISignaler) => void];
  type $6 = [string, (sut: ISignaler) => void];

  const sutVariations: (() => [string, ISignaler, MockPropertySubscriber[]])[] = [
    () => {
      const sut = DI.createContainer().get(ISignaler);
      const subscribers = [
        new MockPropertySubscriber()
      ];
      return [`1 subscriber  `, sut, subscribers];
    },
    () => {
      const sut = DI.createContainer().get(ISignaler);
      const subscribers = [
        new MockPropertySubscriber(),
        new MockPropertySubscriber(),
        new MockPropertySubscriber()
      ];
      return [`3 subscribers `, sut, subscribers];
    }
  ];

  const signalsVariations: (($1: $1) => [string, string[]])[] = [
    () => {
      const signals = [];
      return [`[]                            `, signals];
    },
    () => {
      const signals = ['foo'];
      return [`['foo']                       `, signals];
    },
    () => {
      const signals = ['foo', 'bar', 'baz'];
      return [`['foo', 'bar', 'baz']         `, signals];
    },
    () => {
      const signals = [1, 2, 3];
      return [`[1, 2, 3]                     `, signals];
    },
    () => {
      const signals = [Symbol(), Symbol(), Symbol()];
      return [`[Symbol(), Symbol(), Symbol()]`, signals];
    },
    () => {
      const signals = ['foo', 1, Symbol()];
      return [`['foo', 1, Symbol()]          `, signals];
    }
  ];

  const flagsVariations: (($1: $1, $2: $2) => [string, LifecycleFlags])[] = [
    () => {
      const flags = undefined;
      return [`undefined`, flags];
    },
    () => {
      const flags = LifecycleFlags.fromFlush;
      return [`fromFlush`, flags];
    }
  ];

  const addSignalVariations: (($1: $1, $2: $2, $3: $3) => [string, (sut: ISignaler) => void])[] = [
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`addSignalListener   `, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          sut.addSignalListener(signal, mock);
        }
      }
      for (const signal of signals) {
        expect(sut['signals'][signal].size).to.equal(mocks.length);
      }
    }],
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`addSignalListener x2`, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          sut.addSignalListener(signal, mock);
          sut.addSignalListener(signal, mock);
        }
      }
      for (const signal of signals) {
        expect(sut['signals'][signal].size).to.equal(mocks.length);
      }
    }]
  ];

  const dispatchSignalVariations: (($1: $1, $2: $2, $3: $3, $4: $4) => [string, (sut: ISignaler) => void])[] = [
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`dispatch nonexisting signal`, sut => {
      sut.dispatchSignal('asdf', flags);
      for (let j = 0, jj = mocks.length; j < jj; ++j) {
        const mock = mocks[j];
        expect(mock.calls.length).to.equal(0);
      }
    }],
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`dispatchSignal             `, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          expect(mock.calls.length).to.equal(i + 1);
          expect(mock.calls[i][0]).to.equal('handleChange');
          expect(mock.calls[i][1]).to.equal(undefined);
          expect(mock.calls[i][2]).to.equal(undefined);
          expect(mock.calls[i][3]).to.equal(flags | LifecycleFlags.updateTargetInstance);
        }
      }
    }],
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`dispatchSignal x2          `, sut => {
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          expect(mock.calls.length).to.equal(i * 2 + 2);
          expect(mock.calls[i][0]).to.equal('handleChange');
          expect(mock.calls[i][1]).to.equal(undefined);
          expect(mock.calls[i][2]).to.equal(undefined);
          expect(mock.calls[i][3]).to.equal(flags | LifecycleFlags.updateTargetInstance);
          expect(mock.calls[i * 2 + 1][0]).to.equal('handleChange');
          expect(mock.calls[i * 2 + 1][1]).to.equal(undefined);
          expect(mock.calls[i * 2 + 1][2]).to.equal(undefined);
          expect(mock.calls[i * 2 + 1][3]).to.equal(flags | LifecycleFlags.updateTargetInstance);
        }
      }
    }]
  ];

  const removeSignalVariations: (($1: $1, $2: $2, $3: $3, $4: $4, $5: $5) => [string, (sut: ISignaler) => void])[] = [
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`removeSignalListener     -> dispatchSignal`, sut => {
      for (let i = 0, ii = mocks.length; i < ii; ++i) {
        const mock = mocks[i];
        for (let j = 0, jj = signals.length; j < jj; ++j) {
          const signal = signals[j];
          sut.removeSignalListener(signal, mock);
        }
        mock.calls = [];
      }
      for (const signal of signals) {
        expect(sut['signals'][signal].size).to.equal(0);
      }
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          expect(mock.calls.length).to.equal(0);
        }
      }
    }],
    ([$11, $12, mocks], [$21, signals], [$31, flags]) => [`remove nonexisting signal -> dispatchSignal`, sut => {
      for (let i = 0, ii = mocks.length; i < ii; ++i) {
        const mock = mocks[i];
        sut.removeSignalListener('asdf', mock);
        mock.calls = [];
      }
      for (const signal of signals) {
        expect(sut['signals'][signal].size).to.equal(mocks.length);
      }
      for (let i = 0, ii = signals.length; i < ii; ++i) {
        const signal = signals[i];
        sut.dispatchSignal(signal, flags);
        for (let j = 0, jj = mocks.length; j < jj; ++j) {
          const mock = mocks[j];
          expect(mock.calls.length).to.equal(i + 1);
        }
      }
    }]
  ];

  const inputs: [typeof sutVariations, typeof signalsVariations, typeof flagsVariations, typeof addSignalVariations, typeof dispatchSignalVariations, typeof removeSignalVariations]
    = [sutVariations, signalsVariations, flagsVariations, addSignalVariations, dispatchSignalVariations, removeSignalVariations];

  eachCartesianJoinFactory(inputs, ([t1, sut, mocks], [t2, signals], [t3, flags], [t4, addSignalListener], [t5, dispatchSignal], [t6, removeSignalListener]) => {
      it(`${t1}, signals=${t2}, flags=${t3} -> ${t4} -> ${t5} -> ${t6}`, function () {
        addSignalListener(sut);
        dispatchSignal(sut);
        removeSignalListener(sut);
      });
    }
  );
});