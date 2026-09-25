export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#04071a] text-[#94a3b8] p-8 pt-24">
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-[#64748b]">Version: 1.0.0 • Last updated: September 2026</p>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">1. Information collected</h2><p>FlowSync stores account identity information, workspace membership and workspace content required to provide the service. Contact submissions are stored in the administrative inbox.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">2. Authentication and credentials</h2><p>Access tokens are held in application memory. Refresh credentials are stored in an httpOnly cookie and represented server-side by a hashed refresh-session record. User-supplied AI provider credentials are encrypted before persistence.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">3. Realtime data</h2><p>Realtime workspace events are authorized against the authenticated account and workspace membership. Public review content is displayed only after moderation approval.</p></section>
        <section className="space-y-4"><h2 className="text-2xl font-semibold text-white">4. Contact and abuse controls</h2><p>Contact messages are validated and protected by server-side abuse controls. Untrusted contact content is escaped before inclusion in HTML email notifications.</p></section>
      </div>
    </div>
  );
}
