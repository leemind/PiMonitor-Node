// All the requires
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var net = require('net');
var dgram = require('dgram');
var url = require('url');
var mongojs = require('mongojs');
var moment = require('moment');

// Static Defs
var httpport = 8000;
var dataport = 2345;

var mime = {
    "html" : "text/html",
    "css" : "text/css",
    "js" : "application/javascript",
    "json" : "application/json",
    "png" : "image/png",
    "gif" : "image/gif",
    "jpg" : "image/jpeg"
};

var BatteryVoltage = 0;
var BatteryCurrent = 0;
var SolarCurrent = 0;
var WindCurrent = 0;
var WindSpeed = [];
var WindDirection = [];

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
			var now = new Date();
			var request = pathname.substring(1).split(".",1);
			var selector = {};
			console.log(request);
			selector[request] = {$gt: 0};
			selector["date"] = {$gt: new Date(now.getTime() - (24*60*60*1000))};

			db.wind.find(selector,function(err,data){
				if(err || !data) { console.log("No Windspeed Data"); }
               		        response.writeHead(200, { "Content-Type": mime[type] });
				response.write(JSON.stringify(data));
                        	response.end();
				}); 
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
		//db.wind.save({date:new Date(),WindSpeed:parseFloat(bcastmsg[1])});
		WindSpeed.push({date:new Date().toISOString(),WindSpeed:parseFloat(bcastmsg[1])});
		break;
	case 'WindDirection':
		output.sockets.emit(bcastmsg[0],bcastmsg[1]);
		//db.wind.save({date:new Date(),WindDirection:parseFloat(bcastmsg[1])});
		WindDirection.push({date:new Date(),WindDirection:parseFloat(bcastmsg[1])});
		break;
	}

});

receiver.on("listening", function () {
  var address = receiver.address();
  console.log("receiver listening " + address.address + ":" + address.port);
});

receiver.bind(dataport);

var storageInterval = 60;

function storeWindData() {
	console.log("Storing Wind Data");
	console.log(WindSpeed);
	if(WindSpeed.length < 2) return;
	var cumTime = 0, cumSpeed = 0;
	for(var i=1; i< WindSpeed.length;++i) {
		console.log(WindSpeed[i].date);
		var interval = (moment(WindSpeed[i].date) - moment(WindSpeed[i-1].date));
		console.log("Interval: "+interval);
		cumTime = cumTime + interval;
		cumSpeed = cumSpeed + (((WindSpeed[i].WindSpeed + WindSpeed[i-1].WindSpeed)/2)*interval);
		}
	var avgWindSpeed = cumSpeed / cumTime;
	console.log("Time Weighted Average WindSpeed:"+avgWindSpeed+" over "+cumTime/1000+" seconds");

	// Store WindSpeed to MongoDB
	db.wind.save({date:new Date(),WindSpeed:avgWindSpeed});

	// Delete all but last
	var lastReading = WindSpeed.pop(); 
	WindSpeed.length = 0;
	WindSpeed.push(lastReading);
}

var intervalTimer = setInterval(storeWindData,storageInterval*1000);

