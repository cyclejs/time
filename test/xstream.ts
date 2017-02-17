import {mockTimeSource} from '../src/';
import {MockTimeSource} from '../src/time-source';
import {setAdapt} from '@cycle/run/lib/adapt';
import xs, {Stream} from 'xstream';

import {VNode} from '@cycle/dom';
import {logToSvgDiagram} from '../src/log-to-svg-diagram';

setAdapt(stream => stream);

describe('xstream', () => {
  before(() => setAdapt(stream => stream));

  describe('of', () => {
    it('emits the given values immediately', (done) => {
      const Time = mockTimeSource();

      Time.assertEqual(
        xs.of('A'),
        Time.diagram('(A|)')
      );

      Time.run(done);
    })
  });

  describe('map', () => {
    it('applies a function to each item in the stream', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('--1--2--3--|');

      const actual   = input.map(i => i * 2);

      const expected = Time.diagram('--2--4--6--|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('mapTo', () => {
    it('replaces each occurence with the given value', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('--1--2--3--|');

      const actual   = input.mapTo(7);

      const expected = Time.diagram('--7--7--7--|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  function asDiagram (name) {
    return function doTheThing (label, testCallback) {
      it(label, (done) => {
        const Time = mockTimeSource();
        const oldTimeDiagram = Time.diagram;
        const oldAssertEqual = Time.assertEqual;

        let inputStreams = [];
        let actualStream;

        Time.diagram = function (diagramString: string, values?: Object): Stream<any> {
          const stream = oldTimeDiagram(diagramString, values || {});

          inputStreams.push(stream);

          return stream;
        };

        Time.assertEqual = function (actual: Stream<any>, expected: Stream<any>) {
          oldAssertEqual(actual, expected);

          inputStreams = inputStreams
            .filter(stream => stream !== actual && stream !== expected);

          actualStream = actual;
        }

        testCallback(Time);

        const recordedStreams = inputStreams.map(stream => streamToSvgDiagram(stream, Time));
        const recordedActual = streamToSvgDiagram(actualStream, Time);

        const things = xs.combine(recordedActual, ...recordedStreams);

        things.addListener({
          next ([actual, ...others]) {
            console.log(actual, others)
          }
        });

        Time.run(done);
      });
    }
  }

  function streamToSvgDiagram (stream: Stream<any>, Time: MockTimeSource): Stream<VNode> {
    return stream
      .compose(Time.record)
      .last()
      .map(logToSvgDiagram);
  }

  describe.only('merge', () => {
    asDiagram('merge')('merges two streams', (Time) => {
      const A        = Time.diagram('-----1-----1--|');
      const B        = Time.diagram('--2-----2-----|');

      const actual   = xs.merge(A, B);

      const expected = Time.diagram('--2--1--2--1--|');

      Time.assertEqual(actual, expected);
    });
  });

  describe('combine', () => {
    it('combines two streams', (done) => {
      const Time = mockTimeSource();

      const A        = Time.diagram('0-1-----3-----|');
      const B        = Time.diagram('0---2------5--|');

      const actual = xs
        .combine(A, B)
        .map(([a, b]) => a + b);

      const expected = Time.diagram('0-1-3---5--8--|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('filter', () => {
    it('only allows events that pass the given conditional', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('--1--2--3--4--5--6--|');

      const actual   = input.filter(i => i % 2 === 0);

      const expected = Time.diagram('-----2-----4-----6--|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('take', () => {
    it('takes the first n items', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('--1--2--3--4--5--6--|');

      const actual   = input.take(3);

      const expected = Time.diagram('--1--2--(3|)');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('drop', () => {
    it('drops the first n items', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('--1--2--3--4--5--6--|');

      const actual   = input.drop(3);

      const expected = Time.diagram('-----------4--5--6--|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('last', () => {
    it('returns the last item after the stream completes', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('--a--b--c--|');

      const actual   = input.last();

      const expected = Time.diagram('-----------(c|)');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('startWith', () => {
    it('prepends a starting value', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('---1--2--3--|');

      const actual   = input.startWith(0);

      const expected = Time.diagram('0--1--2--3--|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('endWhen', () => {
    it('ends the stream when the given stream emits', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('---1--2--3--4--5--6-|');
      const endWhen  = Time.diagram('-----------x--------|');

      const actual   = input.endWhen(endWhen);

      const expected = Time.diagram('---1--2--3-|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('fold', () => {
    it('accumulates a value from a seed', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('---1--1--1--1--1--1-|');

      const actual   = input.fold((acc, val) => acc + val, 0);

      const expected = Time.diagram('0--1--2--3--4--5--6-|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('replaceError', () => {
    it('replaces the stream with another stream following an error', (done) => {
      const Time = mockTimeSource();

      const input    = Time.diagram('---1--2--3--#');
      const replace  = Time.diagram('---------------7-|');

      const actual   = input.replaceError(() => replace);

      const expected = Time.diagram('---1--2--3-----7-|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('flatten', () => {
    it('turns a stream of streams into a flat stream', (done) => {
      const Time = mockTimeSource();

      const A        = Time.diagram('--1--1--1--1--1--|');
      const B        = Time.diagram('---2--2---2--2--2|');

      const input    = Time.diagram('-A-------B-------|', {A, B});

      const actual   = input.flatten();

      const expected = Time.diagram('--1--1--1-2--2--2|');

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });

  describe('imitate', () => {
    it('creates a circular dependency', (done) => {
      const Time = mockTimeSource();

      const proxy = xs.create();

      const input     = Time.diagram('--a--b--c|');

      const actual    = proxy;

      const expected  = Time.diagram('--a--b--c|');

      proxy.imitate(input);

      Time.assertEqual(actual, expected);

      Time.run(done);
    });
  });
});
