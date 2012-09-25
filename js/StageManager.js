//Global variables
		// setup variables for box2d
		var   b2Vec2 = Box2D.Common.Math.b2Vec2
        , b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
        , b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
        , b2FrictionJointDef = Box2D.Dynamics.Joints.b2FrictionJointDef
        , b2ContactListener = Box2D.Dynamics.b2ContactListener
        , b2RayCastInput = Box2D.Collision.b2RayCastInput
        , b2RayCastOutput = Box2D.Collision.b2RayCastOutput
        ;

        var DEBUG = true;
        var SCALE = 20;
        var PADDING = 10;

(function (window)
{

	function StageManager (stage)
	{
		stage.mouseEventsEnabled = true;
		stage.enableMouseOver();
		this.stage = stage;
		this.stage.needs_to_update = true;

		this.materialNameDisplayMapping = {"DWood":"Wood A", "LWood":"Wood B", "Metal":"Metal", "Plastic":"Plastic"}
		this.materialNameMassMapping = {"DWood": 1.25, "LWood": 0.75, "Metal": 1.5, "Plastic": 0.0625}
		this.view_sideAngle = 10*Math.PI/180;
		this.view_topAngle = 20*Math.PI/180;
		// setup builder
		this.builder = new ObjectBuildingPanel(STAGE_WIDTH, 200, this.materialNameDisplayMapping, this.view_sideAngle, this.view_topAngle);
		this.stage.addChild(this.builder);

		this.tester = new ObjectTestingPanel(STAGE_WIDTH, STAGE_HEIGHT-this.builder.height_px, this.builder.vv.width_px, this.builder.vv.height_px, this.builder.vv.width_from_depth, this.builder.vv.height_from_depth, this.view_sideAngle, this.view_topAngle);
		this.stage.addChild(this.tester);
		this.tester.y = this.builder.height_px;
		
	}

	var p = StageManager.prototype

	/** Tick function called on every step, if update, redraw */
	p.tick = function ()
	{
		this.tester._tick();
		if (this.stage.needs_to_update)
		{
			this.stage.update();
		}
	}
	p.addToStage = function(o, name)
	{
		this.stage.addChild(o);
		if (name == "makeObjectForm")
		{
			o.x = this.builder.vv.x - this.builder.vv.width_px + 10;
			o.y = this.builder.vv.y + this.builder.vv.height_px + 10;
		}
	}
	p.removeFromStage = function(o)
	{
		this.stage.removeChild(o);
	}

	//////////////////// SPECIFIC FUNCTIONS FOR BUTTON INTERACTION //////////////////////
	p.makeObject = function()
	{
		var blockArray3d = this.builder.saveObject();
		var compShape = new BlockCompShape(SCALE, SCALE, SCALE, blockArray3d, this.materialNameMassMapping, SCALE/2*Math.PI/180, SCALE*Math.PI/180);
		this.tester.addObjectToLibrary(compShape);
	}
	
	window.StageManager = StageManager;
}(window));
