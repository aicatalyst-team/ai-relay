// ============================================================
// AI Relay Admin — Local Relay Management Page
// ============================================================

export default function LocalRelayPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Local Relay</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
        <div className="bg-gray-100 p-4 rounded">
          <ol className="list-decimal list-inside space-y-2">
            <li>Install CLI: <code className="bg-gray-200 px-2 py-1 rounded">npm install -g ai-relay</code></li>
            <li>Login: <code className="bg-gray-200 px-2 py-1 rounded">ai-relay login https://your-relay.vercel.app</code></li>
            <li>Start: <code className="bg-gray-200 px-2 py-1 rounded">ai-relay local start</code></li>
            <li>Configure Agent: <code className="bg-gray-200 px-2 py-1 rounded">ai-relay agent install codex</code></li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Devices</h2>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-600">No devices connected yet.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
        <p className="text-gray-700">
          Local Relay runs on your machine (127.0.0.1:3147) and syncs configuration from this cloud admin.
          Your API keys never leave your local machine.
        </p>
      </section>
    </div>
  );
}
