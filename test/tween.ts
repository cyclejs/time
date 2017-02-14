// The source for tween.ts was taken directly from xstream, then slightly adapted for @cycle/time
// Full credit to staltz for this implementation
import xs, {Stream} from 'xstream';
import {setAdapt} from '@cycle/run/lib/adapt';
import {mockTimeSource} from '../src/';
;
const STEPS = 20;
const DURATION = 1000;

const plotTweenConfigs = {
  from: 0,
  to: STEPS,
  duration: DURATION,
  interval: DURATION / STEPS
};

function setCharAt(str: string, idx: number, chr: string): string {
  if (idx > str.length - 1){
    return str.toString();
  } else {
    return str.substr(0, idx) + chr + str.substr(idx + 1);
  }
}

function rotate(lines: Array<string>): Array<string> {
  let len = lines[0].length;
  return lines[0].split('')
    .map((col, i) =>
      lines
        .map(row => row.split('')[len-i-1])
    )
    .map(row => row.join(''));
}

function stutter(char: string, length: number): string {
  return new Array(length + 1).join(char);
}

function plot(position$: Stream<number>): Stream<string> {
  return position$
    .fold((acc, curr) => {
      acc.push(curr);
      return acc;
    }, [] as Array<number>)
    .last()
    .map(arr => {
      let coords = arr.map((y, x) => [x, y]);
      let lines = coords.reduce((lines, [x, y]) => {
        let newline: string;
        if (y < 0) {
          newline = setCharAt(stutter(' ', STEPS + 1), 0, '_');
        } else {
          newline = setCharAt(stutter(' ', STEPS + 1), Math.round(y), '#');
        }
        lines.push(newline);
        return lines;
      }, [] as Array<string>);
      return rotate(lines)
        .map(line => '|'.concat(line.replace(/ *$/g, '')).concat('\n'))
        .reduce((lines, line) => lines.concat(line), '')
        .concat('+' + stutter('-', STEPS + 1));
    });
}

function assertPlotEqual (Time, actual$, expectedPlot) {
  Time.assertEqual(
    plot(actual$).map(s => `\n${s}`),
    xs.of(expectedPlot).compose(Time.delay(DURATION))
  );
}

describe('tween (extra)', () => {
  before(() => setAdapt(stream => stream));

  it('should do linear tweening', (done: any) => {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.linear.ease,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });

    assertPlotEqual(Time, position$, `
|                    #
|                   #
|                  #
|                 #
|                #
|               #
|              #
|             #
|            #
|           #
|          #
|         #
|        #
|       #
|      #
|     #
|    #
|   #
|  #
| #
|#
+---------------------`)

    Time.run(done);;
  });

  it('should do power of 2 easing (ease in)', (done: any) => {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.power2.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|                   #
|
|                  #
|
|                 #
|                #
|
|               #
|              #
|
|             #
|            #
|           #
|          #
|         #
|        #
|      ##
|    ##
|####
+---------------------`);
    Time.run(done);
  });

  it("should do power of 3 easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.power3.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|
|                   #
|
|                  #
|
|
|                 #
|
|                #
|
|               #
|              #
|
|             #
|            #
|          ##
|         #
|      ###
|######
+---------------------`);
    Time.run(done);
  });

  it("should do power of 4 easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.power4.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|
|
|                   #
|
|
|                  #
|
|
|                 #
|
|                #
|
|               #
|              #
|             #
|            #
|           #
|        ###
|########
+---------------------`);
    Time.run(done);
  });

  it("should do exponential easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.exponential.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
  assertPlotEqual(Time, position$, `
|                    #
|
|
|
|
|                   #
|
|
|
|                  #
|
|
|                 #
|
|                #
|
|               #
|              #
|            ##
|         ###
|#########
+---------------------`);
    Time.run(done);
  });

  it("should do back easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.back.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|
|
|                   #
|
|
|
|                  #
|
|
|                 #
|
|
|                #
|
|               #
|
|              #
|
|#____________#
+---------------------`);
    Time.run(done);
  });

  it("should do bounce easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.bounce.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                   ##
|
|                  #
|                 #
|
|
|                #
|
|
|               #
|
|
|
|
|              #
|        ###
|           #
|       #
|            #
|   ####      #
|###
+---------------------`);
    Time.run(done);
  });

  it("should do circular easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.circular.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|
|
|
|
|                   #
|
|
|                  #
|
|                 #
|                #
|               #
|              #
|             #
|            #
|          ##
|        ##
|     ###
|#####
+---------------------`);
    Time.run(done);
  });

  it("should do elastic easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.elastic.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|
|
|
|
|
|
|
|
|
|
|
|                   #
|
|
|
|
|              ##
|             #
|####___###___   ___
+---------------------`);
    Time.run(done);
  });

  it("should do sine easing (ease in)", function (done: any) {
    const Time = mockTimeSource();

    let position$ = Time.tween({
      ease: Time.tween.sine.easeIn,
      from: plotTweenConfigs.from,
      to: plotTweenConfigs.to,
      duration: plotTweenConfigs.duration,
      interval: plotTweenConfigs.interval,
    });
    assertPlotEqual(Time, position$, `
|                    #
|
|                   #
|                  #
|
|                 #
|                #
|
|               #
|              #
|             #
|
|            #
|           #
|          #
|         #
|        #
|       #
|     ##
|   ##
|###
+---------------------`);
    Time.run(done);
  });
});
