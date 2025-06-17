/** @typedef {import ("../types/forms.d.ts").FormScorgiInterest} FormScorgiInterest */

import * as containers from "./ui/containers.mjs";
import * as components from "./ui/components.mjs";

const divFormContainer = /** @type {HTMLDivElement} */ (document.querySelector("#divFormContainer"));
const divButtonContainer = /** @type {HTMLDivElement} */ (document.querySelector("#divButtonContainer"));
const divButtonContainerRow = document.createElement("div");
divButtonContainerRow.classList.add("row");
divButtonContainer.appendChild(divButtonContainerRow);

const divTrustedByContainer = /** @type {HTMLDivElement} */ (document.querySelector("#divTrustedByContainer"));

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
groupForm.elementColumn.style.fontFamily = "Fredoka, sans-serif";
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
//groupForm.attachInput("recaptcha", new components.InputElementRecaptcha({ label: "Recaptcha", required: true }));
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
        //role: //
        companyName: bodyForm.company.name,
        companyDoes: bodyForm.company.description,
        jobTitle: bodyForm.jobTitle,
        studentCount: bodyForm.students,
        address: bodyForm.company.address,
        billingAddress: bodyForm.billing,
        message: bodyForm.message,
        //recaptcha: bodyForm.recaptcha,
    };

    const bodySubmit = {
        formResponse,
    };

    submitButton.spin();

    fetch("/form/scorgi/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodySubmit),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Network response was not ok.");
            }
        })
        .then((data) => {
            submitButton.success();
            console.log("Success:", data);
        })
        .catch((error) => {
            submitButton.failure();
            console.error("Error:", error);
        });
});
submitButton.elementInput.classList.add("btnGradient");

row.appendChild(submitButton.elementColumn);
groupForm.setColumnLayout([6, 6, 8, 4, 12, 6, 6, 12, 12, 12]);

function formSwap() {
    if (divFormContainer.classList.contains("d-none")) {
        // show container
        divFormContainer.classList.remove("d-none");
        divFormContainer.style.opacity = "0";
        divFormContainer.style.transform = "translateY(-20px)";
        setTimeout(() => {
            divFormContainer.style.opacity = "1";
            divFormContainer.style.transform = "translateY(0)";
        }, 10);
        divButtonContainer.classList.add("d-none");
        // formText.classList.add("d-none");
        divTrustedByContainer.classList.add("d-none");
    } else {
        // hide container
        divFormContainer.style.opacity = "0";
        divFormContainer.style.transform = "translateY(-20px)";
        setTimeout(() => {
            divFormContainer.classList.add("d-none");
            divFormContainer.style.opacity = "1";
            divFormContainer.style.transform = "translateY(0)";
            divButtonContainer.classList.remove("d-none");
            // formText.classList.remove("d-none");
            divTrustedByContainer.classList.remove("d-none");
        }, 200);
    }
}

class buttonIAmA {
    /**
     * @param {"Company" | "Administrator" | "Admissions" | "Educator" | "Student"} dataRole
     * @param {string} text
     * @param {string} imgSrc
     */
    constructor(dataRole, text, imgSrc) {
        this.col = document.createElement("div");
        this.col.classList.add("col-md-6", "col-12", "px-4", "mb-4");
        divButtonContainerRow.appendChild(this.col);

        this.button = document.createElement("button");
        this.button.classList.add("btn", "btn-form-option");
        this.col.appendChild(this.button);

        this.img = document.createElement("img");
        this.img.classList.add("img-fluid", "mr-2");
        this.img.style.height = "100px";
        this.img.src = imgSrc;
        this.img.alt = "School Icon";

        this.button.appendChild(this.img);
        this.button.appendChild(document.createTextNode(text));

        this.button.addEventListener("click", () => {
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

new buttonIAmA("Company", "I am representing a Company or School", "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Ficons%2Fscorgi%2Fschool-icon.png");
new buttonIAmA("Educator", "I am an Educator", "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Ficons%2Fscorgi%2Ficon-teacher.png");
new buttonIAmA("Administrator", "I am an Administrator", "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Ficons%2Fscorgi%2Fadministrator-icon.png");
new buttonIAmA("Admissions", "I am an Admissions or Testing Professional", "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Ficons%2Fscorgi%2Ficon-admissions.png");
new buttonIAmA("Student", "I am a Student", "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Ficons%2Fscorgi%2Ficon-admissions.png");
