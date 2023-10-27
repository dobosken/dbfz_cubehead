// I know this script is ugly. Deal with it.
"use strict";

// const shit
const rawurl = 'https://raw.githubusercontent.com/dobosken/dbfz_cubehead/master/textures/'
const cube = document.getElementById("cube");
const texselect = document.getElementById("texselect");
const texpreview = document.getElementById("texpreview");
const downloadbtn = document.getElementById("downloadbtn");
// tree -J ../textures > textures.json
const texturelist = './dbfz_assets/texturelist.json';

// var shit
var time = 0;
var frame = 0;
var nextFrameMs = 0;
var FPS = 20;
var colourChannel = Math.floor(Math.random() * 3);
var colourRgba = [0,0,0,1]
var firstRun = new Boolean(true);

// k lets rock
window.addEventListener('load', (event) => {
	init();
	modelviewerStuff();
});

async function init() {
	texselect.innerHTML = '';
	let data;
	let response = await fetch(texturelist, {
		method: 'GET',
		headers: {
			'Content-Type': 'text/html'
		}
	}).then(async function(response) {
		if (response.ok) {
			data = await response.json();
		}
	});

    let texItems = '<ul>';
	for (let file of data[0].contents) {
		texItems += `<li data-active="⛶ "><input type="button" value="${file.name.replace(/\.[^/.]+$/, "")}"></li>`;
	}
    texItems += '</ul>';
	texselect.innerHTML = texItems;
	cube.style.height = cube.clientWidth / 16 * 9 + "px";
	texpreview.style.width = cube.clientWidth + "px";
	texpreview.style.height = texpreview.clientWidth / 6 + "px";
}

function modelviewerStuff() {
	cube.addEventListener("load", (ev) => {
		cube.model.materials[0].pbrMetallicRoughness.setRoughnessFactor(1.0);
		cube.model.materials[0].pbrMetallicRoughness.setMetallicFactor(0.5);
		cube.model.materials[1].pbrMetallicRoughness.setRoughnessFactor(1.0);
		cube.model.materials[0].setDoubleSided(true);
		cube.model.materials[0].setAlphaMode('MASK');
		cube.model.materials[0].setAlphaCutoff(0.9);
		requestAnimationFrame(loop);

		const createAndApplyTexture = async (channel, objectURL) => {
			let texture = await cube.createTexture(objectURL);
			await cube.model.materials[0].pbrMetallicRoughness[channel].setTexture(texture);
		}

		texselect.addEventListener('click', (event) => {
			if ( event.target.tagName == "INPUT" ) {
				fetch(rawurl + event.target.value + ".png").then(function(response) {
					return response.blob();
				}).then(function(blob) {
					let objectURL = URL.createObjectURL(blob);
					downloadbtn.href = objectURL;
					if ( firstRun ) {
						downloadbtn.download = "cubehead.png";
						downloadbtn.style.opacity = "1.0";
						downloadbtn.style.cursor = "pointer";
						downloadbtn.classList.remove("disabled");
						firstRun = !firstRun;
					}
					texpreview.style.backgroundImage = "url(" + objectURL + ")";
					createAndApplyTexture('baseColorTexture', objectURL);
				});
			}
		});

	});
}

function loop(frame_time) {
	requestAnimationFrame(loop);
	const epsilon = 1.5; // Acounts for different timestamp resolution and slight jitter
	if (frame_time < nextFrameMs - epsilon) {
		return; // Skip this cycle as we are animating too quickly.
	}
	nextFrameMs = Math.max(nextFrameMs + 1000 / FPS, frame_time);
	time = frame / FPS;
	if (time * FPS | 0 == frame - 1) {
		time += 0.000001;
	}
	frame++;
	colourRgba[colourChannel] = Math.abs(Math.sin(time) * (.8 - .2 + 1) + .2) / 11 + .1;
	cube.model.materials[1].pbrMetallicRoughness.setBaseColorFactor(colourRgba);
}
