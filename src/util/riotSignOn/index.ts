const RIOT_CLIENT_ID = "riot-client"; // Official client ID games use; for production apps register your own
const REDIRECT_URI = "http://localhost/redirect";
const scope =  "openid account"

export const getAuth = () => {
  const nonce = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  const params = new URLSearchParams({
    client_id: RIOT_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope,
    nonce,
  });
  return {url:`https://auth.riotgames.com/authorize?${params.toString()}`, nonce}
}

export const getToken = async (code: string) => {
  const res = await fetch("https://auth.riotgames.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: RIOT_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json() as Promise<{ access_token: string; id_token: string }>;
}

export const getUsername = async (accessToken: string) => {
  const res = await fetch("https://americas.api.riotgames.com/riot/account/v1/accounts/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Account lookup failed: ${res.status}`);
  const data = await res.json() as { gameName: string; tagLine: string };
  return `${data.gameName}#${data.tagLine}`;
}

const decodeIdToken = (idToken: string): { nonce: string; sub: string; [key: string]: unknown } => {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Incorrect payload")
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json);
}

export const verifyNonce = (idToken: string, expectedNonce: string) => {
  const claims = decodeIdToken(idToken);
  if (claims.nonce !== expectedNonce) {
    throw new Error("Nonce mismatch — possible replay attack.");
  }
}