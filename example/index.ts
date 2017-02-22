import {run} from '@cycle/run';
import {makeDOMDriver, div, input, pre, h} from '@cycle/dom';
import {timeDriver} from '../src/';
import xs from 'xstream';

function main (sources) {
  const {DOM, Time} = sources;

  const number$ = Time.animationFrames().compose(Time.throttle(500));

  const record$ = Time.record(number$);

  return {
    DOM: record$.map(logToSvgDiagram)
  };
}

const drivers = {
  DOM: makeDOMDriver('.app'),
  Time: timeDriver
};

run(main, drivers);
