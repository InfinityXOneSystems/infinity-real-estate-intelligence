def score(signal):
    urgency = signal.get("urgency", 0)
    equity = signal.get("equity", 0)
    motivation = signal.get("motivation", 0)

    score = (urgency * 0.4) + (equity * 0.4) + (motivation * 0.2)
    return round(score, 4)
