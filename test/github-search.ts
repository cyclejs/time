import {mockTimeSource} from '../src/';
import {mockDOMSource} from '@cycle/dom';
import xs from 'xstream';

const MODES = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  RESULTS: 'RESULTS'
}

function withTime (f) {
  return function (done) {
    const Time = mockTimeSource({interval: 100});

    f(Time);

    Time.run(done);
  }
}

function searchGithub (query) {
  return `https://github.com/search?q=${query}`;
}

function GithubSearch (sources) {
  const searchText$ = sources.DOM
    .select('.search-text')
    .events('input')
    .map(ev => ev.target.value)
    .map(searchGithub)
    .compose(sources.Time.debounce(300));

  const results$ = sources.HTTP
    .select()
    .flatten()
    .map(response => JSON.parse(response.text).items);

  const mode$ = xs.merge(
    xs.of(MODES.IDLE),
    searchText$.mapTo(MODES.LOADING),
    results$.mapTo(MODES.RESULTS)
  );

  return {
    HTTP: searchText$,
    results$,
    mode$
  }
}

describe('GithubSearch', () => {
  it('searches for users', withTime(Time => {
    const searchTextEvent = {target: {value: 'xstream'}};
    const expectedRequest = 'https://github.com/search?q=xstream';

    const searchText$   = Time.diagram('--t----', {t: searchTextEvent});
    const expectedHTTP$ = Time.diagram('-----r-', {r: expectedRequest});

    const HTTP = {select: () => xs.never()};
    const DOM = mockDOMSource({
      '.search-text': {
        input: searchText$
      }
    });

    const githubSearch = GithubSearch({DOM, HTTP, Time});

    Time.assertEqual(
      githubSearch.HTTP,
      expectedHTTP$
    );
  }));

  it('returns results', withTime(Time => {
    const response = {text: JSON.stringify({items: [{name: 'xstream'}]})};

    const response$        = Time.diagram('--a----', {a: response});
    const expectedResults$ = Time.diagram('--a----', {a: [{name: 'xstream'}]});

    const HTTP = {select: () => response$.map(x => xs.of(x))};
    const DOM = mockDOMSource({});

    const githubSearch = GithubSearch({DOM, HTTP, Time});

    Time.assertEqual(
      githubSearch.results$,
      expectedResults$
    );
  }));

  it('has a mode$', withTime(Time => {
    const searchTextEvent = {target: {value: 'xstream'}};
    const response = {text: JSON.stringify({items: [{name: 'xstream'}]})};
    const expectedRequest = 'https://github.com/search?q=xstream';

    const searchText$   = Time.diagram('--a----------', {a: searchTextEvent});
    const response$     = Time.diagram('----------r--', {r: response});
    const expectedMode$ = Time.diagram('i----l----r--', {i: MODES.IDLE, l: MODES.LOADING, r: MODES.RESULTS});

    const HTTP = {select: () => response$.map(x => xs.of(x))};
    const DOM = mockDOMSource({
      '.search-text': {
        input: searchText$
      }
    });

    const githubSearch = GithubSearch({DOM, HTTP, Time});

    Time.assertEqual(
      githubSearch.mode$,
      expectedMode$
    );
  }));
});
