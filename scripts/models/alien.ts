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

interface AlienKind {
	readonly id: number;
	readonly imageUrl: string;
	readonly rows: number;
	readonly cols: number;
	readonly frames: number;
}

class Alien {
	public static readonly KindRandom = -1;
	public static readonly KindBlack = 0;
	public static readonly KindBlue = 1;
	public static readonly KindGreen = 2;
	public static readonly KindIndigo = 3;
	public static readonly KindOrange = 4;
	public static readonly KindPink = 5;
	public static readonly KindRed = 6;
	public static readonly KindYellow = 7;
	private static readonly KindMin = Alien.KindBlack;
	private static readonly KindMax = Alien.KindYellow;
	public static readonly KindCount = Alien.KindYellow + 1;

	private static readonly Kinds: AlienKind[] = [
		{ id: Alien.KindBlack, imageUrl: "assets/images/aliens/black.png", rows: 4, cols: 3, frames: 10 },
		{ id: Alien.KindBlue, imageUrl: "assets/images/aliens/blue.png", rows: 4, cols: 3, frames: 12 },
		{ id: Alien.KindGreen, imageUrl: "assets/images/aliens/green.png", rows: 5, cols: 4, frames: 20 },
		{ id: Alien.KindIndigo, imageUrl: "assets/images/aliens/indigo.png", rows: 5, cols: 5, frames: 22 },
		{ id: Alien.KindOrange, imageUrl: "assets/images/aliens/orange.png", rows: 3, cols: 3, frames: 9 },
		{ id: Alien.KindPink, imageUrl: "assets/images/aliens/pink.png", rows: 6, cols: 5, frames: 29 },
		{ id: Alien.KindRed, imageUrl: "assets/images/aliens/red.png", rows: 7, cols: 6, frames: 40 },
		{ id: Alien.KindYellow, imageUrl: "assets/images/aliens/yellow.png", rows: 4, cols: 4, frames: 16 },
	];

	private static readonly aliens: Alien[] = [];

	public static preloadAllImages(): Promise<void[]> {
		const promises: Promise<void>[] = new Array(Alien.Kinds.length);

		for (let i = Alien.Kinds.length - 1; i >= 0; i--)
			promises[i] = preloadImage(Alien.Kinds[i].imageUrl);

		return Promise.all(promises);
	}

	public static create(kind: number | AlienKind, parent?: HTMLElement | null, placement?: number): Alien {
		if (kind === Alien.KindRandom) {
			const range = Alien.KindMax - Alien.KindMin + 1;
			kind = Alien.KindMin + (((Math.random() * (range * range * range)) | 0) % range);
		}

		const alien = new Alien(kind, placement);
		Alien.aliens.push(alien);

		if (parent)
			parent.appendChild(alien.element);

		return alien;
	}

	public static destroyAll(): void {
		for (let i = Alien.aliens.length - 1; i >= 0; i--)
			Alien.aliens[i].destroy(true);
		Alien.aliens.splice(0);
	}

	public static stepAll(deltaMS: number) {
		const deltaFrames = (12 / 1000) * deltaMS,
			aliens = Alien.aliens;

		for (let i = aliens.length - 1; i >= 0; i--)
			aliens[i].updateDOM(deltaFrames);
	}

	public static fromElement(element: any | null): Alien | null {
		return (element ? ((element["alien"] as Alien) || null) : null);
	}

	public readonly kind: AlienKind;
	public readonly element: HTMLDivElement;
	public paused: boolean;
	private _placement: number;
	private frame: number;
	private frameInteger: number;

	private constructor(kind: number | AlienKind, placement?: number) {
		if ((typeof kind) === "number") {
			if (kind < Alien.KindMin || kind > Alien.KindMax)
				throw new Error("Invalid alien kind");
			this.kind = Alien.Kinds[kind as number];
		} else {
			this.kind = kind as AlienKind;
		}

		this.element = document.createElement("div");
		this.element.className = "alien";
		this.element.style.width = alienWidthCss;
		this.element.style.height = alienHeightCss;
		this.element.style.backgroundImage = `url(${this.kind.imageUrl})`;
		this.element.style.backgroundSize = `${(this.kind.cols * alienWidthRem)}rem ${(this.kind.rows * alienHeightRem)}rem`;
		(this.element as any)["alien"] = this;

		this.paused = false;
		this.frame = Math.random() * this.kind.frames;
		this.frameInteger = this.frame | 0;
		this._placement = ((placement === undefined) ? -1 : placement);

		this.updateDOM();
	}

	public get placement(): number {
		return this._placement;
	}

	private updateDOM(deltaFrames?: number): void {
		if (this.paused || !this.element)
			return;

		let f: number;

		if (deltaFrames) {
			this.frame = (this.frame + deltaFrames) % this.kind.frames;

			f = this.frame | 0;
			if (this.frameInteger === f)
				return;

			this.frameInteger = f;
		} else {
			f = this.frameInteger;
		}

		const cols = this.kind.cols;

		this.element.style.backgroundPosition = `-${((f % cols) * alienWidthRem)}rem -${(((f / cols) | 0) * alienHeightRem)}rem`;
	}

	public async shrink(delayMS?: number): Promise<void> {
		if (!this.element)
			return;

		await delay((delayMS || 0) + animationStartDelayMS);

		if (!this.element)
			return;

		this.element.classList.remove("full-size");

		return delay(slowAnimationTimeoutMS);
	}

	public async grow(delayMS?: number): Promise<void> {
		if (!this.element)
			return;

		await delay((delayMS || 0) + animationStartDelayMS);

		if (!this.element)
			return;

		this.element.classList.add("full-size");

		return delay(slowAnimationTimeoutMS);
	}

	public destroy(destroyingAll?: boolean): void {
		if (this.element) {
			(this.element as any)["alien"] = null;
			if (this.element.parentNode)
				this.element.parentNode.removeChild(this.element);
		}

		if (!destroyingAll) {
			const i = Alien.aliens.indexOf(this);
			if (i >= 0)
				Alien.aliens.splice(i, 1);
		}

		zeroObject(this);
	}
}
