import {mockTimeSource} from './';
import {MockTimeSource} from './time-source';
import xs, {Stream} from 'xstream';
import {VNode} from '@cycle/dom';
import {renderTestDiagram, logToSvgDiagram} from '../src/log-to-svg-diagram';
import * as init from 'snabbdom-to-html/init';
import * as snabbdomModules from 'snabbdom-to-html/modules';

import * as fs from 'fs';
import * as path from 'path';

const SAVE_DIAGRAMS = process.env.SAVE_DIAGRAMS || false;

const defaultModules = [
  snabbdomModules.attributes,
  snabbdomModules.props,
  snabbdomModules.class,
  snabbdomModules.style,
];

export function asDiagram (name) {
  return function _asDiagram (label, testCallback) {
    it(label, (done) => {
      const Time = mockTimeSource();

      if (SAVE_DIAGRAMS) {
        const streams = diagramStreamsFromTest(Time, testCallback);

        saveStreamsToFile(name, streams, Time);
      } else {
        testCallback(Time);
      }

      Time.run(done);
    });
  }
}

function saveStreamsToFile (name: string, {inputStreams, actualStream}: RecordedStreams, Time: MockTimeSource): void {
  const recordedStreams = inputStreams.map(stream => recordStream(stream, Time));
  const recordedActual = recordStream(actualStream, Time);

  function writeHtmlToFile (html: string) {
    fs.mkdir('diagrams', (err) => {
      fs.writeFile(path.join('.', 'diagrams', `${name}.svg`), html);
    });
  }

  const vnodes$ = xs
    .combine(recordedActual, ...recordedStreams)
    .map(([actual, ...others]) => renderTestDiagram(name, actual, others));

  vnodes$.addListener({
    next (vtree) {
      const toHTML = init(defaultModules);

      writeHtmlToFile(toHTML(vtree));
    }
  });
}

function recordStream (stream: Stream<any>, Time: MockTimeSource): Stream<Array<any>> {
  return stream.compose(Time.record).last();
}

interface RecordedStreams {
  actualStream: Stream<any>;
  inputStreams: Array<Stream<any>>;
}

function diagramStreamsFromTest (Time: MockTimeSource, testCallback: (Time: MockTimeSource) => void): RecordedStreams {
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

  return {inputStreams, actualStream};
}
