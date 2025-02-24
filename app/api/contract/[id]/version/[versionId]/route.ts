import { NextResponse } from "next/server"
import { getApiUrl } from "@/utils/api"

export async function GET(request: Request, { params }: { params: { id: string; versionId: string } }) {
  const { id, versionId } = params

  console.log(`API Route - Fetching contract version. ID: ${id}, VersionID: ${versionId}`)

  try {
    const apiUrl = getApiUrl(`api/v1/contract/${id}/version/${versionId}`)
    console.log("Full API URL:", apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`API Route - Failed to fetch contract version: ${response.status} ${response.statusText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Route - Contract version data:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Route - Error fetching contract version:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch contract version" }, { status: 500 })
  }
}

