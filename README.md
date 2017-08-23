Protractor Junit Flake 
===

Rerun potentially flakey protractor tests before failing (Based on Junit XML). Runs only the
specific failing test using jasmine's spec filter functionality. 

```shell
npm i protractor-junit-flake

# or globally for easier cli usage
npm i -g protractor-junit-flake
```

# Usage

Via the CLI:

```shell
npm i -g protractor-junit-flake

# protractor-junit-flake <protractor-junit-flake-options> -- <options to be passed to protractor>
protractor-junit-flake --results-xml-path=path/to/results-*.xml  --max-attempts=3 -- path/to/protractor.conf.js
```

See [src/parse-options.js](src/parse-options.js#L4-L15) for the full list of command line options.

Protractor Junit flake expects `protractor` to be on $PATH by default, but you can use the `--protractor-path` argument to point to the protractor executable.

Or programmatically:

```javascript
var protractorFlake = require('protractor-junit-flake');

// Default Options
protractorFlake({
  resultsXmlPath: 'test/results/protractor-*.xml'
}, function (status, output) {
  proces.exit(status)
})

// Full Options
protractorFlake({
  protractorPath: '/path/to/protractor',
  maxAttempts: 3,
  resultsXmlPath: 'test/results/protractor-*.xml'
  // expects node to be in path
  // set this to wherever the node bin is located
  nodeBin: 'node',
  // set color to one of the colors available at 'chalk' - https://github.com/chalk/ansi-styles#colors
  color: 'magenta',
  protractorArgs: []
}, function (status, output) {
  process.exit(status);
});
```