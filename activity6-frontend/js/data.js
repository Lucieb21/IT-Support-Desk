
const KEY = "it-support-demo-v1";

// Eight starting demonstration records
const startingRecords = [
    {
        id: 1,
        title: "Computer cannot connect to Wi-Fi",
        category: "Network",
        description: "The computer in Lab 2 cannot connect to the university Wi-Fi network.",
        status: "Pending"
    },
    {
        id: 2,
        title: "Printer not responding",
        category: "Hardware",
        description: "The printer in the administration office does not respond when printing.",
        status: "In progress"
    },
    {
        id: 3,
        title: "Microsoft Word installation problem",
        category: "Software",
        description: "Microsoft Word is not opening on the computer in the library.",
        status: "Pending"
    },
    {
        id: 4,
        title: "Keyboard keys not working",
        category: "Hardware",
        description: "Several keys on the computer keyboard in Lab 1 are not working.",
        status: "Completed"
    },
    {
        id: 5,
        title: "Slow internet connection",
        category: "Network",
        description: "Internet access in the student computer laboratory is very slow.",
        status: "In progress"
    },
    {
        id: 6,
        title: "Antivirus software needs updating",
        category: "Software",
        description: "The antivirus software on the office computer requires an update.",
        status: "Pending"
    },
    {
        id: 7,
        title: "Computer monitor displaying a blank screen",
        category: "Hardware",
        description: "The monitor in Lab 3 displays a blank screen when the computer is switched on.",
        status: "Completed"
    },
    {
        id: 8,
        title: "Unable to access university network",
        category: "Network",
        description: "The computer cannot access shared university network resources.",
        status: "Pending"
    }
];

// Add starting records only if storage does not exist
if (localStorage.getItem(KEY) === null) {
    localStorage.setItem(KEY, JSON.stringify(startingRecords));
}

// Function to read saved records
function readRecords() {
    return JSON.parse(localStorage.getItem(KEY));
}

// Data service
export const recordService = {

    // Get all records
    async list() {
        return readRecords();
    },

    // Get one record using its ID
    async get(id) {
        const records = readRecords();

        const record = records.find(item => item.id === Number(id));

        if (!record) {
            throw new Error("Record not found.");
        }

        return record;
    },

    // Create a new record
    async create(record) {
        const records = readRecords();

        const newId = records.reduce(
            (highest, item) => Math.max(highest, item.id),
            0
        ) + 1;

        const newRecord = {
            id: newId,
            title: record.title,
            category: record.category,
            description: record.description,
            status: record.status
        };

        records.push(newRecord);

        localStorage.setItem(KEY, JSON.stringify(records));

        return newRecord;
    },

    // Update an existing record
    async update(id, record) {
        const records = readRecords();

        const index = records.findIndex(
            item => item.id === Number(id)
        );

        if (index === -1) {
            throw new Error("Record not found.");
        }

        records[index] = {
            id: Number(id),
            title: record.title,
            category: record.category,
            description: record.description,
            status: record.status
        };

        localStorage.setItem(KEY, JSON.stringify(records));

        return records[index];
    },

    // Delete a record
    async remove(id) {
        const records = readRecords();

        const updatedRecords = records.filter(
            item => item.id !== Number(id)
        );

        if (updatedRecords.length === records.length) {
            throw new Error("Record not found.");
        }

        localStorage.setItem(KEY, JSON.stringify(updatedRecords));

        return "Record deleted successfully.";
    }

};
