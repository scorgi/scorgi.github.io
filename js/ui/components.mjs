// @ts-check

import * as Luxon from "../../js/hosted/luxon/luxon-es6.min.mjs";
import Fuse from "../../../public/js/hosted/fuse/fuse.es6.min.js";
import * as Environment from "./environment.mjs";
import * as Shared from "./shared.mjs";
import * as VisualComponents from "./components-visual.mjs";
import { renderPassage, contentSharedHtmlIds, contentReplaceSharedHtml } from "../../js/problem/shared-utilities.mjs";
import * as Search from "../../js/common/search.js";

/** @typedef {import("./base.ts").IGenericInputElementField} IGenericInputElementField */
/** @typedef {import("./base.ts").InputElementSelectOption} InputElementSelectOption */
/** @typedef {import("./base.ts").InputElementDataListOption} InputElementDataListOption */
/** @typedef {import("./base.ts").InputElementOptions} InputElementOptions */
/** @typedef {import("./base.ts").ValidationMessage} ValidationMessage */

/**
 * @callback SnippetOnFocus
 * @param {HTMLInputElement} element
 * @param {boolean} [isAceEditor=false]
 * @returns {void}
 */

export const Snippet = {
    /** @type {SnippetOnFocus} */
    // eslint-disable-next-line no-unused-vars
    onFocus: (element, isAceEditor) => { },
};

export class InputElementColumn extends Shared.InputElement {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementColumn = document.createElement("div");
        this.elementColumn.className = "col-12";

        // spinner
        this.elementSpinner = document.createElement("div");
        this.elementSpinner.className = "spinner-border spinner-border-sm d-none";
        this.elementSpinner.role = "status";
        this.elementColumn.appendChild(this.elementSpinner);
    }

    spin() {
        this.elementSpinner.classList.remove("d-none");
    }

    success() {
        this.elementSpinner.classList.add("d-none");
        // this.validateMessageUpdate({ valid: true, reason: "" });
    }

    failure() {
        this.elementSpinner.classList.add("d-none");
        // this.validateMessageUpdate({ valid: false, reason: "Error" });
    }

    hide() {
        this.elementColumn.classList.add("d-none");
    }

    show() {
        this.elementColumn.classList.remove("d-none");
    }
}

/**
 * @abstract
 * @class
 */
export class InputElementField extends InputElementColumn {
    /** @type {HTMLElement | null} */
    elementInputGroupPrepend = null;
    /** @type {HTMLElement | null} */
    elementInputGroupAppend = null;
    /** @type {HTMLDivElement | null} */
    elementDropdown;

    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        // label
        this.elementColumn.appendChild(this.elementLabel);
        if (Shared.useOverlappingLabel) {
            VisualComponents.labelFloat(this.elementLabel);
        }

        // input
        this.inputGroup = document.createElement("div");
        this.inputGroup.classList.add("input-group");
        this.elementColumn.appendChild(this.inputGroup);

        // validation message
        this.elementColumn.appendChild(this.elementMessage);
    }

    getLabel() {
        return this.elementLabel.textContent;
    }

    prependElement(element) {
        switch (Environment.bootstrapVersionGet()) {
            case 4:
                if (this.elementInputGroupPrepend === null) {
                    this.elementInputGroupPrepend = document.createElement("div");
                    this.elementInputGroupPrepend.classList.add("input-group-prepend");
                    this.inputGroup.prepend(this.elementInputGroupPrepend);
                }
                this.elementInputGroupPrepend.appendChild(element);
                break;
            case 5:
                this.inputGroup.prepend(element);
                break;
        }
    }

    appendElement(element) {
        switch (Environment.bootstrapVersionGet()) {
            case 4:
                if (this.elementInputGroupAppend === null) {
                    this.elementInputGroupAppend = document.createElement("div");
                    this.elementInputGroupAppend.classList.add("input-group-append");
                    this.inputGroup.append(this.elementInputGroupAppend);
                }
                this.elementInputGroupAppend.appendChild(element);
                break;
            case 5:
                this.inputGroup.append(element);
                break;
        }
    }

    //add/remove asterisk to label
    setLabelAsterisk(required) {
        this.required = required;

        // Check if an asterisk already exists
        let asterisk = this.elementLabel.querySelector(".required-asterisk");
        if (!asterisk) {
            // Only create and append if not already present
            asterisk = VisualComponents.createRequiredAsterisk();
            this.elementLabel.appendChild(asterisk);
        }
        asterisk.classList.toggle("d-none", !required);
    }

    /**
     * @returns {ValidationMessage}
     */
    validationFunction() {
        console.warn("Validation function not implemented");
        return { valid: true, reason: "Validation function not implemented" };
    }

    /**
     * Set this input field's validation function
     * @param {() => ValidationMessage} func
     */
    validationFunctionSet(func) {
        this.validationFunction = func;
    }

    /**
     * Update this input field's current validation message
     * @param {ValidationMessage} param0
     */
    validationMessageUpdate({ valid, reason }) {
        if (valid) {
            this.elementMessage.classList.add("d-none");
            this.elementMessage.innerText = "";
        } else {
            this.elementMessage.classList.remove("d-none");
            this.elementMessage.innerText = reason;
        }
    }

    /**
     * Validate this input field's value using its validation function and update the validation message
     * @returns {ValidationMessage}
     */
    validate() {
        const validation = this.validationFunction();
        this.validationMessageUpdate(validation);
        return validation;
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementString extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "text";
        this.inputGroup.appendChild(this.elementInput);
    }

    /**
     * @param {string} [value]
     */
    set(value) {
        this.elementInput.value = value ?? "";
        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length === 0) {
            this.elementInput.classList.add("is-invalid");
            this.elementMessage.innerText = "Required value is empty";
            return { valid: false, reason: "Required value is empty" };
        } else {
            this.elementInput.classList.add("is-valid");
            this.elementMessage.classList.add("d-none");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementText extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("textarea");
        this.elementInput.classList.add("form-control");
        this.elementInput.rows = 4;
        this.inputGroup.appendChild(this.elementInput);
    }

    /**
     * @param {string} [value]
     */
    set(value) {
        this.elementInput.value = value ?? "";
        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is empty" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementNumber extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "text";
        this.inputGroup.appendChild(this.elementInput);
        // make numpad on mobile
        this.elementInput.pattern = "[0-9]*";
        this.elementInput.inputMode = "numeric";

        this.elementInput.type = "text";
    }

    /**
     * @param {number} [value]
     */
    set(value) {
        this.value = value ?? 0;
        this.elementInput.value = value?.toString() ?? "0";
        return true;
    }

    /** @returns {number} */
    get() {
        return parseFloat(this.elementInput.value);
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.elementInput.value.length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is empty" };
        } else if (this.elementInput.value.length !== 0 && isNaN(this.get())) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Value is not a number" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-invalid");
        this.elementInput.classList.remove("is-valid");
        this.elementMessage.classList.add("d-none");
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementAny extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "text";
        this.inputGroup.appendChild(this.elementInput);

        this.assumedType = "string";
    }

    set(value) {
        this.elementInput.value = value ?? "";
        this.assumedType = typeof value;
        return true;
    }

    get() {
        if (this.assumedType === "number") {
            return parseFloat(this.elementInput.value);
        }
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        return { valid: true, reason: "" };
    }

    validationClear() { }
}

/**
 * @typedef {object} InputElementButtonOptions
 * @property {string} [text]
 */
export class InputElementButton extends InputElementColumn {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementButtonOptions} [button]
     */
    constructor(options, button) {
        super(options);

        this.text = button?.text ?? "Button";

        this.elementInput = document.createElement("button");
        this.elementInput.className = "btn w-100";
        if (options?.label === undefined) {
            this.elementInput.classList.add("mt-4");
        }
        this.elementInput.type = "button";

        this.resetClass = this.elementInput.className;
        this.resetting = false;
        this.resetTimer = undefined;

        this.elementSpanButtonText = document.createElement("span");
        this.elementInput.appendChild(this.elementSpanButtonText);
        this.reset();

        // put spinner in button
        this.elementSpinner.classList.add("ml-2", "ms-2");
        this.elementInput.appendChild(this.elementSpinner);

        this.elementColumn.appendChild(this.elementInput);
    }

    enable() {
        this.elementInput.disabled = false;
        this.elementInput.classList.remove("disabled");
    }

    disable() {
        this.elementInput.disabled = true;
        this.elementInput.classList.add("disabled");
    }

    validationFunction() {
        return { valid: true, reason: "" };
    }

    validationClear() { }

    /**
     * @param {string} [message=""]
     */
    spin(message) {
        if (this.resetting) {
            return;
        }

        this.resetClass = this.elementInput.className;

        this.disable();
        this.elementSpanButtonText.innerText = message ?? "";
        this.elementSpinner.classList.remove("d-none");

        this.resetting = true;
    }

    /**
     * @typedef {object} ButtonSuccessOptions
     * @property {boolean} [autoReset=true]
     */

    /**
     * @param {string} [message="Success"]
     * @param {ButtonSuccessOptions} [options]
     */
    success(message, options) {
        this.elementInput.classList.add("btn-success");
        this.elementSpanButtonText.innerText = message ?? "Success";
        this.elementSpanButtonText.classList.remove("d-none");
        this.elementSpinner.classList.add("d-none");

        if (options?.autoReset !== false) {
            if (this.resetTimer) {
                clearTimeout(this.resetTimer);
            }

            this.resetTimer = setTimeout(() => {
                this.reset();
            }, 1500);
        }
    }

    /**
     * @param {string} [message="Error"]
     * @param {ButtonSuccessOptions} [options]
     */
    failure(message, options) {
        this.elementInput.classList.add("btn-danger");
        this.elementSpanButtonText.innerText = message ?? "Error";
        this.elementSpanButtonText.classList.remove("d-none");
        this.elementSpinner.classList.add("d-none");

        if (options?.autoReset !== false) {
            if (this.resetTimer) {
                clearTimeout(this.resetTimer);
            }

            this.resetTimer = setTimeout(() => {
                this.reset();
            }, 1500);
        }
    }

    reset() {
        this.enable();
        this.elementSpanButtonText.innerHTML = this.text;
        this.elementSpanButtonText.classList.remove("d-none");
        this.elementSpinner.classList.add("d-none");

        this.elementInput.className = this.resetClass;

        this.resetting = false;
    }
}

/**
 * @typedef {object} InputElementButtonDropdownOptions
 * @property {string} [text]
 */
export class InputElementButtonDropdown extends InputElementColumn {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementButtonDropdownOptions} [button]
     */
    constructor(options, button) {
        super(options);

        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "dropdown";
        this.elementColumn.appendChild(this.elementContainer);

        this.elementInput = document.createElement("button");
        this.elementInput.className = "btn btn-secondary dropdown-toggle";
        this.elementInput.type = "button";
        this.elementInput.dataset.bsToggle = "dropdown";
        this.elementInput.setAttribute("aria-expanded", "false");
        this.elementInput.innerText = button?.text ?? "Dropdown button";
        this.elementContainer.appendChild(this.elementInput);

        this.elementDropdown = document.createElement("div");
        this.elementDropdown.className = "dropdown-menu";
        this.elementContainer.appendChild(this.elementDropdown);
    }

    /**
     * @param {Array<string>} options
     */
    optionsSet(options) {
        this.elementDropdown.innerHTML = "";

        for (const option of options) {
            let elementOption = document.createElement("li");
            elementOption.className = "dropdown-item";
            elementOption.innerText = option;
            this.elementDropdown.appendChild(elementOption);
        }
    }

    /**
     * @param {string} html
     */
    addDropdownItem(html) {
        let elementOption = document.createElement("li");
        elementOption.className = "dropdown-item";
        elementOption.style.cursor = "pointer";
        elementOption.style.userSelect = "none";
        elementOption.innerHTML = html;
        this.elementDropdown.appendChild(elementOption);
        return elementOption;
    }

    addDropdownDivider() {
        let elementDivider = document.createElement("hr");
        elementDivider.className = "dropdown-divider";
        this.elementDropdown.appendChild(elementDivider);
        return elementDivider;
    }
}

/**
 * @typedef {object} InputElementButtonCardOptions
 * @property {string} [title] - Title of the card
 * @property {string} [description] - Description of the card
 * @property {string} [image] - URL of the image to appear on the right of the card
 */
export class InputElementButtonCard extends InputElementColumn {
    /** @type {HTMLDivElement} */
    elementInput;
    /** @type {HTMLDivElement} */
    elementText;
    /** @type {HTMLHeadingElement} */
    elementTitle;
    /** @type {HTMLParagraphElement} */
    elementDescription;

    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementButtonCardOptions} [card]
     */
    constructor(options, card) {
        super(options);

        this.elementColumn.className = options?.containerClass || "col-md-6 col-12 mb-3";

        this.elementInput = document.createElement("div");
        this.elementInput.className = "card card-interactive h-100";
        this.elementInput.tabIndex = 0;

        const cardBody = document.createElement("div");
        cardBody.className = "card-body d-flex justify-content-between shop-body pb-0";

        this.elementText = document.createElement("div");
        this.elementText.className = "d-flex flex-column w-100 align-items-start";

        this.elementTitle = document.createElement("h5");
        this.elementTitle.className = "card-title mb-1 font-weight-bold fw-bold";
        if (card?.title) {
            this.elementTitle.innerHTML = card.title;
            this.elementTitle.appendChild(VisualComponents.createIcon("bi bi-chevron-right"));
        }
        this.elementText.appendChild(this.elementTitle);

        this.elementDescription = document.createElement("p");
        this.elementDescription.className = "card-text";
        if (card?.description) {
            this.elementDescription.innerHTML = card.description;
        }
        this.elementText.appendChild(this.elementDescription);

        cardBody.appendChild(this.elementText);

        if (card?.image) {
            const cardMedia = document.createElement("div");
            cardMedia.className = "d-flex justify-content-center align-items-center ml-3 ms-3";

            const cardImage = document.createElement("img");
            cardImage.src = card.image;
            cardImage.alt = "";
            cardImage.style.height = "100%";
            cardImage.style.width = "auto";
            cardImage.style.objectFit = "contain";
            cardImage.style.maxWidth = "4rem";
            cardImage.style.maxHeight = "4rem";
            cardMedia.appendChild(cardImage);

            cardBody.appendChild(cardMedia);
        }

        this.elementInput.appendChild(cardBody);
        this.elementColumn.appendChild(this.elementInput);
    }

    /**
     *
     * @param {string} content
     */
    badge(content) {
        const div = document.createElement("div");
        div.className = "d-flex w-100 justify-content-end";

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.innerHTML = content;
        div.appendChild(badge);

        this.elementText.appendChild(div);

        return badge;
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementDate extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "date";
        this.inputGroup.appendChild(this.elementInput);
    }

    /**
     * @param {string} [value=""]
     */
    set(value) {
        this.elementInput.value = value ?? "";
        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    setMinToday() {
        const today = new Date().toISOString().split("T")[0];
        this.elementInput.min = today;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is not set" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementDateTime extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "datetime-local";
        this.inputGroup.appendChild(this.elementInput);
    }

    /**
     * @param {string} [value=""]
     */
    set(value) {
        this.elementInput.value = value ?? "";
        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is not set" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/**
 * @typedef {object} InputElementDateTimeZoneOptions
 * @property {"ISO" | "Millis" | "JSDate"} [timeMode]
 */
/** @implements {IGenericInputElementField} */
export class InputElementDateTimeZone extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     * @param {object} [dateOptions]
     */
    constructor(options, dateOptions) {
        super(options);

        /**
         * @type {"ISO" | "Millis" | "JSDate"}
         */
        this.timeMode = dateOptions?.timeMode ?? "ISO";

        /** @type {Luxon.DateTime} */
        this.internalDate = Luxon.DateTime.now();

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "date";
        this.inputGroup.appendChild(this.elementInput);
        this.elementInput.addEventListener("input", () => {
            this.setFromInputs();
        });

        this.elementInputTime = document.createElement("input");
        this.elementInputTime.classList.add("form-control");
        this.elementInputTime.type = "time";
        this.inputGroup.appendChild(this.elementInputTime);
        this.elementInputTime.addEventListener("input", () => {
            this.setFromInputs();
        });

        this.elementInputGroupAppend = document.createElement("div");
        this.elementInputGroupAppend.classList.add("input-group-append");
        this.inputGroup.appendChild(this.elementInputGroupAppend);

        this.elementSpan = document.createElement("span");
        this.elementSpan.classList.add("input-group-text");
        this.elementSpan.innerText = this.internalDate.zoneName;
        this.elementInputGroupAppend.appendChild(this.elementSpan);
    }

    // get date and time from inputs and put it together
    setFromInputs() {
        let date = this.elementInput.value;
        let time = this.elementInputTime.value;
        let dateTime = Luxon.DateTime.fromISO(`${date}T${time}`);
        this.internalDate = dateTime;
    }

    set(value) {
        switch (this.timeMode) {
            case "ISO": {
                this.internalDate = Luxon.DateTime.fromISO(value);
                break;
            }
            case "Millis": {
                this.internalDate = Luxon.DateTime.fromMillis(value);
                break;
            }
            case "JSDate": {
                this.internalDate = Luxon.DateTime.fromJSDate(value);
                break;
            }
            default: {
                return false;
            }
        }

        if (!this.internalDate.isValid) {
            console.warn("Could not set date");
            return false;
        }

        this.elementInput.value = this.internalDate.toISO()?.split("T")[0] ?? "";
        let jsTime = this.internalDate.toJSDate().toTimeString().split(" ");
        this.elementInputTime.value = jsTime[0] ?? "";
        this.elementSpan.innerText = this.internalDate.zoneName;

        return true;
    }

    get() {
        switch (this.timeMode) {
            case "ISO":
                return this.internalDate.toUTC().toString();
            case "Millis":
                return this.internalDate.toMillis();
            case "JSDate":
                return this.internalDate.toJSDate();
        }
    }

    disable() {
        this.elementInput.disabled = true;
        this.elementInputTime.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
        this.elementInputTime.disabled = false;
    }

    validationClear() { }
}

export class InputElementTime extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "time";
        this.inputGroup.appendChild(this.elementInput);

        this.elementInput.addEventListener("input", () => {
            this.internalTime = this.elementInput.value;
        });

        this.internalTime = "";
    }

    set(value) {
        if (!value.match(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)) {
            console.warn("Invalid time format");
            return false;
        }

        this.internalTime = value;
        this.elementInput.value = value;
        return true;
    }

    get() {
        return this.internalTime;
    }

    /**
     * @param {boolean} value
     */
    disable(value) {
        this.elementInput.disabled = value;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationClear() { }
}

/**
 * @typedef {object} InputElementSelectOptions
 * @property {Array<InputElementSelectOption>} [options]
 * @property {boolean} [multiple]
 */

/** @implements {IGenericInputElementField} */
export class InputElementSelect extends InputElementField {
    /** @type {HTMLSelectElement} */
    elementInput;
    /** @type {HTMLOptionElement} */
    elementOptionDefault;

    /** @type {Array<HTMLOptionElement>} */
    options;

    /**
     * @param {InputElementOptions} [options] - Options for the generic input field
     * @param {InputElementSelectOptions} [select] - Options for the select element specifically
     */
    constructor(options, select) {
        super(options);

        this.elementInput = document.createElement("select");
        this.elementInput.classList.add("form-select", "custom-select");
        this.elementInput.style.borderBottomWidth = "var(--bs-border-width, 1px)";
        this.inputGroup.appendChild(this.elementInput);

        // create default option and select it if required
        this.elementOptionDefault = document.createElement("option");
        this.elementOptionDefault.value = "";
        this.setRequired(options?.required ?? false);
        this.elementInput.appendChild(this.elementOptionDefault);

        this.options = [];
        if (select?.options) {
            select.options.forEach((option) => {
                this.appendOption(option);
            });
        }
    }

    set(value) {
        this.elementInput.value = value;

        // trigger set event
        let event = new Event("change", { bubbles: true });
        this.elementInput.dispatchEvent(event);

        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        let myValue = this.get();

        if (this.required && typeof myValue === "string" && myValue.length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is not set" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }

    /**
     * Toggle the required field and update the label and validation,
     * @param {boolean} required
     */
    setRequired(required) {
        this.required = required;

        // Update default option text and attributes
        if (this.required) {
            if (this.elementOptionDefault) {
                this.elementOptionDefault.text = "Please select...";
                this.elementOptionDefault.setAttribute("disabled", "");
                this.elementOptionDefault.setAttribute("selected", "");
                this.elementOptionDefault.setAttribute("hidden", "");
                // Add asterisk to label
                this.setLabelAsterisk(true);
            }
        } else {
            if (this.elementOptionDefault) {
                this.elementOptionDefault.text = this.elementOptionDefault.text;
                this.elementOptionDefault.removeAttribute("disabled");
                this.elementOptionDefault.removeAttribute("selected");
                this.elementOptionDefault.removeAttribute("hidden");
            }
            // remove asterisk from label
            this.setLabelAsterisk(false);
        }
    }

    optionsClear() {
        for (const option of this.options) {
            option.remove();
        }
        this.options = [];
        if (this.elementOptionDefault) {
            this.set(this.elementOptionDefault.value);
        }
    }

    /** @param {InputElementSelectOption[]} options */
    optionsPush(options) {
        for (const option of options) {
            this.appendOption(option);
        }
    }

    /** @param {InputElementSelectOption} option */
    appendOption(option) {
        let elementOption = document.createElement("option");
        elementOption.value = option.value;
        elementOption.text = option.text;
        if (option.hidden) {
            elementOption.hidden = true;
        }

        if (option?.group !== undefined) {
            let optionGroup = /** @type {HTMLOptGroupElement} */ (this.elementInput.querySelector(`optgroup[label="${option.group}"]`));
            if (!optionGroup) {
                optionGroup = document.createElement("optgroup");
                optionGroup.label = option.group ?? "";
                this.elementInput.appendChild(optionGroup);
            }
            optionGroup.appendChild(elementOption);
        } else {
            this.elementInput.appendChild(elementOption);
        }

        this.options.push(elementOption);
    }
}

/**
 * @typedef {object} InputElementSearchableSelectOptions
 * @property {boolean} [searchable]
 * @property {string} [searchPlaceholder]
 * @property {boolean} [autoSelect]
 * @property {number} [autoSelectThreshold]
 * @property {number} [debounceDelay]
 * @property {boolean} [strictMatching]
 * @property {boolean} [preferExactPath]
 * @property {boolean} [showNoResultsMessage]
 * @property {string} [noResultsMessage]
 * @property {object} [fuseOptions]
 */

/** @implements {IGenericInputElementField} */
export class InputElementSearchableSelect extends InputElementSelect {
    /**
     * @param {InputElementOptions} [options] - Options for the generic input field
     * @param {InputElementSelectOptions & InputElementSearchableSelectOptions} [select] - Options for the select element
     */
    constructor(options, select = {}) {
        super(options, select);

        this.searchable = select?.searchable ?? true;
        this.originalOptions = [];
        this.autoSelectEnabled = select?.autoSelect ?? true;
        this.debounceDelay = select?.debounceDelay ?? 300;
        this.debounceTimer = null;
        this.lastSearchTerm = "";

        // Setup Fuse instance with default options
        this.fuseOptions = select?.fuseOptions ?? {
            includeScore: true,
            threshold: 0.3,
            keys: ["text"],
            ignoreLocation: true,
        };
        this.fuse = new Fuse([], this.fuseOptions);

        // Create search container
        this.searchContainer = document.createElement("div");
        this.searchContainer.className = "input-group mb-2";

        // Create search input
        this.searchInput = document.createElement("input");
        this.searchInput.className = "form-control";
        this.searchInput.type = "text";
        this.searchInput.placeholder = select?.searchPlaceholder ?? "Search...";
        this.searchInput.style.borderRadius = "0.25rem 0 0 0.25rem";

        // Search icon button
        this.searchIcon = document.createElement("div");
        this.searchIcon.className = "input-group-append";
        this.searchIcon.innerHTML = `<span class="input-group-text" style="height: 100%; transition: all 0.2s ease;"><i class="bi bi-search d-flex align-items-center"></i></span>`;
        this.searchIconElement = this.searchIcon.querySelector("span");

        // Assemble search bar
        this.searchContainer.appendChild(this.searchInput);
        this.searchContainer.appendChild(this.searchIcon);

        // Insert all elements
        if (this.searchable) {
            this.inputGroup.parentNode?.insertBefore(this.searchContainer, this.inputGroup);
            this.elementInput.style.display = "block";
        }

        // Add event listeners
        this.searchInput.addEventListener("input", () => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = setTimeout(() => {
                this.filterOptions();
            }, this.debounceDelay);
        });

        // Toggle button
        this.toggleButton = document.createElement("button");
        this.toggleButton.className = "btn btn-outline-secondary";
        this.toggleButton.type = "button";
        this.toggleButton.innerHTML = `<i class="bi bi-funnel"></i>`;
        this.toggleButton.title = "Toggle search/dropdown mode";
        this.toggleButton.addEventListener("click", () => this.toggleSearchMode());

        this.appendElement(this.toggleButton);

        // Initially hide search if not searchable
        if (!this.searchable) {
            this.searchContainer.style.display = "none";
            this.inputGroup.style.display = "flex";
        }
    }

    /**
     * Toggle between search and dropdown modes
     */
    toggleSearchMode() {
        this.searchable = !this.searchable;
        this.searchContainer.style.display = this.searchable ? "flex" : "none";

        if (!this.searchable) {
            this.searchInput.value = "";
            this.lastSearchTerm = "";
            this.restoreAllOptions();
            this.updateSearchIconStatus(false);
        } else {
            this.fuse = new Fuse([], this.fuseOptions);
            this.searchInput.focus();
        }

        this.toggleButton.innerHTML = this.searchable ? `<i class="bi bi-list"></i>` : `<i class="bi bi-funnel"></i>`;
    }

    /**
     * Update the search icon to indicate match status
     * @param {boolean} hasMatches - Whether matches were found
     */
    updateSearchIconStatus(hasMatches) {
        if (this.searchIconElement) {
            this.searchIconElement.classList.remove("bg-success", "bg-danger", "text-white");
            this.searchIconElement.removeAttribute("title");

            // Set appropriate classes based on match status
            if (this.searchInput.value) {
                if (hasMatches) {
                    this.searchIconElement.classList.add("bg-success", "text-white");
                } else {
                    this.searchIconElement.classList.add("bg-danger", "text-white");
                    this.searchIconElement.title = "No matching session types found";
                }
            } else {
                // Reset to default state when search is empty
                this.searchIconElement.style.opacity = "1";
                this.searchIconElement.removeAttribute("title");
            }
        }
    }

    /**
     * Filter options using Fuse.js
     */
    filterOptions() {
        const searchTerm = this.searchInput.value.toLowerCase();

        // Skip filtering if search term hasn't changed
        if (searchTerm === this.lastSearchTerm) {
            return;
        }

        // Update last search term
        this.lastSearchTerm = searchTerm;

        // Skip filtering if search is empty
        if (searchTerm === "") {
            this.restoreAllOptions();
            this.updateSearchIconStatus(false);
            return;
        }

        // Always rebuild the searchable data collection to ensure it's up to date
        const optionsData = [];
        for (let i = 0; i < this.elementInput.options.length; i++) {
            const option = this.elementInput.options[i];
            if (option.value === "") continue;

            optionsData.push({
                index: i,
                value: option.value,
                text: option.text,
            });
        }
        this.fuse.setCollection(optionsData);

        // Search with Fuse - this will return results sorted by relevance
        const results = this.fuse.search(searchTerm);
        const visibleCount = results.length;

        // Reset display of all options
        for (let i = 0; i < this.elementInput.options.length; i++) {
            const option = this.elementInput.options[i];
            if (option.value === "") continue;
            option.style.display = "none";
        }

        if (results.length > 0) {
            // Make matched options visible
            results.forEach((result, index) => {
                const option = this.elementInput.options[result.item.index];
                option.style.display = "";

                if (index === 0 && this.autoSelectEnabled) {
                    this.set(option.value);
                }
            });
        }

        this.updateSearchIconStatus(visibleCount > 0);

        if (visibleCount === 0) {
            this.restoreAllOptions();
        }
    }

    /**
     * Count the number of visible options (excluding the default empty option)
     * @returns {number} The count of visible options
     */
    countVisibleOptions() {
        let count = 0;
        for (let i = 0; i < this.elementInput.options.length; i++) {
            const option = this.elementInput.options[i];
            if (option.value === "") continue; // Skip the default empty option
            if (option.style.display !== "none") {
                count++;
            }
        }
        return count;
    }

    /**
     * Restore all options to visible
     */
    restoreAllOptions() {
        for (let i = 0; i < this.elementInput.options.length; i++) {
            this.elementInput.options[i].style.display = "";
        }

        // Reset search icon
        this.updateSearchIconStatus(false);
    }

    /**
     * Override set to update visual elements
     * @param {string} value The value to set
     * @returns {boolean} Success
     */
    set(value) {
        const result = super.set(value);

        // Trigger a custom event
        const event = new CustomEvent("searchableSelectChange", {
            detail: {
                value,
                text: this.getSelectedText(),
            },
        });
        this.elementInput.dispatchEvent(event);

        return result;
    }

    /**
     * Get the text of the selected option
     * @returns {string} The selected option's text
     */
    getSelectedText() {
        const selectedIndex = this.elementInput.selectedIndex;
        if (selectedIndex >= 0) {
            return this.elementInput.options[selectedIndex].text;
        }
        return "";
    }

    /**
     * Extend optionsPush to save original options for filtering
     * @param {Array<InputElementSelectOption>} options
     */
    optionsPush(options) {
        super.optionsPush(options);
        this.originalOptions = [...this.originalOptions, ...options];

        // Reset the Fuse instance to rebuild index with new options
        this.fuse = new Fuse([], this.fuseOptions);
    }

    /**
     * Clear options and reset original options array
     */
    optionsClear() {
        super.optionsClear();
        this.originalOptions = [];

        // Reset the Fuse instance
        this.fuse = new Fuse([], this.fuseOptions);
    }

    /**
     * Override disable to also disable search
     */
    disable() {
        super.disable();
        this.searchInput.disabled = true;
        this.toggleButton.disabled = true;
    }

    /**
     * Override enable to also enable search
     */
    enable() {
        super.enable();
        this.searchInput.disabled = false;
        this.toggleButton.disabled = false;
    }

    /**
     * Find and select an option by text instead of value
     * @param {string} text - Text to search for
     * @returns {boolean} - True if found and selected
     */
    selectByText(text) {
        if (!text) return false;

        const textLower = text.toLowerCase();

        for (let i = 0; i < this.elementInput.options.length; i++) {
            const option = this.elementInput.options[i];
            if (option.text.toLowerCase() === textLower) {
                this.set(option.value);
                return true;
            }
        }

        // Try partial match if exact match fails
        for (let i = 0; i < this.elementInput.options.length; i++) {
            const option = this.elementInput.options[i];
            if (option.text.toLowerCase().includes(textLower)) {
                this.set(option.value);
                return true;
            }
        }

        return false;
    }

    /**
     * Reset the search input and restore all options
     */
    resetSearch() {
        // Clear search input
        this.searchInput.value = "";
        this.lastSearchTerm = "";

        // Reset filtering
        this.restoreAllOptions();

        // Reset search icon
        this.updateSearchIconStatus(false);
    }
}

export class InputElementSelectCapsule extends InputElementSelect {
    /**
     * @param {InputElementOptions} [options] - Options for the generic input field
     * @param {InputElementSelectOptions} [select] - Options for the select element specifically
     */
    constructor(options, select) {
        super(options, select);

        this.elementInput.className = "badge rounded-pill text-smaller";
        this.elementInput.style.width = "auto";
        this.elementInput.style.cursor = "pointer";
        this.elementInput.style.border = "none";
        this.elementInput.style.outline = "none";
        this.elementInput.style.boxShadow = "none";
        this.elementInput.style.appearance = "none";
    }
}

export class InputElementSelectMultiple extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementSelectOptions} [select]
     */
    constructor(options, select) {
        super(options);

        this.elementInput = document.createElement("select");
        this.elementInput.classList.add("form-select", "custom-select");
        this.elementInput.multiple = select?.multiple ?? false;
        this.inputGroup.appendChild(this.elementInput);

        this.optionAll = document.createElement("option");
        this.optionAll.value = "";
        this.optionAll.text = "Select All";
        this.elementInput.appendChild(this.optionAll);

        this.elementButtonMultiple = document.createElement("button");
        this.elementButtonMultiple.classList.add("btn", "btn-outline-secondary");
        this.elementButtonMultiple.type = "button";
        this.elementButtonMultiple.addEventListener("click", () => {
            this.multipleToggle();
        });
        this.elementButtonMultiple.style.borderRadius = "0 var(--bs-border-radius) var(--bs-border-radius) 0";

        this.appendElement(this.elementButtonMultiple);

        if (Array.isArray(select?.options)) {
            for (const option of select.options) {
                let elementOption = document.createElement("option");
                elementOption.value = option.value;
                elementOption.text = option.text;
                this.elementInput.appendChild(elementOption);
            }
        }

        if (select?.multiple !== undefined) {
            this.multipleToggle(select.multiple);
        } else {
            this.buttonMultipleUpdate();
        }
    }

    set(value) {
        if (Array.isArray(value)) {
            this.multipleToggle(value.length > 1);
            for (const option of this.elementInput.options) {
                option.selected = value.includes(option.value);
            }
        } else {
            this.multipleToggle(false);
            this.elementInput.value = value;
        }
        return true;
    }

    /** @returns {Array<string>} */
    get() {
        let selected = [];
        for (const option of this.elementInput.options) {
            if (option.selected || this.optionAll.selected) {
                if (option.value !== "") {
                    selected.push(option.value);
                }
            }
        }
        return selected;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        let myValue = this.get();

        if (this.required && myValue.length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is not set" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }

    /**
     * Toggle the required field and update the label and validation,
     * @param {boolean} required
     */
    setRequired(required) {
        this.required = required;

        // to be implemented

        this.validationFunction();
    }

    optionsClear() {
        this.elementInput.innerHTML = "";
        this.elementInput.appendChild(this.optionAll);
    }

    optionsPush(options) {
        for (const option of options) {
            let elementOption = document.createElement("option");
            elementOption.value = option.value;
            elementOption.text = option.text;
            this.elementInput.appendChild(elementOption);
        }
    }

    /**
     * @param {boolean} [multiple] - If true, set to multiple, if false, set to single, if undefined, toggle
     */
    multipleToggle(multiple) {
        const selected = this.get();

        this.elementInput.multiple = multiple ?? !this.elementInput.multiple;
        if (this.elementInput.multiple) {
            if (this.optionAll.selected) {
                [...this.elementInput.options].forEach((element) => {
                    element.selected = true;
                });
            }
        } else {
            // trigger change event if switching back to single would change the input
            if (selected.length !== 1) {
                let event = new Event("change", { bubbles: true });
                this.elementInput.dispatchEvent(event);
            }
        }

        this.buttonMultipleUpdate();
    }

    buttonMultipleUpdate() {
        this.elementButtonMultiple.innerHTML = this.elementInput.multiple ? `<i class="bi bi-list-check"></i>` : `<i class="bi bi-1-circle"></i>`;
        this.optionAll.hidden = this.elementInput.multiple;
    }
}

/**
 * @typedef {object} InputElementDataListOptions
 * @property {Array<InputElementDataListOption>} [options]
 * @property {string} [placeholder]
 */

/**
 * Searchable list of selectable checkboxes, like a DataList input element combined with a select multiple
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist}
 */
export class InputElementDataList extends InputElementField {
    /** @type {Array<InputElementDataListItem>} */
    items;
    /** @type {Array<string>} */
    value;
    /** @type {Fuse} */
    fuse;

    /** @type {HTMLDivElement} */
    elementPreview;
    /** @type {HTMLInputElement} */
    elementSearch;
    /** @type {HTMLButtonElement} */
    elementSearchIcon;
    /** @type {HTMLButtonElement} */
    elementSearchClear;
    /** @type {HTMLDivElement} */
    elementInput;

    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementDataListOptions} [dataList]
     */
    constructor(options, dataList) {
        super(options);

        this.elementPreview = document.createElement("div");
        this.elementPreview.className = "list-group list-group-flush border w-100";
        this.elementPreview.style.maxHeight = "20rem";
        this.elementPreview.style.overflowY = "auto";
        this.elementColumn.appendChild(this.elementPreview);

        const btnEdit = document.createElement("div");
        btnEdit.className = "list-group-item list-group-item-flush list-group-item-action text-center";
        btnEdit.style.position = "sticky";
        btnEdit.style.top = "0";
        btnEdit.style.cursor = "pointer";
        {
            const iconEdit = document.createElement("i");
            iconEdit.className = "bi bi-pencil-fill mr-2 me-2";
            btnEdit.appendChild(iconEdit);
        }
        {
            const textEdit = document.createElement("span");
            textEdit.innerText = "Click to Edit";
            btnEdit.appendChild(textEdit);
        }
        btnEdit.addEventListener("click", () => {
            this.elementPreview.remove();
            this.inputGroup.classList.remove("d-none");
            this.elementInput.classList.remove("d-none");
        });
        this.elementPreview.appendChild(btnEdit);

        this.inputGroup.classList.add("mb-2", "d-none");

        this.elementSearch = document.createElement("input");
        this.elementSearch.className = "form-control";
        this.elementSearch.type = "text";
        this.elementSearch.placeholder = dataList?.placeholder ?? "Start typing to search";
        this.elementSearch.addEventListener("input", () => {
            this.search();
        });
        this.inputGroup.appendChild(this.elementSearch);

        this.elementSearchIcon = document.createElement("button");
        this.elementSearchIcon.className = "btn btn-outline-secondary";
        this.elementSearchIcon.type = "button";
        this.elementSearchIcon.disabled = true;
        this.elementSearchIcon.innerHTML = `<i class="bi bi-search"></i>`;
        this.inputGroup.appendChild(this.elementSearchIcon);

        this.elementSearchClear = document.createElement("button");
        this.elementSearchClear.className = "btn btn-outline-danger";
        this.elementSearchClear.type = "button";
        this.elementSearchClear.innerHTML = `<i class="bi bi-x"></i>`;
        this.elementSearchClear.addEventListener("click", () => {
            this.elementSearch.value = "";
            this.search();
        });
        this.inputGroup.appendChild(this.elementSearchClear);

        this.elementInput = document.createElement("div");
        this.elementInput.className = "list-group list-group-flush border w-100 d-none";
        this.elementInput.style.maxHeight = "20rem";
        this.elementInput.style.overflowY = "auto";
        this.elementInput.style.cursor = "pointer";
        this.elementInput.addEventListener("click", (event) => {
            if (this.elementInput.classList.contains("disabled")) return;
            const itemClicked = /** @type {HTMLDivElement} */ (event.target);
            if (itemClicked && itemClicked.classList.contains("list-group-item") && itemClicked.dataset.value !== undefined) {
                const value = itemClicked.dataset.value;
                const dataListItem = this.items.find((item) => item.get() === value);
                if (dataListItem) {
                    if (!this.value.includes(value)) {
                        this.value.push(value);
                        dataListItem.select();
                    } else {
                        this.value = this.value.filter((v) => v !== value);
                        dataListItem.deselect();
                    }
                    this.elementInput.dispatchEvent(new Event("change"));
                }
            }
        });
        this.elementColumn.appendChild(this.elementInput);

        this.items = [];
        if (Array.isArray(dataList?.options)) {
            for (const option of dataList.options) {
                const dataListItem = new InputElementDataListItem(option);
                this.elementInput.appendChild(dataListItem.elementContainer);
                this.items.push(dataListItem);

                const dataListItemPreview = new InputElementDataListItem({ ...option, preview: true });
                this.elementPreview.appendChild(dataListItemPreview.elementContainer);
            }
        }
        this.value = [];
        this.fuse = new Fuse(
            dataList?.options?.map((option) => {
                return {
                    value: option.value,
                    text: option.text,
                    description: option.description,
                };
            }) ?? [],
            {
                keys: ["text"],
            }
        );
    }

    /**
     * @param {Array<string>} value
     */
    set(value) {
        if (Array.isArray(value)) {
            this.value = [];
            for (const item of this.items) {
                if (value.includes(item.get())) {
                    item.select();
                    this.value.push(item.get());
                } else {
                    item.deselect();
                }
            }
            const dataListItemPreviews = /** @type {Array<HTMLDivElement>} */ ([...this.elementPreview.children]);
            for (const dataListItemPreview of dataListItemPreviews) {
                if (dataListItemPreview.dataset.value !== undefined) {
                    dataListItemPreview.classList.toggle("d-none", !this.value.includes(dataListItemPreview.dataset.value));
                }
            }
        }
        return true;
    }

    /** @returns {Array<string>} */
    get() {
        return this.value;
    }

    disable() {
        this.elementInput.classList.add("disabled");
        this.elementInput.style.cursor = "default";
    }

    enable() {
        this.elementInput.classList.remove("disabled");
        this.elementInput.style.cursor = "pointer";
    }

    validationFunction() {
        this.validationClear();

        let myValue = this.get();

        if (this.required && myValue.length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Required value is not set" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }

    /**
     * Toggle the required field and update the label and validation,
     * @param {boolean} required
     */
    setRequired(required) {
        this.required = required;

        // to be implemented

        this.validationFunction();
    }

    optionsClear() {
        this.options = [];
        this.value = [];
        this.elementInput.innerHTML = "";
        this.elementPreview.innerHTML = "";
        this.fuse.setCollection([]);
    }

    /** @param {Array<InputElementDataListOption>} options */
    optionsPush(options) {
        for (const option of options) {
            const dataListItem = new InputElementDataListItem(option);
            this.elementInput.appendChild(dataListItem.elementContainer);
            this.items.push(dataListItem);
            this.fuse.add({
                value: option.value,
                text: option.text,
                description: option.description,
            });

            const dataListItemPreview = new InputElementDataListItem({ ...option, preview: true });
            this.elementPreview.appendChild(dataListItemPreview.elementContainer);
        }
    }

    search() {
        let results = [];
        const keyword = this.elementSearch.value.trim();
        if (keyword.length >= 2) {
            results = this.fuse.search(keyword).map((result) => result.item.value);
        } else {
            results = this.items.map((item) => item.get());
        }

        for (const item of this.items) {
            if (results.includes(item.get())) {
                item.show();
            } else {
                item.hide();
            }
        }
    }

    preview() {
        this.elementPreview.innerHTML = "";
        for (const item of this.items) {
            if (this.value.includes(item.get())) {
            }
        }
    }
}

class InputElementDataListItem {
    /** @type {string} */
    #text;
    /** @type {string} */
    #value;
    /** @type {string} */
    #description;
    /** @type {boolean} */
    selected;

    /** @type {HTMLDivElement} */
    elementContainer;
    /** @type {HTMLSpanElement | undefined} */
    elementIcon;
    /** @type {HTMLSpanElement} */
    elementText;
    /** @type {HTMLSpanElement} */
    elementDescription;

    /**
     * @param {InputElementDataListOption} options
     */
    constructor(options) {
        this.#text = options.text;
        this.#value = options.value;
        this.#description = options.description;

        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "list-group-item list-group-item-flush";
        if (options?.preview === true) {
            //this.elementContainer.classList.add("active");
        } else {
            this.elementContainer.classList.add("list-group-item-action");
        }
        this.elementContainer.dataset.value = this.#value;

        const divFlex = document.createElement("div");
        divFlex.className = "d-flex justify-content-start align-items-center pe-none";

        if (options?.preview !== true) {
            this.elementIcon = document.createElement("i");
            this.elementIcon.className = "bi bi-square mr-3 me-3";
            divFlex.appendChild(this.elementIcon);
        }

        const divText = document.createElement("div");
        divText.className = "d-flex flex-column pe-none";

        this.elementText = document.createElement("span");
        this.elementText.innerHTML = this.#text;
        divText.appendChild(this.elementText);

        if (this.#description) {
            this.elementDescription = document.createElement("span");
            this.elementDescription.className = "small";
            this.elementDescription.style.opacity = "80%";
            this.elementDescription.innerHTML = this.#description;
            divText.appendChild(this.elementDescription);
        }

        divFlex.appendChild(divText);

        this.elementContainer.appendChild(divFlex);
    }

    /** @param {string} value */
    set(value) {
        this.#value = value;
    }

    get() {
        return this.#value;
    }

    select() {
        if (this.selected) return;
        this.selected = true;
        this.elementContainer.classList.add("active");
        if (this.elementIcon) {
            this.elementIcon.classList.remove("bi-square");
            this.elementIcon.classList.add("bi-check-square-fill");
        }
    }

    deselect() {
        if (!this.selected) return;
        this.selected = false;
        this.elementContainer.classList.remove("active");
        if (this.elementIcon) {
            this.elementIcon.classList.remove("bi-check-square-fill");
            this.elementIcon.classList.add("bi-square");
        }
    }

    show() {
        this.elementContainer.classList.remove("d-none");
    }

    hide() {
        this.elementContainer.classList.add("d-none");
    }
}

const sessionTypeCache = new Map();

async function getSessionTypeWithCache(typeId) {
    if (sessionTypeCache.has(typeId)) {
        return sessionTypeCache.get(typeId);
    }

    try {
        const response = await fetch(`/session/type/${typeId}`);
        if (!response.ok) throw new Error("Failed to fetch session type");
        const data = await response.json();
        sessionTypeCache.set(typeId, data);
        return data;
    } catch (error) {
        console.error("Error fetching session type:", error);
        return null;
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementSessionTypes extends InputElementField {
    constructor(options = {}, config = {}) {
        const mergedConfig = {
            showDescriptions: true,
            maxSelections: null,
            label: "Select Services",
            ...config,
        };

        super({
            ...options,
            label: mergedConfig.label,
        });

        this.config = mergedConfig;

        // Mapping of frontend values to backend sessionTypeIds
        this.sessionTypeMapping = {
            "test-prep-standard": ["67d83b1bd1acc24b94c920d1"], // Test Prep
            "test-prep-hs": ["67d308612cb53267a80f45c7"], // High School Entrance
            "academic-tutoring": ["61815eb4bb20853cb7f1c227"], // Academic
            "college-admissions": ["61815ebfbb20853cb7f1c228"], // College Admissions
            "test-prep-grad": ["67d8407bd1acc24b94c920d6"], // Graduate tests
            sat: ["618162426f340f3ec89e3bc5"], // SAT
            act: ["618162486f340f3ec89e3bc6"], // ACT
            mcvsd: ["618160296f340f3ec89e3bc4"], // MCVSD
            other: ["67d30b412cb53267a80f45cc"], // Other
        };

        this.elementInput = document.createElement("div");
        this.elementInput.className = "form-select form-select-lg";
        this.elementInput.style.borderRadius = "var(--bs-border-radius-lg)";
        this.elementInput.style.userSelect = "none";
        this.elementInput.setAttribute("aria-label", "Select services");
        this.elementInput.tabIndex = 0;
        this.elementInput.textContent = "Select a Service";
        this.inputGroup.appendChild(this.elementInput);

        this.dropdownMenu = document.createElement("div");
        this.dropdownMenu.className = "dropdown-menu sessionTypeSelector w-100";
        this.dropdownMenu.style.display = "none";
        this.inputGroup.appendChild(this.dropdownMenu);

        this.hintElement = document.createElement("small");
        this.hintElement.className = "form-text small text-secondary mt-0 mb-1 d-block";
        this.hintElement.innerHTML = "You can select multiple services";
        this.elementColumn.appendChild(this.hintElement);

        this.selectedContainer = document.createElement("div");
        this.selectedContainer.className = "d-flex flex-wrap gap-2 mt-2";
        this.selectedContainer.setAttribute("aria-live", "polite");
        this.elementColumn.appendChild(this.selectedContainer);

        this.notesInput = document.createElement("input");
        this.notesInput.type = "text";
        this.notesInput.className = "form-control form-control-lg mt-2 d-none";
        this.notesInput.placeholder = "Please specify other services...";
        this.notesInput.addEventListener("input", (event) => {
            const otherType = this.selectedTypes.find((t) => t.value === "other");
            if (otherType && event.target instanceof HTMLInputElement) {
                otherType.notes = event.target.value.trim();
                this.elementInput.dispatchEvent(new Event("change", { bubbles: true }));
            }
            this.validationFunction();
        });
        this.elementColumn.appendChild(this.notesInput);

        this.elementInput.addEventListener("click", () => this.toggleDropdown());
        document.addEventListener("click", (event) => this.closeDropdownOutside(event));

        this.selectedTypes = [];

        const standardOptions = [
            { text: "Test Prep (SAT/ACT)", value: "test-prep-standard" },
            { text: "High School Entrance (MCVSD, SSAT, ISEE, HSPT)", value: "test-prep-hs" },
            { text: "Academic Tutoring", value: "academic-tutoring" },
            { text: "College Admissions/Essays", value: "college-admissions" },
            { text: "Test Prep Graduate Level (MCAT, LSAT, GMAT, GRE, DAT)", value: "test-prep-grad" },
            { text: "Other", value: "other", description: "Additional notes can be added to your account" },
        ];

        this.fetchSessionTypes(standardOptions);
    }

    async fetchSessionTypes(standardOptions) {
        try {
            const response = await fetch("/session/type/database");
            if (!response.ok) throw new Error("Failed to fetch session types");
            const sessionTypes = await response.json();

            // Enhance standard options with session type data
            const enhancedOptions = standardOptions.map((option) => {
                const matchingSessionType = sessionTypes.find((st) => this.sessionTypeMapping[option.value].includes(st._id.toString()));

                return {
                    ...option,
                    icon: matchingSessionType?.icon || "",
                    description: matchingSessionType?.description || option.description,
                };
            });

            this.populateOptions(enhancedOptions);
        } catch (error) {
            console.error("Error fetching session types:", error);
            // Fallback to standard options without icons
            this.populateOptions(standardOptions);
        }
    }

    toggleDropdown() {
        this.dropdownMenu.style.display = this.dropdownMenu.style.display === "none" ? "block" : "none";
    }

    closeDropdownOutside(event) {
        if (!this.elementInput.contains(event.target) && !this.dropdownMenu.contains(event.target)) {
            this.dropdownMenu.style.display = "none";
        }
    }

    populateOptions(options) {
        this.options = options;
        this.dropdownMenu.innerHTML = "";

        options.forEach((option) => {
            const item = document.createElement("div");
            item.className = "dropdown-item d-flex align-items-center";
            item.dataset.value = option.value;

            // Add icon to dropdown item
            if (option.icon) {
                const icon = document.createElement("img");
                icon.src = option.icon;
                icon.style.width = "20px";
                icon.style.height = "20px";
                icon.style.marginRight = "10px";
                icon.style.objectFit = "contain";
                item.appendChild(icon);
            }

            const textSpan = document.createElement("span");
            textSpan.textContent = option.text;
            item.appendChild(textSpan);

            if (this.config.showDescriptions && option.description) {
                item.title = option.description;
            }

            item.addEventListener("click", (e) => {
                e.preventDefault();
                if (!item.classList.contains("disabled")) {
                    this.addSelectedType(option);
                }
            });

            this.dropdownMenu.appendChild(item);
        });
    }

    addSelectedType(option) {
        if (this.selectedTypes.some((type) => type.value === option.value)) return;

        if (this.config.maxSelections && this.selectedTypes.length >= this.config.maxSelections) {
            return;
        }

        const typeBadge = document.createElement("span");
        typeBadge.className = "badge bg-primary d-inline-flex align-items-center user-select-none gap-2";

        // Add icon to the badge
        if (option.icon) {
            const icon = document.createElement("img");
            icon.src = option.icon;
            icon.style.width = "20px";
            icon.style.height = "20px";
            icon.style.marginRight = "5px";
            icon.style.objectFit = "contain";
            typeBadge.appendChild(icon);
        }

        const textSpan = document.createElement("span");
        textSpan.textContent = option.text;
        typeBadge.appendChild(textSpan);

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn-close btn-close-white";
        removeBtn.setAttribute("aria-label", "Remove");
        removeBtn.addEventListener("click", () => {
            this.removeSelectedType(option.value, typeBadge);
        });
        typeBadge.appendChild(removeBtn);

        this.selectedContainer.appendChild(typeBadge);

        this.selectedTypes.push({
            value: option.value,
            text: option.text,
            icon: option.icon,
            element: typeBadge,
            notes: option.value === "other" ? "" : undefined,
        });

        // Show notes input if "Other" is selected
        if (option.value === "other") {
            this.notesInput.classList.remove("d-none");
            const otherType = this.selectedTypes.find((t) => t.value === "other");
            if (otherType) {
                otherType.notes = this.notesInput.value;
            }
        }

        // Disable the selected option in the dropdown
        const dropdownItem = /** @type {HTMLDivElement} */ (this.dropdownMenu.querySelector(`[data-value="${option.value}"]`));
        if (dropdownItem) {
            dropdownItem.classList.add("disabled");
            dropdownItem.style.opacity = "0.5";
            dropdownItem.style.pointerEvents = "none";
        }

        this.dropdownMenu.style.display = "none";
        this.elementInput.textContent = "Select a Service";
        this.elementInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    removeSelectedType(typeId, badgeElement) {
        this.selectedContainer.removeChild(badgeElement);
        this.selectedTypes = this.selectedTypes.filter((type) => type.value !== typeId);

        // Hide notes input if "Other" is removed
        if (typeId === "other") {
            this.notesInput.classList.add("d-none");
            this.notesInput.value = "";
        }

        // Re-enable the option in the dropdown
        const dropdownItem = /** @type {HTMLDivElement} */ (this.dropdownMenu.querySelector(`[data-value="${typeId}"]`));
        if (dropdownItem) {
            dropdownItem.classList.remove("disabled");
            dropdownItem.style.opacity = "";
            dropdownItem.style.pointerEvents = "";
        }

        this.elementInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    get() {
        let sessionTypes = [];
        this.selectedTypes.forEach((type) => {
            const ids = this.sessionTypeMapping[type.value] || [];
            ids.forEach((id) => {
                let sessionType = {
                    sessionType: id,
                    date: Date.now(),
                    source: "Registration",
                    staff: undefined,
                };

                // If it's an "Other" type, add the notes as a description
                if (type.value === "other" && type.notes) {
                    sessionType.description = type.notes.trim();
                }

                sessionTypes.push(sessionType);
            });
        });
        return sessionTypes;
    }

    set(typeIds) {
        this.selectedContainer.innerHTML = "";
        this.selectedTypes = [];
        this.notesInput.classList.add("d-none");
        this.notesInput.value = "";

        // Reset dropdown items
        this.dropdownMenu.querySelectorAll(".dropdown-item").forEach((item) => {
            item.classList.remove("disabled");
            /** @type {HTMLDivElement} */ (item).style.opacity = "";
            /** @type {HTMLDivElement} */ (item).style.pointerEvents = "";
        });

        // Map backend IDs to frontend values
        const selectedValues = new Set();
        typeIds.forEach((id) => {
            for (const [key, values] of Object.entries(this.sessionTypeMapping)) {
                if (values.includes(id)) {
                    selectedValues.add(key);
                }
            }
        });

        // Add selected types
        selectedValues.forEach((value) => {
            const option = this.options.find((opt) => opt.value === value);
            if (option) {
                this.addSelectedType(option);
            }
        });

        return true;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.selectedTypes.length === 0) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Please select at least one service" };
        }

        // Check if "Other" is selected but no notes provided
        const otherType = this.selectedTypes.find((type) => type.value === "other");
        if (otherType && (!this.notesInput.value || this.notesInput.value.trim() === "")) {
            this.notesInput.classList.add("is-invalid");
            return { valid: false, reason: "Please specify other services" };
        }

        this.elementInput.classList.add("is-valid");
        return { valid: true, reason: "" };
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        if (this.elementMessage) {
            this.elementMessage.classList.add("d-none");
        }
    }

    setRequired(required) {
        this.required = required;
        this.validationFunction();
    }

    disable() {
        this.elementInput.classList.add("disabled");
        this.elementInput.tabIndex = -1;
    }

    enable() {
        this.elementInput.classList.remove("disabled");
        this.elementInput.tabIndex = 0;
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementQuantity extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     * @param {{min?: number, max?: number, value?: number}} [quantity]
     */
    constructor(options, quantity = {}) {
        // Override options to remove label if passed
        const modifiedOptions = {
            ...options,
            label: options?.label ?? "",
        };

        super(modifiedOptions);

        // Remove label-related operations
        if (this.elementLabel) {
            this.elementLabel.remove();
        }

        // Create input group directly
        this.inputGroup = document.createElement("div");
        this.inputGroup.classList.add("input-group");
        this.elementColumn.appendChild(this.inputGroup);

        // Create input group elements
        this.elementInput = document.createElement("div");
        this.elementInput.className = "input-group w-100";

        // Create decrease button
        const decrementBtn = document.createElement("button");
        decrementBtn.className = "btn btn-outline-secondary";
        decrementBtn.style.borderRadius = "1rem 0 0 1rem";
        decrementBtn.type = "button";
        decrementBtn.textContent = "-";

        // Create number input
        this.quantityInput = document.createElement("input");
        this.quantityInput.type = "number";
        this.quantityInput.className = "form-control text-center";
        this.quantityInput.value = (quantity.value || 1).toString();
        this.quantityInput.min = (quantity.min || 1).toString();
        this.quantityInput.max = (quantity.max || 99).toString();
        this.quantityInput.style.borderLeft = "none";
        this.quantityInput.style.borderRight = "none";
        this.quantityInput.style.appearance = "textfield";
        this.quantityInput.style.webkitAppearance = "textfield";

        // Create increase button
        const incrementBtn = document.createElement("button");
        incrementBtn.className = "btn btn-outline-secondary";
        incrementBtn.style.borderRadius = "0 1rem 1rem 0";
        incrementBtn.type = "button";
        incrementBtn.textContent = "+";

        // Prevent recursive triggering
        this._isUpdating = false;

        // Add event listeners
        decrementBtn.onclick = () => {
            const currentValue = parseInt(this.quantityInput.value);
            if (currentValue > (quantity.min || 1)) {
                this.setValue(currentValue - 1);
            }
        };

        incrementBtn.onclick = () => {
            const currentValue = parseInt(this.quantityInput.value);
            if (currentValue < (quantity.max || 99)) {
                this.setValue(currentValue + 1);
            }
        };

        this.quantityInput.addEventListener("change", (event) => {
            if (this._isUpdating) return;

            const target = /** @type {HTMLInputElement} */ (event.target);
            if (!target) return;

            let value = parseInt(target.value);
            if (isNaN(value) || value < (quantity.min || 1)) value = quantity.min || 1;
            if (value > (quantity.max || 99)) value = quantity.max || 99;

            this.setValue(value);
        });

        // Assemble the component
        this.elementInput.appendChild(decrementBtn);
        this.elementInput.appendChild(this.quantityInput);
        this.elementInput.appendChild(incrementBtn);
        this.inputGroup.appendChild(this.elementInput);
    }

    /**
     * Set the value and trigger change event safely
     * @param {number} value
     */
    setValue(value) {
        if (this._isUpdating) return;

        this._isUpdating = true;

        // Update the input value
        this.quantityInput.value = value.toString();

        // Trigger change event
        const event = new Event("change", { bubbles: true });
        this.quantityInput.dispatchEvent(event);

        // Reset update flag
        this._isUpdating = false;
    }

    // Override label-related methods to do nothing or return empty strings
    getLabel() {
        return "";
    }

    setLabelAsterisk() {
        // Do nothing
    }

    triggerChange() {
        if (this._isUpdating) return;

        const event = new Event("change", { bubbles: true });
        this.quantityInput.dispatchEvent(event);
    }

    /**
     * @returns {number}
     */
    get() {
        return parseInt(this.quantityInput.value) || 1;
    }

    /**
     * @param {number} value
     */
    set(value) {
        this.setValue(value);
        return true;
    }

    disable() {
        this.quantityInput.disabled = true;
        this.elementInput.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
    }

    enable() {
        this.quantityInput.disabled = false;
        this.elementInput.querySelectorAll("button").forEach((btn) => (btn.disabled = false));
    }

    validationFunction() {
        return { valid: true, reason: "" };
    }

    validationClear() { }

    // Method to get the root element if needed
    getRootElement() {
        return this.elementInput;
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementImagePreview extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.divPreview = document.createElement("div");
        this.divPreview.classList.add("d-flex", "justify-content-center", "rounded-top");
        this.divPreview.style.width = "100%";
        this.divPreview.style.height = "256px";
        this.divPreview.style.maxWidth = "100%";
        this.divPreview.style.background = Shared.gridBackground;
        this.divPreview.style.overflow = "auto";
        this.elementColumn.appendChild(this.divPreview);

        this.elementImage = document.createElement("img");
        this.elementImage.style.height = "256px";
        this.elementImage.style.maxWidth = "100%";
        this.elementImage.style.objectFit = "contain";
        this.divPreview.appendChild(this.elementImage);

        this.elementInput = document.createElement("input");
        this.elementInput.type = "text";
        this.elementInput.classList.add("form-control");
        this.elementInput.style.borderRadius = "0px 0px 0.25rem 0.25rem";
        this.elementInput.addEventListener("input", () => {
            this.value = this.elementInput.value;
            this.elementImage.src = this.value;
        });
        this.elementColumn.appendChild(this.elementInput);
    }

    set(value) {
        this.elementInput.value = value ?? "";
        this.elementImage.src = value ?? "";
        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() { }

    enable() { }

    validationFunction() {
        return { valid: true, reason: "" };
    }

    validationClear() { }
}

/**
 * @typedef {object} InputElementStringHTMLOptions
 * @property {boolean} [useMathJax=false]
 */

/** @implements {IGenericInputElementField} */
export class InputElementStringHTML extends InputElementField {
    /**
     *
     * @param {InputElementOptions} [options]
     * @param {InputElementStringHTMLOptions} [stringHTML]
     */
    constructor(options, stringHTML) {
        super(options);

        this.useMathJax = stringHTML?.useMathJax ?? false;

        this.innerRow = document.createElement("div");
        this.innerRow.classList.add("row");
        this.elementColumn.appendChild(this.innerRow);

        VisualComponents.labelStatic(this.elementLabel);
        this.colLabel = document.createElement("div");
        this.colLabel.appendChild(this.elementLabel);
        this.colLabel.classList.add("col-12");
        this.innerRow.appendChild(this.colLabel);

        // move message beneath row
        this.elementColumn.removeChild(this.elementMessage);
        this.innerRow.after(this.elementMessage);

        this.colL = document.createElement("div");
        this.colL.classList.add("col-6");
        this.innerRow.appendChild(this.colL);

        this.colR = document.createElement("div");
        this.colR.classList.add("col-6");
        this.innerRow.appendChild(this.colR);

        this.value = "";
        this.divEditor = document.createElement("div");
        this.divEditor.classList.add("rounded");
        this.divEditor.style.height = "384px";
        this.colL.appendChild(this.divEditor);
        // @ts-expect-error Ace is not a module
        this.elementInput = window.ace.edit(this.divEditor, {
            mode: "ace/mode/html",
            theme: "ace/theme/chrome",
            maxLines: 20,
            minLines: 5,
        });

        this.elementInput.renderer.setOption("showGutter", false);

        this.elementInput.commands.removeCommand(this.elementInput.commands.byName.indent);
        this.elementInput.commands.removeCommand(this.elementInput.commands.byName.outdent);

        this.elementInput.addEventListener("change", () => {
            this.value = this.elementInput.getValue();
            this.previewUpdate();
        });

        this.elementInput.addEventListener("focus", () => {
            if (Snippet.onFocus && typeof Snippet.onFocus === "function") {
                Snippet.onFocus(this.elementInput, true);
            }
        });

        this.elementInput.session.setUseWrapMode(true);

        // this.elementInput = document.createElement("textarea");
        // this.elementInput.classList.add("form-control");
        // this.elementInput.rows = 4;
        // this.colL.appendChild(this.elementInput);

        // this.elementInput.oninput = () => {
        //     this.divPreview.innerHTML = this.elementInput.value;
        // };

        this.divPreview = document.createElement("div");
        this.divPreview.classList.add("rounded");
        this.divPreview.style.overflow = "auto";
        if (Shared.useOverlappingLabel) {
            this.divPreview.style.height = "100%";
        } else {
            this.divPreview.style.height = "calc(100% - 1.5rem)";
            this.divPreviewLabel = VisualComponents.createLabel();
            this.colR.appendChild(this.divPreviewLabel);
        }
        this.divPreview.style.background = Shared.gridBackground;
        this.colR.appendChild(this.divPreview);
    }

    set(value) {
        this.elementInput.setValue(value ?? "");
        this.elementInput.selection.clearSelection();
        this.previewUpdate();

        return true;
    }

    /** @returns {string} */
    get() {
        // return this.elementInput.value;
        return this.elementInput.getValue();
    }

    disable() {
        this.elementInput.setReadOnly(true);
        this.elementInput.setHighlightActiveLine(false);
        this.elementInput.renderer.$cursorLayer.element.style.opacity = 0.0;
        this.elementInput.renderer.$textLayer.element.style.opacity = 0.8;
        this.divEditor.style.opacity = "0.75";
    }

    enable() {
        this.elementInput.setReadOnly(false);
        this.elementInput.setHighlightActiveLine(true);
        this.elementInput.renderer.$cursorLayer.element.style.opacity = 1.0;
        this.elementInput.renderer.$textLayer.element.style.opacity = 1.0;
        this.divEditor.style.opacity = "1.0";
    }

    validationFunction() {
        // this.validationClear();

        // // TODO: validate HTML properly

        // if (this.required && this.get().length === 0) {
        //     this.elementInput.classList.add("is-invalid");
        //     return { valid: false, reason: "Required value is empty" };
        // }

        // this.elementInput.classList.add("is-valid");
        return { valid: true, reason: "" };
    }

    validationClear() {
        // this.elementInput.classList.remove("is-valid");
        // this.elementInput.classList.remove("is-invalid");
        // this.elementMessage.classList.add("d-none");
    }

    previewUpdate() {
        /**
         * 51 characters is a magic number based on the minimum characters
         * required to represent a Shared HTML tag with a Shared HTML Id
         * @example <shared-html>0123456789abcdef0123456789</shared-html>
         */
        if (this.value.length >= 51) {
            const sharedHtmlIds = contentSharedHtmlIds(this.value);
            if (sharedHtmlIds.size >= 1) {
                const body = {
                    field: "_id",
                    value: [...sharedHtmlIds],
                };
                return fetch("/resource/shared-html/info", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                })
                    .then((response) => response.json())
                    .then((response) => {
                        if (response?.error) throw Error(response.error);
                        if (!response?.results) throw Error("Unexpected response");

                        if (Array.isArray(response.results)) {
                            this.divPreview.innerHTML = contentReplaceSharedHtml(renderPassage(this.value), response.results);
                        }
                    })
                    .catch((error) => {
                        this.divPreview.innerHTML = renderPassage(this.value);
                        console.error("Failed to request SharedHtml in HTML Preview", error);
                    })
                    .finally(() => {
                        this.mathjaxUpdate();
                    });
            }
        }
        this.divPreview.innerHTML = renderPassage(this.value);
        this.mathjaxUpdate();
    }

    mathjaxUpdate() {
        if (this.useMathJax) {
            // @ts-expect-error
            // eslint-disable-next-line no-undef
            MathJax.typesetClear([this.divPreview]);
        }
        if (this.useMathJax) {
            // @ts-expect-error
            // eslint-disable-next-line no-undef
            MathJax.typeset([this.divPreview]);
        }
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementStringColor extends InputElementField {
    /**
     *
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInputGroup = document.createElement("div");
        this.elementInputGroup.classList.add("input-group");
        this.elementColumn.appendChild(this.elementInputGroup);

        // move message beneath row
        this.elementColumn.removeChild(this.elementMessage);
        this.elementInputGroup.after(this.elementMessage);

        this.elementInputText = document.createElement("input");
        this.elementInputText.classList.add("form-control");
        this.elementInputText.type = "text";
        this.elementInputText.addEventListener("input", () => {
            this.elementInput.value = this.elementInputText.value;
        });
        this.elementInputGroup.appendChild(this.elementInputText);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "color";
        this.elementInput.addEventListener("input", () => {
            this.elementInputText.value = this.elementInput.value;
        });
        this.elementInputGroup.appendChild(this.elementInput);
    }

    set(value) {
        this.elementInputText.value = value ?? "";
        this.elementInput.value = value ?? "";

        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInputText.value;
    }

    disable() {
        this.elementInput.disabled = true;
        this.elementInputText.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
        this.elementInputText.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length === 0) {
            this.elementInputText.classList.add("is-invalid");
            return { valid: false, reason: "Required value is empty" };
        }

        // Function to validate a string as a CSS color
        const isValidCSSColor = (color) => {
            // Hex (3 or 6 characters), e.g., "#fff" or "#ffffff"
            const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;

            // RGB or RGBA, e.g., "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)"
            const rgbPattern = /^rgba?\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*(,\s*[01](\.\d+)?\s*)?\)$/;

            // HSL or HSLA, e.g., "hsl(261, 100%, 50%)" or "hsla(261, 100%, 50%, 0.5)"
            const hslPattern = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(,\s*[01](\.\d+)?\s*)?\)$/;

            // Named color, e.g., "red", "blue", etc. (you can extend this list as needed)
            const namedColors = [
                "red",
                "blue",
                "green",
                "black",
                "white",
                "gray",
                "yellow",
                "pink",
                "cyan",
                "magenta",
                "lime",
                "purple",
                // Add more named colors if needed
            ];

            // Check if it's a valid hex, rgb, hsl, or named color
            if (hexPattern.test(color) || rgbPattern.test(color) || hslPattern.test(color) || namedColors.includes(color.toLowerCase())) {
                this.elementInputText.classList.add("is-valid");
                return { valid: true, reason: "" };
            } else {
                this.elementInputText.classList.add("is-invalid");
                return { valid: false, reason: "Value is not a valid CSS color" };
            }
        };

        return isValidCSSColor(this.get());
    }

    validationClear() {
        this.elementInputText.classList.remove("is-valid");
        this.elementInputText.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementStringPassword extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "password";
        this.inputGroup.appendChild(this.elementInput);

        this.elementButton = document.createElement("button");
        this.elementButton.classList.add("btn", "btn-secondary");
        this.elementButton.type = "button";
        this.elementButton.innerHTML = "<i class='bi bi-eye-fill'></i>";
        this.elementButton.addEventListener("click", () => {
            this.elementInput.type = this.elementInput.type === "password" ? "text" : "password";
            this.elementButton.innerHTML = this.elementInput.type === "password" ? "<i class='bi bi-eye-fill'></i>" : "<i class='bi bi-eye-slash-fill'></i>";
        });
        VisualComponents.applyTooltip(this.elementButton, "Show/Hide Password");
        this.appendElement(this.elementButton);
    }

    set(value) {
        this.elementInput.value = value ?? "";
        return true;
    }

    /** @returns {string} */
    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length < 8) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Must be at least 8 characters" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/**
 * @typedef {object} InputElementFileOptions
 * @property {boolean} [multiple=false]
 * @property {string} [accept]
 */

/** @implements {IGenericInputElementField} */
export class InputElementFile extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementFileOptions} [fileOptions]
     */
    constructor(options, fileOptions) {
        super(options);
        if (options?.required) {
            this.setLabelAsterisk(true);
        }
        const elementId = `input-file-${Math.random().toString(36).substring(2, 15)}`;

        this.elementInput = document.createElement("input");
        this.elementInput.id = elementId;
        this.elementInput.type = "file";
        this.elementInput.multiple = fileOptions?.multiple ?? false;
        this.elementInput.accept = fileOptions?.accept ?? "";

        this.elementInputLabel = document.createElement("label");
        this.elementInputLabel.htmlFor = elementId;

        switch (Environment.bootstrapVersionGet()) {
            case 4: {
                this.inputGroup.className = "custom-file";

                this.elementInput.className = "custom-file-input";
                this.inputGroup.appendChild(this.elementInput);

                this.elementInputLabel.className = "custom-file-label";
                this.elementInputLabel.innerHTML = "";
                this.inputGroup.appendChild(this.elementInputLabel);
                break;
            }
            case 5: {
                this.inputGroup.className = "";

                this.elementInputLabel.className = "form-label";
                this.elementInputLabel.innerHTML = "";
                this.inputGroup.appendChild(this.elementInputLabel);

                this.elementInput.className = "form-control";
                this.inputGroup.appendChild(this.elementInput);
                break;
            }
        }

        this.elementInput.addEventListener("change", () => {
            // Note: No longer need to do this with bootstrap 5
            // if (this.elementInput.files && this.elementInput.files.length >= 1) {
            //     this.elementInputLabel.innerHTML = [...this.elementInput.files].map((file) => file.name).join(", ");
            // } else {
            //     this.elementInputLabel.innerHTML = "";
            // }
        });
    }

    get() {
        return this.elementInput.files;
    }

    // eslint-disable-next-line no-unused-vars
    set(value) {
        // do nothing
        return true;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        const files = this.get();
        if (this.required && (files === null || files.length < 1)) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Must select at least one file" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/**
 * @callback InputElementDocumentSelectOptionsOnClick
 * @param {string} [value]
 * @returns {void}
 */

/**
 * Keyboard navigation is enabled by default (dropdown menu items must use "list-group-item-action" class)
 * Up/Down Arrow Keys to navigate, Enter to select (dropdown menu item must have a "click" event listener), Escape to close
 * @typedef {object} InputElementDocumentSelectOptions
 * @property {boolean} [activateOnClick=true] - Show/hide dropdown menu on input focus/blur
 * @property {boolean} [keyboardNavigation=true] - Allow ArrowKey/Enter/Escape key navigation of the dropdown menu
 * @property {InputElementDocumentSelectOptionsOnClick} [onClick] - Callback function when a document is selected
 */

export class InputElementDocumentSelect extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementDocumentSelectOptions} [documentSelect]
     */
    constructor(options, documentSelect) {
        super(options);

        /** @type {string} Document ID stored when a document is selected */
        this.value = "";

        // make sure the column is relatively positioned
        this.elementColumn.style.position = "relative";
        // remove the input group class
        this.inputGroup.classList.remove("input-group");

        // selected value
        this.elementValue = document.createElement("div");
        this.elementValue.className = "form-control";
        this.elementValue.style.textWrapMode = "nowrap";
        this.elementValue.style.overflow = "hidden";
        this.elementValue.tabIndex = 0;
        this.elementValue.addEventListener("click", () => {
            this.show();
        });
        this.inputGroup.appendChild(this.elementValue);

        // search input
        this.elementInput = document.createElement("input");
        this.elementInput.className = "form-control";
        this.elementInput.classList.add("d-none");
        this.elementInput.type = "text";
        this.inputGroup.appendChild(this.elementInput);

        // search results dropdown
        this.elementDropdown = document.createElement("div");
        this.elementDropdown.className = "list-group w-100 shadow d-none";
        this.elementDropdown.style.zIndex = "99";
        this.elementDropdown.style.position = "absolute";
        this.elementColumn.insertBefore(this.elementDropdown, this.elementMessage);

        if (documentSelect?.activateOnClick !== false) {
            this.elementInput.addEventListener("focus", () => {
                this.elementInput.classList.remove("is-invalid");
                this.elementDropdown?.classList.remove("d-none");
            });
            this.elementInput.addEventListener("blur", () => {
                //console.log("Blurred DocumentSelect input element");
                setTimeout(() => {
                    //console.log("Hiding DocumentSelect dropdown element");
                    this.elementDropdown?.classList.add("d-none");
                }, 100);
            });
        }
        if (documentSelect?.keyboardNavigation !== false) {
            this.elementInput.addEventListener("keydown", (event) => {
                if (!this.elementInput.disabled && this.elementDropdown && !this.elementDropdown.classList.contains("d-none")) {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        const itemFirst = /** @type {HTMLAnchorElement} */ (this.elementDropdown.querySelector(".list-group-item-action"));
                        const itemActive = /** @type {HTMLAnchorElement} */ (this.elementDropdown.querySelector(".list-group-item-action.active"));
                        if (itemActive) {
                            const itemSibling = event.key === "ArrowDown" ? itemActive.nextElementSibling : itemActive.previousElementSibling;
                            if (itemSibling && itemSibling.classList.contains("list-group-item-action")) {
                                itemActive.classList.remove("active");
                                itemSibling.classList.add("active");
                                event.preventDefault();
                            }
                        } else if (itemFirst) {
                            itemFirst.classList.add("active");
                            event.preventDefault();
                        }
                    } else if (event.key === "Enter") {
                        const itemActive = /** @type {HTMLAnchorElement} */ (this.elementDropdown.querySelector(".list-group-item-action.active"));
                        if (itemActive) {
                            itemActive.dispatchEvent(new Event("mousedown"));
                        }
                    } else if (event.key === "Escape") {
                        this.hide();
                    }
                }
            });
        }
    }

    /**
     * @param {string} value
     */
    set(value) {
        this.value = value;
        this.elementInput.dispatchEvent(new Event("change"));
    }

    get() {
        return this.value;
    }

    disable() {
        this.elementValue.classList.add("disabled");
        this.hide();
    }

    enable() {
        this.elementValue.classList.remove("disabled");
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length !== 24) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "No document selected" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }

    /** Show search bar and dropdown menu */
    show() {
        this.elementValue.classList.add("d-none");
        this.elementDropdown.classList.remove("d-none");
        this.elementInput.classList.remove("d-none");
        this.elementInput.focus();
    }

    /** Hide search bar and dropdown menu */
    hide() {
        this.elementValue.classList.remove("d-none");
        this.elementDropdown.classList.add("d-none");
        this.elementInput.classList.add("d-none");
        this.set(this.value);
        this.elementInput.blur();
    }

    /**
     *
     * @param {string} documentId
     * @param {InputElementDocumentSelectOptionsOnClick} [callback]
     */
    select(documentId, callback) {
        this.set(documentId);
        this.hide();
        if (callback && typeof callback === "function") {
            callback(documentId);
        }
    }

    clear() {
        this.value = "";
    }

    /**
     * @param {string} text
     */
    placeholder(text) {
        this.elementValue.innerText = text;
        this.elementValue.classList.add("text-secondary");
        this.elementInput.setAttribute("placeholder", text);
    }
}

/**
 *
 * @param {string} text
 * @param {string} keyword
 */
export function searchResultMatchedTextRender(text, keyword) {
    const spanText = document.createElement("span");
    spanText.style.whiteSpace = "nowrap";
    const textTruncated = text.length > 128 ? text.slice(0, 128) + "..." : text;
    const matchIndex = textTruncated.toLowerCase().indexOf(keyword.toLowerCase());
    if (matchIndex > -1) {
        spanText.appendChild(document.createTextNode(textTruncated.slice(0, matchIndex)));
        // highlight matched text
        const spanMatchedText = document.createElement("span");
        spanMatchedText.className = "font-weight-bold";
        spanMatchedText.innerText = textTruncated.slice(matchIndex, matchIndex + keyword.length);
        spanText.appendChild(spanMatchedText);
        spanText.appendChild(document.createTextNode(textTruncated.slice(matchIndex + keyword.length)));
    } else {
        spanText.innerText = textTruncated;
    }
    return spanText;
}

/**
 * @typedef {object} InputElementToggleOptions
 * @property {string} [text="Toggle"]
 * @property {boolean} [checked=false]
 * @property {string} [iconChecked="bi-check-square"]
 * @property {string} [iconUnchecked="bi-square"]
 * @property {string} [textColorChecked="text-primary"]
 * @property {string} [textColorUnchecked=""]
 * @property {string} [textColorDisabled="text-secondary"]
 */

/** @implements {IGenericInputElementField} */
class InputElementToggle extends InputElementField {
    /** @type {boolean} */
    value;
    /** @type {string} */
    iconChecked;
    /** @type {string} */
    iconUnchecked;
    /** @type {string | undefined} */
    textColorChecked;
    /** @type {string | undefined} */
    textColorUnchecked;
    /** @type {string | undefined} */
    textColorDisabled;

    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementToggleOptions} [toggle]
     */
    constructor(options, toggle) {
        super(options);

        this.value = toggle?.checked ?? false;
        this.iconChecked = toggle?.iconChecked ?? "bi-check-square-fill";
        this.iconUnchecked = toggle?.iconUnchecked ?? "bi-square";
        this.textColorChecked = toggle?.textColorChecked ?? "text-primary";
        this.textColorUnchecked = toggle?.textColorUnchecked ?? "";
        this.textColorDisabled = toggle?.textColorDisabled ?? "text-secondary";

        if (options?.label === undefined && options?.required !== true) {
            this.elementLabel.classList.add("d-none");
            this.inputGroup.classList.add("mt-3");
        }

        this.elementInput = document.createElement("div");
        this.elementInput.className = "form-control cursor-pointer";
        this.elementInput.tabIndex = 0;

        // move spinner inside input
        this.elementInput.appendChild(this.elementSpinner);

        this.elementIcon = document.createElement("i");
        this.elementIcon.className = "bi";
        this.elementInput.appendChild(this.elementIcon);

        this.elementText = document.createElement("span");
        this.elementText.classList.add("pl-2", "ps-2");
        this.elementText.style.userSelect = "none";
        this.elementText.innerHTML = toggle?.text ?? "Toggle";
        this.elementInput.appendChild(this.elementText);

        this.inputGroup.appendChild(this.elementInput);
    }

    spin() {
        this.elementSpinner.classList.remove("d-none");
        this.elementIcon.classList.add("d-none");
        this.textColorReset();
    }

    success() {
        this.elementSpinner.classList.add("d-none");
        this.elementIcon.classList.remove("d-none");
        this.iconReset();
        this.iconUpdate();
        this.textColorReset();
        this.elementInput.classList.add("text-success");
    }

    failure() {
        this.elementSpinner.classList.add("d-none");
        this.elementIcon.classList.remove("d-none");
        this.iconReset();
        this.iconUpdate();
        this.textColorReset();
        this.elementInput.classList.add("text-danger");
    }

    iconReset() {
        this.elementIcon.className = "bi";
    }

    iconUpdate() {
        this.elementIcon.classList.remove("text-success", "text-danger");
        this.elementIcon.classList.toggle(this.iconChecked, this.value === true);
        this.elementIcon.classList.toggle(this.iconUnchecked, this.value === false);
    }

    textColorReset() {
        this.elementInput.classList.remove("text-success", "text-danger");
        if (this.textColorChecked) {
            this.elementInput.classList.remove(this.textColorChecked);
        }
        if (this.textColorUnchecked) {
            this.elementInput.classList.remove(this.textColorUnchecked);
        }
        if (this.textColorDisabled) {
            this.elementInput.classList.remove(this.textColorDisabled);
        }
    }

    textColorUpdate() {
        this.elementInput.classList.remove("text-success", "text-danger");
        if (this.elementInput.classList.contains("disabled")) {
            if (this.textColorChecked) {
                this.elementInput.classList.remove(this.textColorChecked);
            }
            if (this.textColorUnchecked) {
                this.elementInput.classList.remove(this.textColorUnchecked);
            }
            if (this.textColorDisabled) {
                this.elementInput.classList.add(this.textColorDisabled);
            }
        } else {
            if (this.textColorChecked) {
                this.elementInput.classList.toggle(this.textColorChecked, this.value === true);
            }
            if (this.textColorUnchecked) {
                this.elementInput.classList.toggle(this.textColorUnchecked, this.value === false);
            }
            if (this.textColorDisabled) {
                this.elementInput.classList.remove(this.textColorDisabled);
            }
        }
    }

    toggle() {
        console.warn("toggle() function not implemented!");
    }

    update() {
        this.iconUpdate();
        this.textColorUpdate();
    }

    /** @param {boolean} value */
    set(value) {
        if (this.elementInput.classList.contains("disabled")) return false;

        this.value = value;
        this.update();
        return true;
    }

    /** @returns {boolean} */
    get() {
        return this.value;
    }

    disable() {
        this.elementInput.classList.add("disabled");
        this.elementInput.classList.remove("cursor-pointer");
        this.update();
    }

    enable() {
        this.elementInput.classList.remove("disabled");
        this.elementInput.classList.add("cursor-pointer");
        this.update();
    }

    validationFunction() {
        this.validationClear();

        if (this.required && !this.get()) {
            this.elementInput.classList.add("border-danger");
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Must be checked" };
        } else {
            this.elementInput.classList.add("border-success");
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("border-success");
        this.elementInput.classList.remove("border-danger");
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

/** @implements {IGenericInputElementField} */
export class InputElementCheckbox extends InputElementToggle {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementToggleOptions} [checkbox]
     */
    constructor(options, checkbox) {
        super(options, checkbox);

        this.iconChecked = checkbox?.iconChecked ?? "bi-check-square-fill";
        this.iconUnchecked = checkbox?.iconUnchecked ?? "bi-square";

        this.elementInput.addEventListener("click", (event) => {
            if (!this.elementInput.classList.contains("disabled")) {
                this.toggle();
            }
        });
        this.elementInput.addEventListener("keypress", (event) => {
            if (event.key === " ") {
                event.preventDefault();
                this.elementInput.dispatchEvent(new Event("click"));
            }
        });

        this.update();
    }

    toggle() {
        if (!this.elementInput.classList.contains("disabled")) {
            this.set(!this.value);
        }

        // trigger change event
        this.elementInput.dispatchEvent(new Event("change"));
    }
}

/**
 * @typedef {object} InputElementRadioOptions
 * @property {string} [text="Toggle"]
 * @property {boolean} [checked=false]
 * @property {string} [iconChecked="bi-check-square"]
 * @property {string} [iconUnchecked="bi-square"]
 * @property {string} [textColorChecked="text-primary"]
 * @property {string} [textColorUnchecked=""]
 * @property {string} [textColorDisabled="text-secondary"]
 * @property {string} [group] Which group this InputElementRadio belongs to
 */

/** @type {Map<string, Array<InputElementRadio>>} */
const radioGroups = new Map();

/** @implements {IGenericInputElementField} */
export class InputElementRadio extends InputElementToggle {
    /** @type {string | undefined} */
    group;

    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementRadioOptions} [radio]
     */
    constructor(options, radio) {
        super(options, radio);

        this.group = radio?.group ?? undefined;
        this.iconChecked = radio?.iconChecked ?? "bi-check-circle-fill";
        this.iconUnchecked = radio?.iconUnchecked ?? "bi-circle";

        this.elementInput.addEventListener("click", (event) => {
            if (!this.elementInput.classList.contains("disabled")) {
                this.set(true);
                this.elementInput.dispatchEvent(new Event("change"));
            }
        });
        this.elementInput.addEventListener("keypress", (event) => {
            if (event.key === " ") {
                event.preventDefault();
                this.elementInput.dispatchEvent(new Event("click"));
                this.elementInput.dispatchEvent(new Event("change"));
            }
        });

        this.update();
        this.groupAdd();
    }

    failure() {
        InputElementToggle.prototype.failure.call(this);
        this.elementIcon.classList.add("bi-exclamation-circle");
    }

    toggle() {
        console.warn("This function is unused by InputElementRadio");
    }

    /** @param {boolean} value */
    set(value) {
        if (this.value !== true && value === true) {
            this.value = value;
            this.update();
            this.groupUpdate();
            return true;
        } else if (this.value === true && value === false) {
            this.value = value;
            this.update();
        }
        return false;
    }

    groupAdd() {
        if (this.group) {
            let radioGroup = radioGroups.get(this.group);
            if (!Array.isArray(radioGroup)) {
                radioGroup = [];
            }
            if (!radioGroup.some((inputElementRadio) => inputElementRadio === this)) {
                radioGroup.push(this);
                radioGroups.set(this.group, radioGroup);
            }
        }
    }

    groupRemove() {
        if (this.group) {
            let radioGroup = radioGroups.get(this.group);
            if (Array.isArray(radioGroup)) {
                let indexOf = radioGroup.findIndex((inputElementRadio) => inputElementRadio === this);
                if (indexOf > -1) {
                    radioGroup.splice(indexOf, 1);
                    radioGroups.set(this.group, radioGroup);
                }
            }
        }
    }

    groupUpdate() {
        if (this.group) {
            let radioGroup = radioGroups.get(this.group);
            if (Array.isArray(radioGroup)) {
                for (const inputElementRadio of radioGroup) {
                    if (inputElementRadio !== this) {
                        inputElementRadio.set(false);
                    }
                }
            }
        }
    }
}

const siteKey = "6LdyyOopAAAAAAqlZMLSaZzORKYcwV3lw8LYs8aR";
let recaptchaInitialized = false;

function loadReCaptcha(callback) {
    if (recaptchaInitialized) {
        callback();
        return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);

    recaptchaInitialized = true;
}

function renderReCaptcha(elementId) {
    // @ts-expect-error
    window.grecaptcha.ready(function () {
        // @ts-expect-error
        window.grecaptcha.render(elementId, {
            sitekey: siteKey,
        });
    });
}

export class InputElementRecaptcha extends InputElementField {
    recaptchaCallback(value) {
        this.value = value;
    }

    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.value = "";

        // @ts-expect-error
        window.recaptchaCallback = this.recaptchaCallback.bind(this);

        this.inputGroup.style.display = "flex";
        this.inputGroup.style.justifyContent = "center";
        this.inputGroup.style.alignItems = "center";

        this.elementInput = document.createElement("div");
        this.elementInput.id = "recaptcha";
        this.elementInput.classList.add("g-recaptcha");
        this.inputGroup.appendChild(this.elementInput);
        this.elementInput.dataset.callback = "recaptchaCallback";

        if (Shared.useOverlappingLabel) {
            this.inputGroup.classList.add("mt-3");
        }

        loadReCaptcha(() => {
            renderReCaptcha(this.elementInput.id);
        });
    }

    set() {
        console.warn("Recaptcha cannot be set");
    }

    /** @returns {string} */
    get() {
        return this.value;
    }

    disable() { }

    enable() { }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length === 0) {
            return { valid: false, reason: "Recaptcha not completed" };
        }

        return { valid: true, reason: "" };
    }

    validationClear() {
        this.elementMessage.classList.add("d-none");
    }
}

/*
{
            _elem = document.createElement("div");
            _elem.classList.add("input-group");

            let input = document.createElement("input");
            input.classList.add("form-control", "disabled");
            if (options.type) {
                input.type = options.type;
            } else {
                input.type = "text";
            }
            if (Array.isArray(options.classList) && options.classList.length >= 1) {
                options.classList.forEach((_class) => input.classList.add(_class));
            }

            let div_append = document.createElement("div");
            div_append.classList.add("input-group-append");

            // create an appended button to open the object in a new tab
            let button = document.createElement("button");
            button.title = "Open in Editor";
            button.classList.add("btn", "btn-outline-secondary");
            button.type = "button";
            button.innerHTML = '<i class="bi bi-box-arrow-up-right"></i>';
            button.onclick = () => {
                window.open(`/apps/editor?collection=${options.collection}&id=${input.value}`, "_blank");
            };

            _elem.appendChild(input);
            div_append.appendChild(button);
            _elem.appendChild(div_append);

            node.get = () => input.value;
            node.set = (value) => {
                input.value = value;
            };
            node.enable = () => {
                input.disabled = false;
            };
            node.disable = () => {
                input.disabled = true;
            };
            node.validation_get = validation_get.bind(input);
            node.validation_set = validation_set.bind(input);
            node.element = input;

            if (options.pattern) {
                input.pattern = options.pattern;
            }
            if (options.oninput) {
                input.oninput = options.oninput;
            }

            break;
        }
*/

/**
 * @typedef {object} InputElementObjectIdOptions
 * @property {string} [collection]
 */

/** @implements {IGenericInputElementField} */
export class InputElementObjectId extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     * @param {InputElementObjectIdOptions} [objectIdOptions]
     */
    constructor(options, objectIdOptions) {
        // console.log("InputElementObjectId", options, objectIdOptions);

        super(options);

        this.collection = objectIdOptions?.collection ?? undefined;

        this.elementInput = document.createElement("input");
        this.elementInput.classList.add("form-control");
        this.elementInput.type = "text";
        this.inputGroup.appendChild(this.elementInput);

        this.elementSearchInput = document.createElement("input");
        this.elementSearchInput.classList.add("form-control", "d-none");
        this.elementSearchInput.type = "text";
        this.elementSearchInput.placeholder = "Search...";
        this.inputGroup.appendChild(this.elementSearchInput);

        this.elementSearchResultSelect = document.createElement("select");
        this.elementSearchResultSelect.classList.add("form-control", "d-none");
        this.elementSearchResultSelect.disabled = false;
        this.inputGroup.appendChild(this.elementSearchResultSelect);

        this.inputDelayTimer = null;

        this.elementSearchInput.addEventListener("input", async () => {
            if (this.inputDelayTimer) {
                clearTimeout(this.inputDelayTimer);
            }

            this.inputDelayTimer = setTimeout(async () => {
                const searchResponse = await fetch("/apps/editor/search/exact-string", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        collection: this.collection,
                        query: this.elementSearchInput.value,
                    }),
                });

                const search = await searchResponse.json();

                this.elementSearchResultSelect.value = "";
                this.elementSearchResultSelect.classList.remove("d-none");

                this.elementSearchResultSelect.innerHTML = "";

                // add a please select
                const option = document.createElement("option");
                option.value = "";
                option.innerText = "Please Select";
                this.elementSearchResultSelect.appendChild(option);

                search.results.forEach((result) => {
                    const option = document.createElement("option");
                    option.value = result._id;
                    option.innerText = search.listFields.map((key) => result[key]).join(" | ");
                    this.elementSearchResultSelect.appendChild(option);
                });

                this.elementSearchResultSelect.onchange = () => {
                    this.set(this.elementSearchResultSelect.value);
                    this.elementSearchInput.classList.add("d-none");
                    this.elementSearchResultSelect.classList.add("d-none");
                };
            }, 500);
        });

        this.elementSearchButton = document.createElement("button");
        this.elementSearchButton.classList.add("btn", "btn-outline-secondary");
        this.elementSearchButton.type = "button";
        this.elementSearchButton.innerHTML = '<i class="bi bi-search"></i>';
        this.elementSearchButton.onclick = () => {
            this.elementSearchInput.classList.toggle("d-none");
            this.elementSearchResultSelect.classList.toggle("d-none");
            this.elementSearchInput.focus();
        };
        this.inputGroup.appendChild(this.elementSearchButton);

        this.elementButton = document.createElement("button");
        this.elementButton.title = "Open in Editor";
        this.elementButton.classList.add("btn", "btn-outline-secondary");
        this.elementButton.type = "button";
        this.elementButton.innerHTML = '<i class="bi bi-box-arrow-up-right"></i>';

        this.documentPreview = document.createElement("span");
        this.documentPreview.classList.add("badge", "ml-2", "ms-2");
        this.elementLabel.appendChild(this.documentPreview);
        this.documentPreview.innerText = "";

        this.appendElement(this.elementButton);

        this.onValidValue = (value) => { };

        this.elementInput.addEventListener("input", () => {
            this.documentPreview.innerText = "";
            if (this.elementInput.value.length === 24) {
                this.onValidValue(this.elementInput.value);
            }
        });
    }

    set(value) {
        this.elementInput.value = value ?? "";
        if (this.collection) {
            this.elementButton.onclick = () => {
                window.open(`/apps/editor/?collection=${this.collection}&id=${this.elementInput.value}`, "_blank");
            };
        }

        this.documentPreview.innerText = "";
        if (this.elementInput.value.length === 24) {
            this.onValidValue(this.elementInput.value);
        }

        return true;
    }

    get() {
        return this.elementInput.value;
    }

    disable() {
        this.elementInput.disabled = true;
    }

    enable() {
        this.elementInput.disabled = false;
    }

    validationFunction() {
        this.validationClear();

        if (this.required && this.get().length !== 24) {
            this.elementInput.classList.add("is-invalid");
            return { valid: false, reason: "Invalid Object ID" };
        } else {
            this.elementInput.classList.add("is-valid");
            return { valid: true, reason: "" };
        }
    }

    validationClear() {
        this.elementInput.classList.remove("is-valid");
        this.elementInput.classList.remove("is-invalid");
        this.elementMessage.classList.add("d-none");
    }
}

export class InputStaticHTML extends InputElementField {
    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementInput = document.createElement("div");
        this.elementInput.classList.add("form-control", "border-0", "bg-transparent");
        this.elementInput.style.whiteSpace = "pre-wrap";
        this.elementInput.style.overflow = "auto";
        this.inputGroup.appendChild(this.elementInput);
    }

    set(value) {
        this.value = value;
        return true;
    }

    get() {
        return this.value;
    }

    disable() { }

    enable() { }

    validationFunction() {
        return { valid: true, reason: "" };
    }

    validationClear() { }
}

/** @implements {IGenericInputElementField} */
export class InputElementSelectUser extends InputElementSelect {
    /** @type {Search.FuseUserSearchComponent} */
    fuseSearchComponent;
    /** @type {HTMLDivElement} */
    elementInputGroup;

    /** @type {number} */
    resultsMax;

    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        super(options);

        this.fuseSearchComponent = new Search.FuseUserSearchComponent();

        // insert the search input before the select element
        this.inputGroup.remove();
        this.elementColumn.appendChild(this.fuseSearchComponent.elementInputGroup);
        this.inputGroup = this.fuseSearchComponent.elementInputGroup;

        this.elementInputGroup = document.createElement("div");
        this.elementInputGroup.classList.add("input-group", "mt-2");
        this.elementColumn.appendChild(this.elementInputGroup);

        this.elementInputGroup.appendChild(this.elementInput);

        this.resultsMax = 5;

        this.fuseSearchComponent.setOnResults((results) => {
            this.optionsClear();
            this.optionsPush(
                results.slice(0, this.resultsMax).map((result) => {
                    // Create text prefix based on user type
                    const typePrefix = this.getUserTypePrefix(result.type);

                    return {
                        value: result._id,
                        // Use text-based indicators instead of HTML
                        text: `${typePrefix} ${result.firstname} ${result.lastname}${result.email !== "" ? ` (${result.email})` : ""}`,
                    };
                })
            );

            if (results.length > 0) {
                this.set(results[0]._id);
            } else {
                this.set("");
            }

            // trigger events
            this.elementInput.dispatchEvent(new Event("input"));
        });
    }

    /**
     * Returns the appropriate text prefix based on user type
     * @param {string} userType - "Guardian" or "Dependent"
     * @returns {string} Text prefix for the user type
     */
    getUserTypePrefix(userType) {
        if (userType === "Guardian") {
            // Unicode character for guardian (shield)
            return "👨‍👦";
        } else if (userType === "Dependent") {
            // Unicode character for dependent (child)
            return "👶";
        }
        return "❓";
    }

    /** @param {HTMLElement} element */
    appendActionButton(element) {
        // remove w-100 if it exists
        element.classList.remove("w-100");
        this.elementInputGroup.appendChild(element);
    }
}

// test search component
/** @implements {IGenericInputElementField} */

export class InputElementSelectTest extends InputElementSelect {
    /**
     * @param {InputElementOptions} [options]
     * @param {object} [objectIdOptions]
     */
    constructor(options, objectIdOptions) {
        super(options);

        // Create the test search component
        this.fuseTestSearchComponent = new Search.FuseTestSearchComponent(1000);

        // Insert the search input before the select element
        this.elementColumn.appendChild(this.fuseTestSearchComponent.elementInputGroup);

        // Create input group for the select element
        this.elementInputInputGroup = document.createElement("div");
        this.elementInputInputGroup.classList.add("input-group", "mt-2");
        this.elementColumn.appendChild(this.elementInputInputGroup);
        this.elementInputInputGroup.appendChild(this.elementInput);

        // Set up callback for search results
        this.fuseTestSearchComponent.setOnResults((results) => {
            this.optionsClear();
            this.optionsPush(
                results.map((result) => {
                    const optionData = {
                        value: result._id,
                        text: result.name,
                    };
                    return optionData;
                })
            );
            // Trigger events
            this.elementInput.dispatchEvent(new Event("input"));
        });
    }

    /**
     * @param {HTMLElement} element
     */
    appendActionButton(element) {
        // Remove w-100 if it exists
        element.classList.remove("w-100");
        this.elementInputInputGroup.appendChild(element);
    }

    getTestType() {
        return this.fuseTestSearchComponent.getTestType(this.get());
    }

    getTest(testId) {
        // find the test in the list
        const test = this.fuseTestSearchComponent.getTest(testId);
        return test;
    }
}
/**
 * @typedef {object} ThreeDotsMenuItem
 * @property {string} label - The label of the dropdown item
 * @property {string} [icon] - The icon of the dropdown item
 * @property {Function} action - The action to be executed when the dropdown item is clicked
 */

export class ThreeDotsMenu extends InputElementColumn {
    /**
     * @param {Array<ThreeDotsMenuItem>} menuItems - Menu items with labels and actions
     */
    constructor(menuItems) {
        super();
        /** @type {Array<ThreeDotsMenuItem>}*/
        this.menuItems = menuItems;
        this.elementColumn.className = "d-flex justify-content-end p-1";

        // Create container
        this.dropdownContainer = document.createElement("div");
        this.dropdownContainer.classList.add("dropdown");

        // Create three-dots button
        this.threeDotsMenu = document.createElement("button");
        this.threeDotsMenu.className = `btn btn-sm dropdown-toggle no-after p-0`;
        this.threeDotsMenu.style.color = "inherit";
        this.threeDotsMenu.type = "button";
        this.threeDotsMenu.dataset.bsToggle = "dropdown";
        this.threeDotsMenu.setAttribute("aria-haspopup", "true");
        this.threeDotsMenu.setAttribute("aria-expanded", "false");
        this.threeDotsMenu.innerHTML = "<i class='bi bi-three-dots-vertical'></i>";

        // Create dropdown menu
        this.dropdownMenu = document.createElement("div");
        this.dropdownMenu.classList.add("dropdown-menu");

        // Add menu items
        this.menuItems.forEach((item) => {
            const menuItem = document.createElement("a");
            menuItem.classList.add("dropdown-item");
            menuItem.href = "#";
            menuItem.innerHTML = item.icon ? `<i class='bi ${item.icon} me-2'></i>${item.label}` : item.label;
            menuItem.addEventListener("click", (event) => {
                console.log("Clicked on menu item");
                event.preventDefault();
                item.action();
            });
            this.dropdownMenu.appendChild(menuItem);
        });

        // Append elements
        this.dropdownContainer.appendChild(this.threeDotsMenu);
        this.dropdownContainer.appendChild(this.dropdownMenu);
        this.elementColumn.appendChild(this.dropdownContainer);
    }
}

export function paymentBrandToSource(type) {
    switch (type) {
        default:
            return "0";
        case "visa":
            return "1";
        case "mastercard":
            return "2";
        case "maestro":
            return "3";
        case "cirrus":
            return "4";
        case "paypal":
            return "5";
        case "western_union":
            return "6";
        case "visa_electron":
            return "7";
        case "amazon_pay":
            return "8";
        case "worldpay":
            return "9";
        case "diners_club":
            return "10";
        case "google_pay":
            return "11";
        case "skrill":
            return "12";
        case "sage_pay":
            return "13";
        case "discover":
            return "14";
        case "skrill_moneybookers":
            return "15";
        case "jcb":
            return "16";
        case "ebay":
            return "17";
        case "eway":
            return "18";
        case "direct-debit":
            return "21";
        case "amex":
            return "22";
        case "shopify":
            return "23";
    }
}

export class PaymentMethod {
    constructor() {
        // Create a container with card styling
        this.container = document.createElement("div");
        this.container.classList.add("payment-method");
        // Updated inline styles for a modern credit card look
        Object.assign(this.container.style, {
            padding: "20px",
            marginBottom: "16px",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            background: "linear-gradient(135deg,rgb(245, 245, 247),rgb(203, 203, 203))",
            maxWidth: "300px",
            width: "100%",
            "aspect-ratio": "27/17",
        });

        // Create header for "Name on File"
        this.nameOnFile = document.createElement("h5");
        this.nameOnFile.classList.add("payment-name-header");
        this.nameOnFile.innerText = "Name on File";
        // Updated header styles
        Object.assign(this.nameOnFile.style, {
            marginBottom: "12px",
            fontWeight: "bold",
            fontSize: "1.3rem",
        });

        // Create an image element for the card brand icon
        this.icon = document.createElement("img");
        this.icon.classList.add("payment-icon");
        // Updated icon styles
        Object.assign(this.icon.style, {
            height: "40px",
            width: "auto",
            objectFit: "contain",
        });

        // Create element to display a masked card number (last four digits)
        this.snippet = document.createElement("span");
        this.snippet.classList.add("payment-snippet");
        // Updated snippet styles
        Object.assign(this.snippet.style, {
            display: "block",
            marginBottom: "8px",
            fontSize: "1.2rem",
            letterSpacing: "2px",
            fontWeight: "bold",
        });

        // Create element to show the card's expiration date
        this.expiration = document.createElement("span");
        this.expiration.classList.add("payment-expiration");
        // Updated expiration styles
        Object.assign(this.expiration.style, {
            display: "block",
            marginBottom: "4px",
            fontSize: "0.95rem",
        });

        // Create element to show the last updated date
        this.updated = document.createElement("span");
        this.updated.classList.add("payment-updated");
        // Updated last updated text styles
        Object.assign(this.updated.style, {
            display: "block",
            fontSize: "0.85rem",
            color: "#555",
            marginTop: "4px",
            textAlign: "right",
        });

        // Create a new container for the bottom row: updated text on the left and logo on the right
        const bottomRow = document.createElement("div");
        Object.assign(bottomRow.style, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
        });
        // Append the updated text and the logo (icon) into the bottom row
        bottomRow.appendChild(this.updated);
        bottomRow.appendChild(this.icon);

        // Append all elements to the container
        this.container.append(this.nameOnFile, this.snippet, this.expiration, bottomRow);
    }

    /**
     * Updates the component using a provided payment method object.
     * If the payment method type is "card", it displays the card details.
     * Otherwise, it shows "Unknown" for each field.
     * @param {object} paymentMethod - A Stripe payment method object.
     */
    update(paymentMethod = examplePaymentMethods.paymentMethods[0]) {
        // Update the cardholder's name
        this.nameOnFile.innerText = paymentMethod.billing_details?.name || "Unknown Holder";

        // If the payment method is a card and details exist
        if (paymentMethod.type === "card" && paymentMethod.card) {
            this.icon.src = `/protected/images/payment-methods/${paymentBrandToSource(paymentMethod.card.brand)}.png`;
            this.icon.alt = paymentMethod.card.brand || "Card";
            // Masked card number (last four digits)
            this.snippet.innerText = `•••• ${paymentMethod.card.last4 || "XXXX"}`;
            // Expiration date with fallbacks

            // Format expiration so it says e.g. "Expires: 02/42" instead of "2/2042"
            const expMonth = ("0" + paymentMethod.card.exp_month).slice(-2);
            const expYear = ("" + paymentMethod.card.exp_year).slice(-2);
            this.expiration.innerText = `${expMonth}/${expYear}`; // Convert creation timestamp to date and format
            const updatedDate = new Date((paymentMethod.created || Date.now()) * 1000);
            this.updated.innerText = `Updated: ${updatedDate.toLocaleDateString()}`;
        } else {
            // For non-card types or missing details, show fallback text
            this.icon.src = "";
            this.icon.alt = "Unknown";
            this.snippet.innerText = "Unknown";
            this.expiration.innerText = "Unknown";
            this.updated.innerText = "Unknown";
        }
    }
}

export class Headshot {
    /**
     * @param {object} options
     * @param {string} [options.src] - The source URL for the headshot image
     * @param {string} [options.size='3rem'] - The size of the headshot (width and height)
     * @param {string} [options.borderColor] - The color of the border
     * @param {string} [options.backgroundColor] - The background color
     * @param {string} [options.defaultIcon='bi-person-fill'] - The default icon to show when no image is available
     */
    constructor(options = {}) {
        const { src, size = "3rem", borderColor, backgroundColor = "var(--bs-light)", defaultIcon = "bi-person-fill" } = options;

        // Create container
        this.container = document.createElement("div");
        this.container.classList.add("rounded-circle");
        this.container.style.width = size;
        this.container.style.height = size;
        this.container.style.overflow = "hidden";
        this.container.style.flexShrink = "0";
        this.container.style.position = "relative";
        this.container.style.display = "flex";
        this.container.style.justifyContent = "center";
        this.container.style.alignItems = "center";
        this.container.style.backgroundColor = backgroundColor;

        if (borderColor) {
            this.container.style.border = `2px solid ${borderColor}`;
        }

        // Create default icon
        this.defaultIcon = document.createElement("i");
        this.defaultIcon.className = `bi ${defaultIcon} d-flex`;
        this.defaultIcon.style.color = "black";
        this.defaultIcon.style.fontSize = "1.5rem";
        this.defaultIcon.style.position = "absolute";
        this.defaultIcon.style.zIndex = "0";
        this.container.appendChild(this.defaultIcon);

        // Create image
        this.image = document.createElement("img");
        this.image.classList.add("w-100", "h-100");
        this.image.style.objectFit = "cover";
        this.image.style.position = "absolute";
        this.image.style.top = "0";
        this.image.style.left = "0";
        this.image.style.zIndex = "1";
        this.image.style.display = src ? "block" : "none";
        if (src) {
            this.image.src = src;
        }
        this.image.alt = "Headshot";
        this.container.appendChild(this.image);
    }

    /**
     * Updates the headshot image source
     * @param {string} src - The new image source URL
     */
    updateImage(src) {
        if (src) {
            this.image.src = src;
            this.image.style.display = "block";
        } else {
            this.image.style.display = "none";
        }
    }

    /**
     * Updates the border color
     * @param {string} color - The new border color
     */
    updateBorderColor(color) {
        this.container.style.border = `2px solid ${color}`;
    }

    /**
     * Updates the background color
     * @param {string} color - The new background color
     */
    updateBackgroundColor(color) {
        this.container.style.backgroundColor = color;
    }
}

/**
 * @typedef {Object} StatBrainOptions
 * @property {string} value - The numeric value to display
 * @property {string} label - The text label below the value
 * @property {string} [borderColor='#0d6efd'] - The brain border color (CSS color)
 * @property {string} [textColor='inherit'] - The text color (CSS color)
 * @property {string} [containerClass='col-md-3 col-6'] - Bootstrap column classes
 * @property {string} [valuePrefix=''] - Prefix to show before the value (e.g. '$')
 * @property {string} [valueSuffix=''] - Suffix to show after the value (e.g. '+')
 * @property {number} [animationDuration=2000] - Duration of count-up animation in ms
 */

export class StatBrain {
    /** @type {HTMLDivElement} */
    element;
    /** @type {HTMLDivElement} */
    brainElement;
    /** @type {HTMLDivElement} */
    valueElement;
    /** @type {HTMLDivElement} */
    labelElement;
    /** @type {number|string} */
    targetValue;
    /** @type {boolean} */
    hasAnimated = false;

    /**
     * @param {StatBrainOptions} options
     */
    constructor(options) {
        // Handle both string and number values
        const value = options.value;
        // Proper type checking for numeric values
        const isNumeric = typeof value === "number" || (typeof value === "string" && !isNaN(Number(value)) && isFinite(Number(value)));
        this.targetValue = isNumeric ? Number(value) : value;

        // Create main container
        this.element = document.createElement("div");
        this.element.className = options.containerClass || "col-md-3 col-6";

        // Create brain container
        this.brainElement = document.createElement("div");
        this.brainElement.className = "stat-brain-container text-center mb-3";

        // Create the brain display
        const brain = document.createElement("div");
        brain.className = "stat-brain d-flex flex-column align-items-center justify-content-center";
        brain.style.color = options.textColor || "inherit";
        brain.setAttribute("data-label", options.label); // Add data-label attribute

        // Set brain outline color using predefined classes
        const brainColor = options.borderColor || "#0d6efd";

        // Map colors to predefined CSS classes
        if (brainColor === "#0d6efd" || brainColor.toLowerCase() === "#0d6efd") {
            brain.classList.add("brain-blue");
        } else if (brainColor === "#198754" || brainColor.toLowerCase() === "#198754") {
            brain.classList.add("brain-green");
        } else if (brainColor === "#ffc107" || brainColor.toLowerCase() === "#ffc107") {
            brain.classList.add("brain-yellow");
        } else if (brainColor === "#dc3545" || brainColor.toLowerCase() === "#dc3545") {
            brain.classList.add("brain-red");
        } else if (brainColor === "#fd7e14" || brainColor.toLowerCase() === "#fd7e14") {
            brain.classList.add("brain-orange");
        } else {
            // Default to blue for unknown colors
            brain.classList.add("brain-blue");
            console.warn("Unknown brain color:", brainColor, "- using default blue");
        }

        // Create value display
        this.valueElement = document.createElement("div");
        this.valueElement.className = "stat-value h2 mb-0";
        this.valueElement.textContent = isNumeric ? "0" : String(value);
        if (options.valuePrefix) this.valueElement.prepend(options.valuePrefix);
        if (options.valueSuffix) this.valueElement.append(options.valueSuffix);

        // Create label
        this.labelElement = document.createElement("div");
        this.labelElement.className = "stat-label";
        this.labelElement.textContent = options.label;

        // Assemble the component
        brain.appendChild(this.valueElement);
        brain.appendChild(this.labelElement);
        this.brainElement.appendChild(brain);
        this.element.appendChild(this.brainElement);

        // Add intersection observer for animation
        this.setupIntersectionObserver(options.animationDuration || 2000);
    }

    /**
     * Sets up the intersection observer for animation
     * @param {number} duration - Animation duration in milliseconds
     */
    setupIntersectionObserver(duration) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.hasAnimated = true;
                        if (typeof this.targetValue === "number") {
                            this.animateValue(0, this.targetValue, duration);
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(this.element);
    }

    /**
     * Animates the value counting up
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} duration - Animation duration in milliseconds
     */
    animateValue(start, end, duration) {
        if (typeof end !== "number") return;

        const range = end - start;
        const minFrame = 16;
        const frameCount = Math.min(duration / minFrame, range);
        const increment = range / frameCount;
        let current = start;
        let frame = 0;

        const animate = () => {
            current += increment;
            frame++;

            const value = Math.floor(current);
            this.valueElement.textContent = value.toLocaleString();

            if (frame < frameCount) {
                requestAnimationFrame(animate);
            } else {
                this.valueElement.textContent = end.toLocaleString();
            }
        };

        animate();
    }
}
