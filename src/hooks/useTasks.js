// src/hooks/useTasks.js
import { useMsal } from '@azure/msal-react';
import { useEffect, useState } from 'react';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const useTasks = (listId, refreshKey = 0) => {
const { instance, accounts, inProgress } = useMsal();
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Nothing to do if no list is selected
if (!listId) {
setTasks([]);
setLoading(false);
return;
}

// Wait until MSAL is ready and an account is present
if (inProgress !== 'none' || accounts.length === 0) {
setLoading(true);
return;
}

let isMounted = true;
const abort = new AbortController();

const getToken = async (forceRefresh = false) => {
let account = instance.getActiveAccount() || accounts[0];
if (!account) return null;
if (!instance.getActiveAccount()) instance.setActiveAccount(account);

try {
return await instance.acquireTokenSilent({
scopes: ['Tasks.Read'],
account,
forceRefresh,
});
} catch (e) {
// Try once more with forceRefresh if not already
if (!forceRefresh) {
try {
return await instance.acquireTokenSilent({
scopes: ['Tasks.Read'],
account,
forceRefresh: true,
});
} catch (e2) {
console.error('acquireTokenSilent failed (forceRefresh):', e2);
return null;
}
}
console.error('acquireTokenSilent failed:', e);
return null;
}
};

const fetchTasksWithRetry = async () => {
setLoading(true);

let tokenResp = await getToken(false);
if (!tokenResp) {
if (isMounted) setLoading(false);
return;
}

const url = `https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`;
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
if (isMounted) setTasks(data?.value ?? []);
break;
}

// Handle retriable statuses
if (res.status === 401 || res.status === 403) {
// Try to refresh token once and retry
tokenResp = await getToken(true);
if (!tokenResp) throw new Error(`Auth failed (${res.status})`);
} else if (res.status === 429 || res.status >= 500) {
// Backoff: 300ms, 900ms
await sleep(300 * Math.pow(3, attempt));
} else {
// Non-retriable
const text = await res.text();
console.error('Graph /tasks error', res.status, text);
break;
}
} catch (err) {
if (err?.name === 'AbortError') break; // unmounted / re-run
// Backoff on generic network errors
await sleep(300 * Math.pow(3, attempt));
}
attempt += 1;
}

if (isMounted) setLoading(false);
};

fetchTasksWithRetry();

return () => {
isMounted = false;
abort.abort();
};
// Re-run when listId changes, a global refresh is requested,
// or when MSAL becomes ready.
}, [listId, refreshKey, accounts, inProgress, instance]);

return { tasks, loading };
};

export default useTasks;
