(function (window)
{
	function VolumeViewer (width_unit, height_unit)
	{
		this.width_unit = width_unit;
		this.height_unit = height_unit;
		this.width_px = width_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);
		this.currentObject = null;
		this.initialize();
	}
	var p = VolumeViewer.prototype = new Container();
	p.Container_initialize = VolumeViewer.prototype.initialize;

	p.initialize = function()
	{
		this.redraw();
	}
	/** Releases object from the hold of this container */
	p.releaseObject = function (o)
	{
		if (this.currentObject != null && o == this.currentObject)
		{
		 this.currentObject = null;
		 return true;
		} else
		{
			return false;
		}
	}
	/** This function takes an object that is placed within bounds and snaps to the grid */
	p.placeObject = function (o)
	{
		if (this.hitTest(o.x, o.y))
		{
			if (o.x + o.viewable_width/2 > this.width_px)
			{
				o.x = this.width_px - o.viewable_width/2;
			}
			if (o.y + o.viewable_height/2 > this.height_px)
			{
				o.y = this.height_px - o.viewable_height/2;
			}
			o.x = Math.floor((o.x-o.viewable_width/2)/UNIT_TO_PIXEL) * UNIT_TO_PIXEL + o.viewable_width/2;
			o.y = Math.floor((o.y-o.viewable_height/2)/UNIT_TO_PIXEL) * UNIT_TO_PIXEL + o.viewable_height/2;
			this.currentObject = o;
			update = true;
			return true;
		} else
		{
			return false;
		}
		
	}
	p.redraw = function()
	{
		// draw grid
		this.g.setStrokeStyle(0.5);
		this.g.beginStroke(Graphics.getRGB(0,0,0));
		this.g.beginFill("#ffffee")
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		var nCols = Math.floor(this.width_px/UNIT_TO_PIXEL);
		var nRows = Math.floor(this.height_px/UNIT_TO_PIXEL);
		for (var i = 0; i < nRows; i++)
		{
			this.g.moveTo(0, i * UNIT_TO_PIXEL);
			this.g.lineTo(this.width_px, i * UNIT_TO_PIXEL);
		}
		for (i = 0; i < nCols; i++)
		{
			this.g.moveTo(i * UNIT_TO_PIXEL, 0);
			this.g.lineTo(i * UNIT_TO_PIXEL, this.height_px);	
		}
		update = true;
			
	}

	window.VolumeViewer = VolumeViewer;
}(window));
