import {div, input, pre, h} from '@cycle/dom';

const TOTAL_VIRTUAL_TIME = 10000;
const WIDTH = 800;
const Y_OFFSET = 25;

function renderNextEntry (entry) {
  const x = entry.time / TOTAL_VIRTUAL_TIME * WIDTH;

  return (
    h('g', [
      h('circle', {
        attrs: {
          cx: x,
          cy: Y_OFFSET,
          r: 15,
          fill: '#82d736',
          stroke: '#323232',
          'stroke-width': 1.5
        }
      }),
      h('text', {
        attrs: {
          x: x,
          y: Y_OFFSET,
          fill: '#323232',
          stroke: '#323232',
          'dominant-baseline': 'central',
          'text-anchor': 'middle',
          'font-family': 'sans-serif',
          'font-weight': 'lighter'
        }
      }, entry.value)
    ])
  );
}

function renderCompleteEntry (entry) {
  const x = entry.time / TOTAL_VIRTUAL_TIME * WIDTH;
  const height = 45;

  return h('line', {
    attrs: {
      x1: x,
      y1: Y_OFFSET  - height / 2,
      x2: x,
      y2: Y_OFFSET + height / 2,
      stroke: "#323232",
      'stroke-width': 2.3
    }
  });
}

function renderErrorEntry (entry) {
  const errorSize = 25;
  const x = entry.time / TOTAL_VIRTUAL_TIME * WIDTH;

  return h('g', [
    h('line', {
      attrs: {
        x1: x - errorSize / 2,
        y1: Y_OFFSET - errorSize / 2,
        x2: x + errorSize / 2,
        y2: Y_OFFSET + errorSize / 2,
        stroke: 'red',
        'stroke-width': 3
      }
    }),
    h('line', {
      attrs: {
        x1: x + errorSize / 2,
        y1: Y_OFFSET - errorSize / 2,
        x2: x - errorSize / 2,
        y2: Y_OFFSET + errorSize / 2,
        stroke: 'red',
        'stroke-width': 3
      }
    })
  ])
}

export function logToSvgDiagram (log) {
  return (
    h('svg', {attrs: {width: WIDTH}}, [
      h('line', {
        attrs: {
          x1: 0,
          y1: Y_OFFSET,
          x2: WIDTH,
          y2: Y_OFFSET,
          stroke: '#323232',
          'stroke-width': 1.5
        }
      }),
      ...log.filter(entry => entry.type === 'complete').map(renderCompleteEntry),
      ...log.filter(entry => entry.type === 'next').map(renderNextEntry),
      ...log.filter(entry => entry.type === 'error').map(renderErrorEntry)
    ])
  );
}

