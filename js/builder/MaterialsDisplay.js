(function (window)
{
	/** This display a single type of materials */
	function MaterialsDisplay (width_px, height_px, materialName)
	{
		this.width_px = width_px;
		this.height_px = height_px;
		this.materialName = materialName;
		this.initialize();
	}
	var p = MaterialsDisplay.prototype = new Container();
	p.Container_initialize = MaterialsDisplay.prototype.initialize;
	p.Container_tick = p._tick;
	p.MATERIAL_TYPES = ["full", "center3", "center1", "ends"];

	p.initialize = function()
	{
		this.Container_initialize();
		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);
		
		this.bitmaps = new Array();
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

	p.initial_draw = function()
	{
		this.g.beginFill("rgba(225,225,255,1.0)");
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();


		var bmp, i;
		for (i in this.MATERIAL_TYPES)
		{
			var temp = new Bitmap("images/"+this.materialName+"-"+this.MATERIAL_TYPES[i]+".svg");
			bmp = new DraggableBitmap("images/"+this.materialName+"-"+this.MATERIAL_TYPES[i]+".svg");
			bmp.x = i * this.width_px/this.MATERIAL_TYPES.length + (this.width_px/this.MATERIAL_TYPES.length - bmp.image.width)/2;
			bmp.y = (this.height_px - bmp.image.height)/2;
			bmp.setBounds(new Rectangle(0, 0, this.width_px, this.height_px));
			this.bitmaps.push(bmp);
			this.addChild(bmp);
		}
	}

	window.MaterialsDisplay = MaterialsDisplay;
}(window));
