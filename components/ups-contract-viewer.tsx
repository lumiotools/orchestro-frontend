"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// This is a simplified version of the contract data. In a real application, you would fetch this data from an API.
const contractData = {
  eligible_accounts: [
    { account_number: "0000225Y8F", name: "WALLQUEST", address: "465 DEVON PARK DR, WAYNE, PA 19087, US" },
    // ... other accounts
  ],
  incentive_base_discount: {
    title: "Incentives off effective rate",
    tableData: {
      headers: ["service", "billing", "zone", "weight", "weightUnit", "discount", "tags", "destination"],
      rows: [
        {
          service: "UPS® Ground - Commercial Package - Prepaid",
          billing: "Prepaid",
          zone: "2",
          weight: "1-20",
          weightUnit: "lbs",
          discount: "30.00%",
          tags: ["Ground", "Commercial Package"],
          destination: null,
        },
        // ... other rows
      ],
    },
  },
  tier_discount: {
    title: "Portfolio Tier Incentive",
    tableData: {
      headers: ["service", "land_zone", "weeklySpendMin", "weeklySpendMax", "currency", "discount", "tags"],
      rows: [
        {
          service: "UPS Next Day Air® - Letter - Prepaid FrtFC TP UP RS RTP",
          land_zone: "ALL",
          currency: "USD",
          discount: "42.00%",
          tags: ["Letter", "Prepaid"],
          weeklySpendMin: "0.01",
          weeklySpendMax: "19,429.99",
        },
        // ... other rows
      ],
    },
  },
  // ... other sections
}

const UPSContractViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState("eligible-accounts")

  const renderTable = (headers: string[], rows: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead key={index}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {headers.map((header, cellIndex) => (
              <TableCell key={cellIndex}>{row[header] || "-"}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">UPS Contract Viewer</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="eligible-accounts">Eligible Accounts</TabsTrigger>
          <TabsTrigger value="incentive-base-discount">Incentive Base Discount</TabsTrigger>
          <TabsTrigger value="tier-discount">Tier Discount</TabsTrigger>
        </TabsList>
        <TabsContent value="eligible-accounts">
          <h2 className="text-xl font-semibold mb-2">Eligible Accounts</h2>
          {renderTable(["account_number", "name", "address"], contractData.eligible_accounts)}
        </TabsContent>
        <TabsContent value="incentive-base-discount">
          <h2 className="text-xl font-semibold mb-2">{contractData.incentive_base_discount.title}</h2>
          {renderTable(
            contractData.incentive_base_discount.tableData.headers,
            contractData.incentive_base_discount.tableData.rows,
          )}
        </TabsContent>
        <TabsContent value="tier-discount">
          <h2 className="text-xl font-semibold mb-2">{contractData.tier_discount.title}</h2>
          {renderTable(contractData.tier_discount.tableData.headers, contractData.tier_discount.tableData.rows)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UPSContractViewer

