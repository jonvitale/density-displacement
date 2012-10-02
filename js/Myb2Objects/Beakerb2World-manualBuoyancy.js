(function (window)
{

	function Beakerb2World (width_px, height_px, world_dx, world_dy, beaker_width_px, beaker_height_px, beaker_depth_px, view_sideAngle, view_topAngle, water_volume_perc, fluid_density)
	{
		this.initialize (width_px, height_px, world_dx, world_dy, beaker_width_px, beaker_height_px, beaker_depth_px, view_sideAngle, view_topAngle, water_volume_perc, fluid_density);
	} 

	var p = Beakerb2World.prototype = new Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;
	p.NUM_BACK_OBJECTS = 4;
	p.WALL_THICKNESS = 4;
	p.BEAKER_WALL_THICKNESS = 2;
	p.NUM_RULER_TICKS = 10;

	// constants
	
	p.initialize = function (width_px, height_px, world_dx, world_dy, beaker_width_px, beaker_height_px, beaker_depth_px, view_sideAngle, view_topAngle, water_volume_perc, fluid_density)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.world_dx = world_dx;
		this.world_dy = world_dy;
		this.view_sideAngle = view_sideAngle;
		this.view_topAngle = view_topAngle;
		var width_from_depth = this.width_from_depth = beaker_depth_px * Math.sin(view_sideAngle);
		var height_from_depth = this.height_from_depth = beaker_depth_px * Math.sin(view_topAngle);
		this.beaker_width_px = beaker_width_px;
		this.beaker_height_px = beaker_height_px;
		this.beaker_depth_px = beaker_depth_px;
		this.beaker_bottom_dy = 5;
		this.water_volume_perc = water_volume_perc;
		this.fluid_density = fluid_density;
		this.init_beaker_water_y = (1 - water_volume_perc) * this.beaker_height_px;
		this.beaker_water_y = this.init_beaker_water_y;

		g = this.g = new Graphics();
		this.shape = new Shape(g);
		this.addChild(this.shape);

		g.beginFill("rgba(220, 220, 255, 1.0)");
		g.drawRect(0, 0, this.width_px, this.height_px);
		g.endFill();
		//draw floor
		g.beginFill("rgba(200, 200, 150, 1.0)");
		g.drawRect(0, this.height_px-100, this.width_px, 100);
		g.endFill();

		this.backWaterGraphics = new Graphics();
		this.backWaterShape = new Shape(this.backWaterGraphics);
		this.backWaterLineGraphics = new Graphics();
		this.backWaterLineShape = new Shape(this.backWaterLineGraphics);
		this.backGraphics = new Graphics();
		this.backShape = new Shape(this.backGraphics);
		this.frontWaterGraphics = new Graphics();
		this.frontWaterShape = new Shape(this.frontWaterGraphics);
		this.frontWaterLineGraphics = new Graphics();
		this.frontWaterLineShape = new Shape(this.frontWaterLineGraphics);
		this.frontGraphics = new Graphics();
		this.frontShape = new Shape(this.frontGraphics);
		this.rulerGraphics = new Graphics();
		this.rulerShape = new Shape(this.rulerGraphics);
		this.pointerGraphics = new Graphics();
		this.pointerShape = new Shape(this.pointerGraphics);
		this.pointerText = new Text(Math.round(this.total_volume), "1.0em Bold Arial", "#222");

		// add to display
		this.addChild(this.backShape);
		this.addChild(this.backWaterShape);
		this.addChild(this.backWaterLineShape);
		//this.addChild(this.frontWaterLineShape);
		this.addChild(this.frontWaterShape);
		this.addChild(this.frontShape);
		this.addChild(this.rulerShape);
		this.addChild(this.addShape);
		
		this.frontShape.x = this.width_px/2; this.frontShape.y = this.height_px - this.beaker_bottom_dy - this.BEAKER_WALL_THICKNESS/2 - this.beaker_height_px;
		this.frontWaterShape.x = this.width_px/2; this.frontWaterShape.y = this.height_px - this.beaker_bottom_dy - this.BEAKER_WALL_THICKNESS - this.beaker_height_px;
		this.frontWaterLineShape.x = this.width_px/2; this.frontWaterLineShape.y = this.height_px - this.beaker_bottom_dy - this.BEAKER_WALL_THICKNESS - this.beaker_height_px;
		this.backShape.x = this.frontShape.x + this.width_from_depth; this.backShape.y = this.frontShape.y - this.height_from_depth;
		this.backWaterShape.x = this.frontWaterShape.x + this.width_from_depth; this.backWaterShape.y = this.frontWaterShape.y - this.height_from_depth;
		this.backWaterLineShape.x = this.frontWaterLineShape.x + this.width_from_depth; this.backWaterLineShape.y = this.frontWaterLineShape.y - this.height_from_depth;
				
		this.rulerShape.x = this.width_px/2 + -this.beaker_width_px/2;
		this.pointerShape.x = this.width_px/2 + this.beaker_width_px/2+2;
		this.pointerText.x = this.pointerShape.x + 10;
		
		// draw water line
		g = this.backWaterLineGraphics;
		//g.setStrokeStyle(1);
		g.beginLinearGradientFill(["rgba(100,100,255,0.6)", "rgba(150,150,255,0.6)","rgba(175,175,255,0.6)", "rgba(150,150,255,0.6)", "rgba(100,100,255,0.6)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2-this.width_from_depth*3/4, 0, this.beaker_width_px/2-this.width_from_depth*3/4, 0);
		g.moveTo(-this.beaker_width_px/2, 0);
		g.lineTo(this.beaker_width_px/2, 0);
		g.lineTo(this.beaker_width_px/2 - this.width_from_depth*4/4, this.height_from_depth*4/4);
		g.lineTo(-this.beaker_width_px/2 - this.width_from_depth*4/4, this.height_from_depth*4/4);
		g.lineTo(-this.beaker_width_px/2, 0)
		g.endFill();

		// initial drawing
		var g = this.backGraphics;
		g.clear();
		// rim
		g.setStrokeStyle(1);
		//g.beginLinearGradientFill(["rgba(56,56,56,0.6)", "rgba(100,100,100,0.4)","rgba(127,127,127,0.2)", "rgba(100,100,100,0.4)", "rgba(56,56,56,0.6)"], [0, 0.1, 0.5, 0.9, 1], 0, -this.height_px/8-10, 0, -this.height_px/8);
		//g.drawRoundRect(-this.beaker_width_px/2-4, this.height_px-this.beaker_bottom_dy-this.beaker_height_px, this.beaker_width_px+8, 4, 4);
		//g.drawEllipse(-this.beaker_width_px/2-4, this.height_px-this.beaker_height_px-8-10, this.beaker_width_px+8, 16);
		//g.endFill();
		// cylinder
		g.setStrokeStyle(this.BEAKER_WALL_THICKNESS);
		g.beginLinearGradientFill(["rgba(127,127,127,0.4)", "rgba(200,200,200,0.4)","rgba(225,225,255,0.5)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.4)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
		g.beginLinearGradientStroke(["rgba(127,127,127,0.5)", "rgba(200,200,200,0.4)","rgba(255,255,255,0.3)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.5)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
		g.drawRect(-this.beaker_width_px/2, 0, this.beaker_width_px, this.beaker_height_px+this.BEAKER_WALL_THICKNESS);
		g.endFill();
		// draw left side wall
		g.beginLinearGradientFill(["rgba(127,127,127,0.4)", "rgba(200,200,200,0.4)","rgba(225,225,255,0.5)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.4)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2-this.width_from_depth, 0, -this.beaker_width_px/2, 0);
		g.moveTo(-this.beaker_width_px/2, 0);
		g.lineTo(-this.beaker_width_px/2 - this.width_from_depth, this.height_from_depth);
		g.lineTo(-this.beaker_width_px/2 - this.width_from_depth, this.beaker_height_px+this.BEAKER_WALL_THICKNESS+this.height_from_depth);
		g.lineTo(-this.beaker_width_px/2, this.beaker_height_px+this.BEAKER_WALL_THICKNESS);
		g.lineTo(-this.beaker_width_px/2, 0);
		g.endFill();
		g.endStroke();
		
		// draw water line, actually half the top suface
		g = this.frontWaterLineGraphics;
		//g.setStrokeStyle(1);
		g.beginLinearGradientFill(["rgba(100,100,255,0.6)", "rgba(150,150,255,0.6)","rgba(175,175,255,0.6)", "rgba(150,150,255,0.6)", "rgba(100,100,255,0.6)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2+this.width_from_depth*1/4, 0, this.beaker_width_px/2+this.width_from_depth*1/4, 0);
		g.moveTo(-this.beaker_width_px/2, 0);
		g.lineTo(this.beaker_width_px/2, 0);
		g.lineTo(this.beaker_width_px/2 + this.width_from_depth/4, -this.height_from_depth/4);
		g.lineTo(-this.beaker_width_px/2 + this.width_from_depth/4, -this.height_from_depth/4);
		g.lineTo(-this.beaker_width_px/2, 0)
		g.endFill();

		// initial drawing
		var g = this.frontGraphics;
		g.clear();
		// rim
		//g.setStrokeStyle(1);
		//g.beginLinearGradientFill(["rgba(56,56,56,0.6)", "rgba(100,100,100,0.4)","rgba(127,127,127,0.2)", "rgba(100,100,100,0.4)", "rgba(56,56,56,0.6)"], [0, 0.1, 0.5, 0.9, 1], 0, -this.height_px/8-10, 0, -this.height_px/8);
		//g.drawRoundRect(-this.beaker_width_px/2-4, this.height_px-this.beaker_bottom_dy - this.beaker_height_px, this.beaker_width_px+8, 4, 4);
		//g.drawEllipse(-this.beaker_width_px/2-4, this.height_px-this.beaker_height_px-8-10, this.beaker_width_px+8, 16);
		//g.endFill();
		// cylinder
		g.setStrokeStyle(this.BEAKER_WALL_THICKNESS);
		g.beginLinearGradientFill(["rgba(127,127,127,0.2)", "rgba(200,200,200,0.2)","rgba(225,225,255,0.3)", "rgba(200,200,200,0.2)", "rgba(127,127,127,0.2)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
		g.beginLinearGradientStroke(["rgba(127,127,127,0.5)", "rgba(200,200,200,0.4)","rgba(255,255,255,0.3)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.5)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
		g.drawRect(-this.beaker_width_px/2, 0, this.beaker_width_px, this.beaker_height_px+this.BEAKER_WALL_THICKNESS);
		g.endFill();
		// right side wall
		g.beginLinearGradientFill(["rgba(127,127,127,0.2)", "rgba(200,200,200,0.2)","rgba(225,225,255,0.3)", "rgba(200,200,200,0.2)", "rgba(127,127,127,0.2)"], [0, 0.1, 0.5, 0.9, 1], this.beaker_width_px/2, 0, this.beaker_width_px/2 + this.width_from_depth, 0);
		g.moveTo(this.beaker_width_px/2, 0);
		g.lineTo(this.beaker_width_px/2 + this.width_from_depth, -this.height_from_depth);
		g.lineTo(this.beaker_width_px/2 + this.width_from_depth, this.beaker_height_px+this.BEAKER_WALL_THICKNESS-this.height_from_depth);
		g.lineTo(this.beaker_width_px/2, this.beaker_height_px+this.BEAKER_WALL_THICKNESS);
		g.lineTo(this.beaker_width_px/2, 0);
		g.endFill();
		g.endStroke();

		// draw a ruler
		g = this.rulerGraphics;
		g.clear();
		g.setStrokeStyle(1);
		//g.beginLinearGradientStroke(["rgba(56,56,56,0.6)", "rgba(100,100,100,0.4)","rgba(127,127,127,0.2)", "rgba(100,100,100,0.4)", "rgba(56,56,56,0.6)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
	 	g.beginStroke("rgba(50, 50, 50, 1.0)")
	 	var text;
	 	var vstr;
		for (var i=0; i < this.NUM_RULER_TICKS; i++)
		{
			var ry = this.height_px - this.beaker_bottom_dy - this.beaker_height_px*i/this.NUM_RULER_TICKS
			g.moveTo(0, ry);
			g.lineTo(10, ry);
			vstr = Math.round(((this.height_px - this.beaker_bottom_dy) - ry) / SCALE);
			text = new Text(vstr, "1.0em Bold Arial", "#888");
			text.x = this.width_px/2 - this.beaker_width_px/2 - 12;
			text.y = ry + 4; 
			this.addChild(text);
		}
		this.addChild(this.pointerShape);
		this.addChild(this.pointerText);

		
		// draw pointer to water line
		g = this.pointerGraphics;
		g.setStrokeStyle(1);
		g.beginStroke("rgba(100, 100, 100, 1)");
		g.beginFill("rgba(255,255,255, 1.0)");
		g.moveTo(0, 0);
		g.lineTo(10, -10);
		g.lineTo(40, -10);
		g.lineTo(40, 10);
		g.lineTo(10, 10);
		g.lineTo(0, 0);
		g.endFill();
		g.endStroke();		
		
		//////////////////////////// b2 ////////////////////////////////
		//////////////////////////// b2 ////////////////////////////////
		//////////////////////////// b2 ////////////////////////////////
		// 
		var vecs, vec;
		
		this.b2world = new b2World(new b2Vec2(0, 10), true);
		var zerop = new b2Vec2();
		zerop.Set(0, 0);
		
		// floor
		var floorFixture = new b2FixtureDef;
		floorFixture.density = 1;
		floorFixture.restitution = 0.2;
		floorFixture.filter.categoryBits = 2;
		floorFixture.filter.maskBits = 3;
		floorFixture.shape = new b2PolygonShape;
		floorFixture.shape.SetAsBox(this.width_px / 2 / SCALE, this.WALL_THICKNESS / 2 / SCALE);
		var floorBodyDef = new b2BodyDef;
		floorBodyDef.type = b2Body.b2_staticBody;
		floorBodyDef.position.x = (this.world_dx + (this.width_px) / 2 ) / SCALE;
		floorBodyDef.position.y = (this.world_dy + this.height_px - ( this.WALL_THICKNESS ) / 2 ) / SCALE;
		var floor = this.floor = this.b2world.CreateBody(floorBodyDef);
		floor.CreateFixture(floorFixture);

		//ceiling
		var ceilingFixture = new b2FixtureDef;
		ceilingFixture.density = 1;
		ceilingFixture.restitution = 0.2;
		ceilingFixture.filter.categoryBits = 2;
		ceilingFixture.filter.maskBits = 3;
		ceilingFixture.shape = new b2PolygonShape;
		ceilingFixture.shape.SetAsBox(this.width_px / 2 / SCALE, this.WALL_THICKNESS / 2 / SCALE);
		var ceilingBodyDef = new b2BodyDef;
		ceilingBodyDef.type = b2Body.b2_staticBody;
		ceilingBodyDef.position.x = (this.world_dx + (this.width_px) / 2 ) / SCALE;
		ceilingBodyDef.position.y = (this.world_dy + ( this.WALL_THICKNESS ) / 2 ) / SCALE;
		var ceiling = this.b2world.CreateBody(ceilingBodyDef);
		ceiling.CreateFixture(ceilingFixture);

		var leftWallFixture = new b2FixtureDef;
		leftWallFixture.density = 1;
		leftWallFixture.restitution = 0.2;
		leftWallFixture.filter.categoryBits = 2;
		leftWallFixture.filter.maskBits = 3;
		leftWallFixture.shape = new b2PolygonShape;
		leftWallFixture.shape.SetAsBox(this.WALL_THICKNESS / 2 / SCALE, this.height_px / 2 / SCALE);
		var leftWallBodyDef = new b2BodyDef;
		leftWallBodyDef.type = b2Body.b2_staticBody;
		leftWallBodyDef.position.x = (this.world_dx + (this.WALL_THICKNESS / 2) ) / SCALE;
		leftWallBodyDef.position.y = (this.world_dy + (this.height_px) / 2 ) / SCALE;
		var leftWall = this.b2world.CreateBody(leftWallBodyDef);
		leftWall.CreateFixture(leftWallFixture);

		var rightWallFixture = new b2FixtureDef;
		rightWallFixture.density = 1;
		rightWallFixture.restitution = 0.2;
		rightWallFixture.filter.categoryBits = 2;
		rightWallFixture.filter.maskBits = 2;
		rightWallFixture.shape = new b2PolygonShape;
		rightWallFixture.shape.SetAsBox(this.WALL_THICKNESS / 2 / SCALE, this.height_px / 2 / SCALE);
		var rightWallBodyDef = new b2BodyDef;
		rightWallBodyDef.type = b2Body.b2_staticBody;
		rightWallBodyDef.position.x = (this.world_dx + this.width_px - (this.WALL_THICKNESS / 2) ) / SCALE;
		rightWallBodyDef.position.y = (this.world_dy + (this.height_px) / 2 ) / SCALE;
		var rightWall = this.b2world.CreateBody(rightWallBodyDef);
		rightWall.CreateFixture(rightWallFixture);

		// beaker
		var beakerFloorFixture = new b2FixtureDef;
		beakerFloorFixture.density = 1.0;
		beakerFloorFixture.filter.categoryBits = 2;
		beakerFloorFixture.filter.maskBits = 3;
		beakerFloorFixture.friction = 0.5;
		beakerFloorFixture.shape = new b2PolygonShape;
		beakerFloorFixture.shape.SetAsBox(this.beaker_width_px / 2 / SCALE, this.BEAKER_WALL_THICKNESS / 2 / SCALE);
		var beakerFloorBodyDef = new b2BodyDef;
		beakerFloorBodyDef.type = b2Body.b2_staticBody;
		beakerFloorBodyDef.position.x = (this.world_dx + this.width_px / 2) / SCALE;
		beakerFloorBodyDef.position.y = (this.world_dy + this.height_px - this.BEAKER_WALL_THICKNESS / 2 - this.WALL_THICKNESS / 2) / SCALE;
		var beakerFloor = this.beakerFloor = this.b2world.CreateBody(beakerFloorBodyDef);
		beakerFloor.CreateFixture(beakerFloorFixture);

		var beakerLeftWallFixture = new b2FixtureDef;
		beakerLeftWallFixture.density = 1.0;
		beakerLeftWallFixture.filter.categoryBits = 2;
		beakerLeftWallFixture.filter.maskBits = 3;
		beakerLeftWallFixture.friction = 0.0;
		beakerLeftWallFixture.shape = new b2PolygonShape;
		beakerLeftWallFixture.shape.SetAsBox(this.BEAKER_WALL_THICKNESS / 2 / SCALE, this.beaker_height_px / 2 / SCALE);
		var beakerLeftWallBodyDef = new b2BodyDef;
		beakerLeftWallBodyDef.type = b2Body.b2_staticBody;
		beakerLeftWallBodyDef.position.x = (this.world_dx + this.width_px / 2 - this.beaker_width_px / 2 - 2*this.BEAKER_WALL_THICKNESS) / SCALE;
		beakerLeftWallBodyDef.position.y = (this.world_dy + this.height_px - this.BEAKER_WALL_THICKNESS / 2 - this.WALL_THICKNESS / 2 - this.beaker_height_px / 2) / SCALE;
		var beakerLeftWall = this.beakerLeftWall = this.b2world.CreateBody(beakerLeftWallBodyDef);
		beakerLeftWall.CreateFixture(beakerLeftWallFixture);

		var beakerRightWallWallFixture = new b2FixtureDef;
		beakerRightWallWallFixture.density = 1.0;
		beakerRightWallWallFixture.filter.categoryBits = 2;
		beakerRightWallWallFixture.filter.maskBits = 3;
		beakerRightWallWallFixture.friction = 0.0;
		beakerRightWallWallFixture.shape = new b2PolygonShape;
		beakerRightWallWallFixture.shape.SetAsBox(this.BEAKER_WALL_THICKNESS / 2 / SCALE, this.beaker_height_px / 2 / SCALE);
		var beakerRightWallWallBodyDef = new b2BodyDef;
		beakerRightWallWallBodyDef.type = b2Body.b2_staticBody;
		beakerRightWallWallBodyDef.position.x = (this.world_dx + this.width_px / 2 + this.beaker_width_px / 2 + 2*this.BEAKER_WALL_THICKNESS) / SCALE;
		beakerRightWallWallBodyDef.position.y = (this.world_dy + this.height_px - this.BEAKER_WALL_THICKNESS / 2 - this.WALL_THICKNESS / 2 - this.beaker_height_px / 2) / SCALE;
		var beakerRightWallWall = this.beakerRightWall = this.b2world.CreateBody(beakerRightWallWallBodyDef);
		beakerRightWallWall.CreateFixture(beakerRightWallWallFixture);

		// water line fixture, use as sensor for first entering water
		/*
		var waterFixture = new b2FixtureDef;
		//waterFixture.isSensor = true;
		waterFixture.density = 1.0;
		waterFixture.filter.categoryBits = 2;
		waterFixture.filter.maskBits = 2;
		waterFixture.shape = new b2PolygonShape;
		waterFixture.shape.SetAsBox(this.beaker_width_px / 2 / SCALE, this.beaker_height_px * this.water_volume_perc / 2 / SCALE);
		var waterBodyDef = new b2BodyDef;
		waterBodyDef.type = b2Body.b2_dynamicBody;
		waterBodyDef.position.x = (this.world_dx + this.width_px / 2 ) / SCALE;
		waterBodyDef.position.y = floorBodyDef.position.y - (this.beaker_height_px * this.water_volume_perc / 2 ) / SCALE;
		console.log(waterBodyDef.position);
		var waterBody = this.waterBody = this.b2world.CreateBody(waterBodyDef);
		waterBody.CreateFixture(waterFixture);
		*/

		// contact listener
		var contactListener = new b2ContactListener;
		contactListener.BeginContact = this.BeginContact.bind(this);
		this.b2world.SetContactListener(contactListener);
		this.justAdded = null;

		if (DEBUG)
		{
			var debugDraw = this.debugDraw = new b2DebugDraw;
			debugDraw.SetSprite(document.getElementById("debugcanvas2").getContext("2d"));
			debugDraw.SetDrawScale(SCALE);
			debugDraw.SetFillAlpha(1.0);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			this.b2world.SetDebugDraw(debugDraw);
		}

		this.actors = new Array();
	}
	

	/** This works for objecs where the width_px_left, height_px_above, width_px_right, width_px_below are defined
	    i.e., there is no assumption of where 0,0 is relative to the object.
	    Both objects must be on the stage, i.e. must have parents */
	p.hitTestObject = function (o)
	{
		if (o.width_px_left != undefined && o.width_px_right != undefined && o.height_px_above != undefined && o.height_px_below != undefined)
		{
			if (o.parent != undefined && this.parent != undefined)
			{
				var gp = o.parent.localToGlobal(o.x, o.y);
				var lp = this.globalToLocal(gp.x, gp.y);
				if (this.hitTest(lp.x-o.width_px_left, lp.y+o.height_px_below) && this.hitTest(lp.x+o.width_px_right, lp.y+o.height_px_below))
				{
					return true;
				} else
				{
					return false;
				}
			} else		
			{
				return false;
			}
		} else
		{
			console.log("The height and width next to the object are not defined.");
			return false;
		}

	}
	p.addObject = function (o, x, y)
	{
		this.addChildAt(o, this.NUM_BACK_OBJECTS+this.actors.length);
		o.x = x;
		o.y = y;
		
		o.world = this;
		
		var bodyDef = o.bodyDef;
		bodyDef.fixedRotation = true;
		bodyDef.position.x = (this.x + x) / SCALE;
		bodyDef.position.y = (this.y + y) / SCALE;
			
		var body = o.body = this.b2world.CreateBody(bodyDef);
	
		var area = 0;
		body.emptySpaces = 0;
		var volume = 0;
		for (var i = 0; i < o.fixDefs.length; i++)
		{
			var fixDef = o.fixDefs[i];
			var f = body.CreateFixture(fixDef);
			f.materialDensity = fixDef.materialDensity;
			f.totalSpaces = fixDef.totalSpaces;
			f.materialSpaces = fixDef.materialSpaces;
			f.exteriorSpaces = fixDef.exteriorSpaces;
			f.interiorSpaces = fixDef.interiorSpaces;
			f.protectedSpaces = fixDef.protectedSpaces;
			
			volume += f.materialSpaces + f.protectedSpaces + f.interiorSpaces;

			var lowerBound = f.GetAABB().lowerBound;
			var upperBound = f.GetAABB().upperBound;
			area += Math.abs((upperBound.x - lowerBound.x) * (upperBound.y - lowerBound.y));
			if (f.emptySpaces != undefined) body.emptySpaces += f.emptySpaces;
		}
		this.actors.push(o);
		// set a flag so we can look for initial contact with this object
		this.justAdded = body;

		// put aabb, i.e. upper and lower limit onto the body and area
		body.depth_units = o.compShape.depth_units;
		body.local_height_below = o.height_px_below / SCALE;
		body.area = area;
		body.volume = volume;
		body.buoyantForce = new b2Vec2(); body.buoyantForce.Set(0,0);
		body.fullySubmerged = false;
		body.fullyEmerged = true;
		body.soaked = false;
		body.SetSleepingAllowed(false);
		body.previousPosition = body.GetPosition();
	}

	p.removeObject = function (o)
	{
		this.removeChild(o);
		this.actors.splice(this.actors.indexOf(this), 1);
		this.b2world.DestroyBody(o.body);
		o.world = undefined;	
		
	}

	p.BeginContact = function (contact)
	{
		//console.log("here");
		// When the object just added makes contact, set linear damping high to avoid too much motion.
		if (this.justAdded != null)
		{
			if (contact.GetFixtureA().m_body == this.justAdded)
			{	
				
			} else if (contact.GetFixtureB().m_body == this.justAdded)
			{
				
			} 
			this.justAdded = null;

		}
	}

	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
		
		
		var a = new b2Vec2(); a.Set(this.beakerLeftWall.GetWorldCenter().x + this.BEAKER_WALL_THICKNESS / 2 / SCALE, this.beakerFloor.GetWorldCenter().y + (-this.BEAKER_WALL_THICKNESS / 2 - this.beaker_height_px + this.beaker_water_y) / SCALE);
		var zerop = new b2Vec2(); zerop.Set(0,0);
		var total_volumeSubmerged = 0;
		for(var i = 0; i < this.actors.length; i++)
		{

			// update b2
			this.actors[i].update();
			
			var body = this.actors[i].body;
			
			if (!body.IsAwake())
			{
				console.log("asleep", body.previousPosition, body.GetPosition())
			//	body.SetPosition(body.previousPosition);
			} 
			//else
			//{
			//	body.previousPosition = body.GetPosition();
			//}
			
			var compShape = this.actors[i].compShape;
			// where are we in reference to water line?
			var world_zerop = body.GetWorldPoint(zerop);
			var percentSubmerged = 0;
			var massSubmerged = 0;
			var areaSubmerged = 0;
			var volumeSubmerged = 0;
			var f;
			if (world_zerop.y > a.y)
			{
				percentSubmerged = 1;
				areaSubmerged = body.area;
				volumeSubmerged = body.volume;

				if (!body.fullySubmerged)
				{
					// change density of each fixture to include mass of water
					for (f = body.GetFixtureList(); f; f = f.GetNext())
					{
						f.SetDensity(f.materialDensity * f.materialSpaces + (f.interiorSpaces) * this.fluid_density);
					}
				}
				body.ResetMassData();
				massSubmerged = body.GetMass();
				body.fullySubmerged = true;
				body.soaked = true; // A permanent flag if the object is ever fully submerged
				body.SetLinearDamping(body.GetLinearDamping()+0.005);
				
			} else if (world_zerop.y + body.local_height_below < a.y) 
			{
				percentSubmerged = 0;
				areaSubmerged = 0;
				volumeSubmerged = 0;
				if (!body.fullyEmerged)
				{
					// change density of each fixture to include mass of water
					for (f = body.GetFixtureList(); f; f = f.GetNext())
					{
						if (body.soaked)
						{
							f.SetDensity(f.materialDensity * f.materialSpaces + (f.interiorSpaces) * this.fluid_density);
						} else
						{
							f.SetDensity(f.materialDensity);
						}
					}
				}
				body.ResetMassData();
				massSubmerged = 0;
				body.fullyEmerged = true;
			} else
			{
				for (f = body.GetFixtureList(); f; f = f.GetNext())
				{
					var aabb = f.GetAABB();
					var fpercentSubmerged;
					var fvolumeSubmerged = 0;
					if (aabb.lowerBound.y > a.y)
					{	
						fpercentSubmerged = 1.0;
						if (body.soaked)
						{
							f.SetDensity(f.materialDensity * f.materialSpaces + (f.interiorSpaces) * this.fluid_density);
						} else
						{
							f.SetDensity(f.materialDensity * f.materialSpaces );
						}
						fvolumeSubmerged = (f.materialSpaces + f.interiorSpaces + f.protectedSpaces);
					} else if (aabb.upperBound.y < a.y)
					{
						fpercentSubmerged = 0;
						if (body.soaked)
						{
							f.SetDensity(f.materialDensity * f.materialSpaces+ (f.interiorSpaces) * this.fluid_density);
						} else
						{
							f.SetDensity(f.materialDensity * f.materialSpaces);
						}
					} else
					{
						fpercentSubmerged =  (aabb.upperBound.y - a.y) / (aabb.upperBound.y - aabb.lowerBound.y);
						if (body.soaked)
						{
							f.SetDensity(f.materialDensity * f.materialSpaces + (f.interiorSpaces) * this.fluid_density * fpercentSubmerged);
						} else
						{
							f.SetDensity(f.materialDensity * f.materialSpaces);
						}
						fvolumeSubmerged = fpercentSubmerged * (f.materialSpaces + f.interiorSpaces + f.protectedSpaces);
					}					

					//percentSubmerged += fpercentSubmerged;
					volumeSubmerged += fvolumeSubmerged; 
					massSubmerged += f.GetMassData().mass * fpercentSubmerged;
					areaSubmerged += fpercentSubmerged * (aabb.upperBound.x - aabb.lowerBound.x) * (aabb.upperBound.y - aabb.lowerBound.y);

				}
				percentSubmerged = areaSubmerged / body.area;
				body.ResetMassData();
				body.fullySubmerged = false;
				body.fullyEmerged = false;
				body.SetLinearDamping(body.GetLinearDamping()+0.005);
			}
						
			var buoyantForce = new b2Vec2(); buoyantForce.Set(0, this.fluid_density*volumeSubmerged*-this.b2world.GetGravity().y);
			var worldPoint = new b2Vec2(); worldPoint.Set(world_zerop.x, world_zerop.y+body.local_height_below);
			if (body.buoyantForce.y != buoyantForce.y)
			{
				var diffForce = new b2Vec2(); diffForce.Set(0, buoyantForce.y - body.buoyantForce.y);
				body.ApplyForce(diffForce, worldPoint);
				body.buoyantForce = buoyantForce;
			}

			// adjust water height
			total_volumeSubmerged += volumeSubmerged;
			
		}
		this.beaker_water_y = this.init_beaker_water_y - total_volumeSubmerged * SCALE * SCALE * SCALE / (this.beaker_width_px * this.beaker_depth_px);

		this.b2world.Step(1/Ticker.getFPS(), 10, 10);
		this.redraw();
		if (DEBUG) this.b2world.DrawDebugData();
	}

	p.redraw = function ()
	{
		// draw water
		var g = this.backWaterGraphics;
		g.clear();
		g.beginLinearGradientFill(["rgba(100,100,255,0.3)", "rgba(150,150,255,0.3)","rgba(200,200,255,0.3)", "rgba(150,150,255,0.3)", "rgba(100,100,255,0.3)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
		g.drawRect(-this.beaker_width_px/2, this.beaker_water_y, this.beaker_width_px, this.beaker_height_px + this.BEAKER_WALL_THICKNESS*2  - this.beaker_water_y);
		g.endFill();
		g.beginLinearGradientFill(["rgba(100,100,255,0.3)", "rgba(150,150,255,0.3)","rgba(200,200,255,0.3)", "rgba(150,150,255,0.3)", "rgba(100,100,255,0.3)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2-this.width_from_depth, 0, -this.beaker_width_px/2, 0);
		g.moveTo(-this.beaker_width_px/2, this.beaker_water_y);
		g.lineTo(-this.beaker_width_px/2-this.width_from_depth, this.beaker_water_y + this.height_from_depth);
		g.lineTo(-this.beaker_width_px/2-this.width_from_depth, this.beaker_height_px + this.height_from_depth);
		g.lineTo(-this.beaker_width_px/2, this.beaker_height_px);
		g.endFill();
		

		var g = this.frontWaterGraphics;
		g.clear();
		g.beginLinearGradientFill(["rgba(100,100,255,0.4)", "rgba(150,150,255,0.4)","rgba(200,200,255,0.4)", "rgba(150,150,255,0.4)", "rgba(100,100,255,0.4)"], [0, 0.1, 0.5, 0.9, 1], -this.beaker_width_px/2, 0, this.beaker_width_px/2, 0);
		g.drawRect(-this.beaker_width_px/2, this.beaker_water_y, this.beaker_width_px, this.beaker_height_px + this.BEAKER_WALL_THICKNESS*2 - this.beaker_water_y);
		g.endFill();
		g.beginLinearGradientFill(["rgba(100,100,255,0.5)", "rgba(150,150,255,0.5)","rgba(175,175,255,0.5)", "rgba(175,175,255,0.5)", "rgba(100,100,255,0.5)"], [0, 0.1, 0.5, 0.9, 1], this.beaker_width_px/2, 0, this.beaker_width_px/2+this.width_from_depth, 0);
		g.moveTo(this.beaker_width_px/2, this.beaker_water_y);
		g.lineTo(this.beaker_width_px/2+this.width_from_depth, this.beaker_water_y - this.height_from_depth);
		g.lineTo(this.beaker_width_px/2+this.width_from_depth, this.beaker_height_px- this.height_from_depth);
		g.lineTo(this.beaker_width_px/2, this.beaker_height_px);
		g.endFill();
		//this.backWaterLineShape.x = 0;
		this.backWaterLineShape.y = -this.height_from_depth + this.height_px - this.beaker_bottom_dy - this.BEAKER_WALL_THICKNESS / 2 - this.beaker_height_px + this.beaker_water_y;
		this.frontWaterLineShape.y = this.height_px - this.beaker_bottom_dy - this.BEAKER_WALL_THICKNESS / 2 - this.beaker_height_px + this.beaker_water_y;

		// draw a pointer to the current position 
		//this.pointerShape.x = this.beaker_width_px/2+2;
		this.pointerShape.y = this.frontWaterLineShape.y;
		this.pointerText.text = Math.round( (this.beaker_height_px - this.beaker_water_y) / SCALE * 10) / 10;
		
		this.pointerText.y = this.pointerShape.y + 5;
	}
	
	//// PHYSICS-RELATED FUNCTIONS
	/** What percent of this object is in the fluid */
	p.updatePercentInFluid = function(o)
	{
		//var beaker_water_y = this.init_beaker_water_y;
		var beaker_water_y = this.beaker_water_y;
		
		/*
		if (o.y - o.viewable_height/2 > beaker_water_y)
		{
			if (o.percentInFluid == 0) {o.impact = true} else {o.impact = false;}
			o.percentInFluid = 1;
		} else if (o.y + o.viewable_height/2 < beaker_water_y)
		{
			o.impact = false;
			o.percentInFluid = 0;
		} else
		{
			if (o.percentInFluid == 0) {o.impact = true} else {o.impact = false;}
			o.percentInFluid = (o.y + o.viewable_height/2 - beaker_water_y)/o.viewable_height;
		}
		return o.percentInFluid;
		*/
	}
	p.updateWaterHeight = function()
	{
		/*
		this.volume_unit_objects_water = 0;
		if (this.object != null)	
			this.volume_unit_objects_water += this.object.volume * this.updatePercentInFluid(this.object);
		
		this.total_volume = this.water_volume+this.volume_unit_objects_water;
		this.beaker_water_y = this.height_px - this.total_volume/this.volume_unit * this.height_px;
		*/
	}
	
	window.Beakerb2World = Beakerb2World;
}(window));