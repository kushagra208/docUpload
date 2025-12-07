import FileShare from '../models/FileShare.js';
import ShareLink from '../models/ShareLink.js';
import File from '../models/File.js';
import AuditLog from '../models/AuditLog.js';
import { generateToken } from '../utils/helpers.js';
import User from '../models/User.js';
import { uploadFile } from './fileController.js';

export const shareWithUser = async (req, res) => {
  try {
    const { fileId, email, role, expiryDays } = req.body;

    if (!fileId || !email) {
      return res.status(400).json({ error: 'File ID and Email are required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User to share with not found' });
    }

    const userId = user._id;

    if (file.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only owner can share' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot share with yourself' });
    }

    let expiryDate = null;
    if (expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
    }

    const existingShare = await FileShare.findOne({
      file: fileId,
      sharedWith: userId,
    });

    if (existingShare) {
      existingShare.role = role || existingShare.role;
      existingShare.expiryDate = expiryDate || existingShare.expiryDate;
      await existingShare.save();
    } else {
      const share = new FileShare({
        file: fileId,
        sharedBy: req.userId,
        sharedWith: userId,
        role: role || 'viewer',
        expiryDate,
      });
      await share.save();
    }

    await AuditLog.create({
      user: req.userId,
      file: fileId,
      action: 'shared',
      details: {
        sharedWith: userId,
        role: role || 'viewer',
        expiryDate,
      },
    });

    res.json({ message: 'File shared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Share failed', details: error.message });
  }
};

export const generateShareLink = async (req, res) => {
  try {
    const { fileId, expiryDays } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only owner can generate links' });
    }

    let expiryDate = null;
    if (expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
    }

    const token = generateToken();

    const shareLink = new ShareLink({
      file: fileId,
      createdBy: req.userId,
      token,
      expiryDate,
    });

    await shareLink.save();

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${token}`;

    res.status(201).json({
      message: 'Share link generated',
      shareUrl,
      token,
      expiryDate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Link generation failed', details: error.message });
  }
};

export const accessViaLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // if (!req.userId) {
    //   return res.status(401).json({ error: 'Authentication required' });
    // }
    console.log("Token received for access:", token);
    const shareLink = await ShareLink.findOne({ token }).populate('file');

    if (!shareLink) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }

    const now = new Date();
    if (shareLink.expiryDate && shareLink.expiryDate < now) {
      return res.status(403).json({ error: 'Link has expired' });
    }

    const file = shareLink.file;

    await AuditLog.create({
      user: req.userId,
      file: file._id,
      action: 'link_accessed',
      details: { shareToken: token },
    });

    shareLink.accessCount += 1;
    await shareLink.save();
    console.log('Accessed file via link:', file._id);
    res.json({
      file: {
        id: file._id,
        filename: file.originalName,
        fileType: file.fileType,
        size: file.size,
        uploadedAt: file.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Access failed', details: error.message });
  }
};

export const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await FileShare.findById(shareId).populate('file');

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    if (share.sharedBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only creator can revoke' });
    }

    await FileShare.findByIdAndDelete(shareId);

    await AuditLog.create({
      user: req.userId,
      file: share.file._id,
      action: 'access_revoked',
      details: { revokedFrom: share.sharedWith },
    });

    res.json({ message: 'Share revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Revoke failed', details: error.message });
  }
};

export const revokeLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    const link = await ShareLink.findById(linkId).populate('file');

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only creator can revoke' });
    }

    await ShareLink.findByIdAndDelete(linkId);

    res.json({ message: 'Link revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Revoke failed', details: error.message });
  }
};

export const getFileShares = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only owner can view shares' });
    }

    const userShares = await FileShare.find({ file: fileId })
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });

    const links = await ShareLink.find({ file: fileId }).sort({ createdAt: -1 });

    res.json({
      userShares: userShares.map((share) => ({
        id: share._id,
        sharedWith: share.sharedWith.username,
        email: share.sharedWith.email,
        role: share.role,
        expiryDate: share.expiryDate,
        createdAt: share.createdAt,
        accessCount: 0,
      })),
      links: links.map((link) => ({
        id: link._id,
        token: link.token,
        expiryDate: link.expiryDate,
        accessCount: link.accessCount,
        createdAt: link.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shares', details: error.message });
  }
};
