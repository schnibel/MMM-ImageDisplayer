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
        localpath: "modules/MMM-ImageDisplayer/files/",
        updateInterval: 5 * 60 * 1000,
        animationSpeed: 2.5 * 1000,
        max_parallel_download: 3,
        title: "Image Displayer",
        show_table: true,
    },

	// Override dom generator.
	getDom: function() {
        var table = document.createElement("table");
        
        if (this.config.show_table) {
            var thead = document.createElement("thead");
                // Table details headers
                var tr = document.createElement("tr");
                    var th = document.createElement("th");
                    th.classList.add("xsmall", "bg-muted");
                    th.style.textAlign = 'center';
                    th.style.align = 'center';
                    th.setAttribute("scope", "col");
                    th.textContent = this.config.title;
                    tr.appendChild(th);
                thead.appendChild(tr);
            table.appendChild(thead);

            var tbody = document.createElement("tbody");
                var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.classList.add("xsmall");
                    td.style.align = 'center';
                    td.textContent = (((this.message !== undefined) && (this.message !== "") && (!this.message.startsWith(this.translate("downloading")))) ? (this.config.files.length + " " + this.translate("downloaded")) : (""));
                    tr.appendChild(td);
                tbody.appendChild(tr);
                tr = document.createElement("tr");
                    td = document.createElement("td");
                    td.classList.add("xsmall");
                    td.style.align = 'center';
                    td.textContent = (((this.message !== undefined) && (this.message !== "")) ? (this.message) : ("")) ;
                    tr.appendChild(td);
                tbody.appendChild(tr);

            table.appendChild(tbody);
        }
        return table
	},

    initialize: function() {
        // Parse files from config.
        this.files = [];

        for(var i = 0; i < this.config.files.length; i++) {
            var localpath = this.config.localpath;
            if(this.config.files[i].hasOwnProperty("localpath")) {
                localpath = this.config.files[i].localpath;
            }

            this.files.push({
                filename: this.config.files[i].filename,
                localpath: localpath,
                url: this.config.files[i].url,
            });
        }
    },

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

        this.counter = 0;
        this.initialize();
		this.getFiles();
	},

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



	socketNotificationReceived: function(notification, payload) {
        if (notification === "RESULT_FILE") {

			for(var i = 0; i < this.files.length; i++) {
                if((payload.filename !== undefined) && (this.files[i].filename === payload.filename)) {
                    this.files[i].filetype = payload.filetype;
                    this.files[i].filesize = payload.filesize;
                    this.counter_intermediate += 1;
                    this.counter += 1;    // counter is used to know when it will be necessary to updateDom
                    break; // This is not necessary to stay in the 'for' loop as we got data
                }
                
            }
            
            if (this.counter_intermediate === this.config.max_parallel_download) {
                this.counter_intermediate = 0;
                this.getFiles();
            }
            
            if (this.counter === this.files.length) {
                this.counter = 0;
                var currentDate = new Date(Date.now()).toLocaleString();

                this.message = currentDate;
                this.scheduleUpdateInterval();
            }
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
            self.getFiles();
        }, this.config.updateInterval);
    },


});
