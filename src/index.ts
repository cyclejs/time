import {timeDriver as timeDriverUntyped} from './time-driver';
import {mockTimeSource as mockTimeSourceUntyped} from './mock-time-source';
import {makeTestHelper as makeTestHelperUntyped} from './test-helper';
import {TimeSource, MockTimeSource, Operator} from './time-source';

function mockTimeSource (args?: Object): MockTimeSource {
  return mockTimeSourceUntyped(args);
}

function timeDriver (_, adapter): TimeSource {
  return timeDriverUntyped(_, adapter);
}

type Test = (done?: Function) => void | Promise<true>;
type TimeTest = (Time: MockTimeSource) => void;
type TestHelper = (test: TimeTest, options?: Object) => Test;

function makeTestHelper (options = {}): TestHelper {
  return makeTestHelperUntyped(options);
}

export {
  Operator,

  TimeSource,
  timeDriver,

  MockTimeSource,
  mockTimeSource,

  Test,
  TimeTest,
  TestHelper,
  makeTestHelper,
};
