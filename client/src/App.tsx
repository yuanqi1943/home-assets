import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, LayoutGrid, List, TrendingUp, Package } from 'lucide-react';
import { assetApi } from './api/api';
import type { Asset, CreateAssetData } from './api/api';
import AssetCard from './components/AssetCard';
import AssetForm from './components/AssetForm';

type ViewMode = 'grid' | 'list';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState({ total_count: 0, total_value: 0, category_count: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [assetsData, statsData, catsData] = await Promise.all([
        assetApi.getAll({ search, category: selectedCategory }),
        assetApi.getStats(),
        assetApi.getCategories(),
      ]);
      setAssets(assetsData);
      setStats(statsData);
      setCategories(catsData);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: CreateAssetData) => {
    try {
      if (editingAsset) {
        await assetApi.update(editingAsset.id, data);
      } else {
        await assetApi.create(data);
      }
      setShowForm(false);
      setEditingAsset(null);
      fetchData();
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个物品吗？')) return;
    try {
      await assetApi.delete(id);
      fetchData();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">家庭资产管家</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>添加物品</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">物品总数</p>
                <p className="text-3xl font-bold">{stats.total_count}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">资产总值</p>
                <p className="text-3xl font-bold text-green-600">
                  ¥{stats.total_value}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">分类数量</p>
                <p className="text-3xl font-bold">{stats.category_count}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <LayoutGrid className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜索物品名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-2 focus:ring-0 focus:ring-blue-500 focus:border-blue-500 border rounded-lg"
            >
              <option value="">所有分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 资产列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">还没有记录任何物品</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              添加第一个物品
            </button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {assets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="list">
              {assets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        )
        }
      </main>

      {/* 表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AssetForm
                initialData={editingAsset ? {
                  ...editingAsset,
                  price: editingAsset.price ?? undefined,
                  category: editingAsset.category ?? undefined,
                  purchase_date: editingAsset.purchase_date ?? undefined,
                  warranty_period: editingAsset.warranty_period ?? undefined,
                  description: editingAsset.description ?? undefined,
                } : undefined}
                onSubmit={handleSubmit}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}