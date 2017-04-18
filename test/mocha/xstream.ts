import {setAdapt} from '@cycle/run/lib/adapt';
import xs from 'xstream';

import {makeTestHelper} from '../../src/';

const withTime = makeTestHelper();

describe('xstream', () => {
  before(() => setAdapt(stream => stream));

  describe('of', () => {
    it('emits the given values immediately', withTime((Time) => {
      Time.assertEqual(
        xs.of('A'),
        Time.diagram('(A|)')
      );
    }))
  });

  describe('map', () => {
    it('applies a function to each item in the stream', withTime((Time) => {
      const input    = Time.diagram('--1--2--3--|');

      const actual   = input.map(i => i * 2);

      const expected = Time.diagram('--2--4--6--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('mapTo', () => {
    it('replaces each occurence with the given value', withTime((Time) => {
      const input    = Time.diagram('--1--2--3--|');

      const actual   = input.mapTo(7);

      const expected = Time.diagram('--7--7--7--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('merge', () => {
    it('merges two streams', withTime((Time) => {
      const A        = Time.diagram('-----1-----1--|');
      const B        = Time.diagram('--2-----2-----|');

      const actual   = xs.merge(A, B);

      const expected = Time.diagram('--2--1--2--1--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('combine', () => {
    it('combines two streams', withTime((Time) => {
      const A        = Time.diagram('0-1-----3-----|');
      const B        = Time.diagram('0---2------5--|');

      const actual = xs
        .combine(A, B)
        .map(([a, b]) => a + b);

      const expected = Time.diagram('0-1-3---5--8--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('filter', () => {
    it('only allows events that pass the given conditional', withTime((Time) => {
      const input    = Time.diagram('--1--2--3--4--5--6--|');

      const actual   = input.filter(i => i % 2 === 0);

      const expected = Time.diagram('-----2-----4-----6--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('take', () => {
    it('takes the first n items', withTime((Time) => {
      const input    = Time.diagram('--1--2--3--4--5--6--|');

      const actual   = input.take(3);

      const expected = Time.diagram('--1--2--(3|)');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('drop', () => {
    it('drops the first n items', withTime((Time) => {
      const input    = Time.diagram('--1--2--3--4--5--6--|');

      const actual   = input.drop(3);

      const expected = Time.diagram('-----------4--5--6--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('last', () => {
    it('returns the last item after the stream completes', withTime((Time) => {
      const input    = Time.diagram('--a--b--c--|');

      const actual   = input.last();

      const expected = Time.diagram('-----------(c|)');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('startWith', () => {
    it('prepends a starting value', withTime((Time) => {
      const input    = Time.diagram('---1--2--3--|');

      const actual   = input.startWith(0);

      const expected = Time.diagram('0--1--2--3--|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('endWhen', () => {
    it('ends the stream when the given stream emits', withTime((Time) => {
      const input    = Time.diagram('---1--2--3--4--5--6-|');
      const endWhen  = Time.diagram('-----------x--------|');

      const actual   = input.endWhen(endWhen);

      const expected = Time.diagram('---1--2--3-|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('fold', () => {
    it('accumulates a value from a seed', withTime((Time) => {
      const input    = Time.diagram('---1--1--1--1--1--1-|');

      const actual   = input.fold((acc, val) => acc + val, 0);

      const expected = Time.diagram('0--1--2--3--4--5--6-|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('replaceError', () => {
    it('replaces the stream with another stream following an error', withTime((Time) => {
      const input    = Time.diagram('---1--2--3--#');
      const replace  = Time.diagram('---------------7-|');

      const actual   = input.replaceError(() => replace);

      const expected = Time.diagram('---1--2--3-----7-|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('flatten', () => {
    it('turns a stream of streams into a flat stream', withTime((Time) => {
      const A        = Time.diagram('--1--1--1--1--1--|');
      const B        = Time.diagram('---2--2---2--2--2|');

      const input    = Time.diagram('-A-------B-------|', {A, B});

      const actual   = input.flatten();

      const expected = Time.diagram('--1--1--1-2--2--2|');

      Time.assertEqual(actual, expected);
    }));
  });

  describe('imitate', () => {
    it('creates a circular dependency', withTime((Time) => {
      const proxy = xs.create();

      const input     = Time.diagram('--a--b--c|');

      const actual    = proxy;

      const expected  = Time.diagram('--a--b--c|');

      proxy.imitate(input);

      Time.assertEqual(actual, expected);
    }));
  });
});
