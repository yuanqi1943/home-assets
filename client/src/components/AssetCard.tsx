import type { Asset } from '../api/api';
import { getImageUrl } from '../api/api';
import { Calendar, Tag, Edit2, Trash2 } from 'lucide-react';

interface AssetCardProps {
    asset: Asset;
    onEdit: (asset: Asset) => void;
    onDelete: (id: string) => void;
}

export default function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
    const formatPrice = (price: number | null) => {
        if (price === null) return '未标价';
        return `¥${price}`;
    };

    const formatDate = (date: string | null) => {
        if (!date) return '未知';
        return new Date(date).toLocaleDateString('zh-CN');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
            <div className="aspect-video bg-gray-100 relative overflow-hidden group">
                {asset.image_path ? (
                    <img
                        src={getImageUrl(asset.image_path)!}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Tag size={48} />
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(asset)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-blue-600"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(asset.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 truncate">{asset.name}</h3>

                <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 mb-3">
                    {formatPrice(asset.price)}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    {asset.category && (
                        <div className="flex items-center gap-2">
                            <Tag size={14} />
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{asset.category}</span>
                        </div>
                    )}

                    {asset.purchase_date && (
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>购买于 {formatDate(asset.purchase_date)}</span>
                        </div>
                    )}

                    {/* {asset.warranty_period && (
                        <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span className={warrantyStatus ? 'text-green-600' : 'text-red-500'}>
                                {warrantyStatus ? '保修期内' : '已过保'} ({asset.warranty_period}个月)
                            </span>
                        </div>
                    )} */}
                </div>

                {/* {asset.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{asset.description}</p>
                )} */}
            </div>
        </div>
    );
}