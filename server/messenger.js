module.exports = function Messenger(req, res){
  req.socket.setTimeout(Infinity);
  var messageCount = 0;

  return {
    /**
     * Establish long-lived connection to send messages through
     */
    setup: function(){
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('\n'); 
    },

    /**
     * send message to the client using the correct SSE format
     */
    send: function(event, data){
      messageCount++;
      res.write('id: ' + messageCount + '\n');
      res.write('event: ' + event + '\n');
      res.write("data: " + data + '\n\n'); 
    }
  }
}