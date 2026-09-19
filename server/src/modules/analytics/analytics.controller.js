export class AnalyticsController {
  constructor(analyticsModel) {
    this.analyticsModel = analyticsModel;
    this.getAnalytics = this.getAnalytics.bind(this);
    this.getAlgorithmBenchmark = this.getAlgorithmBenchmark.bind(this);
    this.runAlgorithmSandbox = this.runAlgorithmSandbox.bind(this);
    this.getAnomalies = this.getAnomalies.bind(this);
    this.runAnomalyScan = this.runAnomalyScan.bind(this);
    this.updateAnomalyStatus = this.updateAnomalyStatus.bind(this);
    this.dispatchAdvisory = this.dispatchAdvisory.bind(this);
    this.getAdvisories = this.getAdvisories.bind(this);
  }

  async getAnalytics(req, res, next) {
    try {
      const { range, groupId } = req.query;
      const analytics = await this.analyticsModel.getPlatformAnalytics({ range, groupId });
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAlgorithmBenchmark(req, res, next) {
    try {
      const benchmark = await this.analyticsModel.benchmarkDebtOptimization();
      res.status(200).json({
        success: true,
        data: benchmark,
      });
    } catch (error) {
      next(error);
    }
  }

  async runAlgorithmSandbox(req, res, next) {
    try {
      const { scenario, customMembers, customDebts, groupId } = req.body;
      const result = await this.analyticsModel.runOptimizationSandbox({
        scenario,
        customMembers,
        customDebts,
        groupId,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnomalies(req, res, next) {
    try {
      const { threshold, severity, status, search, page, limit } = req.query;
      const data = await this.analyticsModel.detectSpendingAnomalies({
        threshold,
        severity,
        status,
        search,
        page,
        limit,
      });
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async runAnomalyScan(req, res, next) {
    try {
      const { threshold, severity } = req.body || {};
      const data = await this.analyticsModel.runAnomalyScan({ threshold, severity });
      res.status(200).json({
        success: true,
        message: 'System-wide algorithmic anomaly scan completed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnomalyStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, resolutionNotes } = req.body;
      const adminId = req.admin?.id || req.admin?._id;
      const updated = await this.analyticsModel.updateAnomalyStatus(id, {
        status,
        resolutionNotes,
        adminId,
      });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Anomaly record not found',
        });
      }
      res.status(200).json({
        success: true,
        message: `Anomaly status updated to ${status}`,
        data: { anomaly: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async dispatchAdvisory(req, res, next) {
    try {
      const { userId, anomalyId, subject, message, anomalyType, metrics } = req.body;
      const adminId = req.admin?.id || req.admin?._id;
      const result = await this.analyticsModel.dispatchUserAdvisory(
        { userId, anomalyId, subject, message, anomalyType, metrics },
        adminId
      );
      res.status(201).json({
        success: true,
        message: 'Spending advisory dispatched successfully to user',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdvisories(req, res, next) {
    try {
      const { userId } = req.query;
      const data = await this.analyticsModel.getAdvisories({ userId });
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
