#!/usr/bin/env node
/**
 * Minimal OBS companion — login, pick first stream, print OBS settings.
 * Extend with obs-websocket-js for full Go Live automation.
 */
const API = process.env.API_URL || 'http://127.0.0.1:5001/api';

async function main() {
  const email = process.argv.includes('--email')
    ? process.argv[process.argv.indexOf('--email') + 1]
    : 'admin@svliveevents.com';
  const password = process.argv.includes('--password')
    ? process.argv[process.argv.indexOf('--password') + 1]
    : 'Admin@123';

  const login = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

  const token = login?.data?.accessToken;
  if (!token) {
    console.error('Login failed', login);
    process.exit(1);
  }

  const events = await fetch(`${API}/stream/events`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

  const stream = events?.data?.[0];
  if (!stream) {
    console.error('No streams');
    process.exit(1);
  }

  await fetch(`${API}/cluster/assign-origin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ streamId: stream.id }),
  });

  console.log(JSON.stringify({
    server: stream.rtmpUrl,
    streamKey: stream.streamKey,
    title: stream.title,
    goLive: `POST ${API}/stream/events/${stream.id}/start`,
    stop: `POST ${API}/stream/events/${stream.id}/stop`,
  }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
