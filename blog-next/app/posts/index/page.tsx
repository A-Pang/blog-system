'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type NoteObj = {
    id: number;
    title: string;
    content: string;
    // 可以根据实际需要添加其他属性
};

export default function PostArray() {
    const ITEMS_PER_PAGE = 5;
    const [notes, setNotes] = useState<NoteObj[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
    const [isManaging, setIsManaging] = useState(false);
    // 正确做法：每次渲染时重新计算
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchNotes();
    }, [currentPage]);

    const fetchNotes = async () => {
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // SQL: SELECT * FROM notes LIMIT $1 OFFSET $2
        // 分页查询文章列表
        // select('*', { count: 'exact' }) - 选择所有字段并精确计算总数
        // range(from, to) - 限制结果范围，实现分页功能
        const { data, error, count } = await supabase.from('notes').select('*', { count: 'exact' }).range(from, to);

        if (error) {
            console.error('Error fetching notes:', error);
        } else {
            setNotes(data || []);
            // 确保即使count为undefined或null也正确设置total值
            const newTotal = count !== undefined && count !== null ? count : 0;
            console.log('Setting total to:', newTotal);
            setTotal(newTotal);
            console.log('Total after setTotal:', newTotal);
        }
    };

    // SQL: DELETE FROM notes WHERE id = $1
    // 删除指定ID的文章
    // delete() - 执行删除操作
    // eq('id', id) - 添加 WHERE id = $1 条件
    const handleDelete = async (id: number) => {
        const { error } = await supabase.from('notes').delete().eq('id', id);

        if (error) {
            console.error('Error deleting note:', error);
        } else {
            fetchNotes();
            setSelectedNotes(selectedNotes.filter((noteId) => noteId !== id));
        }
    };

    // SQL: DELETE FROM notes WHERE id IN ($1, $2, ...)
    // 批量删除多个文章
    // delete() - 执行删除操作
    // in('id', selectedNotes) - 添加 WHERE id IN (...) 条件
    const handleBulkDelete = async () => {
        if (selectedNotes.length === 0) return;

        const { error } = await supabase.from('notes').delete().in('id', selectedNotes);

        if (error) {
            console.error('Error deleting notes:', error);
        } else {
            fetchNotes();
            setSelectedNotes([]);
        }
    };

    const handleSelectNote = (id: number) => {
        if (selectedNotes.includes(id)) {
            setSelectedNotes(selectedNotes.filter((noteId) => noteId !== id));
        } else {
            setSelectedNotes([...selectedNotes, id]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4" key={total}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">文章列表</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsManaging(!isManaging)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {isManaging ? '退出管理' : '管理文章'}
                    </button>
                    <Link href="/posts/new" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        创建新文章
                    </Link>
                </div>
            </div>

            {isManaging && selectedNotes.length > 0 && (
                <div className="mb-4 p-3 bg-red-100 rounded-md flex justify-between items-center">
                    <span>已选择 {selectedNotes.length} 项</span>
                    <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
                        批量删除
                    </button>
                </div>
            )}

            <div className="flex flex-col items-center">
                {notes.length > 0 ? (
                    notes.map((note: NoteObj) => (
                        <div key={note.id} className="w-full mb-4">
                            <div className="bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors">
                                {isManaging && (
                                    <div className="p-3 border-b border-gray-300 flex items-center">
                                        <input type="checkbox" checked={selectedNotes.includes(note.id)} onChange={() => handleSelectNote(note.id)} className="w-4 h-4 text-blue-600 rounded" />
                                        <button onClick={() => handleDelete(note.id)} className="ml-2 px-2 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                                            删除
                                        </button>
                                    </div>
                                )}
                                <Link href={`/posts/${note.id}`} className="block p-4">
                                    <h2 className="text-xl font-bold mb-2">{note.title}</h2>
                                    <hr className="border-gray-300 my-2" />
                                    <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{note.content}</p>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 py-8">暂无文章</p>
                )}

                {/* 分页信息 */}
                <div className="mt-6 text-center text-gray-600">
                    第 {currentPage} 页，共 {totalPages} 页，总计 {total} 条记录
                </div>

                {/* 分页按钮 */}
                <div className="flex justify-center items-center mt-4">
                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 mr-2">
                        上一页
                    </button>
                    <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 ml-2">
                        下一页
                    </button>
                </div>
            </div>
        </div>
    );
}
