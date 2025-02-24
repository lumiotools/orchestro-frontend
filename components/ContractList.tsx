"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/utils/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Truck } from "lucide-react"
import type { Contract } from "@/app/types"

interface ApiResponse {
  success: boolean
  message: string
  data: {
    contracts: Contract[]
  }
}

function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const fetchContracts = useCallback(async () => {
    try {
      const url = getApiUrl("/api/v1/contract/list")
      console.log("Fetching contracts from:", url)

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data: ApiResponse = await res.json()
      console.log("Parsed data:", data)

      if (!data.success || !data.data?.contracts) {
        throw new Error("Invalid response format")
      }

      setContracts(data.data.contracts)
    } catch (e) {
      console.error("Error fetching contracts:", e)
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handleCardClick = (contractId: number, currentVersionId: number) => {
    console.log(`Navigating to /contract/${contractId}/version/${currentVersionId}`)
    router.push(`/contract/${contractId}/version/${currentVersionId}`)
  }

  if (loading) {
    return <p className="text-center text-lg">Loading contracts...</p>
  }

  if (error) {
    return <p className="text-center text-lg text-red-500">Error: {error.message}</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contracts.map((contract) => (
        <Card
          key={contract.contract_id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => handleCardClick(contract.contract_id, contract.current_version_id)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              {contract.contract_file_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Status:</strong> {contract.status}
              </p>
              <p>
                <strong>Carrier:</strong> {contract.carrier}
              </p>
              <p>
                <strong>Current Version:</strong> {contract.current_version_name}
              </p>
              <p>
                <strong>Versions Count:</strong> {contract.versions_count}
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Created: {new Date(contract.created_at).toLocaleDateString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Updated: {new Date(contract.updated_at).toLocaleDateString()}</span>
              </p>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(contract.contract_file_url, "_blank")
                }}
              >
                <Truck className="mr-2 h-4 w-4" /> View Contract File
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ContractList

