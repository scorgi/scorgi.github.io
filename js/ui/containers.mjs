// @ts-check

/** @typedef {import("./base.ts").SetResult} SetResult */
/** @typedef {import("./base.ts").BoolOrObjectOfBool<boolean>} BoolOrObjectOfBool */
/** @typedef {import("./base.ts").IGenericInputElementField} IGenericInputElementField */
/** @typedef {import("./base.ts").IGenericInputElement} IGenericInputElement */
/** @typedef {import("./base.ts").InputGroupOptions} InputGroupOptions */
/** @typedef {import("./base.ts").InputGroupArrayOptions} InputGroupArrayOptions */

import * as Shared from "./shared.mjs";
import * as VisualComponents from "./components-visual.mjs";

class InputGroup extends Shared.InputElement {
    /** @type {HTMLDivElement} The outermost element of this input */
    elementContainer;
    /** @type {HTMLDivElement} A row that exists within elementContainer */
    elementContainerRow;
    /** @type {HTMLSpanElement} Element used for displaying collapse state */
    #elementIcon;
    /** @type {HTMLSpanElement} Element used to display the number of child items */
    elementCount;
    /** @type {Map<string, IGenericInputElement> | IGenericInputElement[]} A collection of elements that represent the innards of this group */
    inputs;

    /**
     *
     * @param {InputGroupOptions} [options]
     */
    constructor(options) {
        super(options);

        // column
        this.elementColumn = document.createElement("div");
        this.elementColumn.classList.add("col-12");
        this.elementColumn.appendChild(this.elementLabel);
        // container
        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "mb-3 px-3 py-2 border rounded dataContainer";
        this.elementColumn.appendChild(this.elementContainer);
        if (options?.collapsible === true) {
            // caret icon
            this.#elementIcon = document.createElement("i");
            this.#elementIcon.className = "bi bi-caret-down-fill text-secondary mr-1 me-1";
            // label
            this.elementLabel.style.cursor = "pointer";
            this.elementLabel.prepend(this.#elementIcon);
            this.elementLabel.addEventListener("click", () => {
                this.toggle();
            });
            if (options?.startCollapsed === true) {
                this.collapse();
            }
        }
        if (options?.showCount === true) {
            // count
            this.elementCount = document.createElement("span");
            this.elementCount.className = "ml-1 ms-1 font-italic fst-italic";
            this.elementCount.innerText = "(None)";
            this.elementLabel.appendChild(this.elementCount);
        }
    }

    /**
     * Attempts to check validity of all inputs in this group and update messages
     */
    validate() {
        let valid = true;
        this.inputs.forEach((input) => {
            if (input.validate && typeof input.validate === "function" && input.validate().valid === false) {
                valid = false;
            }
        });
        return { valid, reason: "" };
    }

    /**
     * Clears all validation messages from all inputs in this group
     */
    validationClear() {
        this.inputs.forEach((input) => {
            input.validationClear();
        });
    }

    /**
     * Shows all input elements for this group
     */
    expand() {
        if (!this.#elementIcon) return;

        this.#elementIcon.classList.remove("bi-caret-right-fill");
        this.#elementIcon.classList.add("bi-caret-down-fill");
        this.elementContainer.classList.remove("d-none");
        this.elementContainer.ariaExpanded = "true";
    }

    /**
     * Hides all input elements for this group
     */
    collapse() {
        if (!this.#elementIcon) return;

        this.#elementIcon.classList.remove("bi-caret-down-fill");
        this.#elementIcon.classList.add("bi-caret-right-fill");
        this.elementContainer.classList.add("d-none");
        this.elementContainer.ariaExpanded = "false";
    }

    /**
     * Either expands or collapses the group based on its current state
     */
    toggle() {
        if (!this.#elementIcon) return;

        if (this.elementContainer.classList.contains("d-none")) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    validationMessageUpdate() { }
}

/** @implements {IGenericInputElement} */
export class InputGroupObject extends InputGroup {
    /** @type {Map<string, IGenericInputElement>} */
    inputs = new Map();

    /**
     *
     * @param {InputGroupOptions} [options]
     */
    constructor(options) {
        super(options);

        this.elementContainerRow = document.createElement("div");
        this.elementContainerRow.classList.add("row");
        this.elementContainer.appendChild(this.elementContainerRow);
    }

    /**
     * @param {string} key
     * @param {IGenericInputElement} value
     * @returns {IGenericInputElement}
     */
    attachInput(key, value) {
        this.inputs.set(key, value);
        this.elementContainerRow.appendChild(value.elementColumn);
        this.countUpdate();
        return value;
    }

    /**
     * @param {string} key
     * @param {IGenericInputElement} value
     * @returns {BoolOrObjectOfBool} returns true if the key exists and the value was set
     */
    setInput(key, value) {
        if (this.inputs.has(key)) {
            let input = this.inputs.get(key);
            if (input) {
                return input.set(value);
            } else {
                console.error("Object input not found for key", key);
                return false;
            }
        } else {
            console.warn("Skipping input setting for key", key, "value", value);
            return false;
        }
    }

    /**
     * @param {string} key
     * @returns {IGenericInputElement}
     */
    getKey(key) {
        return this.inputs.get(key)?.get();
    }

    /**
     * @param {Object} value
     */
    set(value) {
        /** @type {SetResult} */
        let result = {};
        Object.keys(value).forEach((key) => {
            result[key] = this.setInput(key, value[key]);
        });
        return result;
    }

    /** @returns {Object} */
    get() {
        let obj = {};
        [...this.inputs.keys()].forEach((key) => {
            obj[key] = this.getKey(key);
        });
        return obj;
    }

    disable() {
        this.inputs.forEach((input) => {
            input.disable();
        });
    }

    enable() {
        this.inputs.forEach((input) => {
            input.enable();
        });
    }

    countUpdate() {
        if (this.elementCount) {
            this.elementCount.innerText = this.inputs.size.toString();
        }
    }

    /**
     * @param {(number | undefined)[]} sizes
     * @returns void
     */
    setColumnLayout(sizes) {
        // assert length of sizes is correct
        if (sizes.length !== [...this.inputs].length) {
            console.error(`Column sizes length does not match expected input length ${[...this.inputs].length}`);
            return;
        }

        [...this.inputs.values()].forEach((input, index) => {
            // remove all col classes
            input.elementColumn.className = input.elementColumn.className.replace(/col-\d+/g, "");
            if (sizes[index] !== undefined) {
                input.elementColumn.classList.add(`col-${sizes[index]}`);
            }
        });
    }

    spin() {
        this.inputs.forEach((input) => {
            input.spin();
        });
    }

    success() {
        this.inputs.forEach((input) => {
            input.success();
        });
    }

    failure() {
        this.inputs.forEach((input) => {
            input.failure();
        });
    }
}

const marginClass = "my-3";

// setup all drag and drop logic for arrays
const dropIndicator = document.createElement("div");
dropIndicator.classList.add("d-none", "rounded", marginClass);
dropIndicator.style.display = "none";
dropIndicator.style.backgroundColor = "#BBB";
// make it show a proper drag icon when hovering the drop indicator
dropIndicator.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
});

/** @typedef {HTMLDivElement & { __input?: IGenericInputElement }} InputRowElement */

/** @type {HTMLDivElement | null} */
let dragRow = null;

/** @type {InputGroupArray | null} */
let dragArray = null;
/** @type {InputGroupArray | null} */
let dropArray = null;

let dragIndex = -1;
let dropIndex = -1;

let arrayReferenceDragged = null;

const hideDraggedShowIndicator = () => {
    if (dragRow === null) return console.error("No card dragged element found when calling this function");

    // hide dragged element
    dragRow.classList.remove("d-flex");
    dragRow.classList.add("d-none");

    // show drop indicator
    dropIndicator.classList.remove("d-none");
    dropIndicator.classList.add("d-flex");
};

// drop if the user releases the mouse anywhere on screen
window.addEventListener("dragend", () => {
    if (dragRow === null) {
        return console.error("No card dragged element found");
    }

    if (dragArray === null) {
        console.error("No drag array found");
        return resetDragAndDrop();
    }

    if (dropArray === null) {
        console.error("No drop array found");
        return resetDragAndDrop();
    }

    if (dragArray !== dropArray && dragArray.type !== dropArray.type) {
        console.error(`Drag array of type (${dragArray.type}) does not match drop array of type (${dropArray.type}).`);
        return resetDragAndDrop();
    }

    if (dragIndex === -1) {
        console.error("No drag index found");
        return resetDragAndDrop();
    }

    if (dropIndex === -1) {
        console.error("No drop index found");
        return resetDragAndDrop();
    }

    if (dragArray === dropArray && dragIndex === dropIndex) {
        //console.log(`Drag and drop indexes are the same (${dragIndex}), no action taken`);
        return resetDragAndDrop();
    }

    // move elements in array
    const splicedElements = dragArray.inputs.splice(dragIndex, 1);
    if (dragArray === dropArray && dragIndex < dropIndex) {
        dropIndex--;
    }
    dropArray.inputs.splice(dropIndex, 0, splicedElements[0]);

    // handle drag array onchange callback
    if (dragArray !== dropArray) {
        dragArray.triggerChangeCallbacks();
    }
    // handle drop array onchange callback
    if (dropArray !== dragArray) {
        dropArray.triggerChangeCallbacks();
    }
    // handle drag and drop array onchange callback (they're the same array)
    if (dragArray === dropArray) {
        dropArray.triggerChangeCallbacks();
    }

    // update internal drag reference
    arrayReferenceDragged.array = dropArray;

    //console.log("Drag reference is now", arrayReferenceDragged);
    //console.log("Drag", dragArray.get(), "Drop", dropArray.get());

    // move element in DOM
    dropIndicator.after(dragRow);

    resetDragAndDrop();
});

/**
 * Reset all drag and drop indicators to their initial display state
 */
function resetDragAndDrop() {
    if (dragRow !== null) {
        dragRow.style.opacity = "";
        dragRow.classList.remove("d-none");
        dragRow.classList.add("d-flex");
        dragRow = null;
    }

    dragArray = null;
    dragIndex = -1;

    dropArray = null;
    dropIndex = -1;

    dropIndicator.classList.remove("d-flex");
    dropIndicator.classList.add("d-none");

    arrayReferenceDragged = null;
}

/** @implements {IGenericInputElement} */
export class InputGroupArray extends InputGroup {
    /** @type {IGenericInputElement[]} */
    inputs = [];
    /** @type {((inputs: IGenericInputElement[]) => void)[]} */
    onChangeCallbacks = [];
    /** @type {boolean} */
    draggable = true;
    /** @type {boolean} */
    removable = true;
    /** @type {string} */
    type = "array";

    /**
     * @param {InputGroupOptions} [options]
     * @param {InputGroupArrayOptions} [array]
     */
    constructor(options, array) {
        super(options);

        this.elementContainer.classList.add("container", "elementContainer");
        this.elementColumn.appendChild(this.elementContainer);

        this.elementContainerAdd = document.createElement("div");
        this.elementContainerAdd.classList.add("d-flex", marginClass);
        this.elementContainer.appendChild(this.elementContainerAdd);

        this.inputButtonAdd = document.createElement("button");
        this.inputButtonAdd.className = "btn btn-sm btn-outline-primary w-100";
        this.inputButtonAdd.innerText = "Add";
        this.inputButtonAdd.addEventListener("click", () => {
            if (!this.addValueFunction) {
                return;
            }
            this.pushInput(this.addValueFunction());
        });
        this.elementContainerAdd.appendChild(this.inputButtonAdd);

        // this listener allows for the addition of an element to an empty array
        this.elementContainer.addEventListener("dragover", (event) => {
            event.preventDefault();

            if (dragArray !== null && dragIndex !== -1 && this.inputs.length === 0) {
                dropArray = this;
                dropIndex = 0;
                this.elementContainerAdd.before(dropIndicator);
                hideDraggedShowIndicator();
            }
        });

        this.type = options?.type ?? "array";
        this.draggable = array?.draggable ?? true;
        this.removable = array?.removable ?? true;

        /** @type {(() => IGenericInputElement) | undefined} */
        this.addValueFunction = undefined;
    }

    /**
     * @param {IGenericInputElement} input
     * @returns {IGenericInputElement}
     */
    pushInput(input) {
        this.inputs.push(input);

        /**
         * @type {{ array: InputGroupArray }}
         * @description Reference to the array for use in event listeners so the array can be accessed even if it changes
         */
        let arrayReference = { array: this };

        this.updateCount();

        // create new row for this input
        let inputRow = document.createElement("div");
        inputRow.classList.add("d-flex", marginClass);
        inputRow.appendChild(input.elementColumn);
        this.elementContainerAdd.before(inputRow);

        /** @type {HTMLDivElement | undefined} */
        let toolColumn;
        if (this.draggable || this.removable) {
            // give room for tool column
            input.elementColumn.classList.remove("col-12");
            input.elementColumn.style.width = "calc(100% - 5rem)";

            // add tool column
            toolColumn = document.createElement("div");
            toolColumn.style.textAlign = "right";
            toolColumn.style.width = "5rem";
            inputRow.appendChild(toolColumn);
        }

        // append remove button
        if (this.removable && toolColumn) {
            let toolRemove = document.createElement("div");
            toolRemove.className = "btn btn-sm btn-outline-danger mt-4";
            const icon = document.createElement("i");
            icon.className = "bi bi-trash3-fill";
            toolRemove.appendChild(icon);
            toolRemove.addEventListener("click", (event) => {
                // if the user is holding control, skip the confirmation
                if (event.ctrlKey || window.confirm("Are you sure you want to remove this element?")) {
                    arrayReference.array.elementContainer.removeChild(inputRow);
                    arrayReference.array.inputs = arrayReference.array.inputs.filter((element) => element !== input);
                    arrayReference.array.updateCount();
                    this.triggerChangeCallbacks();
                }
            });
            toolColumn.appendChild(toolRemove);
        }

        if (this.draggable && toolColumn) {
            let toolGrab = document.createElement("div");
            toolGrab.className = "btn btn-sm btn-outline-secondary mt-4 ml-1 ms-1";
            toolGrab.setAttribute("draggable", "true");
            const icon = document.createElement("i");
            icon.className = "bi bi-grip-vertical";
            toolGrab.appendChild(icon);

            // Add touch event handling
            let touchStartY = 0;
            let touchStartTop = 0;
            let isTouchDragging = false;

            // Handle touch start
            toolGrab.addEventListener("touchstart", (event) => {
                event.preventDefault();
                isTouchDragging = true;
                touchStartY = event.touches[0].clientY;
                touchStartTop = inputRow.offsetTop;

                // Initialize drag state
                inputRow.style.opacity = "0.4";
                dragRow = inputRow;

                let w = inputRow.offsetWidth;
                let h = inputRow.offsetHeight;

                // Update phantom card
                dropIndicator.style.width = w + "px";
                dropIndicator.style.height = h + "px";

                inputRow.after(dropIndicator);

                dragArray = arrayReference.array;
                dragIndex = arrayReference.array.inputs.indexOf(input);

                if (dragIndex === -1) {
                    console.error("Drag index not found");
                }

                dropArray = arrayReference.array;
                dropIndex = dragIndex;

                arrayReferenceDragged = arrayReference;
            });

            // Handle touch move
            document.addEventListener(
                "touchmove",
                (event) => {
                    if (!isTouchDragging) return;
                    event.preventDefault();

                    const touch = event.touches[0];
                    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
                    /** @type {InputRowElement | undefined} */
                    const targetRow = /** @type {InputRowElement | undefined} */ (elements.find((el) => el instanceof HTMLDivElement && el.classList.contains("d-flex") && el.classList.contains(marginClass)));

                    if (targetRow && targetRow !== dragRow && targetRow.__input) {
                        const rect = targetRow.getBoundingClientRect();
                        const relativeY = touch.clientY - rect.top;
                        const isOnTopHalf = relativeY < rect.height / 2;

                        if (isOnTopHalf) {
                            targetRow.before(dropIndicator);
                            dropArray = arrayReference.array;
                            dropIndex = dropArray.inputs.indexOf(targetRow.__input);
                        } else {
                            targetRow.after(dropIndicator);
                            dropArray = arrayReference.array;
                            dropIndex = dropArray.inputs.indexOf(targetRow.__input) + 1;
                        }
                        hideDraggedShowIndicator();
                    }
                },
                { passive: false }
            );

            // Handle touch end
            document.addEventListener("touchend", () => {
                if (!isTouchDragging) return;
                isTouchDragging = false;

                // Trigger the dragend event to reuse existing drop logic
                window.dispatchEvent(new Event("dragend"));
            });

            // Keep existing mouse drag event
            toolGrab.addEventListener("dragstart", (event) => {
                // dull the element being dragged
                inputRow.style.opacity = "0.4";
                dragRow = inputRow;

                let w = inputRow.offsetWidth;
                let h = inputRow.offsetHeight;

                // update the phantom card
                dropIndicator.style.width = w + "px";
                dropIndicator.style.height = h + "px";

                inputRow.after(dropIndicator);

                dragArray = arrayReference.array;
                dragIndex = arrayReference.array.inputs.indexOf(input);

                if (dragIndex === -1) {
                    console.error("Drag index not found");
                }

                dropArray = arrayReference.array;
                dropIndex = dragIndex;

                arrayReferenceDragged = arrayReference;

                // @ts-expect-error
                event.dataTransfer.setDragImage(inputRow, w / 2, h / 2);
            });
            toolColumn.appendChild(toolGrab);

            // Store input reference for touch events
            /** @type {InputRowElement} */ (inputRow).__input = input;

            inputRow.addEventListener("dragover", (event) => {
                event.preventDefault();

                // Prevent an element of the wrong type from showing the drop indicator
                if (dragArray && dragArray.type !== this.type) {
                    event.stopPropagation();
                    return;
                }

                if (dragRow === null) return console.error("No card dragged element found");

                // Prevent the element from displacing itself
                if (dragRow === inputRow) return;

                /** The height of either the original dragged card or the phantom card since only one will be visible at any moment */
                let heightOfDraggedCard = Math.max(dropIndicator.clientHeight, dragRow.clientHeight);
                /** The difference in height between the card being displaced and the card being dragged (displaced - dragged) */
                let signedHeightDifference = inputRow.clientHeight - heightOfDraggedCard;
                /** The y position of the mouse relative to the top of the displaced card */
                let relativeY = event.clientY - inputRow.getBoundingClientRect().top;

                const isOnTopHalf = relativeY < inputRow.clientHeight / 2;

                if (signedHeightDifference < 0) {
                    // the card being dragged is larger than the card being displaced
                    if (isOnTopHalf) {
                        inputRow.before(dropIndicator);
                        dropArray = arrayReference.array;
                        dropIndex = dropArray.inputs.indexOf(input);
                        hideDraggedShowIndicator();
                    } else {
                        inputRow.after(dropIndicator);
                        dropArray = arrayReference.array;
                        dropIndex = dropArray.inputs.indexOf(input) + 1;
                        hideDraggedShowIndicator();
                    }
                } else {
                    // the card being dragged is smaller than the card being displaced
                    if (isOnTopHalf && relativeY < heightOfDraggedCard) {
                        inputRow.before(dropIndicator);
                        dropArray = arrayReference.array;
                        dropIndex = dropArray.inputs.indexOf(input);
                        hideDraggedShowIndicator();
                    } else if (!isOnTopHalf && relativeY > inputRow.clientHeight - heightOfDraggedCard) {
                        inputRow.after(dropIndicator);
                        dropArray = arrayReference.array;
                        dropIndex = dropArray.inputs.indexOf(input) + 1;
                        hideDraggedShowIndicator();
                    }
                }

                event.stopPropagation();
            });
        }

        this.triggerChangeCallbacks();

        return input;
    }

    /**
     * @param {Array} array
     * @returns {boolean} returns true if the array was set
     */
    set(array) {
        this.clear();

        if (!this.addValueFunction) {
            console.error("No addValueFunction defined for InputGroupArray");
            return false;
        }

        for (let i = 0; i < array.length; i++) {
            let newInput = this.addValueFunction();
            newInput.set(array[i]);
            this.pushInput(newInput);
        }

        return true;
    }

    clear() {
        for (let i = this.inputs.length - 1; i >= 0; i--) {
            let value = this.inputs[i].elementColumn.parentElement;
            if (value !== null) {
                this.elementContainer.removeChild(value);
            }
            delete this.inputs[i];
        }

        this.inputs = [];
        this.updateCount();
        this.triggerChangeCallbacks();
    }

    get() {
        return this.inputs.map((input) => input.get());
    }

    disable() {
        this.inputButtonAdd.disabled = true;
        this.inputButtonAdd.classList.add("disabled");
        this.inputs.forEach((input) => {
            input.disable();
        });
    }

    enable() {
        this.inputButtonAdd.disabled = false;
        this.inputButtonAdd.classList.remove("disabled");
        this.inputs.forEach((input) => {
            input.enable();
        });
    }

    /**
     * @param {(number | undefined)[]} sizes
     * @returns void
     */
    setColumnLayout(sizes) {
        // assert length of sizes is correct
        if (sizes.length !== this.inputs.length) {
            console.error(`Column sizes length does not match expected input length ${this.inputs.length}`);
            return;
        }

        this.inputs.forEach((input, index) => {
            // remove all col classes
            input.elementColumn.className = input.elementColumn.className.replace(/col-\d+/g, "");
            if (sizes[index] !== undefined) {
                input.elementColumn.classList.add(`col-${sizes[index]}`);
            }
        });
    }

    updateCount() {
        if (this.elementCount) {
            this.elementCount.innerText = this.inputs.length.toString();
        }
    }

    spin() {
        this.inputs.forEach((input) => {
            input.spin();
        });
    }

    success() {
        this.inputs.forEach((input) => {
            input.success();
        });
    }

    failure() {
        this.inputs.forEach((input) => {
            input.failure();
        });
    }

    /**
     * @description Attaches an event callback for when the elements of this array are reordered, added, or removed
     * @param {(inputs: IGenericInputElement[]) => void} callback
     */
    addOnChange(callback) {
        this.onChangeCallbacks.push(callback);
    }

    /**
     * @description Calls all event callbacks for when the elements of this array are reordered, added, or removed
     */
    triggerChangeCallbacks() {
        this.onChangeCallbacks.forEach((callback) => {
            callback(this.inputs);
        });
    }

    validate() {
        let valid = true;
        this.inputs.forEach((input) => {
            if (input.validate && typeof input.validate === "function" && input.validate().valid === false) {
                valid = false;
            }
        });
        return { valid, reason: "" };
    }

    validationClear() {
        this.inputs.forEach((input) => {
            input.validationClear();
        });
    }

    validationMessageUpdate() {
        // Implementation for validationMessageUpdate
    }

    required = false;
}

/** Collapsible Container with clickable header toggle */
export class Collapse extends Shared.InputElement {
    /** @type {HTMLDivElement} */
    elementContainer;
    /** @type {HTMLDivElement} */
    elementContent;
    /** @type {HTMLSpanElement} */
    elementIcon;

    /**
     *
     * @param {InputGroupOptions} [options]
     */
    constructor(options) {
        super(options);

        // column
        this.elementColumn = document.createElement("div");
        this.elementColumn.classList.add("col-12");
        this.elementColumn.appendChild(this.elementLabel);
        // container
        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "mb-3 px-3 py-2 border rounded dataContainer";
        this.elementColumn.appendChild(this.elementContainer);
        // content
        this.elementContent = document.createElement("div");
        this.elementContainer.appendChild(this.elementContent);
        // caret icon
        this.elementIcon = document.createElement("i");
        this.elementIcon.className = "bi bi-caret-down-fill text-secondary mr-1 me-1";
        // label
        this.elementLabel.style.cursor = "pointer";
        this.elementLabel.prepend(this.elementIcon);
        this.elementLabel.addEventListener("click", () => {
            this.toggle();
        });
        if (options?.startCollapsed === true) {
            this.collapse();
        }
    }

    get() {
        return undefined;
    }

    expand() {
        this.elementIcon.classList.remove("bi-caret-right-fill");
        this.elementIcon.classList.add("bi-caret-down-fill");
        this.elementContainer.classList.remove("d-none");
        this.elementContainer.ariaExpanded = "true";
    }

    collapse() {
        this.elementIcon.classList.remove("bi-caret-down-fill");
        this.elementIcon.classList.add("bi-caret-right-fill");
        this.elementContainer.classList.add("d-none");
        this.elementContainer.ariaExpanded = "false";
    }

    toggle() {
        if (this.elementContainer.classList.contains("d-none")) {
            this.expand();
        } else {
            this.collapse();
        }
    }
}

/** @implements {IGenericInputElement} */
export class InputGroupMultiSelect extends InputGroup {
    /** @type {IGenericInputElement[]} */
    inputs = [];

    /**
     * @param {InputGroupOptions} [options]
     */
    constructor(options) {
        super(options);

        /** Matches the size of inputs and indicates which values are currently selected */
        this.selected = [];

        this.elementContainer.classList.add("container", "elementContainer");
        this.elementColumn.appendChild(this.elementContainer);

        this.onchangeCallback = () => { };

        /**
         * @type {undefined | (() => IGenericInputElement)}
         */
        this.addValueFunction = undefined;
    }

    /**
     * @param {IGenericInputElement} input
     * @returns {IGenericInputElement}
     */
    pushInput(input) {
        this.inputs.push(input);

        // create new row for this input
        let inputRow = document.createElement("div");
        inputRow.classList.add("d-flex", marginClass);
        inputRow.appendChild(input.elementColumn);
        this.elementContainer.appendChild(inputRow);

        // give room for tool column
        input.elementColumn.classList.remove("col-12");
        input.elementColumn.style.width = "calc(100% - 80px)";

        // add checkbox column
        this.checkboxColumn = document.createElement("div");
        this.checkboxColumn.style.textAlign = "right";
        this.checkboxColumn.style.width = "80px";
        inputRow.appendChild(this.checkboxColumn);

        // append checkbox
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input");

        // add logic for removing input
        checkbox.addEventListener("change", () => {
            let index = this.inputs.indexOf(input);
            this.selected[index] = checkbox.checked;
            this.onchangeCallback();
        });

        this.checkboxColumn.appendChild(checkbox);

        this.onchangeCallback();

        return input;
    }

    /**
     * @param {Array} array
     * @returns {SetResult} returns true if the array was set
     */
    set(array) {
        // @ts-expect-error
        return array.map((value, index) => {
            let input = this.inputs[index];
            if (input) {
                return input.set(value);
            } else {
                console.error("Input not found for index", index);
                return false;
            }
        });
    }

    clear() {
        for (let i = this.inputs.length - 1; i >= 0; i--) {
            this.elementContainer.removeChild(this.inputs[i].elementColumn);
            delete this.inputs[i];
        }
        this.inputs = [];
        this.deleteButtons = [];
        this.columnBreaks = [];

        this.onchangeCallback();
    }

    get() {
        return this.inputs
            .filter((_, index) => {
                return this.selected[index];
            })
            .map((input) => input.get());
    }

    disable() { }

    enable() { }

    spin() {
        this.inputs.forEach((input) => {
            input.spin();
        });
    }

    success() {
        this.inputs.forEach((input) => {
            input.success();
        });
    }

    failure() {
        this.inputs.forEach((input) => {
            input.failure();
        });
    }

    onChange(callback) {
        this.onchangeCallback = callback;
    }
}

// #region Tabs and Panes

export class NavigationBar {
    /** @type {HTMLDivElement} */
    elementColumn;
    /** @type {HTMLUListElement} */
    elementTabContainer;
    /** @type {HTMLDivElement} */
    elementPaneContainer;

    /** @type {Array<{ tab: NavigationTab, pane: NavigationPane }>} */
    inputs = [];

    constructor() {
        this.elementColumn = document.createElement("div");
        this.elementColumn.classList.add("col-12");

        this.elementTabContainer = document.createElement("ul");
        this.elementTabContainer.className = "nav nav-pills flex-column flex-sm-row mb-3";
        this.elementTabContainer.style.backgroundColor = "var(--bs-light, var(--light))";
        this.elementTabContainer.setAttribute("role", "tablist");
        this.elementColumn.appendChild(this.elementTabContainer);

        this.elementPaneContainer = document.createElement("div");
        this.elementPaneContainer.className = "tab-content mb-3";
        this.elementPaneContainer.setAttribute("role", "tablist");
        this.elementColumn.appendChild(this.elementPaneContainer);
    }

    /**
     * @param {NavigationTabOptions} tabOptions
     * @param {NavigationPaneOptions} [paneOptions]
     */
    tabCreate(tabOptions, paneOptions) {
        const input = {
            tab: new NavigationTab(tabOptions),
            pane: new NavigationPane(paneOptions),
        };
        input.tab.elementInput.addEventListener("click", (event) => {
            event.preventDefault();
            this.inputsUpdated();
            input.tab.select();
            input.pane.show();
        });
        this.elementTabContainer.appendChild(input.tab.elementContainer);
        this.elementPaneContainer.appendChild(input.pane.elementContainer);
        this.inputs.push(input);
        return input;
    }

    inputsUpdated() {
        this.inputs.forEach((input) => {
            input.tab.deselect();
            input.pane.hide();
        });
    }
}

/**
 * @typedef {object} NavigationTabOptions
 * @property {string} text - Tab text
 * @property {string} [icon] - Icon class name
 * @property {boolean} [selected=false] - Whether the tab is selected
 */

class NavigationTab {
    /** @type {HTMLLIElement} */
    elementContainer;
    /** @type {HTMLButtonElement} */
    elementInput;

    /**
     * @param {NavigationTabOptions} tab
     */
    constructor(tab) {
        this.elementContainer = document.createElement("li");
        this.elementContainer.className = "nav-item flex-sm-fill text-sm-center";
        this.elementContainer.setAttribute("role", "presentation");

        this.elementInput = document.createElement("button");
        this.elementInput.className = "nav-link w-100";
        if (tab.selected) {
            this.elementInput.classList.add("active");
        }
        this.elementInput.type = "button";
        if (tab.text) {
            this.elementInput.appendChild(document.createTextNode(tab.text));
        }
        if (tab.icon) {
            const icon = document.createElement("i");
            icon.className = tab.icon;
            icon.classList.add("ml-2", "ms-2");
            this.elementInput.appendChild(icon);
        }
        this.elementInput.setAttribute("role", "tab");
        this.elementInput.setAttribute("aria-selected", tab?.selected === true ? "true" : "false");

        this.elementContainer.appendChild(this.elementInput);
    }

    select() {
        this.elementInput.classList.add("active");
        this.elementInput.setAttribute("aria-selected", "true");
    }

    deselect() {
        this.elementInput.classList.remove("active");
        this.elementInput.setAttribute("aria-selected", "false");
    }

    toggle() {
        if (this.elementInput.classList.contains("active")) {
            this.deselect();
        } else {
            this.select();
        }
    }
}

/**
 * @typedef {object} NavigationPaneOptions
 * @property {boolean} active - Whether the pane is active
 */

class NavigationPane {
    /** @type {HTMLDivElement} */
    elementContainer;

    /**
     * @param {NavigationPaneOptions} [pane]
     */
    constructor(pane) {
        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "tab-pane fade p-3";
        if (pane?.active) {
            this.elementContainer.classList.add("show", "active");
        }
        this.elementContainer.setAttribute("role", "tabpanel");
    }

    show() {
        this.elementContainer.classList.add("show", "active");
    }

    hide() {
        this.elementContainer.classList.remove("show", "active");
    }

    toggle() {
        if (this.elementContainer.classList.contains("show")) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// #endregion

/** @implements {IGenericInputElement} */
export class InputWrapperUndefinable {
    /**
     * @param {IGenericInputElement} input
     */
    constructor(input) {
        this.isSetToUndefined = true;
        /** @type {IGenericInputElement} */
        this.input = input;

        let myContainer = document.createElement("div");
        myContainer.classList.add("col-12");
        this.elementContainer = myContainer;

        this.row = document.createElement("div");
        this.row.classList.add("d-flex", marginClass);
        myContainer.appendChild(this.row);

        this.elementColumn = myContainer;
        this.elementLabel = input.elementLabel;

        this.placeHolderContainer = document.createElement("div");
        this.placeHolderContainer.style.width = "calc(100% - 40px)";
        this.row.appendChild(this.placeHolderContainer);

        let label = VisualComponents.createLabel(input.getLabel() ?? "&nbsp;");
        VisualComponents.labelFloat(label);
        this.placeHolderContainer.appendChild(label);

        // create an undefined placeholder
        this.placeholder = document.createElement("div");
        this.placeholder.innerText = "undefined";
        this.placeholder.classList.add("rounded", "text-secondary");
        // this.placeholder.style.fontWeight = "bold";
        this.placeholder.style.textAlign = "center";
        this.placeholder.style.lineHeight = "2.5rem";
        this.placeholder.style.background = Shared.undefinedBackground;
        this.placeholder.style.height = "2.5rem";
        this.placeHolderContainer.appendChild(this.placeholder);

        // give room for tool column
        input.elementColumn.classList.add("rounded", "p-2");
        input.elementColumn.classList.remove("col-12");
        input.elementColumn.style.width = "calc(100% - 40px)";
        input.elementColumn.style.backgroundColor = "white";
        this.row.appendChild(input.elementColumn);

        // add right hand column
        this.rightHandColumn = document.createElement("div");
        this.rightHandColumn.style.textAlign = "right";
        this.rightHandColumn.style.width = "40px";
        this.row.appendChild(this.rightHandColumn);

        // append clear and create button
        this.clearButton = document.createElement("button");
        this.clearButton.classList.add("btn", "btn-sm", "btn-outline-secondary");
        this.clearButton.innerHTML = `<i class="bi bi-trash"></i>`;
        this.clearButton.title = "Mark for deletion";
        this.clearButton.addEventListener("click", () => {
            if (this.isSetToUndefined) {
                this.toggleToDefined();
            } else {
                this.toggleToUndefined();
            }
        });
        this.rightHandColumn.appendChild(this.clearButton);

        // always assume the input is undefined
        this.toggleToUndefined();
    }

    getLabel() {
        return this.input.getLabel();
    }

    toggleToDefined() {
        this.isSetToUndefined = false;
        this.row.removeChild(this.placeHolderContainer);
        this.rightHandColumn.before(this.input.elementColumn);
        this.clearButton.innerHTML = `<i class="bi bi-trash"></i>`;
    }

    toggleToUndefined() {
        this.isSetToUndefined = true;
        this.row.removeChild(this.input.elementColumn);
        this.rightHandColumn.before(this.placeHolderContainer);
        this.clearButton.innerHTML = `<i class="bi bi-plus-lg"></i>`;
    }

    /** @returns {BoolOrObjectOfBool} value */
    set(value) {
        if (value === undefined) {
            this.toggleToUndefined();
            return true;
        } else {
            this.toggleToDefined();
            return this.input.set(value);
        }
    }

    get() {
        if (this.isSetToUndefined) {
            return undefined;
        }
        return this.input.get();
    }

    validate() {
        if (this.isSetToUndefined) {
            return { valid: true, reason: "" };
        }
        return this.input.validate();
    }

    validationClear() {
        this.input.validationClear();
    }

    disable() {
        this.input.disable();
    }

    enable() {
        this.input.enable();
    }

    spin() {
        this.input.spin();
    }

    success() {
        this.input.success();
    }

    failure() {
        this.input.failure();
    }
}
