const performanceForm = document.getElementById("performance-form");
const performanceFilePath = "../data/performances.json";
const cardsContainer = document.querySelector(".cards");
const submitButton = document.getElementById("submit-btn");

document.addEventListener('DOMContentLoaded', function () {
    populateCards();
});

// Add form submit event listener
if (performanceForm) {
    performanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate that all cards have a selection
        const validation = validateForm();
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }
        
        const results = getFormResults();
        console.log('Form Results:', results);
        console.log('JSON:', JSON.stringify(results, null, 2));
        
        // Submit to Netlify
        submitToNetlify(results);
    });
}

async function populateCards() {
    const data = await retrievePerformanceData();
    
    data.forEach(performance => {
        createPerformance(performance);
    })
}

async function retrievePerformanceData() {
    try {
        const response = await fetch(performanceFilePath);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}

function createPerformance(data) {
    const cardElement = document.createElement("div");
    cardElement.classList = "card";
    cardElement.dataset.performanceId = data.id || data.name; // Store identifier
    cardElement.appendChild(_createHeader(data));
    cardElement.appendChild(_createDetails(data));
    cardElement.appendChild(_createOptions());
    cardsContainer.appendChild(cardElement);
}

function _createHeader(data) {
    const headerElement = document.createElement("div");
    headerElement.classList = "header";

    const h2 = document.createElement("h2");
    h2.innerHTML = data.name;
    h2.dataset.field = "name";
    headerElement.appendChild(h2);

    const h3 = document.createElement("h3");
    h3.innerHTML = data.type;
    h3.dataset.field = "type";
    headerElement.appendChild(h3);

    return headerElement;
}

function _createDetails(data) {
    const detailsElement = document.createElement("div");
    detailsElement.classList = "details";

    let detailTable = [
        ["Date: ", data.date, "date"],
        ["Day: ", data.day, "day"],
        ["Start: ", data.start, "start"],
        ["Arrive: ", data.arrive, "arrive"],
        ["Address: ", data.location, "location"],
    ]
    if (data.extra && data.extra != null) {
        detailTable.push(["Extra: ", data.extra, "extra"])
    }

    for (const [key, value, fieldName] of detailTable) {
        const detailRowElement = document.createElement("div");
        detailRowElement.classList = "detail-row";

        const keyElement = document.createElement("div");
        keyElement.classList = "key";
        keyElement.innerHTML = key;
        detailRowElement.appendChild(keyElement);
        
        const valueElement = document.createElement("div");
        valueElement.classList = "value";
        valueElement.innerHTML = value;
        valueElement.dataset.field = fieldName;
        detailRowElement.appendChild(valueElement);

        detailsElement.appendChild(detailRowElement);
    }

    return detailsElement;
}

function _createOptions() {
    const optionsElement = document.createElement("div");
    optionsElement.classList = "options";

    const optionInfo = [
        "Free",
        "Maybe",
        "Busy",
    ]

    const checkboxes = [];

    for (const optionName of optionInfo) {
        const option = document.createElement("div");
        option.classList = "option";

        const pElement = document.createElement("p");
        pElement.innerHTML = optionName;
        option.appendChild(pElement);

        const labelElement = document.createElement("label");
        labelElement.classList = "checkbox-container";

        const inputElement = document.createElement("input");
        inputElement.classList = `checkbox-${optionName.toLowerCase()}`;
        inputElement.type = "checkbox";
        inputElement.dataset.option = optionName;
        labelElement.appendChild(inputElement);

        const spanElement = document.createElement("span");
        spanElement.classList = `checkmark checkmark-${optionName.toLowerCase()}`;
        labelElement.appendChild(spanElement);

        option.appendChild(labelElement);
        
        optionsElement.appendChild(option);
        checkboxes.push(inputElement);
    }

    // Add event listeners to ensure only one checkbox is checked at a time
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxes.forEach((otherCheckbox, otherIndex) => {
                    if (otherIndex !== index) {
                        otherCheckbox.checked = false;
                    }
                });
            }
        });
    });

    return optionsElement;
}

function validateForm() {
    // Get the name input field
    const nameInput = document.getElementById("name") || document.querySelector('input[name="name"]');
    
    if (!nameInput || !nameInput.value.trim()) {
        return {
            isValid: false,
            message: "Please enter your name before submitting."
        };
    }

    // Check if all cards have a selection
    const cards = document.querySelectorAll('.card');
    const unfilledCards = [];
    
    cards.forEach((card, index) => {
        const checkedCheckbox = card.querySelector('input[type="checkbox"]:checked');
        if (!checkedCheckbox) {
            const performanceName = card.querySelector('[data-field="name"]')?.textContent || `Card ${index + 1}`;
            unfilledCards.push(performanceName);
        }
    });

    if (unfilledCards.length > 0) {
        return {
            isValid: false,
            message: `Please select an availability option for the following performance(s):\n${unfilledCards.join('\n')}`
        };
    }

    return {
        isValid: true,
        message: "Form is valid"
    };
}

function getFormResults() {
    // Get the name from the form
    const nameInput = document.getElementById("name") || document.querySelector('input[name="name"]');
    const personName = nameInput ? nameInput.value.trim() : '';

    const results = {
        name: personName,
        performances: []
    };

    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const performanceData = {
            id: card.dataset.performanceId,
            name: card.querySelector('[data-field="name"]')?.textContent || '',
            type: card.querySelector('[data-field="type"]')?.textContent || '',
            date: card.querySelector('[data-field="date"]')?.textContent || '',
            day: card.querySelector('[data-field="day"]')?.textContent || '',
            start: card.querySelector('[data-field="start"]')?.textContent || '',
            arrive: card.querySelector('[data-field="arrive"]')?.textContent || '',
            location: card.querySelector('[data-field="location"]')?.textContent || '',
            availability: null
        };

        const extraField = card.querySelector('[data-field="extra"]');
        if (extraField && extraField.textContent) {
            performanceData.extra = extraField.textContent;
        }

        // Get the checked option
        const checkedCheckbox = card.querySelector('input[type="checkbox"]:checked');
        if (checkedCheckbox) {
            performanceData.availability = checkedCheckbox.dataset.option;
        }

        results.performances.push(performanceData);
    });

    return results;
}

async function submitToNetlify(results) {
    try {
        // Create FormData object for Netlify
        const formData = new FormData(performanceForm);
        
        // Add the JSON data as a field
        formData.set('form-data', JSON.stringify(results, null, 2));
        
        // Submit to Netlify
        const response = await fetch('/', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
            // Show success alert
            alert('Form submitted successfully!');
            
            // Clear all fields
            clearForm();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting the form. Please try again.');
    }
}

function clearForm() {
    // Clear the name input field
    const nameInput = document.getElementById("name") || document.querySelector('input[name="name"]');
    if (nameInput) {
        nameInput.value = '';
    }

    // Clear all checkboxes in all cards
    const allCheckboxes = document.querySelectorAll('.card input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}
