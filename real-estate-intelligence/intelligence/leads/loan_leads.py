"""
Loan Lead Intelligence Pipeline

Goal:
Identify high-intent loan prospects using public signals.
"""

def generate_leads(payload):
    """
    Expected payload:
    {
      "action": "loan_leads",
      "region": "FL",
      "loan_type": "DSCR|HardMoney|Refi",
      "min_score": 0.7
    }
    """

    region = payload.get("region")
    loan_type = payload.get("loan_type")

    # Placeholder signals (to be wired)
    leads = [
        {
            "name": "John Doe",
            "signal": "recent_property_purchase",
            "estimated_loan_need": 450000,
            "score": 0.82,
            "region": region,
            "loan_type": loan_type
        }
    ]

    return {
        "vertical": "loan_company",
        "count": len(leads),
        "leads": leads
    }
