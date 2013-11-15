(function(){

  // Grab elements, create settings, etc.
  var canvas = document.getElementById("canvas")
  , context = canvas.getContext("2d")
  , video = document.getElementById("video")
  , videoObj = { "video": true }
  , stache = null 
  , stacheFiles = [] 
  , stacheIndex = 0
  , errBack = function(error) {
    console.log("Video capture error: ", error.code); 
  };

  //load all the stache files
  $.ajax('/mustacheFiles').then(function(res){
    stacheFiles = res.files;
    loadNewStache();
  });

  pipeVideoToCanvas();
  wireUpServerEvents();
  loop();

  function loadNewStache(){
    stacheIndex %= stacheFiles.length; //wrap around the stache array
    var file = stacheFiles[stacheIndex];
    var img = new Image;
    img.src = "public/mustaches/" + file;
    img.onload = function(){
      stache = img;
      stache.offsetX = (canvas.width  - stache.width) / 2;
      stache.offsetY = (canvas.height - stache.height) / 2;
    };
  }

  function pipeVideoToCanvas(){
    // Put video listeners into place
    if(navigator.getUserMedia) { // Standard
      navigator.getUserMedia(videoObj, function(stream) {
        video.src = stream;
        video.play();
      }, errBack);
    } else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
      navigator.webkitGetUserMedia(videoObj, function(stream){
        video.src = window.webkitURL.createObjectURL(stream);
        video.play();
      }, errBack);
    }
  }

  function loop(){
    requestAnimationFrame(function draw() {
      requestAnimationFrame(draw);
      if (video.paused || video.ended)  return;

      //draw video to canvas
      context.save();
      context.translate(1280, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, 1280, 1024);
      context.restore();

      context.drawImage(stache, stache.offsetX, stache.offsetY, stache.width, stache.height);
    });
  }

  function wireUpServerEvents(){
    var pi = new EventSource("/events");

    // Respond to server-sent events (from Pi to Node to Browser)
    pi.addEventListener("nextstache", function(e) {
      stacheIndex++;
      loadNewStache();
      console.log("nextstache");
    });

    pi.addEventListener("previousstache", function(e) {
      stacheIndex--;
      loadNewStache();
      console.log("previousstache");
    });

    pi.addEventListener("wakeup", function(e) {
      console.log("wakeup");
    });

    pi.addEventListener("takepic", function(e) {
      console.log("takepic");
      takePic();
    });

    function takePic(){
      //POST a new picture to be printed
      var http = new XMLHttpRequest();
      http.open("POST", "/picture", true);
      http.onload = function (e) {
        console.log("status", e.target.status);
      };
      console.log("canvas.toDataURL().slice(22,40):", canvas.toDataURL().slice(22,40));
      console.log("canvas.toDataURL().slice(0,40):", canvas.toDataURL().slice(0,40));
      var data = { 
        // base64 string representation of the stache
        picture: canvas.toDataURL("image/png").slice(22)
      };
      http.setRequestHeader('Content-Type', 'application/json');
      http.send(JSON.stringify(data));
    } 
  }
}());