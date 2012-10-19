(function (window)
{
	/** Creates a menu with the names of the materials */
	function MaterialsMenu (width_px, height_px)
	{
		this.initialize(width_px, height_px);
	}
	var p = MaterialsMenu.prototype = new Container();
	p.Container_initialize = MaterialsMenu.prototype.initialize;
	p.Container_tick = p._tick;
	p.SELECTED_COLOR = "rgba(225,225,255,1.0)";
	p.UNSELECTED_COLOR = "rgba(200,200,255,1.0)";
	p.TEXT_COLOR = "rgba(0, 0, 200, 1.0)";

	p.initialize = function(width_px, height_px)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
	
		this.materialCount = 0;
		this.displayNames = {};
		this.tabArray = {};
		this.rev_materialNameDisplayMapping = {};

		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);
		this.g.beginFill(this.UNSELECTED_COLOR);
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		for (var key in GLOBAL_PARAMETERS.materials)
		{
			if (this.materialCount == 0) this.defaultMaterialName = key;
			this.displayNames[key] = GLOBAL_PARAMETERS.materials[key].displayName;
			this.rev_materialNameDisplayMapping[this.displayNames[key]] = key;
			var tab = new TextContainer(this.displayNames[key], "20px Arial", this.TEXT_COLOR, this.width_px, this.height_px/GLOBAL_PARAMETERS.MATERIAL_COUNT, this.UNSELECTED_COLOR, this.UNSELECTED_COLOR, 0, "center", "center");
			tab.x = 0;
			tab.y = this.materialCount * (this.height_px/GLOBAL_PARAMETERS.MATERIAL_COUNT) + (this.height_px/GLOBAL_PARAMETERS.MATERIAL_COUNT-tab.height_px)/2;
			tab.onClick = this.clickHandler.bind(this);
			this.tabArray[key] = tab;
			this.addChild(tab);
			this.materialCount++;
		}
		
		// projected selection outline
		this.projectedTextOutlineGraphics = new Graphics();
		this.projectedTextOutlineShape = new Shape(this.projectedTextOutlineGraphics);
		this.projectedTextOutlineShape.mouseEnabled = false;
		this.addChild(this.projectedTextOutlineShape);
		

		this.projectedTextOutlineGraphics.setStrokeStyle(1);
		this.projectedTextOutlineGraphics.beginStroke(this.TEXT_COLOR);
		this.projectedTextOutlineGraphics.drawRect(0, 0, this.width_px, this.height_px/GLOBAL_PARAMETERS.MATERIAL_COUNT);
			
		// select
		this.currentMaterialName = this.defaultMaterialName;
		this.projectedTextOutlineShape.x = 0;
		this.projectedTextOutlineShape.y = 0;
		this.tabArray[this.currentMaterialName].setBackgroundColor(this.SELECTED_COLOR);
		
		stage.ready_to_update = true;
	}

	p._tick = function()
	{
		this.Container_tick();
	}

	p.redraw = function()
	{
		stage.ready_to_update = true;
			
	}
	/** Mouse interaction */
	p.mouseOverHandler = function(evt)
	{
		var key = this.rev_materialNameDisplayMapping[evt.target.textString];
		this.projectedTextOutlineShape.y = this.tabArray[key].y;
	}

	p.clickHandler = function(evt)
	{
		if (this.currentMaterialName != null)
		{
			this.tabArray[this.currentMaterialName].setBackgroundColor(this.UNSELECTED_COLOR);
		}
		var key = this.rev_materialNameDisplayMapping[evt.target.textString];
		this.parent.buttonClickHandler(key);
		this.projectedTextOutlineShape.y = this.tabArray[key].y;
		this.tabArray[key].setBackgroundColor(this.SELECTED_COLOR);
		this.currentMaterialName = key;
		
	}

	window.MaterialsMenu = MaterialsMenu;
}(window));
