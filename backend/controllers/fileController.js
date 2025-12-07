import File from '../models/File.js';
import FileShare from '../models/FileShare.js';
import ShareLink from '../models/ShareLink.js';
import AuditLog from '../models/AuditLog.js';
import { generateToken, isValidFileType, compressFile, getFileSize } from '../utils/helpers.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const uploadFile = async (req, res) => {
  try {
    initCloudinary();
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { mimetype, size, filepath, originalFilename } = req.file;

    if (!isValidFileType(mimetype)) {
      fs.unlinkSync(filepath);
      return res.status(400).json({ error: 'File type not allowed' });
    }

    if (size > parseInt(process.env.MAX_FILE_SIZE)) {
      fs.unlinkSync(filepath);
      return res.status(400).json({ error: 'File size exceeds maximum limit' });
    }

    // Upload to Cloudinary
    const uniqueName = `${crypto.randomBytes(8).toString('hex')}-${originalFilename}`;
    const cloudinaryResponse = await cloudinary.uploader.upload(filepath, {
      public_id: uniqueName,
      folder: 'file-sharing',
      resource_type: 'auto',
    });

    // Delete local temp file after upload
    fs.unlinkSync(filepath);

    const file = new File({
      filename: uniqueName,
      originalName: originalFilename,
      fileType: mimetype,
      size,
      owner: req.userId,
      filePath: cloudinaryResponse.secure_url,
      cloudinaryId: cloudinaryResponse.public_id,
      isCompressed: false,
    });

    await file.save();

    await AuditLog.create({
      user: req.userId,
      file: file._id,
      action: 'uploaded',
      details: { filename: file.originalName, size, compressed: false },
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.originalName,
        fileType: file.fileType,
        size: file.size,
        uploadedAt: file.uploadedAt,
        compressed: false,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
};

export const bulkUpload = async (req, res) => {
  try {
    initCloudinary();
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const { mimetype, size, filepath, originalFilename } = file;

        if (!isValidFileType(mimetype)) {
          errors.push({ filename: originalFilename, error: 'File type not allowed' });
          fs.unlinkSync(filepath);
          continue;
        }

        if (size > parseInt(process.env.MAX_FILE_SIZE)) {
          errors.push({ filename: originalFilename, error: 'File size exceeds limit' });
          fs.unlinkSync(filepath);
          continue;
        }

        // Upload to Cloudinary
        const uniqueName = `${crypto.randomBytes(8).toString('hex')}-${originalFilename}`;
        const cloudinaryResponse = await cloudinary.uploader.upload(filepath, {
          public_id: uniqueName,
          folder: 'file-sharing',
          resource_type: 'auto',
        });

        // Delete local temp file
        fs.unlinkSync(filepath);

        const fileDoc = new File({
          filename: uniqueName,
          originalName: originalFilename,
          fileType: mimetype,
          size,
          owner: req.userId,
          filePath: cloudinaryResponse.secure_url,
          cloudinaryId: cloudinaryResponse.public_id,
          isCompressed: false,
        });

        await fileDoc.save();

        await AuditLog.create({
          user: req.userId,
          file: fileDoc._id,
          action: 'uploaded',
          details: { filename: fileDoc.originalName, size },
        });

        uploadedFiles.push({
          id: fileDoc._id,
          filename: fileDoc.originalName,
          fileType: fileDoc.fileType,
          size: fileDoc.size,
        });
      } catch (error) {
        errors.push({ filename: file.originalFilename, error: error.message });
      }
    }

    res.status(201).json({
      message: 'Bulk upload completed',
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ error: 'Bulk upload failed', details: error.message });
  }
};

export const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.userId }).sort({ uploadedAt: -1 });

    const filesWithSharedInfo = await Promise.all(
      files.map(async (file) => {
        const shareCount = await FileShare.countDocuments({ file: file._id });
        const linkCount = await ShareLink.countDocuments({ file: file._id });
        return {
          id: file._id,
          filename: file.originalName,
          fileType: file.fileType,
          size: file.size,
          uploadedAt: file.uploadedAt,
          sharedWith: shareCount,
          sharedLinks: linkCount,
        };
      })
    );

    res.json(filesWithSharedInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files', details: error.message });
  }
};

export const getSharedWithMe = async (req, res) => {
  try {
    const shares = await FileShare.find({ sharedWith: req.userId })
      .populate('file', 'originalName fileType size uploadedAt')
      .populate('sharedBy', 'username email')
      .sort({ createdAt: -1 });

    const now = new Date();
    const validShares = shares.filter((share) => !share.expiryDate || share.expiryDate > now);

    res.json(
      validShares.map((share) => ({
        shareId: share._id,
        file: {
          id: share.file._id,
          filename: share.file.originalName,
          fileType: share.file.fileType,
          size: share.file.size,
          uploadedAt: share.file.uploadedAt,
        },
        sharedBy: share.sharedBy.username,
        role: share.role,
        sharedAt: share.createdAt,
        expiryDate: share.expiryDate,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared files', details: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const isOwner = file.owner.toString() === req.userId;
    const hasAccess = isOwner || (await checkFileAccess(fileId, req.userId));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await AuditLog.create({
      user: req.userId,
      file: fileId,
      action: 'downloaded',
      details: { filename: file.originalName, compressed: false },
    });

    // Return file URL for frontend to download
    res.json({
      message: 'Download authorized',
      fileUrl: file.filePath,
      filename: file.originalName,
    });
  } catch (error) {
    res.status(500).json({ error: 'Download failed', details: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    initCloudinary();
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only owner can delete' });
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (file.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    await File.findByIdAndDelete(fileId);
    await FileShare.deleteMany({ file: fileId });
    await ShareLink.deleteMany({ file: fileId });
    await AuditLog.deleteMany({ file: fileId });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed', details: error.message });
  }
};

const checkFileAccess = async (fileId, userId) => {
  const now = new Date();
  return await FileShare.findOne({
    file: fileId,
    sharedWith: userId,
    $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
  });
};
