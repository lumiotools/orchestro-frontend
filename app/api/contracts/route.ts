import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("API Route - Fetching contracts from:", process.env.API_URL) // Debug log
    const response = await fetch(`${process.env.API_URL}/api/v1/contracts`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("API Route - Failed to fetch contracts:", response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Route - Contracts data:", data) // Debug log
    return NextResponse.json(data)
  } catch (error) {
    console.error("API Route - Error fetching contracts:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch contracts" }, { status: 500 })
  }
}

