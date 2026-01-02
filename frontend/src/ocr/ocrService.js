import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { analyzeImageForWeights, extractWeightFromAnalysis } from './clientOcrService';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

//  GEMINI OCR
async function recognizeWithGemini(base64Image) {
  if (!GEMINI_API_KEY) {
    throw new Error('[GEMINI ERROR] API key missing');
  }

  const payload = {
    contents: [{
      parts: [
        {
          text:
            "Read the digital weighing machine display and return ONLY the numeric weight in kg. No words."
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    }]
  };

  let response;
  let rawResponseText;

  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    console.error('[GEMINI ERROR] Network failure:', networkError);
    throw new Error('Gemini network failure');
  }

  if (!response.ok) {
    rawResponseText = await response.text();
    console.error('[GEMINI ERROR] HTTP failure', {
      status: response.status,
      statusText: response.statusText,
      body: rawResponseText,
    });
    throw new Error(`Gemini HTTP ${response.status}`);
  }

  let result;
  try {
    result = JSON.parse(await response.text());
  } catch (parseError) {
    console.error('[GEMINI ERROR] Invalid JSON response');
    throw new Error('Gemini invalid JSON');
  }

  console.log('[GEMINI DEBUG] Raw response:', JSON.stringify(result, null, 2));

  const text =
    result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    console.error('[GEMINI ERROR] Empty text output', result);
    throw new Error('Gemini returned empty text');
  }

  console.log('[GEMINI DEBUG] Extracted text:', text);

  const match = text.match(/\d+\.?\d*/);

  if (!match) {
    console.error('[GEMINI ERROR] No numeric value found in output:', text);
    throw new Error('Gemini returned non-numeric output');
  }

  return parseFloat(match[0]);
}

//  OCR.SPACE 
async function recognizeWithOCRSpace(base64Image) {
  const formData = new FormData();
  formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
  formData.append('language', 'eng');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: 'helloworld' },
    body: formData,
  });

  const result = await response.json();
  const text = result?.ParsedResults?.[0]?.ParsedText;

  if (!text) throw new Error("OCR.space failed");

  const match = text.match(/\d+\.?\d*/);
  if (!match) throw new Error("OCR.space no numeric result");

  return parseFloat(match[0]);
}

//  MAIN OCR PIPELINE 
export async function runOcrOnImage(uri) {
  console.log('-- OCR started for image:', uri);

  const manip = await manipulateAsync(
    uri,
    [{ resize: { width: 1000 } }],
    { compress: 0.8, format: SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(manip.uri, {
    encoding: 'base64'
  });

  // GEMINI
  try {
    const weight = await recognizeWithGemini(base64);
    console.log('-- Gemini success → weight:', weight);
    return weight;
  } catch (e) {
    console.warn('-- Gemini failed → falling back');
    console.warn(e.message);
  }

  // OCR.space
  try {
    const weight = await recognizeWithOCRSpace(base64);
    console.log('-- OCR.space success → weight:', weight);
    return weight;
  } catch (e) {
    console.warn('-- OCR.space failed → falling back');
    console.warn(e.message);
  }

  // Client fallback
  const analysis = await analyzeImageForWeights(uri);
  const weight = extractWeightFromAnalysis(analysis);
  if (weight) {
    console.log('-- Client-side fallback success → weight:', weight);
    return weight;
  }

  console.error('-- All OCR methods failed');
  throw new Error("Weight could not be detected");
}

export async function terminateOcrWorker() {}
