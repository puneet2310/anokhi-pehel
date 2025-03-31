const fs = require("fs");
const path = require("path");

const ensurePapersFolder = () => {
    const dir = path.join(__dirname, "../papers"); // Adjust path as needed
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Create folder if it doesn't exist
    }
};


const deleteFile = (uploadedFilePath) => {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
        console.log("✅ Deleted temporary file:", uploadedFilePath);
    }
};

module.exports = { deleteFile , ensurePapersFolder};