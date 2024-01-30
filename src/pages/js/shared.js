const shell = require('electron').shell;
const $ = require('jquery');

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});