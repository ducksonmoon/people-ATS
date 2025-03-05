import { HiringGoalStatus } from "../types/hiring-enums";

/**
 * Calculate the time remaining until a deadline
 * @param endDateStr End date string or Date object
 * @returns Formatted string representing time remaining
 */
export const calculateTimeRemaining = (endDateStr: string | Date): string => {
  const endDate = new Date(endDateStr);
  const today = new Date();
  const differenceInTime = endDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

  if (differenceInDays < 0) {
    return "Expired";
  } else if (differenceInDays === 0) {
    return "Today";
  } else if (differenceInDays === 1) {
    return "1 day";
  } else {
    return `${differenceInDays} days`;
  }
};

/**
 * Calculate a health score for a hiring goal based on progress and time elapsed
 * @param goal Hiring goal with relevant metrics
 * @returns Health score from 0-100
 */
export const calculateHealthScore = (goal: {
  targetHeadcount?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  progressMetrics?: {
    openPositions?: number;
    activeCandidates?: number;
    interviewsScheduled?: number;
    offersExtended?: number;
  };
}): number => {
  if (!goal.targetHeadcount || !goal.endDate) return 50;

  const endDate =
    goal.endDate instanceof Date ? goal.endDate : new Date(goal.endDate);
  const startDate =
    goal.startDate instanceof Date
      ? goal.startDate
      : goal.startDate
      ? new Date(goal.startDate)
      : new Date();
  const today = new Date();

  const totalDuration = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
  );

  const elapsedDuration = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
  );

  const timeElapsedPercent = Math.min(
    100,
    Math.round((elapsedDuration / totalDuration) * 100)
  );

  let pipelineScore = 0;
  if (goal.progressMetrics) {
    const {
      openPositions = 0,
      activeCandidates = 0,
      interviewsScheduled = 0,
      offersExtended = 0,
    } = goal.progressMetrics;

    if (timeElapsedPercent < 25) {
      pipelineScore = openPositions > 0 ? 80 : 40;
    } else if (timeElapsedPercent < 50) {
      pipelineScore = activeCandidates > 0 ? 70 : 30;
    } else if (timeElapsedPercent < 75) {
      pipelineScore = interviewsScheduled > 0 ? 60 : 20;
    } else {
      pipelineScore = offersExtended > 0 ? 50 : 10;
    }
  }

  const pipelineWeight = Math.min(0.8, timeElapsedPercent / 100);
  const timeWeight = 1 - pipelineWeight;

  const timeScore = 100 - timeElapsedPercent;
  const finalScore = Math.round(
    timeScore * timeWeight + pipelineScore * pipelineWeight
  );

  return Math.max(0, Math.min(100, finalScore));
};

/**
 * Get the current quarter string (e.g. "Q1 2023")
 * @returns Current quarter string
 */
export const getCurrentQuarter = (): string => {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
};

/**
 * Calculate progress percentage
 * @param current Current value
 * @param target Target value
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

/**
 * Get the appropriate color for a health score
 * @param score Health score (0-100)
 * @returns Object with background and text colors
 */
export const getHealthScoreColor = (
  score: number
): { bg: string; color: string } => {
  if (score >= 80) {
    return { bg: "rgba(76, 175, 80, 0.2)", color: "success.main" };
  } else if (score >= 60) {
    return { bg: "rgba(255, 152, 0, 0.2)", color: "warning.main" };
  } else {
    return { bg: "rgba(244, 67, 54, 0.2)", color: "error.main" };
  }
};
