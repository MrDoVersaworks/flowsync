import Link from 'next/link';

const sections = [
  ['1. Information we collect', 'FlowSync collects the information needed to provide the service, such as your name, email address, account credentials, workspace membership, workspace content, and relevant account or security events. Messages submitted through the contact feature may be stored so they can be reviewed and answered.'],
  ['2. Authentication and credentials', 'Your password is used to authenticate your account and is not stored as plain text. Short-lived access credentials are kept in application memory on the client, while refresh credentials are delivered through an httpOnly cookie and represented server-side by a hashed refresh-session record. Credentials supplied for supported AI providers are encrypted before persistence.'],
  ['3. Workspace and realtime data', 'Workspace information and events are processed to provide collaboration features. Realtime access is authorized using the authenticated account and current workspace membership. Public platform reviews are shown only after the moderation process approves them.'],
  ['4. Service providers and infrastructure', 'FlowSync relies on infrastructure and service providers needed to operate the application, including hosting, database, realtime messaging, analytics or consent tooling when configured, and AI providers when you choose to use AI features. Information sent to an external provider is limited to what is needed for the requested feature and the provider’s applicable terms and policies.'],
  ['5. Security and abuse prevention', 'We use measures such as authenticated access, server-side authorization, encrypted sensitive credentials, rate limiting, validation, and security logging to protect the service. No online service can guarantee absolute security, so you should protect your account credentials and report suspected unauthorized access.'],
  ['6. Retention and deletion', 'Information is retained for as long as reasonably necessary to provide the service, maintain security and integrity, meet operational needs, or satisfy applicable legal requirements. Retention can vary by the type of information and the action requested.'],
  ['7. Your choices', 'You can review and update supported account information through the application. You can also stop using the service and contact FlowSync about privacy questions or requests relating to your information.'],
  ['8. Policy changes and contact', 'This policy may be updated as FlowSync changes or as legal requirements evolve. The version and update date shown above identify the current policy. For privacy questions, use the supported contact channel provided by FlowSync.'],
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="glass-card overflow-hidden">
          <header className="border-b border-white/10 bg-white/[0.03] px-6 py-8 sm:px-10">
            <div className="mb-4 inline-flex items-center rounded-full border border-accent-purple/20 bg-accent-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-purple">FlowSync legal</div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">This policy explains what information FlowSync uses, why it is needed, and the controls and safeguards applied to it.</p>
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
                <Link href="/terms" className="block text-accent-blue transition-colors hover:text-accent-cyan">Terms of Service →</Link>
                <Link href="/register" className="block text-text-secondary transition-colors hover:text-foreground">Create an account →</Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
