export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#04071a] text-[#94a3b8] p-8 pt-24">
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
        <p className="text-sm text-[#64748b]">Version: 1.0.0 • Last updated: September 2026</p>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">1. Acceptance</h2><p>By accessing FlowSync, you agree to these terms. If you do not agree, do not use the service.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">2. Accounts and access</h2><p>You are responsible for your credentials and for activity performed through your account. Workspace access is governed by the role assigned by the workspace owner.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">3. Workspace data</h2><p>Workspace members may access data according to their server-enforced role. Viewers are read-only; members and administrators receive the capabilities assigned by the workspace authorization policy.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">4. AI features</h2><p>AI-generated task suggestions are provided as planning assistance. You remain responsible for reviewing generated content before relying on it.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">5. Changes and termination</h2><p>Accounts and workspaces may be removed through the supported account and workspace controls, subject to the authorization rules and applicable data-retention requirements.</p></section>
      </div>
    </div>
  );
}
