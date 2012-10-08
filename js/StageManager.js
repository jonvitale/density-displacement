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
        , b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController;
        ;

        var DEBUG = true;
        var SCALE = 20;
        var PADDING = 10;
        var MATERIAL_TYPES = ["full", "center3", "center1", "ends"];
	
        var STAGE_WIDTH = 810;
			var STAGE_HEIGHT = 680;
			var UNIT_TO_PIXEL = 20;
			var METER_TO_UNIT = 100;
			var PADDING = 8;
			var canvas;
			var stage;
			var stageManager;
			
			/// EASEL JS FUNCTIONALITY
			function init()
			{
				canvas = document.getElementById("canvas");
				stage = new Stage(canvas);
				stage.needs_to_update = true;
				stageManager = new StageManager(stage);
				// setup buttons for volume viewer	
				element = new DOMElement(document.getElementById("makeObjectForm"));
				stageManager.addToStage(element, "makeObjectForm");
				element = new DOMElement(document.getElementById("builder_view_sideAngle_slider"));
				stageManager.addToStage(element, "builder_view_sideAngle_slider");
				element = new DOMElement(document.getElementById("builder_view_topAngle_slider"));
				stageManager.addToStage(element, "builder_view_topAngle_slider");
				Ticker.setFPS(24);
				Ticker.addListener(window);
			}
			function tick() { stageManager.tick();}

			// BUTTON INTERACTION 
			function createObject() {
				stageManager.makeObject(); 
			}
			function updateBuilder_view_sideAngle(d) {stageManager.updateBuilder_view_sideAngle(d);}
			function updateBuilder_view_topAngle(d) {stageManager.updateBuilder_view_topAngle(d);}
	
(function (window)
{

	function StageManager (stage)
	{
		stage.mouseEventsEnabled = true;
		stage.enableMouseOver();
		this.stage = stage;
		this.stage.needs_to_update = true;

		this.materialNameDisplayMapping = {"DWood":"Wood A", "LWood":"Wood B", "Metal":"Metal", "Plastic":"Plastic"}
		this.materialNameMaxMapping = {"DWood":[2, 1, 1, 1], "LWood":[1, 1, 1, 1], "Metal":[1, 1, 1, 1], "Plastic":[1, 1, 1, 1]}
		//this.materialNameMassMapping = {"DWood": 1.25, "LWood": 0.75, "Metal": 1.5, "Plastic": 0.625}
		this.materialNameMassMapping = {"DWood": 1.25, "LWood": 0.75, "Metal": 1.5, "Plastic": 0.5}
		this.view_sideAngle = 10*Math.PI/180;
		this.view_topAngle = 20*Math.PI/180;
		// setup builder
		this.builder = new ObjectBuildingPanel(STAGE_WIDTH, 200, this.materialNameDisplayMapping, this.materialNameMaxMapping, this.view_sideAngle, this.view_topAngle);
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
			o.x = this.builder.width_px / 2 + 2 * PADDING;
			o.y = PADDING * 2;
		} else if (name == "builder_view_sideAngle_slider")
		{
			o.x = this.builder.width_px / 2 + (this.builder.width_px / 2 - 100) / 2 ;
			//o.x = this.builder.width_px / 2 + 2 * PADDING;
			o.y = this.builder.height_px - 2 * PADDING;
		} else if (name == "builder_view_topAngle_slider")
		{
			o.x = this.builder.width_px - 4 * PADDING;
			o.y = 4 * PADDING;
		}
	}
	p.removeFromStage = function(o)
	{
		this.stage.removeChild(o);
	}

	//////////////////// SPECIFIC FUNCTIONS FOR BUTTON INTERACTION //////////////////////
	p.makeObject = function()
	{
		if (this.builder.validObject())
		{
			var blockArray3d = this.builder.saveObject();
			var json = JSON.stringify(blockArray3d);
			console.log(JSON.stringify(blockArray3d));
			var compShape = new BlockCompShape(SCALE, SCALE, SCALE, blockArray3d, this.materialNameMassMapping, this.view_sideAngle, this.view_topAngle);
			this.tester.addObjectToLibrary(compShape);
		} else 
		{
			console.log("no object to make");
		}
	}
	p.updateBuilder_view_sideAngle = function(degrees)
	{
		this.builder.update_view_sideAngle(degrees);
	}	
	p.updateBuilder_view_topAngle = function(degrees)
	{
		this.builder.update_view_topAngle(degrees);
	}
	
	window.StageManager = StageManager;
}(window));
