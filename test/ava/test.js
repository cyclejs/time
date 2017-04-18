import test from 'ava';

const {makeTestHelper} = require('../../dist');

const withTime = makeTestHelper();

test.cb('ava works with makeTestHelper', withTime(Time => {
  Time.assertEqual(
    Time.diagram('---1---2---3--'),
    Time.diagram('---1---2---3--')
  );
}));
