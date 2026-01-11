def score_lead(lead):
    """
    Simple MVP scoring model.
    Extend later with ML / heuristics.
    """
    score = 0.0

    if lead.get("estimated_loan_need", 0) > 300000:
        score += 0.4

    if lead.get("signal") in ["distress", "purchase", "refi_window"]:
        score += 0.4

    return min(score, 1.0)
