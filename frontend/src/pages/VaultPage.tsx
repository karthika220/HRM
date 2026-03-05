import { useState, useEffect } from 'react'
import { Shield, Key, Eye, EyeOff, Copy, Plus, Search, Lock, Unlock, AlertTriangle, CheckCircle, Trash2, Edit, Save, X, Globe, Smartphone, Monitor, CreditCard, FileText, Folder } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'

interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  url?: string
  notes?: string
  category: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  lastUsed?: string
  strength: 'weak' | 'medium' | 'strong'
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Folder, color: 'text-zinc-400' },
  { id: 'web', name: 'Web Accounts', icon: Globe, color: 'text-blue-400' },
  { id: 'mobile', name: 'Mobile Apps', icon: Smartphone, color: 'text-green-400' },
  { id: 'desktop', name: 'Desktop Apps', icon: Monitor, color: 'text-purple-400' },
  { id: 'financial', name: 'Financial', icon: CreditCard, color: 'text-yellow-400' },
  { id: 'documents', name: 'Documents', icon: FileText, color: 'text-red-400' }
]

const STRENGTH_COLORS = {
  weak: 'text-red-400 bg-red-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  strong: 'text-green-400 bg-green-400/10'
}

export default function VaultPage() {
  const { user } = useAuthStore()
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [masterPassword, setMasterPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showMasterInput, setShowMasterInput] = useState(true)

  // Demo data for now
  useEffect(() => {
    const demoPasswords: PasswordEntry[] = [
      {
        id: '1',
        title: 'Gmail Account',
        username: 'user@gmail.com',
        password: 'Gm@ilP@ssw0rd123!',
        url: 'https://gmail.com',
        notes: 'Primary email account',
        category: 'web',
        isFavorite: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastUsed: '2024-02-28T15:30:00Z',
        strength: 'strong'
      },
      {
        id: '2',
        title: 'Bank of America',
        username: 'john.doe',
        password: 'B@nk!ngSecure456',
        url: 'https://bankofamerica.com',
        notes: 'Main banking account',
        category: 'financial',
        isFavorite: true,
        createdAt: '2024-01-20T14:00:00Z',
        updatedAt: '2024-01-20T14:00:00Z',
        lastUsed: '2024-02-27T09:15:00Z',
        strength: 'strong'
      },
      {
        id: '3',
        title: 'Netflix',
        username: 'family@netflix.com',
        password: 'Netflix2024',
        url: 'https://netflix.com',
        category: 'web',
        isFavorite: false,
        createdAt: '2024-02-01T12:00:00Z',
        updatedAt: '2024-02-01T12:00:00Z',
        lastUsed: '2024-02-26T20:00:00Z',
        strength: 'medium'
      },
      {
        id: '4',
        title: 'Windows PC',
        username: 'Administrator',
        password: 'WinAdmin123!',
        notes: 'Main work computer',
        category: 'desktop',
        isFavorite: false,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z',
        lastUsed: '2024-02-28T08:00:00Z',
        strength: 'medium'
      },
      {
        id: '5',
        title: 'Mobile Banking App',
        username: '+1234567890',
        password: 'M0b!leB@nk789',
        category: 'mobile',
        isFavorite: true,
        createdAt: '2024-01-25T16:00:00Z',
        updatedAt: '2024-01-25T16:00:00Z',
        lastUsed: '2024-02-28T12:30:00Z',
        strength: 'strong'
      }
    ]
    
    setTimeout(() => {
      setPasswords(demoPasswords)
      setLoading(false)
    }, 1000)
  }, [])

  const handleUnlock = () => {
    if (masterPassword === 'vault123') {
      setIsUnlocked(true)
      setShowMasterInput(false)
    } else {
      alert('Invalid master password. Hint: vault123')
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak'
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium'
    return 'strong'
  }

  const generateId = () => Date.now().toString()

  const handleAddPassword = (newPassword: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength'>) => {
    const passwordEntry: PasswordEntry = {
      ...newPassword,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      strength: getPasswordStrength(newPassword.password)
    }
    setPasswords(prev => [...prev, passwordEntry])
    setShowAddModal(false)
  }

  const handleEditPassword = (updatedPassword: PasswordEntry) => {
    setPasswords(prev => 
      prev.map(p => p.id === updatedPassword.id 
        ? { ...updatedPassword, updatedAt: new Date().toISOString(), strength: getPasswordStrength(updatedPassword.password) }
        : p
      )
    )
    setEditingEntry(null)
  }

  const handleDeletePassword = (id: string) => {
    if (confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
      setPasswords(prev => prev.filter(p => p.id !== id))
    }
  }

  const handleToggleFavorite = (id: string) => {
    setPasswords(prev => 
      prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    )
  }

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (password.url && password.url.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || password.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categoryStats = CATEGORIES.map(category => ({
    ...category,
    count: category.id === 'all' ? passwords.length : passwords.filter(p => p.category === category.id).length
  }))

  if (showMasterInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#09090B] via-[#18181B] to-[#09090B] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-[#18181B] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-teal to-brand-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-black" />
              </div>
              <h1 className="font-rubik font-bold text-2xl text-white mb-2">Vault Access</h1>
              <p className="text-zinc-500 text-sm">Enter your master password to access the secure vault</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter master password"
                  className="w-full pl-12 pr-4 py-4 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none transition-all"
                />
              </div>

              <button
                onClick={handleUnlock}
                className="w-full py-4 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,161,199,0.3)]"
              >
                <Unlock className="w-5 h-5 inline-block mr-2" />
                Unlock Vault
              </button>

              <div className="text-center">
                <p className="text-zinc-500 text-xs">Hint: vault123</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-[#09090B] border border-white/5 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">Security Notice</p>
                  <p className="text-zinc-500 text-xs">This is a demo vault. In production, always use a strong master password and enable two-factor authentication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090B] via-[#18181B] to-[#09090B]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#18181B]/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-teal to-brand-mint rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="font-rubik font-bold text-xl text-white">Secure Vault</h1>
                <p className="text-zinc-500 text-sm">Password Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search passwords..."
                  className="pl-10 pr-4 py-2 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none w-64"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Categories */}
          <div className="lg:col-span-1">
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4">
              <h3 className="font-rubik font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categoryStats.map(category => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        selectedCategory === category.id
                          ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${category.color}`} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{category.count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Security Stats */}
            <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4 mt-4">
              <h3 className="font-rubik font-semibold text-white mb-4">Security Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Total Passwords</span>
                  <span className="text-white font-bold">{passwords.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Strong Passwords</span>
                  <span className="text-green-400 font-bold">
                    {passwords.filter(p => p.strength === 'strong').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Favorites</span>
                  <span className="text-yellow-400 font-bold">
                    {passwords.filter(p => p.isFavorite).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password List */}
          <div className="lg:col-span-3">
            <div className="bg-[#18181B] border border-white/10 rounded-2xl">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-rubik font-semibold text-white">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All'} 
                  <span className="text-zinc-500 font-normal ml-2">({filteredPasswords.length})</span>
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />
                </div>
              ) : filteredPasswords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Lock className="w-12 h-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-500">No passwords found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredPasswords.map(password => {
                    const isPasswordVisible = showPasswords[password.id]
                    const isCopied = copiedId === password.id
                    const StrengthIcon = password.strength === 'strong' ? CheckCircle : 
                                       password.strength === 'medium' ? AlertTriangle : AlertTriangle

                    return (
                      <div key={password.id} className="p-4 hover:bg-white/5 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-rubik font-semibold text-white">{password.title}</h3>
                              <button
                                onClick={() => handleToggleFavorite(password.id)}
                                className="text-zinc-400 hover:text-yellow-400 transition-colors"
                              >
                                {password.isFavorite ? (
                                  <div className="w-5 h-5 bg-yellow-400/20 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border border-zinc-400 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                                  </div>
                                )}
                              </button>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${STRENGTH_COLORS[password.strength]}`}>
                                {password.strength}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-sm w-16">Username:</span>
                                <span className="text-white text-sm">{password.username}</span>
                                <button
                                  onClick={() => copyToClipboard(password.username, `username-${password.id}`)}
                                  className="text-zinc-400 hover:text-white transition-colors"
                                >
                                  {isCopied && copiedId === `username-${password.id}` ? (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-sm w-16">Password:</span>
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-white text-sm font-mono">
                                    {isPasswordVisible ? password.password : '•'.repeat(12)}
                                  </span>
                                  <button
                                    onClick={() => togglePasswordVisibility(password.id)}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                  >
                                    {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(password.password, `password-${password.id}`)}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                  >
                                    {isCopied && copiedId === `password-${password.id}` ? (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {password.url && (
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-500 text-sm w-16">URL:</span>
                                  <a
                                    href={password.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-teal text-sm hover:underline"
                                  >
                                    {password.url}
                                  </a>
                                </div>
                              )}

                              {password.notes && (
                                <div className="flex items-start gap-2">
                                  <span className="text-zinc-500 text-sm w-16">Notes:</span>
                                  <span className="text-zinc-400 text-sm">{password.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button 
                              onClick={() => setEditingEntry(password)}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePassword(password.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Password Modal */}
      {showAddModal && (
        <AddPasswordModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPassword}
          categories={CATEGORIES.filter(c => c.id !== 'all')}
        />
      )}

      {/* Edit Password Modal */}
      {editingEntry && (
        <EditPasswordModal 
          password={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleEditPassword}
          categories={CATEGORIES.filter(c => c.id !== 'all')}
        />
      )}
    </div>
  )
}

// Add Password Modal Component
function AddPasswordModal({ onClose, onSave, categories }: { 
  onClose: () => void
  onSave: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength'>) => void
  categories: typeof CATEGORIES
}) {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'web',
    isFavorite: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak'
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium'
    return 'strong'
  }

  const strength = getPasswordStrength(formData.password)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-rubik font-bold text-xl text-white">Add New Password</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
              placeholder="e.g., Gmail Account"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
              placeholder="e.g., user@gmail.com"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
                placeholder="Enter secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            {formData.password && (
              <div className="mt-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${STRENGTH_COLORS[strength]}`}>
                  Password Strength: {strength}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">URL (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="w-4 h-4 bg-[#09090B] border border-white/10 rounded text-brand-teal focus:ring-brand-teal focus:ring-offset-0"
            />
            <label htmlFor="favorite" className="text-zinc-400 text-sm">Mark as favorite</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all"
            >
              <Save className="w-4 h-4 inline-block mr-2" />
              Save Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Password Modal Component
function EditPasswordModal({ password, onClose, onSave, categories }: { 
  password: PasswordEntry
  onClose: () => void
  onSave: (password: PasswordEntry) => void
  categories: typeof CATEGORIES
}) {
  const [formData, setFormData] = useState({
    title: password.title,
    username: password.username,
    password: password.password,
    url: password.url || '',
    notes: password.notes || '',
    category: password.category,
    isFavorite: password.isFavorite
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave({
        ...password,
        ...formData
      })
    }
  }

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak'
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium'
    return 'strong'
  }

  const strength = getPasswordStrength(formData.password)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#18181B] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-rubik font-bold text-xl text-white">Edit Password</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
              placeholder="e.g., Gmail Account"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
              placeholder="e.g., user@gmail.com"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
                placeholder="Enter secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            {formData.password && (
              <div className="mt-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${STRENGTH_COLORS[strength]}`}>
                  Password Strength: {strength}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">URL (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white focus:border-brand-teal outline-none"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-[#09090B] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:border-brand-teal outline-none resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="w-4 h-4 bg-[#09090B] border border-white/10 rounded text-brand-teal focus:ring-brand-teal focus:ring-offset-0"
            />
            <label htmlFor="favorite" className="text-zinc-400 text-sm">Mark as favorite</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-teal to-brand-mint text-black font-bold rounded-xl hover:opacity-90 transition-all"
            >
              <Save className="w-4 h-4 inline-block mr-2" />
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
