const lineupsDiv = document.getElementById("lineups"); // Card Container
const lineupsFilePath = "lineups.json";

document.addEventListener('DOMContentLoaded', function () {
    populateCards();
});

async function populateCards() {
    const data = await retrievePerformanceData();

    data.forEach(lineup => {
        createLineups(lineup);
    })
}

async function retrievePerformanceData() {
    try {
        const response = await fetch(lineupsFilePath);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}

function createLineups(data) {
    const cardElement = document.createElement("div");
    cardElement.classList = "card";
    cardElement.dataset.performanceId = data.id || data.name; // Store identifier
    cardElement.appendChild(_createHeader(data));
    cardElement.appendChild(_createDetails(data));
    cardElement.appendChild(_createGroups(data));
    lineupsDiv.appendChild(cardElement);
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

function _createGroups(data) {
    const performersElement = document.createElement("div");
    performersElement.classList = "performers";

    const performerData = data.performers;

    for (const [key, value] of Object.entries(performerData)) {
        const performerGroupElement = document.createElement("div");
        performerGroupElement.classList = "performer-group";

        const groupNameElement = document.createElement("div");
        groupNameElement.classList = "group-name";
        groupNameElement.innerHTML = key;
        performerGroupElement.appendChild(groupNameElement);

        for (const name of value) {
            const performerNameElement = document.createElement("div");
            performerNameElement.classList = "group-member";
            performerNameElement.innerHTML = name;
            performerGroupElement.appendChild(performerNameElement);
        }
        performersElement.appendChild(performerGroupElement);
    }


    return performersElement;
}