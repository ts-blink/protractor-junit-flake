import fs from 'fs'
import glob from 'glob'
import path from 'path'
import _ from 'lodash'
import { parseString as parseXml, Builder } from 'xml2js'

export function processResults (filePattern) {
  var cwd = process.cwd()
  var files = glob.sync(filePattern, { cwd: cwd })
  return files.reduce((specNames, file) => {
    var resolvedPath = path.resolve(cwd, file)
    console.log('\nReading file ', resolvedPath, '\n')
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
        fs.writeFileSync(resolvedPath, xml)
      })
      return specNames
    } catch (err) {
      console.log('Errors parsing xml: ', err, '\n')
      return specNames
    }
  }, [])
}
