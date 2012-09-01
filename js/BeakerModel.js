(function (window)
{
	/** The beaker that can show displacement of water.  Currently one object at a time. */
	function BeakerModel (volume_unit, height_unit, water_volume_perc, fluid_density)
	{
		this.volume_unit = volume_unit;
		this.height_unit = height_unit;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.diameter_unit = Math.sqrt(volume_unit/(height_unit * Math.PI)) * 2;
		this.diameter_px = this.diameter_unit * UNIT_TO_PIXEL;
		this.water_volume = this.volume_unit * water_volume_perc;
		this.total_volume = this.water_volume;
		this.remaining_volume = this.volume_unit - this.water_volume;
		this.init_water_y = this.height_px - water_volume_perc * this.height_px;
		this.water_y = this.init_water_y;		
		this.fluid_density = (typeof fluid_density === "undefined") ? 1.0 : fluid_density;
		this.initialize();
	}
	var p = BeakerModel.prototype = new Container();
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;
	p.NUM_RULER_TICKS = 5;
	p.SEC_PER_FRAME = 1/Ticker.getFPS();
	p.DRAG_COEF = 5.0; // decrease velocity by this percent of total velocity
	p.FRICTION_FACTOR_TO_VELOCITY = 0.01; // decrease velocity by this percent of total velocity
	p.IMPACT_FACTOR_TO_VELOCITY = 0;//0.25;
	p.FORCE_SLOW_FACTOR = 3;
	p.G = 980 ; // gravity in unit/s^2
	p.STEPS_PER_FRAME = 10;

	p.initialize = function()
	{	
		this.Container_initialize();
		this.waterGraphics = new Graphics();
		this.waterShape = new Shape(this.waterGraphics);
		this.waterLineGraphics = new Graphics();
		this.waterLineShape = new Shape(this.waterLineGraphics);

		this.baseGraphics = new Graphics();
		this.baseShape = new Shape(this.baseGraphics);
		this.rulerGraphics = new Graphics();
		this.rulerShape = new Shape(this.rulerGraphics);
		this.pointerGraphics = new Graphics();
		this.pointerShape = new Shape(this.pointerGraphics);
		this.pointerText = new Text(Math.round(this.total_volume), "1.0em Bold Arial", "#222");

		// for adding
		// shapes to show where to add objects
		this.addGraphics = new Graphics();
		this.addShape = new Shape(this.addGraphics);
		// text to go along with add shapes
		this.addText = new Text("Add objects here", "1.0em Bold Arial", "#F00");

		
		// add to display
		this.addChild(this.waterShape);
		this.addChild(this.waterLineShape);
		this.addChild(this.baseShape);
		this.addChild(this.rulerShape);
		this.addChild(this.addShape);
		this.addChild(this.pointerShape);
		this.addChild(this.pointerText);
		
		// initial drawing
		this.drawBase();
		// draw water line
		this.waterLineGraphics.setStrokeStyle(1);
		this.waterLineGraphics.beginLinearGradientStroke(["rgba(50,50,255,1.0)", "rgba(100,100,255,1.0)","rgba(200,200,255,1.0)", "rgba(100,100,255,1.0)", "rgba(50,50,255,1.0)"], [0, 0.1, 0.5, 0.9, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
		this.waterLineGraphics.moveTo(-this.diameter_px/2, 0);
		this.waterLineGraphics.lineTo(this.diameter_px/2, 0);
		// draw pointer to water line
		this.pointerGraphics.setStrokeStyle(1);
		this.pointerGraphics.beginStroke("rgba(100, 100, 100, 1)");
		this.pointerGraphics.moveTo(0, 0);
		this.pointerGraphics.lineTo(10, -10);
		this.pointerGraphics.lineTo(40, -10);
		this.pointerGraphics.lineTo(40, 10);
		this.pointerGraphics.lineTo(10, 10);
		this.pointerGraphics.lineTo(0, 0);
		this.pointerGraphics.endStroke();
		
		// place add left and right boxes
		this.drawConstraints();
		

		// create arrays for masses on left and right pans
		this.object = null;
		this.objectParent = null;
		
		this.stopped = true;
		this.released = false;
		
		update = true;
	}
	p.start = function()
	{
		this.released = true;
		this.stopped = false;
		update = true;
	}
	p.reset = function()
	{
		if (this.object != null)
			this.object.velocity = 0;
		
		//temporarily unstop so we can adjust
		this.stopped = false;
		this.redraw();
		this.stopped = true;
		this.released = false;
		update = true;
	} 
	/** If this object is currently on a pan take it off and adjust other shapes accordingly */
	p.releaseObject = function (o)
	{
		// check to see whether this object is already here, if so, pop it.
		if (o == this.object)
		{
			var gpoint = this.localToGlobal(0, 0);
			var lpoint = new Point(this.object.x, this.object.y);
			this.removeChild(this.object);
			this.objectParent.addChild(this.object);
			this.object.x = gpoint.x + lpoint.x;
			this.object.y = gpoint.y + lpoint.y;
			this.object = null;
			this.objectParent = null;
			update = true;
			this.drawConstraints();
			return true;
		}
		return false;
	}
	/** place an object if the scale is not released and point wihtin bounds of add shapes*/
	p.placeObject = function (o)
	{
		if (!this.released && this.object == null)
		{			
			var o_point = this.addShape.globalToLocal(o.x, o.y);
			if (this.addShape.hitTest(o_point.x, o_point.y))
			{				
				this.object = o;
				this.objectParent = this.object.parent; // store for future use
				// add the shape to this context, place behind everything else
				this.addChildAt(o, 0);
				this.object.x = 0;
				this.object.y = -this.height_px/8 - 10 - o.viewable_height/2;
				this.releaseConstraints();
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
		if(this.object != null) var prevPercentInFluid = this.object.percentInFluid;
		
			
		// if an object is present determine its location from forces
		if (this.object != null && this.isRunning())
		{			
			var o = this.object;
			
			var i;
			var fluid_mass;
			var acceleration;
			var dy;
			for (i=0; i < this.STEPS_PER_FRAME; i++)
			{
				this.updateWaterHeight(); // updates water and the percent of object in water
			
				// on impact decrease velocity
				if (o.impact)o.velocity -= o.velocity * this.IMPACT_FACTOR_TO_VELOCITY;
				
				// apply friction in the water
				if (o.percentInFluid > 0) o.velocity -= o.velocity * this.FRICTION_FACTOR_TO_VELOCITY;// * o.percentInFluid;

				this.updateNetForce(o);
				
				//divide force by some constant?
				acceleration = o.current_net_force/(o.mass*this.FORCE_SLOW_FACTOR);
				//fluid_mass = o.volume*o.percentInFluid * this.fluid_density;
				//acceleration = this.G/this.FORCE_SLOW_FACTOR * (o.mass - fluid_mass) / (o.mass + fluid_mass);
				console.log("accel", acceleration);
				//acceleration = Math.abs(acceleration) > 0.00001 ? acceleration : 0;
				dy = o.velocity * this.SEC_PER_FRAME/this.STEPS_PER_FRAME + 0.5 * acceleration * this.SEC_PER_FRAME * this.SEC_PER_FRAME  / (this.STEPS_PER_FRAME*this.STEPS_PER_FRAME);
				//dy = Math.abs(dy) > 0.00001 ? dy : 0;
				o.y += dy * UNIT_TO_PIXEL;
				o.velocity = dy / (this.SEC_PER_FRAME / this.STEPS_PER_FRAME);
				o.velocity = Math.abs(o.velocity) > 0.0001 && Math.abs(o.current_balance_force) > .0001 ? o.velocity : 0; 
				console.log("calc vel", o.velocity,  "dy", dy, "SEC_PER_FRAME", this.SEC_PER_FRAME, "STeps", this.STEPS_PER_FRAME);
				
			}
			if (o.y + o.viewable_height/2 > this.height_px)
			{
				o.y = this.height_px - o.viewable_height/2;
				o.velocity = -.001; // small upward velocity
			}
		}

		// draw water
		var g = this.waterGraphics;
		g.clear();
		g.beginLinearGradientFill(["rgba(100,100,255,0.3)", "rgba(150,150,255,0.3)","rgba(200,200,255,0.3)", "rgba(150,150,255,0.3)", "rgba(100,100,255,0.3)"], [0, 0.1, 0.5, 0.9, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
		g.drawRect(-this.diameter_px/2, this.water_y, this.diameter_px, this.height_px-this.water_y);
		g.endFill();
		this.waterLineShape.x = 0;
		this.waterLineShape.y = this.water_y;

		// draw a pointer to the current position 
		this.pointerShape.x = this.diameter_px/2+2;
		this.pointerShape.y = this.water_y;
		this.pointerText.text = Math.round(this.total_volume);
		this.pointerText.x = this.pointerShape.x + 10;
		this.pointerText.y = this.pointerShape.y + 5;
		
		
		update = true;
	}	

	//// PHYSICS-RELATED FUNCTIONS
	/** What percent of this object is in the fluid */
	p.updatePercentInFluid = function(o)
	{
		//var water_y = this.init_water_y;
		var water_y = this.water_y;
		//console.log("water_y", water_y, )
		if (o.y - o.viewable_height/2 > water_y)
		{
			if (o.percentInFluid == 0) {o.impact = true} else {o.impact = false;}
			o.percentInFluid = 1;
		} else if (o.y + o.viewable_height/2 < water_y)
		{
			o.impact = false;
			o.percentInFluid = 0;
		} else
		{
			if (o.percentInFluid == 0) {o.impact = true} else {o.impact = false;}
			o.percentInFluid = (o.y + o.viewable_height/2 - water_y)/o.viewable_height;
		}
		return o.percentInFluid;
	}
	p.updateWaterHeight = function()
	{
		this.volume_unit_objects_water = 0;
		if (this.object != null)	
			this.volume_unit_objects_water += this.object.volume * this.updatePercentInFluid(this.object);
		
		this.total_volume = this.water_volume+this.volume_unit_objects_water;
		this.water_y = this.height_px - this.total_volume/this.volume_unit * this.height_px;
	}
	p.updateNetForce = function (o)
	{
		//console.log("before", this.netTorque);
		// get torque from each mass
		var dist;
		var angle;
		var gpoint;
		// force of gravity acting down on objects, water acting up
		o.current_gravity_force =  o.mass * this.G;
		o.current_balance_force = o.current_gravity_force - this.fluid_density * o.volume * o.percentInFluid * this.G;
		o.current_fluid_force = 2 * this.G * o.mass * this.fluid_density * o.volume * o.percentInFluid / (o.mass + this.fluid_density*o.percentInFluid*o.volume);
		o.current_net_force = o.current_gravity_force - o.current_fluid_force;
		
		// drago.current_gravity_force + 
		//console.log("percent", o.percentInFluid, "drag: o.volume", o.volume, "o.area", o.bottom_area, o.top_area,"G", this.G, "v^2", Math.pow(o.velocity,2));
		if (o.velocity > 0)
		{
			o.current_drag_force = this.DRAG_COEF * 0.5 * Math.ceil(o.percentInFluid) * this.fluid_density * o.bottom_area * o.velocity * o.velocity;
			o.current_net_force -= o.current_drag_force;
		} else
		{
			o.current_drag_force = this.DRAG_COEF * 0.5 * Math.ceil(o.percentInFluid) * this.fluid_density * o.top_area * o.velocity * o.velocity;
			o.current_net_force += o.current_drag_force;
		}
		console.log("forces: gravity", o.current_gravity_force, "boyouncy", o.current_fluid_force, "drag", o.current_drag_force, "net", o.current_net_force, "balance", o.current_balance_force);
	}

	p.isRunning = function ()
	{
		if (!this.stopped && this.object != null)
		{
			// check to see if all the objects are in the water and are not moving
			var o = this.object;
			if (o.percentInFluid == 0)
			{
				return true;
			} else
			{
				if (o.velocity != 0)
				{
					return true;
				} else
				{
					return false;
				}
			}	
		} else
		{
			return false;
		}
	}

	//////////////////// NITTY GRITTY DRAWING STUFF ///////////////////////
	p.drawBase = function()
	{
		var g = this.baseGraphics;
		g.clear();
		// rim
		g.beginLinearGradientFill(["rgba(56,56,56,0.6)", "rgba(100,100,100,0.4)","rgba(127,127,127,0.2)", "rgba(100,100,100,0.4)", "rgba(56,56,56,0.6)"], [0, 0.1, 0.5, 0.9, 1], 0, -this.height_px/8-10, 0, -this.height_px/8);
		g.drawRoundRect(-this.diameter_px/2-4, -this.height_px/8-10, this.diameter_px+8, 10, 4);
		g.endFill();
		// cylinder
		g.setStrokeStyle(1);
		g.beginLinearGradientFill(["rgba(127,127,127,0.2)", "rgba(200,200,200,0.2)","rgba(225,225,255,0.3)", "rgba(200,200,200,0.2)", "rgba(127,127,127,0.2)"], [0, 0.1, 0.5, 0.9, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
		g.beginLinearGradientStroke(["rgba(127,127,127,0.5)", "rgba(200,200,200,0.4)","rgba(255,255,255,0.3)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.5)"], [0, 0.1, 0.5, 0.9, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
		g.drawRect(-this.diameter_px/2, -this.height_px/8, this.diameter_px, this.height_px+this.height_px/8);
		g.endFill();
		g.endStroke();
		// draw a ruler
		g = this.rulerGraphics;
		g.clear();
		g.setStrokeStyle(1);
		g.beginLinearGradientStroke(["rgba(56,56,56,0.6)", "rgba(100,100,100,0.4)","rgba(127,127,127,0.2)", "rgba(100,100,100,0.4)", "rgba(56,56,56,0.6)"], [0, 0.1, 0.5, 0.9, 1], -this.diameter_px/2, 0, this.diameter_px/2, 0);
	 	var text;
	 	var vstr;
		for (var i=0; i < this.NUM_RULER_TICKS; i++)
		{
			g.moveTo(-this.diameter_px/2, this.height_px*i/this.NUM_RULER_TICKS);
			g.lineTo(this.diameter_px/2, this.height_px*i/this.NUM_RULER_TICKS);
			vstr = Math.round(this.volume_unit - (this.volume_unit * i / this.NUM_RULER_TICKS));
			text = new Text(vstr, "1.0em Bold Arial", "#888");
			text.x = this.diameter_px/2*2/3;
			text.y = this.height_px*i/this.NUM_RULER_TICKS + 5; 
			this.addChild(text);
		}
	}
	p.drawConstraints = function ()
	{
		g = this.addGraphics;
		g.beginFill("rgba(0,255,0,0.5)");;
		g.drawRect(-this.diameter_px/2*0.8/2, 0, this.diameter_px*0.8, this.height_px*0.6);
		g.endFill();
		this.addShape.x = -this.diameter_px/4*0.8;
		this.addShape.y = -this.height_px/3;
		this.textShowing = true;
		this.addText.x = -this.diameter_px*3/9;
		this.addText.y = -this.height_px*0.2;
		this.addChild(this.addText);
	}
	p.releaseConstraints = function ()
	{
		this.addGraphics.clear();
		this.removeChild(this.addText);
	}
	window.BeakerModel = BeakerModel;
}(window));
