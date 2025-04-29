export interface CardSubmission {
  id?: number;
  imageUrl: string | null;
  name: string;
  description?: string;
  condition: CardCondition;
  rarity: CardRarity;
  estimatedPrice: number;
  status: SubmissionStatus;
  submittedAt: Date;
}

export enum CardCondition {
  MINT = 'Mint',
  NEAR_MINT = 'Near Mint',
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  LIGHT_PLAYED = 'Light Played',
  PLAYED = 'Played',
  POOR = 'Poor'
}

export enum CardRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  MYTHIC = 'Mythic Rare',
  SPECIAL = 'Special'
}

export enum SubmissionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
} 