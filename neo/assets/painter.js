'use strict';

Neo.Painter = function() {
    this._undoMgr = new Neo.UndoManager(50);
};

Neo.Painter.prototype.container;
Neo.Painter.prototype._undoMgr;
Neo.Painter.prototype.tool;

//Canvas Info
Neo.Painter.prototype.canvasWidth;
Neo.Painter.prototype.canvasHeight;
Neo.Painter.prototype.canvas = [];
Neo.Painter.prototype.canvasCtx = [];
Neo.Painter.prototype.visible = [];
Neo.Painter.prototype.current = 0;

//Temp Canvas Info
Neo.Painter.prototype.tempCanvas;
Neo.Painter.prototype.tempCanvasCtx;
Neo.Painter.prototype.tempX = 0;
Neo.Painter.prototype.tempY = 0;

//Destination Canvas for display
Neo.Painter.prototype.destCanvas;
Neo.Painter.prototype.destCanvasCtx;


Neo.Painter.prototype.backgroundColor = "#ffffff";
Neo.Painter.prototype.foregroundColor = "#000000";

Neo.Painter.prototype.lineWidth = 1;
Neo.Painter.prototype.alpha = 1;
Neo.Painter.prototype.zoom = 1;
Neo.Painter.prototype.zoomX = 0;
Neo.Painter.prototype.zoomY = 0;

Neo.Painter.prototype.isMouseDown;
Neo.Painter.prototype.isMouseDownRight;
Neo.Painter.prototype.prevMouseX;
Neo.Painter.prototype.prevMouseY;
Neo.Painter.prototype.mouseX;
Neo.Painter.prototype.mouseY;

Neo.Painter.prototype.isShiftDown = false;
Neo.Painter.prototype.isCtrlDown = false;
Neo.Painter.prototype.isAltDown = false;

Neo.Painter.prototype.onUpdateCanvas;
Neo.Painter.prototype._roundData = [];
Neo.Painter.prototype._toneData = [];
Neo.Painter.prototype.toolStack = [];

Neo.Painter.prototype.maskType = 0;
Neo.Painter.prototype.drawType = 0;
Neo.Painter.prototype.maskColor = "#000000";
Neo.Painter.prototype._currentColor = [];
Neo.Painter.prototype._currentMask = [];

Neo.Painter.LINETYPE_NONE = 0;
Neo.Painter.LINETYPE_PEN = 1;
Neo.Painter.LINETYPE_ERASER = 2;
Neo.Painter.LINETYPE_BRUSH = 3;
Neo.Painter.LINETYPE_TONE = 4;
Neo.Painter.LINETYPE_DODGE = 4;
Neo.Painter.LINETYPE_BURN = 4;

Neo.Painter.MASKTYPE_NONE = 0;
Neo.Painter.MASKTYPE_NORMAL = 1;
Neo.Painter.MASKTYPE_REVERSE = 2;
Neo.Painter.MASKTYPE_ADD = 3;
Neo.Painter.MASKTYPE_SUB = 4;

Neo.Painter.DRAWTYPE_FREEHAND = 0;
Neo.Painter.DRAWTYPE_LINE = 1;
Neo.Painter.DRAWTYPE_BEZIER = 2;

Neo.Painter.ALPHATYPE_NONE = 0;
Neo.Painter.ALPHATYPE_PEN = 1;
Neo.Painter.ALPHATYPE_BRUSH = 2;
Neo.Painter.ALPHATYPE_FILL = 3;

Neo.Painter.TOOLTYPE_NONE = 0;
Neo.Painter.TOOLTYPE_PEN = 1;
Neo.Painter.TOOLTYPE_ERASER = 2;
Neo.Painter.TOOLTYPE_HAND = 3;
Neo.Painter.TOOLTYPE_SLIDER = 4;
Neo.Painter.TOOLTYPE_FILL = 5;
Neo.Painter.TOOLTYPE_MASK = 6;
Neo.Painter.TOOLTYPE_ERASEALL = 7;
Neo.Painter.TOOLTYPE_ERASERECT = 8;
Neo.Painter.TOOLTYPE_COPY = 9;
Neo.Painter.TOOLTYPE_PASTE = 10;
Neo.Painter.TOOLTYPE_MERGE = 11;
Neo.Painter.TOOLTYPE_FLIP_H = 12;
Neo.Painter.TOOLTYPE_FLIP_V = 13;

Neo.Painter.TOOLTYPE_BRUSH = 14;
Neo.Painter.TOOLTYPE_TEXT = 15;
Neo.Painter.TOOLTYPE_TONE = 16;
Neo.Painter.TOOLTYPE_BLUR = 17;
Neo.Painter.TOOLTYPE_DODGE = 18;
Neo.Painter.TOOLTYPE_BURN = 19;
Neo.Painter.TOOLTYPE_RECT = 20;
Neo.Painter.TOOLTYPE_RECTFILL = 21;
Neo.Painter.TOOLTYPE_ELLIPSE = 22;
Neo.Painter.TOOLTYPE_ELLIPSEFILL = 23;
Neo.Painter.TOOLTYPE_BLURRECT = 24;
Neo.Painter.TOOLTYPE_TURN = 25;

Neo.Painter.prototype.build = function(div, width, height)
{
    this.container = div;
    this._initCanvas(div, width, height);
    this._initRoundData();
    this._initToneData();

    this.setTool(new Neo.PenTool());

    //alert("quickload");
};

Neo.Painter.prototype.setTool = function(tool) {
    if (this.tool && this.tool.saveStates) this.tool.saveStates();

    if (this.tool && this.tool.kill) {
        this.tool.kill();
    }
    this.tool = tool;
    tool.init();
    if (this.tool && this.tool.loadStates) this.tool.loadStates();
};

Neo.Painter.prototype.pushTool = function(tool) {
    this.toolStack.push(this.tool);
    this.tool = tool;
    tool.init();
};

Neo.Painter.prototype.popTool = function() {
    var tool = this.tool;
    if (tool && tool.kill) {
        tool.kill();
    }
    this.tool = this.toolStack.pop();
};

Neo.Painter.prototype.getCurrentTool = function() {
    if (this.tool) {
        var tool = this.tool;
        if (tool && tool.type == Neo.Painter.TOOLTYPE_SLIDER) {
            var stack = this.toolStack;
            if (stack.length > 0) {
                tool = stack[stack.length - 1];
            }
        }
        return tool;
    }
    return null;
};

Neo.Painter.prototype.setToolByType = function(toolType) {
    switch (parseInt(toolType)) {
    case Neo.Painter.TOOLTYPE_PEN:        this.setTool(new Neo.PenTool()); break;
    case Neo.Painter.TOOLTYPE_ERASER:     this.setTool(new Neo.EraserTool()); break;
    case Neo.Painter.TOOLTYPE_HAND:       this.setTool(new Neo.HandTool()); break;
    case Neo.Painter.TOOLTYPE_FILL:       this.setTool(new Neo.FillTool()); break;
    case Neo.Painter.TOOLTYPE_ERASEALL:   this.setTool(new Neo.EraseAllTool()); break;
    case Neo.Painter.TOOLTYPE_ERASERECT:  this.setTool(new Neo.EraseRectTool()); break;

    case Neo.Painter.TOOLTYPE_COPY:       this.setTool(new Neo.CopyTool()); break;
    case Neo.Painter.TOOLTYPE_PASTE:      this.setTool(new Neo.PasteTool()); break;
    case Neo.Painter.TOOLTYPE_MERGE:      this.setTool(new Neo.MergeTool()); break;
    case Neo.Painter.TOOLTYPE_FLIP_H:     this.setTool(new Neo.FlipHTool()); break;
    case Neo.Painter.TOOLTYPE_FLIP_V:     this.setTool(new Neo.FlipVTool()); break;

    case Neo.Painter.TOOLTYPE_BRUSH:      this.setTool(new Neo.BrushTool()); break;
    case Neo.Painter.TOOLTYPE_TEXT:       this.setTool(new Neo.TextTool()); break;
    case Neo.Painter.TOOLTYPE_TONE:       this.setTool(new Neo.ToneTool()); break;
    case Neo.Painter.TOOLTYPE_BLUR:       this.setTool(new Neo.BlurTool()); break;
    case Neo.Painter.TOOLTYPE_DODGE:      this.setTool(new Neo.DodgeTool()); break;
    case Neo.Painter.TOOLTYPE_BURN:       this.setTool(new Neo.BurnTool()); break;

    case Neo.Painter.TOOLTYPE_RECT:       this.setTool(new Neo.RectTool()); break;
    case Neo.Painter.TOOLTYPE_RECTFILL:   this.setTool(new Neo.RectFillTool()); break;
    case Neo.Painter.TOOLTYPE_ELLIPSE:    this.setTool(new Neo.EllipseTool()); break;
    case Neo.Painter.TOOLTYPE_ELLIPSEFILL:this.setTool(new Neo.EllipseFillTool()); break;
    case Neo.Painter.TOOLTYPE_BLURRECT:   this.setTool(new Neo.BlurRectTool()); break;
    case Neo.Painter.TOOLTYPE_TURN:       this.setTool(new Neo.TurnTool()); break;

    default:
        console.log("unknown toolType " + toolType);
        break;
    }
};

Neo.Painter.prototype._initCanvas = function(div, width, height) {
    width = parseInt(width);
    height = parseInt(height);
    var destWidth = parseInt(div.clientWidth);
    var destHeight = parseInt(div.clientHeight);
    this.destWidth = width;
    this.destHeight = height;

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.zoomX = width * 0.5;
    this.zoomY = height * 0.5;

    for (var i = 0; i < 2; i++) {
        this.canvas[i] = document.createElement("canvas");
        this.canvas[i].width = width;
        this.canvas[i].height = height;
        this.canvasCtx[i] = this.canvas[i].getContext("2d");

        this.canvas[i].style.imageRendering = "pixelated";
        this.canvasCtx[i].imageSmoothingEnabled = false;
        this.canvasCtx[i].mozImageSmoothingEnabled = false;
        this.visible[i] = true;
    }

    this.tempCanvas = document.createElement("canvas");
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.tempCanvasCtx = this.tempCanvas.getContext("2d");
    this.tempCanvas.style.position = "absolute";
    this.tempCanvas.enabled = false;

    this.destCanvas = document.createElement("canvas");
    this.destCanvasCtx = this.destCanvas.getContext("2d");
    this.destCanvas.width = destWidth;
    this.destCanvas.height = destHeight;
    this.container.appendChild(this.destCanvas);

    this.destCanvas.style.imageRendering = "pixelated";
    this.destCanvasCtx.imageSmoothingEnabled = false;
    this.destCanvasCtx.mozImageSmoothingEnabled = false;

    var ref = this;

    var container = document.getElementById("container");
    container.onmousedown = function(e) {ref._mouseDownHandler(e)};
    container.onmousemove = function(e) {ref._mouseMoveHandler(e)};
    container.onmouseup = function(e) {ref._mouseUpHandler(e)};
    container.onmouseover = function(e) {ref._rollOverHandler(e)};
    container.onmouseout = function(e) {ref._rollOutHandler(e)};

    document.onkeydown = function(e) {ref._keyDownHandler(e)};
    document.onkeyup = function(e) {ref._keyUpHandler(e)};

    window.onbeforeunload = function(e) {ref._beforeUnloadHandler(e)};

    this.updateDestCanvas(0, 0, this.canvasWidth, this.canvasHeight);
};

Neo.Painter.prototype._initRoundData = function() {
    for (var r = 1; r <= 30; r++) {
        this._roundData[r] = new Uint8Array(r * r);
        var mask = this._roundData[r];
        var d = Math.floor(r / 2.0);
        var index = 0;
        for (var x = 0; x < r; x++) {
            for (var y = 0; y < r; y++) {
                var xx = x + 0.5 - r/2.0;
                var yy = y + 0.5 - r/2.0;
                mask[index++] = (xx*xx + yy*yy <= r*r/4) ? 1 : 0;
            }
        }
    }
    this._roundData[3][0] = 0;
    this._roundData[3][2] = 0;
    this._roundData[3][6] = 0;
    this._roundData[3][8] = 0;

    this._roundData[5][1] = 0;
    this._roundData[5][3] = 0;
    this._roundData[5][5] = 0;
    this._roundData[5][9] = 0;
    this._roundData[5][15] = 0;
    this._roundData[5][19] = 0;
    this._roundData[5][21] = 0;
    this._roundData[5][23] = 0;
};

Neo.Painter.prototype._initToneData = function() {
    var pattern = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

    for (var i = 0; i < 16; i++) {
        this._toneData[i] = new Uint8Array(16);
        for (var j = 0; j < 16; j++) {
            this._toneData[i][j] = (i >= pattern[j]) ? 1 : 0;
        }
    }
};

Neo.Painter.prototype.getToneData = function(alpha) {
    var alphaTable = [23, 
                      47, 
                      69, 
                      92, 
                      114,
                      114,
                      114, 
                      138, 
                      161, 
                      184, 
                      184, 
                      207, 
                      230,
                      230,
                      253,
                     ];

    for (var i = 0; i < alphaTable.length; i++) {
        if (alpha < alphaTable[i]) {
            return this._toneData[i];
        }
    }
    console.log("toneData " + i);
    return this._toneData[i];
};

/*
-----------------------------------------------------------------------
	Mouse Event Handling
-----------------------------------------------------------------------
*/

Neo.Painter.prototype._keyDownHandler = function(e) {
    this.isShiftDown = e.shiftKey;
    this.isCtrlDown = e.ctrlKey;
    this.isAltDown = e.altKey;
    if (e.keyCode == 32) this.isSpaceDown = true;

    if (!this.isShiftDown && this.isCtrlDown) {
        if (!this.isAltDown) {
            if (e.keyCode == 90 || e.keyCode == 85) this.undo(); //Ctrl+Z,Ctrl.U
            if (e.keyCode == 89) this.redo(); //Ctrl+Y
        } else {
            if (e.keyCode == 90) this.redo(); //Ctrl+Alt+Z
        }
    }

    if (!this.isShiftDown && !this.isCtrlDown && !this.isAltDown) {
        if (e.keyCode == 107) new Neo.ZoomPlusCommand(this).execute(); // +
        if (e.keyCode == 109) new Neo.ZoomMinusCommand(this).execute(); // -
    }

    if (this.tool.keyDownHandler) {
        this.tool.keyDownHandler(e);
    }

    //スペース・Shift+スペースででスクロールしないように
    if (e.keyCode == 32) e.preventDefault();
};

Neo.Painter.prototype._keyUpHandler = function(e) {
    this.isShiftDown = e.shiftKey;
    this.isCtrlDown = e.ctrlKey;
    this.isAltDown = e.altKey;
    if (e.keyCode == 32) this.isSpaceDown = false;

    if (this.tool.keyUpHandler) {
        this.tool.keyUpHandler(oe);
    }
};

Neo.Painter.prototype._rollOverHandler = function(e) {
    if (this.tool.rollOverHandler) {
        this.tool.rollOverHandler(this);
    }
};

Neo.Painter.prototype._rollOutHandler = function(e) {
	if (this.tool.rollOutHandler) {
		this.tool.rollOutHandler(this);
    }
};

Neo.Painter.prototype._mouseDownHandler = function(e) {
    if (e.button == 2) {
        this.isMouseDownRight = true;

    } else {
        if (!e.shiftKey && e.ctrlKey && e.altKey) {
            this.isMouseDown = true;

        } else {
            if (e.ctrlKey || e.altKey) {
                this.isMouseDownRight = true;
            } else {
                this.isMouseDown = true;
            }
        }
    }
	
	this._updateMousePosition(e);
	this.prevMouseX = this.mouseX;
	this.prevMouseY = this.mouseY;

    if (this.isMouseDownRight) {
        this.isMouseDownRight = false;
        if (!this.isWidget(e.target)) {
            this.pickColor(this.mouseX, this.mouseY);
            return;
        }
    }

    //console.log(e.target.id || "??");

    if (e.target['data-bar']) {
        this.pushTool(new Neo.HandTool());

    } else if (this.isSpaceDown) {
        this.pushTool(new Neo.HandTool());
        this.tool.reverse = true;

    } else if (e.target['data-slider'] != undefined) {
        this.pushTool(new Neo.SliderTool());
        this.tool.target = e.target;

    } else if (e.ctrlKey && e.altKey && !e.shiftKey) {
        this.pushTool(new Neo.SliderTool());
        this.tool.target = Neo.sliders[Neo.SLIDERTYPE_SIZE].element;
        this.tool.alt = true;

    } else if (this.isWidget(e.target)) {
        this.isMouseDown = false;
        this.pushTool(new Neo.DummyTool());
    }

	this.tool.downHandler(this);
	//console.log(e.button);
	
	var ref = this;
	document.onmouseup = function(e) {
        ref._mouseUpHandler(e)
    };
};

Neo.Painter.prototype._mouseUpHandler = function(e) {
	this.isMouseDown = false;
	this.isMouseDownRight = false;
	this.tool.upHandler(this);
	document.onmouseup = undefined;
};

Neo.Painter.prototype._mouseMoveHandler = function(e) {
	this._updateMousePosition(e);
		
	if (this.isMouseDown || this.isMouseDownRight) {
		this.tool.moveHandler(this);
	} else {
		if (this.tool.upMoveHandler) {
			this.tool.upMoveHandler(this);
		}
	}
	this.prevMouseX = this.mouseX;
	this.prevMouseY = this.mouseY;
};


Neo.Painter.prototype._updateMousePosition = function(e) {
    var rect = this.destCanvas.getBoundingClientRect();

    if (this.zoom <= 0) this.zoom = 1; //なぜか0になることがあるので

	this.mouseX = (e.clientX - rect.left) / this.zoom 
            + this.zoomX 
            - this.destCanvas.width * 0.5 / this.zoom;
	this.mouseY = (e.clientY - rect.top)  / this.zoom 
            + this.zoomY 
            - this.destCanvas.height * 0.5 / this.zoom;
	
	if (isNaN(this.prevMouseX)) {
		this.prevMouseX = this.mouseX;
	}
	if (isNaN(this.prevMouseY)) {
		this.prevMosueY = this.mouseY;
	}

    this.rawMouseX = e.clientX;
    this.rawMouseY = e.clientY;
    this.clipMouseX = Math.max(Math.min(this.canvasWidth, this.mouseX), 0);
    this.clipMouseY = Math.max(Math.min(this.canvasHeight, this.mouseY), 0);
};

Neo.Painter.prototype._beforeUnloadHandler = function(e) {
    // quick save
};

/*
-------------------------------------------------------------------------
	Undo
-------------------------------------------------------------------------
*/

Neo.Painter.prototype.undo = function() {
	var undoItem = this._undoMgr.popUndo();
	if (undoItem) {
		this._pushRedo();
		this.canvasCtx[0].putImageData(undoItem.data[0], undoItem.x,undoItem.y);
		this.canvasCtx[1].putImageData(undoItem.data[1], undoItem.x,undoItem.y);
		this.updateDestCanvas(undoItem.x, undoItem.y, undoItem.width, undoItem.height);
	}
};

Neo.Painter.prototype.redo = function() {
	var undoItem = this._undoMgr.popRedo();
	if (undoItem) {
		this._pushUndo(0,0,this.canvasWidth, this.canvasHeight, true);
		this.canvasCtx[0].putImageData(undoItem.data[0], undoItem.x,undoItem.y);
		this.canvasCtx[1].putImageData(undoItem.data[1], undoItem.x,undoItem.y);
		this.updateDestCanvas(undoItem.x, undoItem.y, undoItem.width, undoItem.height);
	}
};

Neo.Painter.prototype.hasUndo = function() {
	return true;
};

Neo.Painter.prototype._pushUndo = function(x, y, w, h, holdRedo) {
	x = (x == undefined) ? 0 : x;
	y = (y == undefined) ? 0 : y;
	w = (w == undefined) ? this.canvasWidth : w;
	h = (h == undefined) ? this.canvasHeight : h;
	var undoItem = new Neo.UndoItem();
	undoItem.x = 0;
	undoItem.y = 0;
	undoItem.width = w;
	undoItem.height = h;
	undoItem.data = [this.canvasCtx[0].getImageData(x, y, w, h),
                     this.canvasCtx[1].getImageData(x, y, w, h)];
	this._undoMgr.pushUndo(undoItem, holdRedo);
};

Neo.Painter.prototype._pushRedo = function(x, y, w, h) {
	x = (x == undefined) ? 0 : x;
	y = (y == undefined) ? 0 : y;
	w = (w == undefined) ? this.canvasWidth : w;
	h = (h == undefined) ? this.canvasHeight : h;
	var undoItem = new Neo.UndoItem();
	undoItem.x = 0;
	undoItem.y = 0;
	undoItem.width = w;
	undoItem.height = h;
	undoItem.data = [this.canvasCtx[0].getImageData(x, y, w, h),
                     this.canvasCtx[1].getImageData(x, y, w, h)];
	this._undoMgr.pushRedo(undoItem);
};


/*
-------------------------------------------------------------------------
	Data Cache for Undo / Redo
-------------------------------------------------------------------------
*/

Neo.UndoManager = function(_maxStep){
	this._maxStep = _maxStep;
	this._undoItems = [];
	this._redoItems = [];
}
Neo.UndoManager.prototype._maxStep;
Neo.UndoManager.prototype._redoItems;
Neo.UndoManager.prototype._undoItems;

//アクションをしてUndo情報を更新
Neo.UndoManager.prototype.pushUndo = function(undoItem, holdRedo) {
	this._undoItems.push(undoItem);
	if (this._undoItems.length > this._maxStep) {
		this._undoItems.shift();
	}
	
	if (!holdRedo == true) {
		this._redoItems = [];
    }
};

Neo.UndoManager.prototype.popUndo = function() {
	return this._undoItems.pop();
}

Neo.UndoManager.prototype.pushRedo = function(undoItem) {
	this._redoItems.push(undoItem);
}

Neo.UndoManager.prototype.popRedo = function() {
	return this._redoItems.pop();
}


Neo.UndoItem = function() {}
Neo.UndoItem.prototype.data;
Neo.UndoItem.prototype.x;
Neo.UndoItem.prototype.y;
Neo.UndoItem.prototype.width;
Neo.UndoItem.prototype.height;

/*
-------------------------------------------------------------------------
	Zoom Controller
-------------------------------------------------------------------------
*/

Neo.Painter.prototype.setZoom = function(value) {
	this.zoom = value;

    var container = document.getElementById("container");
    var width = this.canvasWidth * this.zoom;
    var height = this.canvasHeight * this.zoom;
    if (width > container.clientWidth - 100) width = container.clientWidth - 100;
    if (height > container.clientHeight - 130) height = container.clientHeight - 130;
    this.destWidth = width;
    this.destHeight = height;

	this.updateDestCanvas(0, 0, this.canvasWidth, this.canvasHeight, false);
	this.setZoomPosition(this.zoomX, this.zoomY);
};

Neo.Painter.prototype.setZoomPosition = function(x, y) {
	var minx = (this.destCanvas.width / this.zoom) * 0.5;
	var maxx = this.canvasWidth - minx;
	var miny = (this.destCanvas.height / this.zoom) * 0.5;
	var maxy = this.canvasHeight - miny;

	
	x = Math.max(Math.min(maxx,x),minx);
	y = Math.max(Math.min(maxy,y),miny);
	
	//console.log(minx, maxx, miny, maxy, this.zoomX, this.zoomY);
	
	this.zoomX = x;
	this.zoomY = y;
	this.updateDestCanvas(0,0,this.canvasWidth,this.canvasHeight,false);
    
    this.scrollBarX = (maxx == minx) ? 0 : (x - minx) / (maxx - minx);
    this.scrollBarY = (maxy == miny) ? 0 : (y - miny) / (maxy - miny);
    this.scrollWidth = maxx - minx;
    this.scrollHeight = maxy - miny;

    if (Neo.scrollH) Neo.scrollH.update(this);
    if (Neo.scrollV) Neo.scrollV.update(this);
};


/*
-------------------------------------------------------------------------
	Drawing Helper
-------------------------------------------------------------------------
*/

Neo.Painter.prototype.submit = function(board) {
    Neo.submit(board, this.getPNG());
};

Neo.Painter.prototype.dataURLtoBlob = function(dataURL) {
    var byteString;
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURL.split(',')[1]);
    } else {
        byteString = unescape(dataURL.split(',')[1]);
    }

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:'image/png'});
};

Neo.Painter.prototype.getPNG = function() {
    var width = this.canvasWidth;
    var height = this.canvasHeight;
    var pngCanvas = document.createElement("canvas");
    pngCanvas.width = width;
    pngCanvas.height = height;
    var pngCanvasCtx = pngCanvas.getContext("2d");
    pngCanvasCtx.fillStyle = "#ffffff";
    pngCanvasCtx.fillRect(0, 0, width, height);

	if (this.visible[0]) {
	    pngCanvasCtx.drawImage(this.canvas[0], 
                               0, 0, width, height, 
                               0, 0, width, height);
    }
    if (this.visible[1]) {
	    pngCanvasCtx.drawImage(this.canvas[1], 
                               0, 0, width, height, 
                               0, 0, width, height);
    }

    var dataURL = pngCanvas.toDataURL('image/png');
    return this.dataURLtoBlob(dataURL);
};

Neo.Painter.prototype.clearCanvas = function(doConfirm) {
	if (!doConfirm || window.confirm("全消しします")) {
		//Register undo first;
		this._pushUndo();
	
		this.canvasCtx[0].clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.canvasCtx[1].clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.updateDestCanvas(0, 0, this.canvasWidth, this.canvasHeight);
	}
};

Neo.Painter.prototype.updateDestCanvas = function(x, y, width, height, useTemp) {	
	this.destCanvasCtx.save();

	this.destCanvasCtx.translate(this.destCanvas.width*.5, this.destCanvas.height*.5);
	this.destCanvasCtx.scale(this.zoom, this.zoom);
	this.destCanvasCtx.translate(-this.zoomX, -this.zoomY);
	this.destCanvasCtx.globalAlpha = 1.0;
	this.destCanvasCtx.fillStyle = "#ffffff";
	this.destCanvasCtx.fillRect(0, 0, width, height);

	if (this.visible[0]) {
	    this.destCanvasCtx.drawImage(this.canvas[0], 
                                     x, y, width, height, 
                                     x, y, width, height);
    }
    if (this.visible[1]) {
	    this.destCanvasCtx.drawImage(this.canvas[1], 
                                     x, y, width, height, 
                                     x, y, width, height);
    }
	if (useTemp) {
		this.destCanvasCtx.globalAlpha = 1.0; //this.alpha;
		this.destCanvasCtx.drawImage(this.tempCanvas, 
                                     x, y, width, height, 
                                     x + this.tempX, y + this.tempY, width, height);
	}
	this.destCanvasCtx.restore();
	
	if (this.onUpdateCanvas) {
        this.onUpdateCanvas(this);
    }
};

Neo.Painter.prototype.fillContext = function(color) {
};

Neo.Painter.prototype.getColor = function(c) {
    if (!c) c = this.foregroundColor;
    var r = parseInt(c.substr(1, 2), 16);
    var g = parseInt(c.substr(3, 2), 16);
    var b = parseInt(c.substr(5, 2), 16);
    var a = Math.floor(this.alpha * 255);
    return a <<24 | b<<16 | g<<8 | r;
};

Neo.Painter.prototype.getColorString = function(c) {
    var rgb = ("000000" + (c & 0xffffff).toString(16)).substr(-6);
    return '#' + rgb;
};

Neo.Painter.prototype.setColor = function(c) {
    if (typeof c != "string") c = this.getColorString(c);
    this.foregroundColor = c;

    Neo.updateUI();
};

Neo.Painter.prototype.getAlpha = function(type) {
    var a1 = this.alpha;

    switch (type) {
    case Neo.Painter.ALPHATYPE_PEN:
        if (a1 > 0.5) {
            a1 = 1.0/16 + (a1 - 0.5) * 30.0/16;
        } else {
            a1 = Math.sqrt(2 * a1) / 16.0;
        }
        a1 = Math.min(1, Math.max(0, a1));
        break;

    case Neo.Painter.ALPHATYPE_BRUSH:
        //値が小さい時（1〜128ぐらい）は再現が難しいのであきらめた
        a1 = -0.00056 * a1 + 0.0042 / (1.0 - a1) - 0.0042;
        a1 = Math.min(1.0, Math.max(0, a1));
        break;

    case Neo.Painter.ALPHATYPE_FILL:
        a1 = -0.00056 * a1 + 0.0042 / (1.0 - a1) - 0.0042;
        a1 = Math.min(1.0, Math.max(0, a1 * 10));
        break;
    }
    return a1;
};

Neo.Painter.prototype.prepareDrawing = function () {
    var r = parseInt(this.foregroundColor.substr(1, 2), 16);
    var g = parseInt(this.foregroundColor.substr(3, 2), 16);
    var b = parseInt(this.foregroundColor.substr(5, 2), 16);
    var a = Math.floor(this.alpha * 255);

    var maskR = parseInt(this.maskColor.substr(1, 2), 16);
    var maskG = parseInt(this.maskColor.substr(3, 2), 16);
    var maskB = parseInt(this.maskColor.substr(5, 2), 16);

    this._currentColor = [r, g, b, a];
    this._currentMask = [maskR, maskG, maskB];
};

Neo.Painter.prototype.isMasked = function (buf8, index) {
    var r = this._currentMask[0];
    var g = this._currentMask[1];
    var b = this._currentMask[2];

    switch (this.maskType) {
    case Neo.Painter.MASKTYPE_NONE:
        return;

    case Neo.Painter.MASKTYPE_NORMAL:
        return (buf8[index + 3] != 0 &&
                buf8[index + 0] == r &&
                buf8[index + 1] == g &&
                buf8[index + 2] == b) ? true : false;

    case Neo.Painter.MASKTYPE_REVERSE:
        return (buf8[index + 3] != 0 &&
                buf8[index + 0] == r &&
                buf8[index + 1] == g &&
                buf8[index + 2] == b) ? false : true;
    }
    return false;
};

Neo.Painter.prototype.addStrokePoint = function(stroke, strokeWidth, x, y) {
    var d = this.lineWidth;
    var r0 = Math.floor(d / 2);
    x -= r0;
    y -= r0;

    var shape = this._roundData[d];
    var shapeIndex = 0;
    var index = y * strokeWidth + x;
    var a1 = this._currentColor[3] / 255.0;

    for (var i = 0; i < d; i++) {
        for (var j = 0; j < d; j++) {
            if (shape[shapeIndex++]) {
                var a0 = buf8[index + 3] / 255.0;
                var a = a0 + a1 - a0 * a1;
                buf8[index + 3] = Math.floor(a * 255 + 0.5);
            }
            index++;
        }
        index += strokeWidth - d;
    }
};

Neo.Painter.prototype.setStroke = function(buf8, width, stroke, left, top, type) {
};

Neo.Painter.prototype.createAlphaBuffer = function(buf8) {
    var size = buf8.length / 4;
    var alphaBuffer = new Uint16Array(size);
    var src = 3;
    for (var i = 0; i < size; i++) {
        alphaBuffer[i] = buf8[src] * 0x100;
        src += 4;
    }
    return alphaBuffer;
};


Neo.Painter.prototype.setPoint = function(buf8, bufWidth, x0, y0, left, top, type) {
    var x = x0 - left;
    var y = y0 - top;

    switch (type) {
    case Neo.Painter.LINETYPE_PEN:
        this.setPenPoint(buf8, bufWidth, x, y);
        break;

    case Neo.Painter.LINETYPE_BRUSH:
        this.setBrushPoint(buf8, bufWidth, x, y);
        break;

    case Neo.Painter.LINETYPE_TONE:
        this.setTonePoint(buf8, bufWidth, x, y, x0, y0);
        break;

    case Neo.Painter.LINETYPE_ERASER:
        this.setEraserPoint(buf8, bufWidth, x, y);
        break;

/*
    case Neo.Painter.LINETYPE_DODGE:
        this.setDodgePoint(buf8, bufWidth, x, y);
        break;

    case Neo.Painter.LINETYPE_BURN:
        this.setBurnPoint(buf8, bufWidth, x, y);
        break;
*/
    default:
        break;
    }
};


Neo.Painter.prototype.setPenPoint = function(buf8, width, x, y) {
    var d = this.lineWidth;
    var r0 = Math.floor(d / 2);
    x -= r0;
    y -= r0;

    var index = (y * width + x) * 4;

    var shape = this._roundData[d];
    var shapeIndex = 0;

    var r1 = this._currentColor[0];
    var g1 = this._currentColor[1];
    var b1 = this._currentColor[2];
    var a1 = this.getAlpha(Neo.Painter.ALPHATYPE_PEN);

    for (var i = 0; i < d; i++) {
        for (var j = 0; j < d; j++) {
            if (shape[shapeIndex++] && !this.isMasked(buf8, index)) {
                var r0 = buf8[index + 0];
                var g0 = buf8[index + 1];
                var b0 = buf8[index + 2];
                var a0 = buf8[index + 3] / 255.0;

                var a = a0 + a1 - a0 * a1;
                if (a > 0) {
                    var a1x = Math.max(a1, 1.0/255);

//                  var r = (r1 * a1x + r0 * a0 * (1 - a1x)) / a;
//                  var g = (g1 * a1x + g0 * a0 * (1 - a1x)) / a;
//                  var b = (b1 * a1x + b0 * a0 * (1 - a1x)) / a;
                    var r = (r1 * a1x + r0 * a0) / (a0 + a1x);
                    var g = (g1 * a1x + g0 * a0) / (a0 + a1x);
                    var b = (b1 * a1x + b0 * a0) / (a0 + a1x);

                    r = (r1 > r0) ? Math.ceil(r) : Math.floor(r);
                    g = (g1 > g0) ? Math.ceil(g) : Math.floor(g);
                    b = (b1 > b0) ? Math.ceil(b) : Math.floor(b);
                }

                var tmp = a * 255;
                a = Math.ceil(tmp);

                buf8[index + 0] = r;
                buf8[index + 1] = g;
                buf8[index + 2] = b;
                buf8[index + 3] = a;

            }
            index += 4;
        }
        index += (width - d) * 4;
    }
};

Neo.Painter.prototype.setBrushPoint = function(buf8, width, x, y) {
    var d = this.lineWidth;
    var r0 = Math.floor(d / 2);
    x -= r0;
    y -= r0;

    var index = (y * width + x) * 4;

    var shape = this._roundData[d];
    var shapeIndex = 0;

    var r1 = this._currentColor[0];
    var g1 = this._currentColor[1];
    var b1 = this._currentColor[2];
    var a1 = this.getAlpha(Neo.Painter.ALPHATYPE_BRUSH);

    for (var i = 0; i < d; i++) {
        for (var j = 0; j < d; j++) {
            if (shape[shapeIndex++] && !this.isMasked(buf8, index)) {
                var r0 = buf8[index + 0];
                var g0 = buf8[index + 1];
                var b0 = buf8[index + 2];
                var a0 = buf8[index + 3] / 255.0;

                var a = a0 + a1 - a0 * a1;
                if (a > 0) {
                    var a1x = Math.max(a1, 1.0/255);

//                  var r = (r1 * a1x + r0 * a0 * (1 - a1x)) / a;
//                  var g = (g1 * a1x + g0 * a0 * (1 - a1x)) / a;
//                  var b = (b1 * a1x + b0 * a0 * (1 - a1x)) / a;
                    var r = (r1 * a1x + r0 * a0) / (a0 + a1x);
                    var g = (g1 * a1x + g0 * a0) / (a0 + a1x);
                    var b = (b1 * a1x + b0 * a0) / (a0 + a1x);

                    r = (r1 > r0) ? Math.ceil(r) : Math.floor(r);
                    g = (g1 > g0) ? Math.ceil(g) : Math.floor(g);
                    b = (b1 > b0) ? Math.ceil(b) : Math.floor(b);
                }

                var tmp = a * 255;
                a = Math.ceil(tmp);

                buf8[index + 0] = r;
                buf8[index + 1] = g;
                buf8[index + 2] = b;
                buf8[index + 3] = a;

            }
            index += 4;
        }
        index += (width - d) * 4;
    }
};

Neo.Painter.prototype.setTonePoint = function(buf8, width, x, y, x0, y0) {
    var d = this.lineWidth;
    var r0 = Math.floor(d / 2);
    x -= r0;
    y -= r0;

    var shape = this._roundData[d];
    var shapeIndex = 0;
    var index = (y * width + x) * 4;

    var r = this._currentColor[0];
    var g = this._currentColor[1];
    var b = this._currentColor[2];
    var a = this._currentColor[3];

    var toneData = this.getToneData(a);

    for (var i = 0; i < d; i++) {
        for (var j = 0; j < d; j++) {
            if (shape[shapeIndex++] && !this.isMasked(buf8, index)) {
                if (toneData[(x0+j)%4 + ((y0+i)%4 * 4)]) {
                    buf8[index + 0] = r;
                    buf8[index + 1] = g;
                    buf8[index + 2] = b;
                    buf8[index + 3] = 255;
                }
            }
            index += 4;
        }
        index += (width - d) * 4;
    }
};

Neo.Painter.prototype.setEraserPoint = function(buf8, width, x, y) {
    var d = this.lineWidth;
    var r0 = Math.floor(d / 2);
    x -= r0;
    y -= r0;

    var shape = this._roundData[d];
    var shapeIndex = 0;
    var index = (y * width + x) * 4;
    var a = Math.floor(this.alpha * 255);

    for (var i = 0; i < d; i++) {
        for (var j = 0; j < d; j++) {
            if (shape[shapeIndex++] && !this.isMasked(buf8, index)) {
                var k = (buf8[index + 3] / 255.0) * (1.0 - (a / 255.0));

                buf8[index + 3] -= a / (d * (255.0 - a) / 255.0); //要修正
            }
            index += 4;
        }
        index += (width - d) * 4;
    }
};

Neo.Painter.prototype.xorPixel = function(buf32, bufWidth, x, y, c) {
    var index = y * bufWidth + x;
    if (!c) c = 0xffffff;
    buf32[index] ^= c;
};

Neo.Painter.prototype.prevLine = null; // 始点または終点が2度プロットされることがあるので
Neo.Painter.prototype.drawLine = function(ctx, x0, y0, x1, y1, type) {
    x0 = Math.round(x0);
    x1 = Math.round(x1);
    y0 = Math.round(y0);
    y1 = Math.round(y1);
    var prev = [x0, y0, x1, y1];

    var width = Math.abs(x1 - x0);
    var height = Math.abs(y1 - y0);
    var r = Math.ceil(this.lineWidth / 2);

    var left = ((x0 < x1) ? x0 : x1) - r;
    var top = ((y0 < y1) ? y0 : y1) - r;

    var imageData = ctx.getImageData(left, top, width + r*2, height + r*2);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);

    var dx = width, sx = x0 < x1 ? 1 : -1;
    var dy = height, sy = y0 < y1 ? 1 : -1; 
    var err = (dx > dy ? dx : -dy) / 2;        


    while (true) {
        if (this.prevLine == null ||
            !((this.prevLine[0] == x0 && this.prevLine[1] == y0) ||
              (this.prevLine[2] == x0 && this.prevLine[3] == y0))) {
            this.setPoint(buf8, imageData.width, x0, y0, left, top, type);
//          this.addStrokePoint(stroke, stroke.width, x0 - left, y0 - top);
        }

        if (x0 === x1 && y0 === y1) break;
        var e2 = err;
        if (e2 > -dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
    }

//  this.setStroke(buf8, imageData.width, stroke, left, top, type);
    imageData.data.set(buf8);
    ctx.putImageData(imageData, left, top);
    
    this.prevLine = prev;
};

Neo.Painter.prototype.xorRect = function(buf32, bufWidth, x, y, width, height, c) {
    var index = y * bufWidth + x;
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            buf32[index] ^= c;
            index++;
        }
        index += width - bufWidth;
    }
};

Neo.Painter.prototype.drawXORRect = function(ctx, x, y, width, height, isFill, c) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);
    if (width == 0 || height == 0) return;

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);
    var index = 0;
    if (!c) c = 0xffffff;

    if (isFill) {
        this.xorRect(buf32, width, 0, 0, width, height, c);

    } else {
        for (var i = 0; i < width; i++) { //top
            buf32[index] = buf32[index] ^= c;
            index++;
        }
        if (height > 1) {
            index = width;
            for (var i = 1; i < height; i++) { //left
                buf32[index] = buf32[index] ^= c;
                index += width;
            }
            if (width > 1) {
                index = width * 2 - 1;
                for (var i = 1; i < height - 1; i++) { //right
                    buf32[index] = buf32[index] ^= c;
                    index += width;
                }
                index = width * (height - 1) + 1;
                for (var i = 1; i < width; i++) { // bottom
                    buf32[index] = buf32[index] ^= c;
                    index++;
                }
            }
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.drawXOREllipse = function(ctx, x, y, width, height, isFill, c) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);
    if (width == 0 || height == 0) return;
    if (!c) c = 0xffffff;

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);


    var a = width-1, b = height-1, b1 = b&1; /* values of diameter */
    var dx = 4*(1-a)*b*b, dy = 4*(b1+1)*a*a; /* error increment */
    var err = dx+dy+b1*a*a, e2; /* error of 1.step */

    var x0 = x;
    var y0 = y;
    var x1 = x0+a;
    var y1 = y0+b;

    if (x0 > x1) { x0 = x1; x1 += a; }
    if (y0 > y1) y0 = y1;
    y0 += Math.floor((b+1)/2); y1 = y0-b1;   /* starting pixel */
    a *= 8*a; b1 = 8*b*b;
    var ymin = y0 - 1;

    do {
        if (isFill) {
            if (ymin < y0) {
                this.xorRect(buf32, width, x0-x, y0 - y, x1 - x0, 1, c);
                if (y0 != y1) {
                    this.xorRect(buf32, width, x0-x, y1 - y, x1 - x0, 1, c);
                }
                ymin = y0;
            }
        } else {
            this.xorPixel(buf32, width, x1-x, y0-y, c);
            if (x0 != x1) {
                this.xorPixel(buf32, width, x0-x, y0-y, c);
            }
            if (y0 != y1) {
                this.xorPixel(buf32, width, x0-x, y1-y, c);
                if (x0 != x1) {
                    this.xorPixel(buf32, width, x1-x, y1-y, c);
                }
            }
        }
        e2 = 2*err;
        if (e2 <= dy) { y0++; y1--; err += dy += a; }  /* y step */ 
        if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; } /* x step */
    } while (x0 <= x1);

    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.drawXORLine = function(ctx, x0, y0, x1, y1, c) {
    x0 = Math.round(x0);
    x1 = Math.round(x1);
    y0 = Math.round(y0);
    y1 = Math.round(y1);

    var width = Math.abs(x1 - x0);
    var height = Math.abs(y1 - y0);

    var left = ((x0 < x1) ? x0 : x1);
    var top = ((y0 < y1) ? y0 : y1);
    console.log("left:"+left+" top:"+top+" width:"+width+" height:"+height);

    var imageData = ctx.getImageData(left, top, width + 1, height + 1);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);

    var dx = width, sx = x0 < x1 ? 1 : -1;
    var dy = height, sy = y0 < y1 ? 1 : -1; 
    var err = (dx > dy ? dx : -dy) / 2;        

    while (true) {
        if (this.prevLine == null ||
            !((this.prevLine[0] == x0 && this.prevLine[1] == y0) ||
              (this.prevLine[2] == x0 && this.prevLine[3] == y0))) {
            
            this.xorPixel(buf32, imageData.width, x0 - left, y0 - top, c);
        }

        if (x0 === x1 && y0 === y1) break;
        var e2 = err;
        if (e2 > -dx) { err -= dy; x0 += sx; }
        if (e2 < dy) { err += dx; y0 += sy; }
    }

    imageData.data.set(buf8);
    ctx.putImageData(imageData, left, top);
};


Neo.Painter.prototype.eraseRect = function(ctx, x, y, width, height) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);

    var index = 0;

    var a = 1.0 - this.alpha;
    if (a != 0) {
        a = Math.ceil(2.0 / a);
    } else {
        a = 255;
    }

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            if (!this.isMasked(buf8, index)) {
                buf8[index + 3] -= a;
            }
            index += 4;
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.flipH = function(ctx, x, y, width, height) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);

    var half = Math.floor(width / 2);
    for (var j = 0; j < height; j++) {
        var index = j * width;
        var index2 = index + (width - 1);
        for (var i = 0; i < half; i++) {
            var value = buf32[index + i];
            buf32[index + i] = buf32[index2 -i];
            buf32[index2 - i] = value;
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.flipV = function(ctx, x, y, width, height) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);

    var half = Math.floor(height / 2);
    for (var j = 0; j < half; j++) {
        var index = j * width;
        var index2 = (height - 1 - j) * width;
        for (var i = 0; i < width; i++) {
            var value = buf32[index + i];
            buf32[index + i] = buf32[index2 + i];
            buf32[index2 + i] = value;
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.merge = function(ctx, x, y, width, height) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    var imageData = [];
    var buf32 = [];
    var buf8 = [];
    for (var i = 0; i < 2; i++) {
        imageData[i] = this.canvasCtx[i].getImageData(x, y, width, height);
        buf32[i] = new Uint32Array(imageData[i].data.buffer);
        buf8[i] = new Uint8ClampedArray(imageData[i].data.buffer);
    }

    var dst = this.current;
    var src = (dst == 1) ? 0 : 1;
    var size = width * height;
    var index = 0; 
    for (var i = 0; i < size; i++) {
        var r0 = buf8[0][index + 0];
        var g0 = buf8[0][index + 1];
        var b0 = buf8[0][index + 2];
        var a0 = buf8[0][index + 3] / 255.0;
        var r1 = buf8[1][index + 0];
        var g1 = buf8[1][index + 1];
        var b1 = buf8[1][index + 2];
        var a1 = buf8[1][index + 3] / 255.0;

        var a = a0 + a1 - a0 * a1;
        if (a > 0) {
            var r = Math.floor((r1 * a1 + r0 * a0 * (1 - a1)) / a + 0.5);
            var g = Math.floor((g1 * a1 + g0 * a0 * (1 - a1)) / a + 0.5);
            var b = Math.floor((b1 * a1 + b0 * a0 * (1 - a1)) / a + 0.5);
        }
        buf8[src][index + 0] = 0;
        buf8[src][index + 1] = 0;
        buf8[src][index + 2] = 0;
        buf8[src][index + 3] = 0;
        buf8[dst][index + 0] = r;
        buf8[dst][index + 1] = g;
        buf8[dst][index + 2] = b;
        buf8[dst][index + 3] = Math.floor(a * 255 + 0.5);
        index += 4;
    }

    for (var i = 0; i < 2; i++) {
        imageData[i].data.set(buf8[i]);
        this.canvasCtx[i].putImageData(imageData[i], x, y);
    }
};

Neo.Painter.prototype.blurRect = function(ctx, x, y, width, height) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);
    var clone = new Uint8ClampedArray(buf8.length);

    for (var i = 0; i < buf8.length; i++) {
        clone[i] = buf8[i];
    }

    var index = 0;
    var a0 = this.alpha;
    var a1 = 1.0 - this.alpha;

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var rgbaw = [0, 0, 0, 0, 0];

            this.addNeighbor(clone, index, a1, rgbaw);
            if (i > 0) this.addNeighbor(clone, index - 1, a0, rgbaw);
            if (i < width - 1) this.addNeighbor(clone, index + 1, a0, rgbaw);

            if (j > 0) {
                this.addNeighbor(clone, index - width, a0, rgbaw);
                if (i > 0) this.addNeighbor(clone, index - width-1, a0, rgbaw);
                if (i < width-1) this.addNeighbor(clone, index - width+1, a0, rgbaw);
            }
            if (j < height - 1) {
                this.addNeighbor(clone, index + width, a0, rgbaw);
                if (i > 0) this.addNeighbor(clone, index + width-1, a0, rgbaw);
                if (i < width-1) this.addNeighbor(clone, index + width+1, a0, rgbaw);
            }

            buf8[index*4 + 0] = Math.round(rgbaw[0] / rgbaw[4]);
            buf8[index*4 + 1] = Math.round(rgbaw[1] / rgbaw[4]);
            buf8[index*4 + 2] = Math.round(rgbaw[2] / rgbaw[4]);
            buf8[index*4 + 3] = Math.round(rgbaw[3] / rgbaw[4]);
            index++;
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.addNeighbor = function(buffer, index, a, rgbaw) {
    rgbaw[0] += buffer[index*4 + 0] * a;
    rgbaw[1] += buffer[index*4 + 1] * a;
    rgbaw[2] += buffer[index*4 + 2] * a;
    rgbaw[3] += buffer[index*4 + 3] * a;
    rgbaw[4] += a;
};

Neo.Painter.prototype.pickColor = function(x, y) {
    var r = 0xff, g = 0xff, b = 0xff, a;

    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < this.canvasWidth &&
        y >= 0 && y < this.canvasHeight) {

        for (var i = 0; i < 2; i++) {
            if (this.visible[i]) {
                var ctx = this.canvasCtx[i];
                var imageData = ctx.getImageData(x, y, 1, 1);
                var buf32 = new Uint32Array(imageData.data.buffer);
                var buf8 = new Uint8ClampedArray(imageData.data.buffer);

                var a = buf8[3] / 255.0;
                r = r * (1.0 - a) + buf8[2] * a;
                g = g * (1.0 - a) + buf8[1] * a;
                b = b * (1.0 - a) + buf8[0] * a;
            }
        }
	    r = Math.max(Math.min(Math.round(r), 255), 0);
	    g = Math.max(Math.min(Math.round(g), 255), 0);
	    b = Math.max(Math.min(Math.round(b), 255), 0);
        var result = r | g<<8 | b<<16;
    }
    this.setColor(result);
};

Neo.Painter.prototype.fillHorizontalLine = function(buf32, x0, x1, y) {
    var index = y * this.canvasWidth + x0;
    var fillColor = this.getColor();
    for (var x = x0; x <= x1; x++) {
        buf32[index++] = fillColor;
    }
};

Neo.Painter.prototype.scanLine = function(x0, x1, y, baseColor, buf32, stack) {
    var width = this.canvasWidth;

    while (x0 <= x1) {
        for (; x0 <= x1; x0++) {
            if (buf32[y * width + x0] == baseColor) break;
        }
        if (x1 < x0) break;

        for (; x0 <= x1; x0++) {
            if (buf32[y * width + x0] != baseColor) break;
        }
        stack.push({x:x0 - 1, y: y})
    }
};

Neo.Painter.prototype.fill = function(x, y, ctx) {
    // http://sandbox.serendip.ws/javascript_canvas_scanline_seedfill.html
    x = Math.round(x);
    y = Math.round(y);

    var imageData = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);
    var width = imageData.width;
    var stack = [{x: x, y: y}];

    var baseColor = buf32[y * width + x];
    var fillColor = this.getColor();

    if ((baseColor & 0xffffff00) == 0 ||
        (baseColor & 0xffffff) != (fillColor & 0xffffff)) {
        while (stack.length > 0) {
            var point = stack.pop();
            var x0 = point.x;
            var x1 = point.x;
            var y = point.y;

            if (buf32[y * width + x] == fillColor) 
                break;

            for (; 0 < x0; x0--) {
                if (buf32[y * width + (x0 - 1)] != baseColor) break;
            }
            for (; x1 < this.canvasHeight - 1; x1++) {
                if (buf32[y * width + (x1 + 1)] != baseColor) break;
            }
            this.fillHorizontalLine(buf32, x0, x1, y);
        
            if (y + 1 < this.canvasHeight) {
                this.scanLine(x0, x1, y + 1, baseColor, buf32, stack);
            }
            if (y - 1 >= 0) {
                this.scanLine(x0, x1, y - 1, baseColor, buf32, stack);
            }
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, 0, 0);

	this.updateDestCanvas(0, 0, this.canvasWidth, this.canvasHeight);
};

Neo.Painter.prototype.copy = function(x, y, width, height) {
    this.tempX = 0;
    this.tempY = 0;
	this.tempCanvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.tempCanvasCtx.drawImage(this.canvas[this.current],
                                 x, y, width, height,
                                 x, y, width, height);
};

Neo.Painter.prototype.paste = function(x, y, width, height) {
    this.canvasCtx[this.current].clearRect(x + this.tempX, y + this.tempY, width, height);
    this.canvasCtx[this.current].drawImage(this.tempCanvas,
                                 x, y, width, height,
                                 x + this.tempX, y + this.tempY, width, height);

    this.tempX = 0;
    this.tempY = 0;
	this.tempCanvasCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
};

Neo.Painter.prototype.turn = function(x, y, width, height) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);
    var ctx = this.canvasCtx[this.current];

    // 傾けツールのバグを再現するため一番上のラインで対象領域を埋める
    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);
    var clone = new Uint32Array(buf32.length);

    var index = 0;
    for (var j = 1; j < height; j++) {
        var index = j * width;
        for (var i = 0; i < width; i++) {
            clone[index + i] = buf32[index + i];
            buf32[index + i] = buf32[i];
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);

    // 90度回転させて貼り付け
    imageData = ctx.getImageData(x, y, height, width);
    buf32 = new Uint32Array(imageData.data.buffer);
    buf8 = new Uint8ClampedArray(imageData.data.buffer);

    index = 0;
    for (var j = height - 1; j >= 0; j--) {
        for (var i = 0; i < width; i++) {
            buf32[i * height + j] = clone[index++];
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.doFill = function(ctx, x, y, width, height, maskFunc) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    var imageData = ctx.getImageData(x, y, width, height);
    var buf32 = new Uint32Array(imageData.data.buffer);
    var buf8 = new Uint8ClampedArray(imageData.data.buffer);

    var index = 0;

    var r1 = this._currentColor[0];
    var g1 = this._currentColor[1];
    var b1 = this._currentColor[2];
    var a1 = this.getAlpha(Neo.ALPHATYPE_FILL);

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            if (maskFunc && maskFunc.call(this, i, j, width, height)) {
                if (!this.isMasked(buf8, index)) {
                    var r0 = buf8[index + 0];
                    var g0 = buf8[index + 1];
                    var b0 = buf8[index + 2];
                    var a0 = buf8[index + 3] / 255.0;

                    var a = a0 + a1 - a0 * a1;

                    if (a > 0) {
//                      var a1x = Math.max(a1, 1.0/255);
                        var a1x = a1;
                        var ax = 1 + a0 * (1 - a1x);

//                      var r = (r1 * a1x + r0 * a0 * (1 - a1x)) / a;
//                      var g = (g1 * a1x + g0 * a0 * (1 - a1x)) / a;
//                      var b = (b1 * a1x + b0 * a0 * (1 - a1x)) / a;
                        var r = (r1 + r0 * a0 * (1 - a1x)) / ax;
                        var g = (g1 + g0 * a0 * (1 - a1x)) / ax;
                        var b = (b1 + b0 * a0 * (1 - a1x)) / ax

                        r = (r1 > r0) ? Math.ceil(r) : Math.floor(r);
                        g = (g1 > g0) ? Math.ceil(g) : Math.floor(g);
                        b = (b1 > b0) ? Math.ceil(b) : Math.floor(b);
                    }

                    var tmp = a * 255;
                    a = Math.ceil(tmp);

                    buf8[index + 0] = r;
                    buf8[index + 1] = g;
                    buf8[index + 2] = b;
                    buf8[index + 3] = a;
                }
            }
            index += 4;
        }
    }
    imageData.data.set(buf8);
    ctx.putImageData(imageData, x, y);
};

Neo.Painter.prototype.rectFillMask = function(x, y, width, height) {
    return true;
};

Neo.Painter.prototype.rectMask = function(x, y, width, height) {
    var d = this.lineWidth;
    return (x < d || x > width - 1 - d || 
            y < d || y > height -1 - d) ? true : false;
};

Neo.Painter.prototype.ellipseFillMask = function(x, y, width, height) {
    var cx = width / 2 - 0.5;
    var cy = height / 2 - 0.5;
    x = (x - cx) / cx;
    y = (y - cy) / cy;

    return ((x * x) + (y * y) < 1) ? true : false;
}

Neo.Painter.prototype.ellipseMask = function(x, y, width, height) {
    var d = this.lineWidth;
    var cx = width / 2 - 0.5;
    var cy = height / 2 - 0.5;

    if (cx <= d || cy <= d) return this.ellipseFillMask(x, y, width, height);

    var x2 = (x - cx) / (cx - d);
    var y2 = (y - cy) / (cy - d);

    x = (x - cx) / cx;
    y = (y - cy) / cy;

    if ((x * x) + (y * y) < 1) {
        if ((x2 * x2) + (y2 * y2) >= 1) {
            return true;
        }
    }
    return  false;
}

/*
-----------------------------------------------------------------------
*/

Neo.Painter.prototype.getDestCanvasMousePosition = function(mx, my, isClip) {
    var mx = Math.round(mx);
    var my = Math.round(my);
    var x = (mx - this.zoomX + this.destCanvas.width * 0.5 / this.zoom) * this.zoom;
    var y = (my - this.zoomY + this.destCanvas.height * 0.5 / this.zoom) * this.zoom;

    if (isClip) {
        x = Math.max(Math.min(x, this.destCanvas.width), 0);
        y =  Math.max(Math.min(y, this.destCanvas.height), 0);
    }
    return {x:x, y:y};
};

Neo.Painter.prototype.isWidget = function(element) {
    while (1) {
        if (element == null ||
            element.id == "canvas" || 
            element.id == "container") break;

        if (element.id == "tools" ||
            element.className == "buttonOn" || 
            element.className == "buttonOff") {
            return true;
        }
        element = element.parentNode;
    }
    return  false;
};