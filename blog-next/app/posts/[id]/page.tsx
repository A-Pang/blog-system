import type { Metadata, ResolvingMetadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// type NoteObj = {
//   id: number;
//   title: string;
//   content: string;
//   created_at?: string;
// };

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 为文章详情页面添加动态元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    // 获取文章数据
    const { data: note } = await supabase.from('notes').select('title, content').eq('id', id).single();

    if (!note) {
        return {
            title: '文章未找到',
        };
    }

    // 截取内容前160个字符作为描述
    const description = note.content.substring(0, 160) + (note.content.length > 160 ? '...' : '');

    return {
        title: note.title,
        description: description,
        openGraph: {
            title: note.title,
            description: description,
            type: 'article',
        },
    };
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClient();

    // SQL: SELECT * FROM notes WHERE id = $1 LIMIT 1
    // 查询指定ID的文章详情
    // select('*') - 选择所有字段
    // eq('id', id) - 添加 WHERE id = $1 条件
    // single() - 限制结果为单行记录
    const { data: note, error } = await supabase.from('notes').select('*').eq('id', id).single();

    if (error || !note) {
        console.error('Error fetching note:', error);
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <article className="bg-white rounded-lg shadow-md p-6">
                <header>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">{note.title}</h1>
                </header>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
                {note.created_at && <footer className="mt-6 text-sm text-gray-500">创建时间: {new Date(note.created_at).toLocaleString('zh-CN')}</footer>}
            </article>
            <div className="mt-6">
                <Link href="/posts" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    ← 返回文章列表
                </Link>
            </div>
        </div>
    );
}
