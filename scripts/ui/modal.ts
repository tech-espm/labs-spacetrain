//
// MIT License
//
// Copyright (c) 2021 Carlos Rafael Gimenes das Neves
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
// https://github.com/carlosrafaelgn/pixel
//

interface ModalButtonCallback {
	(id: string | undefined, button: HTMLButtonElement): void;
}

interface ModalButton {
	id?: string;
	defaultCancel?: boolean;
	defaultSubmit?: boolean;
	iconId?: number;
	text?: string;
	className?: string;
	onclick?: ModalButtonCallback;
}

interface ModalOptions {
	html: string | HTMLElement;
	title?: string;
	large?: boolean;
	collapsible?: boolean;
	okcancel?: boolean;
	okcancelsubmit?: boolean;
	buttons?: ModalButton[];
	onbuttonclick?: ModalButtonCallback;
	onresized?: () => void;
	onshowing?: () => void;
	onshown?: () => void;
	onhiding?: () => boolean;
	onhidden?: () => void;
	onok?: () => void;
	oncancel?: () => void;
}

class Modal {
	private static modal: Modal | null = null;

	public static get visible(): boolean {
		return !!Modal.modal;
	}

	public static get currentModalElement() : HTMLFormElement | null {
		return (Modal.modal ? Modal.modal.modalElement : null);
	}

	public static get currentModalHeaderElement() : HTMLDivElement | null {
		return (Modal.modal ? Modal.modal.modalHeaderElement : null);
	}

	public static get currentModalBodyElement() : HTMLDivElement | null {
		return (Modal.modal ? Modal.modal.modalBodyElement : null);
	}

	public static get currentModalFooterElement() : HTMLDivElement | null {
		return (Modal.modal ? Modal.modal.modalFooterElement : null);
	}

	public static show(options: ModalOptions): boolean {
		if (Modal.modal)
			return false;

		if (options.okcancel) {
			options.buttons = [
				{
					id: "cancel",
					defaultCancel: true,
					iconId: Icon.Back,
					text: Strings.Cancel,
					onclick: (options.oncancel || Modal.hide),
				},
				{
					id: "ok",
					defaultSubmit: options.okcancelsubmit,
					iconId: Icon.AcceptGreen,
					text: Strings.OK,
					className: "green",
					onclick: (options.onok || Modal.hide),
				}
			];
		} else if (!options.buttons || !options.buttons.length) {
			options.buttons = [
				{
					id: "cancel",
					defaultCancel: true,
					iconId: Icon.Back,
					text: Strings.Close,
					onclick: Modal.hide
				}
			];
		}

		Modal.modal = new Modal(options);

		return true;
	}

	public static hide(): void {
		if (Modal.modal)
			Modal.modal.hideInternal();
	}

	public static collapse(): void {
		if (Modal.modal)
			Modal.modal.collapseInternal();
	}

	public static expand(): void {
		if (Modal.modal)
			Modal.modal.expandInternal();
	}

	public static toggle(): void {
		if (Modal.modal) {
			if (Modal.modal.collapsed)
				Modal.modal.expandInternal();
			else
				Modal.modal.collapseInternal();
		}
	}

	public static defaultCancelAction(): void {
		if (Modal.modal)
			Modal.modal.defaultCancelActionInternal();
	}

	public static windowResized(): void {
		if (Modal.modal)
			Modal.modal.resizeInternal();
	}

	private readonly options: ModalOptions;
	private readonly containerElement: HTMLDivElement;
	private readonly modalElement: HTMLFormElement;
	private readonly modalHeaderElement: HTMLDivElement;
	private readonly modalBodyElement: HTMLDivElement;
	private readonly modalFooterElement: HTMLDivElement;
	private readonly defaultCancelButton: HTMLButtonElement | null;
	private readonly defaultSubmitButton: HTMLButtonElement | null;

	private readonly boundDocumentKeyDown: any;

	private fading: boolean;
	private collapsing: boolean;
	private collapsed: boolean;
	private expandedHeight: string;

	private constructor(options: ModalOptions) {
		this.options = options;

		this.containerElement = document.createElement("div");
		this.containerElement.className = "base-element modal-container";

		this.modalElement = document.createElement("form");
		this.modalElement.className = (options.large ? "modal large" : "modal");
		this.modalElement.onsubmit = this.submit.bind(this);

		this.modalHeaderElement = document.createElement("div");
		this.modalHeaderElement.className = "modal-decoration";
		this.modalHeaderElement.innerHTML = options.title || Strings.Oops;
		if (options.collapsible) {
			const collapseButton = Icon.create(Icon.Clear, this.modalHeaderElement);
			collapseButton.onclick = () => { Modal.toggle(); return false; };
			collapseButton.className += " modal-collapse-button";
		}

		this.modalBodyElement = document.createElement("div");
		this.modalBodyElement.className = (options.collapsible ? "modal-body collapsible" : "modal-body");
		if ((typeof options.html) === "string")
			this.modalBodyElement.innerHTML = options.html as string;
		else
			this.modalBodyElement.appendChild(options.html as HTMLElement);

		const buttons = this.modalBodyElement.getElementsByTagName("button");
		if (buttons && buttons.length) {
			for (let i = buttons.length - 1; i >= 0; i--) {
				const button = buttons[i];
				prepareButtonBlink(button, true, () => {
					if (this.fading || this.collapsing)
						return false;

					if (this.options.onbuttonclick)
						this.options.onbuttonclick(button.id, button);

					return true;
				});
			}
		}

		this.modalFooterElement = document.createElement("div");
		this.modalFooterElement.className = "modal-decoration";

		this.defaultCancelButton = null;
		this.defaultSubmitButton = null;

		if (options.buttons) {
			for (let i = 0; i < options.buttons.length; i++) {
				const currentButton = options.buttons[i];

				const button = View.createButton(this.modalFooterElement, { imageId: currentButton.iconId, text: currentButton.text }, null, "class", currentButton.className || "black");
				if (currentButton.defaultCancel)
					this.defaultCancelButton = button;
				if (currentButton.defaultSubmit)
					this.defaultSubmitButton = button;
				if (i)
					button.style.float = "right";
				prepareButtonBlink(button, true, () => {
					if (this.fading || this.collapsing)
						return false;

					if (currentButton.onclick)
						currentButton.onclick(currentButton.id, button);

					if (this.options.onbuttonclick)
						this.options.onbuttonclick(currentButton.id, button);

					return true;
				});
			}
		}

		this.modalElement.appendChild(this.modalHeaderElement);
		this.modalElement.appendChild(this.modalBodyElement);
		this.modalElement.appendChild(this.modalFooterElement);
		this.containerElement.appendChild(this.modalElement);
		View.main.appendChild(this.containerElement);

		this.boundDocumentKeyDown = this.documentKeyDown.bind(this);
		document.addEventListener("keydown", this.boundDocumentKeyDown, true);

		this.fading = true;
		this.collapsing = false;
		this.collapsed = false;
		this.expandedHeight = "";

		window.setTimeout(() => {
			if (options.onshowing)
				options.onshowing();

			this.resizeInternal();

			this.containerElement.classList.add("visible");

			window.setTimeout(() => {
				this.fading = false;

				View.pushHistoryStateIfNecessary();

				if (this.options.onshown)
					this.options.onshown();
			}, slowAnimationTimeoutMS);
		}, animationStartDelayMS);
	}

	private hideInternal(): void {
		if (Modal.modal !== this || this.fading || this.collapsing)
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

			if (this.options.buttons) {
				for (let i = this.options.buttons.length - 1; i >= 0; i--)
					zeroObject(this.options.buttons[i]);
			}
			zeroObject(this.options);
			zeroObject(this);
		}, slowAnimationTimeoutMS);
	}

	private collapseInternal(): void {
		if (Modal.modal !== this || this.fading || this.collapsing || this.collapsed)
			return;

		this.collapsing = true;
		const rect = this.modalBodyElement.getBoundingClientRect();
		this.expandedHeight = (rect.bottom - rect.top) + "px";
		this.modalBodyElement.style.height = this.expandedHeight;
		this.modalBodyElement.style.overflow = "hidden";

		window.setTimeout(() => {
			this.modalBodyElement.classList.add("collapsed");
			this.modalBodyElement.style.height = "0";
			window.setTimeout(() => {
				this.collapsing = false;
				this.collapsed = true;
			}, fastAnimationTimeoutMS);
		}, animationStartDelayMS);
	}

	private expandInternal(): void {
		if (Modal.modal !== this || this.fading || this.collapsing || !this.collapsed)
			return;

		this.collapsing = true;
		this.modalBodyElement.classList.remove("collapsed");
		this.modalBodyElement.style.height = this.expandedHeight;

		window.setTimeout(() => {
			this.collapsing = false;
			this.collapsed = false;
			this.modalBodyElement.style.height = "";
			this.modalBodyElement.style.overflow = "";
		}, fastAnimationTimeoutMS);
	}

	private documentKeyDown(e: KeyboardEvent): void {
		if (e.key === "Escape" || e.keyCode === 27)
			this.defaultCancelActionInternal();
	}

	private defaultCancelActionInternal(): void {
		if (this.defaultCancelButton)
			this.defaultCancelButton.click();
	}

	private submit(e: Event): boolean {
		cancelEvent(e);

		if (this.defaultSubmitButton)
			this.defaultSubmitButton.click();

		return false;
	}

	private resizeInternal(): void {
		if (Modal.modal !== this)
			return;

		if (this.options.onresized)
			this.options.onresized();
	}
}
