'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { Package, Plus, Pencil, Trash2, DollarSign, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  productUrl: string | null
  imageUrl: string | null
  sku: string | null
  isActive: boolean
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [brandId, setBrandId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formSku, setFormSku] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return
    fetch('/api/brand')
      .then(r => r.json())
      .then(b => {
        if (b?.id) {
          setBrandId(b.id)
          return fetch(`/api/products?brandId=${b.id}`)
        }
        return null
      })
      .then(r => r?.json().then(setProducts))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, session])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormDesc('')
    setFormPrice('')
    setFormUrl('')
    setFormSku('')
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setFormName(p.name)
    setFormDesc(p.description || '')
    setFormPrice(String(p.price))
    setFormUrl(p.productUrl || '')
    setFormSku(p.sku || '')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName) { toast.error('Product name is required'); return }
    setSubmitting(true)

    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName, description: formDesc, price: formPrice, productUrl: formUrl, sku: formSku }),
        })
        if (!res.ok) { toast.error('Failed to update'); return }
        const updated = await res.json()
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
        toast.success('Product updated')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId, name: formName, description: formDesc, price: formPrice, productUrl: formUrl, sku: formSku }),
        })
        if (!res.ok) { toast.error('Failed to create'); return }
        const created = await res.json()
        setProducts(prev => [...prev, created])
        toast.success('Product created')
      }
      setShowModal(false)
    } catch { toast.error('Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete'); return }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p))
    toast.success('Product removed')
  }

  if (status === 'unauthenticated' || (session && session.user.role !== 'BRAND' && session.user.role !== 'ADMIN')) return null

  const activeProducts = products.filter(p => p.isActive)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Products</h1>
          <p className="text-sm text-content-subtle">Manage your product catalog</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border-default bg-bg-default" />
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No products yet"
          description="Add your first product to start building affiliate campaigns"
          action={<Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />Add Product</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {activeProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 rounded-xl border border-border-default bg-bg-default p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-content-emphasis">{product.name}</h3>
                  {product.sku && (
                    <span className="text-[10px] text-content-subtle/60">SKU: {product.sku}</span>
                  )}
                </div>
                {product.description && (
                  <p className="mt-0.5 text-xs text-content-subtle line-clamp-1">{product.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                    <DollarSign className="h-3 w-3" />{product.price.toFixed(2)}
                  </span>
                  {product.productUrl && (
                    <a href={product.productUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      onClick={e => e.stopPropagation()}>
                      <ExternalLink className="h-3 w-3" /> View
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}
                  className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        description="Manage your product details">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-emphasis">Product Name</label>
            <input type="text" placeholder="Summer T-Shirt" value={formName} onChange={e => setFormName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              required autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium text-content-emphasis">Description</label>
            <textarea placeholder="Product description..." value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-content-emphasis">Price ($)</label>
              <input type="number" min={0} step={0.01} placeholder="29.99" value={formPrice} onChange={e => setFormPrice(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
            </div>
            <div>
              <label className="text-sm font-medium text-content-emphasis">SKU</label>
              <input type="text" placeholder="TSH-001" value={formSku} onChange={e => setFormSku(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-content-emphasis">Product URL</label>
            <input type="url" placeholder="https://example.com/product" value={formUrl} onChange={e => setFormUrl(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-content-emphasis hover:bg-bg-subtle transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !formName}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span> : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
