(function (window)
{
	/** Construct boundaries for this object*/
	var DraggableContainer = function()
	{
		this.initialize();
	}
	var p = DraggableContainer.prototype = new Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function()
	{
		this.Container_initialize();
		this.min_x = 0;
		this.min_y = 0;
		this.max_x = 0;
		this.max_y = 0;
		this.viewable_width = 0;
		this.viewable_height = 0;
		this.areBoundsSet = false;
	}

	p._tick = function ()
	{
		this.Container_tick();
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
				//this.setDefaultView();
				//releaseObjectFromContainer (this);
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
		}(DraggableContainer.prototype));
	}
	/** Sub-classes need to have the switch view method */
	//p.switchView = function (){}
	//p.setDefaultView = function (){}

	window.DraggableContainer = DraggableContainer;
}(window));