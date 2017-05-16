const test = require('tape');
const {makeTestHelper} = require('../../dist');

const withTime = makeTestHelper();

test('tape works with makeTestHelper', withTime(Time => {
  Time.assertEqual(
    Time.diagram('---1---2---3--'),
    Time.diagram('---1---2---3--')
  );
}));
