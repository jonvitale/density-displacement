(function (window)
{
	function VolumeViewer (unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units, view_sideAngle, view_topAngle)
	{
		
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units, view_sideAngle, view_topAngle);
	}
	var p = VolumeViewer.prototype = new Container();
	p.Container_initialize = VolumeViewer.prototype.initialize;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units, view_sideAngle, view_topAngle)
	{
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.width_units = width_units;
		this.depth_units = depth_units;
		this.height_units = height_units;
		this.view_topAngle = view_topAngle;
		this.view_sideAngle = view_sideAngle;
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);
		// define corners
		this.tr_x = 0;
		this.tr_y = 0;
		this.tl_x = -this.width_units*this.unit_width_px;
		this.tl_y = 0;
		this.br_x = 0;
		this.br_y = this.height_units*this.unit_height_px;
		this.bl_x = -this.width_units*this.unit_width_px;
		this.bl_y = this.height_units*this.unit_height_px;
		this.fr_x = this.br_x - this.depth_units*this.unit_depth_px*Math.sin(this.view_sideAngle);
		this.fr_y = this.br_y + this.depth_units*this.unit_depth_px*Math.sin(this.view_topAngle);
		this.fl_x = this.bl_x - this.depth_units*this.unit_depth_px*Math.sin(this.view_sideAngle);
		this.fl_y = this.bl_y + this.depth_units*this.unit_depth_px*Math.sin(this.view_topAngle);

		// draw back of grid
		this.g.setStrokeStyle(0.5);
		this.g.beginStroke("rgba(0,0,0,1.0)");
		this.g.beginFill("rgba(245,245,245,1.0)");
		this.g.moveTo(this.tr_x, this.tr_y);
		this.g.lineTo(this.tl_x, this.tl_y);
		this.g.lineTo(this.bl_x, this.bl_y);
		this.g.lineTo(this.br_x, this.br_y);
		this.g.lineTo(this.tr_x, this.tr_y);
		this.g.endFill();
		//this.g.drawRect(0, 0, -this.width_units*this.unit_width_px, this.height_units*this.unit_height_px);
		var i;
		for (i = 0; i <= this.height_units; i++)
		{
			this.g.moveTo(this.tr_x, i * this.unit_height_px);
			this.g.lineTo(this.tl_x, i * this.unit_height_px);
		}

		for (i = 0; i <= this.width_units; i++)
		{
			this.g.moveTo(i * -this.unit_width_px, this.tl_y);
			this.g.lineTo(i * -this.unit_width_px, this.bl_y);	
		}
		
		this.g.beginFill("rgba(245,245,245,1.0)");
		this.g.moveTo(this.br_x, this.br_y);
		this.g.lineTo(this.bl_x, this.bl_y);
		this.g.lineTo(this.fl_x, this.fl_y);
		this.g.lineTo(this.fr_x, this.fr_y);
		this.g.lineTo(this.br_x, this.br_y);
		this.g.endFill();
		// draw bottom of grid
		for (i = 0; i <= this.depth_units; i++)
		{
			this.g.moveTo(this.br_x - i * this.unit_depth_px*Math.sin(this.view_sideAngle), this.bl_y + i * this.unit_depth_px*Math.sin(this.view_topAngle));
			this.g.lineTo(this.bl_x - i * this.unit_depth_px*Math.sin(this.view_sideAngle), this.bl_y + i * this.unit_depth_px*Math.sin(this.view_topAngle));
		}
		for (i = 0; i <= this.width_units; i++)
		{
			this.g.moveTo(this.br_x - i * this.unit_width_px, this.br_y );
			this.g.lineTo(this.fr_x - i * this.unit_width_px, this.fr_y );
		}
		this.g.endStroke();
		//this.width_px = this.tr_x - this.fl_x;
		//this.height_px = this.fl_y - this.tr_y;
		this.width_from_depth = this.unit_depth_px*this.depth_units*Math.sin(this.view_sideAngle);
		this.height_from_depth = this.unit_depth_px*this.depth_units*Math.sin(this.view_topAngle);
		
		this.width_px = this.unit_width_px*this.width_units + this.width_from_depth;
		this.height_px = this.unit_height_px*this.height_units + this.height_from_depth;
		
		this.currentObject = null;

		// create a 2d array and fill with nulls (references)
		var i, j;
		this.blockArray2d = new Array();
		
		for (i = 0; i < this.width_units; i++)
		{
			this.blockArray2d[i] = new Array();
			for (j = 0; j < this.height_units; j++)
			{
				this.blockArray2d[i][j] = null;
			}
		}
		
		stage.needs_to_update = true;
	}
	/** Releases object from the hold of this container */
	p.releaseBlock = function (o)
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
	p.placeBlock = function (o)
	{

		var lo = o.parent.localToLocal(o.x, o.y, this); 
		var x_index = Math.round((lo.x-o.unit_width_px/2)/this.unit_width_px) + this.width_units - 1;
		var rx =  (x_index - this.width_units + 1) * this.unit_width_px;// + o.unit_width_px;
		var y_index = Math.round((lo.y-o.unit_height_px/2)/this.unit_height_px);
		var ry = y_index * this.unit_height_px;// + o.unit_height_px;
		//console.log("index", x_index, y_index);

		//if (rx >= this.tl_x && rx <= this.tr_x && ry >= this.tl_y && ry <= this.bl_y)
		//console.log("x,y", x_index, y_index, "ox,oy", o.x_index, o.y_index);
		if (x_index >= 0 && x_index < this.width_units && y_index >= 0 && y_index < this.height_units)
		{
			// if o is not alread placed here in container add it
			if (!o.placed)
			{
				o.x_index = -1;
				o.y_index = -1;
				this.addChild(o);
				o.placed = true;
			} 
			// are we in a different location from before
			if (x_index != o.x_index || y_index != o.y_index)
			{
				//place this object in the correct place in the array
				var i, j, underCount = 0;
				for (i = 0; i <= x_index; i++)
				{
					for (j = this.height_units-1; j >= 0; j--)
					{
						if ((i < x_index || j > y_index) && this.blockArray2d[i][j] != null ){underCount++;}
					}
				}
				// swap array index based on number of objects under o after background shape
				this.addChildAt(o, underCount+1);
				var goodLocation = false;
				// Use rules
				// is this space occupied?
				if (this.blockArray2d[x_index][y_index]  == null)
				{
					// is this the first block?
					if (this.getNumChildren() == 2)
					{
						goodLocation = true;
					}  else
					{	
						// is this block attached to another?
						// bottom-left, bottom-center,...
						if (x_index > 0 && y_index < this.height_units-1 && this.blockArray2d[x_index-1][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index+1])) {goodLocation = true;}
						else if (y_index < this.height_units-1 && this.blockArray2d[x_index][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index][y_index+1])) {goodLocation = true;}
						else if (x_index < this.width_units-1 && y_index < this.height_units-1 && this.blockArray2d[x_index+1][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index+1])) {goodLocation = true;}
						else if (x_index > 0 && this.blockArray2d[x_index-1][y_index] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index])) {goodLocation = true;}
						else if (this.blockArray2d[x_index][y_index] != null && o.connectsToOther(this.blockArray2d[x_index][y_index])) {goodLocation = true;}
						else if (x_index < this.width_units-1 && this.blockArray2d[x_index+1][y_index] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index])) {goodLocation = true;}
						else if (x_index > 0 && y_index > 0 && this.blockArray2d[x_index-1][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index-1])) {goodLocation = true;}
						else if (y_index > 0 && this.blockArray2d[x_index][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index][y_index-1])) {goodLocation = true;}
						else if (x_index < this.width_units-1 && y_index > 0 && this.blockArray2d[x_index+1][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index-1])) {goodLocation = true;}
						else {goodLocation = false;}
					}					
				} else
				{
					goodLocation = false;
				}
				// if in a good location highlight and set boolean properties
				if (goodLocation)
				{
					o.highlightCorrect();
					o.correct = true;
					o.incorrect = false;
				} else 
				{
					o.highlightIncorrect();
					o.correct = false;
					o.incorrect = true;
				}				
			}
			o.x_index = x_index;
			o.y_index = y_index;
			o.x = rx; 
			o.y = ry;
		} else
		{
			// if o is contained here add it to parent of this, object viewer
			if (o.placed) 
			{
				var go = this.localToLocal(o.x, o.y, o.parent);
				this.parent.addChild(o);
				o.x = go.x; 
				o.y = go.y;
				o.placed = false;
				o.correct = false;
				o.incorrect = false;
				o.highlightDefault();
			}
		}
		
	}
	p.setBlock = function(o)
	{
		if (o.correct)
		{
			if (o.x_index >= 0 && o.x_index < this.width_units && o.y_index >= 0 && o.y_index < this.height_units)
			{
					this.blockArray2d[o.x_index][o.y_index] = null;
			}
			 this.blockArray2d[o.x_index][o.y_index] = o;
			 o.highlightDefault();
		} else if (o.incorrect)
		{
			this.removeChild(o);
		}
	}
	p.clearBlocks = function ()
	{
		var i;
		for (i = this.getNumChildren()-1; i > 0; i--)
		{
			this.removeChildAt(i);
		}
		this.blockArray2d = new Array();
		
		for (i = 0; i < this.width_units; i++)
		{
			this.blockArray2d[i] = new Array();
			for (j = 0; j < this.height_units; j++)
			{
				this.blockArray2d[i][j] = null;
			}
		}
	}


	p.redraw = function()
	{
		
		
			
	}

	window.VolumeViewer = VolumeViewer;
}(window));
