(function (window)
{

	function Balanceb2World (width_px, height_px, world_dx, world_dy)
	{
		this.initialize (width_px, height_px, world_dx, world_dy);
	}

	var p = Balanceb2World.prototype = new Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	// constants
	p.MAX_TILT_ANGLE = Math.PI/2*0.7;
	p.BASE_WIDTH = 200;
	p.BASE_HEIGHT_EDGE = 5;
	p.BASE_HEIGHT = 20;
	p.STEM_WIDTH = 10;
	p.STEM_HEIGHT = 200;
	p.BEAM_HEIGHT = 10;
	p.BEAM_HEIGHT_EDGE = 2;
	p.BEAM_ARC_DY = 30;
	p.BEAM_MASS = 1000;
	p.PAN_DY = 100;
	p.PAN_HEIGHT = 2;
	
	p.initialize = function (width_px, height_px, world_dx, world_dy)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.world_dx = world_dx;
		this.world_dy = world_dy;
		SCALE = SCALE;
		this.BEAM_LENGTH_X = this.width_px/4;
		this.BEAM_LENGTH_Y = this.BEAM_ARC_DY;
		this.BEAM_LENGTH = Math.sqrt(this.BEAM_LENGTH_X*this.BEAM_LENGTH_X + this.BEAM_LENGTH_Y*this.BEAM_LENGTH_Y);
		this.BEAM_ANGLE = Math.tan(this.BEAM_LENGTH_Y/this.BEAM_LENGTH_X);
		this.PAN_WIDTH = this.width_px/4;
		
		g = this.g = new Graphics();
		this.shape = new Shape(g);
		this.addChild(this.shape);

		g.beginFill("rgba(200, 200, 255, 1.0)");
		//g.drawRect(-this.width_px/2, -this.height_px/2, this.width_px, this.height_px);
		g.drawRect(0, 0, this.width_px, this.height_px);
		g.endFill();
		//draw floor
		g.beginFill("rgba(200, 200, 150, 1.0)");
		//g.drawRect(-this.width_px/2, this.height_px/2-10, this.width_px, 10);
		g.drawRect(0, this.height_px-100, this.width_px, 100);
		g.endFill();

		this.b2world = new b2World(new b2Vec2(0, 10), true);
		var zerop = new b2Vec2();
		zerop.Set(0, 0);
		
		// floor
		var floorFixture = new b2FixtureDef;
		floorFixture.density = 1;
		floorFixture.restitution = 0.2;
		floorFixture.shape = new b2PolygonShape;
		floorFixture.shape.SetAsBox(this.width_px / 2 / SCALE, 10 / 2 / SCALE);
		var floorBodyDef = new b2BodyDef;
		floorBodyDef.type = b2Body.b2_staticBody;
		floorBodyDef.position.x = (this.world_dx + (this.width_px) / 2 ) / SCALE;
		floorBodyDef.position.y = (this.world_dy + this.height_px - ( 10 ) / 2 ) / SCALE;
		var floor = this.floor = this.b2world.CreateBody(floorBodyDef);
		floor.CreateFixture(floorFixture);

		//ceiling
		var ceilingFixture = new b2FixtureDef;
		ceilingFixture.density = 1;
		ceilingFixture.restitution = 0.2;
		ceilingFixture.shape = new b2PolygonShape;
		ceilingFixture.shape.SetAsBox(this.width_px / 2 / SCALE, 10 / 2 / SCALE);
		var ceilingBodyDef = new b2BodyDef;
		ceilingBodyDef.type = b2Body.b2_staticBody;
		ceilingBodyDef.position.x = (this.world_dx + (this.width_px) / 2 ) / SCALE;
		ceilingBodyDef.position.y = (this.world_dy + ( 10 ) / 2 ) / SCALE;
		var ceiling = this.b2world.CreateBody(ceilingBodyDef);
		ceiling.CreateFixture(ceilingFixture);

		var leftWallFixture = new b2FixtureDef;
		leftWallFixture.density = 1;
		leftWallFixture.restitution = 0.2;
		leftWallFixture.shape = new b2PolygonShape;
		leftWallFixture.shape.SetAsBox(4 / 2 / SCALE, this.height_px / 2 / SCALE);
		var leftWallBodyDef = new b2BodyDef;
		leftWallBodyDef.type = b2Body.b2_staticBody;
		leftWallBodyDef.position.x = (this.world_dx + (4 / 2) ) / SCALE;
		leftWallBodyDef.position.y = (this.world_dy + (this.height_px) / 2 ) / SCALE;
		var leftWall = this.b2world.CreateBody(leftWallBodyDef);
		leftWall.CreateFixture(leftWallFixture);

		var rightWallFixture = new b2FixtureDef;
		rightWallFixture.density = 1;
		rightWallFixture.restitution = 0.2;
		rightWallFixture.shape = new b2PolygonShape;
		rightWallFixture.shape.SetAsBox(4 / 2 / SCALE, this.height_px / 2 / SCALE);
		var rightWallBodyDef = new b2BodyDef;
		rightWallBodyDef.type = b2Body.b2_staticBody;
		rightWallBodyDef.position.x = (this.world_dx + this.width_px - (4 / 2) ) / SCALE;
		rightWallBodyDef.position.y = (this.world_dy + (this.height_px) / 2 ) / SCALE;
		var rightWall = this.b2world.CreateBody(rightWallBodyDef);
		rightWall.CreateFixture(rightWallFixture);

		var vecs, vec;

		// draw the center pole
		// easel
		var g = this.baseg = new Graphics();
		this.baseShape = new Shape(g);
		this.baseShape.x = this.width_px / 2;
		this.addChild(this.baseShape);
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
		g.lineTo(-this.STEM_WIDTH/2, this.height_px - this.STEM_HEIGHT + this.BASE_HEIGHT);
		g.lineTo(0, this.height_px - this.STEM_HEIGHT);
		g.lineTo(+this.STEM_WIDTH/2, this.height_px - this.STEM_HEIGHT + this.BASE_HEIGHT);
		g.lineTo(+this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.lineTo(-this.STEM_WIDTH/2, this.height_px - this.BASE_HEIGHT);
		g.endFill();

		// b2
		var stemFixture = new b2FixtureDef;
		stemFixture.density = 1;
		stemFixture.restitution = 0.2;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(0,0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set( this.STEM_WIDTH/2 / SCALE, this.STEM_HEIGHT / SCALE); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(-this.STEM_WIDTH/2 / SCALE, this.STEM_HEIGHT / SCALE); vecs[2] = vec;
		stemFixture.shape = new b2PolygonShape;
		stemFixture.shape.SetAsArray(vecs, vecs.length);
		var stemBodyDef = new b2BodyDef;
		stemBodyDef.type = b2Body.b2_staticBody;
		stemBodyDef.position.x = (this.world_dx + this.width_px / 2 ) / SCALE;
		stemBodyDef.position.y = (this.world_dy + this.height_px - this.STEM_HEIGHT) / SCALE;
		var stem = this.b2world.CreateBody(stemBodyDef);
		stem.CreateFixture(stemFixture);

		/// beam
		// easel
		g = this.beamg = new Graphics();
		this.beamShape = new Shape(g);
		this.beamShape.x = this.width_px / 2;
		this.beamShape.y = this.height_px - this.STEM_HEIGHT;
		this.addChild(this.beamShape);
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

		// draw the beam in two parts
		var leftBeamFixture = new b2FixtureDef;
		leftBeamFixture.density = 10;
		leftBeamFixture.restitution = 0.0;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(-this.BEAM_LENGTH_X / SCALE, (this.BEAM_ARC_DY) / SCALE); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(-this.BEAM_LENGTH_X / SCALE, (this.BEAM_ARC_DY-this.BEAM_HEIGHT_EDGE) / SCALE); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(0, -this.BEAM_HEIGHT / SCALE); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(0, 0); vecs[3] = vec;
		leftBeamFixture.shape = new b2PolygonShape;
		leftBeamFixture.shape.SetAsArray(vecs, vecs.length);
		
		var rightBeamFixture = new b2FixtureDef;
		rightBeamFixture.density = 10;
		rightBeamFixture.restitution = 0.0;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(0, 0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(0, -this.BEAM_HEIGHT / SCALE); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(this.BEAM_LENGTH_X / SCALE, (this.BEAM_ARC_DY-this.BEAM_HEIGHT_EDGE) / SCALE); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(this.BEAM_LENGTH_X / SCALE, (this.BEAM_ARC_DY) / SCALE); vecs[3] = vec;
		rightBeamFixture.shape = new b2PolygonShape;
		rightBeamFixture.shape.SetAsArray(vecs, vecs.length);
		
		var beamBodyDef = new b2BodyDef;
		beamBodyDef.type = b2Body.b2_dynamicBody;
		beamBodyDef.position.x = (this.world_dx + this.width_px / 2) / SCALE;
		beamBodyDef.position.y = (this.world_dy + this.height_px - this.STEM_HEIGHT) / SCALE;
		beamBodyDef.enableLimit = true;
		beamBodyDef.upperLimit = this.MAX_TILT_ANGLE;
		beamBodyDef.lowerLimit = -this.MAX_TILT_ANGLE;
		var beam = this.beam = this.b2world.CreateBody(beamBodyDef);
		beam.CreateFixture(leftBeamFixture);
		beam.CreateFixture(rightBeamFixture);

		
		// join beam with stem
		var tip = new b2Vec2();
		tip.Set((this.world_dx + this.width_px / 2) / SCALE, (this.world_dy + this.height_px - this.STEM_HEIGHT) / SCALE);
		var beamJointDef = new b2RevoluteJointDef();
		beamJointDef.Initialize(stem, beam, tip);
		//beamJointDef.maxMotorTorque = 1.0;
		//beamJointDef.enableMotor = true;
		this.beamJoint = this.b2world.CreateJoint (beamJointDef);
		this.beamJoint.SetLimits(-Math.PI/4, Math.PI/4);

		// hooks
		var lefttip = new b2Vec2();
		lefttip.Set( (this.world_dx + this.width_px/2 -this.BEAM_LENGTH_X) / SCALE, (this.world_dy + this.height_px - this.STEM_HEIGHT + this.BEAM_ARC_DY) / SCALE);
		var righttip = new b2Vec2();
		righttip.Set( (this.world_dx + this.width_px/2 + this.BEAM_LENGTH_X) / SCALE, (this.world_dy + this.height_px - this.STEM_HEIGHT + this.BEAM_ARC_DY) / SCALE);
		
		var leftHookFixture = new b2FixtureDef;
		leftHookFixture.density = 1;
		leftHookFixture.shape = new b2CircleShape;
		leftHookFixture.shape.SetRadius(0.1);		
		var leftHookBodyDef = new b2BodyDef;
		leftHookBodyDef.type = b2Body.b2_dynamicBody;
		leftHookBodyDef.position.x = lefttip.x;
		leftHookBodyDef.position.y = lefttip.y;
		this.leftHook = this.b2world.CreateBody(leftHookBodyDef);
		this.leftHook.CreateFixture(leftHookFixture);


		// pans
		// easel
		g = this.leftPang = new Graphics();
		this.leftPanShape = new Shape(g);
		this.leftPanShape.x = this.width_px / 4;
		this.leftPanShape.y = this.height_px - this.STEM_HEIGHT + this.BEAM_ARC_DY + this.PAN_DY;
		this.addChild(this.leftPanShape);
		g.clear();+
		g.setStrokeStyle(2);
		g.beginStroke("#AAAAAA");
		g.moveTo(-this.PAN_WIDTH/2, 0);
		g.lineTo(0, -this.PAN_DY)
		g.moveTo(this.PAN_WIDTH/2, 0);
		g.lineTo(0, -this.PAN_DY)
		g.beginFill("#CCCCCC");
		g.drawEllipse(-this.PAN_WIDTH/2, -this.PAN_HEIGHT*6, this.PAN_WIDTH, this.PAN_HEIGHT*10);
		g.endFill();
		// b2
		var leftPanFixture = new b2FixtureDef;
		leftPanFixture.density = 2;
		leftPanFixture.restitution = 0.0;
		leftPanFixture.shape = new b2PolygonShape;
		leftPanFixture.shape.SetAsBox(this.PAN_WIDTH / 2 / SCALE, this.PAN_HEIGHT / 2 / SCALE);
		var leftPanBodyDef = new b2BodyDef;
		leftPanBodyDef.type = b2Body.b2_dynamicody;
		leftPanBodyDef.position.x = (this.world_dx + this.width_px / 4 ) / SCALE;
		leftPanBodyDef.position.y = (this.world_dy + this.height_px - this.STEM_HEIGHT + this.BEAM_ARC_DY  + this.PAN_DY ) / SCALE;
		leftPanBodyDef.userData = {"type":"leftPan", "contact":null}
		var leftPan = this.leftPan = this.b2world.CreateBody(leftPanBodyDef);
		leftPan.CreateFixture(leftPanFixture);

		// join pan with beam
		var leftleftEnd = new b2Vec2();
		leftleftEnd.Set (leftPan.GetWorldCenter().x - this.PAN_WIDTH /2 / SCALE, leftPan.GetWorldCenter().y);
		var rightleftEnd = new b2Vec2();
		rightleftEnd.Set (leftPan.GetWorldCenter().x + this.PAN_WIDTH /2 / SCALE, leftPan.GetWorldCenter().y);
		
		var leftPanJointDef = new b2RevoluteJointDef();
		leftPanJointDef.enableLimit = true;
		leftPanJointDef.lowerAngle = -Math.PI/4;
		leftPanJointDef.upperAngle = Math.PI/4;
		leftPanJointDef.Initialize(leftPan, beam, lefttip);
		this.leftPanJoint = this.b2world.CreateJoint (leftPanJointDef);
		

		/// right pan
		// easel
		g = this.rightPang = new Graphics();
		this.rightPanShape = new Shape(g);
		this.rightPanShape.x = this.width_px * 3 / 4;
		this.rightPanShape.y = this.height_px - this.STEM_HEIGHT + this.BEAM_ARC_DY + this.PAN_DY;
		this.addChild(this.rightPanShape);
		g.clear();+
		g.setStrokeStyle(2);
		g.beginStroke("#AAAAAA");
		g.moveTo(-this.PAN_WIDTH/2, 0);
		g.lineTo(0, -this.PAN_DY)
		g.moveTo(this.PAN_WIDTH/2, 0);
		g.lineTo(0, -this.PAN_DY)
		g.beginFill("#CCCCCC");
		g.drawEllipse(-this.PAN_WIDTH/2, -this.PAN_HEIGHT*6, this.PAN_WIDTH, this.PAN_HEIGHT*10);
		g.endFill();
		var rightPanFixture = new b2FixtureDef;
		rightPanFixture.density = 2;
		rightPanFixture.restitution = 0.0;
		rightPanFixture.shape = new b2PolygonShape;
		rightPanFixture.shape.SetAsBox(this.PAN_WIDTH / 2 / SCALE, this.PAN_HEIGHT / 2 / SCALE);
		var rightPanBodyDef = new b2BodyDef;
		rightPanBodyDef.type = b2Body.b2_dynamicody;
		rightPanBodyDef.position.x = (this.world_dx + this.width_px * 3 / 4 ) / SCALE;
		rightPanBodyDef.position.y = (this.world_dy + this.height_px - this.STEM_HEIGHT + this.BEAM_ARC_DY + this.PAN_DY ) / SCALE;
		rightPanBodyDef.userData = {"type":"rightPan", "contact":null}
		var rightPan = this.rightPan = this.b2world.CreateBody(rightPanBodyDef);
		rightPan.CreateFixture(rightPanFixture);

		// join pan with beam
		var leftrightEnd = new b2Vec2();
		leftrightEnd.Set (rightPan.GetWorldCenter().x - this.PAN_WIDTH /2 / SCALE, rightPan.GetWorldCenter().y);
		var rightrightEnd = new b2Vec2();
		rightrightEnd.Set (rightPan.GetWorldCenter().x + this.PAN_WIDTH /2 / SCALE, rightPan.GetWorldCenter().y);
		var rightPanJointDef = new b2RevoluteJointDef();
		rightPanJointDef.enableLimit = true;
		rightPanJointDef.lowerAngle = -Math.PI/4;
		rightPanJointDef.upperAngle = Math.PI/4;
		rightPanJointDef.Initialize(rightPan, beam, righttip);
		this.rightPanJoint = this.b2world.CreateJoint (rightPanJointDef);
		
		// contact listener
		var contactListener = new b2ContactListener;
		contactListener.BeginContact = this.BeginContact.bind(this);
		this.b2world.SetContactListener(contactListener);

		if (DEBUG)
		{
			var debugDraw = this.debugDraw = new b2DebugDraw;
			debugDraw.SetSprite(document.getElementById("debugcanvas").getContext("2d"));
			debugDraw.SetDrawScale(SCALE);
			debugDraw.SetFillAlpha(1.0);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			this.b2world.SetDebugDraw(debugDraw);
		}

		this.actors = new Array();
	}
	p.BeginContact = function (contact)
	{
		/*
		var adata = contact.GetFixtureA().m_body.m_userData;
		var bdata = contact.GetFixtureB().m_body.m_userData;
		if (adata != null && bdata != null)
		{
			var atype = adata.type;
			var btype = bdata.type;

			var contactFrictionJointBodyDef;

			if ( (atype == "compShape" && (btype == "leftPan" || btype == "rightPan")) || (btype == "compShape" && (atype == "leftPan" || atype == "rightPan")) )
			{
				var bodyvertices = contact.GetFixtureA().m_shape.m_vertices;
				var min_x = 100, max_x = -100, min_y = 100, max_y = -100;
				for (var i = 0; i < bodyvertices.length; i++)
				{
					if (bodyvertices[i].x < min_x) min_x = bodyvertices[i].x;
					if (bodyvertices[i].x > max_x) max_x = bodyvertices[i].x;
					if (bodyvertices[i].y < min_y) min_y = bodyvertices[i].y;
					if (bodyvertices[i].y > max_y) max_y = bodyvertices[i].y;
				}
				var leftPointA = new b2Vec2();  leftPointA.Set (min_x, min_y);
				var rightPointA = new b2Vec2(); rightPointA.Set (max_x, min_y);

				bodyvertices = contact.GetFixtureB().m_shape.m_vertices;
				min_x = 100, max_x = -100, min_y = 100, max_y = -100;
				for (var i = 0; i < bodyvertices.length; i++)
				{
					if (bodyvertices[i].x < min_x) min_x = bodyvertices[i].x;
					if (bodyvertices[i].x > max_x) max_x = bodyvertices[i].x;
					if (bodyvertices[i].y < min_y) min_y = bodyvertices[i].y;
					if (bodyvertices[i].y > max_y) max_y = bodyvertices[i].y;
				}
				var leftPointB = new b2Vec2();  leftPointB.Set (min_x, min_y);
				var rightPointB = new b2Vec2(); rightPointB.Set (max_x, min_y);

				if (atype == "compShape")
				{
					if (adata.contactType == null)
					{												
						
						leftcontactDistanceJointBodyDef = new b2DistanceJointDef();
						leftcontactDistanceJointBodyDef.Initialize(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body, contact.GetFixtureA().m_body.GetWorldPoint(leftPointA), contact.GetFixtureB().m_body.GetWorldPoint(leftPointB));
						leftcontactDistanceJointBodyDef.collideConnected = true;
						this.b2world.CreateJoint(leftcontactDistanceJointBodyDef); 
						rightcontactDistanceJointBodyDef = new b2DistanceJointDef();
						rightcontactDistanceJointBodyDef.Initialize(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body, contact.GetFixtureA().m_body.GetWorldPoint(rightPointA), contact.GetFixtureB().m_body.GetWorldPoint(rightPointB));
						rightcontactDistanceJointBodyDef.collideConnected = true;
						this.b2world.CreateJoint(rightcontactDistanceJointBodyDef); 
						adata.contactType = btype;
						adata.contactFixture = contact.GetFixtureB();
					}
				} else if (btype == "compShape")
				{
					if (bdata.contactType == null)
					{
						
						leftcontactDistanceJointBodyDef = new b2DistanceJointDef();
						leftcontactDistanceJointBodyDef.Initialize(contact.GetFixtureB().m_body, contact.GetFixtureA().m_body, contact.GetFixtureB().m_body.GetWorldPoint(leftPointB), contact.GetFixtureA().m_body.GetWorldPoint(leftPointA));
						leftcontactDistanceJointBodyDef.collideConnected = true;
						this.b2world.CreateJoint(leftcontactDistanceJointBodyDef); 
						rightcontactDistanceJointBodyDef = new b2DistanceJointDef();
						rightcontactDistanceJointBodyDef.Initialize(contact.GetFixtureB().m_body, contact.GetFixtureA().m_body, contact.GetFixtureB().m_body.GetWorldPoint(rightPointB), contact.GetFixtureA().m_body.GetWorldPoint(rightPointA));
						rightcontactDistanceJointBodyDef.collideConnected = true;
						this.b2world.CreateJoint(rightcontactDistanceJointBodyDef); 
						bdata.contactType = atype;
						bdata.contactFixture = contact.GetFixtureA();
					}
				}
			} else if (atype == "compShape" && btype == "compShape")
			{ // In the case where two shapes are touching each other, if one is touching the pan then set up the other one as well.

				if (adata.contactType == null && (bdata.contactType == "leftPan" || bdata.contactType == "rightPan"))
				{
					var bodyvertices = contact.GetFixtureA().m_shape.m_vertices;
					var min_x = 100, max_x = -100, min_y = 100, max_y = -100;
					for (var i = 0; i < bodyvertices.length; i++)
					{
						if (bodyvertices[i].x < min_x) min_x = bodyvertices[i].x;
						if (bodyvertices[i].x > max_x) max_x = bodyvertices[i].x;
						if (bodyvertices[i].y < min_y) min_y = bodyvertices[i].y;
						if (bodyvertices[i].y > max_y) max_y = bodyvertices[i].y;
					}
					var leftPointA = new b2Vec2();  leftPointA.Set (min_x, min_y);
					var rightPointA = new b2Vec2(); rightPointA.Set (max_x, min_y);

					bodyvertices = bdata.contactFixture.m_shape.m_vertices;
					var min_x = 100, max_x = -100, min_y = 100, max_y = -100;
					for (var i = 0; i < bodyvertices.length; i++)
					{
						if (bodyvertices[i].x < min_x) min_x = bodyvertices[i].x;
						if (bodyvertices[i].x > max_x) max_x = bodyvertices[i].x;
						if (bodyvertices[i].y < min_y) min_y = bodyvertices[i].y;
						if (bodyvertices[i].y > max_y) max_y = bodyvertices[i].y;
					}
					var leftPointB = new b2Vec2();  leftPointB.Set (min_x, min_y);
					var rightPointB = new b2Vec2(); rightPointB.Set (max_x, min_y);

					leftcontactDistanceJointBodyDef = new b2DistanceJointDef();
					leftcontactDistanceJointBodyDef.Initialize(contact.GetFixtureA().m_body, bdata.contactFixture.m_body, contact.GetFixtureA().m_body.GetWorldPoint(leftPointA), bdata.contactFixture.m_body.GetWorldPoint(leftPointB));
					leftcontactDistanceJointBodyDef.collideConnected = true;
					this.b2world.CreateJoint(leftcontactDistanceJointBodyDef); 
					rightcontactDistanceJointBodyDef = new b2DistanceJointDef();
					rightcontactDistanceJointBodyDef.Initialize(contact.GetFixtureA().m_body, bdata.contactFixture.m_body, contact.GetFixtureA().m_body.GetWorldPoint(rightPointA), bdata.contactFixture.m_body.GetWorldPoint(rightPointB));
					rightcontactDistanceJointBodyDef.collideConnected = true;
					this.b2world.CreateJoint(rightcontactDistanceJointBodyDef); 
					adata.contactType = btype;
					adata.contactFixture = bdata.contactFixture;

				} else if (bdata.contactType == null && (adata.contactType == "leftPan" || adata.contactType == "rightPan"))
				{
					var bodyvertices = contact.GetFixtureB().m_shape.m_vertices;
					var min_x = 100, max_x = -100, min_y = 100, max_y = -100;
					for (var i = 0; i < bodyvertices.length; i++)
					{
						if (bodyvertices[i].x < min_x) min_x = bodyvertices[i].x;
						if (bodyvertices[i].x > max_x) max_x = bodyvertices[i].x;
						if (bodyvertices[i].y < min_y) min_y = bodyvertices[i].y;
						if (bodyvertices[i].y > max_y) max_y = bodyvertices[i].y;
					}
					var leftPointA = new b2Vec2();  leftPointA.Set (min_x, min_y);
					var rightPointA = new b2Vec2(); rightPointA.Set (max_x, min_y);

					bodyvertices = adata.contactFixture.m_shape.m_vertices;
					var min_x = 100, max_x = -100, min_y = 100, max_y = -100;
					for (var i = 0; i < bodyvertices.length; i++)
					{
						if (bodyvertices[i].x < min_x) min_x = bodyvertices[i].x;
						if (bodyvertices[i].x > max_x) max_x = bodyvertices[i].x;
						if (bodyvertices[i].y < min_y) min_y = bodyvertices[i].y;
						if (bodyvertices[i].y > max_y) max_y = bodyvertices[i].y;
					}
					var leftPointB = new b2Vec2();  leftPointB.Set (min_x, min_y);
					var rightPointB = new b2Vec2(); rightPointB.Set (max_x, min_y);

					leftcontactDistanceJointBodyDef = new b2DistanceJointDef();
					leftcontactDistanceJointBodyDef.Initialize(adata.contactFixture.m_body, contact.GetFixtureA().m_body, adata.contactFixture.m_body.GetWorldPoint(leftPointB), contact.GetFixtureA().m_body.GetWorldPoint(leftPointA));
					leftcontactDistanceJointBodyDef.collideConnected = true;
					this.b2world.CreateJoint(leftcontactDistanceJointBodyDef); 
					rightcontactDistanceJointBodyDef = new b2DistanceJointDef();
					rightcontactDistanceJointBodyDef.Initialize(adata.contactFixture.m_body, contact.GetFixtureA().m_body, adata.contactFixture.m_body.GetWorldPoint(rightPointB), contact.GetFixtureA().m_body.GetWorldPoint(rightPointA));
					rightcontactDistanceJointBodyDef.collideConnected = true;
					this.b2world.CreateJoint(rightcontactDistanceJointBodyDef); 
					bdata.contactType = atype;
					bdata.contactFixture = adata.contactFixture;
				}
			}

		}
		
		*/
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
				if (this.hitTest(lp.x-o.width_px_left, lp.y-o.height_px_above) && this.hitTest(lp.x+o.width_px_right, lp.y+o.height_px_below))
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
		this.addChild(o);
		o.x = x;
		o.y = y;
		
		o.world = this;
		
		var bodyDef = o.bodyDef;
		bodyDef.position.x = (this.x + x) / SCALE;
		bodyDef.position.y = (this.y + y) / SCALE;
			
		var body = o.body = this.b2world.CreateBody(bodyDef);
	
		for (var i = 0; i < o.fixDefs.length; i++)
		{
			var fixDef = o.fixDefs[i];
			body.CreateFixture(fixDef);

		}
		this.actors.push(o);

		// friction joint
		var zerop = new b2Vec2();
		zerop.Set(0, 0);
		// get bottom point of object
		var op = new b2Vec2();
		var xb = body.GetWorldPoint(zerop).x + o.width_px_right / 2 / SCALE; 
		var yb = body.GetWorldPoint(zerop).y + o.height_px_below / SCALE; 
		op.Set(xb, yb)
		console.log(op.x, op.y);
		
		
		//var frictionJointDef = new b2FrictionJointDef();
		//frictionJointDef.Initialize(body, this.floor, op);
		//console.log(leftPanFrictionJointDef.localAnchorA, leftPanFrictionJointDef.localAnchorB);
		//frictionJointDef.localAnchorB = zerop;
		//console.log(leftPanFrictionJointDef.localAnchorA, leftPanFrictionJointDef.localAnchorB);
		//frictionJointDef.maxForce = 1;
		//frictionJointDef.maxTorque = 0;
		//frictionJointDef.collideConnected = true;
		//o.frictionJoint = this.b2world.CreateJoint (frictionJointDef);
		/*
		var leftPanFrictionJointDef = new b2FrictionJointDef();
		leftPanFrictionJointDef.Initialize(body, this.leftPan, op);
		console.log(leftPanFrictionJointDef.localAnchorA, leftPanFrictionJointDef.localAnchorB);
		leftPanFrictionJointDef.localAnchorB = zerop;
		console.log(leftPanFrictionJointDef.localAnchorA, leftPanFrictionJointDef.localAnchorB);
		leftPanFrictionJointDef.maxForce = 5;
		leftPanFrictionJointDef.maxTorque = 0;
		leftPanFrictionJointDef.collideConnected = true;
		o.leftPanFrictionJoint = this.b2world.CreateJoint (leftPanFrictionJointDef);
		*/
		
	}

	p.removeObject = function (o)
	{
		this.removeChild(o);
		this.actors.splice(this.actors.indexOf(this), 1);
		this.b2world.DestroyBody(o.body);
		o.world = undefined;		
	}
	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
		var i;
		for(i = 0; i < this.actors.length; i++)
		{
			this.actors[i].update();
		}
		//console.log(this.leftPanJoint.GetJointAngle(), this.leftPanJoint.GetLowerLimit(), this.leftPanJoint.GetUpperLimit());
		// adjust pans and beam
		this.leftPanJoint.SetLimits(this.beamJoint.GetJointAngle(), this.beamJoint.GetJointAngle());
		this.rightPanJoint.SetLimits(this.beamJoint.GetJointAngle(), this.beamJoint.GetJointAngle());
		var zerop = new b2Vec2();
		zerop.Set(0, 0);
		this.beamShape.x = this.beam.GetWorldPoint(zerop).x * SCALE - this.world_dx;
		this.beamShape.y = this.beam.GetWorldPoint(zerop).y * SCALE - this.world_dy;
		this.beamShape.rotation = this.beam.GetAngle() * 180 / Math.PI;

		this.leftPanShape.x = this.leftPan.GetWorldPoint(zerop).x * SCALE - this.world_dx;
		this.leftPanShape.y = this.leftPan.GetWorldPoint(zerop).y * SCALE - this.world_dy;
		this.leftPanShape.rotation = this.leftPan.GetAngle() * 180 / Math.PI;

		this.rightPanShape.x = this.rightPan.GetWorldPoint(zerop).x * SCALE - this.world_dx;
		this.rightPanShape.y = this.rightPan.GetWorldPoint(zerop).y * SCALE - this.world_dy;
		this.rightPanShape.rotation = this.rightPan.GetAngle() * 180 / Math.PI;

		this.b2world.Step(1/Ticker.getFPS(), 10, 10);
		if (DEBUG) this.b2world.DrawDebugData();
	}
	
	
	window.Balanceb2World = Balanceb2World;
}(window));
