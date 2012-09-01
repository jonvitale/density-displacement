(function (window)
{
	function RectPrism (width_unit, depth_unit, height_unit, density, initial_view)
	{
		this.width_unit = width_unit;
		this.depth_unit = depth_unit;
		this.height_unit = height_unit;
		this.width_px = width_unit * UNIT_TO_PIXEL;
		this.depth_px = depth_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.density = density;
		this.volume = this.width_unit * this.depth_unit * this.height_unit;
		this.mass = this.density * this.volume;
		this.bottom_area =  this.width_unit * this.depth_unit;
		this.top_area =  this.width_unit * this.depth_unit;
		this.current_gravity_force = 0;
		this.current_fluid_force = 0;
		this.current_drag_force = 0;
		this.current_net_force = 0; // gravity + boyouncy + drag
		this.current_balance_force = 0; // gravity + boyouncy
		this.velocity = 0;
		this.percentInFluid = 0;
		this.view = (typeof initial_view === "undefined") ? "top" : initial_view;
		this.initialize();
	}
	var p = RectPrism.prototype = new DraggableContainer();
	p.DraggableContainer_initialize = p.initialize;
	p.DraggableContainer_tick = p._tick;

	p.initialize = function()
	{
		this.DraggableContainer_initialize();
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);
		this.redraw();
	}

	p._tick = function()
	{
		this.DraggableContainer_tick();
	}

	/** Redraws based on view */
	p.redraw = function()
	{
		this.g.clear();
		this.g.setStrokeStyle(0.5);
		this.g.beginStroke("#666666");
		if (this.view == "top")
		{
			this.viewable_height = this.depth_px;
			this.viewable_width = this.width_px;
			this.g.beginFill("#BB8888");
			this.g.drawRect(-this.width_px/2, -this.depth_px/2, this.width_px, this.depth_px);
		} else
		{
			this.viewable_height = this.height_px;
			this.viewable_width = this.width_px;
			this.g.beginFill("#996666");
			this.g.drawRect(-this.width_px/2, -this.height_px/2, this.width_px, this.height_px);
		}		
		this.g.endFill();
		//stage.update();
		update = true;
	}
	/** Overwrites DraggableContainer switch view */
	p.switchView = function ()
	{
		if (this.view == "top")
		{
			this.viewFromFront();
		} else if (this.view == "front")
		{
			this.viewFromTop();
		}
	}
	
	/** Change perspective to top-down */
	p.viewFromTop = function()
	{
		this.view = "top";
		this.redraw();
	}
	/** Change perspective to front view */
	p.viewFromFront = function()
	{
		this.view = "front";
		this.redraw();
	}

	p.setDefaultView = p.viewFromFront;

	window.RectPrism = RectPrism;
}(window));