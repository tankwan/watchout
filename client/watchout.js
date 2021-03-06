var checkCollision = function(asteroid) {
  var x1 = asteroid.x.baseVal.value;
  var y1 = asteroid.y.baseVal.value;
  var x2 = playerLocation[0];
  var y2 = playerLocation[1];
  var horiDist = x2 - x1;
  var vertDist = y2 - y1;

  var hit = Math.pow(Math.pow(horiDist, 2) + Math.pow(vertDist, 2), 0.5) < 25;
  if (hit && !asteroid.x.hit) { collisions ++; asteroid.x.hit = true; score = 0; socket.emit('collision'); }
};
// start slingin' some d3 here.
var players;
var socket = io();
var playerDataId;
var playerId;
var updatePlayer = function(players) {
  var Player = g.selectAll('image').filter('player')
    .data(players, function(d) { console.log(d); return d.id; });
    
  console.log(Player); 

  Player.enter().append('image')
    .attr('class', 'player')
    .attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')'; 
    })
    .attr('xlink:href', 'spaceship.png')
    .style('filter', function(d) { return 'url(#drop-shadow' + d.id + ')'; })
    .attr('fill', 'orange')
    .call(drag);

  Player.exit().remove();
};
socket.on('connect', function() {
  console.log('connected to server!!');
  setTimeout(()=>{
    playerId = playerDataId;
  }, 50);
});


var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');
var g = svg.append('g');
var playerLocation = [];

//COLORED SVG SHADOW
var defs = svg.append('defs');


var filter1 = defs.append('filter')
    .attr('id', 'drop-shadow1')
    .attr('height', '150%');

filter1.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 6)
    .attr('result', 'blur');

filter1.append('feFlood')
  .attr('flood-color', '#fe7800')
  .attr('flood-opacity', 1)
  .attr('result', 'offsetColor');

filter1.append('feOffset')
    .attr('in', 'blur')
    .attr('dx', 0)
    .attr('dy', 6)
    .attr('result', 'offsetBlur');

filter1.append('feComposite')
  .attr('in', 'offsetColor')
  .attr('in2', 'offsetBlur')
  .attr('operator', 'in')
  .attr('result', 'offsetBlur');

var feMerge1 = filter1.append('feMerge');


feMerge1.append('feMergeNode')
    .attr('in', 'offsetBlur');
feMerge1.append('feMergeNode')
    .attr('in', 'SourceGraphic');


var filter0 = defs.append('filter')
    .attr('id', 'drop-shadow0')
    .attr('height', '150%');

filter0.append('feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 6)
    .attr('result', 'blur');

filter0.append('feFlood')
  .attr('flood-color', '#00ff00')
  .attr('flood-opacity', 1)
  .attr('result', 'offsetColor');

filter0.append('feOffset')
    .attr('in', 'blur')
    .attr('dx', 0)
    .attr('dy', 6)
    .attr('result', 'offsetBlur');

filter0.append('feComposite')
  .attr('in', 'offsetColor')
  .attr('in2', 'offsetBlur')
  .attr('operator', 'in')
  .attr('result', 'offsetBlur');

var feMerge0 = filter0.append('feMerge');


feMerge0.append('feMergeNode')
    .attr('in', 'offsetBlur');
feMerge0.append('feMergeNode')
    .attr('in', 'SourceGraphic');

var drag = d3.behavior.drag()
    .on('drag', function(d, i) {
      d.x += d3.event.dx;
      d.y += d3.event.dy;
      var playerLocation = [ d.x, d.y ];
      socket.emit('player move', playerLocation);
      d3.select(this).attr('transform', function(d, i) {
        // playerLocation = [ d.x, d.y ];
        return 'translate(' + [ d.x, d.y ] + ')'; 
      });
    });

// class Enemy {
//   constructor(i) {
//     this.randomizeStart();
//     this.id = 'e' + i;
//     this.duration = 5000;
//   }
//   randomizeStart() {
//     this.x = width;
//     this.y = Math.round(Math.random() * height);
//   }
//   go() {
//     this.x = -50;
//     this.y = Math.round((Math.random() * height) - this.y) + this.y;
//   }
// }

// class Miniboss extends Enemy {
//   constructor(i) {
//     super();
//     this.class = 'miniboss';
//     this.id = 'm' + i;
//     this.duration = 3000;
//   }
//   go() {
//     var x1 = this.x;
//     var x2 = playerLocation[0];
//     var y1 = this.y;
//     var y2 = playerLocation[1];
//     var m = (y2 - y1) / (x2 - x1);
//     var c = y1 - m * x1;
//     this.x = -50;
//     this.y = m * this.x + c;
//   }
// }

// class Boss extends Enemy {
//   constructor(i) {
//     super();
//     this.id = 'b' + i;
//     this.class = 'boss';
//     this.duration = 350;
//   }
//   go() {
//     var x1 = this.x;
//     var x2 = playerLocation[0];
//     var y1 = this.y;
//     var y2 = playerLocation[1];
//     var xx = x2 - x1;
//     var yy = y2 - y1;
//     var m = yy / xx;
//     var c = y1 - m * x1;
//     this.x = xx > 0 ? x1 + xx + 150 : x1 + xx - 150;
//     this.y = yy > 0 ? y1 + yy + 150 : y1 + yy - 150;
//   }
// }



var updateGame = function(enemies) {
  var Asteroids = g.selectAll('image')
    .filter('.asteroid')
    .data(enemies, function(d) { return d.id; });

  
  Asteroids.enter().append('image')
    .attr('class', 'asteroid')
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; })
    .attr('xlink:href', 'asteroid.png')
    .transition()
    .duration(function(d) { return d.duration; })
    .ease('easeQuadOut')
    .tween('checkCollision', function(d) {
      var asteroid = this;
      return function(t) {
        checkCollision(asteroid);
      };
    })
    .attr('x', function(d) { return d.xx; })
    .attr('y', function(d) { return d.yy; });

  Asteroids.exit().remove();

};

var updateMiniboss = function(enemies) {
  var Asteroids = g.selectAll('image')
    .filter('.miniboss')
    .data(enemies, function(d) { return d.id; });
  
  Asteroids.enter().append('image')
    .attr('class', 'miniboss')
    .attr('x', function(d) { return d.x; })
    .attr('y', function(d) { return d.y; })
    .attr('xlink:href', 'asteroid.png')
    .html('<span class="glow"></span>')
    .transition()
    .duration(function(d) { return d.duration; })
    .ease('easeQuadOut')
    .tween('checkCollision', function(d) {
      var asteroid = this;
      return function(t) {
        checkCollision(asteroid);
      };
    })
    .attr('x', function(d) { d.go(); return d.x; })
    .attr('y', function(d) { return d.y; });

  Asteroids.exit().remove();

};

var updateBoss = function(enemies) {
  var Asteroids = g.selectAll('image')
    .filter('.boss')
    .data(enemies, function(d) { return d.id; });
  
  Asteroids.enter().append('image')
    .attr('class', 'boss')
    .attr('x', function(d) { console.log(d.x); return d.x; })
    .attr('y', function(d) { return d.y; })
    .attr('xlink:href', 'asteroid.png')
    .transition()
    .duration(function(d) { return d.duration; })
    .ease('easeQuadOut')
    .tween('checkCollision', function(d) {
      var asteroid = this;
      return function(t) {
        checkCollision(asteroid);
      };
    })
    .attr('x', function(d) { d.go(); return d.x; })
    .attr('y', function(d) { return d.y; });

  Asteroids.transition()
    .duration(function(d) { console.log(d); return d.duration; })
    .ease('easeLinear')
    .tween('checkCollision', function(d) {
      var asteroid = this;
      return function(t) {
        checkCollision(asteroid);
      };
    })
    .attr('x', function(d) { d.go(); return d.x; })
    .attr('y', function(d) { return d.y; });

  Asteroids.exit().remove();

};

var enemies = [];
var minibosses = [];
var bosses = [];
var bossId = 0;
var minibossId = 0;
var minibossCount = 0;
var enemyCount = 0;
var enemyId = 0;
// updatePlayer(players);

// setInterval(() => {
//   score = score + 1;
//   highScore = Math.max(highScore, score);
// }, 50);


// setInterval(() => {
//   if (score > 600) {
//     if (bosses.length === 0) {
//       bosses.push(new Boss(bossId));
//     }
//     updateBoss(bosses);
//     bossId++;
//   } else {
//     bosses = [];
//     updateBoss([]);
//   }
//   if (score > 300) {
//     if (minibossCount > 7) {
//       minibosses.shift();
//     } else {
//       minibossCount++;
//     }
//     minibosses.push(new Miniboss(minibossId));
//     minibossId++;
//     updateMiniboss(minibosses);
//   } else {
//     minibosses = [];
//     minibossCount = 0;
//     updateMiniboss(minibosses);
//   }
// }, 500);
socket.on('update players', function(players) {
  console.log(players);
  updatePlayer(players);
});


socket.on('game state', function(data) {
  document.getElementById('highscore').innerHTML = data.highScore;
  document.getElementById('current').innerHTML = data.score;
  document.getElementById('collisions').innerHTML = data.collisions;
  updateGame(data.asteroids);
  playerDataId = data.numberOfPlayers;
  players = data.players;
});
