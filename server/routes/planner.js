const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Place = require('../models/Place');

const router = express.Router();

/**
 * POST /api/planner/generate
 * Generate an AI-powered day-wise itinerary using Google Gemini
 * Body: { startCity, days, budgetLevel, travelStyles }
 * This route does NOT require authentication
 */
router.post('/generate', async (req, res) => {
  try {
    const { startCity, days, budgetLevel, travelStyles } = req.body;

    // Validate required fields
    if (!startCity || !days) {
      return res.status(400).json({
        message: 'startCity and days are required.',
      });
    }

    if (days < 1 || days > 30) {
      return res.status(400).json({
        message: 'days must be between 1 and 30.',
      });
    }

    // Determine current month for seasonal matching
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Query MongoDB for places matching budget and current season
    const filter = {};
    if (budgetLevel) filter.budgetLevel = budgetLevel;

    const allPlaces = await Place.find(filter);

    // Prefer places that are good for the current month
    const seasonalPlaces = allPlaces.filter((p) => p.bestMonths.includes(currentMonth));

    // Use seasonal places if enough, otherwise supplement with all places
    const placesToUse = seasonalPlaces.length >= 5 ? seasonalPlaces : allPlaces;

    // Build place summaries for the prompt
    const placeSummaries = placesToUse
      .map(
        (p) =>
          `- ${p.name} (${p.state}, ${p.category}): ${p.description} ` +
          `| Budget: ₹${p.estimatedCostPerDay?.budget || 'N/A'}/day | ` +
          `Highlights: ${p.highlights?.join(', ') || 'N/A'} | ` +
          `How to reach: ${p.howToReach?.road || 'N/A'}`
      )
      .join('\n');

    // Build the prompt for Gemini
    const travelStyleText = travelStyles?.length
      ? `Travel styles preferred: ${travelStyles.join(', ')}.`
      : '';

    const prompt = `You are an expert Indian travel planner specializing in hidden gem destinations.

Create a detailed ${days}-day travel itinerary starting from ${startCity}, India.
Budget level: ${budgetLevel || 'mid'}
${travelStyleText}
Current month: ${currentMonth}

Available hidden gem destinations from our database:
${placeSummaries}

Generate a structured JSON itinerary with this exact format:
{
  "title": "A catchy title for this trip",
  "summary": "A 2-3 sentence overview of the trip",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "destination": "Place name",
      "dayTheme": "Arrival & Settle In",
      "state": "State name",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "activity": "Description of activity",
          "tip": "A helpful local tip"
        }
      ],
      "meals": {
        "breakfast": "Suggestion with estimated cost",
        "lunch": "Suggestion with estimated cost",
        "dinner": "Suggestion with estimated cost"
      },
      "accommodation": "Accommodation suggestion with estimated cost",
      "transportFromPrevious": "How to get here from the previous day's location",
      "estimatedDayCost": {
        "min": 1500,
        "max": 3000
      }
    }
  ],
  "totalEstimatedCost": {
    "min": 10000,
    "max": 20000
  },
  "costBreakdown": {
    "accommodation": {"min": 2000, "max": 3000},
    "food": {"min": 800, "max": 1200},
    "transport": {"min": 1500, "max": 2000},
    "activities": {"min": 300, "max": 600}
  },
  "packingTips": ["tip1", "tip2"],
  "bestTimeToVisit": "Recommendation based on the destinations",
  "importantNotes": ["note1", "note2"]
}

IMPORTANT:
- Each day object must include a "dayTheme" field: a 2 to 4 word phrase describing what makes that specific day unique. Examples: "Arrival & Settle In", "Forest Trek Day", "River & Waterfalls", "Village Walk & Rest", "Departure Morning". This must be different for every day even when the location is the same across multiple days.
- Include AT LEAST 2 different destinations across the itinerary. Do not place the traveller in the same location for all days unless the trip is only 1 or 2 days long.
- Use primarily the destinations from the provided database above.
- Include realistic travel times between destinations.
- All costs should be in INR (₹).
- Include local food recommendations.
- Add practical tips for each destination.
- IMPORTANT: costBreakdown values MUST be objects with 'min' and 'max' number fields, not single numbers or strings.
- Return ONLY valid JSON, no markdown formatting or code blocks.`;

    console.log(`🤖 Generating ${days}-day itinerary from ${startCity} (budget: ${budgetLevel || 'mid'})`);

    // Call Google Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    let attempts = 0;
    let result;
    while (attempts < 2) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        if (err.message?.includes('503') && attempts === 0) {
          console.warn('⚠️ Gemini API 503 error, retrying in 3 seconds...');
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          throw err;
        }
      }
    }
    const response = result.response;
    const text = response.text();

    // Parse the JSON response — strip markdown code fences if present
    let generatedPlan;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedPlan = JSON.parse(cleanedText);
      console.log('costBreakdown:', JSON.stringify(generatedPlan.costBreakdown, null, 2));
    } catch (parseError) {
      console.error('⚠️ Failed to parse Gemini response as JSON:', parseError.message);
      console.error('Raw response:', text.substring(0, 500));
      return res.status(502).json({
        message: 'AI generated an invalid response. Please try again.',
        raw: text,
      });
    }

    // Extract place IDs used in the itinerary
    const placeNames = generatedPlan.days?.map((d) => d.destination) || [];
    const matchedPlaces = await Place.find({
      name: { $in: placeNames },
    }).select('_id name');

    const placesUsed = matchedPlaces.map((p) => p._id);

    // Calculate total cost estimate
    const totalCostEstimate = generatedPlan.totalEstimatedCost || {
      min: days * 1500,
      max: days * 5000,
    };

    console.log(`✅ Itinerary generated: "${generatedPlan.title}" — ${placeNames.length} destinations`);

    res.json({
      title: generatedPlan.title || `${days}-Day Trip from ${startCity}`,
      startCity,
      days: parseInt(days),
      budgetLevel: req.body.budgetLevel,
      travelStyles: travelStyles || [],
      generatedPlan,
      placesUsed,
      totalCostEstimate,
    });
  } catch (error) {
    console.error('❌ Planner error:', error.message);

    if (error.message?.includes('API_KEY')) {
      return res.status(503).json({
        message: 'AI service not configured. Please check GEMINI_API_KEY.',
      });
    }

    res.status(500).json({ message: 'Server error generating itinerary.' });
  }
});

module.exports = router;
