
import { recordService } from "./data.js";

// Get elements from the HTML page
const form = document.getElementById("record-form");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const statusInput = document.getElementById("status");

const recordsContainer = document.getElementById("records-container");
const message = document.getElementById("message");
const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filter-status");
const recordCount = document.getElementById("record-count");

const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-edit");
const formHeading = document.getElementById("form-heading");

let editingId = null;
const originalButtonText = submitButton.textContent;

// Display messages
function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = type;
}

// Clear the form
function clearForm() {
    form.reset();
    editingId = null;

    submitButton.textContent = "Add Request";
    formHeading.textContent = "Add New Support Request";
    cancelButton.hidden = true;
}

// Validate form data
function validateRecord(record) {
    if (record.title.length < 3 || record.title.length > 80) {
        return "Title must contain between 3 and 80 characters.";
    }

    if (record.category.length < 2 || record.category.length > 40) {
        return "Please select a valid category.";
    }

    if (record.description.length < 5 || record.description.length > 300) {
        return "Description must contain between 5 and 300 characters.";
    }

    const allowedStatuses = ["Pending", "In progress", "Completed"];

    if (!allowedStatuses.includes(record.status)) {
        return "Please select a valid status.";
    }

    return null;
}

// Create safe text elements
function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

// Create a record card
function createRecordCard(record) {
    const card = document.createElement("article");
    card.className = "record-card";

    const heading = createTextElement("h3", record.title);
    const id = createTextElement("p", `Record ID: ${record.id}`);
    const category = createTextElement("p", `Category: ${record.category}`);
    const description = createTextElement("p", `Description: ${record.description}`);
    const status = createTextElement("p", `Status: ${record.status}`);

    card.append(heading, id, category, description, status);

    const actions = document.createElement("div");
    actions.className = "record-actions";

    // View button
    const viewButton = createTextElement("button", "View");
    viewButton.type = "button";
    viewButton.className = "view-button";

    viewButton.addEventListener("click", async () => {
        try {
            const item = await recordService.get(record.id);

            alert(
                `REQUEST DETAILS\n\n` +
                `ID: ${item.id}\n` +
                `Title: ${item.title}\n` +
                `Category: ${item.category}\n` +
                `Description: ${item.description}\n` +
                `Status: ${item.status}`
            );
        } catch (error) {
            showMessage(error.message, "error");
        }
    });

    // Edit button
    const editButton = createTextElement("button", "Edit");
    editButton.type = "button";
    editButton.className = "edit-button";

    editButton.addEventListener("click", async () => {
        try {
            const item = await recordService.get(record.id);

            titleInput.value = item.title;
            categoryInput.value = item.category;
            descriptionInput.value = item.description;
            statusInput.value = item.status;

            editingId = item.id;

            submitButton.textContent = "Update Request";
            formHeading.textContent = "Edit Support Request";
            cancelButton.hidden = false;

            form.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            showMessage(error.message, "error");
        }
    });

    // Delete button
    const deleteButton = createTextElement("button", "Delete");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", async () => {
        const confirmed = confirm(
            `Are you sure you want to delete "${record.title}"?`
        );

        if (!confirmed) {
            showMessage("Deletion cancelled.", "success");
            return;
        }

        try {
            await recordService.remove(record.id);
            showMessage("Support request deleted successfully.");
            await renderRecords();
        } catch (error) {
            showMessage(error.message, "error");
        }
    });

    actions.append(viewButton, editButton, deleteButton);
    card.appendChild(actions);

    return card;
}

// Display records
async function renderRecords() {
    recordsContainer.replaceChildren();
    recordCount.textContent = "Loading records...";

    const allRecords = await recordService.list();

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedStatus = filterStatus.value;

    const filteredRecords = allRecords.filter(record => {
        const matchesSearch = record.title.toLowerCase().includes(searchText);
        const matchesStatus =
            selectedStatus === "" || record.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    recordCount.textContent = `${filteredRecords.length} record(s) found`;

    if (filteredRecords.length === 0) {
        const empty = createTextElement(
            "p",
            allRecords.length === 0
                ? "No support requests have been added yet."
                : "No records match your search or filter.",
            "empty-message"
        );

        recordsContainer.appendChild(empty);
        return;
    }

    filteredRecords.forEach(record => {
        recordsContainer.appendChild(createRecordCard(record));
    });
}

// Handle form submission
form.addEventListener("submit", async event => {
    event.preventDefault();

    const record = {
        title: titleInput.value.trim(),
        category: categoryInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: statusInput.value
    };

    const validationError = validateRecord(record);

    if (validationError) {
        showMessage(validationError, "error");
        return;
    }

    submitButton.disabled = true;

    try {
        if (editingId !== null) {
            await recordService.update(editingId, record);
            showMessage("Support request updated successfully.");
        } else {
            await recordService.create(record);
            showMessage("Support request added successfully.");
        }

        clearForm();
        await renderRecords();

    } catch (error) {
        showMessage(error.message, "error");

    } finally {
        submitButton.disabled = false;
        submitButton.textContent =
            editingId !== null ? "Update Request" : originalButtonText;
    }
});

// Cancel editing
cancelButton.addEventListener("click", () => {
    clearForm();
    showMessage("Editing cancelled.", "success");
});

// Search
searchInput.addEventListener("input", () => {
    renderRecords().catch(error => {
        showMessage("Unable to load records: " + error.message, "error");
    });
});

// Filter
filterStatus.addEventListener("change", () => {
    renderRecords().catch(error => {
        showMessage("Unable to load records: " + error.message, "error");
    });
});

// Load records when the page opens
renderRecords().catch(error => {
    showMessage("Unable to load records: " + error.message, "error");
});
