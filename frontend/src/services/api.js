const API_BASE_URL = "http://127.0.0.1:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}

export const getDashboard = () => request("/dashboard");
export const getRecoveryResults = () => request("/recovery-results");
export const getFailureReasons = () => request("/failure-reasons");
export const getPaymentMethods = () => request("/payment-methods");

export const predictPayment = (payment) =>
  request("/predict", {
    method: "POST",
    body: JSON.stringify(payment),
  });