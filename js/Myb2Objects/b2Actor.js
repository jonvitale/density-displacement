(function (window)
{

	function b2Actor (compShape, SCALE)
	{
		this.initialize (compShape, SCALE);
	}

	var p = b2Actor.prototype = new Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;


	p.initialize = function (compShape, SCALE)
	{
		this.Container_initialize();
		this.compShape = compShape;
		this.SCALE = SCALE;

		this.addChild(this.compShape);
		this.width_px_left = compShape.width_px_left;
		this.width_px_right = compShape.width_px_right;
		this.height_px_above = compShape.height_px_above;
		this.height_px_below = compShape.height_px_below;

		this.world = undefined;
		// create an array of Fixture Definitions and Body Definitions and put them in relative space from each other
		this.fixDefs = new Array();
		
		var bodyDef = this.bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.position.x = 0;
		bodyDef.position.y = 0;
		bodyDef.userData = {"type":"compShape", "contact":null};

		var i, j;
		for (i = 0; i < compShape.massArray2d.length; i++)
		{
			for (j = 0; j < compShape.massArray2d[i].length; j++)
			{
				if (compShape.massArray2d[i][j] > 0)
				{
					var fixDef = new b2FixtureDef;
					fixDef.density = compShape.massArray2d[i][j];
					fixDef.friction = 1.0;
					fixDef.restitution = 0.2;
					var vec = new b2Vec2();
					vec.Set (((i+0.5)*compShape.unit_width_px)/this.SCALE, ((j+0.5)*compShape.unit_width_px)/this.SCALE);
					fixDef.shape = new b2PolygonShape;
					fixDef.shape.SetAsOrientedBox(compShape.unit_width_px/2/this.SCALE, (compShape.unit_height_px/2/this.SCALE), vec, 0.0);

					this.fixDefs.push(fixDef);
				}					
			}
		}
	}

	p.addToWorld = function(world, x, y)
	{
		world.addChild(this);
		this.x = x;
		this.y = y;
		
		this.world = world;
		
		var bodyDef = this.bodyDef;
		bodyDef.position.x = (world.x + x) / this.SCALE;
		bodyDef.position.y = (world.y + y) / this.SCALE;
			
		var body = this.body = world.b2world.CreateBody(bodyDef);
	
		for (var i = 0; i < this.fixDefs.length; i++)
		{
			var fixDef = this.fixDefs[i];
			body.CreateFixture(fixDef);

		}
		world.actors.push(this);
		
	}
	p.removeFromWorld = function (world)
	{
		world.removeChild(this);
		world.actors.splice(world.actors.indexOf(this), 1);
		world.b2world.DestroyBody(this.body);
		this.world = undefined;
	}

	p.update = function ()
	{
		if (this.body != undefined && this.parent != undefined)
		{
			var vec = new b2Vec2()
			vec.Set(0, 0);
			this.x = (this.body.GetWorldPoint(vec).x) * this.SCALE  - this.parent.x;
			this.y = (this.body.GetWorldPoint(vec).y ) * this.SCALE - this.parent.y;
			this.rotation = this.body.GetAngle() * (180 / Math.PI);
		}
	}
	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	
	window.b2Actor = b2Actor;
}(window));
