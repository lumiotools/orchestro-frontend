export interface Contract {
  contract_id: number
  status: string
  current_version_id: number
  versions_count: number
  carrier: string
  shipper: string
  effective_date: string
  end_date: string
  contract_file_url: string
  contract_file_name: string
  created_at: string
  updated_at: string
}

export interface ContractDetails extends Contract {
  versions: Version[]
}

export interface Version {
  version_id: number
  name: string
  description: string
  created_at: string
}

