// src/hooks/useTaskLists.js
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const useTaskLists = () => {
const { instance, accounts, inProgress } = useMsal();
const [taskLists, setTaskLists] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Wait for MSAL readiness
if (inProgress !== 'none' || accounts.length === 0) {
setLoading(true);
return;
}

let isMounted = true;
const abort = new AbortController();

const getToken = async () => {
let account = instance.getActiveAccount() || accounts[0];
if (!account) return null;
if (!instance.getActiveAccount()) instance.setActiveAccount(account);

try {
return await instance.acquireTokenSilent({
scopes: ['Tasks.Read'],
account,
});
} catch (e) {
if (e instanceof InteractionRequiredAuthError) {
try {
const loginResp = await instance.loginPopup({ scopes: ['Tasks.Read'] });
instance.setActiveAccount(loginResp.account);
return loginResp;
} catch (e2) {
console.error('loginPopup failed:', e2);
return null;
}
}
// Retry once with forceRefresh
try {
return await instance.acquireTokenSilent({
scopes: ['Tasks.Read'],
account,
forceRefresh: true,
});
} catch (e3) {
console.error('acquireTokenSilent failed (forceRefresh):', e3);
return null;
}
}
};

const fetchListsWithRetry = async () => {
setLoading(true);

let tokenResp = await getToken();
if (!tokenResp) {
if (isMounted) setLoading(false);
return;
}

const url = 'https://graph.microsoft.com/v1.0/me/todo/lists';
let attempt = 0;

while (attempt < 3 && isMounted) {
try {
const res = await fetch(url, {
method: 'GET',
headers: {
Authorization: `Bearer ${tokenResp.accessToken}`,
'Cache-Control': 'no-cache',
Pragma: 'no-cache',
},
signal: abort.signal,
});

if (res.ok) {
const data = await res.json();
if (isMounted) setTaskLists(data?.value ?? []);
break;
}

if (res.status === 401 || res.status === 403) {
tokenResp = await getToken(); // refresh token/login if needed
if (!tokenResp) throw new Error(`Auth failed (${res.status})`);
} else if (res.status === 429 || res.status >= 500) {
await sleep(300 * Math.pow(3, attempt));
} else {
const text = await res.text();
console.error('Graph /lists error', res.status, text);
break;
}
} catch (err) {
if (err?.name === 'AbortError') break;
await sleep(300 * Math.pow(3, attempt));
}
attempt += 1;
}

if (isMounted) setLoading(false);
};

fetchListsWithRetry();

return () => {
isMounted = false;
abort.abort();
};
}, [accounts, inProgress, instance]);

return { taskLists, loading };
};

export default useTaskLists;
