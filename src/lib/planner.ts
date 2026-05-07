export type PlanId = 'starter' | 'pro' | 'scale'

export type ProductMotionId = 'agent-saas' | 'internal-tool' | 'consumer-app' | 'migration'
export type TeamModeId = 'solo-founder' | 'small-ai-team' | 'product-engineer' | 'platform-team'
export type DataProfileId = 'relational' | 'realtime' | 'file-heavy' | 'ai-native'
export type OperatorModeId = 'human-led' | 'agent-paired' | 'agent-operated'
export type LaunchPriorityId = 'speed' | 'production' | 'migration' | 'governance'

export type PlannerSelection = {
  productMotion: ProductMotionId
  teamMode: TeamModeId
  dataProfile: DataProfileId
  operatorMode: OperatorModeId
  launchPriority: LaunchPriorityId
}

export type PlannerOption<T extends string> = {
  id: T
  label: string
  summary: string
}

export type PlannerModule = {
  label: string
  detail: string
}

export type PlannerResult = {
  fitScore: number
  fitLabel: string
  headline: string
  summary: string
  operatorMessage: string
  proofLine: string
  recommendedPlanId: PlanId
  recommendedGuidePaths: string[]
  estimatedLaunchWindow: string
  modules: PlannerModule[]
  reasons: string[]
  watchouts: string[]
  nextSteps: string[]
}

export const defaultPlannerSelection: PlannerSelection = {
  productMotion: 'agent-saas',
  teamMode: 'small-ai-team',
  dataProfile: 'ai-native',
  operatorMode: 'agent-paired',
  launchPriority: 'production',
}

export const productMotionOptions: PlannerOption<ProductMotionId>[] = [
  {
    id: 'agent-saas',
    label: 'AI SaaS',
    summary: 'User auth, product data, file flows, and model calls in one stack.',
  },
  {
    id: 'internal-tool',
    label: 'Internal tool',
    summary: 'Fast ops software for a team that needs permissions and safe defaults.',
  },
  {
    id: 'consumer-app',
    label: 'Consumer app',
    summary: 'A classic frontend that now needs auth, APIs, storage, and launch speed.',
  },
  {
    id: 'migration',
    label: 'Migration',
    summary: 'Move an existing backend or Supabase-shaped app into a more agent-ready flow.',
  },
]

export const teamModeOptions: PlannerOption<TeamModeId>[] = [
  {
    id: 'solo-founder',
    label: 'Solo founder',
    summary: 'You want less setup drag and faster shipping with an AI-heavy loop.',
  },
  {
    id: 'small-ai-team',
    label: 'Small AI team',
    summary: 'A few builders need shared backend context without DevOps sprawl.',
  },
  {
    id: 'product-engineer',
    label: 'Product engineer',
    summary: 'You still want control, but the backend should stop slowing the product loop.',
  },
  {
    id: 'platform-team',
    label: 'Platform team',
    summary: 'More governance, migration pressure, and multi-surface backend responsibility.',
  },
]

export const dataProfileOptions: PlannerOption<DataProfileId>[] = [
  {
    id: 'relational',
    label: 'Relational app',
    summary: 'Tables, joins, user data, CRUD flows, and predictable APIs.',
  },
  {
    id: 'realtime',
    label: 'Realtime app',
    summary: 'Live updates, shared state, events, and collaboration-style flows.',
  },
  {
    id: 'file-heavy',
    label: 'File-heavy app',
    summary: 'Uploads, buckets, previews, and signed asset access matter from day one.',
  },
  {
    id: 'ai-native',
    label: 'AI-native app',
    summary: 'Agents, model calls, MCP, and backend context need to work together.',
  },
]

export const operatorModeOptions: PlannerOption<OperatorModeId>[] = [
  {
    id: 'human-led',
    label: 'Human-led',
    summary: 'Developers stay in charge, with AI used mostly for code generation.',
  },
  {
    id: 'agent-paired',
    label: 'Agent-paired',
    summary: 'Humans approve, but agents should understand schemas, auth, and services.',
  },
  {
    id: 'agent-operated',
    label: 'Agent-operated',
    summary: 'Agents are expected to provision, inspect, and modify backend systems directly.',
  },
]

export const launchPriorityOptions: PlannerOption<LaunchPriorityId>[] = [
  {
    id: 'speed',
    label: 'Launch fast',
    summary: 'You care most about a working product path this week.',
  },
  {
    id: 'production',
    label: 'Ship production',
    summary: 'Reliability, access control, and fewer integration hops matter now.',
  },
  {
    id: 'migration',
    label: 'Reduce migration drag',
    summary: 'You need a cleaner path away from a fragmented or human-only backend workflow.',
  },
  {
    id: 'governance',
    label: 'Stay governed',
    summary: 'You need safer operator boundaries, support, and clearer review surfaces.',
  },
]

function clampScore(score: number) {
  return Math.max(52, Math.min(96, score))
}

function dedupe<T>(items: T[]) {
  return [...new Set(items)]
}

export function analyzePlannerSelection(selection: PlannerSelection): PlannerResult {
  let fitScore = 66

  if (selection.productMotion === 'agent-saas') fitScore += 10
  if (selection.productMotion === 'migration') fitScore += 8
  if (selection.productMotion === 'consumer-app') fitScore += 4

  if (selection.teamMode === 'small-ai-team') fitScore += 8
  if (selection.teamMode === 'solo-founder') fitScore += 4
  if (selection.teamMode === 'platform-team') fitScore += 6

  if (selection.dataProfile === 'ai-native') fitScore += 9
  if (selection.dataProfile === 'realtime') fitScore += 6
  if (selection.dataProfile === 'file-heavy') fitScore += 5

  if (selection.operatorMode === 'agent-paired') fitScore += 8
  if (selection.operatorMode === 'agent-operated') fitScore += 12

  if (selection.launchPriority === 'production') fitScore += 7
  if (selection.launchPriority === 'migration') fitScore += 8
  if (selection.launchPriority === 'governance') fitScore += 5

  const score = clampScore(fitScore)
  const fitLabel = score >= 88 ? 'High fit' : score >= 76 ? 'Strong fit' : 'Selective fit'

  const modules: PlannerModule[] = [
    { label: 'Postgres APIs', detail: 'Schema-first database plus instant app-facing endpoints.' },
    { label: 'Auth', detail: 'Email, sessions, and OAuth without a hand-built auth layer.' },
    { label: 'Edge Functions', detail: 'Logic that stays close to the product instead of drifting into glue code.' },
  ]

  if (selection.dataProfile === 'file-heavy' || selection.productMotion === 'consumer-app') {
    modules.push({ label: 'Storage', detail: 'Buckets, signed access, and file metadata that fit product flows.' })
  }

  if (selection.dataProfile === 'realtime') {
    modules.push({ label: 'Realtime', detail: 'Live events and updates for collaborative or event-heavy apps.' })
  }

  if (selection.dataProfile === 'ai-native' || selection.operatorMode !== 'human-led') {
    modules.push({ label: 'MCP layer', detail: 'Backend context that coding agents can inspect and operate.' })
    modules.push({ label: 'AI gateway', detail: 'One API layer for model access instead of scattered provider glue.' })
  }

  if (selection.launchPriority !== 'speed' || selection.productMotion === 'migration') {
    modules.push({ label: 'Deployments', detail: 'A clearer path from local build to live application delivery.' })
  }

  if (selection.teamMode === 'platform-team' || selection.launchPriority === 'governance') {
    modules.push({ label: 'Compute lane', detail: 'A place for longer-running services when functions stop being enough.' })
  }

  let recommendedPlanId: PlanId = 'pro'
  if (
    selection.teamMode === 'solo-founder' &&
    selection.launchPriority === 'speed' &&
    selection.operatorMode === 'human-led' &&
    selection.productMotion !== 'migration'
  ) {
    recommendedPlanId = 'starter'
  }

  if (
    selection.teamMode === 'platform-team' ||
    selection.launchPriority === 'migration' ||
    selection.launchPriority === 'governance' ||
    (selection.operatorMode === 'agent-operated' && selection.dataProfile === 'ai-native')
  ) {
    recommendedPlanId = 'scale'
  }

  const recommendedGuidePaths = dedupe([
    selection.productMotion === 'migration' ? '/vs-supabase' : '/docs',
    selection.operatorMode !== 'human-led' || selection.dataProfile === 'ai-native' ? '/ai' : '/dev',
    selection.teamMode === 'solo-founder' ? '/github' : '/pricing',
  ])

  const reasons = dedupe([
    selection.operatorMode === 'agent-operated'
      ? 'Your backend needs to be operable by agents, not just documented for humans.'
      : 'You still benefit from a backend surface that agents can understand when the product loop speeds up.',
    selection.dataProfile === 'ai-native'
      ? 'The AI gateway plus MCP story matters because model calls and backend state live in the same product loop.'
      : 'You still need a clean path for auth, data, and logic even when the app is not AI-first.',
    selection.productMotion === 'migration'
      ? 'A migration is easier when the next backend reduces tool fragmentation instead of adding another layer.'
      : 'The core value is compressing backend setup into something a product team can keep moving through.',
  ])

  const watchouts = dedupe([
    selection.operatorMode === 'human-led'
      ? 'If your team wants full manual control forever, the agent-first value will matter less than the clean backend primitives.'
      : 'Agent-operated backends still need approval boundaries, especially around schema and auth changes.',
    selection.dataProfile === 'file-heavy'
      ? 'File-heavy products should define bucket visibility and upload policy before production traffic arrives.'
      : 'Do not let the excitement around fast setup hide the need for good schema decisions.',
    selection.launchPriority === 'migration'
      ? 'Migration work wins when you inventory auth, data, storage, and environment differences before rewriting app code.'
      : 'Fast launch paths convert best when the first backend scope stays small and obvious.',
  ])

  const nextSteps = dedupe([
    'Map the first user-facing workflow that must work end to end: auth, data write, file path, or model call.',
    selection.productMotion === 'migration'
      ? 'Compare the current backend against the InsForge operator model before moving live traffic.'
      : 'Use the planner result to keep the first backend scope narrow enough to ship quickly.',
    recommendedPlanId === 'scale'
      ? 'Review the Scale plan only if migration depth, governance, or operator load is genuinely higher.'
      : 'Start on Pro annual unless you already know the project is either tiny or migration-heavy.',
  ])

  const estimatedLaunchWindow =
    recommendedPlanId === 'starter'
      ? '1 to 2 focused days'
      : recommendedPlanId === 'scale'
        ? '1 to 2 implementation weeks'
        : '3 to 5 working days'

  const headline =
    recommendedPlanId === 'starter'
      ? 'A lean InsForge stack is enough to get this product live fast.'
      : recommendedPlanId === 'scale'
        ? 'This looks like a serious operator workflow, not just a simple app backend.'
        : 'InsForge fits best as the default backend layer for this product shape.'

  const summary =
    recommendedPlanId === 'starter'
      ? 'Keep the first stack small: database, auth, functions, and the minimum storage or AI pieces that unblock launch.'
      : recommendedPlanId === 'scale'
        ? 'Plan for a fuller operator surface: agent-visible context, stronger support, and cleaner migration or governance boundaries.'
        : 'The strongest motion is a production-minded core: auth, Postgres APIs, functions, storage or AI where needed, and a path your agents can reason about.'

  const operatorMessage =
    selection.operatorMode === 'agent-operated'
      ? 'Best when backend changes are expected to happen from coding agents inside the real development loop.'
      : selection.operatorMode === 'agent-paired'
        ? 'Best when humans still approve changes, but the agent should stop feeling blind on the backend.'
        : 'Best when the team wants a cleaner backend foundation today and optional agent leverage later.'

  const proofLine =
    selection.productMotion === 'migration'
      ? 'Use the compare and docs pages before checkout so the migration story stays concrete.'
      : 'Use the docs and AI pages before checkout if you want the stack rationale to stay concrete.'

  return {
    fitScore: score,
    fitLabel,
    headline,
    summary,
    operatorMessage,
    proofLine,
    recommendedPlanId,
    recommendedGuidePaths,
    estimatedLaunchWindow,
    modules,
    reasons,
    watchouts,
    nextSteps,
  }
}
