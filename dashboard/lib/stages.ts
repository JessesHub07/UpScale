export const STAGES = [
  'new',
  'hot',
  'warm',
  'cold',
  'nurture',
  'handed_off',
  'closed_won',
  'closed_lost',
] as const

export type Stage = typeof STAGES[number]

export const STAGE_LABELS: Record<Stage, string> = {
  new: 'New',
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
  nurture: 'Nurture',
  handed_off: 'Handed Off',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
}

export const STAGE_COLORS: Record<Stage, string> = {
  new: '#6b7280',
  hot: '#22c55e',
  warm: '#f59e0b',
  cold: '#3b82f6',
  nurture: '#06b6d4',
  handed_off: '#a855f7',
  closed_won: '#10b981',
  closed_lost: '#f43f5e',
}
