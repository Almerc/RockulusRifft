/**
 * Rex cassette class
 * 
 */

// Singleton cassettMgr instance
var cassetteMgr = new rexCassetteMgr()

var clientid = "9a9c09df6ce3cfa33721c0a9b1568433"
// DO NOT CREATE NEW OBJECTS! rexCassetteMgr has to be singleton!!
function rexCassetteMgr() {
    this.cassettes = new Array();
    this.createNewCasette = function (scene, x, y, z ) {
        console.log("CREATING NEW CASSETTE")
        var cassette = new rexCassette();
        cassette.create(scene, x, y, z);
        this.cassettes.push(cassette);
        return cassette;
    }

    this.getDataFromMixRadio = function (uid, genre) {
        var url = "http://api.mixrad.io/1.x/gb/recommendations?domain=music&client_id=" + clientid + "&genre=" + genre;
        var http_request = null;
		var rsp;
        try {
            // Opera 8.0+, Firefox, Chrome, Safari
            http_request = new XMLHttpRequest();
        } catch (e) {
            // Something went wrong
            alert("Your browser broke!");
            return false;
        }
			
		http_request.open('GET', url, true);
        
		http_request.send();
        
        http_request.onreadystatechange = function(aa) {
			
            if (http_request.readyState == 4) {
                var rsp = JSON.parse(http_request.responseText);
				handleREXResponseCallback(rsp);
				
            }
        }
		
		
    }

    // Called by the handleREXResponseCallback
    this._updateCassetteDataCallback = function(rsp) {
        for (i=0; i < this.cassettes.length; i++){
            var c = this.cassettes[i];
            var track_name = rsp.items[i].name;
			var mid = rsp.items[i].id;
            var media = ("http://api.mixrad.io/1.x/gb/products/" + mid + "/sample/?domain=music&client_id=" + clientid);
            var artist = rsp.items[i].creators.performers[0].name;

            c.updateCassetteData(artist, track_name, media);
        }
    }

    this.clearCassetteHighlights = function() {
        for (i=0; i < this.cassettes.length; i++){
            var c = this.cassettes[i];
            c.highlighted = false;
        }
    }

    this.animateCassette = function() {
        var x = Math.abs(new Date().getTime() /100);
        for (i=0; i < this.cassettes.length; i++){
            var c = this.cassettes[i];

                c.cassetteMesh.rotation.y += 0.01;

            var s;
            if (c.highlighted)
                s = ((Math.sin(x) +1)/4)+1
            else
                s = 1;
            c.cassetteMesh.scale.set(s, s, s);

            //c.trackTitleMesh.rotation.y -= 0.01;
        }
    }
}

// private classes and functions

function rexCassette() {
    // Meshes
    this.cassetteMesh = undefined
    this.trackTitleMesh = undefined

    // Canvases
    this.textCanvas = undefined

    // Data fetched from REX
    this.artistname = undefined
    this.trackname = undefined
    this.media = undefined

    // Other
    this.highlighted = false;

    this.create = function(scene, x, y, z) {
        console.log("INITIALIZING CASSETTE")
        // Create the CASSETTE

        var cassetteWidth =  60.0
        var cassetteHeight = 100.0
        var cassetteThickness = 4
        var cubeGeometry = new THREE.CubeGeometry(cassetteHeight, cassetteWidth, cassetteThickness);

        // Skin cassette
        var neheTexture = new THREE.ImageUtils.loadTexture("img/Cassette.jpg");
        var cubeMaterial = new THREE.MeshBasicMaterial({
            map:neheTexture,
            side:THREE.DoubleSide
        });

        // Create a mesh and insert the geometry and the material. Translate the whole mesh
        // by 1.5 on the x axis and by 4 on the z axis and add the mesh to the scene.
        this.cassetteMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        this.cassetteMesh.position.set(x, y, z);
        this.cassetteMesh.rotation.z += 0.3
        scene.add(this.cassetteMesh);

        /////// draw text on canvas /////////
        var texture1 = this._createTextureFromText('Loading..');
        var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
        material1.transparent = true;

        this.trackTitleMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(150, 150),
            //new THREE.PlaneGeometry(canvas1.width, canvas1.height),
            material1
        );

        this.trackTitleMesh.position.set(this.cassetteMesh.position.x + 55, this.cassetteMesh.position.y + 10, this.cassetteMesh.position.z);
        scene.add(this.trackTitleMesh);
    }

    this.updateCassetteData = function (artistname, trackname, media) {
        console.log("Updated cassette data");
        this.artistname = artistname;
        this.trackname = trackname;
        this.media = media;

        if (this.trackTitleMesh)
            this.trackTitleMesh.material.map = this._createTextureFromText(trackname + " - " + artistname);
    }

    this._createTextureFromText = function (text){
        console.log("Creating texture " + text)
        // create a canvas element
        textCanvas = document.createElement('canvas');
        var context1 = textCanvas.getContext('2d');
        context1.font = "Bold 20px Arial";
        context1.fillStyle = "rgba(255, 255, 255, 0.95)";
        context1.fillText(text, 0, 50);

        // canvas contents will be used for a texture
        var texture1 = new THREE.Texture(textCanvas)
        texture1.needsUpdate = true;
        return texture1;
    }
}

function handleREXResponseCallback(rsp) {
    cassetteMgr._updateCassetteDataCallback(rsp);
}



