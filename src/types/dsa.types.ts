export type DsaPlatform =
  | "LeetCode"
  | "NeetCode"
  | "InterviewBit"
  | "GeekSForGeeks"
  | "Codeforces"
  | "Custom";
export type DsaDifficulty = "Easy" | "Medium" | "Hard";
export type DsaStatus = "todo" | "solved" | "revision";

export interface DsaApproach {
  order: number;
  title: string;
  intuition: string;
  approach: string;
  solution: string;
}

export interface DsaProblem {
  title: string;
  platform?: DsaPlatform;
  problemUrl?: string;
  difficulty: DsaDifficulty;
  tags?: string[];
  status: DsaStatus;
  question: string;
  approaches: DsaApproach[];
  notes?: string;
  revisionCount: number;
  lastRevisedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
