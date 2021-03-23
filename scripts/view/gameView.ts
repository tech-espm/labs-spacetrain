//
// MIT License
//
// Copyright (c) 2021 TECH ESPM
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// https://github.com/tech-espm/labs-spacetrain
//

class GameView extends View {
	private static readonly TotalRoundCount = 5;
	private static readonly MaximumAlienCount = 8;
	private static readonly PointsPerSequence = [0, 1, 3, 6, 10, 15, 21, 28, 36];

	private alive: boolean;
	private animating: boolean;
	private frameRequest: number;
	private lastTime: number;
	private pointerHandler: PointerHandler | null;

	private nextRoundButton: HTMLButtonElement;
	private shelf: HTMLDivElement;
	private alienRow: HTMLDivElement;
	private resultLabel: HTMLDivElement;
	private resultLabelRound: HTMLSpanElement;
	private resultLabelMarker: HTMLSpanElement[];
	private resultLabelTotal: HTMLSpanElement;
	private readonly musicButton: HTMLButtonElement;

	private movingAlien: Alien | null;
	private movingInitialX: number;
	private movingInitialY: number;
	private round: number;
	private points: number;
	private lastPlacedAlien: number;
	private originalAlienPlacement: number;

	private readonly boundMouseDown: any;
	private readonly boundMouseMove: any;
	private readonly boundMouseUp: any;
	private readonly boundOutsidePointerHandler: any;
	private readonly boundRender: any;

	public constructor() {
		super();

		this.baseElement.classList.add("text-center");

		const backButton = View.createWhiteButton(this.baseElement, { imageId: Icon.Clear, text: Strings.Close }, this.back.bind(this), "small");
		backButton.style.position = "absolute";
		backButton.style.left = smallMarginCss;
		backButton.style.top = smallMarginCss;

		const nextRoundButton = View.createBlueButton(this.baseElement, { imageId: Icon.Accept, text: Strings.NextRound }, this.nextRound.bind(this), "small fade visible");
		nextRoundButton.setAttribute("disabled", "disabled");
		nextRoundButton.style.position = "absolute";
		nextRoundButton.style.right = smallMarginCss;
		nextRoundButton.style.top = smallMarginCss;
		this.nextRoundButton = nextRoundButton;

		const shelf = document.createElement("div");
		shelf.style.pointerEvents = "none";
		shelf.style.marginTop = alienHeightCss;
		shelf.style.height = alienHeightCss;
		this.shelf = shelf;
		this.baseElement.appendChild(shelf);

		const alienRow = document.createElement("div");
		alienRow.className = "train";
		this.alienRow = alienRow;

		for (let i = GameView.MaximumAlienCount - 1; i >= 0; i--) {
			const target = document.createElement("div");
			target.className = "target";
			alienRow.appendChild(target);
		}

		this.baseElement.appendChild(alienRow);

		const resultLabel = document.createElement("div");
		resultLabel.className = "result-label";
		this.resultLabel = resultLabel;

		const resultLabelRound = document.createElement("span");
		resultLabelRound.className = "round";
		resultLabel.appendChild(resultLabelRound);
		this.resultLabelRound = resultLabelRound;

		const resultLabelMarker: HTMLSpanElement[] = new Array(GameView.TotalRoundCount);
		for (let i = 0; i < GameView.TotalRoundCount; i++) {
			const marker = document.createElement("span");
			marker.className = "marker";
			resultLabel.appendChild(marker);
			resultLabelMarker[i] = marker;
			const points = document.createElement("span");
			points.className = "points";
			marker.appendChild(points);
		}
		this.resultLabelMarker = resultLabelMarker;

		const resultLabelTotal = document.createElement("span");
		resultLabelTotal.className = "total";
		resultLabel.appendChild(resultLabelTotal);
		this.resultLabelTotal = resultLabelTotal;

		const resultLabelRow2 = document.createElement("div");
		resultLabelRow2.className = "row2";
		resultLabelRow2.innerHTML = `<s>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</s><img src="assets/images/logo-small.png" /><s>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</s>`;
		resultLabel.appendChild(resultLabelRow2);

		this.baseElement.appendChild(resultLabel);

		this.musicButton = View.createWhiteButton(this.baseElement, musicPlaying ? Strings.StopMusic : Strings.PlayMusic, toggleMusic, "fade small visible");
		this.musicButton.style.position = "absolute";
		this.musicButton.style.fontSize = "0.5rem";
		this.musicButton.style.left = "1.5rem";
		this.musicButton.style.bottom = "1.5rem";

		this.baseElement.appendChild(this.musicButton);

		this.alive = true;
		this.animating = false;
		this.frameRequest = 0;
		this.lastTime = 0;
		this.pointerHandler = null;
		this.movingAlien = null;
		this.movingInitialX = 0;
		this.movingInitialY = 0;
		this.round = 0;
		this.points = 0;
		this.lastPlacedAlien = 0;
		this.originalAlienPlacement = -1;

		this.boundMouseDown = this.mouseDown.bind(this);
		this.boundMouseMove = this.mouseMove.bind(this);
		this.boundMouseUp = this.mouseUp.bind(this);
		this.boundOutsidePointerHandler = this.outsidePointerHandler.bind(this);
		this.boundRender = this.render.bind(this);
	}

	protected async attach(): Promise<void> {
		musicButton = this.musicButton;
		updateMusicButton();

		this.lastTime = performance.now();

		this.alive = true;

		this.pointerHandler = new PointerHandler(this.baseElement, this.boundMouseDown, this.boundMouseMove, this.boundMouseUp, false, this.boundOutsidePointerHandler);
	}

	protected async detach(): Promise<void> {
		musicButton = null;

		this.alive = false;

		if (this.pointerHandler) {
			this.pointerHandler.destroy();
			this.pointerHandler = null;
		}

		if (this.frameRequest) {
			cancelAnimationFrame(this.frameRequest);
			this.frameRequest = 0;
		}
	}

	protected destroyInternal(partial: boolean): void {
		if (!partial)
			Alien.destroyAll();
	}

	protected fadeInFinished(): void {
		if (this.frameRequest) {
			cancelAnimationFrame(this.frameRequest);
			this.frameRequest = 0;
		}

		this.frameRequest = requestAnimationFrame(this.boundRender);

		this.restart();
	}

	private back(e: Event): boolean {
		this.fadeTo(() => new TitleView());
		return true;
	}

	private async displayAddedPoints(addedPoints: number, updateResultLabel: boolean): Promise<void> {
		if (updateResultLabel && this.round > 1 && this.round <= GameView.TotalRoundCount)
			(this.resultLabelMarker[this.round - 2].firstChild as HTMLSpanElement).textContent = addedPoints.toString();

		if (!addedPoints)
			return;

		const div = document.createElement("div");
		div.className = "added-points";
		div.textContent = `+ ${addedPoints} ${((addedPoints === 1) ? Strings.point : Strings.points)}!`;
		this.baseElement.appendChild(div);

		await delay(animationStartDelayMS);

		if (!this.alive)
			return;

		div.classList.add("fading");

		await delay(1500);

		if (!this.alive)
			return;

		this.baseElement.removeChild(div);
	}

	private async generateNewAliens(addedPoints: number): Promise<void> {
		let newAlienCount = GameView.MaximumAlienCount;

		const shelf = this.shelf,
			oldAlienElements = shelf.getElementsByClassName("alien"),
			delayIncrement = 75;

		if (oldAlienElements.length) {
			newAlienCount = 0;

			const oldPromises: Promise<void>[] = [],
				oldAliens: Alien[] = [];

			for (let i = oldAlienElements.length - 1, d = 0; i >= 0; i--, d += delayIncrement) {
				const alien = Alien.fromElement(oldAlienElements[i]);
				if (alien) {
					if (!alien.paused) {
						oldPromises.push(alien.shrink(d));
						newAlienCount++;
					}
					oldAliens.push(alien);
				}
			}

			if (this.resultLabel.classList.contains("visible")) {
				this.resultLabel.classList.remove("visible");
				oldPromises.push(delay(slowAnimationTimeoutMS));
			}

			await Promise.all(oldPromises);

			if (!this.alive)
				return;

			for (let i = oldAliens.length - 1; i >= 0; i--)
				oldAliens[i].destroy();

		} else if (this.resultLabel.classList.contains("visible")) {
			this.resultLabel.classList.remove("visible");

			await delay(slowAnimationTimeoutMS);

			if (!this.alive)
				return;
		}

		this.displayAddedPoints(addedPoints, true);

		const newPromises: Promise<void>[] = new Array(newAlienCount);

		for (let i = newAlienCount - 1, d = 0; i >= 0; i--, d += delayIncrement) {
			const alien = Alien.create(Alien.KindRandom, shelf);
			newPromises[i] = alien.grow(d);
		}

		for (let i = GameView.TotalRoundCount; i >= 1; i--) {
			if (i > this.round)
				this.resultLabelMarker[i - 1].classList.remove("done");
			else
				this.resultLabelMarker[i - 1].classList.add("done");

			if (i >= this.round)
				(this.resultLabelMarker[i - 1].firstChild as HTMLSpanElement).textContent = "";
		}
		this.resultLabelRound.textContent = Strings.Round + this.round;
		this.resultLabelTotal.textContent = Strings.Total + this.points;

		await delay(animationStartDelayMS);

		if (!this.alive)
			return;

		this.resultLabel.classList.add("visible");

		await Promise.all(newPromises);

		if (!this.alive)
			return;

		this.animating = false;
	}

	private async restart(): Promise<void> {
		if (!this.alive || this.animating || this.movingAlien)
			return;

		this.nextRoundButton.setAttribute("disabled", "disabled");
		this.nextRoundButton.replaceChild(document.createTextNode(Strings.NextRound), this.nextRoundButton.childNodes[1]);

		this.animating = true;

		const alienElements = this.baseElement.getElementsByClassName("alien"),
			promises: Promise<void>[] = [],
			delayIncrement = 75;

		for (let i = alienElements.length - 1, d = 0; i >= 0; i--, d += delayIncrement) {
			const alien = Alien.fromElement(alienElements[i]);
			if (alien && !alien.paused)
				promises.push(alien.shrink(d));
		}

		await Promise.all(promises);

		if (!this.alive)
			return;

		Alien.destroyAll();

		this.animating = false;
		this.round = 0;
		this.points = 0;
		this.lastPlacedAlien = 0;
		this.originalAlienPlacement = -1;

		this.nextRound();
	}

	private async showMessage(error: boolean, html: string): Promise<void> {
		if (this.animating)
			return;

		this.animating = true;

		return new Promise(async (resolve) => {
			Modal.show({
				html: html,
				error: error,

				onhidden: () => {
					if (!this.alive)
						return;

					this.animating = false;

					resolve();
				}
			});
		});
	}

	private async gameOver(message: string): Promise<void> {
		await this.showMessage(true, message);

		if (!this.alive)
			return;

		this.animating = true;

		await delay(slowAnimationTimeoutMS);

		if (!this.alive)
			return;

		this.animating = false;

		return this.restart();
	}

	private async gameFinished(addedPoints: number, typeCount: number, extraPoints: number): Promise<void> {

		this.animating = true;

		this.resultLabel.classList.remove("visible");

		await delay(fastAnimationTimeoutMS);

		if (!this.alive)
			return;

		this.round++;

		await this.displayAddedPoints(addedPoints, false);

		if (!this.alive)
			return;

		this.animating = false;

		await this.showMessage(false, Strings.Victory
			.replace("{totalPoints}", this.points.toString())
			.replace("{regularPoints}", (this.points - extraPoints).toString())
			.replace("{extraPoints}", extraPoints.toString())
			+ typeCount + ((typeCount === 1) ? Strings.VictorySpeciesSingular : Strings.VictorySpeciesPlural));

		if (!this.alive)
			return;

		this.restart();
	}

	private computeAddedPoints(): number {
		if (!this.alienRow)
			return 0;

		const alienElements = this.alienRow.getElementsByClassName("alien");

		let lastType = Alien.KindRandom, seq = 0, points = 0;

		for (let i = alienElements.length - 1; i >= 0; i--) {
			const alien = Alien.fromElement(alienElements[i]);
			if (!alien)
				continue;

			const id = alien.kind.id;
			if (lastType === id) {
				seq++;
			} else {
				points += GameView.PointsPerSequence[seq];
				seq = 1;
				lastType = id;
			}
		}

		return points + GameView.PointsPerSequence[seq];
	}

	private computeExtraPoints(): { typeCount: number, extraPoints: number } {
		if (!this.alienRow)
			return { typeCount: 0, extraPoints: 0 };

		const alienElements = this.alienRow.getElementsByClassName("alien"),
			types: number[] = new Array(Alien.KindCount);

		types.fill(0);

		let typeCount = 0;

		for (let i = alienElements.length - 1; i >= 0; i--) {
			const alien = Alien.fromElement(alienElements[i]);
			if (alien && !(types[alien.kind.id]++))
				typeCount++;
		}

		return { typeCount: typeCount, extraPoints: (3 * typeCount) };
	}

	private nextRound(): boolean {
		if (!this.alive || this.animating || this.movingAlien)
			return false;

		let addedPoints = 0;
		if (this.lastPlacedAlien) {
			addedPoints = this.computeAddedPoints();
			this.points += addedPoints;
		}

		if (this.lastPlacedAlien >= GameView.MaximumAlienCount) {
			const { typeCount, extraPoints } = this.computeExtraPoints();
			addedPoints += extraPoints;
			this.points += extraPoints;
			this.gameFinished(addedPoints, typeCount, extraPoints);
			return true;
		}

		this.animating = true;

		this.round++;

		this.nextRoundButton.setAttribute("disabled", "disabled");

		this.generateNewAliens(addedPoints);

		return true;
	}

	private mouseDown(e: MouseEvent): boolean {
		if (!this.alive || this.animating)
			return false;

		const x = e.clientX,
			y = e.clientY,
			containers: HTMLElement[] = [this.shelf, this.alienRow];
		
		for (let i = containers.length - 1; i >= 0; i--) {
			const alienElements = containers[i].getElementsByClassName("alien");
			let rect = containers[i].getBoundingClientRect();

			if (y >= rect.top && y < rect.bottom && alienElements && alienElements.length) {
				for (let i = alienElements.length - 1; i >= 0; i--) {
					rect = alienElements[i].getBoundingClientRect();

					if (x >= rect.left && x < rect.right) {
						const alien = Alien.fromElement(alienElements[i]);

						if (alien && alien.element && !alien.paused) {
							alien.element.classList.add("moving");

							this.alienRow.classList.add("dragging");

							this.movingInitialX = x;
							this.movingInitialY = y;
							this.movingAlien = alien;
							this.originalAlienPlacement = alien.placement;

							return true;
						}
					}
				}
			}
		}

		return false;
	}

	private mouseMove(e: MouseEvent): void {
		if (!this.movingAlien || !this.movingAlien.element)
			return;

		this.movingAlien.element.style.transform = `translate(${(e.clientX - this.movingInitialX)}px, ${(e.clientY - this.movingInitialY)}px)`;
	}

	private mouseUp(e: MouseEvent): void {
		const movingAlien = this.movingAlien;
		if (!movingAlien || !movingAlien.element)
			return;

		this.movingAlien = null;

		const alienRow = this.alienRow,
			targets = alienRow.children,
			x = e.clientX,
			y = e.clientY;

		alienRow.classList.remove("dragging");

		movingAlien.element.classList.remove("moving");
		movingAlien.element.style.transform = "";

		let rect = alienRow.getBoundingClientRect();
		if (y >= rect.top && y < rect.bottom) {
			for (let i = targets.length - 1; i >= 0; i--) {
				const target = targets[i];
				if (!target.classList.contains("target") ||
					x < (rect = target.getBoundingClientRect()).left ||
					x >= rect.right)
					continue;

				if (this.originalAlienPlacement >= 0) {
					if (this.originalAlienPlacement !== i)
						this.gameOver(Strings.GameOverReposition);
					return;
				}

				if (this.lastPlacedAlien !== i) {
					this.gameOver(Strings.GameOverFirstAvailable);
					return;
				}

				if (target.childNodes.length) {
					this.gameOver(Strings.GameOverReplace);
					return;
				}

				movingAlien.paused = true;
				movingAlien.element.style.visibility = "hidden";

				Alien.create(movingAlien.kind, target as HTMLElement, this.lastPlacedAlien).grow();

				this.lastPlacedAlien++;

				if (this.round < GameView.TotalRoundCount)
					this.nextRoundButton.removeAttribute("disabled");

				if (this.lastPlacedAlien >= GameView.MaximumAlienCount) {
					this.nextRoundButton.removeAttribute("disabled");
					this.nextRoundButton.replaceChild(document.createTextNode(Strings.Finish), this.nextRoundButton.childNodes[1]);
				}
			}
		}
	}

	private outsidePointerHandler(e: Event): boolean {
		return ((e.target && (e.target as HTMLElement).className === "target" && (e.target as HTMLElement).childNodes.length) ? true : false);
	}

	private render(time: number): void {
		if (this.alive) {
			this.frameRequest = requestAnimationFrame(this.boundRender);
		} else {
			this.frameRequest = 0;
			return;
		}

		let deltaMS = time - this.lastTime;
		this.lastTime = time;
		if (deltaMS > 33)
			deltaMS = 33;

		Alien.stepAll(deltaMS);
	}
}
