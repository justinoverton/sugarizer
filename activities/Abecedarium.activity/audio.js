﻿// Abecedarium audio stuff

// Basic HTML 5 Audio Element encapsulation
enyo.kind({
	name: "HTML5.Audio",
	kind: enyo.Control,
	tag: "audio",
	published: {
		src: "", crossorigin: "", preload: "auto",
		mediagroup: "", loop: false, muted: "", controlsbar: false
	},
	events: {
		onSoundEnded: "",
		onSoundTimeupdate: ""
	},
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		
		this.srcChanged();
		this.crossoriginChanged();
		this.preloadChanged();
		this.loopChanged();
		this.mutedChanged();
		this.controlsbarChanged();
	},

	// Render
	rendered: function() {
		this.inherited(arguments);
		
		// Handle init
		if (this.hasNode()) {		
			// Handle sound ended event
			var audio = this;
			enyo.dispatcher.listen(audio.hasNode(), "ended", function() {
				audio.doSoundEnded();
			});			
			enyo.dispatcher.listen(audio.hasNode(), "timeupdate", function(s) { 
				audio.doSoundTimeupdate({timeStamp: s.timeStamp});
			});			
		}
	},
	
	// Property changed
	srcChanged: function() {
		this.setAttribute("src", this.src);
	},

	crossoriginChanged: function() {
		this.setAttribute("crossorigin", this.crossorigin);
	},
	
	preloadChanged: function() {
		this.setAttribute("preload", this.preload);
	},

	loopChanged: function() {
		this.setAttribute("loop", this.loop);
	},
	
	mutedChanged: function() {
		if (this.muted.length != 0)
			this.setAttribute("muted", this.muted);
	},
	
	controlsbarChanged: function() {
		this.setAttribute("controls", this.controlsbar);
	},
	
	// Test if component could play a file type
	canPlayType: function(typename) {
		var node = this.hasNode();
		if (!node)
			return false;
		return node.canPlayType(typename);
	},
	
	// Play audio
	play: function() {
		// HACK: HTML5 Audio don't work in PhoneGap on Android and iOS, use Media PhoneGap component instead
		if ((enyo.platform.android || enyo.platform.androidChrome || enyo.platform.ios) && document.location.protocol.substr(0,4) != "http") {
			// Compute full path
			var database = Abcd.context.getDatabase();
			var src = ((database.length == 0 || this.src.indexOf("database") == -1 ) ? location.pathname.substring(0,1+location.pathname.lastIndexOf('/'))+this.src : this.src);
			var that = this;
			if (this.media) {
				this.media.src = "";
				this.media.pause();
				this.media.release();
			}
			
			// Create the Media object
			this.media = new Media(src, function() { }, function() { },
				function(status) {
					if (status == 4 && this.src != "") {
						that.doSoundEnded();				
					}
				}
			);
			
			// Play
			this.media.play();
			return;
		}	
		var node = this.hasNode();
		if (!node)
			return;	
		node.play();
	},
	
	// Pause audio
	pause: function() {
		// HACK: HTML5 Audio don't work in PhoneGap on Android and iOS, use Media PhoneGap component instead
		if ((enyo.platform.android || enyo.platform.androidChrome || enyo.platform.ios) && document.location.protocol.substr(0,4) != "http") {
			if (!this.media)
				return;				
			this.media.src = "";
			this.media.pause();
			this.media.release();			
			return;
		}
		var node = this.hasNode();
		if (!node)
			return;		
		node.pause();
	},
	
	// Test if audio is paused
	paused: function() {
		var node = this.hasNode();
		if (!node)
			return false;		
		return node.paused;
	},

	// Test if audio is ended
	ended: function() {
		var node = this.hasNode();
		if (!node)
			return false;		
		return node.ended;
	}	
});

// Abecedarium Audio engine
enyo.kind({
	name: "Abcd.Audio",
	kind: enyo.Control,
	components: [
		{ name: "sound", kind: "HTML5.Audio", preload: "auto", autobuffer: true, controlsbar: false, 
		  onSoundEnded: "broadcastEnd", onSoundTimeupdate: "broadcastUpdate" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.format = null;
	},

	// First render, test sound format supported
	rendered: function() {
		this.inherited(arguments);
		
		if (this.$.sound.canPlayType("audio/ogg"))
			this.format = ".ogg";
		else if (this.$.sound.canPlayType("audio/mpeg"))
			this.format = ".mp3";
	},
	
	// Play a sound
	play: function(sound) {
		if (this.format == null)
			return;
		this.$.sound.setSrc(sound+this.format);
		this.timeStamp = new Date().getTime();
		this.$.sound.play();
	},
	
	// Pause
	pause: function() {
		if (this.format == null)
			return;
		this.$.sound.pause();
	},
	
	// End of sound detected, broadcast the signal
	broadcastEnd: function() {
		enyo.Signals.send("onEndOfSound", {sound:this.$.sound.src.substring(0,this.$.sound.src.length-4)});
	},
	
	broadcastUpdate: function(s, e) {
		enyo.Signals.send("onSoundTimeupdate", {timestamp:e.timeStamp-this.timeStamp});	
	}
});