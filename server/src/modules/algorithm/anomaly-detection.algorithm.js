export class AnomalyDetectionAlgorithm {
  /**
   * Calculates population mean, variance, and standard deviation for Z-score normalization.
   */
  static calculatePopulationMetrics(values = []) {
    if (!values || values.length === 0) {
      return { mean: 0, variance: 0, stdDev: 1 };
    }
    const n = values.length;
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance) || 1;

    return { mean, variance, stdDev };
  }

  /**
   * Computes individual Z-Score.
   */
  static calculateZScore(value, mean, stdDev) {
    if (!stdDev || stdDev === 0) return 0;
    return Number(((value - mean) / stdDev).toFixed(2));
  }

  /**
   * Evaluates single expense against circle historical benchmarks.
   */
  static evaluateExpenseOutlier(amountPaisa, historicalExpenses = []) {
    if (!historicalExpenses || historicalExpenses.length < 2) {
      return { isOutlier: false };
    }

    const totalHistoricalPaisa = historicalExpenses.reduce(
      (acc, e) => acc + (e.amountPaisa || 0),
      0
    );
    const avgHistoricalPaisa = totalHistoricalPaisa / historicalExpenses.length;

    const isMultiplierOutlier = avgHistoricalPaisa > 0 && amountPaisa >= avgHistoricalPaisa * 2.75;
    const isAbsoluteOutlier = amountPaisa >= 2500000; // Rs. 25,000+

    if (isMultiplierOutlier || isAbsoluteOutlier) {
      const ratio =
        avgHistoricalPaisa > 0 ? Number((amountPaisa / avgHistoricalPaisa).toFixed(2)) : 3.0;
      const severity = amountPaisa >= 3500000 || ratio >= 3.5 ? 'CRITICAL' : 'ELEVATED';

      return {
        isOutlier: true,
        ratio,
        severity,
        avgHistoricalPaisa: Math.round(avgHistoricalPaisa),
      };
    }

    return { isOutlier: false };
  }

  /**
   * Evaluates if user is disproportionately fronting group expenses.
   */
  static evaluateDisproportionatePayer(userTotalPaisa, groupTotalPaisa, memberCount) {
    if (memberCount < 2 || groupTotalPaisa <= 0) {
      return { isDisproportionate: false };
    }

    const fairSharePaisa = Math.round(groupTotalPaisa / memberCount);
    const sharePercent = Math.round((userTotalPaisa / groupTotalPaisa) * 100);
    const overspendRatio =
      fairSharePaisa > 0 ? Number((userTotalPaisa / fairSharePaisa).toFixed(2)) : 1;

    if (sharePercent >= 60 && overspendRatio >= 1.75 && userTotalPaisa >= 500000) {
      const severity = sharePercent >= 80 || overspendRatio >= 2.5 ? 'CRITICAL' : 'ELEVATED';
      return {
        isDisproportionate: true,
        sharePercent,
        overspendRatio,
        severity,
        fairSharePaisa,
        overspendPaisa: Math.max(0, userTotalPaisa - fairSharePaisa),
      };
    }

    return { isDisproportionate: false };
  }

  /**
   * Evaluates burst / velocity transaction clustering.
   */
  static evaluateVelocityBurst(recentExpenses = [], windowMinutes = 15) {
    if (!recentExpenses || recentExpenses.length < 3) {
      return { isBurst: false };
    }
    return {
      isBurst: true,
      frequencyCount: recentExpenses.length,
      severity: 'MODERATE',
    };
  }
}
