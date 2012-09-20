(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depthArray: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var BlockCompShape = function(unit_width_px, unit_height_px, unit_depth_px, blockArray3d, materialNameMassMapping, view_sideAngle, view_topAngle, materialName)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, blockArray3d, materialNameMassMapping, view_sideAngle, view_topAngle, materialName);
	} 
	var p = BlockCompShape.prototype = new Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, blockArray3d, materialNameMassMapping, view_sideAngle, view_topAngle, materialName)
	{
		this.Container_initialize();
		this.mouseEnabled = true;
		this.placed = false;
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.blockArray3d = blockArray3d;
		this.materialNameMassMapping = materialNameMassMapping;
		this.view_topAngle = view_topAngle;
		this.view_sideAngle = view_sideAngle;
		this.materialName = materialName;

		this.DEBUG = false;

		// composition vars
		var g = this.g = new Graphics();
		this.shape = new Shape(g);
		this.addChild(this.shape);
		//this.shape.mouseEnabled = false;
		this.getHighestRow();
		this.getLowestRow();
		this.getLeftmostColumn();
		this.getRightmostColumn();
		this.getMassArray2d();
		//console.log(this.leftmostColumn, this.highestRow, this.rightmostColumn, this.lowestRow);
		//console.log(this.massArray2d);
		// draw figure
		this.redraw();

		// MOVE SHAPE SO THAT THE TOP-LEFT CORNER OF THE FRONT FACE IS 0,0
		this.shape.x += (this.blockArray3d[1][1].length*Math.sin(this.view_sideAngle) + -this.leftmostColumn+1) * this.unit_width_px;// + (this.rightmostColumn+1 - this.leftmostColumn) /2 ) * this.unit_width_px;
		this.shape.y += (-this.blockArray3d[1][1].length*Math.sin(this.view_topAngle) - this.highestRow) *  this.unit_height_px;;// + (this.lowestRow+1 - this.highestRow) / 2) * this.unit_height_px;
		
		this.width_px_left = 0;
		this.width_px_right = (this.rightmostColumn + 1 - this.leftmostColumn) * this.unit_width_px;
		this.height_px_above = this.blockArray3d[1][1].length*Math.sin(this.view_topAngle) * this.unit_depth_px;
		this.height_px_below = (this.lowestRow+1 - this.highestRow) * this.unit_height_px;

		if (this.DEBUG)
		{
			var dg = new Graphics();
			var dshape = new Shape(dg);
			this.addChild(dshape);
			dg.beginFill("rgba(255,0,0,0.5)");
			dg.drawCircle(0, 0, 2);
			dg.endFill();
		}
		//console.log("after", this.shape.x, this.shape.y);
	}

	p._tick = function ()
	{
		this.Container_tick();
	}

////////////////////// UTILITY FUNCTIONS FOR THE ARRAY ///////////////////
	p.getLowestRow = function ()
	{
		if (this.lowestRow == undefined)	
		{
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (j = this.blockArray3d[1].length-1; j >= 0; j--)
			{
				for (i = 0; i < this.blockArray3d.length; i++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.lowestRow = j;
							return this.lowestRow ;
						}
					}
				}
			}
			this.lowestRow = -1;
			return this.lowestRow;
		} else
		{
			return this.lowestRow; 
		}
	}
	p.getHighestRow = function ()
	{
		if (this.highestRow == undefined)
		{	
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (j = 0; j < this.blockArray3d[1].length; j++)
			{
				for (i = 0; i < this.blockArray3d.length; i++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.highestRow = j;
							return this.highestRow;
						}
					}
				}
			}
			this.highestRow = -1;
			return this.highestRow;
		} else
		{
			return this.highestRow;
		}
	}
	p.getLeftmostColumn = function ()
	{
		if (this.leftmostColumn == undefined)
		{	
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (i = 0; i < this.blockArray3d.length; i++)
			{
				for (j = 0; j < this.blockArray3d[1].length; j++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.leftmostColumn = i;
							return this.leftmostColumn;
						}
					}
				}
			}
			this.leftmostColumn = -1
			return this.leftmostColumn;
		} else 
		{
			return this.leftmostColumn;
		}
	}
	p.getRightmostColumn = function ()
	{
		if (this.rightmostColumn == undefined)
		{
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (i = this.blockArray3d.length-1; i >= 0; i--)
			{
				for (j = 0; j < this.blockArray3d[1].length; j++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.rightmostColumn = i;
							return this.rightmostColumn;
						}
					}
				}
			}
			this.rightmostColumn = -1;
			return this.rightmostColumn;
		} else
		{
			return this.rightmostColumn;
		}
	}

	p.getMassArray2d = function ()
	{
		if (this.massArray2d == undefined)
		{
			var massArray2d = this.massArray2d = new Array();
			var left_x = this.getLeftmostColumn();
			var right_x = this.getRightmostColumn();
			var top_y = this.getHighestRow();
			var bottom_y = this.getLowestRow();

			// go through rows and columns adding up mass in depths
			var i, j, k
			for (i = left_x; i <= right_x; i++)
			{
				massArray2d[i - left_x] = new Array();
				for (j = top_y; j <= bottom_y; j++)
				{
					var mass = 0;
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							mass += this.materialNameMassMapping[this.blockArray3d[i][j][k]];
						}
					}
					massArray2d[i - left_x][j - top_y] = mass;
				}
			} 
			return this.massArray2d;
			
		} else
		{
			return this.massArray2d;
		}	
	}

////////////////////// DRAWING STUFF /////////////////////////
	p.redraw = function()
	{
		var btr_x, btr_y, btl_x, btl_y, bb_r, ftr_x, ftr_y, ftl_x, ftl_y, fbr_x, fbr_y, fbl_x, fbl_y;
		var g = this.g;
		g.clear();
		var i, j, k;
		this.tr_x = NaN;
		this.tr_y = NaN;
		
		for (i = 0; i < this.blockArray3d.length; i++)
		{
			for (j = this.blockArray3d[i].length-1; j >= 0; j--)
			{
				for (k = 0; k < this.blockArray3d[i][j].length; k++)
				{
					
					// is there a cube at this depth?
					if (this.blockArray3d[i][j][k] != "")
					{		

						var materialName = this.blockArray3d[i][j][k];
						btr_x = i*this.unit_width_px - k*this.unit_depth_px*Math.sin(this.view_sideAngle);
						btr_y = j*this.unit_height_px + k*this.unit_depth_px*Math.sin(this.view_topAngle);
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
						
						// setup overall corners
						if (isNaN(this.tr_x) || isNaN(this.tr_y))
						{ 
							this.tr_x = btr_x; this.tr_y = btr_y;
						}
						// continuously override bottom left
						this.bl_x = fbl_x; this.bl_y = fbl_y;

						// draw cube top, front, side
						g.setStrokeStyle(1);
						g.beginLinearGradientStroke(this.getMaterialStrokeColors(materialName), this.getMaterialStrokeRatios(materialName), ftl_x, ftl_y, btr_x, ftl_y);
						g.beginLinearGradientFill(this.getMaterialFillColors(materialName), this.getMaterialFillRatios(materialName), ftl_x, ftl_y, btr_x, ftl_y);
						g.moveTo(btr_x, btr_y);
						g.lineTo(btl_x, btl_y);
						g.lineTo(ftl_x, ftl_y);
						g.lineTo(ftr_x, ftr_y);
						g.lineTo(btr_x, btr_y);
						g.endStroke();
						g.endFill();
						g.setStrokeStyle(1);
						g.beginLinearGradientStroke(this.getMaterialStrokeColors(materialName), this.getMaterialStrokeRatios(materialName), ftl_x, ftl_y, ftr_x, ftr_y);
						g.beginLinearGradientFill(this.getMaterialFillColors(materialName), this.getMaterialFillRatios(materialName), ftl_x, ftl_y, ftr_x, ftr_y);
						
						g.moveTo(ftr_x, ftr_y);
						g.lineTo(ftl_x, ftl_y);
						g.lineTo(fbl_x, fbl_y);
						g.lineTo(fbr_x, fbr_y);
						g.lineTo(ftr_x, ftr_y);
						g.endStroke();
						g.endFill();
						g.setStrokeStyle(1);
						g.beginLinearGradientStroke(this.getMaterialStrokeColors(materialName), this.getMaterialStrokeRatios(materialName), ftr_x, ftr_y, btr_x, btr_y);
						g.beginLinearGradientFill(this.getMaterialFillColors(materialName), this.getMaterialFillRatios(materialName), btr_x, btr_y, fbl_x, btr_y);
						
						g.moveTo(btr_x, btr_y);
						g.lineTo(ftr_x, ftr_y);
						g.lineTo(fbr_x, fbr_y);
						g.lineTo(bbr_x, bbr_y);
						g.lineTo(btr_x, btr_y);
						g.endStroke();
						g.endFill();
					} else if (this.DEBUG && k == 0)
					{
						g.beginFill("rgba(255,255,0,0.5)");
						g.drawRect((i-1)*this.unit_width_px, j*this.unit_height_px, this.unit_width_px, this.unit_height_px);
						g.endFill();
					}
				}
			}
		}
		if (this.DEBUG)
		{
			g.beginFill("rgba(0,0,0,1.0)");
			g.drawCircle(0,0, 2);
			g.endFill();
		}
		this.width_px = this.tr_x - this.bl_x;
		this.height_px = this.bl_y - this.tr_y;
		stage.needs_to_update = true;
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
		}(BlockCompShape.prototype));
	}

	window.BlockCompShape = BlockCompShape;
}(window));