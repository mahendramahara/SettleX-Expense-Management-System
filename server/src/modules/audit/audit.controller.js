export class AuditController {
  constructor(auditModel) {
    this.auditModel = auditModel;
    this.getAuditLogs = this.getAuditLogs.bind(this);
  }

  async getAuditLogs(req, res, next) {
    try {
      const { category, search, page, limit } = req.query;
      const logs = await this.auditModel.getAuditLogs({ category, search, page, limit });
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
