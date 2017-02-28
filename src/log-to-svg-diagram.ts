import {svg, div, input, pre, h, VNode} from '@cycle/dom';

const TOTAL_VIRTUAL_TIME = 300;
const WIDTH = 800;
const Y_OFFSET = 25;
const PADDING = 70;
const SVG_ATTRS = {
  xmlns: 'http://www.w3.org/2000/svg',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink'
}

function renderTestDiagram (name: string, actual: Array<any>, others: Array<any>): VNode {
  // given a name and some input streams as hyperscript and an actual stream as hyperscript
  // render a diagram like this:
  //
  // ----1---1---|
  // --2---2-----|
  //   _______
  //  | merge |
  //  ---------
  //
  // --2-1-2-1---|
  const labelRelativePosition = others.length * PADDING + PADDING;
  const actualRelativePosition = labelRelativePosition + PADDING;

  return (
    h('svg', {attrs: SVG_ATTRS}, [
      ...others.map((log, i) => logToSvgDiagram(log, i * PADDING + PADDING)),
      renderLabel(name, labelRelativePosition),
      logToSvgDiagram(actual, actualRelativePosition)
    ])
  )
}

function renderLabel (label: string, position: number): VNode {
  return (
    h('text', {
      attrs: {
        x: WIDTH / 2,
        y: position,
        fill: '#323232',
        stroke: '#323232',
        'dominant-baseline': 'central',
        'text-anchor': 'middle',
        'font-family': 'sans-serif',
        'font-weight': 'lighter'
      }
    }, label)
  )
}

function renderNextEntry (entry, position) {
  const x = entry.time / TOTAL_VIRTUAL_TIME * WIDTH;

  return (
    h('g', [
      h('circle', {
        attrs: {
          cx: x,
          cy: position,
          r: 15,
          fill: '#82d736',
          stroke: '#323232',
          'stroke-width': 1.5
        }
      }),
      h('text', {
        attrs: {
          x: x,
          y: position,
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

function renderCompleteEntry (entry, position) {
  const x = entry.time / TOTAL_VIRTUAL_TIME * WIDTH;
  const height = 45;

  return h('line', {
    attrs: {
      x1: x,
      y1: position  - height / 2,
      x2: x,
      y2: position + height / 2,
      stroke: "#323232",
      'stroke-width': 2.3
    }
  });
}

function renderErrorEntry (entry, position) {
  const errorSize = 25;
  const x = entry.time / TOTAL_VIRTUAL_TIME * WIDTH;

  return h('g', [
    h('line', {
      attrs: {
        x1: x - errorSize / 2,
        y1: position - errorSize / 2,
        x2: x + errorSize / 2,
        y2: position + errorSize / 2,
        stroke: 'red',
        'stroke-width': 3
      }
    }),
    h('line', {
      attrs: {
        x1: x + errorSize / 2,
        y1: position - errorSize / 2,
        x2: x - errorSize / 2,
        y2: position + errorSize / 2,
        stroke: 'red',
        'stroke-width': 3
      }
    })
  ])
}

function logToSvgDiagram (log: Array<any>, position: number) {
  return (
    svg({attrs: {width: WIDTH}}, [
      h('line', {
        attrs: {
          x1: 0,
          y1: position,
          x2: WIDTH,
          y2: position,
          stroke: '#323232',
          'stroke-width': 1.5
        }
      }),
      ...log.filter(entry => entry.type === 'complete').map(entry => renderCompleteEntry(entry, position)),
      ...log.filter(entry => entry.type === 'next').map(entry => renderNextEntry(entry, position)),
      ...log.filter(entry => entry.type === 'error').map(entry => renderErrorEntry(entry, position))
    ])
  );
}

export { logToSvgDiagram, renderTestDiagram };
