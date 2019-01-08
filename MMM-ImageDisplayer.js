/* Magic Mirror
 * Module: MMM-ImageDisplayer
 *
 * By Schnibel @schnibel
 * January 2019
 * MIT Licensed.
 *
 */

Module.register("MMM-ImageDisplayer",{
    defaults: {
        localpath: "modules/MMM-FileDownloader/files/",
        animationSpeed: 2.5 * 1000,
        title: "Image Displayer",
        fileUrl: "modules/MMM-SimpleLogo/public/logo.png",
        width: '100%',
        height: '100%',
        refreshInterval: 0
    },

	// Override dom generator.
	getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = 'simple-logo__container';
        wrapper.classList.add(this.config.position);
        wrapper.style.width = (this.image_width !== undefined) ? this.image_width : this.config.width;
        wrapper.style.height = (this.image_height !== undefined) ? this.image_height : this.config.height;
        
        //wrapper.appendChild(this.config.title);
        var img = document.createElement("img");
        if (this.image_path !== undefined && this.image_filename !== undefined) {
            img.setAttribute('src', this.image_path + this.image_filename);
            wrapper.appendChild(img);
        }
        return wrapper;
	},

    initialize: function() {
        // Parse images from config.
        this.images = [];
        this.image_path = undefined;
        this.image_filename = undefined;
        this.image_width = undefined;
        this.image_height = undefined;

        for(var i = 0; i < this.config.images.length; i++) {
            var localpath = this.config.localpath;
            if(this.config.images[i].hasOwnProperty("localpath")) {
                localpath = this.config.images[i].localpath;
            }

            this.images.push({
                filename: this.config.images[i].filename,
                width: this.config.images[i].width,
                height: this.config.images[i].height,
                localpath: localpath,
            });
        }
    },

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

        this.initialize();

        this.sendSocketNotification("IMAGES", {images: this.images,});
		//this.getFiles();
	},

        /*
	getFiles: function() {
		Log.info("Getting files");

        this.counter_intermediate = 0;
        var limit = ((this.counter + this.config.max_parallel_download) > this.files.length) ? (this.files.length) : (this.counter + this.config.max_parallel_download);
        for (var i = this.counter ; i < limit ; i++) {
            this.message = this.translate("downloading") + (this.counter + 1) + "/" + this.config.files.length;
            this.updateDom();
            this.sendSocketNotification("GET_FILE",
				{
                    filename: this.files[i].filename,
                    localpath: this.files[i].localpath,
                    url: this.files[i].url, 
                }
            );
        }
	},
        */



	socketNotificationReceived: function(notification, payload) {
        console.log("socketNotificationReceived " + payload.filename);
        if (notification === "DISPLAY") {
            for (var i = 0 ; i < this.images.length ; i++) {
                if (this.images[i].filename === payload.filename) {
                    this.image_path = this.images[i].localpath;
                    this.image_filename = this.images[i].filename;
                    this.image_width = this.images[i].width;
                    this.image_height = this.images[i].height;
                }
            }
            this.updateDom();
        }
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required styles.
	getStyles: function() {
		return ["MMM-FileDownloader.css"];
    },
    
	getTranslations: function() {
		return {
            en: "translations/en.json",
            fr: "translations/fr.json",
		};
	},

    scheduleUpdateInterval: function() {
        var self = this;

        self.updateDom(self.config.animationSpeed);

        timer = setInterval(function() {
            //self.getFiles();
        }, this.config.updateInterval);
    },


});
