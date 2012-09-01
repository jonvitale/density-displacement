(function (window)
{
	function BalanceModel (width_unit, height_unit, pan_width_unit)
	{
		this.width_unit = width_unit;
		this.height_unit = height_unit;
		this.pan_width_unit = pan_width_unit;
		this.width_px = width_unit * UNIT_TO_PIXEL;
		this.height_px = height_unit * UNIT_TO_PIXEL;
		this.pan_width_px = pan_width_unit * UNIT_TO_PIXEL;
		this.pan_width = this.pan_width_px;
		this.initialize();
	}
	var p = BalanceModel.prototype = new Container();
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;
	// some static constants
	p.MAX_TILT_ANGLE = Math.PI/2*0.8;
	p.BASE_WIDTH = 200;
	p.BASE_HEIGHT_EDGE = 5;
	p.BASE_HEIGHT = 20;
	p.STEM_WIDTH = 10;
	p.BEAM_HEIGHT = 10;
	p.BEAM_HEIGHT_EDGE = 2;
	p.BEAM_ARC_DY = 30;
	p.BEAM_MASS = 1000;
	p.PAN_DY = 100;
	p.PAN_HEIGHT = 4;
	p.PAN_MASS = 10;
	p.FRICTION_FACTOR_TO_VELOCITY = 0.01; // decrease velocity by this percent of total velocity
	

	p.initialize = function()
	{	
		this.Container_initialize();
		// each part of the Balance will have its own shape and graphics
		this.baseGraphics = new Graphics();
		this.baseShape = new Shape(this.baseGraphics);
		this.beamGraphics = new Graphics();
		this.beamShape = new Shape(this.beamGraphics);
		this.leftGraphics = new Graphics();
		this.leftShape = new Shape(this.leftGraphics);
		this.rightGraphics = new Graphics();
		this.rightShape = new Shape(this.rightGraphics);
		// straps for "holding" the balance in place
		this.strapsGraphics = new Graphics();
		this.strapsShape = new Shape(this.strapsGraphics);
		// shapes to show where to add objects
		this.addLeftGraphics = new Graphics();
		this.addLeftShape = new Shape(this.addLeftGraphics);
		this.addRightGraphics = new Graphics();
		this.addRightShape = new Shape(this.addRightGraphics);
		// text to go along with add shapes
		this.addLeftText = new Text("Add objects here", "1.0em Bold Arial", "#F00");
		this.addRightText = new Text("Add objects here", "1.0em Bold Arial", "#F00");
		
		this.addChild(this.baseShape);
		this.addChild(this.beamShape);
		this.addChild(this.leftShape);
		this.addChild(this.rightShape);
		this.addChild(this.strapsShape);
		this.addChild(this.addLeftShape);
		this.addChild(this.addRightShape);
		this.textShowing = false;

		
		// create arrays for masses on left and right pans
		this.leftObjects = new Array();
		this.rightObjects = new Array();

		// just an approximation
		this.MOMENT_OF_INTERTIA = (p.BEAM_MASS) * (this.width_px / UNIT_TO_PIXEL * this.width_px / UNIT_TO_PIXEL)/12;
		// Since the beam slopes down, get this angle
		this.BEAM_LENGTH_X = this.width_px/4;
		this.BEAM_LENGTH_Y = this.BEAM_ARC_DY;
		this.BEAM_LENGTH = Math.sqrt(this.BEAM_LENGTH_X*this.BEAM_LENGTH_X + this.BEAM_LENGTH_Y*this.BEAM_LENGTH_Y);
		this.BEAM_ANGLE = Math.tan(this.BEAM_LENGTH_Y/this.BEAM_LENGTH_X);
		this.tiltAngle = 0; 
		this.netTorque = 0;
		this.angularVelocity = 0;
		this.stopped = true;
		this.released = false;
		

		// some initial drawing and setting
		
		// draw base
		this.drawBase(this.baseGraphics);
		// draw beam, 0, 0 is bottom-center of beam
		this.drawBeam (this.beamGraphics);
		// draw left and right pans regestering (0,0) at point of connection to beam, move dependent on the rotation of the beam
		this.drawPan(this.leftGraphics);
		this.drawPan(this.rightGraphics);
		// draw once so we know where to put constraints
		this.placeObjectsInPans();

		this.addLeftShape.x = -this.width_px/4;
		this.addLeftShape.y = -this.height_px*0.2;
		this.addRightShape.x = this.width_px/4;
		this.addRightShape.y = -this.height_px*0.2;
		this.constraintsShowing = false;
		this.drawConstraints();
		
		update = true;
	}
	p.start = function()
	{
		this.releaseConstraints();
		this.updateNetTorque();
		this.released = true;
		this.stopped = false;
		update = true;
	}
	p.reset = function()
	{
		this.tiltAngle = 0;
		this.angularVelocity = 0;
		this.beamShape.rotation = 0;
		this.drawConstraints();
		this.updateNetTorque();
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
		var objectReleased = false;
		// check to see whether this object is already here, if so, pop it.
		for (var i = 0; i < this.leftObjects.length; i++)
		{
			if (o == this.leftObjects[i])
			{
				this.leftObjects.splice(i, 1);
				objectReleased = true;
			}
		}
		for (i = 0; i < this.rightObjects.length; i++)
		{
			if (o == this.rightObjects[i])
			{
				this.rightObjects.splice(i, 1);
				objectReleased = true;
			}
		}
		update = objectReleased;
		return objectReleased;
	}
	/** place an object if the scale is not released and point wihtin bounds of add shapes*/
	p.placeObject = function (o)
	{
		if (!this.released)
		{
			
			var o_lpoint = this.addLeftShape.globalToLocal(o.x, o.y);
			var o_rpoint = this.addRightShape.globalToLocal(o.x, o.y);
			if (this.addLeftShape.hitTest(o_lpoint.x, o_lpoint.y))
			{				
				this.leftObjects.push(o);
				this.placeObjectsInPans();
				update = true;
				return true;
			} else if (this.addRightShape.hitTest(o_rpoint.x, o_rpoint.y))
			{
				this.rightObjects.push(o);
				this.placeObjectsInPans();
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
		
		this.beamShape.y = 0;
		this.beamShape.x = 0;
		
		var angularAcceleration = this.netTorque / this.MOMENT_OF_INTERTIA;
		angularAcceleration = Math.abs(angularAcceleration) > 0.00001 ? angularAcceleration : 0;
		
		// USE THE NET TORQUE TO GET ROTATION OF BEAM
		if (this.isRunning())
		{
			// apply some friction
			this.angularVelocity -= this.angularVelocity * this.FRICTION_FACTOR_TO_VELOCITY;

			this.angularVelocity += angularAcceleration;
			this.angularVelocity = Math.abs(this.angularVelocity) > 0.00001 ? this.angularVelocity : 0; 

			var ptiltAngle = this.tiltAngle;
			this.tiltAngle += this.angularVelocity * 1/Ticker.getFPS();
			if ( Math.abs(this.tiltAngle) > this.MAX_TILT_ANGLE )
			{
				this.tiltAngle = this.MAX_TILT_ANGLE * (this.tiltAngle < 0 ? -1 : 1);
				this.angularVelocity = 0;
				this.stopped = true;
			} else if ( Math.abs (this.tiltAngle) < 0.00001)
			{
				this.tiltAngle = 0;
			}
			// adjust if necessary
			if (this.tiltAngle != ptiltAngle)
			{
				this.beamShape.rotation = this.tiltAngle * 180 / Math.PI;
			}

			this.placeObjectsInPans();

			this.updateNetTorque();
		}
		
		

		update = true;
	}

	//// PHYSICS-RELATED FUNCTIONS
	p.updateNetTorque = function ()
	{
		//console.log("before", this.netTorque);
		this.netTorque = 0;
		// get torque from each mass
		var dist;
		var angle;
		var o;
		var gpoint;
		if (this.leftObjects.length > 0)
		{
			for (i = 0; i < this.leftObjects.length; i++)
			{
				o = this.leftObjects[i];
				// what is the distance from the center of mass to the pivot point
				gpoint = this.localToGlobal(0, 0);
				this.netTorque += o.mass * (o.x-gpoint.x) / UNIT_TO_PIXEL;
			}
		}
		// get torque from each mass
		if (this.rightObjects.length > 0)
		{
			for (i = 0; i < this.rightObjects.length; i++)
			{
				o = this.rightObjects[i];
				// what is the distance from the center of mass to the pivot point
				gpoint = this.localToGlobal(0, 0);
				this.netTorque += o.mass * (o.x-gpoint.x) / UNIT_TO_PIXEL;
			}
		}
		// get additional torque from the pans
		this.netTorque += this.PAN_MASS * (this.leftShape.x) / UNIT_TO_PIXEL;
		this.netTorque += this.PAN_MASS * (this.rightShape.x) / UNIT_TO_PIXEL;
		this.netTorque = Math.abs(this.netTorque) > 0.00001 ? this.netTorque : 0;
		
		//console.log("after", this.netTorque);
	}

	p.isRunning = function ()
	{
		if (this.netTorque != 0 && !this.stopped)
		{
			return true;
		} else
		{
			return false;
		}
	}

	//////////////////// NITTY GRITTY DRAWING STUFF ///////////////////////
	p.drawBase = function(g)
	{
		g.clear();
		g.setStrokeStyle(0.5);
		g.beginStroke("#AA9900");
		g.beginLinearGradientFill(["rgba(150,150,50,1.0)", "rgba(200,200,50,1.0)", "rgba(250,250,50,1.0)", "rgba(200,200,50,1.0)", "rgba(150,150,50,1.0)"], [0, 0.25, 0.5, 0.75, 1], -this.BASE_WIDTH/2, 0, this.BASE_WIDTH/2, 0);
		g.moveTo(-this.BASE_WIDTH/2, this.height_px);
		g.lineTo(-this.BASE_WIDTH/2, this.height_px - this.BASE_HEIGHT_EDGE);
		g.lineTo(-this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.lineTo(+this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.lineTo(+this.BASE_WIDTH/2, this.height_px - this.BASE_HEIGHT_EDGE);
		g.lineTo(+this.BASE_WIDTH/2, this.height_px);
		g.lineTo(-this.BASE_WIDTH/2, this.height_px);
		//g.endStroke();

		g.beginLinearGradientFill(["rgba(150,150,50,1.0)",  "rgba(200,200,50,1.0)","rgba(250,250,50,1.0)",  "rgba(200,200,50,1.0)", "rgba(150,150,500,1.0)"], [0, 0.1, 0.5, 0.9, 1], -this.STEM_WIDTH/2, 0, this.STEM_WIDTH/2, 0);
		g.moveTo(-this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.lineTo(-this.STEM_WIDTH/2, this.BEAM_HEIGHT);
		g.lineTo(0, 0);
		g.lineTo(+this.STEM_WIDTH/2, this.BEAM_HEIGHT);
		g.lineTo(+this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.lineTo(-this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.endFill();

	}
	p.drawBeam = function (g)
	{
		g.clear();
		g.setStrokeStyle(1);
		g.beginStroke("#AA9900");
		g.beginFill("#DDCC00");
		g.moveTo(-this.BEAM_LENGTH_X, this.BEAM_ARC_DY);
		g.curveTo(-this.BEAM_LENGTH_X/2, this.BEAM_ARC_DY, 0, 0);
		g.curveTo(this.BEAM_LENGTH_X/2, this.BEAM_ARC_DY, this.BEAM_LENGTH_X, this.BEAM_ARC_DY);
		g.lineTo(this.BEAM_LENGTH_X, this.BEAM_ARC_DY-this.BEAM_HEIGHT_EDGE);
		g.curveTo(this.BEAM_LENGTH_X/2, this.BEAM_ARC_DY-this.BEAM_HEIGHT_EDGE, 0, -this.BEAM_HEIGHT);
		g.curveTo(-this.BEAM_LENGTH_X/2, this.BEAM_ARC_DY-this.BEAM_HEIGHT_EDGE, -this.BEAM_LENGTH_X, this.BEAM_ARC_DY-this.BEAM_HEIGHT_EDGE);
		g.lineTo(-this.BEAM_LENGTH_X, this.BEAM_ARC_DY);	
		g.endFill();
	}
	p.drawPan = function (g)
	{
		g.clear();
		g.setStrokeStyle(2);
		g.beginStroke("#AAAAAA");
		g.moveTo(-this.pan_width/2, 0);
		g.lineTo(0, -this.PAN_DY)
		g.moveTo(this.pan_width/2, 0);
		g.lineTo(0, -this.PAN_DY)
		g.beginFill("#CCCCCC");
		g.drawRect(-this.pan_width/2, 0, this.pan_width, this.PAN_HEIGHT);
		g.endFill();
	}
	p.placeObjectsInPans = function ()
	{
		this.leftShape.x = -this.BEAM_LENGTH * Math.cos(this.BEAM_ANGLE-this.tiltAngle);
		this.leftShape.y = this.BEAM_LENGTH * Math.sin(this.BEAM_ANGLE-this.tiltAngle) + this.PAN_DY;
		this.rightShape.x = this.BEAM_LENGTH * Math.cos(this.BEAM_ANGLE+this.tiltAngle);
		this.rightShape.y = this.BEAM_LENGTH * Math.sin(this.BEAM_ANGLE+this.tiltAngle) + this.PAN_DY;
		
		// draw the location of all the objects on the pans
		var o;
		var prev_height = 0;
		var l_bpoint = this.leftShape.localToGlobal(0, 0);
		for (var i = 0; i < this.leftObjects.length; i++)
		{
			o = this.leftObjects[i];
			o.x = l_bpoint.x;
			o.y = l_bpoint.y - o.viewable_height/2 - prev_height;
			prev_height = o.viewable_height;
		}
		prev_height = 0;
		var r_bpoint = this.rightShape.localToGlobal(0, 0);
		for (i = 0; i < this.rightObjects.length; i++)
		{
			o = this.rightObjects[i];
			o.x = r_bpoint.x;
			o.y = r_bpoint.y - o.viewable_height/2 - prev_height;
			prev_height = o.viewable_height;
		}
		
	}
	p.drawConstraints = function ()
	{
		if (!this.constraintsShowing)
		{
			var g = this.strapsGraphics;
			g.setStrokeStyle(4);
			var pan_x = this.BEAM_LENGTH * Math.cos(this.BEAM_ANGLE);
			var y_top = this.BEAM_LENGTH * Math.sin(this.BEAM_ANGLE) + this.PAN_DY;
			var y_bot = this.height_px;
			// left strap
			g.beginLinearGradientStroke(["rgba(100,100,50,1.0)", "rgba(150,150,100,1.0)","rgba(250,250,200,1.0)", "rgba(150,150,100,1.0)", "rgba(100,100,50,1.0)"], [0, 0.1, 0.5, 0.9, 1], -pan_x-2, y_top, -pan_x+2, y_top);
			g.moveTo(-pan_x, y_top);
			g.lineTo(-pan_x, y_bot);
			g.endStroke();

			// right Strap
			g.beginLinearGradientStroke(["rgba(100,100,50,1.0)", "rgba(150,150,100,1.0)","rgba(250,250,200,1.0)", "rgba(150,150,100,1.0)", "rgba(100,100,50,1.0)"], [0, 0.1, 0.5, 0.9, 1], pan_x-2, y_top, pan_x+2, y_top);
			g.moveTo(pan_x, y_top);
			g.lineTo(pan_x, y_bot);
			g.endStroke();

			// place add left and right boxes
			g = this.addLeftGraphics;
			g.beginFill("rgba(0,255,0,0.5)");
			g.drawRect(-this.width_px/2*0.8/2, 0, this.width_px/2*0.8, this.height_px*0.8);
			g.endFill();
			
			g = this.addRightGraphics;
			g.beginFill("rgba(0,255,0,0.5)");
			g.drawRect(-this.width_px/2*0.8/2, 0, this.width_px/2*0.8, this.height_px*0.8);
			g.endFill();		

			this.addLeftText.x = -this.width_px*3/9;
			this.addLeftText.y = -this.height_px*0.1;
			this.addChild(this.addLeftText);
			this.addRightText.x = this.width_px*2/11;
			this.addRightText.y = -this.height_px*0.1;
			this.addChild(this.addRightText);	

			this.constraintsShowing = true;
		}
	}

	p.releaseConstraints = function ()
	{
		this.strapsGraphics.clear();
		this.addLeftGraphics.clear();
		this.addRightGraphics.clear();
		this.removeChild(this.addLeftText);
		this.removeChild(this.addRightText);
		this.constraintsShowing = false;
	}
	window.BalanceModel = BalanceModel;
}(window));