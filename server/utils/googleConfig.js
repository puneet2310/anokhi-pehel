const fs = require("fs");
const { google } = require("googleapis");


const authorize = async () => {
    try {
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            throw new Error("Missing required Google Drive credentials in environment variables.");
        }

        const jwtClient = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/drive"],
        });

        await jwtClient.authorize();
        return jwtClient;
    } catch (error) {
        console.error("Google Drive Authorization Error:", error.message);
        throw new Error("Failed to authorize Google Drive access. Please try again later.");
    }
};


const findOrCreateFolder = async (authClient, folderName, parentFolderId) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;

    const response = await drive.files.list({
        q: query,
        fields: "files(id, name)",
    });

    if (response.data.files.length > 0) {
        return response.data.files[0].id;
    }

    const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
    };

    const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
    });

    return folder.data.id;
};

const uploadFile = async (authClient, file, classId, subject, testDate) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    if(!process.env.FOLDER_ID) throw new Error("Missing required environment variable: FOLDER_ID");
    const ROOT_FOLDER_ID = process.env.FOLDER_ID;

    const classFolderId = await findOrCreateFolder(authClient, `class-${classId}`, ROOT_FOLDER_ID);
    const subjectFolderId = await findOrCreateFolder(authClient, subject, classFolderId);

    if (!subjectFolderId) {
        console.error(`Failed to create/find subject folder: ${subject}`);
        return null;
    }

    const formattedDate = new Date(testDate)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

    const newFileName = `Test_${formattedDate}.${file.originalname.split(".").pop()}`;

    const fileMetaData = {
        name: newFileName,
        parents: [subjectFolderId],
    };

    const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
        resource: fileMetaData,
        media: media,
        fields: "id",
    });

    const fileId = response.data.id;

    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    const publicLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    if (fileId) {
        fs.unlinkSync(file.path);
    }

    return publicLink;
};

module.exports = { authorize, findOrCreateFolder, uploadFile };
