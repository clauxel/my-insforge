import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  FileStack,
  FolderKanban,
  Globe2,
  LockKeyhole,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from 'lucide-react'

import { findKeywordPageByPath, keywordPages, type KeywordPage } from './content/keyword-pages'
import { trackEvent, trackPageView } from './lib/analytics'
import {
  analyzePlannerSelection,
  defaultPlannerSelection,
  launchPriorityOptions,
  operatorModeOptions,
  productMotionOptions,
  teamModeOptions,
  dataProfileOptions,
  type PlanId,
  type PlannerSelection,
} from './lib/planner'
import { buildSeoDocument, syncSeoDocument } from './lib/seo'
import { deriveRouteView, normalizePathname, scrollToHashTarget, type RouteView } from './lib/routing'

const defaultPublicAppOrigin = 'https://insforge.space'

type Billing = 'monthly' | 'annual'

type CheckoutModalState = {
  planId: PlanId
  billing: Billing
  loadingKey: string
  status: 'loading' | 'popup' | 'retry'
  checkoutUrl?: string
}

const ctaPrimary = 'Start Pro annual'

const plans: Array<{
  id: PlanId
  name: string
  tagline: string
  monthlyUsd: number
  bullets: string[]
  popular?: boolean
}> = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'A focused lane for one serious prototype or one lean production app.',
    monthlyUsd: 19,
    bullets: ['Core auth, database, and function path', 'One managed product lane', 'Email support and docs guidance', 'Best for solo founders moving fast'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'The default commercial path for AI-built products with real users.',
    monthlyUsd: 49,
    popular: true,
    bullets: ['Agent-ready backend planning', 'Auth, storage, functions, and AI workflow support', 'Priority setup help and faster unblock path', 'Best default for production-minded teams'],
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'For migrations, heavier operator load, and a broader production surface.',
    monthlyUsd: 149,
    bullets: ['Migration and governance guidance', 'Deeper rollout review', 'Higher-touch support on product changes', 'Better fit for platform or multi-app teams'],
  },
]

const proofItems = [
  { label: 'Core surfaces', value: '7', detail: 'Auth, Postgres APIs, storage, realtime, functions, AI, deployment' },
  { label: 'Open-source base', value: 'GitHub', detail: 'Evaluate the repository before you ever commit to a hosted path' },
  { label: 'Trust signal', value: 'YC P26', detail: 'Public founder story plus a visible shipping cadence' },
  { label: 'Annual savings', value: '50%', detail: 'Pro annual is selected by default for teams ready to keep shipping' },
]

const moduleCards = [
  {
    title: 'Semantic backend layer',
    body: 'The differentiator is not just Postgres. It is a backend surface that coding agents can inspect, reason about, and operate.',
    icon: <Workflow size={20} />,
  },
  {
    title: 'Postgres APIs',
    body: 'Schema-first data with fast app-facing APIs so the team does not hand-build basic backend CRUD every sprint.',
    icon: <Database size={20} />,
  },
  {
    title: 'Auth and sessions',
    body: 'User auth, sessions, and OAuth remove one of the most error-prone parts of an AI-generated product stack.',
    icon: <LockKeyhole size={20} />,
  },
  {
    title: 'Storage and files',
    body: 'Signed access, buckets, and file flows matter as soon as the app stops being a pure demo.',
    icon: <FolderKanban size={20} />,
  },
  {
    title: 'Edge functions',
    body: 'Product logic gets a home without forcing the team into a separate backend services maze too early.',
    icon: <FileStack size={20} />,
  },
  {
    title: 'AI gateway and MCP',
    body: 'Model access and backend context sit in the same operational loop, which is exactly where AI-built products usually break.',
    icon: <BrainCircuit size={20} />,
  },
]

const comparisonPoints = [
  {
    title: 'Supabase is excellent when humans are the operators',
    body: 'If your team wants dashboards, SQL, and a more human-centered backend loop, Supabase still fits many products extremely well.',
  },
  {
    title: 'InsForge gets more interesting when agents stop at the frontend today',
    body: 'The real pitch is agent-readable backend context, not a copycat list of primitives that already exist elsewhere.',
  },
  {
    title: 'Buy the operator model, not the logo',
    body: 'The better platform is the one that matches how your team will actually keep shipping after launch week.',
  },
]

const pricingFaqs = [
  {
    question: 'Why is Pro selected by default?',
    answer:
      'Because most teams arriving from AI-assisted development already need more than a tiny prototype lane. Pro is the simplest commercial default.',
  },
  {
    question: 'Why does annual billing cost 50% less?',
    answer:
      'It rewards teams that already know they will be iterating on the product longer than one billing cycle, which is the normal case for real backend work.',
  },
  {
    question: 'Can I still use the open-source repository instead?',
    answer:
      'Yes. The public repository remains the right place to evaluate self-hosting or contributor trust before you decide whether the managed path is worth paying for.',
  },
]

const legalPrivacySections = [
  {
    title: 'What we collect',
    paragraphs: [
      'This service collects limited analytics, checkout metadata, and the information you submit through payment or support flows.',
      'We do not ask you to upload private datasets just to use the homepage planner. The planner runs in the browser from your selections only.',
    ],
  },
  {
    title: 'Why we collect it',
    paragraphs: [
      'We use analytics to understand which pages, calls to action, and plan flows are working and where the site creates confusion.',
      'We use payment metadata to confirm purchases, return users to the homepage, and support onboarding after checkout.',
    ],
  },
]

const legalTermsSections = [
  {
    title: 'Service scope',
    paragraphs: [
      'The managed InsForge site covers product planning, plan selection, hosted checkout, and related support around the InsForge workflow.',
      'The upstream open-source repository, official documentation, and related public assets remain independently available through their own channels.',
    ],
  },
  {
    title: 'Payments and returns',
    paragraphs: [
      'Payments are processed by Creem in a hosted popup window. Successful checkouts return the user to the homepage.',
      'Displayed annual pricing reflects a 50% discount versus the monthly run-rate for the same plan.',
    ],
  },
]

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const rawText = await response.text()
  if (!rawText.trim()) return null
  try {
    return JSON.parse(rawText) as T
  } catch {
    return null
  }
}

async function createCheckoutSession(planId: PlanId, billing: Billing) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, billing }),
  })

  const payload = await readJsonResponse<{ ok?: boolean; checkoutUrl?: string; error?: string }>(response)
  if (!response.ok || !payload?.ok || !payload.checkoutUrl) {
    throw new Error(payload?.error || 'Checkout could not be started.')
  }

  return payload.checkoutUrl
}

function openCenteredCheckoutWindow() {
  const width = 560
  const height = 760
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
  const popup = window.open(
    'about:blank',
    'insforge-checkout',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  )

  if (popup) {
    try {
      popup.document.title = 'Opening secure checkout'
      popup.document.body.innerHTML =
        '<main style="min-height:100vh;display:grid;place-items:center;background:#0e1318;color:#f5efe4;font-family:ui-sans-serif,system-ui,sans-serif;text-align:center;padding:32px"><div><h1 style="font-size:22px;margin:0 0 8px">Opening secure checkout...</h1><p style="margin:0;color:#b8b1a5">Your InsForge payment window is being prepared.</p></div></main>'
    } catch {
      /* Existing named checkout windows can be cross-origin. */
    }
  }

  return popup
}

function sendPopupToCheckout(popup: Window | null, url: string) {
  if (!popup || popup.closed) return false

  try {
    popup.location.replace(url)
    popup.focus()
    return true
  } catch {
    return false
  }
}

function useRouteSignal() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [search, setSearch] = useState(() => window.location.search)

  function navigate(to: string) {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    setPathname(url.pathname)
    setSearch(url.search)

    if (url.hash) {
      requestAnimationFrame(() => scrollToHashTarget(url.hash))
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onPop = () => {
      setPathname(window.location.pathname)
      setSearch(window.location.search)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return { pathname, search, navigate }
}

function CheckoutDoneBridge({ publicAppOrigin }: { publicAppOrigin: string }) {
  useEffect(() => {
    const origin = window.location.origin || new URL(publicAppOrigin).origin

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'insforge-checkout-complete' }, origin)
      return
    }

    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'insforge-checkout-complete' }, origin)
      } catch {
        /* The opener may be closed or cross-origin. */
      }
      window.close()
      return
    }

    window.location.replace(`${origin}/?payment=success`)
  }, [publicAppOrigin])

  return (
    <main className="ifg-main">
      <section className="ifg-center-card">
        <p className="ifg-eyebrow">Checkout</p>
        <h1>Finishing checkout...</h1>
        <p className="ifg-muted">You will return to the InsForge homepage when the hosted payment session closes.</p>
      </section>
    </main>
  )
}

export default function App() {
  const { pathname, search, navigate } = useRouteSignal()
  const routeView: RouteView = useMemo(() => deriveRouteView(pathname), [pathname])
  const normalizedPath = normalizePathname(pathname)
  const keywordPage = useMemo(() => findKeywordPageByPath(pathname), [pathname])
  const plannerResult = useMemo(() => analyzePlannerSelection(defaultPlannerSelection), [])

  const [publicAppOrigin, setPublicAppOrigin] = useState(defaultPublicAppOrigin)
  const [plannerSelection, setPlannerSelection] = useState<PlannerSelection>(defaultPlannerSelection)
  const [headerCompact, setHeaderCompact] = useState(() => window.scrollY > 18)
  const [billing, setBilling] = useState<Billing>('annual')
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>('pro')
  const [checkoutLoadingKey, setCheckoutLoadingKey] = useState<string | null>(null)
  const [checkoutModal, setCheckoutModal] = useState<CheckoutModalState | null>(null)

  const planner = useMemo(() => analyzePlannerSelection(plannerSelection), [plannerSelection])

  useEffect(() => {
    let cancelled = false
    fetch('/api/runtime')
      .then((response) => readJsonResponse<{ publicAppOrigin?: string }>(response))
      .then((payload) => {
        if (!cancelled && payload?.publicAppOrigin) {
          setPublicAppOrigin(payload.publicAppOrigin)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const seo = buildSeoDocument({
      pathname,
      routeView,
      publicAppOrigin,
      keywordPage,
    })
    syncSeoDocument(seo)
  }, [keywordPage, pathname, publicAppOrigin, routeView])

  useEffect(() => {
    const onScroll = () => setHeaderCompact(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const visiblePath = `${pathname}${search}`
    trackPageView(visiblePath)
  }, [pathname, search])

  useEffect(() => {
    const allowed = new Set([window.location.origin, new URL(publicAppOrigin).origin])
    const onMessage = (event: MessageEvent) => {
      if (!allowed.has(event.origin)) return
      if (event.data?.type === 'insforge-checkout-complete') {
        setCheckoutModal(null)
        trackEvent('checkout_complete_return', { path: pathname })
        navigate('/?payment=success')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [navigate, pathname, publicAppOrigin])

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      requestAnimationFrame(() => scrollToHashTarget(hash))
    }
  }, [pathname])

  function updatePlannerSelection<Key extends keyof PlannerSelection>(key: Key, value: PlannerSelection[Key]) {
    setPlannerSelection((current) => {
      const next = { ...current, [key]: value }
      return next
    })
    trackEvent('planner_change', { key, value })
  }

  async function startHostedCheckout(planId: PlanId, nextBilling: Billing, loadingKey: string) {
    setSelectedPlanId(planId)
    setBilling(nextBilling)
    setCheckoutLoadingKey(loadingKey)
    setCheckoutModal({ planId, billing: nextBilling, loadingKey, status: 'loading' })
    trackEvent('checkout_start', { planId, billing: nextBilling })

    const popup = openCenteredCheckoutWindow()

    try {
      const url = await createCheckoutSession(planId, nextBilling)
      const popupOpened = sendPopupToCheckout(popup, url)
      if (!popupOpened) {
        try {
          if (popup && !popup.closed) popup.close()
        } catch {}
        throw new Error('Popup could not be opened.')
      }

      setCheckoutModal({ planId, billing: nextBilling, loadingKey, status: 'popup', checkoutUrl: url })
      trackEvent('checkout_popup_opened', { planId, billing: nextBilling })
    } catch (error) {
      try {
        if (popup && !popup.closed) popup.close()
      } catch {}
      setCheckoutModal({ planId, billing: nextBilling, loadingKey, status: 'retry' })
      trackEvent('checkout_error', {
        planId,
        billing: nextBilling,
        message: error instanceof Error ? error.message : 'unknown',
      })
    } finally {
      setCheckoutLoadingKey(null)
    }
  }

  function openGuide(path: string) {
    trackEvent('guide_open', { path })
    navigate(path)
  }

  function jumpToPricing() {
    setBilling('annual')
    setSelectedPlanId('pro')
    trackEvent('pricing_review')
    navigate('/pricing')
  }

  function startDefaultCheckout(source: string) {
    trackEvent('primary_cta_click', { source })
    void startHostedCheckout('pro', 'annual', source)
  }

  const renderHeader = () => (
    <header className={`ifg-header${headerCompact ? ' compact' : ''}`}>
      <div className="ifg-header-inner">
        <a
          className="ifg-brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <span className="ifg-brand-mark" aria-hidden>
            <Sparkles size={20} />
          </span>
          <span className="ifg-brand-copy">
            <strong>InsForge</strong>
            <span>Agent-ready backend for AI-built products</span>
          </span>
        </a>

        <nav className="ifg-nav" aria-label="Primary">
          <a
            href="/#planner"
            onClick={(event) => {
              event.preventDefault()
              navigate('/#planner')
            }}
          >
            Planner
          </a>
          <a
            href="/#modules"
            onClick={(event) => {
              event.preventDefault()
              navigate('/#modules')
            }}
          >
            Modules
          </a>
          <a
            href="/vs-supabase"
            onClick={(event) => {
              event.preventDefault()
              navigate('/vs-supabase')
            }}
          >
            Compare
          </a>
          <a
            href="/pricing"
            onClick={(event) => {
              event.preventDefault()
              navigate('/pricing')
            }}
          >
            Pricing
          </a>
          <a
            href="/docs"
            onClick={(event) => {
              event.preventDefault()
              navigate('/docs')
            }}
          >
            Docs
          </a>
        </nav>

        <button type="button" className="ifg-btn ifg-btn-primary ifg-header-cta" onClick={() => startDefaultCheckout('header-pro-annual')}>
          <Rocket size={16} />
          {ctaPrimary}
        </button>
      </div>
    </header>
  )

  const renderCheckoutModal = () => {
    if (!checkoutModal) return null

    const checkoutUrl = checkoutModal.status === 'popup' ? checkoutModal.checkoutUrl : undefined

    return (
      <div className="ifg-checkout-backdrop" role="presentation">
        <section className="ifg-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <button
            type="button"
            className="ifg-checkout-close"
            aria-label="Close checkout"
            onClick={() => {
              setCheckoutModal(null)
              trackEvent('checkout_overlay_closed', { status: checkoutModal.status })
            }}
          >
            <X size={18} />
          </button>
          {checkoutUrl ? (
            <div className="ifg-checkout-copy">
              <p className="ifg-eyebrow">Secure checkout</p>
              <h2 id="checkout-title">Creem checkout opened.</h2>
              <p className="ifg-muted">
                Complete payment in the centered popup. This page stays in place and returns to the homepage after success.
              </p>
              <div className="ifg-checkout-actions">
                <a className="ifg-btn ifg-btn-primary" href={checkoutUrl} target="_blank" rel="noreferrer noopener">
                  Focus payment window
                </a>
                <button type="button" className="ifg-btn ifg-btn-ghost" onClick={() => setCheckoutModal(null)}>
                  Keep reviewing
                </button>
              </div>
            </div>
          ) : checkoutModal.status === 'loading' ? (
            <div className="ifg-checkout-loading" aria-live="polite">
              <span />
              Preparing secure checkout...
            </div>
          ) : (
            <div className="ifg-checkout-copy">
              <p className="ifg-eyebrow">Popup needed</p>
              <h2 id="checkout-title">Checkout could not open yet.</h2>
              <p className="ifg-muted">
                Allow the popup window and try again. The payment flow is designed to stay in a centered Creem window instead of replacing this page.
              </p>
              <div className="ifg-checkout-actions">
                <button
                  type="button"
                  className="ifg-btn ifg-btn-primary"
                  onClick={() => void startHostedCheckout(checkoutModal.planId, checkoutModal.billing, checkoutModal.loadingKey)}
                  disabled={checkoutLoadingKey !== null}
                >
                  Open payment popup
                </button>
                <button type="button" className="ifg-btn ifg-btn-ghost" onClick={() => setCheckoutModal(null)}>
                  Review plans
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }

  const renderPlannerPanel = () => {
    const recommendedGuide = keywordPages.find((page) => page.path === planner.recommendedGuidePaths[0]) ?? keywordPages[0]

    return (
      <aside className="ifg-planner-card" aria-label="InsForge backend planner">
        <div className="ifg-panel-head">
          <div>
            <p className="ifg-eyebrow">Backend planner</p>
            <h2>Shape the backend before your agent gets lost in it.</h2>
          </div>
          <div className="ifg-badge-row">
            <span>No signup</span>
            <span>Browser-first</span>
          </div>
        </div>

        <div className="ifg-panel-actions">
          <button type="button" className="ifg-btn ifg-btn-primary" onClick={() => startDefaultCheckout('planner-top-pro-annual')}>
            <Rocket size={18} />
            {ctaPrimary}
          </button>
          <button type="button" className="ifg-btn ifg-btn-ghost" onClick={jumpToPricing}>
            <Globe2 size={18} />
            Review plans
          </button>
        </div>

        <div className="ifg-choice-stack">
          <section className="ifg-choice-group">
            <div className="ifg-choice-label">Product motion</div>
            <div className="ifg-choice-grid">
              {productMotionOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="ifg-choice-chip"
                  data-active={plannerSelection.productMotion === option.id ? 'true' : 'false'}
                  onClick={() => updatePlannerSelection('productMotion', option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.summary}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ifg-choice-group">
            <div className="ifg-choice-label">Team mode</div>
            <div className="ifg-choice-grid">
              {teamModeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="ifg-choice-chip"
                  data-active={plannerSelection.teamMode === option.id ? 'true' : 'false'}
                  onClick={() => updatePlannerSelection('teamMode', option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.summary}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ifg-choice-group">
            <div className="ifg-choice-label">Data profile</div>
            <div className="ifg-choice-grid">
              {dataProfileOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="ifg-choice-chip"
                  data-active={plannerSelection.dataProfile === option.id ? 'true' : 'false'}
                  onClick={() => updatePlannerSelection('dataProfile', option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.summary}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ifg-choice-row">
            <div className="ifg-choice-group">
              <div className="ifg-choice-label">Operator mode</div>
              <div className="ifg-segmented-row">
                {operatorModeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="ifg-segmented-button"
                    data-active={plannerSelection.operatorMode === option.id ? 'true' : 'false'}
                    onClick={() => updatePlannerSelection('operatorMode', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ifg-choice-group">
              <div className="ifg-choice-label">Launch priority</div>
              <div className="ifg-segmented-row">
                {launchPriorityOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="ifg-segmented-button"
                    data-active={plannerSelection.launchPriority === option.id ? 'true' : 'false'}
                    onClick={() => updatePlannerSelection('launchPriority', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="ifg-fit-summary">
          <div className="ifg-fit-score">
            <strong>{planner.fitScore}</strong>
            <span>{planner.fitLabel}</span>
          </div>
          <div className="ifg-fit-copy">
            <p className="ifg-fit-title">{planner.headline}</p>
            <p className="ifg-muted">{planner.summary}</p>
          </div>
        </div>

        <div className="ifg-module-grid">
          {planner.modules.map((module) => (
            <article key={module.label}>
              <strong>{module.label}</strong>
              <span>{module.detail}</span>
            </article>
          ))}
        </div>

        <div className="ifg-note-grid">
          <section className="ifg-note-card">
            <strong>Why this route</strong>
            <ul>
              {planner.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
          <section className="ifg-note-card">
            <strong>Watchouts</strong>
            <ul>
              {planner.watchouts.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="ifg-next-card">
          <div className="ifg-next-head">
            <div>
              <p className="ifg-eyebrow">Recommended next move</p>
              <h3>{planner.operatorMessage}</h3>
            </div>
            <span>{planner.estimatedLaunchWindow}</span>
          </div>
          <ol>
            {planner.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="ifg-next-actions">
            <button type="button" className="ifg-btn ifg-btn-primary" onClick={() => startDefaultCheckout('planner-pro-annual')}>
              <Play size={18} />
              {planner.recommendedPlanId === 'scale' ? 'Start Pro annual first' : ctaPrimary}
            </button>
            <button type="button" className="ifg-btn ifg-btn-ghost" onClick={() => openGuide(recommendedGuide.path)}>
              <ArrowRight size={18} />
              Open {recommendedGuide.eyebrow.toLowerCase()}
            </button>
          </div>
        </div>
      </aside>
    )
  }

  const renderPricingSection = (standalone = false) => (
    <section className={`ifg-section ifg-pricing-section${standalone ? ' standalone' : ''}`} id="pricing">
      <div className="ifg-section-head ifg-pricing-head">
        <div>
          <p className="ifg-eyebrow">Pricing</p>
          <h2>Pro annual is the default because most real AI products need more than a toy backend.</h2>
          <p>Annual billing is selected by default and is 50% cheaper than paying month to month.</p>
        </div>
        <div className="ifg-cycle" role="group" aria-label="Billing cycle">
          <button
            type="button"
            data-active={billing === 'monthly' ? 'true' : 'false'}
            onClick={() => {
              setBilling('monthly')
              trackEvent('billing_cycle_change', { billing: 'monthly' })
            }}
          >
            Monthly
          </button>
          <button
            type="button"
            data-active={billing === 'annual' ? 'true' : 'false'}
            onClick={() => {
              setBilling('annual')
              trackEvent('billing_cycle_change', { billing: 'annual' })
            }}
          >
            Annual - 50% off
          </button>
        </div>
      </div>

      <div className="ifg-plan-grid">
        {plans.map((plan) => {
          const monthly = billing === 'annual' ? plan.monthlyUsd * 0.5 : plan.monthlyUsd
          const strike = billing === 'annual' ? plan.monthlyUsd : null
          const loadingKey = `plan-${plan.id}-${billing}`

          return (
            <article className="ifg-plan-card" data-popular={plan.popular ? 'true' : 'false'} key={plan.id}>
              {plan.popular ? <span className="ifg-plan-badge">Default choice</span> : null}
              <h3>{plan.name}</h3>
              <p>{plan.tagline}</p>
              <div className="ifg-price-line">
                {formatMoney(monthly)}
                <small>/mo</small>
                {strike ? <span>{formatMoney(strike)}</span> : null}
              </div>
              <strong className="ifg-billing-note">
                {billing === 'annual' ? `${formatMoney(monthly * 12)} billed annually` : 'Billed monthly'}
              </strong>
              <div className="ifg-plan-actions">
                <button
                  type="button"
                  className={plan.popular ? 'ifg-btn ifg-btn-primary' : 'ifg-btn ifg-btn-ghost'}
                  onClick={() => void startHostedCheckout(plan.id, billing, loadingKey)}
                  onMouseEnter={() => setSelectedPlanId(plan.id)}
                  disabled={checkoutLoadingKey !== null}
                >
                  {checkoutLoadingKey === loadingKey
                    ? 'Opening secure checkout...'
                    : plan.id === 'pro'
                      ? ctaPrimary
                      : plan.id === 'scale'
                        ? 'Open Scale annual'
                        : 'Open Starter annual'}
                </button>
              </div>
              <ul>
                {plan.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={15} />
                    {bullet}
                  </li>
                ))}
              </ul>
              {selectedPlanId === plan.id ? <span className="ifg-plan-selected">Selected</span> : null}
            </article>
          )
        })}
      </div>

      {standalone ? (
        <div className="ifg-faq-grid">
          {pricingFaqs.map((faq) => (
            <article key={faq.question} className="ifg-faq-card">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )

  const renderHome = () => {
    const paymentSuccess = new URLSearchParams(search).get('payment') === 'success'

    return (
      <main className="ifg-main">
        {paymentSuccess ? (
          <section className="ifg-success-banner">
            <CheckCircle2 size={18} />
            Payment received. Your InsForge onboarding will continue from the email used at checkout.
          </section>
        ) : null}

        <section className="ifg-hero" id="planner">
          <div className="ifg-hero-copy">
            <p className="ifg-eyebrow">Backend built for AI-assisted development</p>
            <h1>Let your AI-built product grow a backend your agents can actually operate.</h1>
            <p className="ifg-lede">
              Use the planner to shape auth, Postgres APIs, storage, functions, AI gateway, and deployment priorities in the browser.
              Then open a hosted checkout without losing the page or your momentum.
            </p>

            <div className="ifg-hero-actions">
              <button type="button" className="ifg-btn ifg-btn-primary" onClick={() => startDefaultCheckout('hero-pro-annual')}>
                <Rocket size={18} />
                {ctaPrimary}
              </button>
              <span className="ifg-annual-save-note">Annual saves 50% vs monthly</span>
              <button type="button" className="ifg-btn ifg-btn-subtle" onClick={jumpToPricing}>
                <Globe2 size={18} />
                Review plans
              </button>
            </div>

            <div className="ifg-hero-trust">
              <span>Open-source core on GitHub</span>
              <span>MCP-aware workflow</span>
              <span>Payment returns home after success</span>
            </div>

            <div className="ifg-proof-card">
              <div className="ifg-proof-card-head">
                <span>Best default stack</span>
                <strong>{plannerResult.fitLabel}</strong>
              </div>
              <div className="ifg-proof-row">
                <span>Default planner outcome</span>
                <strong>{plannerResult.headline}</strong>
              </div>
              <div className="ifg-proof-row">
                <span>Commercial default</span>
                <strong>Pro annual, with 50% yearly savings already applied</strong>
              </div>
              <div className="ifg-proof-row">
                <span>What to do next</span>
                <strong>{plannerResult.proofLine}</strong>
              </div>
            </div>
          </div>

          {renderPlannerPanel()}
        </section>

        <section className="ifg-proof-strip" aria-label="Product proof points">
          {proofItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="ifg-section" id="modules">
          <div className="ifg-section-head">
            <p className="ifg-eyebrow">Why it works</p>
            <h2>InsForge is interesting because it solves the backend-operability gap, not just the backend checklist.</h2>
            <p>
              AI can generate a frontend quickly. The product usually stalls when auth, schemas, storage, and deployment become real.
              InsForge makes that backend decision concrete while the team still has momentum.
            </p>
          </div>

          <div className="ifg-card-grid">
            {moduleCards.map((card) => (
              <article className="ifg-card" key={card.title}>
                <div className="ifg-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ifg-section ifg-compare-strip" id="compare">
          <div className="ifg-section-head">
            <p className="ifg-eyebrow">Operator model</p>
            <h2>InsForge vs Supabase is really a question about who operates the backend after launch.</h2>
          </div>

          <div className="ifg-compare-grid">
            {comparisonPoints.map((point) => (
              <article key={point.title} className="ifg-compare-card">
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>

          <button type="button" className="ifg-btn ifg-btn-primary" onClick={() => openGuide('/vs-supabase')}>
            <BadgeCheck size={18} />
            Read InsForge vs Supabase
          </button>
        </section>

        {renderPricingSection(false)}

        <section className="ifg-section">
          <div className="ifg-section-head">
            <p className="ifg-eyebrow">Useful inner pages</p>
            <h2>Explore the InsForge questions people usually ask before choosing a backend.</h2>
            <p>GitHub, AI, comparison, YC, founder context, dev workflow, docs, and pricing each get a practical guide.</p>
          </div>
          <div className="ifg-guide-grid">
            {[...keywordPages, { path: '/pricing', eyebrow: 'Pricing', h1: 'InsForge pricing', intent: 'Choose the right managed plan and open checkout without leaving the current page.' }].map((page) => (
              <a
                className="ifg-guide-card"
                href={page.path}
                key={page.path}
                onClick={(event) => {
                  event.preventDefault()
                  navigate(page.path)
                }}
              >
                <span>{page.eyebrow}</span>
                <strong>{page.h1}</strong>
                <p>{page.intent}</p>
                <ChevronRight size={18} />
              </a>
            ))}
          </div>
        </section>
      </main>
    )
  }

  const renderKeywordPage = (page: KeywordPage) => (
    <main className="ifg-main">
      <article className="ifg-article">
        <a
          className="ifg-back-link"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <ArrowRight size={16} />
          Back to InsForge
        </a>
        <p className="ifg-eyebrow">{page.eyebrow}</p>
        <h1>{page.h1}</h1>
        <p className="ifg-lede">{page.lede}</p>
        <div className="ifg-article-intent">
          <strong>Best for</strong>
          <span>{page.intent}</span>
        </div>

        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section>
          <h2>Questions worth answering before checkout</h2>
          <div className="ifg-faq-list">
            {page.faqs.map((faq) => (
              <article key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="ifg-article-cta">
          <div>
            <p className="ifg-eyebrow">Recommended next step</p>
            <h2>Keep the product context in view, then choose the plan that fits your launch.</h2>
            <p>Use the guide to keep the backend decision grounded before you move into checkout.</p>
          </div>
          <div className="ifg-article-cta-actions">
            <button type="button" className="ifg-btn ifg-btn-primary" onClick={() => startDefaultCheckout(`article-${page.path}`)}>
              <Play size={18} />
              {ctaPrimary}
            </button>
            <button type="button" className="ifg-btn ifg-btn-ghost" onClick={() => navigate('/pricing')}>
              <ArrowRight size={18} />
              Review plans
            </button>
          </div>
        </aside>
      </article>
    </main>
  )

  const renderPricingPage = () => (
    <main className="ifg-main">
      <section className="ifg-pricing-page-hero">
        <p className="ifg-eyebrow">Pricing</p>
        <h1>Choose the plan that keeps your backend moving after the frontend demo is already done.</h1>
        <p className="ifg-lede">
          Pro annual is preselected for production-minded teams, with yearly billing at 50% off and checkout kept in a centered Creem popup.
        </p>
      </section>
      {renderPricingSection(true)}
    </main>
  )

  const renderLegalPage = (title: string, intro: string, sections: typeof legalPrivacySections) => (
    <main className="ifg-main">
      <article className="ifg-article">
        <p className="ifg-eyebrow">Legal</p>
        <h1>{title}</h1>
        <p className="ifg-lede">{intro}</p>
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  )

  const renderNotFound = () => (
    <main className="ifg-main">
      <section className="ifg-center-card">
        <p className="ifg-eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="ifg-muted">That route is not available.</p>
        <button type="button" className="ifg-btn ifg-btn-primary" onClick={() => navigate('/')}>
          Return home
        </button>
      </section>
    </main>
  )

  let body: React.ReactNode
  if (routeView === 'home' && normalizedPath === '/') {
    body = renderHome()
  } else if (routeView === 'keyword' && keywordPage) {
    body = renderKeywordPage(keywordPage)
  } else if (routeView === 'pricing') {
    body = renderPricingPage()
  } else if (routeView === 'privacy') {
    body = renderLegalPage(
      'Privacy Policy',
      'This policy covers how the managed InsForge site handles analytics, checkout, and related user interactions.',
      legalPrivacySections,
    )
  } else if (routeView === 'terms') {
    body = renderLegalPage(
      'Terms of Service',
      'These terms describe the limits and responsibilities of the managed InsForge site and its hosted payment flow.',
      legalTermsSections,
    )
  } else if (routeView === 'checkout-done') {
    body = <CheckoutDoneBridge publicAppOrigin={publicAppOrigin} />
  } else {
    body = renderNotFound()
  }

  return (
    <div className="ifg-shell">
      <div className="ifg-page-texture" aria-hidden />
      {renderHeader()}
      {body}
      {renderCheckoutModal()}
      <footer className="ifg-footer">
        <div className="ifg-footer-inner">
          <span>InsForge</span>
          <a
            href="/privacy"
            onClick={(event) => {
              event.preventDefault()
              navigate('/privacy')
            }}
          >
            Privacy
          </a>
          <a
            href="/terms"
            onClick={(event) => {
              event.preventDefault()
              navigate('/terms')
            }}
          >
            Terms
          </a>
          <a href="https://github.com/InsForge/InsForge" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://docs.insforge.dev/introduction" target="_blank" rel="noreferrer">
            Official docs
          </a>
        </div>
      </footer>
    </div>
  )
}
