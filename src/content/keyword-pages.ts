export type KeywordSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type KeywordPage = {
  path: string
  title: string
  description: string
  h1: string
  eyebrow: string
  intent: string
  lede: string
  sections: KeywordSection[]
  faqs: Array<{ question: string; answer: string }>
}

export const keywordPages: KeywordPage[] = [
  {
    path: '/github',
    title: 'InsForge GitHub Guide for Self-Hosting and Evaluation',
    description:
      'A practical map of the InsForge GitHub repository: what is in the repo, what the open-source version covers, and when the managed path makes more sense.',
    h1: 'InsForge GitHub: what the repository gives you before you buy anything',
    eyebrow: 'Repository guide',
    intent: 'For builders who found InsForge on GitHub first and want to know whether the repository alone is enough for their project.',
    lede:
      'The InsForge GitHub repository is useful because it shows the real product surface, not just the marketing promise. The public codebase includes the backend, auth, functions, frontend, docs, examples, Docker setup, and OpenAPI assets, which makes it a serious place to evaluate architecture fit before paying for a hosted path.',
    sections: [
      {
        heading: 'What the repository is actually good for',
        paragraphs: [
          'The repository is the right place to understand the open-source boundary. You can inspect how InsForge brings together Postgres, authentication, storage, edge functions, and the agent-facing semantic layer instead of guessing from a landing page.',
          'It is also the clearest route for teams deciding whether self-hosting is enough. If you have the appetite to run Docker, manage environments, and own the operational details, GitHub gives you a real starting point.',
        ],
        bullets: [
          'Good for architecture review, self-hosting evaluation, and contributor trust.',
          'Useful for teams that want to audit the auth, database, or function layers directly.',
          'Still separate from the convenience of a managed production path.',
        ],
      },
      {
        heading: 'When GitHub is enough and when it is not',
        paragraphs: [
          'GitHub is enough when you mainly want the software itself. It is not enough when the real blocker is operating the backend repeatedly across product changes, teammate handoffs, and agent-driven updates.',
          'That is where a managed commercial layer starts to matter. The value is not hiding the code. The value is shortening the path from repository confidence to a backend that stays operable as the product evolves.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is InsForge open source?',
        answer:
          'Yes. The public repository is open source and exposes the product surface clearly enough for a serious technical evaluation.',
      },
      {
        question: 'Why would someone still pay if the GitHub repo is public?',
        answer:
          'Because many teams are not buying source access. They are buying less operational drag, faster launch, and a cleaner production path.',
      },
    ],
  },
  {
    path: '/ai',
    title: 'InsForge AI Guide for Agent-Ready Backends',
    description:
      'Understand the InsForge AI story: MCP access, a unified AI gateway, and why the backend is designed to be operable by coding agents.',
    h1: 'InsForge AI: why the backend is built for coding agents, not just humans',
    eyebrow: 'AI layer',
    intent: 'For people searching InsForge AI because they want to know what makes it more than a normal backend with an LLM API bolted on.',
    lede:
      'InsForge matters in AI-heavy development because it treats backend context as something agents should be able to inspect and operate directly. The docs describe an MCP server for backend context, and the AI architecture docs describe a unified model gateway that exposes model access through one consistent surface.',
    sections: [
      {
        heading: 'The two AI layers that matter',
        paragraphs: [
          'The first layer is backend context. InsForge exposes schemas, services, and operations in a way that coding agents can understand, which is the real difference between AI-assisted code generation and AI-assisted backend operations.',
          'The second layer is model access. The AI docs describe a unified, OpenAI-compatible API path across multiple providers through OpenRouter, which reduces provider glue and lets the product keep one backend-facing model interface.',
        ],
        bullets: [
          'MCP gives agents structured backend context instead of blind prompting.',
          'The AI gateway keeps model access consistent across providers.',
          'This is most useful when product logic and model logic live in the same delivery loop.',
        ],
      },
      {
        heading: 'Who gets the most value from this',
        paragraphs: [
          'Small teams building with AI code editors benefit first, because they feel the gap between frontend speed and backend complexity the hardest. InsForge is trying to close exactly that gap.',
          'It also matters for teams that want agents to do more than write components. If the backend remains human-only, the product loop breaks as soon as the app needs auth, schema changes, storage, or background logic.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does InsForge AI replace normal backend primitives?',
        answer:
          'No. It sits on top of the usual primitives like auth, database, storage, and functions, but makes them more agent-operable.',
      },
      {
        question: 'Why is MCP important here?',
        answer:
          'Because it gives coding agents a structured way to discover and operate backend capabilities instead of improvising from partial context.',
      },
    ],
  },
  {
    path: '/vs-supabase',
    title: 'InsForge vs Supabase for AI-Native Development',
    description:
      'A useful InsForge vs Supabase comparison focused on operator model, agent workflows, and when each backend fits better.',
    h1: 'InsForge vs Supabase: the real difference is who the backend is designed for',
    eyebrow: 'Comparison',
    intent: 'For teams comparing InsForge and Supabase who care less about checkbox parity and more about how the backend is actually operated.',
    lede:
      'The official InsForge comparison page gets to the heart of it: both platforms cover the familiar backend surface of database, auth, storage, functions, and realtime. The more meaningful difference is operator model. Supabase is optimized for human-operated workflows, while InsForge is positioned for agentic coding where AI tools are expected to provision and operate backend systems directly.',
    sections: [
      {
        heading: 'What is similar',
        paragraphs: [
          'Both products give you the modern Postgres-shaped backend stack. If your shortlist is between InsForge and Supabase, you are already choosing between serious developer platforms rather than toy builders.',
          'That means the decision should not stop at feature parity. The better question is what kind of product loop you want for the next twelve months.',
        ],
        bullets: [
          'Managed Postgres foundation.',
          'Authentication and user management.',
          'Object storage and serverless logic.',
          'Realtime features and SDK access.',
        ],
      },
      {
        heading: 'What changes in practice',
        paragraphs: [
          'Supabase is excellent when your team wants explicit human control over SQL, dashboards, and backend decisions. InsForge becomes more compelling when the team wants coding agents to stop being frontend-only helpers and start operating the backend with real context.',
          'That makes InsForge especially interesting for AI-native product teams. It is not just a cheaper or more expensive Supabase. It is a different bet on who the primary backend operator will be.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should every Supabase user switch to InsForge?',
        answer:
          'No. Teams that prefer a strongly human-operated backend workflow may still prefer Supabase. InsForge is most compelling when agentic coding is central to how the team builds.',
      },
      {
        question: 'What is the fastest way to compare them honestly?',
        answer:
          'Map one real product workflow and ask which platform keeps that workflow cleaner when auth, schema changes, functions, and AI tooling all enter the picture.',
      },
    ],
  },
  {
    path: '/yc',
    title: 'InsForge YC Story and What It Signals',
    description:
      'A useful read on InsForge and YC: the repeated applications, the eventual P26 acceptance, and why the story matters to teams evaluating the product.',
    h1: 'InsForge YC: why the admission story matters more than the badge alone',
    eyebrow: 'YC story',
    intent: 'For people searching InsForge YC because they want to know whether the company has real momentum or just a nice tagline.',
    lede:
      'InsForge publicly shared that it joined Y Combinator in the P26 batch, and the more interesting detail is how it got there. In a March 22, 2026 founder post, CEO and co-founder Hang Huang wrote that the team kept applying, kept getting rejected, interviewed users deeply, and only then found the sharper thesis that pushed the product forward.',
    sections: [
      {
        heading: 'What the public YC story actually says',
        paragraphs: [
          'The story is not just “we got into YC.” It is that the founders were rejected repeatedly, kept shipping, and used user interviews to decide not to pivot away from the product. That is useful signal because it suggests persistence and a tighter understanding of the real customer.',
          'Their March 31, 2026 update then tied that YC milestone to a faster shipping cadence: InsForge 2.0, Product Hunt traction, GitHub momentum, and dashboard improvements. That is more meaningful than a logo wall.',
        ],
        bullets: [
          'Publicly described as YC P26.',
          'Admission followed multiple rejections and user research.',
          'Useful as a signal of pace and founder persistence, not a substitute for product fit.',
        ],
      },
      {
        heading: 'Why the YC signal matters',
        paragraphs: [
          'YC matters only insofar as it lowers risk around team quality and execution speed. It should never replace a product evaluation, but it can make a new infrastructure product feel less speculative.',
          'The useful role of the YC story is supporting trust. The product still has to solve the backend-operability problem well.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What batch is InsForge in?',
        answer:
          'The company publicly said it joined Y Combinator in the P26 batch in its March 31, 2026 update.',
      },
      {
        question: 'Does YC mean the product is automatically right for me?',
        answer:
          'No. It is a trust signal about team quality and momentum, but the real decision still depends on your product shape and operator model.',
      },
    ],
  },
  {
    path: '/founder',
    title: 'InsForge Founder Guide: Hang Huang and Tony Chang',
    description:
      'Public founder context for InsForge: who is building it, what the public writing suggests, and how the founder story connects to the product.',
    h1: 'InsForge founder context: what the public story tells you about the product',
    eyebrow: 'Founder context',
    intent: 'For readers searching InsForge founder and wanting the useful public context, not gossip or recycled profile fluff.',
    lede:
      'InsForge’s public writing points most clearly to two founders: Hang Huang, listed as CEO and co-founder on multiple official posts, and Tony Chang, listed as CTO and co-founder on technical and product posts. The useful takeaway is not biography trivia. It is how their writing reveals the product thesis.',
    sections: [
      {
        heading: 'What their public writing emphasizes',
        paragraphs: [
          'Hang Huang writes most clearly about user discovery, pricing, and the long road into YC. Tony Chang writes more often about technical architecture, MCP, infrastructure, and product features. Together, that pattern reads like a team split between market learning and deep product execution.',
          'That matters because InsForge is not a thin wrapper product. It is trying to sit directly on top of auth, database, storage, functions, model access, and deployment concerns.',
        ],
        bullets: [
          'Hang Huang appears publicly as CEO and co-founder.',
          'Tony Chang appears publicly as CTO and co-founder.',
          'The founder content consistently reinforces an agent-first backend thesis.',
        ],
      },
      {
        heading: 'How the founder story helps evaluation',
        paragraphs: [
          'Founder context is useful when it explains why the product feels the way it does. In InsForge’s case, the public story helps explain the stubborn focus on coding agents as first-class backend operators.',
          'That is more useful than a generic founder bio because it connects directly to whether the product direction aligns with how your team wants to build.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Who is the InsForge founder?',
        answer:
          'Publicly, Hang Huang is listed as CEO and co-founder and Tony Chang is listed as CTO and co-founder across official InsForge posts.',
      },
      {
        question: 'Why should teams care about the founders?',
        answer:
          'Only because their public writing reveals whether the team understands the technical and workflow pain the product claims to solve.',
      },
    ],
  },
  {
    path: '/dev',
    title: 'InsForge Dev Workflow Guide',
    description:
      'A practical InsForge dev guide: how developers should think about docs, MCP, backend primitives, and the fastest evaluation path.',
    h1: 'InsForge dev workflow: how to move from docs to a working backend without drift',
    eyebrow: 'Developer workflow',
    intent: 'For developers who want the mental model behind InsForge before they spend hours wiring a backend the old way.',
    lede:
      'The developer story around InsForge works best when you stop thinking of it as a random pile of backend features and start thinking in one loop: docs, MCP, primitives, functions, and deployment. That is the product shape the official docs keep reinforcing.',
    sections: [
      {
        heading: 'Start with the smallest full loop',
        paragraphs: [
          'A clean evaluation starts with one product workflow: create a user, write data, store a file, call a function, or invoke a model. If that loop stays clean, the platform is worth deeper consideration.',
          'The mistake many teams make is trying to evaluate every capability at once. InsForge is easiest to judge when you test one end-to-end path and see how much context the agent can retain and use.',
        ],
        bullets: [
          'Read the docs map before writing code.',
          'Connect MCP early if agent-assisted development is part of the plan.',
          'Keep the first function, schema, and auth flow narrow.',
        ],
      },
      {
        heading: 'Where the developer experience can really improve',
        paragraphs: [
          'The claimed advantage is not merely fewer API calls. It is a backend that agents can reason about with less hallucinated glue code. That matters most when schemas change quickly and the frontend is already moving fast.',
          'If your developers still want the backend entirely human-operated, the main benefit becomes the backend stack itself rather than the agent workflow.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should developers connect MCP on day one?',
        answer:
          'If AI coding assistants are central to the workflow, yes. It is one of the clearest product differences versus a normal backend setup.',
      },
      {
        question: 'What is the best first proof of value?',
        answer:
          'One complete workflow that touches auth, data, or functions and can still be understood by the coding assistant on the next edit pass.',
      },
    ],
  },
  {
    path: '/docs',
    title: 'InsForge Docs Guide and Reading Order',
    description:
      'A useful map of the InsForge docs: what to read first, how the docs are organized, and which sections matter most before launch.',
    h1: 'InsForge docs: the fastest reading order for real product decisions',
    eyebrow: 'Documentation guide',
    intent: 'For people landing on InsForge docs and wanting a faster path through the documentation than random link hopping.',
    lede:
      'The official documentation is broad enough that a little reading order matters. The useful path is not every page. It is the pages that explain the mental model first: introduction, authentication, database, storage, functions, AI, deployments, and MCP setup.',
    sections: [
      {
        heading: 'The reading order that saves time',
        paragraphs: [
          'Start with the introduction because it explains the product thesis directly: an AI-optimized backend-as-a-service with PostgreSQL, JWT auth, S3-compatible storage, and agent-friendly interfaces. Then move to the primitives that your first workflow will actually need.',
          'From there, read the architecture pages that match your workload. Database and auth usually come first. Storage follows if files matter. Functions matter when logic leaves the frontend. AI and deployments matter once the app loop becomes more agent-driven or production-minded.',
        ],
        bullets: [
          'Introduction for product thesis and vocabulary.',
          'Authentication and database before everything else for most apps.',
          'Functions, AI, deployments, or MCP only as your first workflow demands them.',
        ],
      },
      {
        heading: 'What the docs tell you about the product direction',
        paragraphs: [
          'The documentation repeatedly reinforces that InsForge is designed for agent-friendly development rather than only dashboard-driven human operation. That makes the docs useful not just as implementation detail, but as a clear signal of product philosophy.',
          'If that philosophy matches the way your team builds, the docs will feel unusually coherent. If it does not, you will know quickly.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where should a new team start in the docs?',
        answer:
          'Start at the introduction, then move straight into the primitives needed for your first end-to-end workflow rather than reading the entire tree.',
      },
      {
        question: 'Which doc area is the most unique?',
        answer:
          'MCP setup and the agent-facing backend architecture are the most distinctive parts because they reveal how InsForge wants coding agents to work.',
      },
    ],
  },
]

const keywordPageMap = new Map(keywordPages.map((page) => [page.path, page]))

export function normalizeKeywordPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

export function findKeywordPageByPath(pathname: string) {
  return keywordPageMap.get(normalizeKeywordPath(pathname)) ?? null
}
