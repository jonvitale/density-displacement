(function (window)
{
	/** Construct boundaries for this object*/
	var DraggableBitmap = function(imageOrUri)
	{
		//Bitmap.apply(this, arguments);
		Bitmap.call(this, arguments);
		this.initialize(imageOrUri);
	}
	var p = DraggableBitmap.prototype = new Bitmap();
	//p.constructor = DraggableBitmap;
	/*
	var p = DraggableBitmap.prototype = 
	(function(parent, child)
	{
    	function protoCreator()
    	{
        	this.constructor = child.prototype.constructor
    	};
	    protoCreator.prototype = parent.prototype;
    	return new protoCreator();
	})(Bitmap, DraggableBitmap);
	*/
	//var p = DraggableBitmap.prototype = Object.create(Bitmap.prototype);
	// public properties
	p.mouseEventsEnabled = true;
	p.Bitmap_initialize = p.initialize;
	p.Bitmap_tick = p._tick;

	p.initialize = function(imageOrUri)
	{
		this.Bitmap_initialize(imageOrUri);
		this.min_x = 0;
		this.min_y = 0;
		this.max_x = 0;
		this.max_y = 0;
		this.width_px = 0;
		this.height_px = 0;
		this.areBoundsSet = false;
	}

	p._tick = function ()
	{
		this.Bitmap_tick();
	}
	/** Setup dragging bounds.  Prerequisite for dragging */
	p.setBounds = function (rect)
	{
		this.areBoundsSet = true;
		this.min_x = rect.x;
		this.min_y = rect.y;
		this.max_x = rect.x+rect.width - this.width_px;
		this.max_y = rect.y+rect.height - this.height_px;
		(function(target)
		{
			target.onPress = function (evt)
			{
				//this.setDefaultView();
				console.log("presed");
				//releaseObjectFromBitmap (this);
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
					//placeObjectInBitmap(this.target);					
				}
			}
		}(DraggableBitmap.prototype));
	}
	/** Sub-classes need to have the switch view method */
	//p.switchView = function (){}
	//p.setDefaultView = function (){}

	window.DraggableBitmap = DraggableBitmap;
}(window));