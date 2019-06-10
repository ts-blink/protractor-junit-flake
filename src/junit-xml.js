import fs from 'fs'
import glob from 'glob'
import path from 'path'
import _ from 'lodash'
import { parseString as parseXml, Builder } from 'xml2js'

export function processResults (filePattern, testAttempt) {
  var cwd = process.cwd()
  var files = glob.sync(filePattern, { cwd: cwd })
  return files.reduce((specNames, file) => {
    var resolvedPath = path.resolve(cwd, file)
    var resultDir = path.dirname(resolvedPath)
    var resultFileName = path.basename(resolvedPath)
    var processedResultsFile = path.resolve(resultDir, `flake-${resultFileName}`)

    var fileExists = fs.existsSync(processedResultsFile)
    if (fileExists) {
      console.log(`Skipping ${resolvedPath} - already processed since ${processedResultsFile} exists\n`)
    } else {
      console.log('Parsing file ', resolvedPath, '\n')
      var fileContents = fs.readFileSync(resolvedPath)
      try {
        parseXml(fileContents, (err, result) => {
          if (err) {
            console.log('Found parsing errors: ', err, '\n')
            return
          }
          let suites = _.castArray(result.testsuites.testsuite)
          suites.forEach(suite => {
            if (!suite.testcase) {
              return
            }
            let cases = _(suite.testcase)
              .castArray()
              .partition(caze => !!caze.failure)
              .value()

            suite.testcase = cases[1]
            let cazeNames = cases[0].map(caze => caze.$.name)
            if (cazeNames) {
              specNames.push(...cazeNames)
            }
          })
          let builder = new Builder()
          let xml = builder.buildObject(result)
          // Do not clobber results file from protractor
          fs.writeFileSync(processedResultsFile, xml)
        })
      } catch (err) {
        console.log('Errors parsing xml: ', err, '\n')
      }
    }
    return specNames
  }, [])
}
