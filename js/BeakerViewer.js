(function (window)
{
	/** Provides a space for the beaker */
	function BeakerViewer (width_unit, height_unit, beaker_volume_unit, num_beakers)
	{
		this.width_unit = width_unit;
		this.height_unit = height_unit;
		this.beaker_volume_unit = beaker_volume_unit;
		this.width_px = width_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.num_beakers = (typeof num_beakers === "undefined") ? 2 : num_beakers;
		
		this.initialize();
	}
	var p = BeakerViewer.prototype = new Container();
	p.Container_initialize = BeakerViewer.prototype.initialize;
	p.Container_tick = p._tick;

	p.initialize = function()
	{
		this.Container_initialize();
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);
		this.beakers = new Array();
		var beaker;
		for (var i=0; i < this.num_beakers; i++)
		{
			beaker = new BeakerModel(this.beaker_volume_unit, this.height_unit*2/3, 0.6);
			beaker.x = this.width_px * (2*i+1)/(this.num_beakers*2);
			beaker.y = this.height_px - beaker.height_px;
			this.beakers.push(beaker);
			this.addChild(beaker);	
		}
		this.redraw();
	}
	p.isRunning = function ()
	{
		var running = false;
		// cycle through each beaker and release
		for (var i=0; i < this.num_beakers; i++)
		{
			running = running || this.beakers[i].isRunning();
		}
		return running;
	}

	p._tick = function ()
	{
		this.Container_tick();
		// cycle through each beaker and tick
		for (var i=0; i < this.num_beakers; i++)
		{
			this.beakers[i]._tick();
		}
	}
	p.redraw = function()
	{
		// draw background
		this.g.setStrokeStyle(0.5);
		this.g.beginStroke("000000");
		this.g.beginFill("#ffffee")
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();
	}
	p.start = function()
	{
		// cycle through each beaker and start
		for (var i=0; i < this.num_beakers; i++)
		{
			this.beakers[i].start();
		}
	}
	p.reset = function()
	{
		// cycle through each beaker and reset
		for (var i=0; i < this.num_beakers; i++)
		{
			this.beakers[i].reset();
		}
	}
	p.releaseObject = function (o)
	{
		var released = false;
		// cycle through each beaker and release
		for (var i=0; i < this.num_beakers; i++)
		{
			released = released || this.beakers[i].releaseObject(o);
		}
		return released;
	}
	p.placeObject = function(o)
	{
		var placed = false;
		// cycle through each beaker and place
		for (var i=0; i < this.num_beakers; i++)
		{
			placed = placed || this.beakers[i].placeObject(o);
		}
		return placed;
	}

	window.BeakerViewer = BeakerViewer;
}(window));