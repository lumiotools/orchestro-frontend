import { NextResponse } from "next/server"
import { getApiUrl } from "@/utils/api"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const body = await request.json()
    const apiUrl = getApiUrl(`api/v1/contract/calculate/${id}`)

    console.log("Calculate API URL:", apiUrl)
    console.log("Request body:", body)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weekly_price: body.weekly_price,
      }),
    })

    if (!response.ok) {
      console.error(`API Route - Failed to calculate rates: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Route - Calculate response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Route - Error calculating rates:", error)
    return NextResponse.json({ success: false, message: "Failed to calculate rates" }, { status: 500 })
  }
}

