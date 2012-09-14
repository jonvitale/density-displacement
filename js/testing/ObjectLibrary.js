(function (window)
{
	/** Creates a menu with the names of the materials */
	function ObjectLibrary (width_px, height_px, shape_height_px, shape_dy)
	{
		this.initialize(width_px, height_px, shape_height_px, shape_dy);
	}
	var p = ObjectLibrary.prototype = new Container();
	p.Container_initialize = ObjectLibrary.prototype.initialize;
	p.Container_tick = p._tick;
	p.TEXT_COLOR = "rgba(0,0,0,1.0)";
	p.BACKGROUND_COLOR = "rgba(255,245,245,1.0)";
	p.TITLE_HEIGHT = 40;

	p.initialize = function(width_px, height_px, shape_height_px, shape_dy)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.shape_height_px = shape_height_px;
		this.shape_dy = shape_dy;
		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);

		// text
		this.title = new TextContainer("Library", "20px Arial", this.TEXT_COLOR, this.width_px, this.TITLE_HEIGHT, this.BACKGROUND_COLOR, this.BACKGROUND_COLOR, 0, "center", "center");
		this.addChild(this.title);
		
	
		this.g.beginFill(this.BACKGROUND_COLOR);
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		this.shapes = new Array();
		this.maxShapes = Math.floor((this.height_px - this.TITLE_HEIGHT)/shape_height_px);
		stage.ready_to_update = true;
	}

	p.addObject = function (s)
	{
		if (this.shapes.length < this.maxShapes)
		{
			this.addChild(s);
			s.x = 0;
			s.y = this.TITLE_HEIGHT + this.shape_dy + (this.shapes.length) * this.shape_height_px;
			this.shapes.push(s);
		}
	}

	p.removeObject= function (s)
	{
		var index = this.shapes.indexOf(s);
		this.shapes.splice(index, 1);
		// move shapes below up
		var i;
		for (i = index; i < this.shapes.length; i++)
		{
			var s = this.shapes[i];
			s.y -= this.shape_height_px;
		}

	}

	p._tick = function()
	{
		this.Container_tick();
	}

	p.redraw = function()
	{
		stage.ready_to_update = true;
			
	}
	
	window.ObjectLibrary = ObjectLibrary;
}(window));
