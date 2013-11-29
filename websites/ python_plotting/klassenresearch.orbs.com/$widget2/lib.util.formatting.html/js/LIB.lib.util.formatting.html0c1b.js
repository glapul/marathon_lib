G.HtmlFormatter = new Class({
  initialize: function(){
	},

	escapeHtml: function( html ) {
    // borrowed from http://prototypejs.org/assets/2009/8/31/prototype.js
    return html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}

});
