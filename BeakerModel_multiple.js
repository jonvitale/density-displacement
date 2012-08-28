(function (window)
{
	function BeakerModel (diameter_unit, height_unit, water_volume_perc, fluid_density)
	{
		this.diameter_unit = diameter_unit;
		this.height_unit = height_unit;
		this.diameter_px = diameter_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.volume = diameter_unit/2*diameter_unit/2 * height_unit * Math.PI;
		this.water_volume = this.volume * water_volume_perc;
		this.remaining_volume = this.volume - this.water_volume;
		this.init_water_y = this.height_px - water_volume_perc * this.height_px;
		this.water_y = this.init_water_y;		
		this.fluid_density = (typeof fluid_density === "undefined") ? 1.0 : fluid_density;
		this.initialize();
	}
	var p = BeakerModel.prototype = new Container();
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;
	p.FRICTION_FACTOR_TO_VELOCITY = 0.01; // decrease velocity by this percent of total velocity
	p.G = 98; // gravity in cm/s
	
	p.initialize = function()
	{	
		this.Container_initialize();
		this.waterGraphics = new Graphics();
		this.waterShape = new Shape(this.waterGraphics);
		this.baseGraphics = new Graphics();
		this.baseShape = new Shape(this.baseGraphics);
		this.drawBase(this.baseGraphics);
		this.lidGraphics = new Graphics();
		this.lidShape = new Shape(this.lidGraphics);
		// shapes to show where to add objects
		this.addGraphics = new Graphics();
		this.addShape = new Shape(this.addGraphics);
		// text to go along with add shapes
		this.addText = new Text("Add objects here", "1.0em Bold Arial", "#F00");
		
		// add to display
		this.addChild(this.waterShape);
		this.addChild(this.baseShape);
		this.addChild(this.lidShape);
		this.addChild(this.addShape);
		
		// create arrays for masses on left and right pans
		this.objects = new Array();
		
		this.stopped = true;
		this.released = false;
		
		this.redraw();
	}
	p.start = function()
	{
		this.released = true;
		this.stopped = false;
		this.redraw();
	}
	p.reset = function()
	{
		for (var i = 0; i < objects.length; i++)
		{
			objects[i].velocity = 0;
		}
		//temporarily unstop so we can adjust
		this.stopped = false;
		this.redraw();
		this.stopped = true;
		this.released = false;
		
	} 
	/** If this object is currently on a pan take it off and adjust other shapes accordingly */
	p.releaseObject = function (o)
	{
		var objectReleased = false;
		// check to see whether this object is already here, if so, pop it.
		for (var i = 0; i < this.objects.length; i++)
		{
			if (o == this.objects[i])
			{
				this.objects.splice(i, 1);
				objectReleased = true;
			}
		}
		return objectReleased;
	}
	/** place an object if the scale is not released and point wihtin bounds of add shapes*/
	p.placeObject = function (o)
	{
		if (!this.released)
		{			
			var o_point = this.addShape.globalToLocal(o.x, o.y);
			if (this.addShape.hitTest(o_point.x, o_point.y))
			{				
				this.objects.push(o);
				this.redraw();
				update = true;
				return true;
			} else
			{
				return false;
			}
		} else
		{
			return false;
		}
	}

	p._tick = function ()
	{
		this.Container_tick();
		this.redraw();
	}

	p.redraw = function()
	{
		this.updateWaterHeight();

		
		// USE THE NET TORQUE TO GET ROTATION OF BEAM
		if (this.isRunning())
		{
			
			// get force on each object and update position
			var o;
			var acceleration;
			var force;
			var global_height = this.localToGlobal(0, this.height_px).y;

			for (var i=0; i < this.objects.length; i++)
			{
				o = this.objects[i];
				o.velocity -= o.velocity * this.FRICTION_FACTOR_TO_VELOCITY;
				console.log("before", o.velocity);
				force = this.getNetForce(o);
				acceleration = force/o.mass;
				acceleration = Math.abs(acceleration) > 0.00001 ? acceleration : 0;
				o.velocity += acceleration;
				o.velocity = Math.abs(o.velocity) > 0.00001 ? o.velocity : 0; 
				o.y += o.velocity * 1/Ticker.getFPS();
				if (o.y + o.viewable_height/2 > global_height)
				{
					o.y = global_height - o.viewable_height/2;
					o.velocity = 0;
				}
				console.log("after", o.velocity, force);
				
			}
		}

		// draw water
		var g = this.waterGraphics;
		g.beginFill("rgba(220,220,255,0.5)");
		g.drawRect(-this.diameter_px/2, this.water_y, this.diameter_px, this.height_px-this.water_y);
		g.endFill();
		

		// draw straps if not releaseed		
		this.lidGraphics.clear();
		this.addGraphics.clear();
		if (!this.released)
		{
			var o;
			var prev_height = 0;
			var gpoint = this.localToGlobal(0, 0);
			for (var i = 0; i < this.objects.length; i++)
			{
				o = this.objects[i];
				o.x = gpoint.x;
				o.y = gpoint.y - o.viewable_height/2 - prev_height;
				prev_height = o.viewable_height;
			}
			
			// not my best work here
			p.drawConstraints(this.lidGraphics, this.addGraphics, this.diameter_px, this.height_px);
			this.addShape.x = -this.diameter_px/4*0.8;
			this.addShape.y = -this.height_px/2;

			if (!this.textShowing)
			{
				this.textShowing = true;
				this.addText.x = -this.diameter_px*3/9;
				this.addText.y = -this.height_px*0.1;
				this.addChild(this.addText);
			}
		} else 
		{
			if (this.textShowing)
			{
				this.textShowing = false;
				this.removeChild(this.addText);
			}
		}
		update = true;
	}	

	//// PHYSICS-RELATED FUNCTIONS
	/** What percent of this object is in the fluid */
	p.getPercentInFluid = function(o)
	{
		var lpoint = this.globalToLocal(o.x, o.y);
		if (lpoint.y - o.viewable_height/2 > this.water_y)
		{
			o.percentInFluid = 1;
		} else if (lpoint.y + o.viewable_height/2 < this.water_y)
		{
			o.percentInFluid = 0;
		} else
		{
			o.percentInFluid = (lpoint.y + o.viewable_height/2 - this.water_y)/o.viewable_height;
		}
		return o.percentInFluid;
	}
	p.updateWaterHeight = function()
	{
		this.volume_objects_water = 0;
		for (var i=0; i < this.objects.length; i++)
		{
			var o = this.objects[i];
			this.volume_objects_water += o.volume * this.getPercentInFluid(o);
		}
		this.water_y = this.height_px - (this.water_volume+this.volume_objects_water)/this.volume * this.height_px;
	}
	p.getNetForce = function (o)
	{
		//console.log("before", this.netTorque);
		var netForce = 0;
		// get torque from each mass
		var dist;
		var angle;
		var gpoint;
		// force of gravity acting down on objects, water acting up
		netForce += o.mass * this.G;
		netForce -= this.fluid_density * o.volume * this.getPercentInFluid(o) * this.G;
		return (netForce);
		//console.log("after", this.netTorque);
	}

	p.isRunning = function ()
	{
		if (!this.stopped)
		{
			// check to see if all the objects are in the water and are not moving
			for (var i=0; i < this.objects.length; i++)
			{
				var o = this.objects[i];
				if (this.getPercentInFluid(o) == 0)
				{
					return true;
				} else
				{
					if (o.velocity != 0)
					{
						return true;
					}
				}
			}
			return false;
		} else
		{
			return false;
		}
	}

	//////////////////// NITTY GRITTY DRAWING STUFF ///////////////////////
	p.drawBase = function(g)
	{
		g.clear();
		g.setStrokeStyle(1);
		g.beginStroke("rgba(127,127,127,1)");
		g.beginLinearGradientFill(["rgba(127,127,127,0.6)", "rgba(200,200,200,0.4)","rgba(255,255,255,0.2)", "rgba(200,200,200,0.5)", "rgba(127,127,127,0.8)"], [0, 0.1, 0.5, 0.9, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
		g.drawRect(-this.diameter_px/2, 0, this.diameter_px, this.height_px);200,200,200
		g.endFill();
	}
	p.drawConstraints = function (lidsg, addg, width, height)
	{
		var g = lidsg;
		g.setStrokeStyle(2);
		g.beginStroke("#FF0000");
		// left strap
		g.moveTo(-width/2, 0);
		g.lineTo(width/2, 0);
		
		// place add left and right boxes
		g = addg;
		g.beginFill("rgba(0,255,0,0.5)");;
		g.drawRect(-width/2*0.8/2, 0, width*0.8, height*0.8);
		g.endFill();
		
			
	}
	window.BeakerModel = BeakerModel;
}(window));
