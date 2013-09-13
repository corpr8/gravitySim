/**
 * Based on the cannon callback demo: A gravity simulation...
 */
var loadTestData = false;
var displayHud = false;

var demo = new CANNON.Demo();
var world = demo.getWorld();
var spawnDistanceLimit = 100;
var spawnSpeedLimit = 0;
var spawnMassLimit = 100;
var bodiesCount = 40;

var planets = [];
var planetsShape = [];

if (!loadTestData) {
	demo.addScene("Planets", function() {
		for (var i = 0; i < bodiesCount; i++) {
			var z = createRandomPlanet();
		}
	});
} else {
	demo.addScene("Planets", function() {
		createTestScene();
	});
}

$(document).ready(function() {
	if (displayHud == false) {
		$('div.dg.main').hide();
	}
});

createRandomPlanet = function() {
	var mass = Math.floor((Math.random() * spawnMassLimit) + 1);
	var posX = Math.floor((Math.random() * spawnDistanceLimit) + 1 - (spawnDistanceLimit / 2));
	var posY = Math.floor((Math.random() * spawnDistanceLimit) + 1 - (spawnDistanceLimit / 2));
	var posZ = Math.floor((Math.random() * spawnDistanceLimit) + 1 - (spawnDistanceLimit / 2));
	var velX = (Math.random() * spawnSpeedLimit) - (spawnSpeedLimit / 2);
	var velY = (Math.random() * spawnSpeedLimit) - (spawnSpeedLimit / 2);
	var velZ = (Math.random() * spawnSpeedLimit) - (spawnSpeedLimit / 2);
	var i = createPlanet(mass, posX, posY, posZ, velX, velY, velZ);
	return i;
}
createTestScene = function() {
	var v = createPlanet(150, 5, 0, 0, 0, 0, 0);
	v = createPlanet(150, -10, 0, 0, 2, 0, 0);
	v = createPlanet(150, -65, 0, 0, 6, 0, 0);
}
createPlanet = function(mass, posX, posY, posZ, velX, velY, velZ) {

	planetsShape.push();
	planets.push();

	var newGuid = guid();
	var i = planets.length;
	var thisMass = mass;

	planetsShape[i] = new CANNON.Sphere(thisMass / (10 * Math.PI));
	planetsShape[i].planetId = newGuid;

	planets[i] = new CANNON.RigidBody(thisMass, planetsShape[i]);
	planets[i].planetId = newGuid;
	planets[i].lastCollidedWith = -1;
	planets[i].position.set(posX, posY, posZ);
	planets[i].velocity.set(velX, velY, velZ);
	planets[i].linearDamping = 0.0;

	// We add the objects to the world to simulate them
	world.add(planets[i]);

	// And we add them to the demo to make them visible
	demo.addVisual(planets[i]);

	planets[i].preStep = function() {
		//we need to juggle this and that as we are going through a loop...
		that = this;

		var thisSumForce = new CANNON.Vec3();
		//console.log(that.position.x);
		planets.forEach(function(thisPlanet) {
			//for each(var thisPlanet in planets) {
			if (that.planetId != thisPlanet.planetId) {
				var thisPlanet_to_that = new CANNON.Vec3(thisPlanet.position.x - that.position.x, thisPlanet.position.y - that.position.y, thisPlanet.position.z - that.position.z);
				var distance = that.position.distanceTo(thisPlanet.position);

				//temp force.
				var tempForce = new CANNON.Vec3();

				// Now apply force on temp vector
				thisPlanet_to_that.normalize();
				thisPlanet_to_that.mult(thisPlanet.mass / Math.pow(distance, 2), tempForce);

				thisSumForce.x += tempForce.x;
				thisSumForce.y += tempForce.y;
				thisSumForce.z += tempForce.z;
			}
		});

		//now apply the resultant force to that.
		that.force = thisSumForce;
	}

	planets[i].addEventListener("collide", function(e) {

		if (planets[i] && planets[planets.indexOf(e.with)]) {

			toastr.info("collision body: " + planets[i].planetId + " hit " + e.with.planetId + ' which last hit: ' + e.with.lastCollidedWith);

			if (e.lastCollidedWith != e.with.planetId) {
				
				 e.lastCollidedWith = e.with.planetId;

				 var newMass = planets[i].mass + e.with.mass;
				 var newPos = [];
				 //var distance = planets[i].position.distanceTo(e.with.position);

				 if(planets[i].mass > e.with.mass){
				 newPos = planets[i].position;
				 } else{
				 newPos = e.with.position;
				 }

				 var newVel = [];
				 newVel.x = (planets[i].velocity.x * (e.with.mass / (planets[i].mass + e.with.mass)))  + (e.with.velocity.x * (planets[i].mass / (planets[i].mass + e.with.mass)));
				 newVel.y =  (planets[i].velocity.y * (e.with.mass / (planets[i].mass + e.with.mass))) + (e.with.velocity.y * (planets[i].mass / (planets[i].mass + e.with.mass)));
				 newVel.z =  (planets[i].velocity.z * (e.with.mass / (planets[i].mass + e.with.mass))) + (e.with.velocity.z * (planets[i].mass / (planets[i].mass + e.with.mass)));

				 demo.removeVisual(e.with);
				 world.remove(e.with);

				 demo.removeVisual(planets[i]);
				 world.remove(planets[i]);

				 planets.splice(i, 1);
				 planetsShape.splice(i, 1);

				 planets.splice(planets.indexOf(e.with),1);
				 planetsShape.splice(planetsShape.indexOf(e.with),1);
				 createPlanet(newMass, newPos.x, newPos.y, newPos.z, newVel.x, newVel.y, newVel.z);

			}

		}

	});

}
//pseudo guid utils
function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

demo.start();

