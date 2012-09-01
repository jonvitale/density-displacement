(function (window)
{

	// DEAL WITH INHERETENCE
	Object.prototype.Inherits = function( parent )
	{
		if( arguments.length > 1 )
		{
			parent.apply( this, Array.prototype.slice.call( arguments, 1 ) );
		}
		else
		{
			parent.call( this );
		}
	}

	Function.prototype.Inherits = function( parent )
	{
		this.prototype = new parent();
		this.prototype.constructor = this;
	}

	function StageManager (stage)
	{
		stage.mouseEventsEnabled = true;
		stage.enableMouseOver();
		this.stage = stage;
		this.stage.needs_to_update = true;

		this.materialNameDisplayMapping = {"DWood":"Wood A", "LWood":"Wood B", "Metal":"Metal", "Plastic":"Plastic"}
		// setup builder
		this.builder = new ObjectBuilder(STAGE_WIDTH, 200, this.materialNameDisplayMapping);
		this.stage.addChild(this.builder);

		this.b2objects = new Array();
	}

	var p = StageManager.prototype

	/** Tick function called on every step, if update, redraw */
	p.tick = function ()
	{
		if (this.stage.needs_to_update)
		{
			this.stage.update();
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

	

	/// MOST LIKELY GET RID OF THIS SHIT
	/** When an object is pressed for dragging, it may need to be released from its container */
	/*
	p.releaseObjectFromContainer = function (o)
	{
		if (this.vv.releaseObject(o)){}
		else if (this.bv.releaseObject(o)){}	
		else if (this.kv.releaseObject(o)){}	
	}
	*/
	/** When an object is released from dragging, check it's location and perform operations */
	/*
	p.placeObjectInContainer = function (o)
	{
		// is the object over the volume viewer?
		if (this.vv.placeObject(o)){}
		else if (this.bv.placeObject(o)){}
		else if (this.kv.placeObject(o)){}
	}
	*/
	window.StageManager = StageManager;
}(window));
