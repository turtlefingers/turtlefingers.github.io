var container = document.getElementById('container');
var timeContainer = document.getElementById('time');
var pitchContainer = document.getElementById('pitch');
var scoreBook = [];
var currentScore;
var currentCanvas;
var bars;
var barNum = -1;
var barDurationSecond = 5;
var barDuration = barDurationSecond*1000;
var frame = 0;
var startTime;
var note;
var t;
var pt;
var s;
var ps;
var isSetup = false;

var velocity = 0;
var gap;
var colorSet = [];
var time = 0;
var graphics = [];
var isSound = false;
var mic;

window.onload = function(){
    mic = new p5.AudioIn();
    mic.start();
    
    audioContext = new AudioContext();
	MAX_SIZE = Math.max(4,Math.floor(audioContext.sampleRate/5000));	// corresponds to a 5kHz signal

    getUserMedia(
    {
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        },
    }, gotStream);
    
    console.log("loaded");
    init();
    animation();
};


function init(){
    startTime = moment().format('x');
    nextScore();
    colorSet = [
        "#ff0000",
        "#ff9900",
        "#ffff00",
        "#99ff00",
        "#00ff00",
        "#00ffaa",
        "#00ffff",
        "#00aaff",
        "#0000ff",
        "#9900ff",
        "#ff00ff",
        "#ff0099"
    ];
}

function update(){
    timeContainer.textContent = moment(t).subtract(9, 'hour').format('HH:mm:ss:SS');
    if(s!=ps && s%barDurationSecond==0 || t == 0){
        barNum++;
        if(barNum>3){
            barNum=0;
            nextScore();
        }
        addBar();
    }
    if(analyser) drawScore();
}

function animation(){
    // 프레임 카운트
    frame++;
    
    // 시간 설정
    ps = s;
    var currentTime = moment().format('x');
    t = currentTime - startTime;
    s = Math.floor(t/1000);
    
    // 앱 업데이트
    if(analyser)updatePitch();
    update();
    
    // 다음프레임 실행
    requestAnimationFrame(animation);
}

var mode = 0;
function drawScore(){
    switch(mode){
        case 0: drawColorBar();
                break;
        case 1: drawPhoto();
                break;
    }
}

function drawColorBar(){
  var timeTemp = (t%barDuration)/barDuration * currentCanvas.width;
  if(timeTemp < time){
      graphics = [];
      time = 0;
  } 
  else time = timeTemp;
  
  var pitchTemp = note;
  var isSoundTemp = velocity>0 ? true : false;  
  
  
  if( (pitchTemp != pitch || time == 0) && isSoundTemp ){
    if(graphics[graphics.length-1])
    graphics[graphics.length-1].update(time);
    
    var tone = pitchTemp%12;
    var octave = floor(pitchTemp/12)+1;
    graphics.push(new ColorBar(time,tone,octave));
  }
  else if( (isSound != isSoundTemp || time == 0) && !isSoundTemp ){
    if(graphics[graphics.length-1])
    graphics[graphics.length-1].update(time);
    graphics.push(new ColorBar(time)); 
  }
      
  pitch = pitchTemp;
  isSound = isSoundTemp;
  
  if(graphics[graphics.length-1]) 
  graphics[graphics.length-1].update(time);
  
  currentCanvas.background(255);
  currentCanvas.noStroke();
  for(var i=0; i<graphics.length; i++){
    graphics[i].display();
  }
}

function divideBlock(octave){
  return octave+(octave-1);
}


function addBar(){
    currentBar = bars[barNum];

    var newCanvas = new p5();
    var barCanvas = newCanvas.createCanvas(currentBar.clientWidth, currentBar.clientHeight);
    barCanvas.parent(currentBar);
    currentCanvas = newCanvas;
    gap = currentCanvas.height/(12*7);
}


function nextScore(){
    addScore();
    if(currentScore) currentScore.classList.remove('active');
    currentScore = scoreBook[scoreBook.length-1];
    currentScore.classList.add('active');
    bars = currentScore.querySelectorAll('.bar');
}

function addScore(){
    var score = createScore();
    container.appendChild(score);
    scoreBook.push(score);
}

function createScore(){
    var score = document.createElement('section'); 
    score.classList.add('score');
    
    for(var i=0; i<4; i++){
        var bar = document.createElement('div'); 
        bar.classList.add('bar');
        score.appendChild(bar);
    }
    return score;
}


function ScoreGraphic(){}

function ColorBar(startTime, tone, octave){
  this.startTime = startTime;
  this.tone = tone;
  this.octave = octave
}
ColorBar.prototype = new ScoreGraphic();
ColorBar.prototype.update = function(time){
    this.duration = time - this.startTime;
}
ColorBar.prototype.display = function(){
    if(this.octave) this.drawBar();
    else this.drawBlank();
}
ColorBar.prototype.drawBar = function(){
      var div = divideBlock(this.octave);
      var h = currentCanvas.height/div;
      currentCanvas.fill(colorSet[this.tone]);
      for(var row=0; row<div; row++){
            if(row%2==0)currentCanvas.rect(
                this.startTime,
                row*h,
                this.duration,
                h
            );
      }
}
ColorBar.prototype.drawBlank = function(){
    currentCanvas.fill(0);
    currentCanvas.rect(
      this.startTime,
      0,
      this.duration,
      currentCanvas.height
    );
}

function Photo(){
    
}
Photo.prototype = new ScoreGraphic();