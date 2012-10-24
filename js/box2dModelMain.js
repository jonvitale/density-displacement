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
			"materials": {},
			"view_sideAngle" : 10*Math.PI/180,
			"view_topAngle" : 20*Math.PI/180,
			"fluid_density" : 1.0,
			"fluid_color" : "rgba(220,200,255,0.4)",
			"fluid_stroke_color" : "rgba(120,100,255,0.4)",
			"fluid_color_container" : "rgba(220,200,255,0.4)",
			"fluid_stroke_color_container" : "rgba(120,100,255,0.4)",
			"separation_width" : 4,
			"separation_density" : 1.0,
			"water_volume_perc" : 0.50,
			"fill_spilloff_by_height": true,
			"spilloff_volume_perc" : 0.50,
			"objectLibrary":{}
        }
        
		
		// load parameters file to overwrite defaults
		$.getJSON('box2dModelParameters.json', function(data) {
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
		var eventLogger;
		
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

			// setup the event logger
			eventLogger = new EventLogger();

			// setup buttons for volume viewer	
			var element = new DOMElement(document.getElementById("make-object"));
			stage.addChild(element);
			element.x = builder.width_px / 2 + 2 * GLOBAL_PARAMETERS.PADDING;
			element.y = GLOBAL_PARAMETERS.PADDING * 2;
			
			element = new DOMElement(document.getElementById("slider-sideAngle"));
			stage.addChild(element);
			element.x = builder.x + builder.width_px / 2 + (builder.width_px / 2 - 100) / 2 ;
			element.y = builder.y + builder.height_px - 2 * GLOBAL_PARAMETERS.PADDING;
			
			element = new DOMElement(document.getElementById("slider-topAngle"));
			stage.addChild(element);
			element.x = builder.x + builder.width_px - 4 * GLOBAL_PARAMETERS.PADDING;
			element.y = builder.y + 4 * GLOBAL_PARAMETERS.PADDING;
			
			var htmlElement;
			// jquery ui
			 $(function() {
		        htmlElement = $( "input[id='make-object']" )
		            .button()
		            .click(function( event ) {
		                event.preventDefault();
		                createObjectFromBuilder();
		            });
		         //console.log(htmlElement);   
		    });

			$(function() {
			    $( "#slider-topAngle" ).slider({
                   orientation: "vertical",
                   range: "min",
                   min: 0,
                   max: 90,
                   value: 20,
                   step: 10,
                   slide: function( event, ui ) {
                       $( "#amount" ).val( ui.value );
                       builder.update_view_topAngle(ui.value);
                   }
               });
		       $( "#amount" ).val( $( "#slider-topAngle" ).slider( "value" ) );
			 });

			$(function() {
			    $( "#slider-sideAngle" ).slider({
                   range: "min",
                   min: 0,
                   max: 90,
                   value: 10,
                   step: 10,
                   slide: function( event, ui ) {
                       $( "#amount" ).val( ui.value );
                       builder.update_view_sideAngle(ui.value);
                   }
               });
		       $( "#amount" ).val( $( "#slider-sideAngle" ).slider( "value" ) );
			 });

			// make all objects given in parameters
			for (var i = 0; i < GLOBAL_PARAMETERS.objectLibrary.length; i++)
			{
				this.createObject(GLOBAL_PARAMETERS.objectLibrary[i]);
			}
			GLOBAL_PARAMETERS.num_initial_objects = GLOBAL_PARAMETERS.objectLibrary.length;

			Ticker.setFPS(24);
			Ticker.addListener(window);
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
		function createObjectFromBuilder() 
		{
			if (builder.validObject())
			{
				var savedObject = builder.saveObject();
				var json = JSON.stringify(savedObject);
				
				// save to global parameters
				GLOBAL_PARAMETERS.objectLibrary.push(savedObject);
				createObject(savedObject);
			} else 
			{
				console.log("no object to make");
			}
		}

		function createObject(savedObject)
		{
			var compShape;
			console.log(JSON.stringify(savedObject));
			if (savedObject.is_container)
			{
				compShape = new ContainerCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, savedObject);
			} else
			{
				compShape = new BlockCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, savedObject);
			}
			eventLogger.addEvent("make", "", [savedObject]);
			tester.addObjectToLibrary(compShape);
		}




