if( typeof( G.Keyboard ) === 'undefined' ){ G.Keyboard = {}; }

G.Keyboard.HotKey = new Class();
G.Keyboard.HotKey.DELIMETER = '-';

G.Keyboard.HotKey.implement({
  Implements: [ Options ],
  options: {
    'target': null,
    'iframe': null,
    'eventType': 'keydown' // default is keydown because it works across all browsers
  },
  target: null,
  keystroke: null,
  eventHandler: null,
  eventType: null,
  iframe: null,
  
  initialize: function( keystroke, eventHandler, options ) {
    this.setOptions( options );
    this.keystroke = this.normalize( keystroke );
    this.eventHandler = eventHandler;
    this.target = $( this.options.target );
    this.iframe = this.options.iframe;
    this.eventType = this.options.eventType;
  },
  
  enable: function() {
    G.Keyboard.Watcher.addKey( this );
  },
  
  disable: function() {
    G.Keyboard.Watcher.removeKey( this );
  },
  
  /*
   * Private Functions
   */
  
  normalize: function( keystroke ) {
    keystroke = keystroke.trim();
		if ( keystroke.contains( 'return' ) ) { throw "Yo, we're not on a typewriter freak!" }
		if( keystroke.length > 1 && keystroke !== 'all' ) {
			var keys = keystroke.split( G.Keyboard.HotKey.DELIMETER );
			var output = [ 
				keys.contains( 'ctrl' ) ? 'ctrl' : null,
			 	keys.contains( 'shift' ) ? 'shift' : null,
			 	keys.contains( 'alt' ) ? 'alt' : null,
				keys.erase( 'ctrl' ).erase( 'alt' ).erase( 'shift' ).toString()
			];
      return output.clean().join( G.Keyboard.HotKey.DELIMETER );
    }
    return keystroke;
  }

});


/*
   normalize: function( keystroke ) {
    keystroke = keystroke.trim();
    if( keystroke.length > 1 && keystroke !== 'all' ) {
      var ctrl = null;
      var shift = null;
      var alt = null;
      var key = G.Keyboard.HotKey.DELIMETER;
      keystroke.split( G.Keyboard.HotKey.DELIMETER ).each( function( value ) {
        switch( value ) {
          case 'ctrl':
            ctrl = 'ctrl';
            break;
          case 'shift':
            shift = 'shift';
            break;
          case 'alt':
            alt = 'alt';
            break;
          default:
            if( value === 'enter' ) {
              value = 'return';
            }
            key = value;
        }
      });
      keystroke = [ ctrl, shift, alt, key ].clean().join( G.Keyboard.HotKey.DELIMETER );
    }
    return keystroke;
  }
*/
if( typeof( G.Keyboard ) === 'undefined' ){ G.Keyboard = {}; }

G.Keyboard.Watcher = {
  hotKeys: new Hash(), // { 'eventType': { 'windowId', { 'targetId': { 'keystroke': Function } } } }
  keys: {
    '1': 'alt',
    '2': 'ctrl',
    '4': 'shift',
    '8': 'backspace',
    '9': 'tab',
    '13': 'enter',
    '27': 'esc',
    '32': 'space',
    '33': 'pageup',
    '34': 'pagedown',
    '35': 'end',
    '36': 'home',
    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down',
    '46': 'delete',
    '56': ';',
    '61': '+',
    '96': '0',
    '97': '1',
    '98': '2',
    '99': '3',
    '100': '4',
    '101': '5',
    '102': '6',
    '103': '7',
    '104': '8',
    '105': '9',
    '106': '*',
    '107': '+',
    '109': '-',
    '110': '.',
    '111': '/',
    '188': ',',
    '190': '.',
    '191': '/',
    '192': '`',
    '219': '[',
    '220': '\\',
    '221': ']',
    '222': '\''
  },
  parentWindowId: null,
  nullTargetId: null,
  listeners: new Hash(),
  
  addKey: function( hotKey ) {
    // keypress is not allowed because it uses lowercase characters which has ascii codes that conflict
    // with other non-alphanumeric characters (e.g. 't' and 'f5' have the same keycode)
    if( hotKey.eventType === 'keypress' && !Browser.Engine.presto ) {
      throw '"keypress" is not allowed';
    }
    
    var windows = this.getNextHash( this.hotKeys, hotKey.eventType );
    var targets = this.getNextHash( windows, this.getWindowId( hotKey ), this.toggleListener.bind( this, [ 'add', hotKey ] ) );
    var keystrokes = this.getNextHash( targets, this.getTargetId( hotKey ) );
    keystrokes.set( hotKey.keystroke, hotKey.eventHandler );
    
//    gg( 'hotkeys:', this.hotKeys.getKeys() );
//    gg( 'windows:', windows.getKeys() );
//    gg( 'targets:', targets.getKeys() );
//    gg( 'keystrokes:', keystrokes.getKeys() );
  },
  
  removeKey: function( hotKey ) {
    var windows = this.hotKeys.get( hotKey.eventType );
    if( $chk( windows ) ) {
      var windowId = this.getWindowId( hotKey );
      var targets = windows.get( windowId );
      if( $chk( targets ) ) {
        var targetId = this.getTargetId( hotKey );
        var keystrokes = targets.get( targetId );
        if( $chk( keystrokes ) ) {
          // remove the keystroke
          keystrokes.erase( hotKey.keystroke );
          
          // if there are no keystrokes for this target, remove the target
          if( 0 === keystrokes.getLength() ) {
            targets.erase( targetId );
          }
          
          // if there are no targets for this window, remove the target and
          // its listener
          if( 0 === targets.getLength() ) {
            windows.erase( windowId );
            this.toggleListener( 'remove', hotKey );
          }
          
          // if there are no windows for this eventType, remove the window
          if( 0 === windows.getLength() ) {
            this.hotKeys.erase( hotKey.eventType );
          }
        }
      }
    }
  },
  
  /*
   * Private Functions
   */
  
  toggleListener: function( action, hotKey ) {
    var isAdd = action === 'add';
    var win = this.getWindow( hotKey );
    var windowId = this.getWindowId( hotKey );
    var eventType = hotKey.eventType;
    var listenerKey = eventType + '_' + windowId;    

    // save the listeners so we can remove them later
    var listener = this.listeners.get( listenerKey );
    // create a listener if one doesn't exist (should only happen on an 'add')
    if( !$chk( listener ) ) {
      var self = this;
      listener = function( event ) {
        self.handleKeyEvent( event, windowId, eventType );
      }
      this.listeners.set( listenerKey, listener );
    }
    
		/*
		 * TODO: Mootoolize this!
		 * 
		 * For some reason, when using mootool's addEvent, any events that come from an iframe
		 * are not captured. We don't know why.
		 */
		if( win.document[ action + 'EventListener' ] ){
			win.document[ action + 'EventListener' ]( eventType, listener, false );
		} else {
      action = isAdd ? 'attach' : 'detach';
			win.document[ action + 'Event' ]( 'on' + eventType, listener );
		}
    
    // remove the listener from the hash
    if( !isAdd ) {
      this.listeners.erase( listenerKey );
    }
  },
   
  handleKeyEvent: function( event, windowId, eventType ) {
    // Add the stop function to the event because this is not a MooTools event. However, we cannot use
    // $extend( event, Event ) because IE throws an error: Member not found. This is because it is trying to do:
    //   event[ 'type' ] = Event[ 'type' ]
    // and type is a reserved word.
    // TODO: perhaps try to figure out how MooTools extends Events
    event.stop = function() {
		  if ( Browser.Engine.trident ) {
  			this.cancelBubble = true;
  			this.returnValue = false;
  		}	else {	
  			this.preventDefault();
  			this.stopPropagation();
  		}
    };
    
    // We need to check if MooTools is loaded because this event can happen when the user presses
    // a refresh key sequence such as 'F5', 'Ctrl-r', etc. When that happens, this event still gets called,
    // but the browser may have already unloaded all the javascript including MooTools.
    if( typeof( MooTools ) !== 'undefined' ) {
      var windows = this.hotKeys.get( eventType );
      // if there are windows for this eventType, continue
      if( $chk( windows ) ) {
        var target = this.getTarget( event );
        // When clicking on the document, presto returns the document which doesn't have a
        // 'get' function. Hence, we just set the targetId to null.
        var targetId = $chk( target.get ) ? target.get( 'id' ) : null; 
        var keystroke = this.getKeystroke( event, eventType );
        
        //This is to fix bug #1358 - Tabbing table cells doesn't work in the editor. 
        //For some reason the event.stop function is not being called correctly on newley created
        //tables.
        
        //TODO: I am not sure that the above event.stop function is actually needed.  If it is not
        //that we should remove it.
//        if( [ 'shift-tab','tab' ].contains( keystroke ) ) { event.stop(); }
        
        var targets = windows.get( windowId );
        // if there are targets for this windowId, continue
        if( $chk( targets ) ) {
          // get both the specific and general targets
          [ targets.get( targetId ), targets.get( this.nullTargetId ) ].each( function( keystrokes ) {
            // if there are keystrokes, continue
            if( $chk( keystrokes ) ) {
              // get both the specific and general keystrokes
              [ keystrokes.get( keystroke ), keystrokes.get( 'all' ) ].each( function( fn ) {
                // if there is a function, call it
                if( $chk( fn ) ) {
                  if( /^ctrl-/i.test( keystroke ) ) {
                    event.stop();
                  }
                  fn( event, eventType, keystroke );
                }
              }.bind( this ) );
            }
          }.bind( this ) );
        }
      }
    }
  },
  
  getNextHash: function( hash, key, fn ) {
    var value = hash.get( key );
    // create a hash if there is no value
    if( !$chk( value ) ) {
      // call the function if given
      if( $chk( fn ) ) {
        fn();
      }
      value = new Hash();
      hash.set( key, value );
    }
    return value;
  },
  
  getTarget: function( event ) {
    var target;
    
    if( event.target ) {
      // non-trident
      target = event.target;
    } else if (event.srcElement) {
      // trident
      target =  event.srcElement;
    } 
    
    if( target.nodeType === 3 ) {
      // Webkit
      target = target.parentNode;
    }
    
    return $( target );
  },
  
  getKeystroke: function( event, eventType ) {
    var code = event.keyCode || event.charCode;
    var keystroke = '';
    
    // handle the modifiers
    if( event.ctrlKey ) {
      keystroke += 'ctrl' + G.Keyboard.HotKey.DELIMETER;
    }
    if( event.shiftKey ) {
      keystroke += 'shift' + G.Keyboard.HotKey.DELIMETER;
    }
    if( event.altKey ) {
      keystroke += 'alt' + G.Keyboard.HotKey.DELIMETER;
    }
    
		// checks for ascii, else uses the keys map
		if( this.isAscii( code, eventType ) ){
			keystroke += String.fromCharCode( code ).toLowerCase();
		} else {
      keystroke += this.keys[ code ];
		}
    
    return keystroke;
  },
  
  isAscii: function( code, eventType ) {
    if( 'keypress' === eventType ) {
      return ( code >= 33 && code <= 126 );
    } else {
      return ( ( code >= 48 && code <= 57 ) || ( code >= 65 && code <= 90 ) ); 
    }
  },
  
  getWindowId: function( hotKey ) {
    var windowId; 
    var iframe = hotKey.iframe;
    if( $chk( iframe ) ) {
      windowId = this.getElementId( iframe );
    } else {
      // create an id if it doesn't exist
      this.parentWindowId = this.parentWindowId || new Date().valueOf();
      windowId = this.parentWindowId;
    }
    return windowId;
  },
  
  getWindow: function( hotKey ) {
    var win;
    var iframe = hotKey.iframe;
    if( $chk( iframe ) ) {
      win = iframe.contentWindow;
    } else {
      win = window; 
    }
    return win;
  },
  
  getTargetId: function( hotKey ) {
    var targetId;
    if( $chk( hotKey.target ) ) {
      targetId = this.getElementId( hotKey.target );
    } else {
      // create an id if it doesn't exist
      this.nullTargetId = this.nullTargetId || 'null_target_' + new Date().valueOf();
      targetId = this.nullTargetId;
    }
    return targetId;
  },
  
  getElementId: function( element ) {
    var id = element.get( 'id' );
    // if an id doesn't exist, generate one
    if( !$chk( id ) ) {
      id = 'element_' + new Date().valueOf();
      element.set( 'id', id );
    }
    return id;
  }
};
