var fs = require('fs')
  , co = require('co')
  , thunkify = require('thunkify')
  , jade = require('jade')
  , yaml = require('js-yaml')
  , rimraf = thunkify(require('rimraf'))
  , mkdirp = thunkify(require('mkdirp'))
  , marked = require('marked')
  , process = require('./process')

var siteDir = 'site/'
  , termsDir = 'terms/'
  , pagesDir = 'pages/'
  , readDir = thunkify(fs.readdir)
  , readFile = thunkify(fs.readFile)
  , writeFile = thunkify(fs.writeFile)
  , termTemplate = jade.compileFile(__dirname + '/templates/term.jade')
  , listTemplate = jade.compileFile(__dirname + '/templates/list.jade')
  , pageTemplate = jade.compileFile(__dirname + '/templates/page.jade')

function* run() {
  var files, contents, terms, htmls, page

  files = yield readDir(termsDir)

  contents = yield files.map(function (f) {
    return readFile(termsDir + f, 'utf-8')
  })

  terms = contents.map(function (c, i) {
    return yaml.safeLoad(c, { filename: files[i] })
  })

  terms = process(terms, files)

  htmls = terms.map(termTemplate)

  yield rimraf(siteDir)

  yield htmls.map(function (h, i) {
    return writeDirIndex(files[i].replace(/.yaml$/, ''), h)
  })

  yield writeDirIndex('b-order', listTemplate({ terms: terms }))
  yield writeDirIndex('x-order', listTemplate({ terms: terms }))

  page = yield readFile(pagesDir + 'index.md', 'utf-8')
  yield writeFile(siteDir + 'index.html', pageTemplate({ content: marked(page) }))
}

function* writeDirIndex(dir, content) {
  yield mkdirp(siteDir + dir)
  yield writeFile(siteDir + dir + '/index.html', content)
}

co(run)()
