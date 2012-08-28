(function (window)
{
	function BalanceViewer (width_unit, height_unit, pan_width_unit)
	{
		this.width_unit = width_unit;
		this.height_unit = height_unit;
		this.pan_width_unit = pan_width_unit;
		this.width_px = width_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.pan_width_px = this.pan_width_unit * UNIT_TO_PIXEL;
		this.initialize();
	}
	var p = BalanceViewer.prototype = new Container();
	p.Container_initialize = BalanceViewer.prototype.initialize;
	p.Container_tick = p._tick;

	p.initialize = function()
	{
		this.Container_initialize();
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.balanceModel = new BalanceModel(this.width_unit, this.height_unit*3/4, this.pan_width_unit);
		this.balanceModel.x = this.width_px * 0.5;
		this.balanceModel.y = this.height_px - this.balanceModel.height_px;
		this.addChild(this.shape);
		this.addChild(this.balanceModel);
		this.redraw();
	}
	p.isRunning = function ()
	{
		return this.balanceModel.isRunning();
	}

	p._tick = function ()
	{
		this.Container_tick();
		this.balanceModel._tick();
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
		this.balanceModel.start();
	}
	p.reset = function()
	{
		this.balanceModel.reset();
	}
	p.releaseObject = function (o)
	{
		return this.balanceModel.releaseObject(o);
	}
	p.placeObject = function(o)
	{
		return this.balanceModel.placeObject(o);
	}

	window.BalanceViewer = BalanceViewer;
}(window));