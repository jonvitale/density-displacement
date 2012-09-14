(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	and a grid space for putting them together */
	function ObjectTestingPanel (width_px, height_px, max_shape_width_px, max_shape_height_px, height_from_depth)
	{
		this.initialize(width_px, height_px, max_shape_width_px, max_shape_height_px, height_from_depth);
	}
	var p = ObjectTestingPanel.prototype = new Container();
	p.Container_initialize = ObjectTestingPanel.prototype.initialize;
	p.Container_tick = p._tick;
	p.SCALE = 30;
	// constants
	p.MATERIAL_TYPES = ["full", "center3", "center1", "ends"];

	p.initialize = function(width_px, height_px, max_shape_width_px, max_shape_height_px, height_from_depth)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.max_shape_width_px = max_shape_width_px;
		this.max_shape_height_px = max_shape_height_px;
		this.height_from_depth = height_from_depth;

		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);

		// the list of material names
		//library
		this.library = new ObjectLibrary(this.max_shape_width_px, this.max_shape_height_px*5+40, this.max_shape_height_px, height_from_depth);
		this.addChild(this.library);
		this.library.x = 0;
		this.library.y = 0;
		//world
		this.world = new Emptyb2World(300,300, 200, 0, 30);
		this.addChild(this.world);
		this.world.x = 200;
		this.world.y = 0;

		this.g.beginFill("rgba(255,255,255,1.0)");
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		this.actors = new Array();

		stage.ready_to_update = true;
	}

	p._tick = function()
	{
		this.Container_tick();

	}

	p.redraw = function()
	{
		stage.ready_to_update = true;
			
	}

	
	////////////////////// CLASS SPECIFIC ////////////////////
	p.addObjectToLibrary = function (compShape)
	{
		var actor = new b2Actor(compShape, this.SCALE);
		this.library.addObject(actor);
		actor.onPress = this.actorPressHandler.bind(this);
		actor.orig_parent = this.library;
		this.actors.push(actor);
	}	

	
	/** */
	p.actorPressHandler = function (evt)
	{
		var gp = evt.target.parent.localToGlobal(evt.target.x, evt.target.y);
		var offset = {x:gp.x-evt.stageX, y:gp.y-evt.stageY}
		// remove object from wherever it is and place it on this object
		if (evt.target.parent instanceof ObjectLibrary)
		{
			evt.target.parent.removeObject(evt.target);
		} else if (evt.target.parent instanceof Emptyb2World)
		{
			evt.target.removeFromWorld(evt.target.parent);
		}
		var lp = this.globalToLocal(gp.x, gp.y);
		this.addChild(evt.target);
		evt.target.x = lp.x;
		evt.target.y = lp.y;
		evt.target.rotation = 0;
		evt.onMouseMove = function (ev)
		{
			var parent = this.target.parent;
			var lpoint = parent.globalToLocal(ev.stageX+offset.x, ev.stageY+offset.y);
			var newX = lpoint.x;
			var newY = lpoint.y;
				
			// place within bounds of this object
			if (parent instanceof ObjectTestingPanel)
			{
				if (newX < 0)
				{
					this.target.x = 0;
				} else if (newX > parent.width_px)
				{
					this.target.x = ob.width_px;
				} else
				{
					this.target.x = newX;
				}
				if (newY < 0)
				{
					this.target.y = 0;
				} else if (newY > parent.height_py)
				{
					this.target.y = parent.height_py;
				} else
				{
					this.target.y = newY;
				} 

				//parent.vv.placeBlock(this.target);
			} 
			stage.needs_to_update = true;
		}
		evt.onMouseUp = function (ev)
		{
			var parent = this.target.parent;
			var wpoint = parent.world.globalToLocal(ev.stageX+offset.x, ev.stageY+offset.y);
			if (parent.world.hitTest(wpoint.x, wpoint.y))
			{
				this.target.addToWorld(parent.world, wpoint.x, wpoint.y);
			} else
			{
				parent.library.addObject(this.target);
			}
			stage.needs_to_update = true;			
		}
	}

	
	window.ObjectTestingPanel = ObjectTestingPanel;
}(window));