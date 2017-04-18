import {mockTimeSource} from './mock-time-source';

function makeTestHelper (options: Object = {}) {
  return function withTime (test, testOptions: Object = {}) {
    return function runTestWithTime (done) {
      const Time = mockTimeSource({...options, ...testOptions});

      test(Time);

      if (typeof done === 'function') {
        Time.run(done);
      } else {
        return new Promise((resolve, reject) => {
          Time.run((err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      }
    }
  }
}

export {
  makeTestHelper
}
