import { spawn } from 'child_process'
import { processLastRunResults, processResults } from './junit-xml'
import parseOptions from './parse-options'
import 'core-js/shim'
import Logger from './logger'
import _ from 'lodash'

export default function (options = {}, callback = function noop () {}) {
  const parsedOptions = parseOptions(options)
  const logger = new Logger(parsedOptions.color)

  logger.info(`Running attempt ${parsedOptions.testAttempt} of ${parsedOptions.maxAttempts}\n`)
  logger.info(`Using resultsXMLPath: ${parsedOptions.resultsXmlPath}\n`)
  let testAttempt = parsedOptions.testAttempt || 1

  function rerunFailedTests (status, output) {
    let failedSpecNames = processResults(parsedOptions.resultsXmlPath, testAttempt)

    ++testAttempt
    logger.info('Failed specs = ' + failedSpecNames)
    if (!failedSpecNames || failedSpecNames.length === 0) {
      logger.info(`\nNo failed specs were found. Exiting test attempt ${testAttempt}.\n`)
      status = 0
      callback(status, output)
    } else {
      logger.info(`\nRe-running test attempt ${testAttempt} with ${failedSpecNames.length} tests\n`)
      let specRegex = failedSpecNames
        .map(name => _.escapeRegExp(name).replace(/[/]/g, '\\/'))
        .join('|')
      return startProtractor(specRegex, true)
    }
  }

  function handleTestEnd (status, output = '') {
    logger.info(`Test ended with status  ${status}\n`)
    if (!status || testAttempt >= parsedOptions.maxAttempts) {
      processLastRunResults(parsedOptions.resultsXmlPath, testAttempt)
      callback(status, output)
    } else {
      return rerunFailedTests(status, output)
    }
  }

  function startProtractor (specRegex = '', retry = false) {
    let protractorArgs = [parsedOptions.protractorPath].concat(parsedOptions.protractorArgs)

    if (retry) {
      protractorArgs.push('--params.flake.retry', true)
    }

    if (specRegex) {
      protractorArgs.push('--jasmineNodeOpts.grep', specRegex)
    }

    protractorArgs.push('--testAttempt', testAttempt)
    protractorArgs.push('--disableChecks')

    let protractor = spawn(
      parsedOptions.nodeBin,
      protractorArgs,
      parsedOptions.protractorSpawnOptions
    )

    protractor.stdout.on('data', (buffer) => {
      let text = buffer.toString()
      logger.protractor(text)
    })

    protractor.stderr.on('data', (buffer) => {
      let text = buffer.toString()
      logger.protractor(text)
    })

    protractor.on('exit', function (code, signal) {
      logger.info(`Exited attempt ${testAttempt} with code: ${code} and signal: ${signal}\n`)
      handleTestEnd(code, '')
    })

    protractor.on('error', function (err) {
      logger.info(`Protractor error ${err}\n`, true)
      handleTestEnd(1, `Protractor error ${err}\n`)
    })
  }

  if (testAttempt > 1 && testAttempt <= parsedOptions.maxAttempts) {
    // We increment testAttempt in rerunFailedTests, so move it back first
    --testAttempt
    rerunFailedTests(0, '')
  } else {
    startProtractor()
  }
}
