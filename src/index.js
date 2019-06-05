import { spawn } from 'child_process'
import { processResults } from './junit-xml'
import parseOptions from './parse-options'
import 'core-js/shim'
import Logger from './logger'

export default function (options = {}, callback = function noop () {}) {
  let parsedOptions = parseOptions(options)
  let testAttempt = parsedOptions.testAttempt || 1
  let logger = new Logger(parsedOptions.color)

  function rerunFailedTests (status, output) {
    let failedSpecNames = processResults(parsedOptions.resultsXmlPath)

    ++testAttempt
    logger.log('info', 'Failed specs = ' + failedSpecNames)
    if (!failedSpecNames || failedSpecNames.length === 0) {
      logger.log('info', `\nNo failed specs were found. Exiting test attempt ${testAttempt}.\n`)
      callback(status, output)
    } else {
      logger.log('info', `\nRe-running test attempt ${testAttempt} with ${failedSpecNames.length} tests\n`)
      let specRegex = failedSpecNames.join('|')
      return startProtractor(specRegex, true)
    }
  }

  function handleTestEnd (status, output = '') {
    logger.log('Test Ended', status, output)
    if (status === 0) {
      callback(status)
    } else {
      if (testAttempt < parsedOptions.maxAttempts) {
        return rerunFailedTests(status, output)
      }
      callback(status, output)
    }
  }

  function startProtractor (specRegex = '', retry = false) {
    let output = ''
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
      output = output + text
    })

    protractor.stderr.on('data', (buffer) => {
      let text = buffer.toString()
      logger.protractor(text)
      output = output + text
    })

    protractor.on('exit', function (status) {
      handleTestEnd(status, output)
    })
  }

  if (testAttempt > 1 && testAttempt <= parsedOptions.maxAttempts) {
    rerunFailedTests(0, '')
  } else {
    startProtractor()
  }
}
