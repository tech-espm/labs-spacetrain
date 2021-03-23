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
// Based on https://github.com/carlosrafaelgn/pixel
//

interface ModalOptions {
	html: string | HTMLElement;
	large?: boolean;
	error?: boolean;
	onresized?: () => void;
	onshowing?: () => void;
	onshown?: () => void;
	onhiding?: () => boolean;
	onhidden?: () => void;
}

class Modal {
	private static modal: Modal | null = null;

	public static get visible(): boolean {
		return !!Modal.modal;
	}

	public static get currentModalElement() : HTMLDivElement | null {
		return (Modal.modal ? Modal.modal.modalElement : null);
	}

	public static show(options: ModalOptions): boolean {
		if (Modal.modal)
			return false;

		Modal.modal = new Modal(options);

		return true;
	}

	public static hide(): void {
		if (Modal.modal)
			Modal.modal.hideInternal();
	}

	public static defaultCancelAction(): void {
		if (Modal.modal)
			Modal.modal.hideInternal();
	}

	public static windowResized(): void {
		if (Modal.modal)
			Modal.modal.resizeInternal();
	}

	private readonly options: ModalOptions;
	private readonly containerElement: HTMLDivElement;
	private readonly modalElement: HTMLDivElement;

	private readonly boundDocumentKeyDown: any;

	private fading: boolean;

	private constructor(options: ModalOptions) {
		this.options = options;

		this.containerElement = document.createElement("div");
		this.containerElement.className = "base-element modal-container";

		this.modalElement = document.createElement("div");
		this.modalElement.className = (options.large ? "modal large" : "modal");
		if (options.error)
			this.modalElement.className += " error";
		if ((typeof options.html) === "string")
			this.modalElement.innerHTML = options.html as string;
		else
			this.modalElement.appendChild(options.html as HTMLElement);

		this.containerElement.appendChild(this.modalElement);
		View.main.appendChild(this.containerElement);

		this.boundDocumentKeyDown = this.documentKeyDown.bind(this);
		document.addEventListener("keydown", this.boundDocumentKeyDown, true);

		this.fading = true;

		window.setTimeout(() => {
			if (options.onshowing)
				options.onshowing();

			this.resizeInternal();

			this.containerElement.classList.add("visible");

			window.setTimeout(() => {
				this.fading = false;

				this.containerElement.onclick = Modal.hide;

				View.pushHistoryStateIfNecessary();

				if (this.options.onshown)
					this.options.onshown();
			}, slowAnimationTimeoutMS);
		}, animationStartDelayMS);
	}

	private hideInternal(): void {
		if (Modal.modal !== this || this.fading)
			return;

		if (this.options.onhiding && this.options.onhiding() === false)
			return;

		document.removeEventListener("keydown", this.boundDocumentKeyDown, true);

		this.fading = true;
		this.containerElement.classList.remove("visible");

		window.setTimeout(() => {
			Modal.modal = null;

			View.popHistoryStateIfNecessary();

			if (this.options.onhidden)
				this.options.onhidden();

			View.main.removeChild(this.containerElement);

			zeroObject(this.options);
			zeroObject(this);
		}, slowAnimationTimeoutMS);
	}

	private documentKeyDown(e: KeyboardEvent): void {
		if (e.key === "Escape" || e.keyCode === 27)
			this.hideInternal();
	}

	private resizeInternal(): void {
		if (Modal.modal !== this)
			return;

		if (this.options.onresized)
			this.options.onresized();
	}
}
