import * as PIXI from 'pixi.js';
import { Howl, Howler } from 'howler';

const app = new PIXI.Application();
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x1099bb;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.width = "100vw";

PIXI.loader
	.add("assets/img/01.png")
	.add("assets/img/02.png")
	.add("assets/img/03.png")
	.add("assets/img/04.png")
	.add("assets/img/05.png")
	.add("assets/img/06.png")
	.add("assets/img/07.png")
	.add("assets/img/08.png")
	.add("assets/img/09.png")
	.add("assets/img/10.png")
	.add("assets/img/11.png")
	.add("assets/img/12.png")
	.add("assets/img/13.png")
	.add("assets/img/btn_spin_disable.png")
	.add("assets/img/btn_spin_hover.png")
	.add("assets/img/btn_spin_normal.png")
	.add("assets/img/btn_spin_pressed.png")
	.add("assets/img/slotOverlay.png")
	.add("assets/img/winningFrameBackground.jpg")
	.add("assets/media/Reel_Spin.mp3")
	.add("assets/media/Landing_1.mp3")
	.load(onAssetsLoaded);

function onAssetsLoaded() {
	let running = false;
	
	const soundSpin = new Howl({
		src: ["assets/media/Reel_Spin.mp3"],
		loop: true
	});
	const soundLanding = new Howl({
		src: ["assets/media/Landing_1.mp3"],
		volume: 0.6,
	});

	let border = new PIXI.Sprite(PIXI.Texture.fromImage("assets/img/slotOverlay.png"));
	border.y = 25;
	border.x = ((window.innerWidth - border.width) / 2);

	let texture = PIXI.Texture.fromImage("assets/img/winningFrameBackground.jpg");
	let tilingSprite = new PIXI.extras.TilingSprite(
		texture,
		border.width - 83,
		border.height - 50
	);

	app.stage.addChild(tilingSprite);
	tilingSprite.y = border.y + 37;
	tilingSprite.x = border.x + 33;

	app.stage.addChild(border);

	let textureButton = PIXI.Texture.fromImage("assets/img/btn_spin_normal.png");
	let textureButtonDown = PIXI.Texture.fromImage("assets/img/btn_spin_pressed.png");
	let textureButtonOver = PIXI.Texture.fromImage("assets/img/btn_spin_hover.png");
	let textureButtonDisable = PIXI.Texture.fromImage("assets/img/btn_spin_disable.png");

	let button = new PIXI.Sprite(textureButton);
	button.x = border.width;
	button.y = border.height - button.height / 2;
	button.scale.set(0.5, 0.5);

	border.addChild(button);

	button.interactive = true;
	button.buttonMode = true;
	button
		.on('pointerdown', startPlay)
		.on('pointerup', onButtonUp)
		.on('pointerupoutside', onButtonUp)
		.on('pointerover', onButtonOver)
		.on('pointerout', onButtonOut);

	const slotTextures = [
		PIXI.Texture.fromImage("assets/img/01.png"),
		PIXI.Texture.fromImage("assets/img/02.png"),
		PIXI.Texture.fromImage("assets/img/03.png"),
		PIXI.Texture.fromImage("assets/img/04.png"),
		PIXI.Texture.fromImage("assets/img/05.png"),
		PIXI.Texture.fromImage("assets/img/06.png"),
		PIXI.Texture.fromImage("assets/img/07.png"),
		PIXI.Texture.fromImage("assets/img/08.png"),
		PIXI.Texture.fromImage("assets/img/09.png"),
		PIXI.Texture.fromImage("assets/img/10.png"),
		PIXI.Texture.fromImage("assets/img/11.png"),
		PIXI.Texture.fromImage("assets/img/12.png"),
		PIXI.Texture.fromImage("assets/img/13.png"),
	];

	const numberOfReels = 5;
	const numberOfStrings = 5;
	const symbolSize = 140;
	const reelWidth = tilingSprite.width / numberOfReels;

	let reels = [];
	let reelContainer = new PIXI.Container();

	let thing = new PIXI.Graphics();

	reelContainer.mask = thing;

	thing.beginFill(0xFF0000, 0.4);
	thing.moveTo(30, 38);
	thing.lineTo(border.width - 50, 38);
	thing.lineTo(border.width - 50, border.height - 21);
	thing.lineTo(30, border.height - 21);

	for (let i = 0; i < numberOfReels; i++) {
		let verticalReelContainer = new PIXI.Container();
		verticalReelContainer.x = i * reelWidth + 80;

		reelContainer.addChild(verticalReelContainer);

		let reel = {
			container: verticalReelContainer,
			symbols: [],
			position: 0,
			previousPosition: 0,
			blur: new PIXI.filters.BlurFilter()
		};
		reel.blur.blurX = 0;
		reel.blur.blurY = 0;
		verticalReelContainer.filters = [reel.blur];

		for (let j = 0; j < numberOfStrings; j++) {
			let symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
			symbol.y = j * symbolSize;
			symbol.scale.x = symbol.scale.y = Math.min(symbolSize / symbol.width, symbolSize / symbol.height);
			symbol.x = Math.round((symbolSize - symbol.width) / 2);
			reel.symbols.push(symbol);
			verticalReelContainer.addChild(symbol);
		}
		reels.push(reel);
	}
	border.addChild(thing);
	border.addChild(reelContainer);
	reelContainer.y = 40;

	function startPlay() {
		if (running) return;
		this.isdown = true;
		this.texture = textureButtonDown;
		soundSpin.play();

		running = true;

		for (let i = 0; i < reels.length; i++) {
			let r = reels[i];
			let extra = Math.floor(Math.random() * 3);
			tweenTo(r, "position", r.position + 10 + i * 5 + extra, 2500 + i * 1500 + extra * 600, backout(0.6), null, i == reels.length - 1 ? reelsComplete : null);
		}
	}

	function reelsComplete() {
		running = false;
		soundSpin.stop();
		button.texture = textureButton;
	}

	app.ticker.add(function (delta) {
		for (let i = 0; i < reels.length; i++) {
			let r = reels[i];
			r.blur.blurY = (r.position - r.previousPosition) * 8;
			r.previousPosition = r.position;

			for (let j = 0; j < r.symbols.length; j++) {
				let s = r.symbols[j];
				let prevy = s.y;
				s.y = (r.position + j) % r.symbols.length * symbolSize - symbolSize;
				if (s.y < 0 && prevy > symbolSize) {
					s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
					s.scale.x = s.scale.y = Math.min(symbolSize / s.texture.width, symbolSize / s.texture.height);
					s.x = Math.round((symbolSize - s.width) / 2);
				}
			}
		}
	});

	app.ticker.add(function (delta) {
		let now = Date.now();
		let remove = [];
		for (let i = 0; i < tweening.length; i++) {
			let t = tweening[i];
			let phase = Math.min(1, (now - t.start) / t.time);

			t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
			if (t.change) t.change(t);
			if (phase == 1) {
				t.object[t.property] = t.target;
				if (t.complete)
					t.complete(t);
				remove.push(t);
			}
		}
		for (let i = 0; i < remove.length; i++) {
			tweening.splice(tweening.indexOf(remove[i]), 1);
			soundLanding.play();
		}
	});


	function onButtonUp() {
		this.isdown = false;
		if (running) {
			this.texture = textureButtonDisable;
			return;
		}

		this.isOver ? this.texture = textureButtonOver : this.texture = textureButton;
	}

	function onButtonOver() {
		if (running) {
			return;
		}
		this.isOver = true;

		if (this.isdown) {
			return;
		}
		this.texture = textureButtonOver;
	}

	function onButtonOut() {
		if (running) {
			return;
		}
		this.isOver = false;

		if (this.isdown) {
			return;
		}
		this.texture = textureButton;
	}

}

let tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
	let tween = {
		object: object,
		property: property,
		propertyBeginValue: object[property],
		target: target,
		easing: easing,
		time: time,
		change: onchange,
		complete: oncomplete,
		start: Date.now()
	};

	tweening.push(tween);
	return tween;
}


function lerp(a1, a2, t) {
	return a1 * (1 - t) + a2 * t;
}


let backout = function (amount) {
	return (t) => (--t * t * ((amount + 1) * t + amount) + 1); 
};


