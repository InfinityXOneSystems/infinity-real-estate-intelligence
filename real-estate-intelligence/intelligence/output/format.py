def format_for_crm(leads):
    """
    Normalize leads for CRM / Sheets / Email.
    """
    return [
        {
            "Name": l["name"],
            "Loan Type": l["loan_type"],
            "Estimated Amount": l["estimated_loan_need"],
            "Score": l["score"]
        }
        for l in leads
    ]
