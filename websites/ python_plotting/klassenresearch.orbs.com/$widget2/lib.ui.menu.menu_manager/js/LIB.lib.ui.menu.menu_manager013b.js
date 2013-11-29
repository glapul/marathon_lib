G.MenuManager = new Class({

	Implements: [Options, Events],

	popup: null,

	options: {
		alignmentElement: null,
		menuContent: null,
		offset: { x: 0, y: 0 }
    //onOpen: $empty
	},

	initialize: function( element, options ) {
		this.setOptions( options );
		this.element = $( element );
		this.addEvents();
	},

	addEvents: function() {
		this.element.addEvent( 'click', function( event ) {
			event.stop();
			this.toggleWindow();
		}.bind( this ) );
	},

	toggleWindow: function() {
		if( !$chk( this.popup ) ) {
			this.popup = new G.Win.Plain({
				contentElement: this.options.menuContent,
				allowMultiple: false,
				relativeTo: this.options.alignmentElement,
				position: 'bottomRight',
				edge: 'topRight',
				offset: this.options.offset,
				closeElementExceptions: [ this.element ]
			});
		}
		this.popup.toggle();
    if( this.popup.isOpen() ) {
      this.fireEvent( 'open' );
    }
	}

});
