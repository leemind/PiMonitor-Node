// All the requires
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var net = require('net');
var dgram = require('dgram');
var url = require('url');
var mongojs = require('mongojs');

// Static Defs
var httpport = 8000;
var dataport = 2345;

var mime = {
    "html" : "text/html",
    "css" : "text/css",
    "js" : "application/javascript",
    "png" : "image/png",
    "gif" : "image/gif",
    "jpg" : "image/jpeg"
};

var BatteryVoltage = 0;
var BatteryCurrent = 0;
var SolarCurrent = 0;
var WindCurrent = 0;
var WindSpeed = 0;
var WindDirection = 0;

var LastEntranceMovement = 0;

var db = mongojs('winddb',['wind']);

// Start webserver
var webserver = http.createServer(function(request, response) 
	{
	// Get the URL of incoming request
	var pathname = url.parse(request.url).pathname;
	// Special case, if asking for no file, use index.html
	if (pathname=="/")
		{
		pathname="/index.html";
		}
	// Work out the MIME type - cheap and cheerful, but need to serve it back
	var type=pathname.split(".").pop();
	console.log("Requst for "+pathname+" received, type="+type +" MIME:"+mime[type]);
	// Using a switch - could be if, but maybe this expands to many cases?
	switch(type)
		{
		case "json":
			db.wind.find({"WindSpeed": {$gt: 0}}, function(err,data){
			if(err || !data) { console.log("No Windspeed Data"); }
                        response.writeHead(200, { "Content-Type": mime[type] });
			response.write(JSON.stringify(data));
                        response.end();

			}); 
//			if(err || !data) console.log("No WindSpeed Data");
			break;
		default:
			// read the requested file
			fs.readFile('.'+pathname, function(error,data)
				{
				// Output the http header inc MIME type
				response.writeHead(200, { "Content-Type": mime[type] });
				response.end(data,"utf-8");
				});
		}
	}).listen(httpport);

console.log("Server is running on Port",httpport);

var output = socketio.listen(webserver);

output.sockets.on('connection', function(socket) {
	console.log("Output Connected");
	});


var receiver = dgram.createSocket('udp4');

receiver.on("error", function (err) {
  console.log("receiver error:\n" + err.stack);
  receiver.close();
});

receiver.on("message", function (msg, rinfo) {
  //console.log("receiver got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
  var bcastmsg = msg.toString().split(" ");
  //console.log("messgae: "+typeof(msg));
  //console.log("bcastmsg: "+typeof(bcastmsg),bcastmsg);

  console.log(bcastmsg[0],bcastmsg[1]);
  
 switch(bcastmsg[0])
	{
	case 'BatteryVoltage':
	case 'BatteryCurrent':
	case 'SolarCurrent':
	case 'WindCurrent':
	case 'PiVoltage':
		output.sockets.emit(bcastmsg[0],bcastmsg[1]);
		break;
	case 'Entrance':
		LastEntranceMovement = Date();
		output.sockets.emit('Entrance',LastEntranceMovement);
		break;
	case 'WindSpeed':
		output.sockets.emit(bcastmsg[0],bcastmsg[1]);
		db.wind.save({date:new Date(),WindSpeed:parseFloat(bcastmsg[1])});
		break;
	case 'WindDirection':
		output.sockets.emit(bcastmsg[0],bcastmsg[1]);
		db.wind.save({date:new Date(),WindDirection:parseFloat(bcastmsg[1])});
		break;
	}

});

receiver.on("listening", function () {
  var address = receiver.address();
  console.log("receiver listening " + address.address + ":" + address.port);
});

receiver.bind(dataport);

