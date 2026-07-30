export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Manage this website&apos;s Khaiwal chart.</p>
        {params.error && <p className="admin-alert error">Invalid username or password.</p>}
        <form action="/api/admin/login" method="post" className="admin-form">
          <label>Username<input name="username" required autoComplete="username" /></label>
          <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
          <button>Log in</button>
        </form>
      </section>
    </main>
  );
}
