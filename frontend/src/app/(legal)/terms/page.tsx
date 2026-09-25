import Link from 'next/link';

const sections = [
  ['1. Using FlowSync', 'FlowSync provides collaborative workspace and workflow-management features. By using the service, you agree to use it lawfully, respect other workspace members, and follow any rules communicated by your workspace owner or administrator.'],
  ['2. Your account', 'You are responsible for keeping your sign-in credentials secure and for activity performed through your account. Do not share credentials or use another person’s account without authorization. Workspace permissions are enforced according to the role assigned to your account.'],
  ['3. Workspace content', 'You retain responsibility for the information and content you place in a workspace. Do not upload or share material you do not have the right to use. Workspace owners and administrators are responsible for managing membership and access within their workspaces.'],
  ['4. AI-assisted features', 'FlowSync may provide AI-assisted task breakdowns and planning suggestions. AI output can be incomplete or incorrect, so you should review it before using it to make decisions or perform work. You remain responsible for the final tasks, plans, and actions you create.'],
  ['5. Availability and changes', 'We may update, improve, suspend, or discontinue features as the service evolves. We will make reasonable efforts to preserve user access and data while maintaining and improving the service, subject to operational, security, and legal requirements.'],
  ['6. Acceptable use', 'Do not use FlowSync to abuse, disrupt, probe, or bypass security controls; to gain unauthorized access; or to distribute unlawful or harmful content. We may restrict access when necessary to protect the service, its users, or the security of the platform.'],
  ['7. Termination', 'You may stop using FlowSync at any time. Access may also be suspended or terminated when required by security, abuse-prevention, legal, or account-management needs. Workspace owners remain responsible for managing their workspace membership and content.'],
  ['8. Questions', 'If you have questions about these terms, use the supported contact channel provided by FlowSync.'],
] as const;

export default function TermsOfServicePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="glass-card overflow-hidden">
          <header className="border-b border-white/10 bg-white/[0.03] px-6 py-8 sm:px-10">
            <div className="mb-4 inline-flex items-center rounded-full border border-accent-blue/20 bg-accent-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue">FlowSync legal</div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">These terms explain the basic rules for using FlowSync, managing workspaces, and using its collaborative and AI-assisted features.</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-text-dim">Version 1.1.0 · Last updated September 2026</p>
          </header>
          <div className="grid gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_220px] lg:gap-14 lg:py-10">
            <article className="space-y-9">
              {sections.map(([title, body]) => (
                <section key={title}>
                  <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{body}</p>
                </section>
              ))}
            </article>
            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-dim">Related</p>
              <div className="mt-4 space-y-3 text-sm">
                <Link href="/privacy" className="block text-accent-blue transition-colors hover:text-accent-cyan">Privacy Policy →</Link>
                <Link href="/register" className="block text-text-secondary transition-colors hover:text-foreground">Create an account →</Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
