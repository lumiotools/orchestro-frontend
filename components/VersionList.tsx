import type { Version } from "../types"

interface VersionListProps {
  versions: Version[]
  onRestore: (versionId: number) => void
}

export default function VersionList({ versions, onRestore }: VersionListProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2">Versions</h2>
      {versions.map((version) => (
        <div key={version.version_id} className="mb-2 p-2 border rounded">
          <p>Name: {version.name}</p>
          <p>Description: {version.description}</p>
          <p>Created At: {new Date(version.created_at).toLocaleString()}</p>
          <button
            onClick={() => onRestore(version.version_id)}
            className="bg-green-500 text-white px-2 py-1 rounded mt-2"
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  )
}

