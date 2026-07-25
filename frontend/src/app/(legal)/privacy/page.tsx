export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#04071a] text-[#94a3b8] p-8 pt-24">
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
        <p className="text-sm text-[#64748b]">Last updated: July 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
          <p>When you use FlowSync, we collect information you provide directly: your name, email address, and workspace data. We also collect usage data such as feature interactions and session duration to improve the platform experience.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>We use collected information to operate and maintain your account, provide real-time collaboration features, process AI-assisted task decomposition requests, and communicate important service updates.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Data Security</h2>
          <p>All sensitive credentials are encrypted using AES-256-GCM before storage. Authentication tokens are transmitted via httpOnly secure cookies. All data is transmitted over HTTPS with strict transport security headers enforced.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. BYOK (Bring Your Own Key)</h2>
          <p>If you provide your own API keys for AI features, those keys are encrypted at rest using AES-256-GCM and are never transmitted to any third party. Keys are decrypted only at the moment of use within our secure server environment.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Data Retention & Deletion</h2>
          <p>You may delete your account at any time. Upon deletion, all associated data including workspaces, tasks, and encrypted credentials are permanently removed from our systems within 30 days.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Third-Party Services</h2>
          <p>FlowSync integrates with Google Gemini AI for task decomposition features. Your task content is sent to the Gemini API only when you explicitly trigger AI features, using your own BYOK credentials.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">7. Contact</h2>
          <p>For privacy-related inquiries, please use the contact form on our portfolio site at <a href="https://devpulse-igt5.vercel.app" className="text-[#38bdf8] hover:underline">devpulse-igt5.vercel.app</a>.</p>
        </section>
      </div>
    </div>
  );
}
