import * as most from 'most';
import {setAdapt} from '@cycle/run/lib/adapt';

import {makeTestHelper} from '../../most';

const withTime = makeTestHelper();

describe('most', () => {
  before(() => setAdapt(stream => most.from(stream as any)));

  it('works with @cycle/time', withTime((Time) => {
    const actual$   = most.of('a').thru(Time.delay(60));
    const expected$ = Time.diagram(`---(a|)`);

    Time.assertEqual(actual$, expected$);
  }));
});
