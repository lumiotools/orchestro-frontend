import type { ContractDetails } from "../types"

interface ContractDetailsProps {
  contract: ContractDetails
}

export default function ContractDetails({ contract }: ContractDetailsProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2">Contract Information</h2>
      <p>File Name: {contract.contract_file_name}</p>
      <p>Status: {contract.status}</p>
      <p>Carrier: {contract.carrier}</p>
      <p>Current Version: {contract.current_version}</p>
      <p>Versions Count: {contract.versions_count}</p>
      <a
        href={contract.contract_file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        View Contract File
      </a>
    </div>
  )
}

