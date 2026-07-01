const TermsPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Acceptance of Terms</h2>
        <p>By accessing or using DsSync Hub, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Description of Service</h2>
        <p>DsSync Hub provides a team collaboration platform including task management, notes, chat, calendar, video meetings, and AI-powered features.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Acceptable Use</h2>
        <p>You agree not to use DsSync Hub for any unlawful purpose or in violation of any applicable laws. You may not attempt to disrupt, damage, or gain unauthorized access to the service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Intellectual Property</h2>
        <p>The service and its original content, features, and functionality are owned by DsSync Hub and are protected by international copyright laws.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Limitation of Liability</h2>
        <p>DsSync Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Contact</h2>
        <p>For questions about these terms, contact us at chauhandigvijay669@gmail.com.</p>
      </section>
    </div>
  )
}

export default TermsPage
