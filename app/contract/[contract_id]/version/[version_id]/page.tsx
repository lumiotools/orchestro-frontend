"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import UPSContractViewer from "@/components/UPSContractViewer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getApiUrl } from "@/utils/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ContractVersionPage() {
  const params = useParams()
  const router = useRouter()
  const [contractData, setContractData] = useState(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklyCharges, setWeeklyCharges] = useState("")

  useEffect(() => {
    async function fetchContractVersion() {
      try {
        const contractId = params?.contract_id
        const versionId = params?.version_id

        console.log("Params:", params)
        console.log("Contract ID:", contractId, "Version ID:", versionId)

        if (!contractId || !versionId) {
          console.error("Contract ID or Version ID is missing")
          setError(new Error("Contract ID or Version ID is missing"))
          setLoading(false)
          return
        }

        const url = getApiUrl(`api/v1/contract/${contractId}/version/${versionId}`)
        console.log(`Fetching contract version from: ${url}`)

        const res = await fetch(url)
        console.log("Response status:", res.status)

        if (!res.ok) {
          console.error(`HTTP error! status: ${res.status}`)
          const errorText = await res.text()
          console.error("Error response:", errorText)
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        console.log("Contract data:", data)

        if (!data.success || !data.data) {
          throw new Error("Invalid response format")
        }

        setContractData(data.data)
      } catch (e) {
        console.error("Error fetching contract version:", e)
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchContractVersion()
  }, [params])

  const handleCalculate = () => {
    if (weeklyCharges) {
      router.push(
        `/contract/${params.contract_id}/version/${params.version_id}/calculate?weeklyCharges=${weeklyCharges}`,
      )
    }
  }

  if (loading) {
    return <div>Loading contract version...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load contract version. Error: {error.message}
          <br />
          Please try again later or contact support if the problem persists.
        </AlertDescription>
      </Alert>
    )
  }

  if (!contractData) {
    return <div>No contract version found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contract Version Details</h1>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Label htmlFor="weeklyCharges" className="whitespace-nowrap">
            Weekly Charges:
          </Label>
          <Input
            id="weeklyCharges"
            type="number"
            value={weeklyCharges}
            onChange={(e) => setWeeklyCharges(e.target.value)}
            className="w-[150px]"
            placeholder="Enter amount"
          />
          <Button onClick={handleCalculate} disabled={!weeklyCharges}>
            Calculate
          </Button>
        </div>
      </div>
      <UPSContractViewer contractData={contractData} />
    </div>
  )
}

