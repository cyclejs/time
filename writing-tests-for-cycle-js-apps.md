
How to write fast, declarative tests for your asynchronous Javascript apps.

Target demographic:

 * People who write Cycle apps
 * People who write JavaScript but don't know Cycle

* Writing tests for asynchronous JavaScript applications is tough

Testing client-side JavaScript applications is hard. Most user facing JavaScript apps update in response to multiple sources of user events, such as clicks, scroll events, keyboard events as well as network responses and websocket events.

JavaScript applications transform these events into DOM updates the user can see, network requests, changes to storage and more.

In order to test most user facing JavaScript apps thoroughly we need to run a browser, so that the DOM APIs we would expect are available. This is slow, temperamental and can be very hard to debug.

In an ideal world, we want to be able to test our applications without running a browser, but still be able to verify that our application interacts with the DOM and other browser APIs appropriately.

* To enable better testing, we need to inject dependencies and encapsulate side effects

To achieve this, we need to use a style of writing applications where all side effects, such as updating the DOM or performing network requests are encapsulated separately to our application code. We want to pass in all of our application's dependencies, to avoid needing to stub out any libraries or global state. And ideally, our application needs to declaratively return what side effects will occur.

* Thankfully Cycle.js exists, and is built around these notions

Fortunately, Cycle.js is a JavaScript framework built entirely around these ideals. All side effects are stored away in drivers, and all dependencies are passed into our application.


* Here is how to use @cycle/time to write awesome tests for a simple case
* Here is how to use @cycle/time to write awesome tests for a complex case
* So much fasterer
