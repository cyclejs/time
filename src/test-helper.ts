import {mockTimeSource} from './mock-time-source';

function makeTestHelper (options: Object = {}) {
  return function withTime (test, testOptions: Object = {}) {
    return function runTestWithTime (done) {
      const Time = mockTimeSource({...options, ...testOptions});

      test(Time);

      if (!done) {
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

      if ('end' in done) {
        // using tape
        Time.run(done.end);
        return;
      }

      if ('fail' in done) {
        // using jasmine

        Time.run(err => {
          if (err) {
            done.fail(err);
          } else {
            done();
          }
        });

        return;
      }

      if (typeof done === 'function') {
        // using mocha

        Time.run(done);
        return;
      }

      throw new Error('Could not figure out how to wrap test. Please raise an issue on @cycle/time');
    }
  }
}

export {
  makeTestHelper
}
