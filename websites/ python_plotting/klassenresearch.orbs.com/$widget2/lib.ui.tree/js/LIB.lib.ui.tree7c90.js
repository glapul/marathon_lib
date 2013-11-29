//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

/*
---

script: More.js

description: MooTools More

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.2.4.4',
	'build': '6f6057dc645fdb7547689183b2311063bd653ddf'
};

/*
---

script: Element.Delegation.js

description: Extends the Element native object to include the delegate method for more efficient event management.

credits:
- "Event checking based on the work of Daniel Steigerwald. License: MIT-style license.	Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
- Aaron Newton
- Daniel Steigerwald

requires:
- core:1.2.4/Element.Event
- core:1.2.4/Selectors
- /MooTools.More

provides: [Element.Delegation]

...
*/

(function(addEvent, removeEvent){
	
	var match = /(.*?):relay\(([^)]+)\)$/,
		combinators = /[+>~\s]/,
		splitType = function(type){
			var bits = type.match(match);
			return !bits ? {event: type} : {
				event: bits[1],
				selector: bits[2]
			};
		},
		check = function(e, selector){
			var t = e.target;
			if (combinators.test(selector = selector.trim())){
				var els = this.getElements(selector);
				for (var i = els.length; i--; ){
					var el = els[i];
					if (t == el || el.hasChild(t)) return el;
				}
			} else {
				for ( ; t && t != this; t = t.parentNode){
					if (Element.match(t, selector)) return document.id(t);
				}
			}
			return null;
		};

	Element.implement({

		addEvent: function(type, fn){
			var splitted = splitType(type);
			if (splitted.selector){
				var monitors = this.retrieve('$moo:delegateMonitors', {});
				if (!monitors[type]){
					var monitor = function(e){
						var el = check.call(this, e, splitted.selector);
						if (el) this.fireEvent(type, [e, el], 0, el);
					}.bind(this);
					monitors[type] = monitor;
					addEvent.call(this, splitted.event, monitor);
				}
			}
			return addEvent.apply(this, arguments);
		},

		removeEvent: function(type, fn){
			var splitted = splitType(type);
			if (splitted.selector){
				var events = this.retrieve('events');
				if (!events || !events[type] || (fn && !events[type].keys.contains(fn))) return this;

				if (fn) removeEvent.apply(this, [type, fn]);
				else removeEvent.apply(this, type);

				events = this.retrieve('events');
				if (events && events[type] && events[type].keys.length == 0){
					var monitors = this.retrieve('$moo:delegateMonitors', {});
					removeEvent.apply(this, [splitted.event, monitors[type]]);
					delete monitors[type];
				}
				return this;
			}
			return removeEvent.apply(this, arguments);
		},

		fireEvent: function(type, args, delay, bind){
			var events = this.retrieve('events');
			if (!events || !events[type]) return this;
			events[type].keys.each(function(fn){
				fn.create({bind: bind || this, delay: delay, arguments: args})();
			}, this);
			return this;
		}

	});

})(Element.prototype.addEvent, Element.prototype.removeEvent);

//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

/*
---

script: More.js

description: MooTools More

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.2.4.4',
	'build': '6f6057dc645fdb7547689183b2311063bd653ddf'
};

/*
---

script: Element.Measure.js

description: Extends the Element native object to include methods useful in measuring dimensions.

credits: "Element.measure / .expose methods by Daniel Steigerwald License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Style
- core:1.2.4/Element.Dimensions
- /MooTools.More

provides: [Element.Measure]

...
*/

Element.implement({

	measure: function(fn){
		var vis = function(el) {
			return !!(!el || el.offsetHeight || el.offsetWidth);
		};
		if (vis(this)) return fn.apply(this);
		var parent = this.getParent(),
			restorers = [],
			toMeasure = []; 
		while (!vis(parent) && parent != document.body) {
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose();
		var result = fn.apply(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return $empty;
		var before = this.style.cssText;
		this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		});
		return function(){
			this.style.cssText = before;
		}.bind(this);
	},

	getDimensions: function(options){
		options = $merge({computeSize: false},options);
		var dim = {};
		var getSize = function(el, options){
			return (options.computeSize)?el.getComputedSize(options):el.getSize();
		};
		var parent = this.getParent('body');
		if (parent && this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else if (parent){
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		} else {
			dim = {x: 0, y: 0};
		}
		return $chk(dim.x) ? $extend(dim, {width: dim.x, height: dim.y}) : $extend(dim, {x: dim.width, y: dim.height});
	},

	getComputedSize: function(options){
		options = $merge({
			styles: ['padding','border'],
			plains: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);
		var size = {width: 0,height: 0};
		switch (options.mode){
			case 'vertical':
				delete size.width;
				delete options.plains.width;
				break;
			case 'horizontal':
				delete size.height;
				delete options.plains.height;
				break;
		}
		var getStyles = [];
		//this function might be useful in other places; perhaps it should be outside this function?
		$each(options.plains, function(plain, key){
			plain.each(function(edge){
				options.styles.each(function(style){
					getStyles.push((style == 'border') ? style + '-' + edge + '-' + 'width' : style + '-' + edge);
				});
			});
		});
		var styles = {};
		getStyles.each(function(style){ styles[style] = this.getComputedStyle(style); }, this);
		var subtracted = [];
		$each(options.plains, function(plain, key){ //keys: width, height, plains: ['left', 'right'], ['top','bottom']
			var capitalized = key.capitalize();
			size['total' + capitalized] = size['computed' + capitalized] = 0;
			plain.each(function(edge){ //top, left, right, bottom
				size['computed' + edge.capitalize()] = 0;
				getStyles.each(function(style, i){ //padding, border, etc.
					//'padding-left'.test('left') size['totalWidth'] = size['width'] + [padding-left]
					if (style.test(edge)){
						styles[style] = styles[style].toInt() || 0; //styles['padding-left'] = 5;
						size['total' + capitalized] = size['total' + capitalized] + styles[style];
						size['computed' + edge.capitalize()] = size['computed' + edge.capitalize()] + styles[style];
					}
					//if width != width (so, padding-left, for instance), then subtract that from the total
					if (style.test(edge) && key != style &&
						(style.test('border') || style.test('padding')) && !subtracted.contains(style)){
						subtracted.push(style);
						size['computed' + capitalized] = size['computed' + capitalized]-styles[style];
					}
				});
			});
		});

		['Width', 'Height'].each(function(value){
			var lower = value.toLowerCase();
			if(!$chk(size[lower])) return;

			size[lower] = size[lower] + this['offset' + value] + size['computed' + value];
			size['total' + value] = size[lower] + size['total' + value];
			delete size['computed' + value];
		}, this);

		return $extend(styles, size);
	}

});

/*
---

script: Element.Position.js

description: Extends the Element native object to include methods useful positioning elements relative to others.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Element.Dimensions
- /Element.Measure

provides: [Elements.Position]

...
*/

(function(){

var original = Element.prototype.position;

Element.implement({

	position: function(options){
		//call original position if the options are x/y values
		if (options && ($defined(options.x) || $defined(options.y))) return original ? original.apply(this, arguments) : this;
		$each(options||{}, function(v, k){ if (!$defined(v)) delete options[k]; });
		options = $merge({
			// minimum: { x: 0, y: 0 },
			// maximum: { x: 0, y: 0},
			relativeTo: document.body,
			position: {
				x: 'center', //left, center, right
				y: 'center' //top, center, bottom
			},
			edge: false,
			offset: {x: 0, y: 0},
			returnPos: false,
			relFixedPosition: false,
			ignoreMargins: false,
			ignoreScroll: false,
			allowNegative: false
		}, options);
		//compute the offset of the parent positioned element if this element is in one
		var parentOffset = {x: 0, y: 0}, 
				parentPositioned = false;
		/* dollar around getOffsetParent should not be necessary, but as it does not return
		 * a mootools extended element in IE, an error occurs on the call to expose. See:
		 * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
		var offsetParent = this.measure(function(){
			return document.id(this.getOffsetParent());
		});
		if (offsetParent && offsetParent != this.getDocument().body){
			parentOffset = offsetParent.measure(function(){
				return this.getPosition();
			});
			parentPositioned = offsetParent != document.id(options.relativeTo);
			options.offset.x = options.offset.x - parentOffset.x;
			options.offset.y = options.offset.y - parentOffset.y;
		}
		//upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
		//topRight, topLeft, centerTop, centerBottom, center
		var fixValue = function(option){
			if ($type(option) != 'string') return option;
			option = option.toLowerCase();
			var val = {};
			if (option.test('left')) val.x = 'left';
			else if (option.test('right')) val.x = 'right';
			else val.x = 'center';
			if (option.test('upper') || option.test('top')) val.y = 'top';
			else if (option.test('bottom')) val.y = 'bottom';
			else val.y = 'center';
			return val;
		};
		options.edge = fixValue(options.edge);
		options.position = fixValue(options.position);
		if (!options.edge){
			if (options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center', y:'center'};
			else options.edge = {x:'left', y:'top'};
		}

		this.setStyle('position', 'absolute');
		var rel = document.id(options.relativeTo) || document.body,
				calc = rel == document.body ? window.getScroll() : rel.getPosition(),
				top = calc.y, left = calc.x;

		var dim = this.getDimensions({computeSize: true, styles:['padding', 'border','margin']});
		var pos = {},
				prefY = options.offset.y,
				prefX = options.offset.x,
				winSize = window.getSize();
		switch(options.position.x){
			case 'left':
				pos.x = left + prefX;
				break;
			case 'right':
				pos.x = left + prefX + rel.offsetWidth;
				break;
			default: //center
				pos.x = left + ((rel == document.body ? winSize.x : rel.offsetWidth)/2) + prefX;
				break;
		}
		switch(options.position.y){
			case 'top':
				pos.y = top + prefY;
				break;
			case 'bottom':
				pos.y = top + prefY + rel.offsetHeight;
				break;
			default: //center
				pos.y = top + ((rel == document.body ? winSize.y : rel.offsetHeight)/2) + prefY;
				break;
		}
		if (options.edge){
			var edgeOffset = {};

			switch(options.edge.x){
				case 'left':
					edgeOffset.x = 0;
					break;
				case 'right':
					edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
					break;
				default: //center
					edgeOffset.x = -(dim.totalWidth/2);
					break;
			}
			switch(options.edge.y){
				case 'top':
					edgeOffset.y = 0;
					break;
				case 'bottom':
					edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
					break;
				default: //center
					edgeOffset.y = -(dim.totalHeight/2);
					break;
			}
			pos.x += edgeOffset.x;
			pos.y += edgeOffset.y;
		}
		pos = {
			left: ((pos.x >= 0 || parentPositioned || options.allowNegative) ? pos.x : 0).toInt(),
			top: ((pos.y >= 0 || parentPositioned || options.allowNegative) ? pos.y : 0).toInt()
		};
		var xy = {left: 'x', top: 'y'};
		['minimum', 'maximum'].each(function(minmax) {
			['left', 'top'].each(function(lr) {
				var val = options[minmax] ? options[minmax][xy[lr]] : null;
				if (val != null && pos[lr] < val) pos[lr] = val;
			});
		});
		if (rel.getStyle('position') == 'fixed' || options.relFixedPosition){
			var winScroll = window.getScroll();
			pos.top+= winScroll.y;
			pos.left+= winScroll.x;
		}
		if (options.ignoreScroll) {
			var relScroll = rel.getScroll();
			pos.top-= relScroll.y;
			pos.left-= relScroll.x;
		}
		if (options.ignoreMargins) {
			pos.left += (
				options.edge.x == 'right' ? dim['margin-right'] : 
				options.edge.x == 'center' ? -dim['margin-left'] + ((dim['margin-right'] + dim['margin-left'])/2) : 
					- dim['margin-left']
			);
			pos.top += (
				options.edge.y == 'bottom' ? dim['margin-bottom'] : 
				options.edge.y == 'center' ? -dim['margin-top'] + ((dim['margin-bottom'] + dim['margin-top'])/2) : 
					- dim['margin-top']
			);
		}
		pos.left = Math.ceil(pos.left);
		pos.top = Math.ceil(pos.top);
		if (options.returnPos) return pos;
		else this.setStyles(pos);
		return this;
	}

});

})();

/*
---

script: Fx.Move.js

description: Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

license: MIT-style license

authors:
- Aaron Newton

requires:
- core:1.2.4/Fx.Morph
- /Element.Position

provides: [Fx.Move]

...
*/

Fx.Move = new Class({

	Extends: Fx.Morph,

	options: {
		relativeTo: document.body,
		position: 'center',
		edge: false,
		offset: {x: 0, y: 0}
	},

	start: function(destination){
		return this.parent(this.element.position($merge(this.options, destination, {returnPos: true})));
	}

});

Element.Properties.move = {

	set: function(options){
		var morph = this.retrieve('move');
		if (morph) morph.cancel();
		return this.eliminate('move').store('move:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('move')){
			if (options || !this.retrieve('move:options')) this.set('move', options);
			this.store('move', new Fx.Move(this, this.retrieve('move:options')));
		}
		return this.retrieve('move');
	}

};

Element.implement({

	move: function(options){
		this.get('move').start(options);
		return this;
	}

});

G.Tree = new Class({
  
  Implements: [ 
    Options, 
    Events
  ],
  
  options: {
    data: null,
    maxLevel: 10,
    saveUrl: null,
    startExpanded: false,
    expandedChildren: []
    //onBeforeDrop: $empty
    //onAfterMove: $empty
    //onAfterSave: $empty
    //onSaveFailed: $empty
    //onClickNode: $empty
  },
  
  data: null,
  rootController: null,
  searcher: null,
  mover: null,
  highlighter: null,
  dragger: null,
  // for the templates, we want to take the first child of the wrapping el
  // we do the lookup here instead of in the view class so that 
  // we can do it once and then just reuse these elements
  viewRootTemplate: $$( '.node_root_elements' )[0].getChildren()[0],
  viewChildTemplate: $$( '.node_child_elements' )[0].getChildren()[0],
  
  initialize: function( options ) {
    this.setOptions( options );
    this.data = this.options.data;  
    this.rootController = new G.Tree.Node.Controller({
      data: this.options.data, 
      isRoot: true,
      maxLevel: this.options.maxLevel,
      startExpanded: this.options.startExpanded,
      expandedChildren: this.options.expandedChildren.sort(),
      viewRootTemplate: this.viewRootTemplate,
      viewChildTemplate: this.viewChildTemplate
    });
    this.searcher = new G.Tree.Searcher( this.rootController );
    this.view = this.rootController.getView();
    this.buildDragger();
    this.addNodeClickEvent();
    this.height = this.getRootController().getContainer().getSize().y;
    this.saveState();
  },
  
  save: function() {
    if ( !this.options.saveUrl ) { return null; }
    var request = new Request.JSON( { 
      url: this.options.saveUrl,
      data: {
        data: JSON.encode( this.getRootController().getData() )
      }, 
      onSuccess: function( responseJSON, responseText ) {
        this.fireEvent( 'onAfterSave', [ responseJSON, responseText ] );
      }.bind( this ),
      onFailure: function( responseJSON, responseText ) {
        this.fireEvent( 'onSaveFailed', [ responseJSON, responseText ] );
      }
    } );
    return request.send();
  },
  
  addNode: function( nodeName ) {
    var controller = new G.Tree.Node.Controller(  { 
      data: [ nodeName, [] ],  
      expandedChildren: this.options.expandedChildren
     } );
    this.getRootController().addNode( controller );
    return controller;
  },
  
  activateDrag: function() {
    this.getDragger().activate();
  },
  
  deActivateDrag: function() {
    this.getDragger().deactivate();
  },
  
  getRootController: function() {
    return this.rootController;
  },
  
  getSearcher: function() {
    return this.searcher;
  },

  getRootElement: function() {
    return this.getRootController().getContainer();
  },
  
  getDragger: function() {
    return this.dragger;
  },
  
  expandChildren: function() {
    this.getRootController().expandChildren();
  },
  
  expandToChild: function( searchName, showHighlight, select ) {
    var indexes = this.getChildrenIndexes( searchName );
    if ( indexes ) {
      if( $defined( select ) ) {
        return this.getRootController().expandToNodeUnselected( indexes ); 
      } else {
        return this.getRootController().expandToNode( indexes, showHighlight ); 
      }
    }
  },
  
  getOpenNodes: function() {
    return this.getRootController().getOpenNodes();
  },
  
  pathToChild: function( searchName ) {
    var childrenList = this.getChildrenIndexes( searchName ) ;
    var controller = this.getRootController();
    if( !$defined( childrenList ) ){ return []; }
    return childrenList.map( function( controllerIndex, index ){
      var currentController = controller.getChildControllerByIndex( controllerIndex );
      controller = currentController;
      return currentController.getName();
    } );
  },
  
  getChildrenIndexes: function( searchName ) {
    return this.searcher.findIndexes( this.getRootController().getData()[ 1 ], searchName );
  },
  
  //PRIVATE
  
  buildDragger: function() {
    this.dragger = new G.Tree.Node.Drag(
      this.rootController, 
      this.searcher, 
      {
        nameContainerClass: this.view.getClass('nameContainer'),
        iconClass: this.view.getClass('icon'),
        nameTextClass: this.view.getClass( 'nameTextContainer' ),
        dropZoneActiveClass: this.view.getClass('dropZoneActive'),
        onAfterMove: function() {
          this.save();
          this.saveState();
          this.fireEvent( 'afterMove', [ this ] );
        }.bind( this ),
        onLevelTooDeep: function( toEl ) {
          this.fireEvent( 'levelTooDeep', toEl );
        }.bind( this )
      }
    );
  },
  
  addNodeClickEvent: function() {
    var func = function( e ) {
      this.fireEvent( 'clickNode', [ e.target.get( 'text' ), e ] );
    }.bind( this );
    
    var saveStateFunc = function( e ) {
      this.saveState();
    }
    
    var events = {};
    events[ 'click:relay( .' + this.getRootController().getView().getClass( 'nameTextContainer' ) + ')' ] = func;
    events[ 'click:relay( .' + this.getRootController().getView().getClass( 'icon' ) + ')' ] = func;
    this.getRootController().getContainer().addEvents( events );
    this.getRootController().getView().addEvent( 'expandShrink', saveStateFunc.bind( this ) );
    this.getRootController().addEvent( 'onSetCurrent', saveStateFunc.bind( this ) );
  },
  
  saveState: function() {
    new G.Tree.StateManager( {
      openNodes: this.getOpenNodes()
    } );
  }
  
    
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}

G.Tree.BreadCrumb = new Class({
  
  Implements: [ Options ],
  
  options: {
    baseUrl: '/',
    rootNode: 'Home'
  },
  
  // this class is used in lib.ui.tree.bread_crumb as well
  // so if you change this make sure to update that class
  itemClass: 'tree_bread_crumb_item',  
  // these don't appear to be used
//  selectedItemClass: 'bread_crumb_selected',
//  unselectedItemClass: 'bread_crumb_unselected',
  
  initialize: function( elementList, options ){
    this.setOptions( options );
    this.elementList = $type( elementList  ) !== 'array' ? [ elementList ] : elementList;
  },
  
  set: function( breadcrumbArray ) {
    this.elementList.each( function( el, index ) {
      $( el ).set( 'html', this.asString( breadcrumbArray ) );
    }, this );
  },
  
  asString: function( breadcrumbArray ) {
    var breadCrumbString = '<div class="tree_bread_crumb">' + 
      this.getBreadCrumbStart( breadcrumbArray.length === 0 );
    var lastItem = breadcrumbArray.getLast();
    breadcrumbArray.each( function( item, index ) {
      var isLastItem = item === lastItem;
      var stringTemplate = isLastItem ? this.getStringTemplateText() : this.getStringTemplateLink();
      breadCrumbString += ' &gt; ' + stringTemplate.
        substitute( this.getSubstituteOptions( item, isLastItem ) ); 
    }, this );
    return breadCrumbString + '</div>';
  },
  
  getSubstituteOptions: function( item, isSelected ) {
    var formatter = new G.HtmlFormatter();
    var escapedItem = formatter.escapeHtml( item );
    return {
      link: this.options.baseUrl + encodeURIComponent( item ).replace( /%20/g, "+" ),
      className: this.itemClass,
      text: escapedItem
    };
  },
  
  getBreadCrumbStart: function( isHome ) {
    return this.getStringTemplateLink().
      substitute( this.getSubstituteOptions( this.options.rootNode, isHome ) );
  },
  
  getStringTemplateLink: function() {
    return "<a href='{link}' class='{className}'>{text}</a>";
  },
  
  getStringTemplateText: function() {
    return "{text}";
  }
  
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}

G.Tree.Searcher = new Class({
  
  Implements: [],
  
  initialize: function( rootController ) {
    this.rootController = rootController;  
  },
  
  getRootController: function() {
    return this.rootController;
  },

  getParentController: function( childController ) {
    var indexes = this.findIndexes( this.rootController.getChildrenData(), childController.getName() );
    if ( !$defined(indexes) ) { throw "TreeSearchError: Can't find parent controller."; }
    indexes.pop();  // we don't want the last index since that's for the item itself.  We only want the parent.
    return this.getControllerFromIndexes( indexes );
  },
  
  getControllerFromIndexes: function( indexes ) {
    var controller = this.getRootController();
    indexes.each(function( value ) {
      controller = controller.getChildControllers()[ value ];
    });
    return controller;
  },

  findIndexes: function( children, searchName ) {
    var childrenLength = children.length;
    for ( var i=0; i < childrenLength; i++ ) {
      var node = children[ i ];
      if( node[ 0 ] === searchName  ) {
        return [ i ];
      } else {
        var subIndexes = this.findIndexes( node[ 1 ], searchName );
        if( subIndexes ) {
          return [ i ].concat( subIndexes );
        }
      }
    }
    return null;
  }
    
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}

// Remove the controller from the old position
// Add the moved controller in the new position
// getData() should be up to date NOW
// Animate the shrinking of the old element
// Move the element to the new location
// Animate the growing of the element in the new location

G.Tree.Mover = new Class({
  
  initialize: function( treeSearcher ) {
    this.searcher = treeSearcher;
  },

  moveNodeToDropZone: function( moveController, dropzone ) {
    var toView = dropzone.retrieve( 'view' );
//    toView.deactivateAllDropZones();
//    toView.resetIcon();
    this.moveNode( 
      moveController, 
      toView.getController(), 
      !toView.isChildDropZone( dropzone )
    );
  },
  
  moveNode: function( moveController, toController, isSibling ) {
    if( isSibling ) {
      this.moveNodeAfterSibling( moveController, toController );
    } else {
      this.moveNodeUnderParent( moveController, toController );
    }
  },
  
  moveNodeUnderParent: function( moveController, parentController ) {
    this.removeControllerFromParent( moveController );
    parentController.addChildController( moveController, 0 );
    this.animateMove( moveController, parentController );
  },
  
  moveNodeAfterSibling: function( moveController, siblingController ) {
    this.removeControllerFromParent( moveController );
    var parentController = this.searcher.getParentController( siblingController );
    // if the moved controller is from above the sibling controller and at the same level
    // the position of the moved controller should be that of the sibling, since the 
    // movement of the sibling to behind the moved controller will bump the index up one
    // otherwise the position should be one more than the sibling
    var position = parentController.getChildControllers().indexOf( siblingController ) + 1;
    parentController.addChildController( moveController, position );
    this.animateMove( moveController, parentController );
  },
  
  removeControllerFromParent: function( controller ) {
    var parent = this.searcher.getParentController( controller );
    parent.removeChildController( controller );
  },
  
  animateMove: function( moveController, parentController ) {
    moveController.chain(
      function() {
        moveController.getView().hideAnimated({
          onComplete: function() {
            parentController.refreshChildElementPosition( moveController );
            moveController.callChain();
          }
        });
      },
      function() {
        this.getView().showAnimated({
          onComplete: function() {
            moveController.callChain();
          }
        });
      },
      function() {
        this.highlightNodeAndFade(0);
        this.callChain();
      }
    );
    moveController.callChain();
  }  
  
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}

G.Tree.DropZoneActivator = new Class({
  
  Implements: [ Events, Options ],
  
  Binds: [ 'onMousemoveNameContainer', 
           'onMouseleaveNameContainer',
           'onMouseenterDropZone',
           'onMouseleaveDropZone' ],
  
  options: {
    nameContainerClass: null,
    dropZoneClass: null,
    offsetPercentage: 12.5  // percentage of top and bottom of nameContainer that will select the previous or next drop zone
//    onChangeNameContainerLocation: $empty,
//    onEnterNameContainerTop: $empty,
//    onEnterNameContainerMiddle: $empty,
//    onEnterNameContainerBottom: $empty,
//    onLeaveNameContainer: $empty,
//    onEnterDropZone: $empty,
//    onLeaveDropZone: $empty
  },

  lastMouseLocation: null,
  initialize: function( container, options ) {
    this.setOptions( options );
    this.container = $( container );
  },
  
  start: function(){
    this.container.addEvents( this.getEvents() );
  },
  
  stop: function(){
    this.container.removeEvents( this.getEvents() );
  },
  
  // PRIVATE
  
  getEvents: function(){
    var eventsHash = {};
    eventsHash[ 'mousemove:relay(.' + this.options.nameContainerClass + ')' ] = this.onMousemoveNameContainer;
    // NOTE: we use mouseover and mouseout here instead of mouseenter and mouseleave because they were not firing, except
    //       for the very last drop zone.  When we add an mousenter event to every drop zone individually, it works fine.
    //       So it seems there is a problem with using mousenter and event delegation.  It may have to do with
    //       mouseenter getting confused with which element's are children and which are not since the event is actually
    //       added to the containing div.
    //       For now the native JS events work fine b/c we don't have any child elements within the drop zones.
    eventsHash[ 'mouseout:relay(.' + this.options.nameContainerClass + ')' ] = this.onMouseleaveNameContainer;
    eventsHash[ 'mouseover:relay(.' + this.options.dropZoneClass + ')' ] = this.onMouseenterDropZone;
    eventsHash[ 'mouseout:relay(.' + this.options.dropZoneClass + ')' ] = this.onMouseleaveDropZone;
    return eventsHash;
  },
  
  onMousemoveNameContainer: function( e ) {
    var nameContainer = this.getNameContainerFromTarget( e.target );
    if ( !$defined( nameContainer) ) { return null; }
    var mouseLocation = this.calculateMouseLocation( nameContainer, e.page.y );
    
    // We only update the highlights if the mouse location has actually changed.
    if ( this.lastMouseLocation === mouseLocation ) { return null; }
    this.lastMouseLocation = mouseLocation;

    this.fireEvent( 'changeNameContainerLocation', [ nameContainer, e ] );
    if ( mouseLocation === 'top' ) {
      this.fireEvent( 'enterNameContainerTop', [ nameContainer, e ] );
    } else if ( mouseLocation === 'bottom' ) {
      this.fireEvent( 'enterNameContainerBottom', [ nameContainer, e ] );
    } else if ( mouseLocation === 'middle' ) {
      this.fireEvent( 'enterNameContainerMiddle', [ nameContainer, e ] );
    }
  },

  calculateMouseLocation: function ( nameContainer, mouseY ) {
    var coords = nameContainer.getCoordinates();
    var offsetPx = coords.height * ( this.options.offsetPercentage / 100 );
    if ( mouseY <= coords.top + offsetPx ) {
      return 'top';
    } else if ( mouseY >= coords.bottom - offsetPx ) {
      return 'bottom';
    } else {
      return 'middle';
    }
  },

  onMouseleaveNameContainer: function( e ){
    this.lastMouseLocation = null;
    var nameContainer = this.getNameContainerFromTarget( e.target );
    if ( !$defined( nameContainer) ) { return null; }
    this.fireEvent( 'leaveNameContainer', [ nameContainer, e ] );
  },
  
  onMouseenterDropZone: function( e ){
    this.fireEvent( 'enterDropZone', e );
  },
  
  onMouseleaveDropZone: function( e ){
    this.fireEvent( 'leaveDropZone', e );
  },
  
  getNameContainerFromTarget: function( target ) {
    // Make sure target is extended with Mootools since in IE sometimes it is not.
    // Could be because we are using native javascript events instead of Mootools events.
    target = $( target );  
    if ( target.hasClass( this.options.nameContainerClass ) ) { return target; }
    return target.getParent( '.' + this.options.nameContainerClass );
  }

});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}

G.Tree.ViewDropZoneActivator = new Class({
  Extends: G.Tree.DropZoneActivator,
  
  options: {
  
    nameContainerSelector: null,
    dropZoneSelector: null,
    offsetPercentage: 12.5,
    
    onChangeNameContainerLocation: function( nameContainer, e ) {
      var view = nameContainer.retrieve('view');
      this.reset( view );
      $clear( this.hoverFn );
    },
    
    destinationView: null,  // view we are dragging to
    draggedView: null,  // view that is being dragged
    
    onEnterNameContainerTop: function( nameContainer, e ) {
      var view = nameContainer.retrieve('view');
      this.setDestinationView( view );
      this.activateDropZone( view.getFirstPreviousDropZone() );
    },

    onEnterNameContainerMiddle: function( nameContainer, e ) {
      var view = nameContainer.retrieve('view');
      this.setDestinationView( view );
      var dz = view.getNameDropZone( this.getDraggedView() );
      // dz could be null if the view's ancestor is selected
      if ( dz ) {
        dz.getContainer().setStyle('visibility', 'hidden');
        // we want to hide the drop zone since it will be at the 
        // very end of the list
        this.activateDropZone( dz );
        view.setAddIcon();
        this.createDelayedHoverEvent( view );
      }
    },
    
    onEnterNameContainerBottom: function( nameContainer, e ) {
      var view = nameContainer.retrieve('view');
      this.setDestinationView( view );
      this.activateDropZone( view.getFirstVisibleDropZone() );
    },
    
    onLeaveNameContainer: function( nameContainer, e ) {
      var view = nameContainer.retrieve('view');
      this.reset( view );
    },
    
    onEnterDropZone: function( e ){
      var view = e.target.retrieve('view');
      this.setDestinationView( view );
      this.activateDropZone( view.getDropZoneBasedOnEl( e.target ) );
    },
    
    onLeaveDropZone: function( e ) {
      this.deactivateDropZone();
    }
  },
  
  reset: function( view ) {
    this.setDestinationView( null );
    this.deactivateDropZone();
    if (view) {
      if (!view.isSelected()) {
        view.resetIcon();
      }
    }
  },
  
  activateDropZone: function( dz ) {
    // deactivate the old one just in case
    if ( this.dropZone ) {
      this.dropZone.deactivate();
    }
    // activate the new one
    if ( dz ) {
      dz.activate();
    }
    this.dropZone = dz;
  },
  
  deactivateDropZone: function() {
    if ( this.dropZone ) {
      this.dropZone.deactivate();
      // in case it was set to invisible before
      this.dropZone.getContainer().setStyle( 'visibility', 'visible' );
      this.dropZone = null;
    }
  },
  
  createDelayedHoverEvent: function( view ) {
    this.hoverFn = function() {
      this.fireEvent( 'nameHover', [ view ] );
    }.delay( 1500, this );
  },

  start: function( draggedView ) {
    this.parent();
    this.draggedView = draggedView;
  },

  stop: function() {
    this.parent();
    $clear( this.hoverFn );
    this.draggedView = null;
    this.reset( this.getDestinationView() );
  },
  
  getDraggedView: function() {
    return this.draggedView;
  },
  
  getDestinationView: function() {
    return this.destinationView;
  },
  
  setDestinationView: function( view ) {
   this.destinationView = view;
  }
  

});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}

/*
  The StateManager handles the "state" of each node.  If a node is opened then that state is 
  Saved into a cookie and when the page is reloaded the open nodes are remembered.  If the data
  being saved is too big to be saved into one cookie StateManager then splits it into several cookies.
*/
G.Tree.StateManager = new Class( {

  Implements: [ 
    Options
  ],
  
  options: {
    openNodes: [],
    bufferSize: 3500//Make this an option so we can toggle the value for testing
  },
  
  initialize: function( options ) {
    //If we have achieved the maximum size for this paticular browsers
    //max cookie size ( Typicly 4k ) then spawn off another cookie and
    //continue storing in that.
    this.setOptions( options );
    var allOpen = this.options.openNodes.sort();
    this.handleState( allOpen );
  },
  
  //if the cookie size is under the buffer size then encode the data 
  //and save it to a cookie, otherwise we need to start splitting the 
  //data into several cookies.
  handleState: function( allOpen ) {
    var encodedArray = JSON.encode( allOpen );
    if( ( encodedArray.length + 10 ) <= this.options.bufferSize ) {
      this.writeCookie( this.getCookieName(), allOpen );
    } else {
      this.deleteCookies();
      this.setCookies( this.splitArray( allOpen ) );
    }
  },
  
  //Deletes all cookies made by the StateManager
  deleteCookies: function() {
    $H( this.getCookies() ).each( function( key, cookieName ) {
      Cookie.dispose( cookieName );
    } );
  },
  
  //Creates a cookie for the data which has been split by size.
  setCookies: function( cookiesArray ) {
    cookiesArray.each( function( array, index ) {
      this.writeCookie( this.getNewCookieName(), array );
    }, this );
  },
  
  //Splits the data into several arrays if the data is too big.
  splitArray: function( allOpen ) {
    var nodeArray = [];
    var size = 0;
    var nodeIndex = 0;  
    nodeArray[ nodeIndex ] = [];
    allOpen.each( function( node, index ) {
      if( ( size + node.length ) >= this.options.bufferSize ) {
        nodeIndex++;
        size = 0;
        nodeArray[ nodeIndex ] = [];
      }
      size += node.length;
      nodeArray[ nodeIndex ].push( node );
    }, this );
    return nodeArray;
  },
  
  //Returns the current cookie name or creates a new cookie name.
  getCookieName: function() {
    var currentCookies = $H( this.getCookies( /treeMemory/i ) );      
    var newestCookie = this.getMostCurrentCookie( currentCookies.getKeys() );
    this.cookieName = !$defined( newestCookie ) ? this.getNewCookieName() : 
      'treeMemory_' + newestCookie;
    return this.cookieName;
  },
  
  getNewCookieName: function() {
    return 'treeMemory_' + new Date().getTime().toString();
  },
  
  //Returns the cookie which was last created by the StateManager
  getMostCurrentCookie: function( cookieNameList ) {
    var cookieNames = [];
    cookieNameList.each( function( cookie, index ) {
      cookieNames.push( cookie.split( "_" )[1] );
    } );
    cookieNames.sort();
    return cookieNames.getLast();
  },
  
  //Returns a hash of cookies which was created by the state manager.
  getCookies: function() {	 
	  var cookies = { };
    if (document.cookie && document.cookie !== '') {
      var cookiesSplit = document.cookie.split(';');
      cookiesSplit.each( function( currentCookie, index ) {
        var nameValue = currentCookie.split( "=" );
         var cookieName = nameValue[ 0 ].replace(/^ /, '');
         if( /treeMemory/.test( cookieName ) ) {
          cookies[decodeURIComponent(cookieName)] = decodeURIComponent(nameValue[ 1 ]);
         }
      } );
    }
	  return cookies;
	},
	
	//Writes the cookie to disk.
	writeCookie: function( cookieName, cookieData ) {
	  Cookie.write( cookieName, JSON.encode( cookieData ), { duration: 360 }  );
	}
} );

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}
if ( typeof G.Tree.Node.Drag === "undefined" ){ G.Tree.Node.Drag = {};}

G.Tree.Node.Drag.Ghost = new Class( {

  //Create the ghost element position it and make it draggable.
  createDraggableGhost: function( e ) {
    var ghost = this.buildGhost();
    $( this.rootController.getContainer() ).adopt( ghost );
    this.positionGhost( ghost, e );
    this.makeDraggable( ghost, e );
    // delay showing ghost a bit in case they are actually just mousing down
    // as the click the link
    setTimeout( function() {
      ghost.setStyle( 'visibility', 'visible' );
    }, 400 );
  },

  destroyDraggableGhost: function() {
    $$( '.node_dragged_wrapper' ).each( function( el ) {
      //  IE6 crashes about 1 in 4 times when a node is moved
      // if we use #destroy here instead of #dispose.
      // To reproduce, change the below to el.destroy()
      // and then start moving nodes around.
      el.dispose();
    } );
  },
  
  buildGhost: function() {
    var name = this.view.getNameContainer();
    var size = name.getSize();
    var ghost = name.clone();
    ghost.setStyles({
      'width': size.x,
      'height': size.y
    });
    this.removeJsClassesFromGhost( ghost );
    return this.getWrappedGhost( ghost ); 
  },
  
  //Makes the ghost element a draggable entity
  makeDraggable: function( ele, e ) {
    $( ele ).makeDraggable({
      droppables: [ this.rootController.getContainer() ],
      onStart: function( element, e ) {
        this.startDragging();
        this.fireEvent( 'start', e );
      }.bind( this ),
      onDrop: function() {
        this.endDragging();
      }.bind( this ),
      onCancel: function() {
        this.cleanupDragging();
      }.bind( this )
    }).start( e );
  },
  
  removeJsClassesFromGhost: function( ghost ) {
    this.removeJsClassFromIconGhost( ghost );
    this.removeJsClassFromGhostContainer( ghost );
  },
  
  removeJsClassFromIconGhost: function( ghost ) {
    ghost.getElements( '.' + this.options.iconClass ).each( function( ghostIcon ) {
      ghostIcon.removeClass( this.options.iconClass );
    }, this );
  },
  
  removeJsClassFromGhostContainer: function( ghost ) {
    ghost.removeClass( this.options.nameContainerClass );
  }, 
  
  getWrappedGhost: function( ghost ) {
    return new Element( 'div', {
      'class': 'node_dragged_wrapper',
      'styles': {
        'visibility': 'hidden',
        'position': 'absolute',
        'border-width': 1,
        'padding': '2px 5px 2px 2px',
        'width': ghost.getStyle( 'width' ),
        'height': ghost.getStyle( 'height' )
      }
    } ).adopt( ghost );    
  },
  
  //The + 10 on the page.y is to move the ghost down 10 pixels from the cursor.
  positionGhost: function( ele, e ) {
    var positionOffset = this.getPositionOffset();
    ele.setPosition({
      x: ( e.page.x - positionOffset.x ),
      y: ( e.page.y - positionOffset.y ) + 10
    });
  },
  
  cleanupDraggingWithGhostFlyBack: function( e ) {
    var ghost = $$( '.node_dragged_wrapper' )[0];
    if( $defined( this.view ) && ghost ) {
      var move = this.getGhostFlyBackFx( ghost );
    }
  },
  
  getGhostFlyBackFx: function( ghost ) {
    return new Fx.Move( ghost, {
      relativeTo: this.view.getContainer(),
      duration: 'short',
      position: 'upperLeft',
      edge: 'upperLeft',
      onComplete: this.cleanupDragging
    }).start();
  }
  
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}
if ( typeof G.Tree.Node.Drag === "undefined" ){ G.Tree.Node.Drag = {};}

G.Tree.Node.Drag.DropZone = new Class( {

  getActiveDropZoneEl: function() {
    return this.rootController.getContainer().getElement( '.' + this.options.dropZoneActiveClass );
  },
  
  getDropZoneActivator: function() {
    if ( this.dropZoneActivator ) { return this.dropZoneActivator; }
    this.dropZoneActivator = new G.Tree.ViewDropZoneActivator( this.rootController.getContainer(), {
      nameContainerClass: this.rootController.getView().getClasses().nameContainer,
      dropZoneClass: this.rootController.getView().getClasses().dropZone,
      onNameHover: this.getNameHoverFn.bind( this  )
    });
    return this.dropZoneActivator;
  },
  
  dropViewOnDropZone: function( droppedView ) {
    var dropZoneEl = this.getActiveDropZoneEl();
    if( $defined( dropZoneEl ) ) {   // if we can find an activated drop zone
      var toView = dropZoneEl.retrieve('view');
      if ( this.canDropHere( droppedView, toView ) ) {  // if we can move here
        this.cleanupDragging();
        this.mover.moveNodeToDropZone( droppedView.getController(), dropZoneEl );
        this.fireEvent( 'afterMove' );
        return;
      } else {
        toView.resetIcon();
        toView.deactivateAllDropZones();
        this.fireEvent( 'levelTooDeep', toView.getContainer() );
      }
    }
    // if we've made it this far, we know that either we couldn't find the 
    // drop zone or we can't drop here, so we animate the ghost back to the start
    // position
    this.cleanupDraggingWithGhostFlyBack();
  },
  
  canDropHere: function( droppedView, toView ) {
    return toView.getController().canAddAndBeWithinMaxLevel( droppedView.getController() );
  }

} );

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}

/*

  G.Tree.Node.Drag handles the dragging of a tree node, it also creates a ghost node that is dragged
  while the original node stays, selected, in the tree.  The dragger fires two call backs.  onStart and 
  on Drop.  onStart is fired when the mouse is pressed down and the cursor has moved.  On drop is fired when
  the mouse is released on a droppable zone.
  
  To create a dragger
  
      this.dragger = new G.Tree.Node.Drag(
      this.rootController, 
      this.searcher, 
      {
        nameContainerClass: this.view.nameContainerClass,
        iconClass: ,
        nameTextClass: ,
        dropZoneActiveClass: this.view.dropZoneActiveClass
      } );
      
  A couple terms used in this script are selectedNode and ghost. It is important that the distinction
  is understood.  The ghost is a "Fake" node that is being dragged.  The selectedNode is the actual node 
  which is going to be moved.
  
*/

G.Tree.Node.Drag = new Class( {

  Binds: [ 
    'setupDragging',
    'startDragging',
    'endDragging',
    'cleanupDragging',
    'addEndDraggingEvents',
    'removeEndDraggingEvent',
    'showIconOnEnter',
    'resetIconOnLeave'
  ],
     
  Implements: [ 
    Events, 
    Options,
    G.Tree.Node.Drag.Ghost,
    G.Tree.Node.Drag.DropZone
  ],
  
  options: {
    nameContainerClass: null,
    iconClass: null,
    nameTextClass: null,
    dropZoneActiveClass: null
    //onStart: $empty
    //onAfterMove: $empty
  },
  
  draggableContainer: null,  // container of elements that can actually be dragged
  dropZoneActivator: null,
  
  initialize: function( rootController, searcher, options ) {
    this.setOptions( options );
    this.validateOptions();
    this.rootController = rootController;
    this.draggableContainer = this.rootController.getView().getChildrenInner();
    this.searcher = searcher;
    this.mover = new G.Tree.Mover( this.searcher );    
  },
  
  //mousedown to start drag
  activate: function() {
    this.addIconRolloverEvents();
    this.draggableContainer.addEvents( this.getActivationEvents() );
  },
  
  deactivate: function() {
    this.removeIconRolloverEvents();
    this.draggableContainer.removeEvents( this.getActivationEvents() );
  },
  
  //PRIVATE
  
  getActivationEvents: function() {
    var eventsHash = {};
    eventsHash[ 'mousedown:relay( .' + this.options.iconClass + ')' ] = this.setupDragging;
    eventsHash[ 'mousedown:relay( .' + this.options.nameTextClass + ')' ] = this.setupDragging;
    return eventsHash;
  },

  //Handles the rollovers of the node icons. Should switch to a drag icon when 
  //mouseover and back to regular icon when mouseout.  These are events are 
  //removed when drag is initiated and restarted when drag is stopped.
  getIconRolloverEvents: function() {
    var eventsHash = {};
    eventsHash[ 'mouseover:relay( .' + this.options.iconClass + ' )' ] = this.showIconOnEnter;
    eventsHash[ 'mouseout:relay( .' + this.options.iconClass + ' )' ] = this.resetIconOnLeave;
    return eventsHash;
  },

  addIconRolloverEvents: function() {
    // we only want to add the rollover events for childen, not the root node
    this.draggableContainer.addEvents( this.getIconRolloverEvents() );
  },
  
  removeIconRolloverEvents: function() {
    this.draggableContainer.removeEvents( this.getIconRolloverEvents() );
  },
  
  //getDuringDragEvents - mouseleave ( leave the tree area) cleans the
  //tree by adding events to the document, which handle the removing of classes from the tree.
  getDuringDragEvents: function() {
    return {
      mouseleave: this.addEndDraggingEvents,
      mouseEnter: this.removeEndDraggingEvent
    };
  },
  
  addDuringDragEvents: function() {
    this.rootController.getContainer().addEvents( this.getDuringDragEvents() );
  },
  
  removeDuringDragEvents: function() {
    this.rootController.getContainer().removeEvents( this.getDuringDragEvents() );
  },
  
  setupDragging: function( e ) {
    // don't setup dragging if this is a right click
    if (e.rightClick) { return null; }
    // retrieve view from node container element
    var selectedNodeEl = e.target.getParent( '.' + this.options.nameContainerClass );
    this.view = selectedNodeEl.retrieve( 'view' );
    this.deactivateOnDragStartEvent( e );
    this.createDraggableGhost( e );
  },

  // IE (all) fires an ondragstart event that we have to deactivate b/c it 
  // puts up a not-allowed icon and shuts down subsequent mouse events.
  // I wanted to call this method setupDraggingForStupidIE, but decided not to.
  // Fix from: 
  // http://groups.google.com/group/mootools-users/browse_thread/thread/dbc2f948fbbf082c
  deactivateOnDragStartEvent: function( e ) {
    if (Browser.Engine.trident) {
      e.target.ondragstart = function() {
        return false;
      };
    };
  },
  
  // called from the draggers onStart
  startDragging: function() {
    this.addDuringDragEvents();
    this.selectNode();
    this.removeIconRolloverEvents();    
    this.getDropZoneActivator().start( this.view );
  },
  
  // Fired from dragger's onDrop
  endDragging: function( e ) {
    this.dropViewOnDropZone( this.view );
  },

  // resets everything back to non drag mode  
  cleanupDragging: function() {
    this.removeDuringDragEvents();
    this.getDropZoneActivator().stop();
    this.destroyDraggableGhost();
    this.unselectNode();
    this.view.resetIcon();
    this.addIconRolloverEvents();
  },
  
  addEndDraggingEvents: function() {
    document.addEvent( 'mouseup', this.endDragging );
  },
  
  //The icon of the selectedNode view element.
  showIconOnEnter: function( e ) {
    var selectedNodeEl = e.target.getParent( '.' + this.options.nameContainerClass );
    this.view = selectedNodeEl.retrieve( 'view' );
    this.view.setDragIcon();
  },
  
  //The icon of the selectedNodeEl view element.
  resetIconOnLeave: function( e ) {
    var selectedNodeEl = e.target.getParent( '.' + this.options.nameContainerClass );
    selectedNodeEl.setStyle( 'cursor', 'default' );
    this.view = selectedNodeEl.retrieve( 'view' );
    this.view.resetIcon();
  },
  
  removeEndDraggingEvent: function() {
    document.removeEvent( 'mouseup', this.endDragging );
  },
  
  selectNode: function() {
    this.view.setSelected();
    this.getSelectedBorder().show( this.view.getContainer() );
  },

  unselectNode: function() {
    this.view.setUnselected();
    this.getSelectedBorder().hide();
  },
  
  getPositionOffset: function() {
    if( !$defined( this.positionOffset ) ) {
      this.positionOffset = this.rootController.getContainer().getPosition();
    }
    return this.positionOffset;
  },
  
  getNameHoverFn: function( selectedView ) {
    if( selectedView.hasChildren() ) {
      this.getSelectedBorder().hide();
      selectedView.expandChildrenAnimated( function() {
        this.getSelectedBorder().show( this.view.getContainer() );
      }.bind( this ) );
    }
  },
  
  validateOptions: function() {
    var options = new Hash( this.options )
    options.each( function( value, key ) {
      if ( value === null ) {
        throw "G.Tree.Node.Drag: Option '" + key + "' can't be null.";
      }
    });
  },
  
  getSelectedBorder: function() {
    if (this.selectedBorder) { return this.selectedBorder; }
    this.selectedBorder = new G.Tree.Node.View.Border({
      offsetY: -2,
      heightAdjustment: -2
    });
    return this.selectedBorder;
  }

} );

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}
if ( typeof G.Tree.Node.View === "undefined" ){ G.Tree.Node.View = {};}

G.Tree.Node.View.ChildrenMethods = new Class({

  hasChildren: function() {
    // Feels funny to have the two way relationship, but it is 1 to 1 so probably OK.
    // Better than tracking hasChildren in controller AND view
    return this.getController().hasChildren();
  },

  insertChildren: function( childElements ) {
    if ( childElements.length > 0 ) {
      this.getChildrenInner().adopt( childElements );
    }
  },

  insertChild: function( element ) {
    element.inject( this.getChildrenInner(), 'bottom' );
  },

  // TOOD: test  
  refreshChildPosition: function( childElement, position ) {
    childElement.dispose();
    var siblingElement = this.getChildrenInner().getChildren()[ position ];
    // Try to inject it in the position given.
    // If there are no siblings, just insert
    if (siblingElement) {
      childElement.inject( siblingElement, 'before' );
    } else {
      this.getChildrenInner().adopt( childElement );
    }
  },

  expandChildren: function() {
    this.fireEvent( 'expand' );
    // we'll need to add a class here and the reverse for show
    // how will this work with effects?
    // maybe we should just add the display none in ruby
    // by default in ruby
    this.getChildrenContainer().show();
    this.setIsExpanded( true );
  },
  
  shrinkChildren: function() {
    this.fireEvent( 'shrink' );
    this.getChildrenContainer().hide();
    this.setIsExpanded( false );
  },
  
  expandChildrenAnimated: function( onCompleteFn ) {
    this.fireEvent( 'expand' );
    this.getAnimationFunction( onCompleteFn ).reveal();
    this.setIsExpanded( true );
  },
  
  shrinkChildrenAnimated: function( onCompleteFn ) {
    this.fireEvent( 'shrink' );
    this.getAnimationFunction( onCompleteFn ).dissolve();
    this.setIsExpanded( false );
  },
  
  //PRIVATE  
  getAnimationFunction: function( onCompleteFn ) {
    if( !$defined( onCompleteFn ) ) {onCompleteFn = $empty;}
    return new Fx.Reveal( 
      this.getChildrenContainer(), 
      {
        duration: 200,
        transitionOpacity: false,
        mode: 'vertical',
        onComplete: onCompleteFn
      }
    );
  }
  
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}

/*
  This class manages the creation of the html for each node in a tree.
*/

G.Tree.Node.ViewBase = new Class( {
  
  Implements: [ 
    Events, 
    Options, 
    G.Tree.Node.View.ChildrenMethods
  ],
  
  options: {
    template: null
    // onSetupElement
    // onExpand
    // onShrink
  },
  
  isExpanded: false,
  classes: new Hash(),
  
  controller: null,
  childDropZone: null,
  siblingDropZone: null,
  
  selectedBorder: null,  // object that creates the selected border
  
  initialize: function( nodeName, controller, options ) {
    this.controller = controller;
    this.setOptions( options );
    this.addBaseClasses();
    this.validateArgs();
    this.setName( nodeName );
    this.setupDropZones();
    return this;
  },
  
  // DROP ZONE FUNCTIONS
  getAllDropZones: function() {
    throw "You must override getAllDropZones";
  },

  getFirstVisibleDropZone: function( e ) {
    throw "You must override getFirstVisibleDropZone";
  },

  getFirstPreviousDropZone: function( e ) {
    throw "You must override getFirstPreviousDropZone";
  },

  // returns the drop zone that should be used when a node is dragged
  // to a name
  getNameDropZone: function(){
    return this.getChildDropZone();
  },

  getDropZoneBasedOnEl: function( el ) {
    throw "You must override getDropZoneBasedOnEl";
  },

  resetIcon: function() {  // override if need be
  },

  setAddIcon: function() {  // override if need be
  },

  deactivateAllDropZones: function() {
    this.getAllDropZones().each( function( dz ) {
      dz.deactivate();
    });
  },

  isChildDropZone: function( el ) {
    return this.getChildDropZone() === this.getDropZoneBasedOnEl( el );
  },  
  
  hasChildDropZoneClass: function( el ) { return el.hasClass( this.getClasses().childDropZone ); },

  // CSS Class Management
  addBaseClasses: function() {
    this.addClasses({
      childDropZone: '_node_child_drop_zone',
      dropZone: 'node_drop_zone',  
      dropZoneActive: 'node_drop_zone_active',
      // openClosIndicator is included in base since both child and root use it,
      // even though root doesn't actually have the element.  It still sets up
      // listeners on it.
      openCloseIndicator: '_node_open_close_indicator',  
      icon: '_node_icon',  
      nameContainer: '_node_name_container',
      selected: 'node_selected',
      nameTextContainer: '_node_name_inner',
      container: 'node_container',
      // IMPORTANT: the currentName class is used in Ruby as well to pre render the tree.
      // If you change it, make sure and do a search and replace
      // to keep everything up to date.
      // We considered storing these in Ruby and passing them into the JS to
      // keep things DRY, but the solution was more complicated then the problem.
      currentName: 'node_name_current',
      opened: 'node_opened'
    });
  },

  addClasses: function( classes ) {
    return this.classes.extend( classes );
  },
  
  getClasses: function() {
    return this.classes;
  },
  
  getClass: function( key ) {
    var value = this.classes[key];
    if (value) {
      return value;
    } else {
      gg('WARNING: the value of class "' + key + '" is not defined.');
      return null;
    }
  },
  
  getSelector: function( key ) {
    return '.' + this.getClass( key );
  },
  
  getParentViewElements: function() {
    return this.getContainer().getParents( this.getSelector( 'container' ) );
  },

  //Highlights the current view as the current one and expands it's children 
  setAsCurrent: function( showHighlight ) {
    this.getNameTextContainer().addClass( this.getClasses().currentName );
    if( this.hasChildren() ) {
      this.expandChildren();
    }
    if ( showHighlight ) {
      this.highlightNode( true, 0 );
    }
  },
  
 highlightNode: function( doFade, fadeDelay ) {
    doFade = !$defined( doFade ) ? false : doFade;
    fadeDelay = !$defined( fadeDelay ) ? 1500 : fadeDelay;
    var highlighter = this.getHighlighter().show( this.getContainer() );
    if( doFade ) {
      this.fadeHighlightNode.delay( fadeDelay, this, [ highlighter ] );
    }
  },
  
  fadeHighlightNode: function( highlighter ) {
    highlighter.fade();
  },
  
  // TODO: consider moving out into an effects module, include getHighlighter()
  //       use Fx.Reveal instead of Tween to keep code simpler
  hideAnimated: function( opts ) {
    this.getContainer().setStyles( { height: this.getShownHeight(), overflow: 'hidden' } );
    opts = $merge( opts, { property: 'height',  duration: 100 } );
    return new Fx.Tween( this.getContainer(), opts ).start( 0 );
  },

  showAnimated: function( opts ) {
    this.getContainer().setStyles( { height: 0, overflow: 'hidden' } );
    opts = $merge( opts, { property: 'height', duration: 100 } );
    opts.onComplete = this.createShowAnimatedOnComplete( opts.onComplete );
    return new Fx.Tween( this.getContainer(), opts ).start( this.getShownHeight() );
  },

  // We have our own onComplete to execute, so we 
  // need to provide for a custom onComplete
  // plus our own.
  createShowAnimatedOnComplete: function( customFn ) {
    var customOnComplete = customFn || $empty;
    return function() {
      this.getContainer().setStyles( {
        height: 'auto',
        overflow: 'visible'
      });
      customOnComplete();      
    }.bind( this );
  },
  
  setShownHeight: function() {
    this.shownHeight = this.getContainer().getSize().y;
  },

  getShownHeight: function() {
    return this.shownHeight;
  },
  
  removeHighlightOnNode: function() {
    var highlighter = this.getHighlighter();
    highlighter.hide();
  },

  //Sets the name (label) for this view.
  setName: function( nodeName ) {
    var attributes = {
      'href': encodeURIComponent( nodeName ).replace( /%20/g, "+" ),
      'text': nodeName
    }
    this.getNameTextContainer().set( attributes );
    this.getIcon().set( attributes );
  },

  //Sets the selection to off for this view when the drag has stopped.
  setUnselected: function() {
    this.getContainer().removeClass( this.getClass( 'selected' ) );
  },

  //Sets the selection to on for this view when dragging has started.
  setSelected: function() {
    this.getContainer().addClass( this.getClass( 'selected' ) );
  },

  //Returns true if this view is currently selected.
  isSelected: function() {
    return this.getContainer().hasClass( this.getClass( 'selected' ) );
  },

  // Returns true if this view or one of it's ancestors is currently selected.
  isAncestorSelected: function() {
    if ( this.isSelected() ) { return true; }
    return !!this.getContainer().getParent( this.getSelector( 'selected' ) );
  },

  //Creates the DOM elements for the currenet view.
  setupElement: function() {
    this.element = this.options.template.clone();
    this.storeViewInElements();
    this.fireEvent( 'setupElement', this.element );
    return this.element;
  },
  
  //It saves its self in elements of the same view for easy retrieval later.
  storeViewInElements: function() {
    this.getElementsToStoreViewOn().each( function( el ) {
      el.store( 'view', this );
    }, this);
  },
  
  getElementsToStoreViewOn: function() {
    return [ this.getContainer(), this.getNameContainer() ].
      extend( this.getAllDropZoneElements() );
  },

  // Objects getters
  getChildDropZone: function() { return this.childDropZone; },
  getController: function() {  return this.controller; },  //Returns the controller for this view.
  getIsExpanded: function() { return this.isExpanded; },
  setIsExpanded: function( expanded ){ this.isExpanded = expanded; },
  
  // Cached element getters
  getChildrenInner: function() {
    return this.getCachedElement( 'childrenInner', '.node_children_inner' );
  },
  
  getChildrenContainer: function() {
    return this.getCachedElement( 'childrenContainer', '.node_children_container' );
  },

  getIcon: function() {
    return this.getCachedElement( 'icon', this.getSelector( 'icon' ) );
  },

  getNameContainer: function() {
    return this.getCachedElement( 'nameContainer', this.getSelector( 'nameContainer' ) );    
  },

  getChildDropZoneElement: function() {
    return this.getCachedElement( 'childDropZoneElement', this.getSelector('childDropZone') );    
  },

  getAllDropZoneElements: function() {
    return [ this.getChildDropZoneElement() ];
  },

  getNameTextContainer: function() {
    return this.getCachedElement( 'nameTextContainer', this.getSelector( 'nameTextContainer' ) );
  },

  //Returns the containing element for this view.  Builds it if necessary.
  getContainer: function() {
    return this.element ? this.element : this.setupElement();
  },
  
  // PRIVATE
  
  getHighlighter: function() {
    if( !$defined( this.highlighter ) ) {
      this.highlighter = new G.Tree.Node.View.Highlighter();
    }
    return this.highlighter;
  },
  
  setupDropZones: function() {
    this.childDropZone = new G.Tree.Node.View.DropZone( this.getChildDropZoneElement(), {
      activeClass: this.getClasses().dropZoneActive
    });
  },

  // Element getter helper methods
  getCachedElement: function( varName, selector ) {
    if ( this[ varName ] ) { return this[ varName ]; }
    this[ varName ] = this.getContainer().getElement( selector );
    return this[ varName ];
  },
  
  validateArgs: function() {
    if ( !$defined( this.options.template ) ) { 
      var m = "The 'template' option must be set with an element that contains ";
      m = m + "the elements for the view.  ";
      throw m;
    }
  }
  
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}

G.Tree.Node.ViewRoot = new Class( {
  
  Extends: G.Tree.Node.ViewBase,
  initialize: function( name, controller, options ) {
//    this.addClasses({ viewTemplate: 'node_root_elements' });  moved higher to avoid multiple lookups
    this.parent( name, controller, options );
    this.addOpenCloseIndicatorEvent();
    //We don't want the root to have an overflow of hidden otherwise the ghost 
    //gets hidden underneath.  TODO: explore any better ways to do this.
    this.getContainer().addClass( 'node_container_root' );
  },

  // Handles opening and closing nodes.  One listener for the whole tree.
  addOpenCloseIndicatorEvent: function() {
    var openCloseIndicator = this.getClass( 'openCloseIndicator' );
    this.getContainer().addEvent( 'click:relay( .' + openCloseIndicator + ' )', function( e ) {
      this.expandOrShrink( e );
    }.bind( this ) );
  },
  
  expandOrShrink: function( e ) {
    var view = e.target.retrieve( 'view' );
    if ( view.getIsExpanded() ) {
      view.shrinkChildrenAnimated();
    } else {
      this.expandIfViewHasChildren( view );
    }
    this.fireEvent( 'onExpandShrink', [ this ] );
  },
  
  expandIfViewHasChildren: function( view ) {
    if ( view.getController().hasChildren() ) {
      view.expandChildrenAnimated();
    }
  },

  // DROP ZONE FUNCTIONS
    
  // Empty since root node doesn't need this
  getFirstPreviousDropZone: function( e ) {
    return null;
  },

  getFirstVisibleDropZone: function() {
    return this.childDropZone;
  },

  getDropZoneBasedOnEl: function() {
    return this.childDropZone;
  },
  
  getAllDropZones: function() {
    return [ this.getChildDropZone() ];
  }
  
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}

G.Tree.Node.ViewChild = new Class( {
  
  Extends: G.Tree.Node.ViewBase,
  
  initialize: function( name, controller, options ) {
    this.addChildClasses();
    this.parent( name, controller, options );
    this.setOpenCloseIndicator( this.hasChildren(), false );
    this.addViewEvents();
  },

  addChildClasses: function() {
    this.addClasses({
      siblingDropZone: 'node_sibling_drop_zone', 
      nameVerticalDropZoneActive: 'node_name_vertical_drop_zone_active',
      verticalDropZoneActive: 'node_vertical_drop_zone_active',      
      iconDrag: 'node_icon_drag',  
      iconAdd: 'node_icon_add',
      // IMPORTANT: these classes are used in Ruby as well to pre render the tree.
      // If you change them, make sure and do a search and replace
      // to keep everything up to date.
      // We considered storing these in Ruby and passing them into the JS to
      // keep things DRY, but the solution was more worse then the problem.
      childrenExpanded: 'node_opened',
      childrenShrunk: 'node_closed'
    });
  },

  // NOTE: not sure if this is weird or not, but this object is listening to events
  //       on itself.  Makes it so ViewChild can tie into events without
  //       having to override the method.  Perhaps it would be more straightforward
  //       just to override and call this.parent. - SW
  addViewEvents: function() {
    this.addEvent( 'expand', function( el ) {
      this.setOpenCloseIndicator( true, true );
    }.bind(this) );
    this.addEvent( 'shrink', function( el ) {
      this.setOpenCloseIndicator( this.hasChildren(), false );
    }.bind(this) );
  },

  // DROP ZONES FUNCTIONS

  getAllDropZones: function() {
    return [ this.getChildDropZone(), this.getSiblingDropZone() ];
  },
  
  // When we are dragging a node over the name of another node,
  // which drop zone do we want to activate?
  getNameDropZone: function( draggedView ) {
    if ( this.isAncestorSelected() ) { return null; }
    var children = this.getController().getChildControllers();
    if ( children.length > 0 ) {
      var lastChildController = children.getLast();
      if ( lastChildController === draggedView.getController() ) {
        // this node IS the last one, so we use the second to last
        // controller
        lastChildController = children[ children.length - 2 ];
        if ( !$defined( lastChildController ) ) {
          // If it's the only child, lastChildController will be null
          return this.getChildDropZone();
        }
      }
      return lastChildController.getView().getSiblingDropZone();
    } else {
      return this.getChildDropZone();
    }
  },
  
  // We need to add the openCloseIndicator to the list
  getElementsToStoreViewOn: function() {
    var elements = this.parent();
    elements.push( this.getOpenCloseIndicator() );
    return elements;
  },

  getFirstVisibleDropZone: function() {
    if ( this.isAncestorSelected() ) { return null; }
    if ( this.getIsExpanded() ) {
      return this.childDropZone;
    } else {
      return this.siblingDropZone;
    }
  },

  // Get's the previous view's drop zone
  // Previous view could be a sibling or a parent
  // If it's a sibling, we want the sibling drop zone
  // If it's a parent, then we want to return the child dropzone
  // since that will show visually as the first drop zone
  // previous to this node
  getFirstPreviousDropZone: function() {
    var dropZone;
    var previousView = this.getPreviousSiblingView();
    if ( previousView ) {
      dropZone = previousView.getSiblingDropZone();
    } else {
      previousView = this.getParentView();
      dropZone = previousView.getChildDropZone();
    }
    // we don't want to return the dz if it is selected since
    // it's not really an available drop zone in that case
    return previousView.isAncestorSelected() ? null : dropZone;
   },
   
  getDropZoneBasedOnEl: function( el ) {
    if ( this.isAncestorSelected() ) { return null; }
    if ( this.hasChildDropZoneClass( el ) ) {
      return this.childDropZone;
    } else {
      return this.siblingDropZone;
    }
  },
  
  //Sets the expand shrink icon for the view.
  setOpenCloseIndicator: function( hasChildren, isOpen ) {
    var childrenExpanded =  this.getClass( 'childrenExpanded' );
    var childrenShrunk = this.getClass( 'childrenShrunk' );
    if ( hasChildren && isOpen ) {
      this.handleOpenCloseIndicator( childrenExpanded, childrenShrunk );
    } else if ( hasChildren && !isOpen ) {
      this.handleOpenCloseIndicator( childrenShrunk, childrenExpanded );
    } else {
      this.getOpenCloseIndicator().removeClass( childrenShrunk ).
        removeClass( childrenExpanded );
    }
  },
  
  handleOpenCloseIndicator: function( add, remove ) {
    this.getOpenCloseIndicator().addClass( add ).removeClass( remove );
  },

  //Resets this views icon to the default one.
  resetIcon: function() {
    this.getIcon().
      removeClass( this.getClass( 'iconAdd' ) ).
      removeClass( this.getClass( 'iconDrag' ) );
//      removeClass( this.getClass( 'iconLevelTooDeep' ) );
    return this;      
  },
  
  //Sets this views icon to indicate that you are adding children to this view.
  setAddIcon: function() {
    this.resetIcon();
    this.getIcon().addClass( this.getClass( 'iconAdd' ) );
    return this;
  },

  //Sets this view's icon to indicate dragging.
  setDragIcon: function() {
    this.resetIcon();
    this.getIcon().addClass( this.getClass( 'iconDrag' ) );
    return this;      
  },

  // Returns the sibling view that is before this one.  
  // Returns the parent view if there are no previous sibling.
  // Returns null if there is no previous sibling or parent.
  getPreviousView: function() {
    var previousSiblingView = this.getPreviousSiblingView();
    return previousSiblingView ? previousSiblingView : this.getParentView();
  },
  
  //Returns the previous siblings view.  Returns null if there is no previous sibling.
  getPreviousSiblingView: function() {
    var previousSibling = this.getContainer().getPrevious();
    return previousSibling ? previousSibling.retrieve( 'view' ) : null;
  },
  
  //Asks the parent of the current view for its view.
  getParentView: function() {
    var parentEl = this.getContainer().getParent( this.getSelector( 'container' ) );
    return parentEl ? parentEl.retrieve( 'view' ) : null;
  },
  
  getSiblingDropZone: function() {
    return this.siblingDropZone;
  },
  
  getSiblingDropZoneElement: function() {
    return this.getCachedElement( 'siblingDropZoneElement', this.getSelector( 'siblingDropZone' ) );
  },
  
  getOpenCloseIndicator: function() {
    return this.getCachedElement( 'openCloseIndicator', this.getSelector( 'openCloseIndicator' ) );
  },

  getAllDropZoneElements: function() {
    return [ this.getChildDropZoneElement(), this.getSiblingDropZoneElement() ];    
  },
  
  // PRIVATE
  
  setupDropZones: function() {
    this.parent();
    this.siblingDropZone = new G.Tree.Node.View.DropZone( this.getSiblingDropZoneElement(), {
      activeClass: this.getClasses().dropZoneActive,
      onActivate: function() {
        // we only want to alter the look of the drop zone if the element
        // is visible.
        // Otherwise, the element could be invisible, but the vertical cue
        // line would still show, which doesn't make sense.
        if ( this.getSiblingDropZoneElement().getStyle('visibility') !== 'hidden' ) {
          this.getChildrenContainer().addClass(this.getClass('verticalDropZoneActive'));
          this.getNameContainer().addClass(this.getClass('nameVerticalDropZoneActive'));
        }
      }.bind( this ),
      onDeactivate: function() {
        this.getChildrenContainer().removeClass( this.getClass( 'verticalDropZoneActive' ) );
        this.getNameContainer().removeClass( this.getClass( 'nameVerticalDropZoneActive' ) );
      }.bind( this )
    });
  }

});

/*
  G.Tree.Node.View.Highlighter handles the showing, hiding and fading of the highlighting of a node. 
*/

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}
if ( typeof G.Tree.Node.View === "undefined" ){ G.Tree.Node.View = {};}

G.Tree.Node.View.Highlighter = new Class( {

  Implements: [ Options ],
  
  Binds: [ 'hide' ],
  
  options: {
    className: 'node_highlight'
  },
  
  initialize: function( options ) {
    this.setOptions( options );
  },
  
  //Shows the highlight object relative to an element (A node.)
  show: function( el ) {
    this.el = $( el );
    this.highlighter = this.buildHighlightElement();
    this.positionHighlighter();
    return this;
  },
  
  //Remove the highlighting
  hide: function() {
    this.highlighter.destroy();
    return this;
  },
  
  //Removes the highlighting but does it with a fadeout first.
  fade: function() {
    this.highlighter.morph( { 'opacity': 0 } );
    return this;
  },
  
  //Private
  
  //Builds the div that will act as the highlighter.
  buildHighlightElement: function() {
    var elSize = this.el.getSize();
    var width = elSize.x;
    var height = elSize.y;

    var inner = new Element( 'div', {
      'class': this.options.className,
      'styles': {
        'border-width': '1px',
        'height': height - 2  // minus the amount total border width
      }
    });
    var outer = new Element( 'div', {
      styles: {
        'position': 'absolute',
        'width': width,
        'height': height,
        'z-index': 1
      }
    } ).set('morph', {  
      duration: 1000, 
      onComplete: this.hide
    });
    return outer.adopt( inner );
  },
  
  //Positions the highlighter relative to the node that was passed to it.
  positionHighlighter: function() {
    $( this.el.getParent() ).adopt( this.highlighter );
    this.highlighter.position({
      relativeTo: this.el,
      offset: { y: -2 }
    });
  }
  
} );

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}
if ( typeof G.Tree.Node.View === "undefined" ){ G.Tree.Node.View = {};}

G.Tree.Node.View.DropZone = new Class({

  Implements: [ Options, Events ],
  
  options: {
    activeClass: null
    //onActivate: $empty
    //onDeactivate: $empty
  },

  element: null,
  
  initialize: function( el, options ) {
    this.setOptions( options );
    this.element = $( el );
  },
  
  activate: function() {
    this.element.addClass( this.options.activeClass );
    this.fireEvent( 'activate' );
  },  
    
  deactivate: function() {
    this.element.removeClass( this.options.activeClass );
    this.fireEvent( 'deactivate' );
  },
  
  isActive: function() {
    return this.element.hasClass( this.options.activeClass );
  },
  
  getContainer: function() {
    return this.element;
  }
      
});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}
if ( typeof G.Tree.Node.View === "undefined" ){ G.Tree.Node.View = {};}

//  This class provides a dotted border around an element without interfering with the positioning of the
//  element. It abosoulely positions a div on top.
G.Tree.Node.View.Border = new Class({
  
  Implements: [ Options ],
  
  options: {
    offsetY: 0,
    heightAdjustment: 0
  },
  
  initialize: function( options ) {
    this.setOptions( options );
  },
  
  borderWidth: 1,
  container: null,
  
  show: function( el ) {
    el = $( el );
    var offsetParent = el.getOffsetParent();
    var coords = el.getCoordinates( offsetParent );
    this.container = new Element( 'div', {
      styles: {
        height: this.height( coords ) + 'px',
        width: coords.width - 2 + 'px',  // minus two for the border
        top: this.top( coords ) + 'px',
        left: coords.left + 'px',
        position: 'absolute',
        border: '1px dashed #ccc'
      }
    });
// Originally, an inner div was included that actually had the border.
// The css below worked for all browswers except for IE6 wasn't respecting bottom and right.
// See: http://www.alistapart.com/articles/conflictingabsolutepositions/
// Eventually, I (Scott) decided to just put the border on the outer div even though
// it has a width and height.  It works OK in this case, because there are no other elements involved
// other than the element we are wrapping.  Tests work fine on all browsers.
// We may want to keep the below for reference just in case we need to go back.
//    var inner = new Element( 'div', {
//      // Tried 100% height with border for inner div, but the result is the wrong height ( larger )
//      // This solution from: http://stackoverflow.com/questions/485827/css-100-height-with-padding-margin
//      styles: {
//        border: '1px dashed #ccc',
//        display: 'block',
//        position: 'absolute',
//        height: 'auto',
//        bottom: 0,
//        top: 0, 
//        left: 0,
//        right: 0
//      }
//    });
//    this.container.adopt( inner );
    this.container.inject( offsetParent );
  },
  
  hide: function() {
    if ( this.container ) { this.container.destroy(); }
  },
  
  getContainer: function() {
    return this.container;
  },
  
  // PRIVATE
  
  height: function( coords ) {
    return coords.height + this.options.heightAdjustment;
  },
  
  top: function( coords ) {
    return coords.top + this.options.offsetY;
  }

});

if ( typeof G.Tree === "undefined" ){ G.Tree = {};}
if ( typeof G.Tree.Node === "undefined" ){ G.Tree.Node = {};}

G.Tree.Node.Controller = new Class( {
  
  Implements: [ Events, Options, Chain ],
  
  options: {
    data: null,
    isRoot: false,
    maxLevel: 10,
    startExpanded: false,
    expandedChildren: [],
    // templates have defaults so that we can easily instantiate
    // just the controller (esp. when testing)
    // normally they will be passed in so we don't have to worry
    // about the performance hit of looking these up in the dom for
    // every node
    viewRootTemplate: $$( '.node_root_elements' )[0].getChildren()[0],
    viewChildTemplate: $$( '.node_child_elements' )[0].getChildren()[0]
  },
  
  childrenList: [],
  childrenInserted: false,
  level: 1,  // default is 1
  deepestChildLevel: 0,  // default is 0
  
  initialize: function( options ) {
    this.setOptions( options );
    this.validateOptions();
    this.name = this.options.data[ 0 ];
    this.childrenData = this.options.data[ 1 ];
    this.expandIfNeeded();
  },
  
  expandIfNeeded: function() {
    if ( this.options.startExpanded || this.options.expandedChildren.contains( this.name ) ) { 
      this.expandChildren(); 
    }
  },

  //Returns the name (label) for this current controller.
  getName: function() {
    return this.name;
  },
  
  //Returns the current controllers data ( An array of arrays ) for its self and its children.
  getData: function() {
    return [ this.name, this.getChildrenData() ];
  },
  
  //Returns the views element for this controller.
  getContainer: function() {
    var element = this.getView().getContainer();
    return element;
  },
  
  //Returns the view for this controller.
  getView: function() {
    if ( this.view ) { return this.view; }
    var ViewClass;
    var template;
    if ( this.options.isRoot ) {
      ViewClass = G.Tree.Node.ViewRoot;
      template = this.options.viewRootTemplate;
    } else {
      ViewClass = G.Tree.Node.ViewChild;
      template = this.options.viewChildTemplate;
    }
    this.view = new ViewClass( this.name, this, {
      template: template,
      onExpand: function() {
        this.insertChildrenOnExpand();
      }.bind( this )
    });
    return this.view;
  },
  
  //Tells the view to expand the top level children for this current controller.
  //This is important because it will actually create and place the view elements 
  //into the dom.
  expandChildren: function() {
    if ( this.hasChildren() ) {
      this.insertChildrenOnExpand();
      this.insertChildrensChildren();
      this.getView().expandChildren();
    }
  },
  
  insertChildrenOnExpand: function() {
    if ( !this.childrenInserted ) {
      this.getView().insertChildren(
        this.getChildControllers().map( function( childController ) {
          return childController.getContainer();
        })
      );
      this.childrenInserted = true;
    }
  },

  // When we expand, we need to insert the children's childen.
  // Drag and drop uses a css class to determine which drop zone to 
  // send the node to.  When we drag a node on top of a closed node
  // which has children, we actually activate the drop zone of the 
  // last child of that node since we want to drop the node at the end of the
  // list (see G.Tree.Node.ViewChild.js#getNameDropZone).  However, if these
  // nodes aren't in the dom yet, we won't be able to lookup the activated
  // drop zone.  Therefore, when we #expandChildren we need to inject the 
  // children's children.  -sw
  insertChildrensChildren: function() {
    this.getChildControllers().each( function( child ) {
      child.insertChildrenOnExpand();
    });
  },
  
  getExpandedController: function( indexes ) {
    this.expandChildren();
    return this.getControllerByIndexes( indexes );
  },
  
  expandToNode: function( indexes, showHighlight ) {
    var controller = this.getExpandedController( indexes );
    controller.getView().setAsCurrent( showHighlight );
    this.fireEvent( 'onSetCurrent', [ this ] );
    return controller;
  },
  
  expandToNodeUnselected: function( indexes ) {
    var controller = this.getExpandedController( indexes );
    return controller;
  },
 
  getControllerByIndexes: function( indexList ) {
    if ( indexList.length > 0 ) {
      var currentIndex = indexList.shift();
      var child = this.getChildControllers()[ currentIndex ];
      child.expandChildren();
      return child.getControllerByIndexes( indexList );
    } else {
      return this;
    }
  },
  
  //TODO-SD revisit this.  It may not be the best way to get the opened nodes
  //Returns an array of of all the nodes that are opened.
  getOpenNodes: function() {
    var openedNodes = this.getContainer().getElements( '.' + this.getView().getClasses().opened );
    var listOfNodes = openedNodes.map( function( item, index ) {
      var itemContainer = item.getParent( '.' + this.getView().getClasses().nameContainer );
      var view = itemContainer.retrieve('view');
      return view.getController().getName();
    }, this );
    return listOfNodes.clean();
  },
  
  highlightNodeAndFade: function( delayLength ) {
    this.getView().highlightNode( true, delayLength );
    return this;
  },
  
  highlightNode: function() {
    this.getView().highlightNode();
    return this;
  },
  
  refreshChildElementPosition: function( childController ) {
    var position = this.getChildControllers().indexOf( childController );
    this.getView().refreshChildPosition( childController.getContainer(), position );
  },
  
  removeHighlightOnNode: function() {
    this.getView().removeHighlightOnNode();
    return this;
  },

  // Adds the controller and injects the element
  addNode: function( controller ) {
    this.addChildController( controller, 0 );
    this.getView().insertChild( controller.getContainer() );
  },

  //Adds a child controller to the current controller at a specified position.
  addChildController: function( childController, position ) {
    var childControllers = this.getChildControllers();
    childControllers.splice( position, 0, childController );
    this.expandChildren();  // no animated expand, the added child will do it's own animation
  },

  //Removes a child controller from the current controller.
  removeChildController: function( childController ) {
    var childControllers = this.getChildControllers();
    var position = childControllers.indexOf( childController );
    childControllers.splice( position, 1 );
    // This can't be #shrinkChildrenAnimated.  Since we call #expandChildren in #addChildController
    // we have to call #shrinkChildren here.  Otherwise, if the user drags an only child node
    // to it's parent's child drop zone ( so there is no move really ) and we call the animated 
    // shrink, it will complete AFTER the exandChildren and it will end up being closed instead of open.
    if ( !this.hasChildren() ) { this.getView().shrinkChildren(); }  
  },
  
  // Returns true if the children have been converted to controllers from data.
  childrenConverted: function() {
    return !!this.childControllers;
  },

  isCurrent: function() {
    return this.getView().getNameTextContainer().hasClass( this.getView().getClasses().currentName );
  },
  
  canAddAndBeWithinMaxLevel: function( moveController ) {
    var totalResultingLevels = this.getLevel() + moveController.getLevelCountWithChildren();
    if ( !this.getView().getChildDropZone().isActive() ) {
      // If we are not moving controller to be a child, then it must be a
      // sibling.  In this case the resulting depth should be calculated from
      // the parent of this node.  We simply minus one from the depth to
      // account for that.
      totalResultingLevels = totalResultingLevels - 1;
    }
    return totalResultingLevels <= this.options.maxLevel;
  },
  
  getLevel: function() {
    return this.getView().getParentViewElements().length + 1;
  },
  
  //PRIVATE

  //Returns the children as data (array of arrays) from the current controller.
  getChildrenData: function() {
    if ( this.childrenConverted() ) {
      return this.getChildControllers().map( function( childController ) {
        return childController.getData();
      });
    } else {
      return this.options.data[ 1 ];
    }
  },
  
  //Returns the current controllers children as an array of controllers.
  // Originally the child controllers were lazy-created.  I am pretty
  // sure that we create them all now right away and just lazy load
  // the views.  We may want to simplify the code by not lazy loading
  // the controllers anymore.
  getChildControllers: function() {
    if ( this.childControllers ){
      return this.childControllers;
    } else {
      this.childControllers = this.createChildControllersFromData();
      return this.childControllers;
    }
  },
  
  getChildControllerByIndex: function( index ) {
    return this.getChildControllers()[ index ];
  },
  //Makes controllers from data for the children of the current controller. 
  createChildControllersFromData: function() {
    return this.childrenData.map( function( childData ) { 
      return new G.Tree.Node.Controller({
        data: childData, 
        maxLevel: this.options.maxLevel,
        startExpanded: this.options.startExpanded,
        expandedChildren: this.options.expandedChildren,
        viewRootTemplate: this.options.viewRootTemplate,
        viewChildTemplate: this.options.viewChildTemplate
      });
    }, this);
  },
  
  // TODO: test
  childrenCount: function() {
    if ( this.childrenConverted() ) {
      return this.getChildControllers().length;
    } else {
      return this.childrenData.length;
    }
  },

  getLevelCountWithChildren: function() {
    // plus one to account for self
    return this.getDeepestChildLevel() + 1;
  },

  getDeepestChildLevel: function( children ) {
    if ( !$defined( children ) ) { children = this.getData()[1]; }
    var childrenLength = children.length;    
    var deepestChildLevel = 0;
    for (var i = 0; i < childrenLength; i = i + 1) {
      var node = children[i];
      var currentDeepestChildLevel = this.getDeepestChildLevel( node[1] ) + 1;
      if (currentDeepestChildLevel > deepestChildLevel) {
        deepestChildLevel = currentDeepestChildLevel;
      }
    }
    return deepestChildLevel;
  },
  
  hasChildren: function() {
    return this.childrenCount() > 0;
  },
  
  validateOptions: function() {
    if( $type( this.options.data ) !== 'array' ) {
      throw "BadDataError: options.data must be an array";
    } else if( this.options.data.length !== 2 ) {
      throw "BadDataError: options.data must contain exactly 2 items, a name and an array of children.";
    } else if( $type( this.options.data[0] ) !== 'string' ) {
      throw "BadDataError: options.data[ 0 ] must me a string.";
    } else if( $type( this.options.data[ 1 ] ) !== 'array' ) {
      throw "BadDataError: options.data[ 1 ] must be an array";
    }
  }
  
});
