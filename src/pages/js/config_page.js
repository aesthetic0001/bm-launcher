const monaco = require('monaco-editor');

monaco.editor.create(document.getElementById('container'), {
    value: 'function x() {\nconsole.log("Hello world!");\n}',
    language: 'javascript'
});
