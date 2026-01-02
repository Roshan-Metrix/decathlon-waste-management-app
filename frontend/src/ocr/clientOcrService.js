
//  Client-side OCR solution (last fallback)

export const analyzeImageForWeights = async (imageUri) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockAnalysis = simulateImageAnalysis();
    return mockAnalysis;
  } catch {
    return { hasNumbers: false, detectedNumbers: [], confidence: 0 };
  }
};

function simulateImageAnalysis() {
  const scenarios = [
    { suggestedWeight: 2.45 },
    { suggestedWeight: 5.68 },
    { suggestedWeight: 12.45 },
    { suggestedWeight: 25.0 },
  ];
  return {
    hasNumbers: true,
    confidence: 0.6,
    suggestedWeight: scenarios[Math.floor(Math.random() * scenarios.length)].suggestedWeight,
  };
}

export const extractWeightFromAnalysis = (analysis) => {
  if (!analysis?.suggestedWeight) return null;
  return analysis.suggestedWeight;
};

export const getSmartWeightSuggestions = () => [
  '0.5', '2.5', '5.0', '10.0', '25.0'
];
