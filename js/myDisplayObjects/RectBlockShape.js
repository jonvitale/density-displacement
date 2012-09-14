(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depthArray: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var RectBlockShape = function(unit_width_px, unit_height_px, unit_depth_px, depthArray, view_sideAngle, view_topAngle, materialName)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, depthArray, view_sideAngle, view_topAngle, materialName);
	}
	var p = RectBlockShape.prototype = new Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, depthArray, view_sideAngle, view_topAngle, materialName)
	{
		this.Container_initialize();
		this.mouseEnabled = true;
		this.placed = false;
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.depthArray = depthArray;
		this.view_topAngle = view_topAngle;
		this.view_sideAngle = view_sideAngle;
		this.materialName = materialName;

		this.min_x = 0;
		this.min_y = 0;
		this.max_x = 0;
		this.max_y = 0;
		this.areBoundsSet = false;

		// composition vars
		var g = this.g = new Graphics();
		this.shape = new Shape(g);
		this.addChild(this.shape);
		//this.shape.mouseEnabled = false;
		// draw figure
		this.redraw(this.materialName);

		this.width_px = this.tr_x - this.bl_x;
		this.height_px = this.bl_y - this.tr_y;
	}

	p._tick = function ()
	{
		this.Container_tick();
	}
	p.redraw = function(highlightColor)
	{
		var btr_x, btr_y, btl_x, btl_y, bb_r, ftr_x, ftr_y, ftl_x, ftl_y, fbr_x, fbr_y, fbl_x, fbl_y;
		var g = this.g;
		g.clear();
		var i;
		for (i = 0; i < this.depthArray.length; i++)
		{
			btr_x = -i*this.unit_depth_px*Math.sin(this.view_sideAngle);
			btr_y = i*this.unit_depth_px*Math.sin(this.view_topAngle);
			btl_x = btr_x - this.unit_width_px;
			btl_y = btr_y;
			ftr_x = btr_x - this.unit_depth_px*Math.sin(this.view_sideAngle);
			ftr_y = btr_y + this.unit_depth_px*Math.sin(this.view_topAngle);
			ftl_x = btl_x - this.unit_depth_px*Math.sin(this.view_sideAngle);
			ftl_y = btl_y + this.unit_depth_px*Math.sin(this.view_topAngle);
			fbr_x = ftr_x;
			fbr_y = ftr_y + this.unit_height_px;
			fbl_x = ftl_x;
			fbl_y = ftl_y + this.unit_height_px;
			bbr_x = btr_x;
			bbr_y = btr_y + this.unit_height_px;

			// get extreme points
			if (i == this.depthArray.length-1)
			{
				this.br_x = fbr_x;
				this.br_y = fbr_y;
				this.bl_x = fbl_x;
				this.bl_y = fbl_y;

			} else if (i == 0)
			{
				
				this.tr_x = btr_x;
				this.tr_y = btr_y;
				this.tl_x = btl_x;
				this.tl_y = btl_y;
			}
			
			// is there a cube at this depth?
			if (this.depthArray[i] == 1)
			{				
				// draw cube top, front, side
				g.setStrokeStyle(1);
				g.beginLinearGradientStroke(this.getMaterialStrokeColors(highlightColor), this.getMaterialStrokeRatios(highlightColor), ftl_x, ftl_y, btr_x, ftl_y);
				g.beginLinearGradientFill(this.getMaterialFillColors(this.materialName), this.getMaterialFillRatios(this.materialName), ftl_x, ftl_y, btr_x, ftl_y);
				g.moveTo(btr_x, btr_y);
				g.lineTo(btl_x, btl_y);
				g.lineTo(ftl_x, ftl_y);
				g.lineTo(ftr_x, ftr_y);
				g.lineTo(btr_x, btr_y);
				g.endStroke();
				g.endFill();
				g.setStrokeStyle(1);
				g.beginLinearGradientStroke(this.getMaterialStrokeColors(highlightColor), this.getMaterialStrokeRatios(highlightColor), ftl_x, ftl_y, ftr_x, ftr_y);
				g.beginLinearGradientFill(this.getMaterialFillColors(this.materialName), this.getMaterialFillRatios(this.materialName), ftl_x, ftl_y, ftr_x, ftr_y);
				
				g.moveTo(ftr_x, ftr_y);
				g.lineTo(ftl_x, ftl_y);
				g.lineTo(fbl_x, fbl_y);
				g.lineTo(fbr_x, fbr_y);
				g.lineTo(ftr_x, ftr_y);
				g.endStroke();
				g.endFill();
				g.setStrokeStyle(1);
				g.beginLinearGradientStroke(this.getMaterialStrokeColors(highlightColor), this.getMaterialStrokeRatios(highlightColor), ftr_x, ftr_y, btr_x, btr_y);
				g.beginLinearGradientFill(this.getMaterialFillColors(this.materialName), this.getMaterialFillRatios(this.materialName), btr_x, btr_y, fbl_x, btr_y);
				
				g.moveTo(btr_x, btr_y);
				g.lineTo(ftr_x, ftr_y);
				g.lineTo(fbr_x, fbr_y);
				g.lineTo(bbr_x, bbr_y);
				g.lineTo(btr_x, btr_y);
				g.endStroke();
				g.endFill();
			}
			
		}
		stage.needs_to_update = true;
	}

	/** Checks to see whether this object matches an object of the same type so that they can
		be connected.  Right now, just limited to the case of 5 objects, with only 
		"empty spaced" object 1,0,0,0,1 */
	p.connectsToOther = function(o)
	{
		var c_this = this.depthArray[Math.floor(this.depthArray.length/2)];
		var c_other = o.depthArray[Math.floor(o.depthArray.length/2)];

		if (c_this > 0 && c_other > 0)
		{
			return true;
		} else
		{
			if (c_this == 0)
			{
				if (o.depthArray[Math.floor(o.depthArray.length/2)-1] == 1)
				{
					return true;
				} else
				{ 
					return false;
				}
			} else if (c_other == 0)
			{
				if (this.depthArray[Math.floor(this.depthArray.length/2)-1] == 1)
				{
					return true;
				} else 
				{
					return false;
				}
			} else 
			{
				return true;
			}
		}
	}
	
	p.highlightCorrect = function ()
	{
		this.redraw("correct");
	}
	p.highlightIncorrect = function()
	{
		this.redraw("incorrect")
	}
	p.highlightDefault = function()
	{
		this.redraw(this.materialName);
	}

	/** Get a gradient fill for given material type */
	p.getMaterialFillColors = function (m)
	{
		if (m == "DWood")
		{
			return ["#7D4613", "#8D5925", "#743B18", "#8D5925", "#743B18", "#7C4412", "#743B18"];
		} else if (m == "LWood")
		{
			return ["#FBEFD0", "#FADBA2", "#FAE3B0", "#E8CFA1", "#F0D3A1", "#FBEED2", "#F9E2BA"];
		} else if (m == "Metal")
		{
			return ["#BBBCBE", "#989CA0", "#BFBEC2", "#9EA0A4", "#A7A9AC", "#C3C6CA", "#BBBCBE"];
		} else if (m == "Plastic")
		{
			return ["#F074AC", "#EB008B", "#EB008B", "#F074AC", "#EB008B", "#EB008B", "#F074AC"];
		}
	}
	p.getMaterialFillRatios = function (m)
	{
		if (m == "DWood")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		} else if (m == "LWood")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		} else if (m == "Metal")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		} else if (m == "Plastic")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		}
	}
	p.getMaterialStrokeColors = function (m)
	{
		if (m == "DWood")
		{
			return (["#3B0400", "#3B0400"]);
			//return ["#7D4613", "#7C4412", "#743B18", "#7C4412", "#743B18", "#7C4412", "#743B18"];
		} else if (m == "LWood")
		{
			return (["#AB854C", "#AB854C"]);
			//return ["#F9E2BA", "#DFB17A", "#EDC78E", "#EAD4A7", "#E7C18D", "#F9E2BA", "#E9B980"];
		} else if (m == "Metal")
		{
			return (["#5F6163", "#5F6163"]);
			//return ["#C4C6C8", "#939598", "#9FA1A3", "#A7A9AC", "#A9ABAE", "#A7A9AC", "#D1D3D4"];
		} else if (m == "Plastic")
		{
			return (["#AB004B", "#AB004B"]);
			//return ["#C7158C", "#C7158C", "#C7158C", "#C7158C", "#C7158C", "#C7158C", "#C7158C"];
		} else if (m == "correct")
		{
			return (["#00FF00", "#00FF00"]);
		} else if (m == "incorrect")
		{
			return (["#FF0000", "#FF0000"]);
		}
	}
	p.getMaterialStrokeRatios = function (m)
	{
		return [0, 1];
		/*
		if (m == "DWood")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		} else if (m == "LWood")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		} else if (m == "Metal")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		} else if (m == "Plastic")
		{
			return [0, 0.236, 0.4607, 0.6292, 0.7697, 0.8708, 0.9944];
		}
		*/
	}

	/** Setup dragging bounds.  Prerequisite for dragging */
	p.setBounds = function (rect)
	{
		this.areBoundsSet = true;
		this.min_x = rect.x;
		this.min_y = rect.y;
		this.max_x = rect.x+rect.width - this.viewable_width;
		this.max_y = rect.y+rect.height - this.viewable_height;
		(function(target)
		{
			target.onPress = function (evt)
			{
				this.parent.addChild(this);
				var offset = {x:this.x-evt.stageX, y:this.y-evt.stageY}
				evt.onMouseMove = function (ev)
				{
					var newX = ev.stageX+offset.x;
					var newY = ev.stageY+offset.y;
					if (newX < this.target.min_x)
					{
						this.target.x = this.target.min_x;
					} else if (newX > this.target.max_x)
					{
						this.target.x = this.target.max_x;
					} else
					{
						this.target.x = newX;
					}
					if (newY < this.target.min_y)
					{
						this.target.y = this.target.min_y;
					} else if (newY > this.target.max_y)
					{
						this.target.y = this.target.max_y;
					} else
					{
						this.target.y = newY;
					} 
					update = true;
				}
				evt.onMouseUp = function (ev)
				{
					//placeObjectInContainer(this.target);					
				}
			}
		}(RectBlockShape.prototype));
	}

	/** Sub-classes need to have the switch view method */
	//p.switchView = function (){}
	//p.setDefaultView = function (){}

	window.RectBlockShape = RectBlockShape;
}(window));