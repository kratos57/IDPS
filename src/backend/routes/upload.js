const path = require('path');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');
const fs = require('fs');
// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Adjust the path to reflect your project structure
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const documentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  category: String,
  uploadDate: { type: Date, default: Date.now },
  roomCode: { type: String, required: true },
  versions: [
    {
      versionNumber: Number,
      filename: String,
      path: String,
      uploadDate: { type: Date, default: Date.now },
    },
  ],
  currentVersion: { type: Number, default: 1 },
  lockedBy: { type: String, default: null },  // Locking mechanism
  lockTimestamp: { type: Date, default: null },
  auditLog: [
    {
      user: String,
      action: String,
      timestamp: { type: Date, default: Date.now },
    }
  ]
});


const Document = mongoose.model('Document', documentSchema);
router.get('/files', async (req, res) => {
  try {
    const { date, category, fileType, sortBy, roomCode } = req.query;

    // Ensure roomCode is provided
    if (!roomCode) {
      return res.status(400).send('Room code is required.');
    }

    // Add roomCode to filters
    const filters = { roomCode };

    if (date) {
      filters.uploadDate = { $gte: new Date(date) };
    }
    if (category) {
      filters.category = category;
    }
    if (fileType) {
      filters.mimetype = fileType;
    }

    let sortOptions = {};
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          sortOptions.filename = 1;
          break;
        case 'date':
          sortOptions.uploadDate = -1; // Most recent first
          break;
        case 'relevance':
          // Add custom relevance logic if needed
          break;
      }
    }

    const files = await Document.find(filters).sort(sortOptions);
    res.status(200).json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).send('Error fetching files.');
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { roomCode } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    if (!roomCode) {
      return res.status(400).send('Room code is required.');
    }

    // Create or update document with the roomCode
    let document = await Document.findOne({ filename: file.originalname, roomCode });

    if (document) {
      // Increment version if document already exists
      const newVersionNumber = document.currentVersion + 1;
      const newVersion = {
        versionNumber: newVersionNumber,
        filename: file.originalname,
        path: file.path.replace(/^.*[\\\/]/, ''),
        uploadDate: Date.now(),
      };

      document.versions.push(newVersion);
      document.currentVersion = newVersionNumber;

      await document.save();
    } else {
      // Create new document
      document = new Document({
        filename: file.originalname,
        path: file.path.replace(/^.*[\\\/]/, ''),
        mimetype: file.mimetype,
        size: file.size,
        roomCode, // Associate document with roomCode
        versions: [{
          versionNumber: 1,
          filename: file.originalname,
          path: file.path.replace(/^.*[\\\/]/, ''),
        }],
      });

      await document.save();
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.path.replace(/^.*[\\\/]/, '')}`;
    res.status(201).json({ fileUrl, version: document.currentVersion });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).send('Error uploading file.');
  }
});


router.get('/files/:filename/versions', async (req, res) => {
  try {
    const { filename } = req.params;
    const document = await Document.findOne({ filename });

    if (!document) {
      return res.status(404).send('Document not found.');
    }

    res.status(200).json({ versions: document.versions });
  } catch (err) {
    console.error('Error fetching version history:', err);
    res.status(500).send('Error fetching version history.');
  }
});
router.post('/files/:filename/revert', async (req, res) => {
  try {
    const { filename } = req.params;
    const { versionNumber } = req.body;

    const document = await Document.findOne({ filename });

    if (!document) {
      return res.status(404).send('Document not found.');
    }

    const versionToRevert = document.versions.find(v => v.versionNumber === versionNumber);

    if (!versionToRevert) {
      return res.status(404).send('Version not found.');
    }

    // Update the main document entry with the reverted version info
    document.path = versionToRevert.path;
    document.uploadDate = versionToRevert.uploadDate;
    document.currentVersion = versionNumber;

    await document.save();

    res.status(200).json({ message: `Reverted to version ${versionNumber}` });
  } catch (err) {
    console.error('Error reverting document version:', err);
    res.status(500).send('Error reverting document version.');
  }
});

// Existing routes...

router.post('/files/:filename/version', upload.single('file'), async (req, res) => {
  try {
    const { filename } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Find the existing document
    let document = await Document.findOne({ filename });

    if (!document) {
      return res.status(404).send('Document not found.');
    }

    // Increment the version number and add the new version
    const newVersionNumber = document.currentVersion + 1;

    const newVersion = {
      versionNumber: newVersionNumber,
      filename: file.originalname,
      path: file.path.replace(/^.*[\\\/]/, ''),
      uploadDate: Date.now(),
    };

    document.versions.push(newVersion);
    document.currentVersion = newVersionNumber;

    await document.save();

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.path.replace(/^.*[\\\/]/, '')}`;
    res.status(201).json({ fileUrl, version: document.currentVersion });
  } catch (err) {
    console.error('Error uploading new version:', err);
    res.status(500).send('Error uploading new version.');
  }
});

router.post('/files/:filename/lock', async (req, res) => {
  try {
    const { filename } = req.params;
    const { userId } = req.body;

    const document = await Document.findOne({ filename });

    if (!document) {
      return res.status(404).send('Document not found.');
    }

    if (document.lockedBy && document.lockedBy !== userId) {
      return res.status(403).send('File is currently locked by another user.');
    }

    document.lockedBy = userId;
    document.lockTimestamp = Date.now();
    await document.save();

    res.status(200).json({ message: 'File locked successfully' });
  } catch (err) {
    console.error('Error locking file:', err);
    res.status(500).send('Error locking file.');
  }
});

router.post('/files/:filename/unlock', async (req, res) => {
  try {
    const { filename } = req.params;
    const { userId } = req.body;

    const document = await Document.findOne({ filename });

    if (!document) {
      return res.status(404).send('Document not found.');
    }

    if (document.lockedBy !== userId) {
      return res.status(403).send('You cannot unlock this file as it is locked by another user.');
    }

    document.lockedBy = null;
    document.lockTimestamp = null;
    await document.save();

    res.status(200).json({ message: 'File unlocked successfully' });
  } catch (err) {
    console.error('Error unlocking file:', err);
    res.status(500).send('Error unlocking file.');
  }
});
router.delete('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const document = await Document.findOne({ filename });

    if (!document) {
      return res.status(404).send('File not found.');
    }

    // Delete all versions of the file
    for (const version of document.versions) {
      const filePath = path.join(__dirname, '../uploads', version.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file from the filesystem
      }
    }

    // Delete the document from MongoDB
    await Document.deleteOne({ filename });

    res.status(200).json({ message: 'File and all its versions deleted successfully.' });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).send('Error deleting file.');
  }
});
module.exports = router;
