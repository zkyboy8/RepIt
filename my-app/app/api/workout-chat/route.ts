import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    // Simple AI response logic - in a real app, this would call an AI service
    let response = "I'm here to help with your fitness goals! "

    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("workout") || lowerMessage.includes("exercise")) {
      response +=
        "I can help you create personalized workout routines based on your goals, available time, and fitness level. What type of workout are you looking for?"
    } else if (lowerMessage.includes("diet") || lowerMessage.includes("nutrition")) {
      response +=
        "Nutrition is crucial for fitness success! I can provide general guidance on healthy eating habits that complement your training."
    } else if (lowerMessage.includes("motivation") || lowerMessage.includes("help")) {
      response +=
        "Staying motivated is key to reaching your fitness goals. Remember, consistency beats perfection. What specific challenge are you facing?"
    } else {
      response +=
        "I can help with workout planning, exercise form, nutrition tips, and motivation. What would you like to know more about?"
    }

    return NextResponse.json({
      response,
      suggestions: [
        "Create a beginner workout plan",
        "Upper body strength routine",
        "Quick 15-minute HIIT workout",
        "Nutrition tips for muscle building",
      ],
    })
  } catch (error) {
    console.error("Error in workout chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
