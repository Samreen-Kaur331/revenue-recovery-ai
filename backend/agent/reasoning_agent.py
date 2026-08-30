"""
AI Agent - Reasoning Layer

The Random Forest model only outputs a recovery_probability (a number).
This module is the "agent" that sits on top of that prediction and turns
it into a human-readable explanation + recommendation, the same way a
human analyst would explain a decision to their manager.

ML Model  -> WHAT will happen   (a probability)
AI Agent  -> WHY it will happen and WHAT to do about it (reasoning)

This is intentionally rule-based (no external API key needed) so it is
free, fast, fully explainable, and works offline. Each rule mirrors how
a human collections analyst would reason about a failed payment.
"""

FAILURE_REASON_NOTES = {
    "insufficient_funds": (
        "the failure was due to insufficient funds, so retrying a few days "
        "later (e.g. after a likely salary credit) tends to work better than "
        "an immediate retry"
    ),
    "bank_decline": (
        "the bank declined the transaction, which can be resolved by a retry "
        "or by prompting the customer to try an alternate payment method"
    ),
    "network_error": (
        "the failure was a network/technical issue rather than a customer "
        "problem, so an immediate automatic retry is usually effective"
    ),
    "technical_timeout": (
        "the failure was a technical timeout, so a quick retry is likely "
        "to succeed without involving the customer"
    ),
    "authentication_failed": (
        "authentication failed, so the customer likely needs to re-verify "
        "their payment method (e.g. re-enter OTP or card details)"
    ),
}

ACTION_LINES = {
    "retry": "the recommended action is to automatically retry the payment.",
    "reminder": "the recommended action is to send the customer a reminder to complete the payment.",
    "stop": "the recommended action is to stop further recovery attempts, since success is unlikely.",
}


def generate_agent_reason(
    payment_id,
    amount,
    payment_method,
    failure_reason,
    failed_attempts,
    previous_successful_payments,
    days_since_last_payment,
    checkout_abandoned,
    recovery_probability,
    risk_level,
    action,
):
    """Build a short, human-readable explanation for a recovery prediction.

    Returns a single natural-language string combining:
      1. The headline probability/risk statement
      2. The strongest supporting/contradicting signal from customer history
      3. Context about *why* the payment failed
      4. The recommended action
    """

    pct = round(float(recovery_probability) * 100, 1)
    parts = []

    # 1. Headline
    if risk_level == "high":
        parts.append(
            f"This payment has a strong {pct}% chance of recovery."
        )
    elif risk_level == "medium":
        parts.append(
            f"This payment has a moderate {pct}% chance of recovery."
        )
    else:
        parts.append(
            f"This payment has a low {pct}% chance of recovery."
        )

    # 2. Customer history signal (pick the most informative one)
    if previous_successful_payments >= 3 and failed_attempts <= 1:
        parts.append(
            f"the customer has {previous_successful_payments} prior successful "
            "payments and this looks like an isolated failure, which supports recovery"
        )
    elif previous_successful_payments == 0:
        parts.append(
            "the customer has no prior successful payment history, which adds uncertainty"
        )
    elif failed_attempts >= 3:
        parts.append(
            f"there have already been {failed_attempts} failed attempts, "
            "suggesting a persistent rather than one-off issue"
        )

    # 3. Recency / abandonment signal
    if checkout_abandoned == "yes":
        parts.append(
            "the checkout was abandoned, which often signals hesitation rather "
            "than a pure payment failure"
        )
    elif days_since_last_payment is not None and days_since_last_payment >= 60:
        parts.append(
            f"it has been {days_since_last_payment} days since the last successful "
            "payment, which may indicate reduced engagement"
        )
    elif days_since_last_payment is not None and days_since_last_payment <= 7:
        parts.append(
            "the customer paid very recently, so they are likely still actively engaged"
        )

    # 4. Failure-reason specific note
    note = FAILURE_REASON_NOTES.get(failure_reason)
    if note:
        parts.append(note)

    # Join the reasoning parts into one flowing sentence, then add the action line
    reasoning_sentence = "; ".join(parts[1:])
    headline = parts[0]
    action_line = ACTION_LINES.get(action, "")

    if reasoning_sentence:
        return f"{headline} This is because {reasoning_sentence}. Based on this, {action_line}"
    return f"{headline} Based on this, {action_line}"