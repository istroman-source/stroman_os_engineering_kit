# AI Output Schemas

## Universal recommendation
```json
{
  "observations": [{"statement": "", "evidence": ""}],
  "inferences": [{"statement": "", "confidence": 0.0}],
  "unknowns": [""],
  "options": [
    {
      "name": "",
      "reasoning": "",
      "benefits": [""],
      "tradeoffs": [""],
      "risks": [""]
    }
  ],
  "recommendation": {
    "selectedOption": "",
    "reasoning": "",
    "nextActions": [""],
    "confidence": 0.0
  }
}
```

## Creative Council synthesis
```json
{
  "reviews": [
    {
      "role": "Director",
      "whatWorks": [""],
      "concerns": [""],
      "recommendedChanges": [""],
      "confidence": 0.0
    }
  ],
  "agreements": [""],
  "disagreements": [
    {
      "topic": "",
      "positions": [{"role": "", "position": ""}],
      "tradeoff": ""
    }
  ],
  "blindSpots": [""],
  "finalRecommendation": "",
  "priorityActions": [""],
  "confidence": 0.0
}
```

## Creative GPS response
```json
{
  "interpretedProblem": "",
  "likelyCauses": [{"cause": "", "confidence": 0.0}],
  "diagnosticQuestions": [""],
  "recommendedTreeSlug": "",
  "recommendedResources": [
    {"type": "TOOL", "slug": "", "reason": ""}
  ],
  "firstAction": ""
}
```
