import AuditLog from '../models/AuditLog.js';
import File from '../models/File.js';

export const getAuditLog = async (req, res) => {
  try {
    const logs = await AuditLog.find({ user: req.userId })
      .populate('file', 'originalName')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(
      logs.map((log) => ({
        id: log._id,
        filename: log.file?.originalName || 'Deleted',
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log', details: error.message });
  }
};

export const getFileActivityLog = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only owner can view activity' });
    }

    const logs = await AuditLog.find({ file: fileId })
      .populate('user', 'username email')
      .sort({ timestamp: -1 });

    res.json(
      logs.map((log) => ({
        id: log._id,
        user: log.user.username,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity log', details: error.message });
  }
};
