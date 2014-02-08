function windspeed(speed){
  var ctx = document.getElementById('windSpeedGFX').getContext('2d');
  ctx.save();
 
  var size=300;
  var textOffset=165;

  var maxBeaufort = 13;

var beaufort = [ {maxSpeed: 0, colour: "#FFFFFF"},
		{maxSpeed: 1, colour: "#FFFFFF"},
		{maxSpeed: 3, colour: "#CCFFFF"},
		{maxSpeed: 6, colour: "99FFCC"},
		{maxSpeed: 10, colour: "99FF99"},
		{maxSpeed: 16, colour: "99FF66"},
		{maxSpeed: 21, colour: "99FF00"},
		{maxSpeed: 27, colour: "CCFF00"},
		{maxSpeed: 33, colour: "FFFF00"},
		{maxSpeed: 40, colour: "FFCC00"},
		{maxSpeed: 47, colour: "FF9900"},
		{maxSpeed: 55, colour: "FF6600"},
		{maxSpeed: 63, colour: "FF3300"},
		{maxSpeed: 70, colour: "FF0000"}
		 ];

  ctx.clearRect(0,0,size,size);
  ctx.translate(size/2,size/2);
  ctx.scale(0.8,0.8);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "blue";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.font = "12pt Helvetica";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

ctx.save();

var scalar = Math.PI/beaufort[maxBeaufort].maxSpeed;

ctx.fillText(speed+"kts",0,-40);

// Beaufort Scale
for (var i=1;i<=maxBeaufort;++i)
	{
	ctx.fillText(beaufort[i].maxSpeed,-textOffset*Math.cos(scalar*beaufort[i].maxSpeed),-textOffset*Math.sin(scalar*beaufort[i].maxSpeed));
	ctx.save();
	ctx.beginPath();
	ctx.rotate(-Math.PI+(beaufort[i-1].maxSpeed*scalar));
	ctx.moveTo(textOffset-50,0);
	ctx.lineTo(textOffset-12,0);
	ctx.arc(0,0,textOffset-12,0,(beaufort[i].maxSpeed-beaufort[i-1].maxSpeed)*scalar);
	ctx.rotate((beaufort[i].maxSpeed*scalar)-(beaufort[i-1].maxSpeed*scalar));
	ctx.lineTo(textOffset-50,0);
	ctx.arc(0,0,textOffset-50,0,(beaufort[i-1].maxSpeed-beaufort[i].maxSpeed)*scalar,1);
	ctx.stroke();
	ctx.fillStyle=beaufort[i].colour;
	ctx.fill();
	ctx.closePath();
	ctx.restore();
	}

ctx.restore();

// turn 180 degrees
ctx.rotate(-Math.PI);

ctx.fillStyle = "black";

  // Draw wind speed
  ctx.save();
  ctx.rotate(speed * scalar);
  ctx.strokeStyle = "#D40000";
  ctx.fillStyle = "#D40000";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-30,0);
  ctx.lineTo(110,0);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0,0,10,0,Math.PI*2,true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(95,0,10,0,Math.PI*2,true);
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.arc(0,0,3,0,Math.PI*2,true);
  ctx.fill();
  ctx.closePath();
  ctx.restore();

ctx.restore();


}

