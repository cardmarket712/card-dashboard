export const alertRules = {
  spend: { direction: "down", warning: 5, urgent: 10 },
  members: { direction: "down", warning: 5, urgent: 10 },
  valid: { direction: "down", warning: 1, urgent: 3 },
  risk: { direction: "up", warning: 3, urgent: 8 },
  product: { direction: "down", warning: 5, urgent: 10 },
  campaign: { direction: "down", warning: 10, urgent: 25 },
} as const;
