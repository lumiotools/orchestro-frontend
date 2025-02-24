"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ContractUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const url = getApiUrl("api/v1/contract/upload")
      console.log("Uploading contract to:", url)

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", response.status)
      const text = await response.text()
      console.log("Raw upload response:", text)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = JSON.parse(text)
      console.log("Parsed upload response:", data)

      if (data.success) {
        router.refresh()
        setFile(null)
      } else {
        throw new Error(data.message || "Upload failed")
      }
    } catch (error) {
      console.error("Error uploading contract:", error)
      alert("Failed to upload contract. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Contract</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf" className="flex-1" />
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ContractUpload

