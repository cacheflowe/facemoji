var FacetrackerWrapper;

FacetrackerWrapper = (function() {
  function FacetrackerWrapper(_at_successCallback, _at_disallowCallback) {
    this.successCallback = _at_successCallback;
    this.disallowCallback = _at_disallowCallback;
    this.trackingEvent = null;
    this.initializeMessages();
    this.listenFodHeadtrackrStatusEvents();
    this.listenFodHeadtrackrEvents();
    this.initializeElements();
    this.initializeHeadTrackr();
  }

  FacetrackerWrapper.prototype.initializeElements = function() {
    this.videoInput = document.getElementById("webcam-video");
    this.canvasInput = document.getElementById("webcam-canvas");
  };

  FacetrackerWrapper.prototype.initializeMessages = function() {
    this.statusMessages = {
      whitebalance: "checking for stability of camera whitebalance",
      detecting: "Detecting face",
      hints: "Hmm. Detecting the face is taking a long time",
      redetecting: "Lost track of face, redetecting",
      lost: "Lost track of face",
      found: "Tracking face"
    };
    return this.supportMessages = {
      "no getUserMedia": "Unfortunately, <a href='http://dev.w3.org/2011/webrtc/editor/getusermedia.html'>getUserMedia</a> is not supported in your browser. Try <a href='http://www.opera.com/browser/'>downloading Opera 12</a> or <a href='http://caniuse.com/stream'>another browser that supports getUserMedia</a>. Now using fallback video for facedetection.",
      "no camera": "No camera found. Using fallback video for facedetection."
    };
  };

  FacetrackerWrapper.prototype.initializeHeadTrackr = function() {
    this.htracker = new headtrackr.Tracker({
      calcAngles: true,
      ui: false,
      smoothing: false
      // debug: this.canvasInput
    });
    this.htracker.init(this.videoInput, this.canvasInput);
    this.htracker.start();
  };

  FacetrackerWrapper.prototype.listenFodHeadtrackrStatusEvents = function() {
    return document.addEventListener("headtrackrStatus", ((function(_this) {
      return function(event) {
        if (event.status in _this.supportMessages) {
          if (event.status === "no camera") {
            _this.disallowCallback();
          }
        } else if (event.status in _this.statusMessages) {
          if (event.status === 'whitebalance') {
            if (_this.successCallback) {
              _this.successCallback();
            }
            _this.successCallback = null;
          }
        }
      };
    })(this)), true);
  };

  FacetrackerWrapper.prototype.listenFodHeadtrackrEvents = function() {
    return document.addEventListener("facetrackingEvent", (function(_this) {
      return function(event) {
        if (event.detection === "CS") {
          _this.trackingEvent = event;
        }
        if (event.detection === "VJ") {
          _this.trackingEvent = event;
        }
      };
    })(this));
  };

  FacetrackerWrapper.prototype.showProbabilityCanvas = function() {
    var debugCanvas;
    debugCanvas = document.getElementById("debug");
    if (debugCanvas.style.display === "none") {
      debugCanvas.style.display = "block";
    } else {
      debugCanvas.style.display = "none";
    }
  };

  FacetrackerWrapper.prototype.recalibrate = function() {
    this.htracker.stop();
    var self = this;
    setTimeout(function() {
      self.htracker.start();
    }, 50);
  };

  return FacetrackerWrapper;

})();
