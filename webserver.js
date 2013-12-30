// All the requires
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var net = require('net');
var dgram = require('dgram');
var url = require('url');

// Static Defs
var httpport = 8000;
var dataport = 2345;

var BatteryVoltage = 0;
var BatteryCurrent = 0;
var SolarCurrent = 0;
var WindCurrent = 0;
var WindSpeed = 0;
var WindDirection = 0;

var LastEntranceMovement = 0;

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
	console.log("Requst for "+pathname+" received, type="+type);
	// read the requested file
	fs.readFile('.'+pathname, function(error,data)
		{
		// Output the http header inc MIME type
		response.writeHead(200, { "Content-Type": "text/"+type });
		response.end(data,"utf-8");
		});
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
  console.log("receiver got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
  var bcastmsg = msg.toString().split(" ");
  console.log("messgae: "+typeof(msg));
  console.log("bcastmsg: "+typeof(bcastmsg),bcastmsg);

  console.log(bcastmsg[0],bcastmsg[1]);
  
 switch(bcastmsg[0])
	{
	case 'BatteryVoltage':
		BatteryVoltage = bcastmsg[1];
		output.sockets.emit('BatteryVoltage',BatteryVoltage);
		break;
	case 'BatteryCurrent':
		BatteryCurrent = bcastmsg[1];
		output.sockets.emit('BatteryCurrent',BatteryCurrent);
		break;
	case 'SolarCurrent':
		SolarCurrent = bcastmsg[1];
		output.sockets.emit('SolarCurrent',SolarCurrent);
		break;
	case 'WindCurrrent':
		WindCurrrent = bcastmsg[1];
		output.sockets.emit('WindCurrent',WindCurrent);
		break;
	case 'WindSpeed':
		WindSpeed = bcastmsg[1];
		output.sockets.emit('WindSpeed',WindSpeed);
		break;
	case 'WindDirection':
		WindDirection = bcastmsg[1];
		output.sockets.emit('WindDirection',WindDirection);
		break;
	case 'Entrance':
		LastEntranceMovement = Date();
		output.sockets.emit('Entrance',LastEntranceMovement);
		break;
	}

});

receiver.on("listening", function () {
  var address = receiver.address();
  console.log("receiver listening " + address.address + ":" + address.port);
});

receiver.bind(dataport);

