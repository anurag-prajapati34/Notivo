// ─── pages/Landing.tsx ───────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  Zap,
  ArrowRight,
  RefreshCw,
  Shield,
  Clock,
  BarChart3,
  CheckCircle2,
  LayoutTemplate,
  Send,
  GitBranch,
  // Github,
} from "lucide-react"

// ─── Terminal animation ───────────────────────────────────────────────────────

const terminalLines = [
  { delay: 0, text: "POST /api/v1/send", color: "text-indigo-400", prefix: "›" },
  { delay: 600, text: '{ to: "anurag@acme.com", templateId: "welcome-email" }', color: "text-gray-400", prefix: " " },
  { delay: 1200, text: "✓ 200 OK — job queued in 2ms", color: "text-emerald-400", prefix: " " },
  { delay: 2000, text: "", color: "", prefix: " " },
  { delay: 2100, text: "[worker] picked up job #1841", color: "text-gray-500", prefix: "#" },
  { delay: 2700, text: "[worker] attempt 1 — connecting SMTP…", color: "text-gray-500", prefix: "#" },
  { delay: 3400, text: "[worker] attempt 1 failed — timeout", color: "text-red-400", prefix: "#" },
  { delay: 4000, text: "[worker] retrying in 30s (backoff ×1)", color: "text-amber-400", prefix: "#" },
  { delay: 4700, text: "[worker] attempt 2 — connecting SMTP…", color: "text-gray-500", prefix: "#" },
  { delay: 5400, text: "[worker] attempt 2 success", color: "text-emerald-400", prefix: "#" },
  { delay: 6000, text: "✓ delivered at 08:31:08 UTC", color: "text-emerald-300", prefix: " " },
]

const TerminalAnimation = () => {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    terminalLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((p) => [...p, i])
      }, line.delay)
    })

    const cursorInterval = setInterval(() => setCursor((c) => !c), 500)
    return () => clearInterval(cursorInterval)
  }, [])

  // Loop animation every 8 seconds
  useEffect(() => {
    const loop = setInterval(() => {
      setVisibleLines([])
      terminalLines.forEach((line, i) => {
        setTimeout(() => {
          setVisibleLines((p) => [...p, i])
        }, line.delay)
      })
    }, 8000)
    return () => clearInterval(loop)
  }, [])

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-amber-500/70" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-xs text-gray-500 font-mono">
          notivo — live queue
        </span>
      </div>

      {/* Terminal body */}
      <div className="px-5 py-5 font-mono text-sm min-h-[280px] space-y-1.5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-600 text-xs">notivo@worker:~$</span>
          <span className="text-gray-300 text-xs">npm run worker</span>
        </div>

        {terminalLines.map((line, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 transition-all duration-300 ${visibleLines.includes(i)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-1"
              }`}
          >
            <span className="text-gray-600 text-xs shrink-0 w-3">
              {line.prefix}
            </span>
            <span className={`text-xs leading-relaxed ${line.color}`}>
              {line.text}
            </span>
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gray-600 text-xs w-3">›</span>
          <span
            className={`text-xs text-gray-500 transition-opacity ${cursor ? "opacity-100" : "opacity-0"
              }`}
          >
            █
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Code block ───────────────────────────────────────────────────────────────

const CodeBlock = () => {
  const [copied, setCopied] = useState(false)

  const code = `// Install and call in 3 lines
const res = await fetch("https://notivo.app/api/v1/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer notivo_your_key",
    "Content-Type": "application/json"
  },
 body: JSON.stringify({
  templateId: "welcome-email",
  recipients: [
    "customer@yourapp.com"
  ],
  variables: [
    {
      variableName: "name",
      variableValue: "Anurag"
    },
    {
      variableName: "appName",
      variableValue: "YourApp"
    }
  ]
})
})

// Response is immediate — email goes via queue
// { "success": true, "jobId": "1841" }`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs text-gray-500 font-mono">send.js</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <><CheckCircle2 size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></>
          ) : (
            "Copy"
          )}
        </button>
      </div>
      <pre className="px-5 py-5 text-xs leading-relaxed overflow-x-auto">
        <code>
          {code.split("\n").map((line, i) => {
            // Simple syntax highlighting
            const isComment = line.trim().startsWith("//")
            const isString = line.includes('"') || line.includes("'")
            const isKey = /^\s+"[^"]+":/.test(line)

            if (isComment) {
              return (
                <div key={i} className="text-gray-600">{line || " "}</div>
              )
            }
            if (isKey) {
              const parts = line.split(/:(.+)/)
              return (
                <div key={i}>
                  <span className="text-blue-400">{parts[0]}</span>
                  <span className="text-gray-400">:</span>
                  <span className="text-amber-300">{parts[1]}</span>
                </div>
              )
            }
            return (
              <div key={i} className={isString ? "text-gray-300" : "text-gray-300"}>
                {line || " "}
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType
  title: string
  description: string
  accent: string
}) => (
  <div className="group border border-gray-800 rounded-xl p-6 bg-gray-950 hover:border-gray-700 hover:bg-gray-900 transition-all duration-200">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${accent}`}>
      <Icon size={17} className="text-white" />
    </div>
    <h3 className="text-sm font-semibold text-gray-100 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
)

// ─── Step item ────────────────────────────────────────────────────────────────

const Step = ({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) => (
  <div className="flex gap-4">
    <div className="shrink-0">
      <div className="w-8 h-8 rounded-full border border-indigo-500/40 flex items-center justify-center">
        <span className="text-xs font-bold text-indigo-400">{number}</span>
      </div>
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
)

// ─── Landing page ─────────────────────────────────────────────────────────────

export const Landing = () => {
  const featuresRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-[#080810] text-gray-100">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/60 bg-[#080810]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Notivo
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Features
            </button>
            <a
              href="https://github.com/anurag-prajapati34"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5"
            >
              <GitBranch size={14} />
              GitHub
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              Get started
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs text-indigo-400 font-medium">
                  Open beta — free to use
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
                Email delivery
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  that doesn't block
                </span>
                <br />
                your API.
              </h1>

              {/* Subheadline */}
              <p className="text-base text-gray-400 leading-relaxed mb-8 max-w-md">
                Notivo queues your emails in Redis, retries failures automatically
                with exponential backoff, and gives you full delivery logs — so
                your users never wait and your notifications never silently disappear.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to="/signup"
                  className="h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/40"
                >
                  Start for free
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="h-10 px-5 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                  See how it works
                </button>
              </div>

              {/* Social proof / stats */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-800">
                <div>
                  <p className="text-xl font-bold text-white">3</p>
                  <p className="text-xs text-gray-500">retry attempts</p>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div>
                  <p className="text-xl font-bold text-white">&lt;5ms</p>
                  <p className="text-xs text-gray-500">API response time</p>
                </div>
                <div className="w-px h-8 bg-gray-800" />
                <div>
                  <p className="text-xl font-bold text-white">100%</p>
                  <p className="text-xs text-gray-500">delivery logged</p>
                </div>
              </div>
            </div>

            {/* Right — terminal */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
              <TerminalAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech stack bar ── */}
      <section className="py-8 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <span className="text-xs text-gray-600">Built with</span>
            {["Node.js", "BullMQ", "Redis", "MySQL", "Drizzle ORM", "Nodemailer", "TypeScript"].map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono text-gray-500 px-2.5 py-1 border border-gray-800 rounded-md bg-gray-900"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-3">
              How it works
            </p>
            <h2 className="text-2xl font-bold text-white">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <Step
              number="1"
              title="Connect your SMTP"
              description="Configure your SMTP Credentials. Notivo uses your credentials so emails come from your domain."
            />
            <Step
              number="2"
              title="Pick a template"
              description="Choose premade email templates — welcome, OTP, password reset, etc."
            />
            <Step
              number="3"
              title="Call the API"
              description="POST to /api/v1/email/send with your API key. Response is instant. Notivo queues the job and handles delivery in background."
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} className="py-20 px-6 bg-gray-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-3">
              What's built
            </p>
            <h2 className="text-2xl font-bold text-white">
              Features implemented
            </h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto mt-3">
              Built to demonstrate async backend architecture — BullMQ job queues,
              retry logic, encrypted credential storage, and delivery tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Send}
              accent="bg-indigo-600"
              title="Async queue processing"
              description="API adds email jobs to a BullMQ queue backed by Upstash Redis. Response returns immediately — SMTP happens in a background worker."
            />
            <FeatureCard
              icon={RefreshCw}
              accent="bg-orange-600"
              title="Retry with exponential backoff"
              description="Failed jobs retry up to 3 times — 30s, 60s, 120s delays. Each attempt is saved with its error message and timestamp."
            />
            <FeatureCard
              icon={BarChart3}
              accent="bg-emerald-600"
              title="Delivery tracking"
              description="Every notification has a log entry. The detail page shows a full retry timeline — which attempt succeeded or failed and why."
            />
            <FeatureCard
              icon={LayoutTemplate}
              accent="bg-violet-600"
              title="Template system"
              description="HTML email templates with {{variable}} placeholders. Variables are validated before queuing and replaced at render time."
            />
            <FeatureCard
              icon={Clock}
              accent="bg-blue-600"
              title="Scheduled delivery"
              description="Pass a scheduleAt timestamp — BullMQ's delayed job feature holds the job and fires it at exactly the right time."
            />
            <FeatureCard
              icon={Shield}
              accent="bg-rose-600"
              title="Encrypted SMTP storage"
              description="SMTP passwords are stored AES-256 encrypted using a key from environment variables. Never stored as plain text."
            />
          </div>
        </div>
      </section>

      {/* ── Code section ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — explanation */}
            <div>
              <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-4">
                The API
              </p>
              <h2 className="text-2xl font-bold text-white mb-4">
                One endpoint.
                <br />
                Everything handled.
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                POST to <code className="text-indigo-400 font-mono text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded">/api/v1/send</code> with
                your template ID and variable values. Notivo validates,
                renders, queues, delivers, and logs — you get on with building
                your product.
              </p>

              <div className="space-y-3">
                {[
                  "API key authentication via Authorization header",
                  "Variable validation before the job is queued",
                  "Immediate response — no waiting for SMTP",
                  "Delivery status available in dashboard instantly",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — code */}
            <CodeBlock />
          </div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border border-gray-800 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-gray-950 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
              <Zap size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Start sending in 5 minutes
            </h2>
            <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
              Create an account, connect your SMTP, pick a template. Your first
              email is queued in under a minute.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <Link
                to="/signup"
                className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/40"
              >
                Create free account
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/login"
                className="h-10 px-5 border border-gray-700 hover:border-gray-500 text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center"
              >Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap size={10} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Notivo</span>
            <span className="text-xs text-gray-600 ml-1">v1.0.0-beta</span>
          </div>

          <p className="text-xs text-gray-600">
            Built by{" "}
            <a
              href="https://github.com/anurag-prajapati34"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              Anurag Prajapati
            </a>
            {" "}— a portfolio project demonstrating async backend architecture.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/anurag-prajapati34"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <GitBranch size={13} />
              GitHub
            </a>
            <Link
              to="/login"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}