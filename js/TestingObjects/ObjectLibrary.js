(function (window)
{
	/** Creates a menu with the names of the materials */
	function ObjectLibrary (width_px, height_px, shape_width_px, shape_height_px, shape_dx, shape_dy)
	{
		this.initialize(width_px, height_px, shape_width_px, shape_height_px, shape_dx, shape_dy);
	}
	var p = ObjectLibrary.prototype = new Container();
	p.Container_initialize = ObjectLibrary.prototype.initialize;
	p.Container_tick = p._tick;
	p.TEXT_COLOR = "rgba(0,0,0,1.0)";
	p.BACKGROUND_COLOR = "rgba(255,245,245,1.0)";
	
	p.initialize = function(width_px, height_px, shape_width_px, shape_height_px, shape_dx, shape_dy)
	{
		this.Container_initialize();
		this.width_px = width_px;
		this.height_px = height_px;
		this.shape_width_px = shape_width_px;
		this.shape_height_px = shape_height_px;
		this.shape_dx = shape_dx;
		this.shape_dy = shape_dy;
		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.addChild(this.shape);

		// text
		this.title = new TextContainer("Library", "20px Arial", this.TEXT_COLOR, shape_width_px, shape_height_px, this.BACKGROUND_COLOR, this.BACKGROUND_COLOR, 0, "center", "center");
		this.addChild(this.title);
		
	
		this.g.beginFill(this.BACKGROUND_COLOR);
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();

		this.shapes = new Array();
		this.num_rows = Math.floor((this.height_px)/shape_height_px)
		this.num_cols = Math.floor((this.width_px)/shape_width_px);

		this.num_shapes = 0;
		stage.ready_to_update = true;
	}

	p.addObject = function (o)
	{
		var index = this.shapes.length + 1;
		if (index < this.num_rows * this.num_cols)
		{
			this.addChild(o);
			o.x = (index % this.num_cols) * this.shape_width_px + this.shape_dx;
			o.y = Math.floor(index / this.num_cols) * this.shape_height_px + this.shape_dy;
			this.shapes.push(o);

			// add html buttons
			var b_id = "library-button-" + this.num_shapes;
			var htmlText = '<input type="submit" id="' + b_id + '" style="font-size:14px"/>';
			$('#library-button-holder').append(htmlText);
			var htmlElement = $("#"+b_id)
				.button({
                    label: "Actions",
                    icons: {
                        primary: 'ui-icon-triangle-1-s'
                    }
                })
				.bind('click', {parent: this}, this.buttonActions);
			var element = new DOMElement(htmlElement[0]);
			this.addChild(element);
			element.x = o.x;
			element.y = this.height_px - 20;
			this.num_shapes++;
		}
	}

	p.removeObject= function (o)
	{
		var index = this.shapes.indexOf(o);
		this.shapes.splice(index, 1);
		// move shapes below up
		var i;
		for (i = index; i < this.shapes.length; i++)
		{
			var s = this.shapes[i];
			var new_index = i + 1;
			s.x = (new_index % this.num_cols) * this.shape_width_px + this.shape_dx;
			s.y = Math.floor(new_index / this.num_cols) * this.shape_height_px + this.shape_dy;
		}

	}

	p.buttonActions = function (evt)
	{
		console.log(evt);
	}

	p._tick = function()
	{
		this.Container_tick();
	}

	p.redraw = function()
	{
		stage.ready_to_update = true;
			
	}
	
	window.ObjectLibrary = ObjectLibrary;
}(window));
