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

		// create an array of Fixture Definitions and Body Definitions and put them in relative space from each other
		this.fixDefs = new Array();
		this.bodyDefs = new Array();
		
		var i, j;
		for (i = 0; i < compShape.massArray2d.length; i++)
		{
			for (j = 0; j < compShape.massArray2d[i].length; j++)
			{
				if (compShape.massArray2d[i][j] > 0)
				{
					var fixDef = new b2FixtureDef;
					fixDef.density = 1.0;
					fixDef.frictin = 0.5;
					fixDef.restitution = 0.2;
					fixDef.shape = new b2PolygonShape;
					fixDef.shape.SetAsBox(compShape.unit_width_px/2/this.SCALE, (compShape.unit_height_px/2/this.SCALE));

					var bodyDef = new b2BodyDef;
					bodyDef.type = b2Body.b2_dynamicBody;
					bodyDef.position.x = (i * compShape.unit_width_px)/this.SCALE;
					bodyDef.position.y = (j * compShape.unit_height_px)/this.SCALE;

					if (i == 0 && this.leftBodyDef == undefined) this.leftBodyDef = bodyDef;
					if (j == 0 && this.topBodyDef == undefined) this.topBodyDef = bodyDef;	

					this.fixDefs.push(fixDef);
					this.bodyDefs.push(bodyDef);
				}					
			}
		}
	}
	p.addToWorld = function(world, x, y)
	{
		this.x = x;
		this.y = y;
		this.world = world;
		this.bodys = new Array();
		
		world.addChild(this);

		var i;
		for (i = 0; i < this.bodyDefs.length; i++)
		{
			var bodyDef = this.bodyDefs[i];
			var fixDef = this.fixDefs[i];
			//console.log(i, "before", bodyDef.position.x, bodyDef.position.y);
			bodyDef.position.x += (world.x + x) / this.SCALE;
			bodyDef.position.y += (world.y + y) / this.SCALE;
			//console.log(i, "after", bodyDef.position.x, bodyDef.position.y);
			
			var body = world.b2world.CreateBody(bodyDef);
			body.CreateFixture(fixDef);
			this.bodys.push(body);

			if (bodyDef == this.leftBodyDef) this.leftBody = body;
			if (bodyDef == this.topBodyDef) this.topBody = body;

		}
		world.actors.push(this);
	}

	p.update = function ()
	{
		if (this.leftBody != undefined && this.topBody != undefined && this.parent != undefined)
		{
			this.x = (this.leftBody.GetWorldCenter().x) * this.SCALE  - this.parent.x;
			this.y = (this.topBody.GetWorldCenter().y ) * this.SCALE - this.parent.y;
			this.rotation = this.leftBody.GetAngle() * (180 / Math.PI);
			//console.log("this", this.x, this.y, "b2", this.body.GetWorldCenter().x, this.body.GetWorldCenter().y);
		}
	}
	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	
	window.b2Actor = b2Actor;
}(window));
