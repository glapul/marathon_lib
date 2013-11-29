
String.implement({
	
	toElement: function() {		
		var div = document.createElement('div');
		div.innerHTML = this.trim();
		return $( div.childNodes[0] );
	}
	
});

Element.implement({
	
	goAutoMouseOver: function( overClass, outClass ){
		var el = this;
		return this.addEvents({
			mouseenter: function(){ el.swapClass( outClass, overClass ); },
			mouseleave: function(){ el.swapClass( overClass, outClass ); }
		});
	}
	
});

G.Win = {
	wins: [],
	closeAll: function(){
		G.Win.wins.each( function( win ) {
		  if( win.isOpen() ) {
  		  win.close(); 
  		}
		});
	}
};

G.Win.Base = new Class({
	
	Binds: [ 'onDocKeydown', 'onDocMousedown', 'onCreateAndOpen', 'setContent' ],
	Implements: [ Options, Events ],
	
	options: {
		// contentURL: 'url',
		// contentHTML: 'html',
		// contentElement: $(el),
		// onCreate: $empty
		// onOpen: $empty
		// onClose: $empty
		relativeTo: document.body,
		position: 'bottomLeft',
		edge: 'upperLeft',
		offset: { 'x': 0, 'y': 0 },
		closeElementExceptions: []
	},
	
	initialize: function( options ){
		this.setOptions( options );
		G.Win.wins.push( this );
	},
	
	getContentDiv: function(){
		this.contentDiv;
	},
	
	isOpen: function(){
		return this.div && this.div.isDisplayed();
	},
	
	open: function( options ){
		G.Win.closeAll();
		this.setOptions( options );
		this.div ? this.onOpen() : this.createAndOpen();
	},
	
	preload: function(){
		if ( !this.content ) { this.loadContent( this.setContent ) }
	},
	
	setContent: function( html ) {
		this.content = html;
	},
	
	loadContent: function( onSuccess ){
		new Request({
			url: this.options.contentURL,
			onSuccess: onSuccess,
			evalScripts: true,
			method: 'get'
		}).send();
	},
	
	createAndOpen: function() {
		var o = this.options;
		var divs = this.createDiv();
		this.div = divs[0].injectInside( document.body );
		this.contentDiv = divs[1];
		
    var divZIndex = this.div.getComputedStyle( 'z-index' );
		this.shim = new IframeShim( this.div, {
		  // NOTE: Also include all IE (not just IE6) because of iframes
		  'browsers': (Browser.Engine.trident || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
		});
    // HACK: shims
    // In IE6, the iframe shim doesn't work because it uses element.getStyle( 'zIndex' ), which always
    // returns 0. It also resets this.container's z-index to 1. This prevents any sort of drag or click 
    // on the popup window and sets the popup window below anything else with a z-index. Therefore, we must set it
    // ourselves and use getComputedStyle() instead. This is ironic as the iframe shim is meant only for
    // IE6, but the code for the iframe shim doesn't work in IE6...
		if( Browser.Engine.trident ) {
		  this.div.setStyle( 'zIndex', divZIndex );
  		this.shim.shim.setStyle( 'zIndex', this.div.getComputedStyle( 'z-index' ) - 1 );
    }
    
		var self = this;
		if ( o.contentURL ) {
			this.content ? this.onCreateAndOpen( this.content ) : this.loadContent( this.onCreateAndOpen );
		} else if ( o.contentHTML ) {
			this.onCreateAndOpen( o.contentHTML );
		} else if ( o.contentElement ) {
			this.contentDiv.grab( o.contentElement );
			this.fireEvent( 'onCreate', [ this ] )
			this.onOpen();			
		}
	},
	
	onCreateAndOpen: function( content ){
		this.contentDiv.innerHTML = content;
		this.fireEvent( 'onCreate', [ this ] )
		this.onOpen();
	},
	
	onOpen: function(){
		var o = this.options;
		this.div.position({
			relativeTo: o.relativeTo,
			edge: o.edge,
			position: o.position,
			offset: o.offset
		});
		this.div.show();
		this.shim.show();
		document.addEvents({
			mousedown: this.onDocMousedown,
			keydown: this.onDocKeydown
		});
		this.fireEvent( 'onOpen', [ this ] );
	},
	
	close: function(){
		if ( this.div ) {
			this.div.hide();
			this.shim.hide();
			document.removeEvents({
				mousedown: this.onDocMousedown,
				keydown: this.onDocKeydown
			} );
			this.fireEvent( 'onClose', [ this ] );
		}
	},
	
	destroy: function(){
		if ( this.div ) {
			this.div.destroy();
			this.shim.destroy();
			document.removeEvents({
				mousedown: this.onDocMousedown,
				keydown: this.onDocKeydown
			} );
			this.fireEvent( 'onDestroy', [ this ] );
		}
	},
	
	toggle: function( options ){
		this.isOpen() ? this.close() : this.open( options );
	},
	
	onDocKeydown: function(e){
		if (e.key=='esc') {	this.close(); }
	},

	onDocMousedown: function(e){
		if ( !this.isCloseElementException( e.target ) ) { this.close(); }
	},
	
	isCloseElementException: function( el ){
		return (
			this.options.closeElementExceptions.concat( this.div ).some( function( div ){
				return ( div == el ) || div.hasChild( el )
			} )
		)
	}
	
	// createDiv: $empty() -> returns [ div, contentDiv ]
	
})

G.Win.Plain = new Class({
	
	Extends: G.Win.Base,
	
	createDiv: function(){
		var o = this.options;
		var div = ( '\
			<div class="gwpl" style="display:none;width:{width}px;height:{height}px;">\
				<div class="gwpl_content"></div>\
			</div>\
		'.substitute({
			width: o.width,
			height: o.height
		}).toElement() );
		var contentDiv = div.getElement( 'div.gwpl_content' );
		return [ div, contentDiv ];
	}

})

G.Win.Drag = new Class({
	
	Extends: G.Win.Base,
	
	createDiv: function(){
		var o = this.options;
		var div = ( '\
			<div class="gwd" style="display:none;width:{width}px;height:{height}px;">\
				<div class="gwd_outer">\
					<div class="gwd_close"></div>\
					<div class="gwd_header">{title}</div>\
					<div class="gwd_content" style="width:{contentWidth}px;height:{contentHeight}px;"></div>\
				</div>\
			</div>\
		'.substitute({
	  	title: o.title,
			width: o.width,
			height: o.height,
			contentWidth: o.width - 12,
			contentHeight: o.height - 32
		}).toElement() );
		var headerDiv = div.getElement( 'div.gwd_header' );
		var closeDiv = div.getElement( 'div.gwd_close' );
		var contentDiv = div.getElement( 'div.gwd_content' );
		new Drag( div, { 
		  'handle': headerDiv,
		  'onDrag': function( element, event ) {
		    this.shim.position();
		  }.bind( this )
		});
		closeDiv.goAutoMouseOver( 'gwd_close_over', 'gwd_close_out' );
		closeDiv.addEvent( 'click', this.close.bind( this ) );
		return [ div, contentDiv ];
	}

})

G.Win.Prompt = new Class({
	
	Extends: G.Win.Base,
	
	createDiv: function(){
		var o = this.options;
		var div = '\
			<div class="gwp" style="display:none;width:{width}px;height:{height}px;">\
				<div class="gwp_outer">\
					<div class="gwp_content" style="width:{contentWidth}px;height:{contentHeight}px;">\
					</div>\
				</div>\
			</div>\
		'.substitute({
			width: o.width,
			height: o.height,
			contentWidth: o.width - 6,
			contentHeight: o.height - 6
		}).toElement();
		var contentDiv = div.getElement( 'div.gwp_content' );
		return [ div, contentDiv ];
	}
	
})
