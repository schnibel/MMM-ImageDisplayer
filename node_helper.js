/* Magic Mirror
 * Module: MMM-ImageDisplayer
 *
 * By Schnibel @schnibel
 * January 2019
 * MIT Licensed.
 *
 */

const NodeHelper = require("node_helper");
const url = require("url");
const fs = require("fs");

module.exports = NodeHelper.create({
	
	start: function() {
		this.expressApp.get('/DisplayImage', (req, res) => {

			var query = url.parse(req.url, true).query;
			var filename = query.filename;

			if (filename === undefined) {
				res.send({"status": "failed", "error": "'filename' parameter is missing."});
			}
			else {
				var filename = filename.toLowerCase();
				var result = undefined;

				for (var i = 0 ; i < this.images.length ; i++) {
					if (this.images[i].filename === filename) {
						result = "{\"status\": \"success\", \"filename\":\"" + this.images[i].filename + "\", \"width\":\"" + this.images[i].width + "\", \"height\":\"" + this.images[i].height + "\"}";
						this.sendSocketNotification("DISPLAY", {filename: this.images[i].filename});
					}
				}

				if (result === undefined) {
					result = "{\"status\": \"failed\", \"error\": \"" + filename + " is not available\"}";
				}

				res.send(result);
			}
		});
	},
  
	socketNotificationReceived: function(notification, payload) {
		this.images = payload.images;
	},
});