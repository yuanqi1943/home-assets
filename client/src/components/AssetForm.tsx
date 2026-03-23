import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Camera } from 'lucide-react';
import type { CreateAssetData } from '../api/api';

const schema = z.object({
    name: z.string().min(1, '名称不能为空'),
    price: z.number().min(0).optional(),
    category: z.string().optional(),
    purchase_date: z.string().optional(),
    warranty_period: z.number().min(0).optional(),
    description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AssetFormProps {
    initialData?: Partial<CreateAssetData> & { id?: string };
    onSubmit: (data: CreateAssetData) => void;
    onCancel: () => void;
}

export default function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
    const [preview, setPreview] = useState<string | null>(initialData?.image ? URL.createObjectURL(initialData.image) : null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: initialData?.name || '',
            price: initialData?.price,
            category: initialData?.category || '',
            purchase_date: initialData?.purchase_date || '',
            warranty_period: initialData?.warranty_period,
            description: initialData?.description || '',
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const onFormSubmit = (data: FormData) => {
        onSubmit({
            ...data,
            image: selectedFile || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{initialData?.id ? '编辑物品' : '添加物品'}</h2>
                <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* 图片上传 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreview(null);
                                setSelectedFile(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="text-gray-500">
                        <Camera size={48} className="mx-auto mb-2" />
                        <p>点击上传图片</p>
                        <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* 名称 */}
            <div>
                <label className="block text-sm font-medium mb-1">物品名称 *</label>
                <input
                    {...register('name')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：MacBook Pro"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* 价格和分类 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">价格 (¥)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">分类</label>
                    <input
                        {...register('category')}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：电子产品"
                    />
                </div>
            </div>

            {/* 购买日期和保修期 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">购买日期</label>
                    <input
                        type="date"
                        {...register('purchase_date')}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">保修期 (月)</label>
                    <input
                        type="number"
                        {...register('warranty_period', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="12"
                    />
                </div>
            </div>

            {/* 备注 */}
            <div>
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="添加一些备注信息..."
                />
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    取消
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? '保存中...' : '保存'}
                </button>
            </div>
        </form>
    );
}