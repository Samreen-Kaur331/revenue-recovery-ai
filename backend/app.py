
from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()  # reads variables from a local .env file (not committed to git)

from agent.reasoning_agent import generate_agent_reason

app = Flask(__name__)
CORS(app)

# MySQL connection - credentials come from environment variables (.env), never hardcoded

DB_CONFIG = dict(
    host=os.environ.get("DB_HOST", "localhost"),
    user=os.environ.get("DB_USER", "root"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_NAME", "revenue_recovery")
)

# Quick check at startup so we fail fast with a clear message if MySQL is down.
_startup_conn = mysql.connector.connect(**DB_CONFIG)
_startup_conn.close()
print("MySQL connected successfully!")


def get_db():
    """Open a brand-new MySQL connection.

    Opening fresh each time avoids 'MySQL server has gone away' /
    'Lost connection' errors that happen when a single long-lived
    connection is reused across requests and silently dropped by
    the server or an idle timeout. Caller is responsible for closing it.
    """
    return mysql.connector.connect(**DB_CONFIG)


# Saved ML model load karo
model_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "model",
    "recovery_model.pkl"
)

model = joblib.load(model_path)


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    payment_id = data["payment_id"]
    amount = data["amount"]
    payment_method = data["payment_method"]
    failure_reason = data["failure_reason"]
    failed_attempts = data["failed_attempts"]
    previous_successful_payments = data["previous_successful_payments"]
    days_since_last_payment = data["days_since_last_payment"]
    checkout_abandoned = data["checkout_abandoned"]

    # ML input banana
    input_data = [[
        amount,
        failed_attempts,
        previous_successful_payments,
        days_since_last_payment,
        payment_method == "Netbanking",
        payment_method == "UPI",
        payment_method == "Wallet",
        failure_reason == "bank_decline",
        failure_reason == "insufficient_funds",
        failure_reason == "network_error",
        failure_reason == "technical_timeout",
        checkout_abandoned == "yes"
    ]]

    # Recovery probability
    recovery_probability = model.predict_proba(input_data)[0][1]

    # Risk level
    if recovery_probability >= 0.70:
        risk_level = "high"
        action = "retry"
    elif recovery_probability >= 0.40:
        risk_level = "medium"
        action = "reminder"
    else:
        risk_level = "low"
        action = "stop"

    # Save prediction result in MySQL
    conn = get_db()
    cursor = conn.cursor()

    sql = """
    INSERT INTO recovery_results
    (payment_id, recovery_probability, risk_level, recommended_action,
     action_status, recovered, recovered_amount, failure_reason)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        payment_id,
        recovery_probability,
        risk_level,
        action,
        "pending",
        "no",
        0.00,
        failure_reason
    )

    cursor.execute(sql, values)
    conn.commit()
    cursor.close()
    conn.close()

    # AI Agent - turn the raw prediction into a human-readable explanation
    agent_reason = generate_agent_reason(
        payment_id=payment_id,
        amount=amount,
        payment_method=payment_method,
        failure_reason=failure_reason,
        failed_attempts=failed_attempts,
        previous_successful_payments=previous_successful_payments,
        days_since_last_payment=days_since_last_payment,
        checkout_abandoned=checkout_abandoned,
        recovery_probability=recovery_probability,
        risk_level=risk_level,
        action=action,
    )

    return jsonify({
        "payment_id": payment_id,
        "recovery_probability": round(float(recovery_probability), 3),
        "risk_level": risk_level,
        "recommended_action": action,
        "agent_reason": agent_reason
    })


@app.route("/predict-all", methods=["POST"])
def predict_all():

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            payment_id,
            amount,
            payment_method,
            failure_reason,
            failed_attempts,
            previous_successful_payments,
            days_since_last_payment,
            checkout_abandoned
        FROM payments
        WHERE failure_reason <> 'none'
    """)

    payments = cursor.fetchall()
    cursor.close()

    results = []

    for payment in payments:

        payment_id = payment["payment_id"]
        amount = payment["amount"]
        payment_method = payment["payment_method"]
        failure_reason = payment["failure_reason"]
        failed_attempts = payment["failed_attempts"]
        previous_successful_payments = payment["previous_successful_payments"]
        days_since_last_payment = payment["days_since_last_payment"]
        checkout_abandoned = payment["checkout_abandoned"]

        input_data = [[
            amount,
            failed_attempts,
            previous_successful_payments,
            days_since_last_payment,
            payment_method == "Netbanking",
            payment_method == "UPI",
            payment_method == "Wallet",
            failure_reason == "bank_decline",
            failure_reason == "insufficient_funds",
            failure_reason == "network_error",
            failure_reason == "technical_timeout",
            checkout_abandoned == "yes"
        ]]

        recovery_probability = model.predict_proba(input_data)[0][1]

        if recovery_probability >= 0.70:
            risk_level = "high"
            action = "retry"
        elif recovery_probability >= 0.40:
            risk_level = "medium"
            action = "reminder"
        else:
            risk_level = "low"
            action = "stop"

        insert_cursor = conn.cursor()

        sql = """
        INSERT INTO recovery_results
        (payment_id, recovery_probability, risk_level,
         recommended_action, action_status, recovered,
         recovered_amount, failure_reason)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            payment_id,
            recovery_probability,
            risk_level,
            action,
            "pending",
            "no",
            0.00,
            failure_reason
        )

        insert_cursor.execute(sql, values)
        insert_cursor.close()

        agent_reason = generate_agent_reason(
            payment_id=payment_id,
            amount=amount,
            payment_method=payment_method,
            failure_reason=failure_reason,
            failed_attempts=failed_attempts,
            previous_successful_payments=previous_successful_payments,
            days_since_last_payment=days_since_last_payment,
            checkout_abandoned=checkout_abandoned,
            recovery_probability=recovery_probability,
            risk_level=risk_level,
            action=action,
        )

        results.append({
            "payment_id": payment_id,
            "recovery_probability": round(float(recovery_probability), 3),
            "risk_level": risk_level,
            "recommended_action": action,
            "agent_reason": agent_reason
        })

    conn.commit()
    conn.close()

    return jsonify({
        "message": "All failed payments processed successfully",
        "total_payments": len(results),
        "results": results
    })


@app.route("/")
def home():
    return jsonify({
        "message": "Revenue Recovery API is running"
    })


@app.route("/model-status")
def model_status():
    return jsonify({
        "model_loaded": True,
        "model_type": type(model).__name__
    })


@app.route("/dashboard", methods=["GET"])
def dashboard():

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Total failed payments
    cursor.execute("""
        SELECT COUNT(*) AS total_failed_payments
        FROM recovery_results
    """)
    total_failed_payments = cursor.fetchone()["total_failed_payments"]

    # Risk distribution
    cursor.execute("""
        SELECT risk_level, COUNT(*) AS total
        FROM recovery_results
        GROUP BY risk_level
    """)
    risk_data = cursor.fetchall()

    # Revenue at risk
    cursor.execute("""
        SELECT COALESCE(SUM(p.amount), 0) AS revenue_at_risk
        FROM payments p
        INNER JOIN recovery_results r
        ON p.payment_id = r.payment_id
    """)
    revenue_at_risk = cursor.fetchone()["revenue_at_risk"]

    # Recovered revenue
    cursor.execute("""
        SELECT COALESCE(SUM(recovered_amount), 0) AS recovered_revenue
        FROM recovery_results
        WHERE recovered = 'yes'
    """)
    recovered_revenue = cursor.fetchone()["recovered_revenue"]

    # Recovery rate
    if revenue_at_risk > 0:
        recovery_rate = (recovered_revenue / revenue_at_risk) * 100
    else:
        recovery_rate = 0

    cursor.close()
    conn.close()

    return jsonify({
        "total_failed_payments": total_failed_payments,
        "revenue_at_risk": round(float(revenue_at_risk), 2),
        "recovered_revenue": round(float(recovered_revenue), 2),
        "recovery_rate": round(float(recovery_rate), 2),
        "risk_distribution": risk_data
    })


@app.route("/recovery-results", methods=["GET"])
def recovery_results():

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            r.result_id,
            r.payment_id,
            p.amount,
            r.recovery_probability,
            r.risk_level,
            r.recommended_action,
            r.action_status,
            r.failure_reason,
            r.created_at
        FROM recovery_results r
        INNER JOIN payments p
        ON r.payment_id = p.payment_id
        ORDER BY r.created_at DESC
    """)

    results = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "total_results": len(results),
        "results": results
    })


@app.route("/failure-reasons", methods=["GET"])
def failure_reasons():

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            failure_reason,
            COUNT(*) AS total_payments
        FROM recovery_results
        GROUP BY failure_reason
        ORDER BY total_payments DESC
    """)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "failure_reasons": data
    })


@app.route("/payment-methods", methods=["GET"])
def payment_methods():

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            p.payment_method,
            COUNT(*) AS total_payments,
            SUM(p.amount) AS total_amount
        FROM payments p
        INNER JOIN recovery_results r
        ON p.payment_id = r.payment_id
        GROUP BY p.payment_method
        ORDER BY total_amount DESC
    """)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "payment_methods": data
    })


if __name__ == "__main__":
    app.run(debug=True)
# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import joblib
# import os
# import mysql.connector
# from dotenv import load_dotenv    
# load_dotenv()

# app = Flask(__name__)
# CORS(app)

# # MySQL connection

# DB_CONFIG = dict(
#     host=os.environ.get("DB_HOST", "localhost"),
#     user=os.environ.get("DB_USER", "root"),
#     password=os.environ.get("DB_PASSWORD"),     
#     database=os.environ.get("DB_NAME", "revenue_recovery")
# )

# # Quick check at startup so we fail fast with a clear message if MySQL is down.
# _startup_conn = mysql.connector.connect(**DB_CONFIG)
# _startup_conn.close()
# print("MySQL connected successfully!")


# def get_db():
#     """Open a brand-new MySQL connection.

#     Opening fresh each time avoids 'MySQL server has gone away' /
#     'Lost connection' errors that happen when a single long-lived
#     connection is reused across requests and silently dropped by
#     the server or an idle timeout. Caller is responsible for closing it.
#     """
#     return mysql.connector.connect(**DB_CONFIG)


# # Saved ML model load karo
# model_path = os.path.join(
#     os.path.dirname(__file__),
#     "..",
#     "model",
#     "recovery_model.pkl"
# )

# model = joblib.load(model_path)


# @app.route("/predict", methods=["POST"])
# def predict():

#     data = request.get_json()

#     payment_id = data["payment_id"]
#     amount = data["amount"]
#     payment_method = data["payment_method"]
#     failure_reason = data["failure_reason"]
#     failed_attempts = data["failed_attempts"]
#     previous_successful_payments = data["previous_successful_payments"]
#     days_since_last_payment = data["days_since_last_payment"]
#     checkout_abandoned = data["checkout_abandoned"]

#     # ML input banana
#     input_data = [[
#         amount,
#         failed_attempts,
#         previous_successful_payments,
#         days_since_last_payment,
#         payment_method == "Netbanking",
#         payment_method == "UPI",
#         payment_method == "Wallet",
#         failure_reason == "bank_decline",
#         failure_reason == "insufficient_funds",
#         failure_reason == "network_error",
#         failure_reason == "technical_timeout",
#         checkout_abandoned == "yes"
#     ]]

#     # Recovery probability
#     recovery_probability = model.predict_proba(input_data)[0][1]

#     # Risk level
#     if recovery_probability >= 0.70:
#         risk_level = "high"
#         action = "retry"
#     elif recovery_probability >= 0.40:
#         risk_level = "medium"
#         action = "reminder"
#     else:
#         risk_level = "low"
#         action = "stop"

#     # Save prediction result in MySQL
#     conn = get_db()
#     cursor = conn.cursor()

#     sql = """
#     INSERT INTO recovery_results
#     (payment_id, recovery_probability, risk_level, recommended_action,
#      action_status, recovered, recovered_amount, failure_reason)
#     VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#     """

#     values = (
#         payment_id,
#         recovery_probability,
#         risk_level,
#         action,
#         "pending",
#         "no",
#         0.00,
#         failure_reason
#     )

#     cursor.execute(sql, values)
#     conn.commit()
#     cursor.close()
#     conn.close()

#     return jsonify({
#         "payment_id": payment_id,
#         "recovery_probability": round(float(recovery_probability), 3),
#         "risk_level": risk_level,
#         "recommended_action": action
#     })


# @app.route("/predict-all", methods=["POST"])
# def predict_all():

#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("""
#         SELECT
#             payment_id,
#             amount,
#             payment_method,
#             failure_reason,
#             failed_attempts,
#             previous_successful_payments,
#             days_since_last_payment,
#             checkout_abandoned
#         FROM payments
#         WHERE failure_reason <> 'none'
#     """)

#     payments = cursor.fetchall()
#     cursor.close()

#     results = []

#     for payment in payments:

#         payment_id = payment["payment_id"]
#         amount = payment["amount"]
#         payment_method = payment["payment_method"]
#         failure_reason = payment["failure_reason"]
#         failed_attempts = payment["failed_attempts"]
#         previous_successful_payments = payment["previous_successful_payments"]
#         days_since_last_payment = payment["days_since_last_payment"]
#         checkout_abandoned = payment["checkout_abandoned"]

#         input_data = [[
#             amount,
#             failed_attempts,
#             previous_successful_payments,
#             days_since_last_payment,
#             payment_method == "Netbanking",
#             payment_method == "UPI",
#             payment_method == "Wallet",
#             failure_reason == "bank_decline",
#             failure_reason == "insufficient_funds",
#             failure_reason == "network_error",
#             failure_reason == "technical_timeout",
#             checkout_abandoned == "yes"
#         ]]

#         recovery_probability = model.predict_proba(input_data)[0][1]

#         if recovery_probability >= 0.70:
#             risk_level = "high"
#             action = "retry"
#         elif recovery_probability >= 0.40:
#             risk_level = "medium"
#             action = "reminder"
#         else:
#             risk_level = "low"
#             action = "stop"

#         insert_cursor = conn.cursor()

#         sql = """
#         INSERT INTO recovery_results
#         (payment_id, recovery_probability, risk_level,
#          recommended_action, action_status, recovered,
#          recovered_amount, failure_reason)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#         """

#         values = (
#             payment_id,
#             recovery_probability,
#             risk_level,
#             action,
#             "pending",
#             "no",
#             0.00,
#             failure_reason
#         )

#         insert_cursor.execute(sql, values)
#         insert_cursor.close()

#         results.append({
#             "payment_id": payment_id,
#             "recovery_probability": round(float(recovery_probability), 3),
#             "risk_level": risk_level,
#             "recommended_action": action
#         })

#     conn.commit()
#     conn.close()

#     return jsonify({
#         "message": "All failed payments processed successfully",
#         "total_payments": len(results),
#         "results": results
#     })


# @app.route("/")
# def home():
#     return jsonify({
#         "message": "Revenue Recovery API is running"
#     })


# @app.route("/model-status")
# def model_status():
#     return jsonify({
#         "model_loaded": True,
#         "model_type": type(model).__name__
#     })


# @app.route("/dashboard", methods=["GET"])
# def dashboard():

#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)

#     # Total failed payments
#     cursor.execute("""
#         SELECT COUNT(*) AS total_failed_payments
#         FROM recovery_results
#     """)
#     total_failed_payments = cursor.fetchone()["total_failed_payments"]

#     # Risk distribution
#     cursor.execute("""
#         SELECT risk_level, COUNT(*) AS total
#         FROM recovery_results
#         GROUP BY risk_level
#     """)
#     risk_data = cursor.fetchall()

#     # Revenue at risk
#     cursor.execute("""
#         SELECT COALESCE(SUM(p.amount), 0) AS revenue_at_risk
#         FROM payments p
#         INNER JOIN recovery_results r
#         ON p.payment_id = r.payment_id
#     """)
#     revenue_at_risk = cursor.fetchone()["revenue_at_risk"]

#     # Recovered revenue
#     cursor.execute("""
#         SELECT COALESCE(SUM(recovered_amount), 0) AS recovered_revenue
#         FROM recovery_results
#         WHERE recovered = 'yes'
#     """)
#     recovered_revenue = cursor.fetchone()["recovered_revenue"]

#     # Recovery rate
#     if revenue_at_risk > 0:
#         recovery_rate = (recovered_revenue / revenue_at_risk) * 100
#     else:
#         recovery_rate = 0

#     cursor.close()
#     conn.close()

#     return jsonify({
#         "total_failed_payments": total_failed_payments,
#         "revenue_at_risk": round(float(revenue_at_risk), 2),
#         "recovered_revenue": round(float(recovered_revenue), 2),
#         "recovery_rate": round(float(recovery_rate), 2),
#         "risk_distribution": risk_data
#     })


# @app.route("/recovery-results", methods=["GET"])
# def recovery_results():

#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("""
#         SELECT
#             r.result_id,
#             r.payment_id,
#             p.amount,
#             r.recovery_probability,
#             r.risk_level,
#             r.recommended_action,
#             r.action_status,
#             r.failure_reason,
#             r.created_at
#         FROM recovery_results r
#         INNER JOIN payments p
#         ON r.payment_id = p.payment_id
#         ORDER BY r.created_at DESC
#     """)

#     results = cursor.fetchall()

#     cursor.close()
#     conn.close()

#     return jsonify({
#         "total_results": len(results),
#         "results": results
#     })


# @app.route("/failure-reasons", methods=["GET"])
# def failure_reasons():

#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("""
#         SELECT
#             failure_reason,
#             COUNT(*) AS total_payments
#         FROM recovery_results
#         GROUP BY failure_reason
#         ORDER BY total_payments DESC
#     """)

#     data = cursor.fetchall()

#     cursor.close()
#     conn.close()

#     return jsonify({
#         "failure_reasons": data
#     })


# @app.route("/payment-methods", methods=["GET"])
# def payment_methods():

#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)

#     cursor.execute("""
#         SELECT
#             p.payment_method,
#             COUNT(*) AS total_payments,
#             SUM(p.amount) AS total_amount
#         FROM payments p
#         INNER JOIN recovery_results r
#         ON p.payment_id = r.payment_id
#         GROUP BY p.payment_method
#         ORDER BY total_amount DESC
#     """)

#     data = cursor.fetchall()

#     cursor.close()
#     conn.close()

#     return jsonify({
#         "payment_methods": data
#     })


# if __name__ == "__main__":
#     app.run(debug=True)