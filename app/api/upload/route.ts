import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const response = await fetch(`${process.env.API_URL}/api/v1/contract/upload`, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to upload contract" }, { status: 500 })
  }
}

