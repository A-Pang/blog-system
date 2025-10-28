import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

type NoteObj = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  
  // SQL: SELECT * FROM notes WHERE id = $1 LIMIT 1
  // 查询指定ID的文章详情
  // select('*') - 选择所有字段
  // eq('id', id) - 添加 WHERE id = $1 条件
  // single() - 限制结果为单行记录
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !note) {
    console.error('Error fetching note:', error);
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{note.title}</h1>
        <div className="border-t border-gray-200 my-4"></div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
        </div>
        {note.created_at && (
          <div className="mt-6 text-sm text-gray-500">
            创建时间: {new Date(note.created_at).toLocaleString('zh-CN')}
          </div>
        )}
      </div>
      <div className="mt-6">
        <a 
          href="/posts" 
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          ← 返回文章列表
        </a>
      </div>
    </div>
  );
}