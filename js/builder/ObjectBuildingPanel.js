(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	and a grid space for putting them together */
	function ObjectBuildingPanel (width_px, height_px, materialNameDisplayMapping)
	{
		this.initialize(width_px, height_px, materialNameDisplayMapping);
	}
	var p = ObjectBuildingPanel.prototype = new Container();
	p.Container_initialize = ObjectBuildingPanel.prototype.initialize;
	p.Container_tick = p._tick;

	// constants
	p.MATERIAL_TYPES = ["full", "center3", "center1", "ends"];

	p.initialize = function(width_px, height_px, materialNameDisplayMapping)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.materialNameDisplayMapping = materialNameDisplayMapping;
		

		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);

		// the list of material names
		this.materialsMenu = new MaterialsMenu(this.width_px/8, this.height_px, this.materialNameDisplayMapping);
		this.addChild(this.materialsMenu);
		
		this.vv = new VolumeViewer(20, 20, 20, 5, 5, 5, 10*Math.PI/180, 20*Math.PI/180);
		this.vv.x = this.materialsMenu.x + this.materialsMenu.width_px + 400;
		this.vv.y = 0;
		this.addChild(this.vv);

		this.g.beginFill("rgba(255,255,255,1.0)");
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		this.blocks = new Array();
		this.drawMaterial(this.materialsMenu.currentMaterialName);


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

	
	////////////////////// CLASS SPECIFIC ////////////////////
	p.buttonClickHandler  = function(materialName)
	{
		this.drawMaterial(materialName);

	}

	p.drawMaterial = function (materialName)
	{
		var o, i;
		// if blocks array is not empty remove these from display
		if (this.blocks.length != 0)
		{
			for (i = 0; i < this.blocks.length; i++)
			{
				this.removeChild(this.blocks[i])
			}
			this.blocks = new Array();
		}
		var depthArray;
		for (i = 0; i < this.MATERIAL_TYPES.length; i++)
		{
			o = this.newBlock(materialName, i);
			this.placeBlock(o, i);
			//bmp.setBounds(new Rectangle(0, 0, this.width_px, this.height_px));
			
		}
		stage.ready_to_update = true;
	}
	p.newBlock = function (materialName, i)
	{
		if (this.MATERIAL_TYPES[i] == "full"){depthArray = [1,1,1,1,1];}
		else if (this.MATERIAL_TYPES[i] == "center3"){depthArray = [0,1,1,1,0];}
		else if (this.MATERIAL_TYPES[i] == "center1"){depthArray = [0,0,1,0,0];}
		else if (this.MATERIAL_TYPES[i] == "ends"){depthArray = [1,0,0,0,1];}
		//var temp = new Bitmap("images/"+this.materialName+"-"+this.MATERIAL_TYPES[i]+".svg");
		//bmp = new DraggableBitmap("images/"+materialName+"-"+this.MATERIAL_TYPES[i]+".png");
		var o = new RectBlockShape(20, 20, 20, depthArray, 10*Math.PI/180, 20*Math.PI/180, materialName);
		this.blocks[i] = o;
		o.onPress = this.blockPressHandler.bind(this);
		this.addChild(o);
		o.orig_parent = this;
		return o;
	}
	// WORKING WITH OBJECTS
	p.placeBlock = function (o, i)
	{
		o.x = this.materialsMenu.width_px + i * this.width_px/6/this.MATERIAL_TYPES.length + (o.width_px);// - bmp.image.width)/2;
		o.y = (this.height_px - o.height_px)/2;	
	}
	/** */
	p.blockPressHandler = function (evt)
	{
		var offset = {x:evt.target.x-evt.stageX, y:evt.target.y-evt.stageY}
		evt.target.parent.addChild(evt.target);
		evt.onMouseMove = function (ev)
		{
			var parent = this.target.parent;
			var lpoint = parent.globalToLocal(ev.stageX+offset.x, ev.stageY+offset.y);
			var newX = lpoint.x;
			var newY = lpoint.y;
				
			// place within bounds of this object
			if (parent instanceof ObjectBuildingPanel)
			{
				if (newX < 0)
				{
					this.target.x = 0;
				} else if (newX > parent.width_px)
				{
					this.target.x = ob.width_px;
				} else
				{
					this.target.x = newX;
				}
				if (newY < 0)
				{
					this.target.y = 0;
				} else if (newY > parent.height_py)
				{
					this.target.y = parent.height_py;
				} else
				{
					this.target.y = newY;
				} 

				parent.vv.placeBlock(this.target);
			} else if (parent instanceof VolumeViewer)	
			{
				this.target.x = newX;
				this.target.y = newY;
				parent.placeBlock(this.target);
			}
			stage.needs_to_update = true;
		}
		evt.onMouseUp = function (ev)
		{
			var parent = this.target.parent;
			var o = this.target; 
			if (parent instanceof ObjectBuildingPanel)
			{
				// find index
				var i = parent.blocks.indexOf(o);
				parent.placeBlock(o, i);
			} else if (parent instanceof VolumeViewer)	
			{
				parent.setBlock(o);
				var i = o.orig_parent.blocks.indexOf(o);
				var no = o.orig_parent.newBlock(o.materialName, i);
				o.orig_parent.placeBlock(no, i);
			}				
		}
	}

	/** This function is used to end the creation of a specific block */
	p.saveObject = function()
	{
		// go through the 2d array of volume viewer and replace objects with their depth arrays
		var blockArray3d = new Array();
		var blockArray2d = this.vv.blockArray2d;
		var i, j, k, blockCount=0;

		for (i = 0; i < blockArray2d.length; i++)
		{
			blockArray3d[i] = new Array();
			for (j = 0; j < blockArray2d[i].length; j++)
			{
				if (blockArray2d[i][j] != null)
				{
					blockArray3d[i][j] = new Array();
					for (k = 0; k < blockArray2d[i][j].depthArray.length; k++)
					{
						if (blockArray2d[i][j].depthArray[k] == 1)
						{
							blockArray3d[i][j][k] = blockArray2d[i][j].materialName;
						} else 
						{
							blockArray3d[i][j][k] = "";
						}
					}
					blockCount++;
				} else
				{
					blockArray3d[i][j] = ["", "", "", "", ""];
				}
			}
		}
		// remove object on screen
		this.vv.clearBlocks();
		//console.log(blockArray3d);
		return blockArray3d;
	}

	window.ObjectBuildingPanel = ObjectBuildingPanel;
}(window));
