/**
 * Reusable project case-study structure.
 * Only publish entries with genuine, business-verified details.
 * Do not invent customer names, quotes, or project outcomes.
 */

export type ProjectCaseStudy = {
  slug: string;
  title: string;
  location: string;
  homeType: string;
  customerRequirement: string;
  challenge: string;
  designSolution: string;
  materials: string[];
  manufacturing: string;
  installation: string;
  finalResult: string;
  gallery: string[];
  /** Only include if customer gave permission to publish */
  customerFeedback?: string;
  published: boolean;
};

/**
 * Empty until business provides verified project write-ups.
 * Use gallery photos + this template when ready.
 */
export const projectCaseStudies: ProjectCaseStudy[] = [];

export function getPublishedCaseStudies() {
  return projectCaseStudies.filter((p) => p.published);
}
