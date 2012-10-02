(function (window)
{
	/** Construct a container with a background color and text 
	default values:
	width_px, height_px: 0 (on zero, replace with width and height of text)
	backgroundColor: white
	hAlign, vAlign: location of text within container - "left", "center", "right", "top", "bottom"
	*/
	var TextContainer = function(textString, font, textColor, width_px, height_px, backgroundColor, strokeColor, strokeSize, hAlign, vAlign)
	{
		this.textString = textString;
		this.font = font;
		this.textColor = textColor;
		this.width_px = (typeof width_px === "undefined") ? 0 : width_px;
		this.height_px = (typeof height_px === "undefined") ? 0 : height_px;
		this.backgroundColor = (typeof backgroundColor === "undefined") ? "rgba(255,255,255,1.0)" : backgroundColor;
		this.strokeColor = (typeof strokeColor === "undefined") ? this.backgroundColor : strokeColor;
		this.strokeSize = (typeof strokeSize === "undefined") ? 0 : strokeSize;
		this.hAlign = (typeof hAlign === "undefined") ? "center" : hAlign;
		this.vAlign = (typeof vAlign === "undefined") ? "center" : vAlign;
		this.initialize();
	}
	var p = TextContainer.prototype = new Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
		p.mouseEnabled = true;
	p.Container_tick = p._tick;

	p.initialize = function()
	{
		this.Container_initialize();

		//background
		this.g = new Graphics();
		this.shape = new Shape(this.g);
		this.shape.mouseEventsEnabled = true;
		// set this object's mouse listeners to that of underlying shape
		//this.onMouseOver = this.shape.onMouseOver;
		//this.onMouseOut = this.shape.onMouseOut;
		//this.onClick = this.shape.onClick;
		//this.onDoubleClick = this.shape.onDoubleClick;

		this.addChild(this.shape);
		// create text
		this.text = new Text(this.textString, this.font, this.textColor);
		this.text.textBaseline = "top";
		this.text.mouseEnabled = false;
		this.addChild(this.text);

		// take max of text width and height and given width and height
		this.width_px = Math.max(this.text.getMeasuredWidth(), this.width_px);
		this.height_px = Math.max(this.text.getMeasuredLineHeight(), this.height_px);

		// align text
		if (this.hAlign == "left"){this.text.x = 0;}
		else if (this.hAlign == "right"){this.text.x = this.width_px-this.text.getMeasuredWidth();}
		else {this.text.x = (this.width_px-this.text.getMeasuredWidth())/2;}

		if (this.vAlign == "top"){this.text.y = 0;}
		else if (this.vAlign == "bottom"){this.text.y = this.height_px-this.text.getMeasuredLineHeight();}
		else {this.text.y = (this.height_px-this.text.getMeasuredLineHeight())/2;}
		
		this.redraw();
	}

	p._tick = function ()
	{
		this.Container_tick();
	}
	
	//// UPDATING FUNCTIONS
	p.setText = function(textString)
	{
		this.textString = textString;
		this.text.text = textString;
		this.width_px = Math.max(this.text.getMeasuredWidth(), this.width_px);
		this.height_px = Math.max(this.text.getMeasuredLineHeight(), this.height_px);

		// align text
		if (this.hAlign == "left"){this.text.x = 0;}
		else if (this.hAlign == "right"){this.text.x = this.width_px-this.text.getMeasuredWidth();}
		else {this.text.x = (this.width_px-this.text.getMeasuredWidth())/2;}

		if (this.vAlign == "top"){this.text.y = 0;}
		else if (this.vAlign == "bottom"){this.text.y = this.height_px-this.text.getMeasuredLineHeight();}
		else {this.text.y = (this.height_px-this.text.getMeasuredLineHeight())/2;}
		
	}

	p.setBackgroundColor = function(c)
	{
		this.backgroundColor = c;
		this.redraw();
	}

	p.redraw = function ()
	{
		// draw background shape
		if (this.strokeSize > 0)
		{
			this.g.setStrokeSize(this.strokeSize);
			this.g.beginStroke(this.strokeColor);
		}
		this.g.beginFill(this.backgroundColor);
		this.g.drawRect(0, 0, this.width_px, this.height_px);
		this.g.endFill();
		if (this.strokeSize > 0) this.g.endStroke();

		stage.needs_to_update;
	}
	window.TextContainer = TextContainer;
}(window));