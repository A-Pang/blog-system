'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // SQL: INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *
            // 创建新文章并返回插入的数据
            // insert([{ title, content }]) - 插入包含标题和内容的新记录
            // select() - 返回插入的记录数据
            const { data, error } = await supabase.from('notes').insert([{ title, content }]).select();

            if (error) {
                throw error;
            }

            // 成功后跳转到文章列表页
            router.push('/posts');
            router.refresh();
        } catch (error) {
            console.error('Error inserting note:', error);
            alert('Error creating note: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">创建新文章</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        标题
                    </label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="输入文章标题" />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-1">
                        内容
                    </label>
                    <textarea 
                        id="content" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]" 
                        placeholder="输入文章内容" 
                    />
                </div>

                <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                        {loading ? '创建中...' : '创建文章'}
                    </button>

                    <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        取消
                    </button>
                </div>
            </form>
        </div>
    );
}