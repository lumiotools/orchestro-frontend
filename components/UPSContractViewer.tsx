"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ContractData {
  contract_id: number
  version_id: number
  version_name: string
  version_description: string
  current_version_id: number
  current_version_name: string
  created_at: string
  updated_at: string
  status: string
  contract_file_name: string
  contract_file_url: string
  carrier: string
  tables: {
    [key: string]: {
      title: string
      tableData: {
        headers: string[]
        rows: Array<{
          [key: string]: string | string[] | null
        }>
      }
    }
  }
}

const UPSContractViewer: React.FC<{ contractData: ContractData }> = ({ contractData }) => {
  const excludedTables = ["eligible_accounts"]
  const filteredTables = useMemo(() => {
    return Object.keys(contractData.tables).filter((table) => !excludedTables.includes(table))
  }, [contractData.tables])

  const [selectedTable, setSelectedTable] = useState(filteredTables[0] || "")
  const [selectedService, setSelectedService] = useState("")
  const [weeklyCharges, setWeeklyCharges] = useState("")
  const router = useRouter()

  const services = useMemo(() => {
    if (!selectedTable) return []
    const table = contractData.tables[selectedTable]
    if (!table || !table.tableData) return []
    return Array.from(new Set(table.tableData.rows.map((row) => row.service as string)))
      .filter(Boolean)
  }, [contractData.tables, selectedTable])

  useEffect(() => {
    if (services.length > 0) {
      setSelectedService(services[0])
    }
  }, [services])

  const transformIncentivesData = (headers: string[], rows: any[]) => {
    const serviceRows = rows.filter((row) => row.service === selectedService)
    if (!serviceRows.length) return null

    return {rows: serviceRows}

    const hasWeight = serviceRows.some((row) => row.weight)

    if (!hasWeight) {
      // If there's no weight, return the original structure
      return { headers, rows: serviceRows }
    }

    const zones = Array.from(new Set(serviceRows.map((row) => Number(row.zone))))
      .filter(Boolean)
      .sort((a, b) => a - b)

    const weightRanges = Array.from(new Set(serviceRows.map((row) => row.weight)))
      .filter(Boolean)
      .sort((a, b) => {
        const [aMin] = String(a).split("-").map(Number)
        const [bMin] = String(b).split("-").map(Number)
        return aMin - bMin
      })

    const matrix = weightRanges.map((weight) => {
      const row: { [key: string]: string } = { weight: `${weight}` }
      zones.forEach((zone) => {
        const matchingRow = serviceRows.find((r) => r.weight === weight && Number(r.zone) === zone)
        row[`zone${zone}`] = matchingRow ? matchingRow.discount : "-"
      })
      return row
    })

    return {
      zones,
      weightRanges,
      matrix,
      billing: serviceRows[0].billing,
      weightUnit: serviceRows[0].weightUnit,
      hasWeight: true,
    }
  }

  const renderIncentivesTable = (headers: string[], rows: any[]) => {
    const normalizedRows = rows.map((row) => {
      const normalizedRow: any = {}
      headers.forEach((header, index) => {
        normalizedRow[header.toLowerCase()] = row[header] || row[headers[index]]
      })
      return normalizedRow
    })

    const transformedData = transformIncentivesData(headers, normalizedRows)
    if (!transformedData) return null

    if (!transformedData.hasWeight) {
      // Original table structure rendering remains the same...
      return (
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse border border-gray-200">
            <TableHeader>
              <TableRow className="bg-gray-100">
                {headers.map((header, index) => (
                  <TableHead key={index} className="border border-gray-200 px-4 py-2 font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedData?.rows?.map((row, rowIndex) => (
                <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {headers.map((header, cellIndex) => (
                    <TableCell key={cellIndex} className="border border-gray-200 px-4 py-2">
                      {row[header.toLowerCase()] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    const { zones, matrix, billing, weightUnit } = transformedData

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{selectedService}</h3>
          <p className="text-sm text-gray-500">Billing: {billing}</p>
        </div>

        <div className="relative w-full overflow-x-auto border rounded-lg">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-100">
                <th className="sticky left-0 z-20 bg-gray-100 px-4 py-2 font-semibold border-b border-r whitespace-nowrap">
                  Weight ({weightUnit})
                </th>
                {zones.map((zone) => (
                  <th
                    key={zone}
                    className="px-4 py-2 font-semibold border-b border-r text-center whitespace-nowrap min-w-[100px]"
                  >
                    Zone {zone}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="sticky left-0 z-20 px-4 py-2 font-medium border-r whitespace-nowrap bg-inherit">
                    {row.weight}
                  </td>
                  {zones.map((zone) => (
                    <td key={zone} className="px-4 py-2 text-center border-r whitespace-nowrap">
                      {row[`zone${zone}`]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderRegularTable = (headers: string[], rows: any[]) => (
    <div className="overflow-x-auto">
      <Table className="w-full border-collapse border border-gray-200">
        <TableHeader>
          <TableRow className="bg-gray-100">
            {headers.map((header, index) => (
              <TableHead key={index} className="border border-gray-200 px-4 py-2 font-semibold">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {headers.map((header, cellIndex) => (
                <TableCell key={cellIndex} className="border border-gray-200 px-4 py-2">
                  {Array.isArray(row[header]) ? row[header].join(", ") : row[header] || "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderSelectedTable = () => {
    if (!selectedTable) return null

    const table = contractData.tables[selectedTable]
    if (table && table.tableData) {
      if (table.title === "Incentives off effective rate") {
        return renderIncentivesTable(table.tableData.headers, table.tableData.rows)
      }

      let filteredRows = table.tableData.rows
      if (selectedService) {
        filteredRows = filteredRows.filter((row) => row.service === selectedService)
      }
      return renderRegularTable(table.tableData.headers, filteredRows)
    }
    return null
  }

  const getTableTitle = (tableKey: string) => {
    const table = contractData.tables[tableKey]
    return table ? table.title : tableKey.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleCalculate = () => {
    if (!weeklyCharges) {
      alert("Please enter weekly charges")
      return
    }
    router.push(
      `/contract/${contractData.contract_id}/version/${contractData.version_id}/calculate?weeklyCharges=${weeklyCharges}`,
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">UPS Contract Viewer</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Select Table</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedTable(value)
                  setSelectedService("")
                }}
                value={selectedTable}
              >
                <SelectTrigger className="w-full bg-white border border-gray-200 rounded-md h-12">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTables.map((tableKey) => (
                    <SelectItem key={tableKey} value={tableKey}>
                      {getTableTitle(tableKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTable && services.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Select Service</Label>
                <Select onValueChange={setSelectedService} value={selectedService}>
                  <SelectTrigger className="w-full bg-white border border-gray-200 rounded-md h-12">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedTable && (
            <Card className="mt-6">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-800">{getTableTitle(selectedTable)}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="max-h-[600px] overflow-y-auto">{renderSelectedTable()}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between w-full space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Label htmlFor="weekly-charges" className="font-medium text-gray-700 whitespace-nowrap">
              Weekly Charges:
            </Label>
            <Input
              id="weekly-charges"
              type="number"
              value={weeklyCharges}
              onChange={(e) => setWeeklyCharges(e.target.value)}
              placeholder="Enter weekly charges"
              className="w-full md:w-40"
            />
          </div>
          <Button onClick={handleCalculate} className="w-full md:w-auto">
            Calculate Discount
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default UPSContractViewer

