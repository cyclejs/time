import {mockTimeSource} from '../../src';

import * as assert from 'assert';
import {mockDOMSource} from '@cycle/dom';
import xs from 'xstream';
import fromDiagram from 'xstream/extra/fromDiagram';

describe('testing a counter', () => {
  it('can be done with fromDiagram', (done) => {
    const add$      = fromDiagram('--x---x--x----');
    const subtract$ = fromDiagram('----x------x--');

    const expected  = [0, 1, 0, 1, 2, 1];

    const DOM = mockDOMSource({
      '.add': {
        'click': add$
      },
      '.subtract': {
        'click': subtract$
      }
    });

    const actual$ = Counter({DOM}).count$;

    actual$.take(expected.length).addListener({
      next (count) {
        assert.equal(count, expected.shift());
      },

      complete: done,
      error: done
    });
  });
});

import {mockDOMSource} from '@cycle/dom';
import {mockTimeSource} from '@cycle/time';

describe('testing a counter', () => {
  it('is much easier now', (done) => {
    const Time = mockTimeSource();

    const add$      = Time.diagram('--x---x--x----');
    const subtract$ = Time.diagram('----x------x--');
    const expected$ = Time.diagram('0-1-0-1--2-1--');

    const DOM = mockDOMSource({
      '.add': {
        'click': add$
      },
      '.subtract': {
        'click': subtract$
      }
    });

    const actual$ = Counter({DOM}).count$;

    Time.assertEqual(actual$, expected$);

    Time.run(done);
  });
});

function Counter (sources) {
  const add$ = sources.DOM
    .select('.add')
    .events('click')
    .mapTo(+1);

  const subtract$ = sources.DOM
    .select('.subtract')
    .events('click')
    .mapTo(-1);

  const change$ = xs.merge(add$, subtract$);

  const count$ = change$.fold((total: number, change: number) => total + change, 0);

  return {
    count$
  }
}

