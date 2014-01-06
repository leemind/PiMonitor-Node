function compass(degrees){
  var ctx = document.getElementById('compass').getContext('2d');
  ctx.save();
 
  var size=200;
  var textOffset=145;

  ctx.clearRect(0,0,size,size);
  ctx.translate(size/2,size/2);
  ctx.scale(0.5,0.5);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "blue";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.font = "24pt Helvetica";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("N",0,-textOffset)
  ctx.fillText("S",0,textOffset)
  ctx.fillText("E",-textOffset,0)
  ctx.fillText("W",textOffset,0)

  ctx.rotate(-Math.PI/2);

  // Cardinal marks
  ctx.save();
  for (var i=0;i<8;i++){
    ctx.beginPath();
    ctx.rotate(Math.PI/4);
    ctx.moveTo(100,0);
    ctx.lineTo(120,0);
    ctx.stroke();
  }
  ctx.restore();

  // Minute marks
  ctx.save();
  ctx.lineWidth = 4;
  for (i=0;i<72;i++){

    ctx.beginPath();
    ctx.moveTo(117,0);
    ctx.lineTo(120,0);
    ctx.stroke();
    
    ctx.rotate(2*Math.PI/72);
  }
  ctx.restore();
  
  ctx.fillStyle = "black";

  // Draw compass heading
  ctx.save();
  ctx.rotate(degrees * Math.PI/180);
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
  ctx.restore();

  // This was the outside ring
  //ctx.beginPath();
  //ctx.lineWidth = 14;
  //ctx.strokeStyle = '#325FA2';
  //ctx.arc(0,0,142,0,Math.PI*2,true);
  //ctx.stroke();


  ctx.restore();
}

