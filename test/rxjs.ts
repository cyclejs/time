import {Observable} from 'rxjs/Rx';
import {setAdapt} from '@cycle/run/lib/adapt';

import {makeTestHelper} from '../rxjs';

const withTime = makeTestHelper();

describe('rxjs', () => {
  before(() => setAdapt(stream => Observable.from(stream)));

  it('works with @cycle/time', withTime((Time) => {
    const actual$   = Observable.of('a').let(Time.delay(60));
    const expected$ = Time.diagram(`---(a|)`);

    Time.assertEqual(actual$, expected$);
  }));
});
