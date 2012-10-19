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
        , b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
        , b2ContactListener = Box2D.Dynamics.b2ContactListener
        , b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController;
        ;

      //  <script src="js/DensityParameters.json"></script>
		
		

        // GLOBAL VARIABLES, with default values
        var GLOBAL_PARAMETERS =
        {
       		"DEBUG" : true,
	        "SCALE" : 20,
	        "PADDING" : 10,
	        "STAGE_WIDTH" : 810,
			"STAGE_HEIGHT" : 680,
			"PADDING" : 8,
			"materials": null,
			"view_sideAngle" : 10*Math.PI/180,
			"view_topAngle" : 20*Math.PI/180,
			"fluid_density" : 1.0,
			"fluid_color" : "rgba(220,200,255,0.4)",
			"fluid_stroke_color" : "rgba(120,100,255,0.4)",
			"separation_width" : 4,
			"separation_density" : 1.0,
			"water_volume_perc" : 0.50,
			"fill_spilloff_by_height": true,
			"spilloff_volume_perc" : 0.50
        }
        
		
		// load parameters file to overwrite defaults
		$.getJSON("DensityParameters.json", function(data) {
			for (var key in data)
			{
				GLOBAL_PARAMETERS[key] = data[key];
			}
			if (typeof(GLOBAL_PARAMETERS.view_sideAngle_degrees) != "undefined") GLOBAL_PARAMETERS.view_sideAngle = GLOBAL_PARAMETERS.view_sideAngle_degrees * Math.PI / 180;
			if (typeof(GLOBAL_PARAMETERS.view_topAngle_degrees) != "undefined") GLOBAL_PARAMETERS.view_topAngle = GLOBAL_PARAMETERS.view_topAngle_degrees * Math.PI / 180;
			init();
		});     
		

		// GLOBAL OBJECTS			
		var canvas;
		var stage;
		var builder;
		var tester;
		
		function init()
		{
			canvas = document.getElementById("canvas");
			stage = new Stage(canvas);
			stage.mouseEventsEnabled = true;
			stage.enableMouseOver();
			//this.stage = stage;
			stage.needs_to_update = true;
			//densityMain = new DensityMain(stage);
			
			// setup builder
			builder = new ObjectBuildingPanel(GLOBAL_PARAMETERS.STAGE_WIDTH, 200);
			stage.addChild(builder);

			tester = new ObjectTestingPanel(GLOBAL_PARAMETERS.STAGE_WIDTH, GLOBAL_PARAMETERS.STAGE_HEIGHT-builder.height_px, builder.vv.width_px, builder.vv.height_px, builder.vv.width_from_depth, builder.vv.height_from_depth);
			stage.addChild(tester);
			tester.y = builder.height_px;	

			// setup buttons for volume viewer	
			element = new DOMElement(document.getElementById("makeObjectForm"));
			addToStage(element, "makeObjectForm");
			element = new DOMElement(document.getElementById("builder_view_sideAngle_slider"));
			addToStage(element, "builder_view_sideAngle_slider");
			element = new DOMElement(document.getElementById("builder_view_topAngle_slider"));
			addToStage(element, "builder_view_topAngle_slider");
			

			Ticker.setFPS(24);
			Ticker.addListener(window);
		}

		function addToStage(o, name)
		{
			stage.addChild(o);
			if (name == "makeObjectForm")
			{
				o.x = builder.width_px / 2 + 2 * GLOBAL_PARAMETERS.PADDING;
				o.y = GLOBAL_PARAMETERS.PADDING * 2;
			} else if (name == "builder_view_sideAngle_slider")
			{
				o.x = builder.width_px / 2 + (builder.width_px / 2 - 100) / 2 ;
				o.y = builder.height_px - 2 * GLOBAL_PARAMETERS.PADDING;
			} else if (name == "builder_view_topAngle_slider")
			{
				o.x = builder.width_px - 4 * GLOBAL_PARAMETERS.PADDING;
				o.y = 4 * GLOBAL_PARAMETERS.PADDING;
			}
		}
		function removeFromStage(o)
		{
			stage.removeChild(o);
		}

		function tick() 
		{ 
			tester._tick();
			if (stage.needs_to_update)
			{
				stage.update();
			}
		}

		// BUTTON INTERACTION 
		function createObject() 
		{
			if (builder.validObject())
			{
				var savedObject = builder.saveObject();
				var json = JSON.stringify(savedObject);
				console.log(JSON.stringify(savedObject));
				var compShape; 
				if (savedObject.isContainer)
				{
					compShape = new ContainerCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, savedObject);
				} else
				{
					compShape = new BlockCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, savedObject);
				}
				tester.addObjectToLibrary(compShape);
			} else 
			{
				console.log("no object to make");
			}
		}
		function updateBuilder_view_sideAngle(degrees)
		{
			builder.update_view_sideAngle(degrees);
		}
		function updateBuilder_view_topAngle(degrees) 
		{
			builder.update_view_topAngle(degrees);
		}




