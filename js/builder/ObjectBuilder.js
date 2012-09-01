(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	and a grid space for putting them together */
	function ObjectBuilder (width_px, height_px, materialNameDisplayMapping)
	{
		this.width_px = width_px;
		this.height_px = height_px;
		this.materialNameDisplayMapping = materialNameDisplayMapping;
		this.initialize();
	}
	var p = ObjectBuilder.prototype = new Container();
	p.Container_initialize = ObjectBuilder.prototype.initialize;
	p.Container_tick = p._tick;

	p.initialize = function()
	{
		this.Container_initialize();
		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);

		// the list of material names
		this.materialsMenu = new MaterialsMenu(this.width_px/3, this.height_px, this.materialNameDisplayMapping);
		this.addChild(this.materialsMenu);
		this.initial_draw();

	}

	p._tick = function()
	{
		this.Container_tick();

	}

	p.redraw = function()
	{
		stage.ready_to_update = true;
			
	}

	/** Draw initially */
	p.initial_draw = function()
	{
		this.g.beginFill("rgba(0,0,0,1.0)");
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		stage.ready_to_update = true;
	}

	window.ObjectBuilder = ObjectBuilder;
}(window));
