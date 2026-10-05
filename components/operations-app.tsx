'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  Inbox,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Ship,
  Upload,
  X,
} from 'lucide-react'
import {
  activity as activitySeed,
  calendarEvents,
  documents as documentSeed,
  lanes,
  money,
  notifications as notificationSeed,
  quotes as quoteSeed,
  shipments as shipmentSeed,
  tasks as taskSeed,
  team,
  weekDays,
  weeklyVolume,
  type DocumentRow,
  type Quote,
  type Shipment,
  type TaskRow,
  type Tone,
} from '@/lib/data'

type NavId =
  | 'Overview'
  | 'Quotations'
  | 'Shipments & Jobs'
  | 'Documents'
  | 'Tasks & Exceptions'
  | 'Performance'
  | 'Calendar'
  | 'Settings'

type Detail = { kind: 'quote'; id: string } | { kind: 'shipment'; id: string } | { kind: 'task'; id: string } | { kind: 'document'; id: string } | null
type CreateKind = 'quote' | 'shipment' | 'document' | 'task' | null

const navBase: { label: NavId; icon: typeof LayoutDashboard }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Quotations', icon: FileText },
  { label: 'Shipments & Jobs', icon: Ship },
  { label: 'Documents', icon: BookOpen },
  { label: 'Tasks & Exceptions', icon: ClipboardList },
]

const todayLabel = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date('2026-10-05'))

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  onAction,
}: {
  icon?: typeof Inbox
  title: string
  description: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      {action && onAction && (
        <button className="button primary" onClick={onAction}>
          <Plus /> {action}
        </button>
      )}
    </div>
  )
}

function Badge({ children, tone }: { children: React.ReactNode; tone: Tone }) {
  return (
    <span className={`status-badge ${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  )
}

function Stat({
  label,
  value,
  change,
  icon: Icon,
  down = false,
  warn = false,
  onClick,
}: {
  label: string
  value: string
  change: string
  icon: typeof Clock3
  down?: boolean
  warn?: boolean
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`icon-box ${warn ? 'warn' : down ? '' : 'ok'}`}>
          <Icon />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className={down ? 'negative' : 'positive'}>
          {down ? <ArrowDownRight /> : <ArrowUpRight />}
          {change}
        </span>
        <span>vs last month</span>
      </div>
    </>
  )
  if (onClick) {
    return (
      <button className="stat-card clickable" onClick={onClick}>
        {inner}
      </button>
    )
  }
  return <div className="stat-card">{inner}</div>
}

function Header({
  title,
  subtitle,
  action,
  onAction,
  secondary,
  onSecondary,
}: {
  title: string
  subtitle: string
  action?: string
  onAction?: () => void
  secondary?: string
  onSecondary?: () => void
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{todayLabel}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <div className="heading-actions">
        {secondary && onSecondary && (
          <button className="button secondary" onClick={onSecondary}>
            {secondary}
          </button>
        )}
        {action && (
          <button className="button primary" onClick={onAction}>
            {/^(New|Create|Upload|Add)\b/i.test(action) && <Plus />} {action}
          </button>
        )}
      </div>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  children,
  action,
  onAction,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: string
  onAction?: () => void
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && (
          <button className="text-button" onClick={onAction}>
            {action} <ArrowUpRight />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase())
}

export default function OperationsApp() {
  const [activeNav, setActiveNav] = useState<NavId>('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandIndex, setCommandIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [detail, setDetail] = useState<Detail>(null)
  const [createKind, setCreateKind] = useState<CreateKind>(null)
  const [quoteFilter, setQuoteFilter] = useState('All')
  const [shipmentFilter, setShipmentFilter] = useState('All')
  const [docFilter, setDocFilter] = useState('All')
  const [taskFilter, setTaskFilter] = useState('All')
  const [activityTab, setActivityTab] = useState('All')
  const [tableQuery, setTableQuery] = useState('')
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([])
  const [alertVisible, setAlertVisible] = useState(true)
  const [quotes, setQuotes] = useState(quoteSeed)
  const [shipments, setShipments] = useState(shipmentSeed)
  const [documents, setDocuments] = useState(documentSeed)
  const [tasks, setTasks] = useState(taskSeed)
  const [notes, setNotes] = useState(notificationSeed)
  const [settings, setSettings] = useState({
    email: true,
    exceptions: true,
    quotes: true,
    digest: false,
  })
  const toastId = useRef(1)
  const commandInput = useRef<HTMLInputElement>(null)

  const toast = (message: string) => {
    const id = toastId.current++
    setToasts((current) => [...current, { id, message }])
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2800)
  }

  const go = (nav: NavId, options?: { keepDetail?: boolean }) => {
    setActiveNav(nav)
    setMobileNav(false)
    setNotesOpen(false)
    setCommandOpen(false)
    setTableQuery('')
    if (!options?.keepDetail) setDetail(null)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        setNotesOpen(false)
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
        setNotesOpen(false)
        setDetail(null)
        setCreateKind(null)
        setMobileNav(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (commandOpen) {
      setCommandIndex(0)
      window.setTimeout(() => commandInput.current?.focus(), 20)
    } else {
      setCommandQuery('')
    }
  }, [commandOpen])

  useEffect(() => {
    document.body.style.overflow = commandOpen || createKind || mobileNav ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [commandOpen, createKind, mobileNav])

  const unreadCount = notes.filter((note) => note.unread).length
  const selectedQuote = detail?.kind === 'quote' ? quotes.find((item) => item.id === detail.id) : undefined
  const selectedShipment = detail?.kind === 'shipment' ? shipments.find((item) => item.id === detail.id) : undefined
  const selectedTask = detail?.kind === 'task' ? tasks.find((item) => item.id === detail.id) : undefined
  const selectedDocument = detail?.kind === 'document' ? documents.find((item) => item.id === detail.id) : undefined

  const openCreate = (kind: Exclude<CreateKind, null>) => {
    setDetail(null)
    setNotesOpen(false)
    setCommandOpen(false)
    setCreateKind(kind)
  }

  const commandResults = useMemo(() => {
    const q = commandQuery.trim().toLowerCase()
    const creates = (
      [
        ['quote', 'New quotation', 'Create a freight quote'],
        ['shipment', 'Create shipment', 'Book a new job'],
        ['document', 'Upload document', 'Add a file to the library'],
        ['task', 'Create task', 'Log an exception or follow-up'],
      ] as const
    )
      .filter(([, title, subtitle]) => !q || matchesQuery(`${title} ${subtitle} create new`, q))
      .map(([id, title, subtitle]) => ({ id, kind: 'create' as const, title, subtitle }))
    const pages = (['Overview', 'Quotations', 'Shipments & Jobs', 'Documents', 'Tasks & Exceptions', 'Performance', 'Calendar', 'Settings'] as NavId[])
      .filter((label) => !q || label.toLowerCase().includes(q))
      .map((label) => ({ id: label, kind: 'page' as const, title: label, subtitle: 'Go to page' }))
    const quoteHits = quotes
      .filter((item) => !q || matchesQuery(`${item.id} ${item.customer} ${item.lane}`, q))
      .map((item) => ({ id: item.id, kind: 'quote' as const, title: item.id, subtitle: `${item.customer} · ${item.lane}` }))
    const jobHits = shipments
      .filter((item) => !q || matchesQuery(`${item.id} ${item.customer} ${item.route}`, q))
      .map((item) => ({ id: item.id, kind: 'shipment' as const, title: item.id, subtitle: `${item.customer} · ${item.route}` }))
    return [...creates, ...pages, ...quoteHits, ...jobHits].slice(0, 12)
  }, [commandQuery, quotes, shipments])

  const openCommandResult = (result: (typeof commandResults)[number]) => {
    if (result.kind === 'create') {
      openCreate(result.id as Exclude<CreateKind, null>)
      return
    }
    if (result.kind === 'page') go(result.id as NavId)
    if (result.kind === 'quote') {
      go('Quotations', { keepDetail: true })
      setDetail({ kind: 'quote', id: result.id })
    }
    if (result.kind === 'shipment') {
      go('Shipments & Jobs', { keepDetail: true })
      setDetail({ kind: 'shipment', id: result.id })
    }
  }

  const openQuotes = quotes.filter((item) => item.status !== 'Approved')
  const activeShipments = shipments.filter((item) => item.status !== 'Complete')
  const atRiskShipments = shipments.filter((item) => item.status === 'At risk')
  const openTasks = tasks.filter((item) => item.status !== 'Complete')
  const dueTodayTasks = tasks.filter((item) => item.status === 'Due today')
  const awaitingDocs = documents.filter((item) => item.status === 'Awaiting upload')

  const navCounts: Partial<Record<NavId, string>> = {
    Quotations: String(openQuotes.length),
    'Shipments & Jobs': String(activeShipments.length),
    Documents: String(awaitingDocs.length + documents.filter((item) => item.status === 'Needs review').length),
    'Tasks & Exceptions': String(openTasks.length),
  }

  const filteredQuotes = quotes.filter((item) => {
    const statusOk = quoteFilter === 'All' || item.status === quoteFilter
    const queryOk = !tableQuery || matchesQuery(`${item.id} ${item.customer} ${item.lane} ${item.mode}`, tableQuery)
    return statusOk && queryOk
  })

  const filteredShipments = shipments.filter((item) => {
    const statusOk = shipmentFilter === 'All' || item.status === shipmentFilter
    const queryOk = !tableQuery || matchesQuery(`${item.id} ${item.customer} ${item.route} ${item.mode}`, tableQuery)
    return statusOk && queryOk
  })

  const filteredDocs = documents.filter((item) => {
    const statusOk = docFilter === 'All' || item.status === docFilter
    const queryOk = !tableQuery || matchesQuery(`${item.name} ${item.job} ${item.owner}`, tableQuery)
    return statusOk && queryOk
  })

  const filteredTasks = tasks.filter((item) => {
    const statusOk = taskFilter === 'All' || item.status === taskFilter
    const queryOk = !tableQuery || matchesQuery(`${item.title} ${item.job} ${item.owner}`, tableQuery)
    return statusOk && queryOk
  })

  const visibleActivity = activitySeed.filter((item) => {
    if (activityTab === 'Alerts') return item.kind === 'alert'
    if (activityTab === 'Team') return item.kind === 'team' || item.kind === 'success'
    return true
  })

  const attentionItems = useMemo(() => {
    const items: {
      id: string
      kind: 'shipment' | 'task' | 'document' | 'quote'
      title: string
      detail: string
      tone: Tone
      badge: string
      when: string
    }[] = []

    shipments
      .filter((item) => item.status === 'At risk')
      .forEach((item) => {
        items.push({
          id: item.id,
          kind: 'shipment',
          title: `${item.id} is at risk`,
          detail: `${item.customer} · ${item.milestone}`,
          tone: item.tone,
          badge: item.status,
          when: item.eta,
        })
      })
    tasks
      .filter((item) => item.status === 'Due today')
      .forEach((item) => {
        items.push({
          id: item.id,
          kind: 'task',
          title: item.title,
          detail: `${item.job} · ${item.owner}`,
          tone: item.tone,
          badge: item.priority,
          when: item.due,
        })
      })
    documents
      .filter((item) => item.status === 'Awaiting upload')
      .forEach((item) => {
        items.push({
          id: item.id,
          kind: 'document',
          title: item.name,
          detail: `${item.job} · ${item.owner}`,
          tone: item.tone,
          badge: item.status,
          when: item.updated,
        })
      })
    quotes
      .filter((item) => item.status === 'Awaiting response')
      .forEach((item) => {
        items.push({
          id: item.id,
          kind: 'quote',
          title: `Chase ${item.id}`,
          detail: `${item.customer} · ${item.lane}`,
          tone: item.tone,
          badge: item.status,
          when: item.age,
        })
      })

    return items.slice(0, 6)
  }, [documents, quotes, shipments, tasks])

  const openAttention = (item: (typeof attentionItems)[number]) => {
    if (item.kind === 'shipment') {
      go('Shipments & Jobs', { keepDetail: true })
      setDetail({ kind: 'shipment', id: item.id })
    } else if (item.kind === 'task') {
      go('Tasks & Exceptions', { keepDetail: true })
      setDetail({ kind: 'task', id: item.id })
    } else if (item.kind === 'document') {
      go('Documents', { keepDetail: true })
      setDetail({ kind: 'document', id: item.id })
    } else {
      go('Quotations', { keepDetail: true })
      setDetail({ kind: 'quote', id: item.id })
    }
  }

  const completeTask = (id: string) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: 'Complete', tone: 'emerald' } : task)))
    toast('Task marked complete')
    setDetail(null)
  }

  const verifyDocument = (id: string) => {
    setDocuments((current) => current.map((doc) => (doc.id === id ? { ...doc, status: 'Verified', tone: 'emerald', updated: 'Just now' } : doc)))
    toast('Document marked verified')
    setDetail(null)
  }

  const convertQuote = (quote: Quote) => {
    setQuotes((current) => current.map((item) => (item.id === quote.id ? { ...item, status: 'Approved', tone: 'emerald' } : item)))
    toast(`${quote.id} converted to a job draft`)
    setDetail(null)
    go('Shipments & Jobs')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Boxes />
          </div>
          <div>
            <strong>
              FAME<span>LOGISTICS</span>
            </strong>
            <small>OPERATIONS PLATFORM</small>
          </div>
          <button className="close-mobile" onClick={() => setMobileNav(false)} aria-label="Close menu">
            <X />
          </button>
        </div>
        <button className="workspace" type="button" onClick={() => toast('Workspace switcher coming soon')}>
          <div className="workspace-avatar">FM</div>
          <div>
            <strong>Fame Logistics</strong>
            <span>Operations workspace</span>
          </div>
          <ChevronDown />
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-caption">WORKSPACE</p>
          {navBase.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? 'active' : ''}`}
              aria-current={activeNav === label ? 'page' : undefined}
              onClick={() => go(label)}
            >
              <Icon />
              <span>{label}</span>
              {navCounts[label] && <em>{navCounts[label]}</em>}
            </button>
          ))}
          <p className="nav-caption">INSIGHTS</p>
          {(
            [
              ['Performance', BarChart3],
              ['Calendar', CalendarDays],
            ] as const
          ).map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? 'active' : ''}`}
              aria-current={activeNav === label ? 'page' : undefined}
              onClick={() => go(label)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => toast('Help center opens in a new tab')}>
            <CircleHelp />
            <span>Help center</span>
          </button>
          <button className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`} onClick={() => go('Settings')}>
            <Settings />
            <span>Settings</span>
          </button>
          <div className="profile">
            <div className="profile-avatar">KO</div>
            <div>
              <strong>Kemi Oladipo</strong>
              <span>Operations lead</span>
            </div>
            <MoreHorizontal />
          </div>
        </div>
      </aside>

      <main className="main-content" id="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu">
            <Menu />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <b>/</b>
            <strong>{activeNav}</strong>
          </div>
          <div className="top-actions">
            <button className="search" onClick={() => setCommandOpen(true)} aria-label="Search">
              <Search />
              <span>Search shipments, quotes, tasks…</span>
              <kbd>⌘K</kbd>
            </button>
            <button className="icon-button mobile-search" onClick={() => setCommandOpen(true)} aria-label="Open search">
              <Search />
            </button>
            <div className="top-slot">
              <button
                className="icon-button notification"
                aria-label="Notifications"
                aria-expanded={notesOpen}
                onClick={() => setNotesOpen((open) => !open)}
              >
                <Bell />
                {unreadCount > 0 && <i />}
              </button>
              {notesOpen && (
                <div className="popover" role="dialog" aria-label="Notifications">
                  <div className="panel-header">
                    <div>
                      <h2>Notifications</h2>
                      <p>{unreadCount} unread</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setNotes((current) => current.map((note) => ({ ...note, unread: false })))
                        toast('All notifications marked read')
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  {notes.length === 0 ? (
                    <EmptyState icon={Bell} title="No notifications" description="Exceptions and quote replies will land here." />
                  ) : (
                    notes.map((note) => (
                      <button
                        key={note.id}
                        className={`note-item ${note.unread ? 'unread' : ''}`}
                        onClick={() => {
                          setNotes((current) => current.map((item) => (item.id === note.id ? { ...item, unread: false } : item)))
                          setNotesOpen(false)
                          if (note.title.includes('FML-10481')) {
                            go('Shipments & Jobs', { keepDetail: true })
                            setDetail({ kind: 'shipment', id: 'FML-10481' })
                          } else if (note.title.includes('Quote')) {
                            go('Quotations', { keepDetail: true })
                            setDetail({ kind: 'quote', id: 'QT-2481' })
                          } else if (note.title.includes('Invoice') || note.body.includes('documents')) {
                            go('Documents')
                          }
                        }}
                      >
                        <Badge tone={note.tone}>{note.time}</Badge>
                        <div>
                          <p>{note.title}</p>
                          <span>{note.body}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button className="avatar-button" onClick={() => go('Settings')} aria-label="Open settings">
              KO
            </button>
          </div>
        </header>

        <div className="content-wrap">
          {activeNav === 'Overview' && (
            <>
              <Header
                title="Good morning, Kemi"
                subtitle={`${attentionItems.length} items need attention before today's cut-offs.`}
              />
              <div className="quick-create" aria-label="Quick create">
                <button className="primary-quick" type="button" onClick={() => openCreate('quote')}>
                  <Plus /> New quotation
                </button>
                <button type="button" onClick={() => openCreate('shipment')}>
                  <Ship /> Create shipment
                </button>
                <button type="button" onClick={() => openCreate('document')}>
                  <Upload /> Upload document
                </button>
                <button type="button" onClick={() => openCreate('task')}>
                  <ClipboardList /> Create task
                </button>
              </div>
              {alertVisible && (
                <div className="alert-strip">
                  <AlertTriangle />
                  <p>
                    <strong>FML-10481 is at risk.</strong> Customs documents for Atlas Manufacturing are still outstanding and due today.
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      go('Shipments & Jobs', { keepDetail: true })
                      setDetail({ kind: 'shipment', id: 'FML-10481' })
                    }}
                  >
                    Review job
                  </button>
                  <button className="icon-button" aria-label="Dismiss alert" onClick={() => setAlertVisible(false)}>
                    <X />
                  </button>
                </div>
              )}
              <section className="kpi-strip" aria-label="Key metrics">
                <button className="kpi-pill" onClick={() => go('Quotations')}>
                  <span className="icon-box info">
                    <FileText />
                  </span>
                  <div>
                    <strong>{openQuotes.length}</strong>
                    <span>Open quotes</span>
                  </div>
                </button>
                <button className="kpi-pill" onClick={() => go('Shipments & Jobs')}>
                  <span className="icon-box ok">
                    <Ship />
                  </span>
                  <div>
                    <strong>{activeShipments.length}</strong>
                    <span>Active jobs</span>
                  </div>
                </button>
                <button className="kpi-pill warn" onClick={() => go('Documents')}>
                  <span className="icon-box warn">
                    <Upload />
                  </span>
                  <div>
                    <strong>{awaitingDocs.length}</strong>
                    <span>Docs waiting</span>
                  </div>
                </button>
                <button className="kpi-pill warn" onClick={() => go('Tasks & Exceptions')}>
                  <span className="icon-box warn">
                    <AlertTriangle />
                  </span>
                  <div>
                    <strong>{String(dueTodayTasks.length).padStart(2, '0')}</strong>
                    <span>Due today</span>
                  </div>
                </button>
              </section>
              <div className="section-grid">
                <Panel
                  title="Needs attention"
                  subtitle="Exceptions, overdue docs, and quotes waiting on customers"
                  action="Open exceptions"
                  onAction={() => go('Tasks & Exceptions')}
                >
                  {attentionItems.length === 0 ? (
                    <EmptyState icon={CheckCircle2} title="You're clear for now" description="No at-risk jobs, due-today tasks, or missing documents." />
                  ) : (
                    <div className="attention-list">
                      {attentionItems.map((item) => (
                        <button key={`${item.kind}-${item.id}`} className="attention-item" onClick={() => openAttention(item)}>
                          <div className={`activity-icon ${item.tone === 'emerald' ? 'success' : item.tone === 'rose' || item.tone === 'amber' ? 'alert' : item.tone === 'blue' ? 'team' : 'doc'}`}>
                            {item.kind === 'shipment' && <Ship />}
                            {item.kind === 'task' && <ClipboardList />}
                            {item.kind === 'document' && <BookOpen />}
                            {item.kind === 'quote' && <FileText />}
                          </div>
                          <div>
                            <strong>{item.title}</strong>
                            <span>{item.detail}</span>
                          </div>
                          <div className="attention-meta">
                            <Badge tone={item.tone}>{item.badge}</Badge>
                            <span className="muted">{item.when}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </Panel>
                <Panel title="Activity" subtitle="Latest updates from your team">
                  <div className="activity-tabs">
                    {['All', 'Alerts', 'Team'].map((tab) => (
                      <button key={tab} className={activityTab === tab ? 'selected' : ''} onClick={() => setActivityTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="activity-list">
                    {visibleActivity.length === 0 ? (
                      <EmptyState title="No activity yet" description="Team updates and alerts will show up here." />
                    ) : (
                      visibleActivity.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          className="activity-item"
                          onClick={() => {
                            if (item.detail.includes('FML-10481') || item.title.includes('FML-10481')) {
                              go('Shipments & Jobs', { keepDetail: true })
                              setDetail({ kind: 'shipment', id: 'FML-10481' })
                            } else if (item.title.includes('QT-2481')) {
                              go('Quotations', { keepDetail: true })
                              setDetail({ kind: 'quote', id: 'QT-2481' })
                            } else if (item.title.includes('FML-10479')) {
                              go('Shipments & Jobs', { keepDetail: true })
                              setDetail({ kind: 'shipment', id: 'FML-10479' })
                            }
                          }}
                        >
                          <div className={`activity-icon ${item.kind}`}>
                            {item.kind === 'success' && <CheckCircle2 />}
                            {item.kind === 'alert' && <AlertTriangle />}
                            {item.kind === 'team' && <FileText />}
                            {item.kind === 'doc' && <BookOpen />}
                          </div>
                          <div>
                            <p>
                              <strong>{item.title}</strong>
                            </p>
                            <p>{item.detail}</p>
                            <span>
                              {item.actor} · {item.time}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <button className="activity-footer" onClick={() => go('Tasks & Exceptions')}>
                    View exceptions <ArrowUpRight />
                  </button>
                </Panel>
              </div>
              <Panel title="Quotation pipeline" subtitle="Click a stage to jump into the workspace" action="Open workspace" onAction={() => go('Quotations')}>
                <div className="pipeline">
                  {[
                    ['All', String(quotes.length), ''],
                    ['Awaiting response', String(quotes.filter((item) => item.status === 'Awaiting response').length), 'amber-text'],
                    ['In review', String(quotes.filter((item) => item.status === 'In review').length), 'blue-text'],
                    ['Approved', String(quotes.filter((item) => item.status === 'Approved').length), 'green-text'],
                  ].map(([label, value, tone]) => (
                    <button
                      key={label}
                      onClick={() => {
                        setQuoteFilter(label === 'All' ? 'All' : label)
                        go('Quotations')
                      }}
                    >
                      <strong className={tone}>{value}</strong>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <QuoteTable rows={quotes.slice(0, 4)} onOpen={(id) => setDetail({ kind: 'quote', id })} />
              </Panel>
              <Panel title="At-risk & active jobs" subtitle="Jobs that need a closer look today" action="See all jobs" onAction={() => go('Shipments & Jobs')}>
                <ShipmentList
                  rows={shipments.filter((item) => item.status !== 'Complete').slice(0, 3)}
                  onOpen={(id) => setDetail({ kind: 'shipment', id })}
                  emptyAction={() => openCreate('shipment')}
                />
              </Panel>
            </>
          )}

          {activeNav === 'Quotations' && (
            <>
              <Header title="Quotation workspace" subtitle="Create, track, and convert freight opportunities into jobs." action="New quotation" onAction={() => openCreate('quote')} />
              <section className="stats-grid compact-stats">
                <Stat label="Open items" value={String(openQuotes.length)} change="12.5%" icon={FileText} />
                <Stat label="Awaiting response" value={String(quotes.filter((item) => item.status === 'Awaiting response').length)} change="2 chasing" icon={Clock3} down warn />
                <Stat label="Won this month" value={String(quotes.filter((item) => item.status === 'Approved').length)} change="18.4%" icon={CheckCircle2} />
                <Stat label="Pipeline value" value={money(quotes.reduce((sum, item) => sum + item.value, 0))} change="9.1%" icon={BarChart3} />
              </section>
              <Panel title="Work queue" subtitle="Updated just now">
                <div className="toolbar">
                  <div className="chips">
                    {['All', 'Draft', 'In review', 'Awaiting response', 'Approved'].map((chip) => (
                      <button key={chip} className={`chip ${quoteFilter === chip ? 'active' : ''}`} onClick={() => setQuoteFilter(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                  <label className="filter-search">
                    <Search />
                    <input value={tableQuery} onChange={(event) => setTableQuery(event.target.value)} placeholder="Filter quotations" />
                  </label>
                </div>
                {filteredQuotes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No quotations match"
                    description="Try another status chip or clear the search to see the full pipeline."
                    action="New quotation"
                    onAction={() => openCreate('quote')}
                  />
                ) : (
                  <div className="kanban">
                    {(['Draft', 'In review', 'Awaiting response', 'Approved'] as Quote['status'][]).map((column) => {
                      const columnRows = filteredQuotes.filter((item) => item.status === column)
                      return (
                        <div className="kanban-col" key={column}>
                          <h3>
                            {column}
                            <span>{columnRows.length}</span>
                          </h3>
                          {columnRows.length === 0 ? (
                            <div className="kanban-empty">None in this stage</div>
                          ) : (
                            columnRows.map((item) => (
                              <button key={item.id} className="kanban-card" onClick={() => setDetail({ kind: 'quote', id: item.id })}>
                                <strong className="mono">{item.id}</strong>
                                <span>{item.customer}</span>
                                <span>
                                  {item.lane} · {money(item.value)}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Panel>
            </>
          )}

          {activeNav === 'Shipments & Jobs' && (
            <>
              <Header title="Shipments & jobs" subtitle="Monitor live freight movements, milestones, and customer commitments." action="Create shipment" onAction={() => openCreate('shipment')} />
              <section className="stats-grid compact-stats">
                <Stat label="Active shipments" value={String(activeShipments.length)} change="8.2%" icon={Ship} />
                <Stat
                  label="At risk"
                  value={String(atRiskShipments.length).padStart(2, '0')}
                  change="Needs docs"
                  icon={AlertTriangle}
                  down
                  warn
                  onClick={() => {
                    setShipmentFilter('At risk')
                    if (atRiskShipments[0]) setDetail({ kind: 'shipment', id: atRiskShipments[0].id })
                  }}
                />
                <Stat
                  label="On track"
                  value={`${Math.round((shipments.filter((item) => item.status === 'On track').length / Math.max(shipments.length, 1)) * 100)}%`}
                  change="1.4%"
                  icon={CheckCircle2}
                />
                <Stat label="Completed" value={String(shipments.filter((item) => item.status === 'Complete').length)} change="This week" icon={Clock3} />
              </section>
              <Panel title="Active jobs" subtitle="Progress against booked milestones">
                <div className="toolbar">
                  <div className="chips">
                    {['All', 'On track', 'At risk', 'Complete'].map((chip) => (
                      <button key={chip} className={`chip ${shipmentFilter === chip ? 'active' : ''}`} onClick={() => setShipmentFilter(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                  <label className="filter-search">
                    <Search />
                    <input value={tableQuery} onChange={(event) => setTableQuery(event.target.value)} placeholder="Filter shipments" />
                  </label>
                </div>
                <ShipmentList
                  rows={filteredShipments}
                  onOpen={(id) => setDetail({ kind: 'shipment', id })}
                  emptyAction={() => openCreate('shipment')}
                />
              </Panel>
            </>
          )}

          {activeNav === 'Documents' && (
            <>
              <Header title="Central documentation" subtitle="Keep every shipment document verified, visible, and ready for handoff." action="Upload document" onAction={() => openCreate('document')} />
              <section className="stats-grid compact-stats">
                <Stat label="In library" value={String(documents.length)} change="6 new" icon={BookOpen} />
                <Stat label="Awaiting upload" value={String(awaitingDocs.length)} change="Due today" icon={Upload} down warn />
                <Stat label="Needs review" value={String(documents.filter((item) => item.status === 'Needs review').length)} change="Same day" icon={FileText} />
                <Stat label="Verified" value={String(documents.filter((item) => item.status === 'Verified').length)} change="18.4%" icon={CheckCircle2} />
              </section>
              <Panel title="Document queue" subtitle="Click a file to review or chase">
                <div className="toolbar">
                  <div className="chips">
                    {['All', 'Awaiting upload', 'Needs review', 'Verified'].map((chip) => (
                      <button key={chip} className={`chip ${docFilter === chip ? 'active' : ''}`} onClick={() => setDocFilter(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                  <label className="filter-search">
                    <Search />
                    <input value={tableQuery} onChange={(event) => setTableQuery(event.target.value)} placeholder="Filter documents" />
                  </label>
                </div>
                {filteredDocs.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No documents match"
                    description="Adjust the status filter or upload a new file to the library."
                    action="Upload document"
                    onAction={() => openCreate('document')}
                  />
                ) : (
                  <div className="cards">
                    {filteredDocs.map((doc) => (
                      <button key={doc.id} className="doc-card" onClick={() => setDetail({ kind: 'document', id: doc.id })}>
                        <div className="stat-top">
                          <strong>{doc.name}</strong>
                          <Badge tone={doc.tone}>{doc.status}</Badge>
                        </div>
                        <span className="muted" style={{ display: 'block', marginTop: 8 }}>
                          {doc.job} · {doc.owner}
                        </span>
                        <span className="muted" style={{ display: 'block', marginTop: 6 }}>
                          {doc.type} · {doc.updated}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Panel>
            </>
          )}

          {activeNav === 'Tasks & Exceptions' && (
            <>
              <Header title="Tasks & exceptions" subtitle="Resolve operational blockers before they impact customers." action="Create task" onAction={() => openCreate('task')} />
              <section className="stats-grid compact-stats">
                <Stat label="Open tasks" value={String(openTasks.length)} change="2 new" icon={ClipboardList} warn />
                <Stat label="Due today" value={String(dueTodayTasks.length)} change="High priority" icon={AlertTriangle} down warn />
                <Stat label="In progress" value={String(tasks.filter((item) => item.status === 'In progress').length)} change="On track" icon={Clock3} />
                <Stat label="Completed" value={String(tasks.filter((item) => item.status === 'Complete').length)} change="This week" icon={CheckCircle2} />
              </section>
              <Panel title="Exception board" subtitle="Highest-risk work first">
                <div className="toolbar">
                  <div className="chips">
                    {['All', 'Due today', 'In progress', 'Open', 'Complete'].map((chip) => (
                      <button key={chip} className={`chip ${taskFilter === chip ? 'active' : ''}`} onClick={() => setTaskFilter(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                  <label className="filter-search">
                    <Search />
                    <input value={tableQuery} onChange={(event) => setTableQuery(event.target.value)} placeholder="Filter tasks" />
                  </label>
                </div>
                {filteredTasks.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    title="No tasks match"
                    description="Clear the filter or create a task for the next operational blocker."
                    action="Create task"
                    onAction={() => openCreate('task')}
                  />
                ) : (
                  <div className="cards">
                    {filteredTasks.map((task) => (
                      <button key={task.id} className="task-card" onClick={() => setDetail({ kind: 'task', id: task.id })}>
                        <div className="stat-top">
                          <Badge tone={task.tone}>{task.status}</Badge>
                          {task.priority === 'High' && <span className="priority">HIGH</span>}
                        </div>
                        <strong style={{ display: 'block', marginTop: 10 }}>{task.title}</strong>
                        <span className="muted" style={{ display: 'block', marginTop: 6 }}>
                          {task.job} · {task.owner}
                        </span>
                        <span className="muted" style={{ display: 'block', marginTop: 4 }}>
                          Due {task.due}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Panel>
            </>
          )}

          {activeNav === 'Performance' && (
            <>
              <Header title="Performance insights" subtitle="Turnaround times, win rates, and operational health at a glance." action="Export report" onAction={() => toast('Weekly performance report queued')} />
              <section className="stats-grid compact-stats">
                <Stat label="Quote win rate" value="62%" change="4.8%" icon={BarChart3} />
                <Stat label="On-time delivery" value="91%" change="1.2%" icon={Ship} />
                <Stat label="Doc cycle time" value="6.4h" change="11%" icon={BookOpen} />
                <Stat label="Exception rate" value="4.1%" change="0.6%" icon={AlertTriangle} down />
              </section>
              <div className="perf-grid">
                <div className="chart-card">
                  <h3>Weekly volume</h3>
                  <div className="bars" aria-hidden="true">
                    {weeklyVolume.map((week) => (
                      <div className="bar" key={week.label}>
                        <i style={{ height: `${week.quotes * 3.2}px` }} />
                        <b style={{ height: `${week.jobs * 3.2}px` }} />
                        <span>{week.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="muted" style={{ margin: '12px 0 0' }}>
                    Blue is jobs created. Light blue is quotations issued.
                  </p>
                </div>
                <div className="chart-card">
                  <h3>Quote conversion</h3>
                  <div className="donut-wrap">
                    <div className="donut">
                      <span>62%</span>
                    </div>
                    <div className="legend">
                      <div>
                        <b style={{ background: 'var(--green)' }} />
                        Won · 62%
                      </div>
                      <div>
                        <b style={{ background: '#e8edf3' }} />
                        Open or lost · 38%
                      </div>
                      <p className="muted" style={{ margin: '8px 0 0' }}>
                        11 of 18 quotations converted over the last 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Panel title="Lane health" subtitle="On-time performance and contribution by trade lane">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>LANE</th>
                        <th>JOBS</th>
                        <th>ON TIME</th>
                        <th>MARGIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lanes.map((lane) => (
                        <tr key={lane.lane} onClick={() => go('Shipments & Jobs')}>
                          <td>
                            <strong>{lane.lane}</strong>
                          </td>
                          <td>{lane.jobs}</td>
                          <td>
                            <Badge tone={lane.onTime >= 90 ? 'emerald' : 'amber'}>{lane.onTime}%</Badge>
                          </td>
                          <td>
                            <strong>{lane.margin}%</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}

          {activeNav === 'Calendar' && (
            <>
              <Header title="Operations calendar" subtitle="Plan milestones, handoffs, and customer updates across the week." action="Add milestone" onAction={() => openCreate('task')} />
              <Panel title="This week" subtitle="5–11 October 2026">
                <div className="calendar-grid">
                  {weekDays.map((day) => {
                    const events = calendarEvents.filter((event) => event.date === day.date)
                    return (
                      <div className={`cal-day ${day.today ? 'today' : ''}`} key={day.date}>
                        <header>
                          <span>{day.label}</span>
                          <span>{day.n}</span>
                        </header>
                        {events.length === 0 ? (
                          <p className="agenda-empty">No milestones</p>
                        ) : (
                          events.map((event) => (
                            <button
                              key={event.id}
                              className={`cal-event ${event.tone}`}
                              onClick={() => {
                                if (event.job?.startsWith('FML')) setDetail({ kind: 'shipment', id: event.job })
                                else if (event.job?.startsWith('QT')) setDetail({ kind: 'quote', id: event.job })
                              }}
                            >
                              <strong>{event.title}</strong>
                              <span style={{ display: 'block', marginTop: 2 }}>
                                {event.time}
                                {event.job ? ` · ${event.job}` : ''}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="calendar-agenda">
                  {weekDays.map((day) => {
                    const events = calendarEvents.filter((event) => event.date === day.date)
                    return (
                      <div className={`agenda-day ${day.today ? 'today' : ''}`} key={`agenda-${day.date}`}>
                        <header>
                          <strong>
                            {day.label} {day.n}
                          </strong>
                          {day.today && <span>Today</span>}
                        </header>
                        {events.length === 0 ? (
                          <p className="agenda-empty">Nothing scheduled</p>
                        ) : (
                          events.map((event) => (
                            <button
                              key={event.id}
                              className={`cal-event ${event.tone}`}
                              onClick={() => {
                                if (event.job?.startsWith('FML')) setDetail({ kind: 'shipment', id: event.job })
                                else if (event.job?.startsWith('QT')) setDetail({ kind: 'quote', id: event.job })
                              }}
                            >
                              <strong>{event.title}</strong>
                              <span style={{ display: 'block', marginTop: 2 }}>
                                {event.time}
                                {event.job ? ` · ${event.job}` : ''}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )
                  })}
                </div>
              </Panel>
              <Panel title="Coming up" subtitle="Beyond this week">
                <div className="activity-list">
                  {calendarEvents.filter((event) => event.date > '2026-10-11').length === 0 ? (
                    <EmptyState icon={CalendarDays} title="Nothing further out" description="Upcoming ETAs and handoffs will appear here." />
                  ) : (
                    calendarEvents
                      .filter((event) => event.date > '2026-10-11')
                      .map((event) => (
                        <div className="activity-item" key={event.id}>
                          <div className={`activity-icon ${event.tone === 'emerald' ? 'success' : event.tone}`}>
                            <CalendarDays />
                          </div>
                          <div>
                            <p>
                              <strong>{event.title}</strong> · {event.job}
                            </p>
                            <span>
                              {event.date} · {event.time}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </Panel>
            </>
          )}

          {activeNav === 'Settings' && (
            <>
              <Header title="Workspace settings" subtitle="Manage roles, notifications, templates, and operational preferences." action="Save changes" onAction={() => toast('Workspace settings saved')} />
              <div className="settings-grid">
                <div className="setting-card">
                  <h2 style={{ margin: '0 0 16px', fontSize: 16 }}>Notifications</h2>
                  {(
                    [
                      ['email', 'Email alerts', 'Send a copy of exceptions and quote replies to Kemi.'],
                      ['exceptions', 'Exception push', 'Ping the operations lead when a job turns at-risk.'],
                      ['quotes', 'Quote follow-ups', 'Remind owners 24 hours before validity expires.'],
                      ['digest', 'Friday digest', 'Weekly summary of win rate, exceptions, and overdue docs.'],
                    ] as const
                  ).map(([key, title, copy]) => (
                    <div className="setting-row" key={key}>
                      <div>
                        <strong>{title}</strong>
                        <span className="muted" style={{ display: 'block', marginTop: 4 }}>
                          {copy}
                        </span>
                      </div>
                      <button
                        className={`toggle ${settings[key] ? 'on' : ''}`}
                        aria-pressed={settings[key]}
                        onClick={() => setSettings((current) => ({ ...current, [key]: !current[key] }))}
                      >
                        <i />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="setting-card">
                  <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Team</h2>
                  <p className="muted" style={{ marginTop: 0 }}>
                    People with access to this operations workspace.
                  </p>
                  {team.map((member) => (
                    <div className="team-row" key={member.initials}>
                      <div className="mini-avatar">{member.initials}</div>
                      <div>
                        <strong>{member.name}</strong>
                        <span className="muted" style={{ display: 'block' }}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {commandOpen && (
        <div className="overlay" onClick={() => setCommandOpen(false)}>
          <div className="modal-wrap" onClick={(event) => event.stopPropagation()}>
            <div className="command" role="dialog" aria-label="Command palette">
              <div className="command-input">
                <Search />
                <input
                  ref={commandInput}
                  value={commandQuery}
                  onChange={(event) => {
                    setCommandQuery(event.target.value)
                    setCommandIndex(0)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      setCommandIndex((index) => Math.min(index + 1, Math.max(commandResults.length - 1, 0)))
                    }
                    if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      setCommandIndex((index) => Math.max(index - 1, 0))
                    }
                    if (event.key === 'Enter' && commandResults[commandIndex]) {
                      openCommandResult(commandResults[commandIndex])
                    }
                  }}
                  placeholder="Jump to a page, quote, or shipment"
                  aria-label="Command search"
                />
              </div>
              <div className="command-list">
                {commandResults.length === 0 && <div className="command-empty">No matches for “{commandQuery}”.</div>}
                {commandResults.map((result, index) => (
                  <button
                    key={`${result.kind}-${result.id}`}
                    className={`command-item ${index === commandIndex ? 'active' : ''}`}
                    onMouseEnter={() => setCommandIndex(index)}
                    onClick={() => openCommandResult(result)}
                  >
                    {result.kind === 'create' ? (
                      <Plus />
                    ) : result.kind === 'page' ? (
                      <LayoutDashboard />
                    ) : result.kind === 'quote' ? (
                      <FileText />
                    ) : (
                      <Ship />
                    )}
                    <div>
                      <strong>{result.title}</strong>
                      <small style={{ display: 'block', marginLeft: 0 }}>{result.subtitle}</small>
                    </div>
                    <small>{result.kind === 'create' ? 'action' : result.kind}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {createKind && (
        <div className="overlay" onClick={() => setCreateKind(null)}>
          <div className="modal-wrap" onClick={(event) => event.stopPropagation()}>
            <CreateModal
              kind={createKind}
              jobOptions={shipments.map((item) => item.id)}
              quoteOptions={quotes.map((item) => item.id)}
              onClose={() => setCreateKind(null)}
              onQuote={(quote) => {
                setQuotes((current) => [quote, ...current])
                setCreateKind(null)
                go('Quotations', { keepDetail: true })
                setDetail({ kind: 'quote', id: quote.id })
                toast(`${quote.id} added to the pipeline`)
              }}
              onShipment={(shipment) => {
                setShipments((current) => [shipment, ...current])
                setCreateKind(null)
                go('Shipments & Jobs', { keepDetail: true })
                setDetail({ kind: 'shipment', id: shipment.id })
                toast(`${shipment.id} created`)
              }}
              onDocument={(document) => {
                setDocuments((current) => [document, ...current])
                setCreateKind(null)
                go('Documents', { keepDetail: true })
                setDetail({ kind: 'document', id: document.id })
                toast(`${document.name} added to the library`)
              }}
              onTask={(task) => {
                setTasks((current) => [task, ...current])
                setCreateKind(null)
                go('Tasks & Exceptions', { keepDetail: true })
                setDetail({ kind: 'task', id: task.id })
                toast(`Task “${task.title}” created`)
              }}
            />
          </div>
        </div>
      )}

      {detail && (selectedQuote || selectedShipment || selectedTask || selectedDocument) && (
        <>
          <div className="overlay" onClick={() => setDetail(null)} />
          <aside className="drawer" role="dialog" aria-label="Record details">
            {selectedQuote && (
              <>
                <div className="drawer-header">
                  <div>
                    <p className="eyebrow">{selectedQuote.mode}</p>
                    <h2 className="mono">{selectedQuote.id}</h2>
                    <p className="subtitle">{selectedQuote.customer}</p>
                  </div>
                  <button className="icon-button" onClick={() => setDetail(null)} aria-label="Close details">
                    <X />
                  </button>
                </div>
                <div className="drawer-body">
                  <Badge tone={selectedQuote.tone}>{selectedQuote.status}</Badge>
                  <div className="meta-grid">
                    <div>
                      <span>LANE</span>
                      <strong>{selectedQuote.lane}</strong>
                    </div>
                    <div>
                      <span>VALUE</span>
                      <strong>{money(selectedQuote.value)}</strong>
                    </div>
                    <div>
                      <span>OWNER</span>
                      <strong>{selectedQuote.owner}</strong>
                    </div>
                    <div>
                      <span>VALID UNTIL</span>
                      <strong>{selectedQuote.validUntil}</strong>
                    </div>
                  </div>
                  <p>{selectedQuote.notes}</p>
                </div>
                <div className="drawer-actions">
                  <button className="button secondary" onClick={() => toast(`Reminder sent for ${selectedQuote.id}`)}>
                    Send reminder
                  </button>
                  <button className="button primary" onClick={() => convertQuote(selectedQuote)}>
                    Convert to job
                  </button>
                </div>
              </>
            )}
            {selectedShipment && (
              <>
                <div className="drawer-header">
                  <div>
                    <p className="eyebrow">{selectedShipment.mode}</p>
                    <h2 className="mono">{selectedShipment.id}</h2>
                    <p className="subtitle">{selectedShipment.customer}</p>
                  </div>
                  <button className="icon-button" onClick={() => setDetail(null)} aria-label="Close details">
                    <X />
                  </button>
                </div>
                <div className="drawer-body">
                  <Badge tone={selectedShipment.tone}>{selectedShipment.status}</Badge>
                  <div className="meta-grid">
                    <div>
                      <span>ROUTE</span>
                      <strong>{selectedShipment.route}</strong>
                    </div>
                    <div>
                      <span>ETA</span>
                      <strong>{selectedShipment.eta}</strong>
                    </div>
                    <div>
                      <span>VESSEL / FLIGHT</span>
                      <strong>{selectedShipment.vessel}</strong>
                    </div>
                    <div>
                      <span>OWNER</span>
                      <strong>{selectedShipment.owner}</strong>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 13, margin: '8px 0' }}>Milestone timeline</h3>
                  <ul className="timeline">
                    {selectedShipment.timeline.map((step) => (
                      <li key={step.label} className={step.done ? 'done' : step.current ? 'current' : ''}>
                        <i />
                        <div>
                          <strong>{step.label}</strong>
                          {step.at && <span className="muted">{step.at}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="drawer-actions">
                  <button className="button secondary" onClick={() => go('Documents')}>
                    Open documents
                  </button>
                  <button className="button primary" onClick={() => toast(`Customer update sent for ${selectedShipment.id}`)}>
                    Send ETA update
                  </button>
                </div>
              </>
            )}
            {selectedTask && (
              <>
                <div className="drawer-header">
                  <div>
                    <p className="eyebrow">{selectedTask.job}</p>
                    <h2>{selectedTask.title}</h2>
                    <p className="subtitle">Owned by {selectedTask.owner}</p>
                  </div>
                  <button className="icon-button" onClick={() => setDetail(null)} aria-label="Close details">
                    <X />
                  </button>
                </div>
                <div className="drawer-body">
                  <Badge tone={selectedTask.tone}>{selectedTask.status}</Badge>
                  <div className="meta-grid">
                    <div>
                      <span>PRIORITY</span>
                      <strong>{selectedTask.priority}</strong>
                    </div>
                    <div>
                      <span>DUE</span>
                      <strong>{selectedTask.due}</strong>
                    </div>
                    <div>
                      <span>LINKED JOB</span>
                      <strong className="mono">{selectedTask.job}</strong>
                    </div>
                    <div>
                      <span>OWNER</span>
                      <strong>{selectedTask.owner}</strong>
                    </div>
                  </div>
                  <div className="drawer-note">
                    <span>NEXT STEP</span>
                    <p>
                      {selectedTask.status === 'Complete'
                        ? 'This exception is closed. Keep the customer update in the shipment timeline.'
                        : selectedTask.priority === 'High'
                          ? 'Resolve before cut-off, then send a customer update from the linked job.'
                          : 'Confirm ownership and leave a note once the blocker is cleared.'}
                    </p>
                  </div>
                </div>
                <div className="drawer-actions">
                  {selectedTask.job.startsWith('FML') && (
                    <button
                      className="button secondary"
                      onClick={() => {
                        setDetail({ kind: 'shipment', id: selectedTask.job })
                        setActiveNav('Shipments & Jobs')
                      }}
                    >
                      Open job
                    </button>
                  )}
                  {selectedTask.job.startsWith('QT') && (
                    <button
                      className="button secondary"
                      onClick={() => {
                        setDetail({ kind: 'quote', id: selectedTask.job })
                        setActiveNav('Quotations')
                      }}
                    >
                      Open quote
                    </button>
                  )}
                  {selectedTask.status !== 'Complete' && (
                    <button className="button primary" onClick={() => completeTask(selectedTask.id)}>
                      <Check /> Mark complete
                    </button>
                  )}
                </div>
              </>
            )}
            {selectedDocument && (
              <>
                <div className="drawer-header">
                  <div>
                    <p className="eyebrow">{selectedDocument.job}</p>
                    <h2>{selectedDocument.name}</h2>
                    <p className="subtitle">{selectedDocument.owner}</p>
                  </div>
                  <button className="icon-button" onClick={() => setDetail(null)} aria-label="Close details">
                    <X />
                  </button>
                </div>
                <div className="drawer-body">
                  <Badge tone={selectedDocument.tone}>{selectedDocument.status}</Badge>
                  <div className="meta-grid">
                    <div>
                      <span>TYPE</span>
                      <strong>{selectedDocument.type}</strong>
                    </div>
                    <div>
                      <span>UPDATED</span>
                      <strong>{selectedDocument.updated}</strong>
                    </div>
                    <div>
                      <span>LINKED JOB</span>
                      <strong className="mono">{selectedDocument.job}</strong>
                    </div>
                    <div>
                      <span>OWNER</span>
                      <strong>{selectedDocument.owner}</strong>
                    </div>
                  </div>
                  <div className="drawer-note">
                    <span>HANDOFF NOTE</span>
                    <p>
                      {selectedDocument.status === 'Awaiting upload'
                        ? 'File is blocking customs clearance. Chase the owner or upload a draft copy.'
                        : selectedDocument.status === 'Needs review'
                          ? 'Check figures against the booking, then mark verified for arrival handoff.'
                          : 'Document is verified and ready for the next milestone.'}
                    </p>
                  </div>
                </div>
                <div className="drawer-actions">
                  <button
                    className="button secondary"
                    onClick={() => {
                      setDetail({ kind: 'shipment', id: selectedDocument.job })
                      setActiveNav('Shipments & Jobs')
                    }}
                  >
                    Open job
                  </button>
                  {selectedDocument.status === 'Awaiting upload' && (
                    <button className="button secondary" onClick={() => toast(`Chase email sent for ${selectedDocument.name}`)}>
                      Chase owner
                    </button>
                  )}
                  {selectedDocument.status !== 'Verified' && (
                    <button className="button primary" onClick={() => verifyDocument(selectedDocument.id)}>
                      Mark verified
                    </button>
                  )}
                </div>
              </>
            )}
          </aside>
        </>
      )}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((item) => (
          <div className="toast" key={item.id}>
            <CheckCircle2 />
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuoteTable({ rows, onOpen }: { rows: Quote[]; onOpen: (id: string) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>QUOTE</th>
            <th>CUSTOMER</th>
            <th>LANE & MODE</th>
            <th>VALUE</th>
            <th>STATUS</th>
            <th>AGE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((quote) => (
            <tr key={quote.id} onClick={() => onOpen(quote.id)}>
              <td>
                <strong className="mono">{quote.id}</strong>
              </td>
              <td>
                <strong>{quote.customer}</strong>
              </td>
              <td>
                <span>{quote.lane}</span>
                <small>{quote.mode}</small>
              </td>
              <td>
                <strong>{money(quote.value)}</strong>
              </td>
              <td>
                <Badge tone={quote.tone}>{quote.status}</Badge>
              </td>
              <td className="muted">{quote.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ShipmentList({
  rows,
  onOpen,
  emptyAction,
}: {
  rows: Shipment[]
  onOpen: (id: string) => void
  emptyAction?: () => void
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Ship}
        title="No shipments match"
        description="Try another status chip or create a shipment draft for this lane."
        action={emptyAction ? 'Create shipment' : undefined}
        onAction={emptyAction}
      />
    )
  }

  return (
    <div className="shipment-list">
      {rows.map((shipment) => (
        <button key={shipment.id} className="shipment-row" onClick={() => onOpen(shipment.id)}>
          <div className="shipment-id">
            <div className={`shipment-icon ${shipment.status === 'At risk' ? 'warn' : ''}`}>
              <Ship />
            </div>
            <div>
              <strong className="mono">{shipment.id}</strong>
              <span>{shipment.customer}</span>
              <span className="shipment-mobile-eta">ETA {shipment.eta}</span>
            </div>
          </div>
          <div>
            <strong>{shipment.route}</strong>
            <span>{shipment.mode}</span>
          </div>
          <div className="progress-wrap">
            <div className="progress-label">
              <span>{shipment.milestone}</span>
              <strong>{shipment.progress}%</strong>
            </div>
            <div className={`progress ${shipment.status === 'At risk' ? 'risk' : shipment.status === 'Complete' ? 'done' : ''}`}>
              <i style={{ width: `${shipment.progress}%` }} />
            </div>
          </div>
          <div className="eta">
            <strong>{shipment.eta}</strong>
            <span>ETA</span>
          </div>
          <div className="shipment-status-col">
            <Badge tone={shipment.tone}>{shipment.status}</Badge>
          </div>
        </button>
      ))}
    </div>
  )
}

function CreateModal({
  kind,
  jobOptions,
  quoteOptions,
  onClose,
  onQuote,
  onShipment,
  onDocument,
  onTask,
}: {
  kind: Exclude<CreateKind, null>
  jobOptions: string[]
  quoteOptions: string[]
  onClose: () => void
  onQuote: (quote: Quote) => void
  onShipment: (shipment: Shipment) => void
  onDocument: (document: DocumentRow) => void
  onTask: (task: TaskRow) => void
}) {
  const firstField = useRef<HTMLInputElement>(null)
  const [customer, setCustomer] = useState('Meridian Retail Group')
  const [origin, setOrigin] = useState('Lagos')
  const [destination, setDestination] = useState('Rotterdam')
  const [mode, setMode] = useState('Ocean FCL')
  const [value, setValue] = useState('15000')
  const [eta, setEta] = useState('25 Oct 2026')
  const [vessel, setVessel] = useState('')
  const [notes, setNotes] = useState('')
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('PDF')
  const [linkedJob, setLinkedJob] = useState(jobOptions[0] || quoteOptions[0] || '')
  const [priority, setPriority] = useState<TaskRow['priority']>('Medium')
  const [due, setDue] = useState('Tomorrow')

  useEffect(() => {
    window.setTimeout(() => firstField.current?.focus(), 30)
  }, [kind])

  const meta: Record<Exclude<CreateKind, null>, { title: string; subtitle: string; icon: typeof FileText; submit: string }> = {
    quote: {
      title: 'New quotation',
      subtitle: 'Draft a lane option and add it to the pipeline.',
      icon: FileText,
      submit: 'Create quotation',
    },
    shipment: {
      title: 'Create shipment',
      subtitle: 'Book a job and start tracking milestones.',
      icon: Ship,
      submit: 'Create shipment',
    },
    document: {
      title: 'Upload document',
      subtitle: 'Attach a file to a job for review or verification.',
      icon: Upload,
      submit: 'Upload document',
    },
    task: {
      title: 'Create task',
      subtitle: 'Log a follow-up or exception for the operations team.',
      icon: ClipboardList,
      submit: 'Create task',
    },
  }

  const current = meta[kind]
  const Icon = current.icon
  const linkOptions = [...jobOptions, ...quoteOptions]

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={current.title}>
      <div className="modal-header">
        <div>
          <div className="modal-kind">
            <span className="icon-box info">
              <Icon />
            </span>
          </div>
          <h2>{current.title}</h2>
          <p className="subtitle">{current.subtitle}</p>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close dialog">
          <X />
        </button>
      </div>
      <form
        className="modal-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (kind === 'quote') {
            const next: Quote = {
              id: `QT-${2482 + Math.floor(Math.random() * 80)}`,
              customer,
              lane: `${origin} → ${destination}`,
              mode,
              value: Number(value) || 0,
              status: 'Draft',
              tone: 'slate',
              age: 'Just now',
              owner: 'Kemi Oladipo',
              validUntil: '19 Oct 2026',
              notes: notes || 'Created from the operations workspace.',
            }
            onQuote(next)
            return
          }
          if (kind === 'shipment') {
            const next: Shipment = {
              id: `FML-${10483 + Math.floor(Math.random() * 80)}`,
              customer,
              route: `${origin} → ${destination}`,
              origin,
              destination,
              milestone: 'Booked',
              progress: 8,
              eta,
              status: 'On track',
              tone: 'blue',
              mode,
              vessel: vessel || 'Carrier TBC',
              owner: 'Kemi Oladipo',
              timeline: [
                { label: 'Booked', done: true, current: true, at: 'Just now' },
                { label: 'Gate in', done: false },
                { label: 'Departed', done: false },
                { label: 'Arrival', done: false, at: eta },
                { label: 'Delivered', done: false },
              ],
            }
            onShipment(next)
            return
          }
          if (kind === 'document') {
            const next: DocumentRow = {
              id: `DOC-${450 + Math.floor(Math.random() * 80)}`,
              name: title,
              job: linkedJob,
              owner: customer || 'Kemi Oladipo',
              status: 'Needs review',
              tone: 'blue',
              type: docType,
              updated: 'Just now',
            }
            onDocument(next)
            return
          }
          const next: TaskRow = {
            id: `TSK-${100 + Math.floor(Math.random() * 80)}`,
            title,
            job: linkedJob,
            owner: 'Kemi Oladipo',
            status: 'Open',
            tone: priority === 'High' ? 'rose' : priority === 'Low' ? 'slate' : 'blue',
            due,
            priority,
          }
          onTask(next)
        }}
      >
        <div className="modal-body form-grid">
          {(kind === 'quote' || kind === 'shipment') && (
            <>
              <label className="field">
                <span>Customer</span>
                <input ref={firstField} value={customer} onChange={(event) => setCustomer(event.target.value)} required />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Origin</span>
                  <input value={origin} onChange={(event) => setOrigin(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Destination</span>
                  <input value={destination} onChange={(event) => setDestination(event.target.value)} required />
                </label>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Mode</span>
                  <select value={mode} onChange={(event) => setMode(event.target.value)}>
                    <option>Ocean FCL</option>
                    <option>Ocean LCL</option>
                    <option>Air Freight</option>
                    <option>Project Cargo</option>
                  </select>
                </label>
                {kind === 'quote' ? (
                  <label className="field">
                    <span>Quoted value (USD)</span>
                    <input value={value} onChange={(event) => setValue(event.target.value)} inputMode="numeric" />
                  </label>
                ) : (
                  <label className="field">
                    <span>ETA</span>
                    <input value={eta} onChange={(event) => setEta(event.target.value)} required />
                  </label>
                )}
              </div>
              {kind === 'shipment' && (
                <label className="field">
                  <span>Vessel / flight</span>
                  <input value={vessel} onChange={(event) => setVessel(event.target.value)} placeholder="Optional carrier reference" />
                </label>
              )}
              {kind === 'quote' && (
                <label className="field">
                  <span>Notes</span>
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Validity window, equipment, special handling…" />
                </label>
              )}
            </>
          )}

          {kind === 'document' && (
            <>
              <label className="field">
                <span>Document name</span>
                <input ref={firstField} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Commercial invoice" required />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Linked job</span>
                  <select value={linkedJob} onChange={(event) => setLinkedJob(event.target.value)} required>
                    {jobOptions.map((job) => (
                      <option key={job} value={job}>
                        {job}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>File type</span>
                  <select value={docType} onChange={(event) => setDocType(event.target.value)}>
                    <option>PDF</option>
                    <option>XLSX</option>
                    <option>DOCX</option>
                    <option>IMG</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Owner / source</span>
                <input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Customer or team member" />
              </label>
            </>
          )}

          {kind === 'task' && (
            <>
              <label className="field">
                <span>Task title</span>
                <input ref={firstField} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Follow up with customer" required />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Linked record</span>
                  <select value={linkedJob} onChange={(event) => setLinkedJob(event.target.value)} required>
                    {linkOptions.map((job) => (
                      <option key={job} value={job}>
                        {job}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Priority</span>
                  <select value={priority} onChange={(event) => setPriority(event.target.value as TaskRow['priority'])}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Due</span>
                <input value={due} onChange={(event) => setDue(event.target.value)} placeholder="Today, 17:00" required />
              </label>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            <Plus /> {current.submit}
          </button>
        </div>
      </form>
    </div>
  )
}

