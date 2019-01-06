/* Magic Mirror
 * Module: MMM-FileDownloader
 *
 * By Schnibel @schnibel
 * January 2019
 * MIT Licensed.
 *
 */

var NodeHelper = require('node_helper');
const fs = require('fs');
const request = require('request');


module.exports = NodeHelper.create({

	start: function() {
		console.log("Starting node helper: " + this.name);	
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

        if(notification === "GET_FILE") {
			var file_obj = {
                filename: payload.filename,
                localpath: payload.localpath,
                url: payload.url,
			};

            //console.log("downloading file \"" + payload.filename + "\"");
            this.download(payload.url, payload.localpath, payload.filename, (err, res) => {

                if (err !== null) {
                  console.error(err);
                  return;
                } else if (err === null && res !== null) {
                    file_obj.filesize = res.filesize;
                    file_obj.filetype = res.filetype;
                    console.log("file \"" + file_obj.filename + "\" downloaded in \"" + file_obj.localpath + "\" (" + file_obj.filetype + " --- " + parseFloat(file_obj.filesize/1000/1000).toFixed(2)+ "MB)");
                    self.sendSocketNotification("RESULT_FILE", file_obj);
                }
            });
		}
    }, 

    download: function(url, path, filename, callback) {
        // on créé un stream d'écriture qui nous permettra
        // d'écrire au fur et à mesure que les données sont téléchargées
        var dest = path + filename;
        const file = fs.createWriteStream(dest);
      
        // on lance le téléchargement
        const sendReq = request.get(url);
      
        // on vérifie la validité du code de réponse HTTP
        sendReq.on('response', (response) => {
          if (response.statusCode !== 200) {
            return callback('Response status was ' + response.statusCode, null);
          }
          else {
              //console.log("---------- File downloaded ----------");
              //console.log("   filename:\t", filename);
              //console.log("   file-type:\t", response.headers['content-type']);
              //console.log("   file-length:\t", response.headers['content-length']);    
              return callback(null, {filetype: response.headers['content-type'], filesize: response.headers['content-length']});  
          }
        });
      
        // au cas où request rencontre une erreur
        // on efface le fichier partiellement écrit
        // puis on passe l'erreur au callback
        sendReq.on('error', (err) => {
          fs.unlink(dest);
          callback(err.message, null);
        });
      
      
        // écrit directement le fichier téléchargé
        sendReq.pipe(file);
      
        // lorsque le téléchargement est terminé
        // on appelle le callback
        file.on('finish', () => {
          // close étant asynchrone,
          // la callback est appelé lorsque close a terminé
          file.close(callback(null, null));
        });
      
        // si on rencontre une erreur lors de l'écriture du fichier
        // on efface le fichier puis on passe l'erreur au callback
        file.on('error', (err) => {
          // on efface le fichier sans attendre son effacement
          // on ne vérifie pas non plus les erreur pour l'effacement
          fs.unlink(dest);
          callback(err.message, null);
        });
    }
});
