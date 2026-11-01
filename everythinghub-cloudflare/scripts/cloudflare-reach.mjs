#!/usr/bin/env node
/**
 * Cloudflare Reach — minimal, read-only Cloudflare Pages connection tool.
 *
 * Required environment:
 *   CLOUDFLARE_API_TOKEN  API token with Account > Cloudflare Pages > Read
 *   CLOUDFLARE_ACCOUNT_ID Cloudflare account ID
 *
 * Commands:
 *   node scripts/cloudflare-reach.mjs whoami
 *   node scripts/cloudflare-reach.mjs projects
 *   node scripts/cloudflare-reach.mjs deployments <project-name>
 *
 * The token is read only from the process environment; it is never printed,
 * persisted, sent to the browser, or included in error output.
 */
const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiBase = "https://api.cloudflare.com/client/v4";

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!token || !accountId) {
  fail("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID. Set both as environment variables; do not paste the token into source code.");
}

async function api(path) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  let body;
  try { body = await response.json(); } catch { fail(`Cloudflare returned HTTP ${response.status} with an unreadable response.`); }
  if (!response.ok || body.success !== true) {
    const details = (body.errors || []).map((e) => e.message).filter(Boolean).join("; ");
    fail(`Cloudflare API request failed (HTTP ${response.status})${details ? `: ${details}` : ""}. Check token permissions and account ID.`);
  }
  return body.result;
}

const [command, projectName] = process.argv.slice(2);

try {
  if (command === "whoami") {
    const result = await api("/user/tokens/verify");
    console.log(JSON.stringify({ status: result.status, message: "Cloudflare API token verified." }, null, 2));
  } else if (command === "projects") {
    const projects = await api(`/accounts/${encodeURIComponent(accountId)}/pages/projects`);
    console.log(JSON.stringify(projects.map((p) => ({
      name: p.name,
      subdomain: p.subdomain,
      production_branch: p.production_branch,
      latest_deployment: p.latest_deployment ? {
        id: p.latest_deployment.id,
        url: p.latest_deployment.url,
        environment: p.latest_deployment.environment,
        created_on: p.latest_deployment.created_on,
      } : null,
    })), null, 2));
  } else if (command === "deployments") {
    if (!projectName) fail("Usage: node scripts/cloudflare-reach.mjs deployments <project-name>");
    const deployments = await api(`/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}/deployments?per_page=10`);
    console.log(JSON.stringify(deployments.map((d) => ({
      id: d.id,
      url: d.url,
      environment: d.environment,
      stage: d.latest_stage ? { name: d.latest_stage.name, status: d.latest_stage.status } : null,
      created_on: d.created_on,
    })), null, 2));
  } else {
    fail("Choose a command: whoami, projects, or deployments <project-name>.");
  }
} catch (error) {
  if (error?.name === "TypeError") fail("Could not reach Cloudflare. Check network access and try again.");
  fail("Cloudflare Reach stopped unexpectedly. No credentials were displayed.");
}
