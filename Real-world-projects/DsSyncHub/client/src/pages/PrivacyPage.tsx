const PrivacyPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Information We Collect</h2>
        <p>We collect information you provide when creating an account, including your name, email address, and profile information. We also collect data about your usage of the service, such as tasks, notes, and workspace activity.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. How We Use Your Information</h2>
        <p>We use your information to provide, maintain, and improve the service. This includes authenticating your access, storing your workspace data, and sending service-related communications.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Data Storage</h2>
        <p>Your data is stored securely on MongoDB Atlas with encryption at rest. File uploads are stored on Cloudinary with CDN delivery. We implement industry-standard security measures to protect your data.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Third-Party Services</h2>
        <p>We integrate with third-party services for specific features: Google OAuth (authentication), Razorpay (payments), Groq (AI), Cloudinary (file storage), Sentry (error monitoring), and Jitsi Meet (video conferencing). Each service has its own privacy policy.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Data Export and Deletion</h2>
        <p>You can export your workspace data at any time from the workspace settings. You can request account deletion by contacting us. We will delete your data within 30 days of your request.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Cookies</h2>
        <p>We use httpOnly cookies for authentication. We do not use tracking cookies or third-party analytics cookies. You can control cookie settings through your browser.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. You may also export your data in a portable format. To exercise these rights, contact us at chauhandigvijay669@gmail.com.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>8. Changes to This Policy</h2>
        <p>We may update this privacy policy from time to time. We will notify users of material changes via email or through the service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>9. Contact</h2>
        <p>For questions about this privacy policy, contact us at chauhandigvijay669@gmail.com.</p>
      </section>
    </div>
  )
}

export default PrivacyPage
