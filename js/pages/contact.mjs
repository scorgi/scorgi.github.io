/** @typedef {import ("../../types/forms.d.ts").FormScorgiInterest} FormScorgiInterest */

import * as containers from "../ui/containers.mjs";
import * as components from "../ui/components.mjs";
import { MARKETING } from "../config/marketing.mjs";
import { getCampaign, initMarketingEvents, track } from "../ui/marketing-events.mjs";

initMarketingEvents();
let selectedRole = "";

const divFormContainer = /** @type {HTMLDivElement} */ (document.querySelector("#divFormContainer"));
const divButtonContainer = /** @type {HTMLDivElement} */ (document.querySelector("#divButtonContainer"));
const divButtonContainerRow = document.createElement("div");
divButtonContainerRow.classList.add("row", "g-3");
divButtonContainer.appendChild(divButtonContainerRow);

const divTrustedByContainer = /** @type {HTMLElement} */ (document.querySelector("#divTrustedByContainer"));
const divFormSubmittedContainer = /** @type {HTMLElement} */ (document.querySelector("#divFormSubmittedContainer"));

const roleSection = /** @type {HTMLElement} */ (document.querySelector("#roleSection"));
const formSection = /** @type {HTMLElement} */ (document.querySelector("#formSection"));

let row = document.createElement("div");
row.classList.add("row");
divFormContainer.appendChild(row);

const buttonBack = new components.InputElementButton(undefined, { text: "Go Back" });
buttonBack.elementInput.addEventListener("click", () => {
    formSwap();
});
buttonBack.elementInput.classList.add("btn-secondary");
row.appendChild(buttonBack.elementColumn);

const groupForm = new containers.InputGroupObject({ label: undefined, required: false, collapsible: false });
groupForm.elementColumn.style.fontFamily = "'DM Sans', sans-serif";
row.appendChild(groupForm.elementColumn);

groupForm.attachInput("nameFirst", new components.InputElementString({ label: "First Name", required: true }));
groupForm.attachInput("nameLast", new components.InputElementString({ label: "Last Name", required: true }));
groupForm.attachInput("jobTitle", new components.InputElementString({ label: "Job Title", required: false }));
const inputStudents = new components.InputElementNumber({ label: "Students", required: false });
groupForm.attachInput("students", inputStudents);
const groupCompany = new containers.InputGroupObject({ label: "Company / School", required: false, collapsible: true });
groupForm.attachInput("company", groupCompany);
groupCompany.attachInput("name", new components.InputElementString({ label: "Name", required: false }));
groupCompany.attachInput("address", new components.InputElementString({ label: "Address", required: false }));
groupCompany.attachInput("description", new components.InputElementText({ label: "Description", required: false }));
groupForm.attachInput("email", new components.InputElementString({ label: "Email", required: true }));
groupForm.attachInput("phone", new components.InputElementString({ label: "Phone", required: true }));
groupForm.attachInput("billing", new components.InputElementText({ label: "Billing Address", required: false }));
groupForm.attachInput("message", new components.InputElementText({ label: "Message", required: false }));

const submitButton = new components.InputElementButton(undefined, { text: "Submit" });
submitButton.elementInput.addEventListener("click", () => {
    if (!groupForm.validate().valid) {
        return;
    }

    /** @type {FormScorgiInterest} */
    const bodyForm = groupForm.get();

    const formResponse = {
        fullname: bodyForm.nameFirst + " " + bodyForm.nameLast,
        email: bodyForm.email,
        phone: bodyForm.phone,
        companyName: bodyForm.company.name,
        companyDoes: bodyForm.company.description,
        jobTitle: bodyForm.jobTitle,
        studentCount: bodyForm.students,
        address: bodyForm.company.address,
        billingAddress: bodyForm.billing,
        message: bodyForm.message,
    };

    const bodySubmit = {
        formResponse,
    };

    formResponse.role = selectedRole;
    const campaign = getCampaign();
    track("demo_form_submit", { mode: MARKETING.leadEndpoint ? "endpoint" : "email" });

    // No verified lead endpoint yet: hand the request to the visitor's email app
    // instead of posting to a URL that silently drops it.
    if (!MARKETING.leadEndpoint) {
        openEmailFallback(formResponse, campaign);
        return;
    }

    submitButton.spin();

    fetch(MARKETING.leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bodySubmit, campaign }),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Network response was not ok.");
            }
        })
        .then((data) => {
            if (data?.success !== true) throw new Error("Submission not confirmed.");
            submitButton.success();
            track("demo_request_received", { mode: "endpoint" });
            // Show success message, hide form
            if (formSection) formSection.classList.add("d-none");
            if (divFormSubmittedContainer) divFormSubmittedContainer.classList.remove("d-none");
        })
        .catch((error) => {
            submitButton.failure();
            console.error("Error:", error);
            track("demo_form_error", { reason: "delivery_unconfirmed" });
            openEmailFallback(formResponse, campaign);
        });
});
submitButton.elementInput.classList.add("btnGradient");
submitButton.elementInput.classList.remove("mt-4");
submitButton.elementInput.classList.add("mt-0");

row.appendChild(submitButton.elementColumn);
groupForm.setColumnLayout([6, 6, 8, 4, 12, 6, 6, 12, 12, 12]);

const formStatus = document.createElement("div");
formStatus.id = "demo-form-status";
formStatus.className = "col-12 mt-3";
formStatus.setAttribute("role", "status");
row.appendChild(formStatus);

/**
 * Open a pre-filled email to the sales inbox and explain the step to the visitor.
 * @param {Record<string, unknown>} formResponse
 * @param {Record<string, string>} campaign
 */
function openEmailFallback(formResponse, campaign) {
    const lines = [
        "Scorgi demo request",
        "",
        ...Object.entries(formResponse)
            .filter(([, value]) => value !== undefined && value !== null && !["", "NaN"].includes(String(value).trim()))
            .map(([key, value]) => `${key}: ${value}`),
        ...Object.entries(campaign).map(([key, value]) => `${key}: ${value}`),
    ];
    const body = lines.join("\n");
    const href = `mailto:${MARKETING.salesEmail}?subject=${encodeURIComponent("Scorgi demo request")}&body=${encodeURIComponent(body)}`;

    formStatus.innerHTML = "";
    const card = document.createElement("div");
    card.className = "alert alert-success mb-0";
    card.innerHTML = `<strong>Almost done: send the email to finish your request.</strong>
        <p class="mb-2 mt-1">Your email app should open with your details filled in. Press send and our team will reply to arrange your demo.</p>`;
    const open = document.createElement("a");
    open.className = "btn btnGradient btn-sm me-2";
    open.href = href;
    open.textContent = "Open email";
    open.addEventListener("click", () => track("demo_email_open", { mode: "email" }));
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "btn btn-outline-secondary btn-sm";
    copy.textContent = `Copy details for ${MARKETING.salesEmail}`;
    copy.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(body);
            copy.textContent = "Copied";
            track("demo_email_copy", { mode: "email" });
        } catch {
            copy.textContent = `Email ${MARKETING.salesEmail}`;
        }
    });
    card.append(open, copy);
    formStatus.appendChild(card);
    formStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    window.location.href = href;
}

let formVisible = false;

function formSwap() {
    if (!formVisible) {
        // Show form section, hide role section
        formVisible = true;
        if (roleSection) roleSection.classList.add("d-none");
        if (divTrustedByContainer) divTrustedByContainer.classList.add("d-none");
        if (formSection) {
            formSection.classList.remove("d-none");
            formSection.style.opacity = "0";
            formSection.style.transform = "translateY(-12px)";
            setTimeout(() => {
                formSection.style.opacity = "1";
                formSection.style.transform = "translateY(0)";
            }, 10);
        }
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        // Hide form section, show role section
        formVisible = false;
        if (formSection) {
            formSection.style.opacity = "0";
            formSection.style.transform = "translateY(-12px)";
            setTimeout(() => {
                formSection.classList.add("d-none");
                formSection.style.opacity = "1";
                formSection.style.transform = "translateY(0)";
                if (roleSection) roleSection.classList.remove("d-none");
                if (divTrustedByContainer) divTrustedByContainer.classList.remove("d-none");
            }, 200);
        }
    }
}

class buttonIAmA {
    /**
     * @param {"Company" | "Administrator" | "Admissions" | "Educator" | "Student"} dataRole
     * @param {string} text
     * @param {string} icon - Bootstrap icon class
     */
    constructor(dataRole, text, icon) {
        this.col = document.createElement("div");
        this.col.classList.add("col-md-6", "col-12");
        divButtonContainerRow.appendChild(this.col);

        this.button = document.createElement("button");
        this.button.classList.add("btn", "btn-form-option");
        this.col.appendChild(this.button);

        // Icon
        const iconEl = document.createElement("div");
        iconEl.className = "btn-form-option-icon";
        const i = document.createElement("i");
        i.className = `bi ${icon}`;
        iconEl.appendChild(i);
        this.button.appendChild(iconEl);

        // Text
        const textEl = document.createElement("span");
        textEl.className = "btn-form-option-text";
        textEl.textContent = text;
        this.button.appendChild(textEl);

        this.button.addEventListener("click", () => {
            selectedRole = dataRole;
            track("demo_form_start", { placement: dataRole });
            formSwap();

            if (dataRole === "Company" || dataRole === "Administrator" || dataRole === "Admissions") {
                groupCompany.elementColumn.classList.remove("d-none");
            } else {
                groupCompany.elementColumn.classList.add("d-none");
            }

            if (dataRole !== "Student") {
                inputStudents.elementColumn.classList.remove("d-none");
            } else {
                inputStudents.elementColumn.classList.add("d-none");
            }
        });
    }
}

new buttonIAmA("Company", "Company or School", "bi-building");
new buttonIAmA("Educator", "Educator", "bi-person-workspace");
new buttonIAmA("Administrator", "Administrator", "bi-shield-lock");
new buttonIAmA("Admissions", "Admissions Professional", "bi-clipboard-check");
new buttonIAmA("Student", "Student or Parent", "bi-mortarboard");
