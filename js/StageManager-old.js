(function (window)
{
	function StageManager (canvas)
	{
		this.canvas = canvas;
		this.stage = new Stage(canvas);
		this.update = true;
		this.vv = new VolumeViewer(10, 10);
		this.stage.addChild(this.vv);
		this.bv = new BalanceViewer (30, 16, 10);
		this.bv.x = this.vv.width_px + PADDING;
		this.bv.y = this.vv.y;
		this.stage.addChild(this.bv);
		this.kv = new BeakerViewer (30, 16, 500);
		this.kv.x = this.vv.width_px + PADDING;
		this.kv.y = this.bv.y + this.bv.height_px + PADDING;
		this.stage.addChild(this.kv);
	

		this.b2objects = new Array();
	}

	var p = StageManager.prototype

	/** Tick function called on every step, if update, redraw */
	p.tick = function ()
	{
		if (update)
		{
			this.bv._tick();
			this.stage.update();
			if (this.bv.isRunning() || this.kv.isRunning()) 
			{
				this.update = true;
			} else
			{
				this.update = false;
			}
		}
	}
	p.addToStage = function(o)
	{
		this.stage.addChild(o);
	}
	p.removeFromStage = function(o)
	{
		this.stage.removeChild(o);
	}

	// INTERACTION WITH HTML ELEMENTS CALL THESE FUNCTIONS
	p.vvNewObject = function ()
	{
		if (this.vv.currentObject == null)
		{
			var o = new Cylinder(6, 3, 0.5, "top");
			o.x = this.vv.width_px/2;
			o.y = this.vv.height_px/2;
			this.b2objects.push(o);
			this.stage.addChild(o);
			o.setBounds(new Rectangle(0, 0, STAGE_WIDTH, STAGE_HEIGHT));
			placeObjectInContainer(o);
			this.stage.update();
			return o;
		}
	}
	// temporary
	p.vvNewRectPrism = function ()
	{
		if (this.vv.currentObject == null)
		{
			var o = new RectPrism(4, 4, 6, 2, "top");
			o.x = this.vv.width_px/2;
			o.y = this.vv.height_px/2;
			this.b2objects.push(o);
			this.stage.addChild(o);
			o.setBounds(new Rectangle(0, 0, STAGE_WIDTH, STAGE_HEIGHT));
			this.placeObjectInContainer(o);
			this.stage.update();
			return o;
		}
	}

	p.vvSwitchView = function ()
	{
		if (this.vv.currentObject != null)
		{
			this.vv.currentObject.switchView();
		}
	}

	// BUTTON INTERACTION WITH BALANCE
	p.bvStart = function ()
	{
		this.bv.start();
	}
	p.bvReset = function ()
	{
		this.bv.reset();
	}

	// BUTTON INTERACTION WITH BEAKER
	p.kvStart = function ()
	{
		this.kv.start();
	}
	p.kvReset = function ()
	{
		this.kv.reset();
	}



	/// MOST LIKELY GET RID OF THIS SHIT
	/** When an object is pressed for dragging, it may need to be released from its container */
	p.releaseObjectFromContainer = function (o)
	{
		if (this.vv.releaseObject(o)){}
		else if (this.bv.releaseObject(o)){}	
		else if (this.kv.releaseObject(o)){}	
	}

	/** When an object is released from dragging, check it's location and perform operations */
	p.placeObjectInContainer = function (o)
	{
		// is the object over the volume viewer?
		if (this.vv.placeObject(o)){}
		else if (this.bv.placeObject(o)){}
		else if (this.kv.placeObject(o)){}
	}

	window.StageManager = StageManager;
}(window));
