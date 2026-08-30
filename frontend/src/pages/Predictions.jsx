// import { useState } from "react";
// import { BrainCircuit, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
// import { predictPayment } from "../services/api";
// import { ActionBadge, RiskBadge } from "./Dashboard";

// const initialForm = {
//   payment_id: "",
//   amount: "",
//   payment_method: "UPI",
//   failure_reason: "bank_decline",
//   failed_attempts: 1,
//   previous_successful_payments: 0,
//   days_since_last_payment: 30,
//   checkout_abandoned: "no",
// };

// function Predictions() {
//   const [form, setForm] = useState(initialForm);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     setError("");
//     setResult(null);

//     try {
//       const payload = {
//         ...form,
//         amount: Number(form.amount),
//         failed_attempts: Number(form.failed_attempts),
//         previous_successful_payments: Number(form.previous_successful_payments),
//         days_since_last_payment: Number(form.days_since_last_payment),
//       };

//       const data = await predictPayment(payload);
//       setResult(data);
//     } catch (err) {
//       setError(err.message || "Prediction failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setForm(initialForm);
//     setResult(null);
//     setError("");
//   };

//   return (
//     <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[1.15fr_0.85fr]">
//       <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//         <div className="mb-7 flex items-start justify-between gap-4">
//           <div>
//             <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
//               <BrainCircuit size={22} />
//             </div>
//             <h2 className="text-xl font-bold text-slate-900">Predict Recovery</h2>
//             <p className="mt-1 text-sm text-slate-400">
//               Enter a failed payment and let the Random Forest model estimate recoverability.
//             </p>
//           </div>
//           <button
//             onClick={reset}
//             className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
//           >
//             <RotateCcw size={14} />
//             Reset
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
//           <Field label="Payment ID">
//             <input
//               required
//               value={form.payment_id}
//               onChange={(e) => update("payment_id", e.target.value)}
//               placeholder="e.g. P01002"
//               className="input"
//             />
//           </Field>

//           <Field label="Amount">
//             <input
//               required
//               min="0"
//               step="0.01"
//               type="number"
//               value={form.amount}
//               onChange={(e) => update("amount", e.target.value)}
//               placeholder="2500"
//               className="input"
//             />
//           </Field>

//           <Field label="Payment Method">
//             <select
//               value={form.payment_method}
//               onChange={(e) => update("payment_method", e.target.value)}
//               className="input"
//             >
//               <option>UPI</option>
//               <option>Card</option>
//               <option>Netbanking</option>
//               <option>Wallet</option>
//             </select>
//           </Field>

//           <Field label="Failure Reason">
//             <select
//               value={form.failure_reason}
//               onChange={(e) => update("failure_reason", e.target.value)}
//               className="input"
//             >
//               <option>bank_decline</option>
//               <option>insufficient_funds</option>
//               <option>network_error</option>
//               <option>technical_timeout</option>
//               <option>authentication_failed</option>
//             </select>
//           </Field>

//           <Field label="Failed Attempts">
//             <input
//               min="0"
//               type="number"
//               value={form.failed_attempts}
//               onChange={(e) => update("failed_attempts", e.target.value)}
//               className="input"
//             />
//           </Field>

//           <Field label="Previous Successful Payments">
//             <input
//               min="0"
//               type="number"
//               value={form.previous_successful_payments}
//               onChange={(e) => update("previous_successful_payments", e.target.value)}
//               className="input"
//             />
//           </Field>

//           <Field label="Days Since Last Payment">
//             <input
//               min="0"
//               type="number"
//               value={form.days_since_last_payment}
//               onChange={(e) => update("days_since_last_payment", e.target.value)}
//               className="input"
//             />
//           </Field>

//           <Field label="Checkout Abandoned">
//             <select
//               value={form.checkout_abandoned}
//               onChange={(e) => update("checkout_abandoned", e.target.value)}
//               className="input"
//             >
//               <option value="no">No</option>
//               <option value="yes">Yes</option>
//             </select>
//           </Field>

//           <div className="sm:col-span-2">
//             <button
//               disabled={loading}
//               className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               <Sparkles size={17} />
//               {loading ? "Running AI Prediction..." : "Predict Recovery"}
//             </button>
//           </div>
//         </form>

//         {error && (
//           <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//             {error}
//           </div>
//         )}
//       </section>

//       <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
//         <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
//           Model Output
//         </p>

//         {!result ? (
//           <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
//             <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
//               <BrainCircuit size={34} className="text-indigo-300" />
//             </div>
//             <h3 className="mt-6 text-xl font-semibold">Ready for prediction</h3>
//             <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
//               Submit a failed payment to see its recovery probability, risk level and recommended action.
//             </p>
//           </div>
//         ) : (
//           <div className="mt-10">
//             <div className="text-center">
//               <p className="text-sm text-slate-400">Recovery Probability</p>
//               <p className="mt-2 text-6xl font-black tracking-tight text-white">
//                 {(Number(result.recovery_probability) * 100).toFixed(1)}%
//               </p>
//             </div>

//             <div className="mt-10 grid gap-3 sm:grid-cols-2">
//               <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                 <p className="text-xs text-slate-400">Payment ID</p>
//                 <p className="mt-2 font-semibold">{result.payment_id}</p>
//               </div>

//               <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                 <p className="text-xs text-slate-400">Risk Level</p>
//                 <div className="mt-2">
//                   <RiskBadge risk={result.risk_level} />
//                 </div>
//               </div>

//               <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
//                 <p className="text-xs text-slate-400">Recommended Action</p>
//                 <div className="mt-2">
//                   <ActionBadge action={result.recommended_action} />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
//               <CheckCircle2 size={20} className="text-emerald-400" />
//               <p className="text-sm text-emerald-200">
//                 Prediction saved to the recovery results table.
//               </p>
//             </div>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <label className="block">
//       <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
//         {label}
//       </span>
//       {children}
//     </label>
//   );
// }

// export default Predictions;

import { useState } from "react";
import { BrainCircuit, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { predictPayment } from "../services/api";
import { ActionBadge, RiskBadge } from "./Dashboard";

const initialForm = {
  payment_id: "",
  amount: "",
  payment_method: "UPI",
  failure_reason: "bank_decline",
  failed_attempts: 1,
  previous_successful_payments: 0,
  days_since_last_payment: 30,
  checkout_abandoned: "no",
};

function Predictions() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        failed_attempts: Number(form.failed_attempts),
        previous_successful_payments: Number(form.previous_successful_payments),
        days_since_last_payment: Number(form.days_since_last_payment),
      };

      const data = await predictPayment(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BrainCircuit size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Predict Recovery</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter a failed payment and let the Random Forest model estimate recoverability.
            </p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <Field label="Payment ID">
            <input
              required
              value={form.payment_id}
              onChange={(e) => update("payment_id", e.target.value)}
              placeholder="e.g. P01002"
              className="input"
            />
          </Field>

          <Field label="Amount">
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="2500"
              className="input"
            />
          </Field>

          <Field label="Payment Method">
            <select
              value={form.payment_method}
              onChange={(e) => update("payment_method", e.target.value)}
              className="input"
            >
              <option>UPI</option>
              <option>Card</option>
              <option>Netbanking</option>
              <option>Wallet</option>
            </select>
          </Field>

          <Field label="Failure Reason">
            <select
              value={form.failure_reason}
              onChange={(e) => update("failure_reason", e.target.value)}
              className="input"
            >
              <option>bank_decline</option>
              <option>insufficient_funds</option>
              <option>network_error</option>
              <option>technical_timeout</option>
              <option>authentication_failed</option>
            </select>
          </Field>

          <Field label="Failed Attempts">
            <input
              min="0"
              type="number"
              value={form.failed_attempts}
              onChange={(e) => update("failed_attempts", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Previous Successful Payments">
            <input
              min="0"
              type="number"
              value={form.previous_successful_payments}
              onChange={(e) => update("previous_successful_payments", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Days Since Last Payment">
            <input
              min="0"
              type="number"
              value={form.days_since_last_payment}
              onChange={(e) => update("days_since_last_payment", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Checkout Abandoned">
            <select
              value={form.checkout_abandoned}
              onChange={(e) => update("checkout_abandoned", e.target.value)}
              className="input"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>

          <div className="sm:col-span-2">
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={17} />
              {loading ? "Running AI Prediction..." : "Predict Recovery"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
          Model Output
        </p>

        {!result ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
              <BrainCircuit size={34} className="text-indigo-300" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Ready for prediction</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Submit a failed payment to see its recovery probability, risk level and recommended action.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <div className="text-center">
              <p className="text-sm text-slate-400">Recovery Probability</p>
              <p className="mt-2 text-6xl font-black tracking-tight text-white">
                {(Number(result.recovery_probability) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-slate-400">Payment ID</p>
                <p className="mt-2 font-semibold">{result.payment_id}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-slate-400">Risk Level</p>
                <div className="mt-2">
                  <RiskBadge risk={result.risk_level} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
                <p className="text-xs text-slate-400">Recommended Action</p>
                <div className="mt-2">
                  <ActionBadge action={result.recommended_action} />
                </div>
              </div>

              {result.agent_reason && (
                <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-5 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                    🤖 AI Agent Explanation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    {result.agent_reason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <p className="text-sm text-emerald-200">
                Prediction saved to the recovery results table.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export default Predictions;