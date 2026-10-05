export type Tone = 'amber' | 'emerald' | 'blue' | 'slate' | 'rose'

export type Quote = {
  id: string
  customer: string
  lane: string
  mode: string
  value: number
  status: 'Draft' | 'In review' | 'Awaiting response' | 'Approved'
  tone: Tone
  age: string
  owner: string
  validUntil: string
  notes: string
}

export type Milestone = { label: string; done: boolean; current?: boolean; at?: string }

export type Shipment = {
  id: string
  customer: string
  route: string
  origin: string
  destination: string
  milestone: string
  progress: number
  eta: string
  status: 'On track' | 'At risk' | 'Complete'
  tone: Tone
  mode: string
  vessel: string
  owner: string
  timeline: Milestone[]
}

export type DocumentRow = {
  id: string
  name: string
  job: string
  owner: string
  status: 'Awaiting upload' | 'Needs review' | 'Verified'
  tone: Tone
  type: string
  updated: string
}

export type TaskRow = {
  id: string
  title: string
  job: string
  owner: string
  status: 'Due today' | 'In progress' | 'Open' | 'Complete'
  tone: Tone
  due: string
  priority: 'High' | 'Medium' | 'Low'
}

export type ActivityItem = {
  id: string
  kind: 'success' | 'alert' | 'team' | 'doc'
  title: string
  detail: string
  time: string
  actor: string
}

export type CalendarEvent = {
  id: string
  date: string
  title: string
  job?: string
  tone: Tone
  time: string
}

export type Notification = {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
  tone: Tone
}

export const quotes: Quote[] = [
  {
    id: 'QT-2481',
    customer: 'Meridian Retail Group',
    lane: 'Lagos → Rotterdam',
    mode: 'Ocean FCL',
    value: 18420,
    status: 'Awaiting response',
    tone: 'amber',
    age: '2h ago',
    owner: 'Kojo Asante',
    validUntil: '12 Oct 2026',
    notes: 'Customer asked for a 40ft alternative and a 10-day validity window.',
  },
  {
    id: 'QT-2480',
    customer: 'Atlas Manufacturing',
    lane: 'Shanghai → Felixstowe',
    mode: 'Ocean LCL',
    value: 9850,
    status: 'Draft',
    tone: 'slate',
    age: '5h ago',
    owner: 'Kemi Oladipo',
    validUntil: '14 Oct 2026',
    notes: 'Waiting on updated carton dimensions before sending.',
  },
  {
    id: 'QT-2479',
    customer: 'Northstar Foods',
    lane: 'Accra → London',
    mode: 'Air Freight',
    value: 4260,
    status: 'Approved',
    tone: 'emerald',
    age: '1d ago',
    owner: 'Ama Mensah',
    validUntil: '08 Oct 2026',
    notes: 'Approved with temperature-controlled handling notes.',
  },
  {
    id: 'QT-2478',
    customer: 'Greenline Energy',
    lane: 'Houston → Tema',
    mode: 'Project Cargo',
    value: 32100,
    status: 'In review',
    tone: 'blue',
    age: '1d ago',
    owner: 'Kemi Oladipo',
    validUntil: '18 Oct 2026',
    notes: 'Oversize transformers. Port survey still outstanding.',
  },
  {
    id: 'QT-2476',
    customer: 'Sahara Textiles',
    lane: 'Mumbai → Tema',
    mode: 'Ocean FCL',
    value: 11240,
    status: 'Awaiting response',
    tone: 'amber',
    age: '2d ago',
    owner: 'Kojo Asante',
    validUntil: '10 Oct 2026',
    notes: 'Follow up before validity expires this week.',
  },
  {
    id: 'QT-2474',
    customer: 'Helios Pharma',
    lane: 'Frankfurt → Accra',
    mode: 'Air Freight',
    value: 6780,
    status: 'Approved',
    tone: 'emerald',
    age: '3d ago',
    owner: 'Ama Mensah',
    validUntil: '09 Oct 2026',
    notes: 'GDP-compliant handling confirmed with carrier.',
  },
]

export const shipments: Shipment[] = [
  {
    id: 'FML-10482',
    customer: 'Meridian Retail Group',
    route: 'Lagos → Rotterdam',
    origin: 'Lagos',
    destination: 'Rotterdam',
    milestone: 'Vessel departed',
    progress: 68,
    eta: '18 Oct 2026',
    status: 'On track',
    tone: 'emerald',
    mode: 'Ocean FCL',
    vessel: 'Maersk Tema Express',
    owner: 'Kojo Asante',
    timeline: [
      { label: 'Booked', done: true, at: '12 Sep' },
      { label: 'Gate in', done: true, at: '28 Sep' },
      { label: 'Vessel departed', done: true, current: true, at: '01 Oct' },
      { label: 'Arrival', done: false, at: '18 Oct' },
      { label: 'Customs', done: false },
      { label: 'Delivered', done: false },
    ],
  },
  {
    id: 'FML-10481',
    customer: 'Atlas Manufacturing',
    route: 'Shanghai → Felixstowe',
    origin: 'Shanghai',
    destination: 'Felixstowe',
    milestone: 'Awaiting customs docs',
    progress: 42,
    eta: '22 Oct 2026',
    status: 'At risk',
    tone: 'amber',
    mode: 'Ocean LCL',
    vessel: 'CMA CGM Lotus',
    owner: 'Ama Mensah',
    timeline: [
      { label: 'Booked', done: true, at: '08 Sep' },
      { label: 'Gate in', done: true, at: '20 Sep' },
      { label: 'Vessel departed', done: true, at: '24 Sep' },
      { label: 'Customs docs', done: false, current: true, at: 'Due today' },
      { label: 'Arrival', done: false, at: '22 Oct' },
      { label: 'Delivered', done: false },
    ],
  },
  {
    id: 'FML-10479',
    customer: 'Northstar Foods',
    route: 'Accra → London',
    origin: 'Accra',
    destination: 'London',
    milestone: 'Delivered',
    progress: 100,
    eta: 'Delivered 04 Oct',
    status: 'Complete',
    tone: 'slate',
    mode: 'Air Freight',
    vessel: 'BA 078',
    owner: 'Ama Mensah',
    timeline: [
      { label: 'Booked', done: true, at: '01 Oct' },
      { label: 'Departed', done: true, at: '03 Oct' },
      { label: 'Arrived', done: true, at: '04 Oct' },
      { label: 'Customs', done: true, at: '04 Oct' },
      { label: 'Delivered', done: true, current: true, at: '04 Oct' },
    ],
  },
  {
    id: 'FML-10477',
    customer: 'Greenline Energy',
    route: 'Houston → Tema',
    origin: 'Houston',
    destination: 'Tema',
    milestone: 'Inland positioning',
    progress: 24,
    eta: '29 Oct 2026',
    status: 'On track',
    tone: 'blue',
    mode: 'Project Cargo',
    vessel: 'BBC Rhine',
    owner: 'Kemi Oladipo',
    timeline: [
      { label: 'Survey', done: true, at: '18 Sep' },
      { label: 'Inland positioning', done: false, current: true, at: 'This week' },
      { label: 'Load-out', done: false },
      { label: 'Sail', done: false, at: '12 Oct' },
      { label: 'Arrival', done: false, at: '29 Oct' },
    ],
  },
]

export const documents: DocumentRow[] = [
  { id: 'DOC-441', name: 'Commercial invoice', job: 'FML-10481', owner: 'Atlas Manufacturing', status: 'Awaiting upload', tone: 'amber', type: 'PDF', updated: 'Due today' },
  { id: 'DOC-440', name: 'Bill of lading', job: 'FML-10482', owner: 'Meridian Retail Group', status: 'Verified', tone: 'emerald', type: 'PDF', updated: '1h ago' },
  { id: 'DOC-438', name: 'Packing list', job: 'FML-10479', owner: 'Northstar Foods', status: 'Verified', tone: 'emerald', type: 'PDF', updated: 'Yesterday' },
  { id: 'DOC-436', name: 'Certificate of origin', job: 'FML-10477', owner: 'Greenline Energy', status: 'Needs review', tone: 'blue', type: 'PDF', updated: '3h ago' },
  { id: 'DOC-434', name: 'Packing list', job: 'FML-10481', owner: 'Atlas Manufacturing', status: 'Awaiting upload', tone: 'amber', type: 'XLSX', updated: 'Due today' },
  { id: 'DOC-431', name: 'Dangerous goods declaration', job: 'FML-10477', owner: 'Greenline Energy', status: 'Needs review', tone: 'blue', type: 'PDF', updated: 'Yesterday' },
]

export const tasks: TaskRow[] = [
  { id: 'TSK-91', title: 'Upload customs documents', job: 'FML-10481', owner: 'Ama Mensah', status: 'Due today', tone: 'amber', due: 'Today, 17:00', priority: 'High' },
  { id: 'TSK-90', title: 'Confirm vessel arrival window', job: 'FML-10482', owner: 'Kojo Asante', status: 'In progress', tone: 'blue', due: 'Tomorrow', priority: 'Medium' },
  { id: 'TSK-88', title: 'Review carrier invoice', job: 'FML-10477', owner: 'Kemi Oladipo', status: 'Open', tone: 'slate', due: '08 Oct', priority: 'Medium' },
  { id: 'TSK-86', title: 'Update customer ETA', job: 'FML-10479', owner: 'Ama Mensah', status: 'Complete', tone: 'emerald', due: '04 Oct', priority: 'Low' },
  { id: 'TSK-85', title: 'Chase quote QT-2481', job: 'QT-2481', owner: 'Kojo Asante', status: 'Due today', tone: 'rose', due: 'Today, 15:00', priority: 'High' },
  { id: 'TSK-82', title: 'Port survey follow-up', job: 'FML-10477', owner: 'Kemi Oladipo', status: 'In progress', tone: 'blue', due: '07 Oct', priority: 'High' },
]

export const activity: ActivityItem[] = [
  { id: 'a1', kind: 'success', title: 'FML-10479 marked delivered', detail: 'Ama Mensah closed the Northstar Foods air movement.', time: '12 minutes ago', actor: 'Ama Mensah' },
  { id: 'a2', kind: 'alert', title: 'Customs documents missing', detail: 'FML-10481 will miss the next cut-off without a commercial invoice.', time: '48 minutes ago', actor: 'System' },
  { id: 'a3', kind: 'team', title: 'Quotation QT-2481 created', detail: 'Kojo Asante sent an Ocean FCL option to Meridian Retail Group.', time: '2 hours ago', actor: 'Kojo Asante' },
  { id: 'a4', kind: 'doc', title: 'Bill of lading verified', detail: 'FML-10482 documents are ready for arrival handoff.', time: '3 hours ago', actor: 'Kemi Oladipo' },
  { id: 'a5', kind: 'alert', title: 'Quote validity expiring', detail: 'QT-2476 for Sahara Textiles expires on 10 October.', time: '5 hours ago', actor: 'System' },
]

export const notifications: Notification[] = [
  { id: 'n1', title: 'Exception: FML-10481', body: 'Commercial invoice still outstanding for Atlas Manufacturing.', time: '48m', unread: true, tone: 'amber' },
  { id: 'n2', title: 'Quote waiting on customer', body: 'Meridian Retail Group has not responded to QT-2481.', time: '2h', unread: true, tone: 'blue' },
  { id: 'n3', title: 'Delivery confirmed', body: 'Northstar Foods FML-10479 was signed off in London.', time: '6h', unread: false, tone: 'emerald' },
  { id: 'n4', title: 'Invoice to review', body: 'Carrier invoice for FML-10477 is ready in documents.', time: '1d', unread: false, tone: 'slate' },
]

export const calendarEvents: CalendarEvent[] = [
  { id: 'c1', date: '2026-10-05', title: 'Customs docs due', job: 'FML-10481', tone: 'amber', time: '17:00' },
  { id: 'c2', date: '2026-10-05', title: 'Chase quote QT-2481', job: 'QT-2481', tone: 'rose', time: '15:00' },
  { id: 'c3', date: '2026-10-06', title: 'Vessel arrival check', job: 'FML-10482', tone: 'blue', time: '09:30' },
  { id: 'c4', date: '2026-10-07', title: 'Port survey follow-up', job: 'FML-10477', tone: 'blue', time: '11:00' },
  { id: 'c5', date: '2026-10-08', title: 'Carrier invoice review', job: 'FML-10477', tone: 'slate', time: '14:00' },
  { id: 'c6', date: '2026-10-09', title: 'Customer weekly update', job: 'Meridian', tone: 'emerald', time: '16:00' },
  { id: 'c7', date: '2026-10-18', title: 'ETA Rotterdam', job: 'FML-10482', tone: 'emerald', time: 'All day' },
  { id: 'c8', date: '2026-10-22', title: 'ETA Felixstowe', job: 'FML-10481', tone: 'amber', time: 'All day' },
]

export const team = [
  { initials: 'KO', name: 'Kemi Oladipo', role: 'Operations lead' },
  { initials: 'AM', name: 'Ama Mensah', role: 'Documentation' },
  { initials: 'KA', name: 'Kojo Asante', role: 'Pricing' },
  { initials: 'EO', name: 'Esi Owusu', role: 'Customer desk' },
]

export const weeklyVolume = [
  { label: 'W26', quotes: 18, jobs: 11 },
  { label: 'W27', quotes: 22, jobs: 14 },
  { label: 'W28', quotes: 16, jobs: 12 },
  { label: 'W29', quotes: 25, jobs: 17 },
  { label: 'W30', quotes: 21, jobs: 15 },
  { label: 'W31', quotes: 28, jobs: 19 },
]

export const lanes = [
  { lane: 'Lagos → Rotterdam', jobs: 14, onTime: 93, margin: 18 },
  { lane: 'Accra → London', jobs: 9, onTime: 96, margin: 22 },
  { lane: 'Shanghai → Felixstowe', jobs: 11, onTime: 81, margin: 14 },
  { lane: 'Houston → Tema', jobs: 4, onTime: 88, margin: 26 },
]

export function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export const weekDays = [
  { date: '2026-10-05', label: 'Mon', n: '05', today: true },
  { date: '2026-10-06', label: 'Tue', n: '06', today: false },
  { date: '2026-10-07', label: 'Wed', n: '07', today: false },
  { date: '2026-10-08', label: 'Thu', n: '08', today: false },
  { date: '2026-10-09', label: 'Fri', n: '09', today: false },
  { date: '2026-10-10', label: 'Sat', n: '10', today: false },
  { date: '2026-10-11', label: 'Sun', n: '11', today: false },
]
