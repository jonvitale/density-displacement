(function (window)
{

	function b2Actor (compShape)
	{
		this.initialize (compShape);
	}

	var p = b2Actor.prototype = new Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;


	p.initialize = function (compShape)
	{
		this.Container_initialize();
		this.compShape = compShape;

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
		bodyDef.userData = {"skin":compShape}

		this.constructFixtures();
		
	}
	p.constructFixtures = function ()
	{
		var i, j;
		var compShape = this.compShape;
		for (i = 0; i < compShape.array2d.length; i++)
		{
			for (j = 0; j < compShape.array2d[i].length; j++)
			{
				var fixDef = new b2FixtureDef;
				fixDef.density = compShape.array2d[i][j].mass*1;
				fixDef.friction = 0.5;
				fixDef.restitution = 0.2;
				fixDef.filter.categoryBits = 1;
				fixDef.filter.maskBits = 3;
				var vec = new b2Vec2();
				vec.Set (((i+0.5)*compShape.unit_width_px)/SCALE, ((j+0.5)*compShape.unit_width_px)/SCALE);
				fixDef.shape = new b2PolygonShape;
				fixDef.shape.SetAsOrientedBox(compShape.unit_width_px/2/SCALE, (compShape.unit_height_px/2/SCALE), vec, 0.0);
				// we need information about how many open spaces are in this fixture
				fixDef.totalSpaces = compShape.array2d[i][j].totalSpaces;
				fixDef.materialSpaces = compShape.array2d[i][j].materialSpaces;
				fixDef.exteriorSpaces = compShape.array2d[i][j].exteriorSpaces;
				fixDef.interiorSpaces = compShape.array2d[i][j].interiorSpaces;
				fixDef.protectedSpaces = compShape.array2d[i][j].protectedSpaces;
				fixDef.materialDensity = compShape.array2d[i][j].mass / compShape.array2d[i][j].materialSpaces;
				this.fixDefs.push(fixDef);							
			}
		}
	}
	
	p.update = function ()
	{
		if (this.body != undefined && this.parent != undefined)
		{
			var vec = new b2Vec2()
			vec.Set(0, 0);
			this.x = (this.body.GetWorldPoint(vec).x) * SCALE  - this.parent.x;
			this.y = (this.body.GetWorldPoint(vec).y ) * SCALE - this.parent.y;
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
