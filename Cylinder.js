(function (window)
{
	function Cylinder (diameter_unit, height_unit, density, initial_view)
	{
		this.diameter_unit = diameter_unit;
		this.height_unit = height_unit;
		this.diameter_px = diameter_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.density = density;
		this.volume = this.diameter_unit/2 * this.diameter_unit/2 * Math.PI * this.height_unit;
		this.mass = this.density * this.volume;
		this.bottom_area = this.diameter_unit/2 * this.diameter_unit/2 * Math.PI;
		this.top_area = this.diameter_unit/2 * this.diameter_unit/2 * Math.PI;
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
	var p = Cylinder.prototype = new DraggableContainer();
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
			this.viewable_height = this.diameter_px;
			this.viewable_width = this.diameter_px;
			this.g.beginFill("#888888");
			this.g.drawCircle(0, 0, this.diameter_px/2);
		} else
		{
			this.viewable_height = this.height_px;
			this.viewable_width = this.diameter_px;
			this.g.beginLinearGradientFill(["#CCCCCC", "#888888","#777777", "#888888", "#CCCCCC"], [0, .25, .5, .75, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
			this.g.drawRect(-this.diameter_px/2, -this.height_px/2, this.diameter_px, this.height_px);
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

	window.Cylinder = Cylinder;
}(window));