/**
 * Teacher Dashboard — create classrooms, share join codes, view student work.
 *
 * Teachers create a classroom → get a 6-character join code → share it
 * with students. Students sign in and enter the code. Teacher sees all
 * members + their shared projects in one place.
 *
 * Students see the classrooms they've joined and can enter new codes.
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import {
  fetchClassrooms,
  fetchClassroom,
  createClassroom,
  joinClassroom,
  type Classroom,
  type ClassroomDetail as ClassroomDetailType,
} from './api'
import ClassroomDetail from './ClassroomDetail'

export default function TeacherDashboard() {
  const { getToken } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  // Create classroom form
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  // Join classroom form
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Newly created classroom code to show
  const [createdCode, setCreatedCode] = useState<string | null>(null)

  // Auto-open join modal if ?join=CODE is in the URL (shareable invite link)
  useEffect(() => {
    const code = searchParams.get('join')
    if (code) {
      setJoinCode(code.toUpperCase())
      setShowJoin(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const load = useCallback(async () => {
    setLoading(true)
    const list = await fetchClassrooms(getToken)
    setClassrooms(list)
    setLoading(false)
  }, [getToken])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    const result = await createClassroom(newName.trim(), getToken)
    if (result) {
      setCreatedCode(result.joinCode)
      setNewName('')
      setShowCreate(false)
      await load()
    }
    setCreating(false)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError(null)
    const result = await joinClassroom(joinCode.trim(), getToken)
    if (result) {
      setJoinCode('')
      setShowJoin(false)
      await load()
    } else {
      setJoinError('Invalid code — check and try again')
    }
    setJoining(false)
  }

  const handleSelectClassroom = async (id: string) => {
    const detail = await fetchClassroom(id)
    setSelectedClassroom(detail)
  }

  return (
    <div className="min-h-full bg-base">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text tracking-tight mb-1">
              Classrooms
            </h1>
            <p className="text-subtext">
              Create a classroom and share the join code with your students.
            </p>
          </div>
          <SignedIn>
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoin(true)}
                className="px-4 py-2.5 bg-surface-0 hover:bg-surface-1 text-text rounded-lg text-sm font-semibold transition-colors"
              >
                Join Class
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2.5 bg-accent hover:bg-sapphire text-base rounded-lg text-sm font-bold transition-colors"
              >
                + New Classroom
              </button>
            </div>
          </SignedIn>
        </div>

        <SignedOut>
          <div className="bg-surface-0 rounded-xl p-8 text-center">
            <span className="text-4xl mb-4 block">🏫</span>
            <h2 className="text-xl font-bold text-text mb-2">Sign in to get started</h2>
            <p className="text-overlay mb-4">Teachers create classrooms. Students join with a code.</p>
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 bg-purple text-base rounded-lg font-bold hover:bg-purple/80 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Created code banner */}
          {createdCode && (
            <div className="mb-6 bg-success/10 border border-success/30 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-subtext">Classroom created! Share this code with your students:</div>
                <div className="text-3xl font-mono font-bold text-success tracking-widest mt-1">{createdCode}</div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/teacher?join=${createdCode}`
                    navigator.clipboard.writeText(link)
                    setCreatedCode(null)
                  }}
                  className="px-4 py-2 bg-success text-base rounded-lg text-sm font-bold"
                >
                  Copy Invite Link
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdCode!)
                    setCreatedCode(null)
                  }}
                  className="text-xs text-overlay hover:text-subtext"
                >
                  or copy code only
                </button>
              </div>
            </div>
          )}

          {/* Create classroom modal */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}>
              <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <h2 className="text-text font-semibold text-base mb-4">Create a Classroom</h2>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Period 3 — Intro to Coding"
                  className="w-full bg-surface-0 border border-surface-1 text-text text-sm rounded-lg px-3 py-2.5 placeholder-overlay focus:outline-none focus:border-accent mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg">Cancel</button>
                  <button onClick={handleCreate} disabled={creating || !newName.trim()} className="px-4 py-2 text-sm font-bold text-base bg-accent hover:bg-sapphire rounded-lg disabled:opacity-40">
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Join classroom modal */}
          {showJoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={(e) => { if (e.target === e.currentTarget) setShowJoin(false) }}>
              <div className="bg-base border border-surface-0 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <h2 className="text-text font-semibold text-base mb-2">Join a Classroom</h2>
                <p className="text-overlay text-sm mb-4">Enter the 6-character code your teacher gave you.</p>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="w-full bg-surface-0 border border-surface-1 text-text text-2xl font-mono text-center tracking-[0.3em] rounded-lg px-3 py-3 placeholder-overlay focus:outline-none focus:border-accent mb-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  autoFocus
                  maxLength={6}
                />
                {joinError && <p className="text-xs text-danger mb-2">{joinError}</p>}
                <div className="flex gap-2 justify-end mt-3">
                  <button onClick={() => setShowJoin(false)} className="px-4 py-2 text-sm text-text bg-surface-0 hover:bg-surface-1 rounded-lg">Cancel</button>
                  <button onClick={handleJoin} disabled={joining || joinCode.length < 4} className="px-4 py-2 text-sm font-bold text-base bg-success hover:bg-success/80 rounded-lg disabled:opacity-40">
                    {joining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Classroom list */}
          {loading ? (
            <div className="text-overlay animate-pulse py-12 text-center">Loading classrooms...</div>
          ) : classrooms.length === 0 ? (
            <div className="bg-mantle border border-surface-0 rounded-xl p-12 text-center">
              <span className="text-5xl block mb-4">🏫</span>
              <p className="text-text font-semibold text-lg mb-1">No classrooms yet</p>
              <p className="text-overlay text-sm">Create one to get started, or enter a join code from your teacher.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectClassroom(c.id)}
                  className="bg-mantle border border-surface-0 rounded-xl p-5 text-left hover:border-surface-1 transition-colors"
                >
                  <div className="text-lg font-bold text-text mb-1">{c.name}</div>
                  <div className="text-xs text-overlay mb-3">by {c.teacherName}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-accent font-mono tracking-wider">{c.joinCode}</span>
                    <span className="text-xs text-overlay">{c.memberCount} member{c.memberCount !== 1 ? 's' : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected classroom detail */}
          {selectedClassroom && (
            <ClassroomDetail
              classroom={selectedClassroom}
              onClose={() => setSelectedClassroom(null)}
            />
          )}
        </SignedIn>
      </div>
    </div>
  )
}
