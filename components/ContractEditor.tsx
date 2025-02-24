"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ContractDetails } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiUrl } from "@/utils/api"

interface ContractEditorProps {
  initialContract: ContractDetails
}

export default function ContractEditor({ initialContract }: ContractEditorProps) {
  const [contract, setContract] = useState(initialContract)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContract((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(getApiUrl(`api/v1/contract/${contract.contract_id}/version`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_json: contract,
          version_name: `v${contract.versions_count + 1}`,
          version_description: "Updated contract details",
        }),
      })
      const data = await response.json()
      if (data.success) {
        router.refresh()
        router.push(`/contract/${contract.contract_id}`)
      } else {
        throw new Error(data.message || "Failed to save contract")
      }
    } catch (error) {
      console.error("Error updating contract:", error)
      alert("Failed to save contract. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Contract</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="contract_file_name" className="block font-medium">
              Contract File Name
            </label>
            <Input
              type="text"
              id="contract_file_name"
              name="contract_file_name"
              value={contract.contract_file_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="status" className="block font-medium">
              Status
            </label>
            <Input type="text" id="status" name="status" value={contract.status} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="carrier" className="block font-medium">
              Carrier
            </label>
            <Input type="text" id="carrier" name="carrier" value={contract.carrier} onChange={handleChange} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes (Create New Version)"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

