import ContractUpload from "@/components/ContractUpload"
import ContractList from "@/components/ContractList"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Contract Manager</h1>
      <ContractUpload />
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Uploaded Contracts</h2>
        <ContractList />
      </div>
    </main>
  )
}

