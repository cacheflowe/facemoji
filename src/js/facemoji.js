var Facemoji,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Facemoji = (function() {
  function Facemoji(_at_noWebcamFallback) {
    this.noWebcamFallback = _at_noWebcamFallback;
    this.resize = __bind(this.resize, this);
    this.animate = __bind(this.animate, this);
    this.buildCanvas = __bind(this.buildCanvas, this);
    this.handleKeys = __bind(this.handleKeys, this);
    this.camW = 320;
    this.camH = 240;
    this.faceTracker = new FacetrackerWrapper(this.buildCanvas, this.noWebcamFallback);
    document.addEventListener('keyup', this.handleKeys);
    this.buildButtons();
  }

  Facemoji.prototype.buildCanvas = function() {
    this.addPixiTextureCacheFix();
    this.createPixiStage();
    this.addFilters();
    this.createWebCamTexture();
    this.resize();
    document.body.classList.add('tracking');
    window.requestAnimFrame(this.animate);
  };

  Facemoji.prototype.createPixiStage = function() {
    this.pixiStage = new PIXI.Stage(0x333333);
    this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    document.querySelector('.facemoji').appendChild(this.renderer.view);
    return window.addEventListener("resize", this.resize);
  };

  Facemoji.prototype.addFilters = function() {
    this.blurFilter = new PIXI.BlurFilter();
    this.blurFilter.blur = 6;
    this.tvFilter = new PIXI.TVFilter();
    this.vignetteFilter = new PIXI.VignetteFilter();
    this.vignetteFilter.darkness = 0.85;
    this.vignetteFilter.spread = 0.15;
    this.filterArr = [this.blurFilter, this.tvFilter, this.vignetteFilter];
    this.pixiStage.filters = null;
  };

  Facemoji.prototype.addPixiTextureCacheFix = function() {
    PIXI.Texture.removeTextureFromCache = function(id) {
      var texture;
      texture = PIXI.TextureCache[id];
      delete PIXI.TextureCache[id];
      delete PIXI.BaseTextureCache[id];
      return texture;
    };
  };

  Facemoji.prototype.createWebCamTexture = function() {
    this.cameraCanvasTexture = new PIXI.Texture.fromCanvas(this.faceTracker.canvasInput);
    this.cameraSprite = new PIXI.Sprite(this.cameraCanvasTexture);
    this.cameraSprite.anchor.x = this.cameraSprite.anchor.y = 0.5;
    this.pixiStage.addChild(this.cameraSprite);
    return this.isFF = navigator.userAgent.match(/firefox/i);
  };

  Facemoji.prototype.createFaces = function() {
    this.logoX = new EasingFloat(window.innerWidth / 2, 3);
    this.logoY = new EasingFloat(window.innerHeight / 2, 3);
    this.logoScale = new EasingFloat(0, 3);
    this.logoRotation = new EasingFloat(0, 3);
    this.emojiTextureIndex = 0;
    window.buildEmojiTextures();
    this.faceEmoji = new PIXI.Sprite(window.emojiTextures[this.emojiTextureIndex]);
    this.faceEmoji.anchor.x = this.faceEmoji.anchor.y = 0.5;
    this.pixiStage.addChild(this.faceEmoji);
  };

  Facemoji.prototype.handleKeys = function(e) {
    // console.log(e.keyCode);
    if(e.keyCode == 37) this.prevEmoji();
    if(e.keyCode == 39) this.nextEmoji();
    if(e.keyCode == 70) this.toggleFilters();
    if(e.keyCode == 32) this.faceTracker.recalibrate();
    if(e.keyCode == 83) this.saveScreenshot();
    if(e.keyCode == 82) this.startRecording();
  };

  Facemoji.prototype.buildButtons = function() {
    var self = this;
    document.getElementById('prev').addEventListener('click', function() { self.prevEmoji(); });
    document.getElementById('next').addEventListener('click', function() { self.nextEmoji(); });
    document.getElementById('filter').addEventListener('click', function() { self.toggleFilters(); });
    document.getElementById('recalibrate').addEventListener('click', function() { self.faceTracker.recalibrate(); });
    document.getElementById('save').addEventListener('click', function() { self.saveScreenshot(); });
    document.getElementById('record').addEventListener('click', function() { self.startRecording(); });
  };

  Facemoji.prototype.prevEmoji = function() {
    this.emojiTextureIndex++;
    if(this.emojiTextureIndex > window.emojiTextures.length - 1) this.emojiTextureIndex = 0;
    this.faceEmoji.setTexture(window.emojiTextures[this.emojiTextureIndex]);
  };

  Facemoji.prototype.nextEmoji = function() {
    this.emojiTextureIndex--;
    if(this.emojiTextureIndex < 0) this.emojiTextureIndex = window.emojiTextures.length - 1;
    this.faceEmoji.setTexture(window.emojiTextures[this.emojiTextureIndex]);
  };

  Facemoji.prototype.toggleFilters = function() {
    this.pixiStage.filters = (this.pixiStage.filters == this.filterArr) ? null : this.filterArr;
  };

  Facemoji.prototype.svgDataURL = function(svg) {
    var svgAsXML;
    svgAsXML = (new XMLSerializer).serializeToString(svg);
    return "data:image/svg+xml," + encodeURIComponent(svgAsXML);
  };

  Facemoji.prototype.animate = function() {
    window.requestAnimFrame(this.animate);
    this.tvFilter.time = Date.now() / 100;
    this.getOffsetAndSizeToCrop(window.innerWidth, window.innerHeight, this.camW, this.camH);
    this.updateWebCamTexture();
    var event = this.faceTracker.trackingEvent;
    if (event) {
      if (!this.faceEmoji) {
        this.createFaces();
      }
      this.updateFacePosition(event);
    }
    this.animatefaceEmoji();
    this.renderer.render(this.pixiStage);
    this.recordFrame();
  };

  Facemoji.prototype.updateWebCamTexture = function() {
    this.lastFrame64 = this.curCamFrame64;
    this.curCamFrame64 = this.faceTracker.canvasInput.toDataURL();
    if (this.curCamFrame64 !== this.lastFrame64) {
      this.pixiStage.removeChild(this.cameraSprite);
      if (this.faceTracker.canvasInput._pixiId) {
        PIXI.Texture.removeTextureFromCache(this.faceTracker.canvasInput._pixiId);
      }
      this.cameraCanvasTexture = new PIXI.Texture.fromCanvas(this.faceTracker.canvasInput);
      this.cameraSprite = new PIXI.Sprite(this.cameraCanvasTexture);
      this.cameraSprite.anchor.x = this.cameraSprite.anchor.y = 0.5;
      this.pixiStage.addChild(this.cameraSprite);
      if (this.faceEmoji) {
        this.pixiStage.swapChildren(this.cameraSprite, this.faceEmoji);
      }
    }
    this.cameraSprite.scale.x = this.cameraSprite.scale.y = this.fillRatio;
    this.cameraSprite.scale.x = this.cameraSprite.scale.x * -1;
    this.cameraSprite.position.x = this.pixiStage.width / 2;
    return this.cameraSprite.position.y = this.pixiStage.height / 2;
  };

  Facemoji.prototype.updateFacePosition = function(event) {
    this.logoX.setTarget(this.pixiStage.width / 2 - (event.x / this.camW - 0.5) * this.camW * this.fillRatio);
    this.logoY.setTarget(this.pixiStage.height / 2 + (event.y / this.camH - 0.54) * this.camH * this.fillRatio);
    // var largerDimension = (event.width > event.height) ? event.width : event.height;
    var avgSize = (event.width + event.height)/2;
    this.logoScale.setTarget((avgSize * 0.007) * this.fillRatio);
    this.logoRotation.setTarget(Math.PI / 2 - event.angle); // only use half the rotation
  };

  Facemoji.prototype.animatefaceEmoji = function() {
    if (!this.faceEmoji) {
      return;
    }
    this.logoX.update();
    this.logoY.update();
    this.logoScale.update();
    this.logoRotation.update();
    this.faceEmoji.position.x = this.logoX.value();
    this.faceEmoji.position.y = this.logoY.value();
    this.faceEmoji.scale.x = this.faceEmoji.scale.y = this.logoScale.value();
    return this.faceEmoji.rotation = this.logoRotation.value();
  };

  Facemoji.prototype.saveScreenshot = function() {
    var base64img, win;
    this.renderer.render(this.pixiStage);
    base64img = this.renderer.view.toDataURL();
    win = window.open();
    win.document.write("<img src='" + base64img + "'/>");
  };

  Facemoji.prototype.startRecording = function() {
    if(this.renderingGif == true) return;
    // grab renderer buffer canvas
    this.rendererCanvas = document.getElementById('renderer');
    this.rendererCanvas.width = Math.round(this.renderer.width / 3);
    this.rendererCanvas.height = Math.round(this.renderer.height / 3);
    this.rendererCtx = this.rendererCanvas.getContext('2d');
    // start gif.js
    this.gif = new GIF({
      workers: 10,
      quality: 10,
      workerScript: './js/gif/gif.worker.js',
      debug: false
    });
    var self = this;
    this.gif.on('finished', function(blob) {
      self.openNewWindow(URL.createObjectURL(blob));
    });

    this.gifFrames = 0;
    this.renderingGif = true;
    this.rendered = false;
  };

  Facemoji.prototype.recordFrame = function() {
    if(this.renderingGif == true) {
      if(this.gifFrames <= 30) {
        this.rendererCtx.drawImage(this.renderer.view, 0, 0, this.rendererCanvas.width, this.rendererCanvas.height); // draw from pixi canvas to renderer buffer canvas
        this.gif.addFrame(this.rendererCanvas, {copy: true, delay: 16});
      } else if(this.gifFrames == 35 && this.rendered == false) {
        this.gif.render();
        this.rendered = true;
        this.renderingGif = false;
      }
      this.gifFrames++;
    }
  };

  Facemoji.prototype.openNewWindow = function( href ) {
    // gets around native mobile popup blockers
    var link = document.createElement('a');
    link.setAttribute('href', href);
    link.setAttribute('target','_blank');
    var clickevent = document.createEvent('Event');
    clickevent.initEvent('click', true, false);
    link.dispatchEvent(clickevent);
    return false;
  };


  Facemoji.prototype.getOffsetAndSizeToCrop = function(containerW, containerH, imageW, imageH) {
    var offsetX, offsetY, ratioH, ratioW, resizedH, resizedW;
    ratioW = containerW / imageW;
    ratioH = containerH / imageH;
    this.fillRatio = ratioW > ratioH ? ratioW : ratioH;
    resizedW = Math.ceil(imageW * this.fillRatio);
    resizedH = Math.ceil(imageH * this.fillRatio);
    offsetX = Math.ceil((containerW - resizedW) * 0.5);
    offsetY = Math.ceil((containerH - resizedH) * 0.5);
  };

  Facemoji.prototype.resize = function(e) {
    if (!this.pixiStage) {
      return;
    }
    this.renderer.width = this.pixiStage.width = window.innerWidth;
    this.renderer.height = this.pixiStage.height = window.innerHeight;
    this.renderer.resize(window.innerWidth, window.innerHeight);
  };

  return Facemoji;

})();

