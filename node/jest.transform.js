const ts = require('typescript')

module.exports = {
  process(src, path) {
    const { outputText } = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2019,
        esModuleInterop: true,
      },
      fileName: path,
    })

    return outputText
  },
}
