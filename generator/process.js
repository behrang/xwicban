module.exports = process

function process(terms, files) {
  var filesMap = {}
    , warned = {}

  files.forEach(function (f, i) {
    var name = f.replace(/.yaml$/, '')
    terms[i].file = name
    filesMap[name] = i
  })

  function readTerm(term, file) {
    var data = terms[filesMap[term]]
    if (data != null)
      return  { termx: data.termx
              , termb: data.termb
              , fa: data.fa
              , en: data.en
              , file: data.file
              }
    else
      warn(term, file)
  }

  function warn(term, file) {
    if (warned[term] == null) {
      warned[term] = file
      console.warn('not found: %s (%s)', term, file)
    }
  }

  function filter(term) {
    return term != null
  }

  terms = terms.map(function (t, i) {
    t.rel = (t.rel || []).map(function (r) { return readTerm(r, t.file) }).filter(filter)
    t.der = (t.der || []).map(function (d) { return readTerm(d, t.file) }).filter(filter)
    t.see = (t.see || []).map(function (s) { return readTerm(s, t.file) }).filter(filter)
    return t
  })

  return terms
}
