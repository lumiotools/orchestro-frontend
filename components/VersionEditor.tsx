"use client"

import type React from "react"

import { useState } from "react"
import type { Version } from "../types"

interface VersionEditorProps {
  onSubmit: (newVersion: Partial<Version>) => void
}

export default function VersionEditor({ onSubmit }: VersionEditorProps) {
  const [versionName, setVersionName] = useState("")
  const [versionDescription, setVersionDescription] = useState("")
  const [newJson, setNewJson] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      version_name: versionName,
      version_description: versionDescription,
      new_json: JSON.parse(newJson),
    })
    setVersionName("")
    setVersionDescription("")
    setNewJson("")
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h2 className="text-2xl font-bold mb-2">Create New Version</h2>
      <div className="mb-2">
        <label htmlFor="versionName" className="block">
          Version Name:
        </label>
        <input
          type="text"
          id="versionName"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="versionDescription" className="block">
          Description:
        </label>
        <textarea
          id="versionDescription"
          value={versionDescription}
          onChange={(e) => setVersionDescription(e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="newJson" className="block">
          New JSON:
        </label>
        <textarea
          id="newJson"
          value={newJson}
          onChange={(e) => setNewJson(e.target.value)}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Version
      </button>
    </form>
  )
}

