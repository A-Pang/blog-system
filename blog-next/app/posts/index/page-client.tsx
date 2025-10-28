'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';

type NoteObj = {
    id: number;
    title: string;
    content: string;
    // 可以根据实际需要添加其他属性
};

// SWR数据获取函数
const fetcher = async (key: string, page: number, itemsPerPage: number) => {
    const supabase = createClient();
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // SQL: SELECT * FROM notes LIMIT $1 OFFSET $2
    // 分页查询文章列表
    // select('*', { count: 'exact' }) - 选择所有字段并精确计算总数
    // range(from, to) - 限制结果范围，实现分页功能
    const { data, error, count } = await supabase.from('notes').select('*', { count: 'exact' }).range(from, to);

    if (error) {
        throw new Error(error.message);
    }

    return {
        notes: data || [],
        total: count !== undefined && count !== null ? count : 0,
    };
};

export default function PostListClient() {
    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
    const [isManaging, setIsManaging] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);
    const router = useRouter();
    const supabase = createClient();

    // const { data, error, isLoading, isValidating, mutate } = useSWR(
    //     key, // 数据的唯一标识（可以是字符串、数组等）
    //     fetcher, // 数据获取函数
    //     options // 配置选项
    // );

    // 使用SWR获取数据
    const { data, error, isValidating } = useSWR(['notes', currentPage, ITEMS_PER_PAGE], ([_, page, itemsPerPage]: [string, number, number]) => fetcher(_, page, itemsPerPage), {
        refreshInterval: 30000, // 30秒刷新一次
        revalidateOnFocus: true, // 窗口获得焦点时重新验证
        errorRetryCount: 3, // 错误重试次数
    });

    // 计算总页数
    const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

    // SQL: DELETE FROM notes WHERE id = $1
    // 删除指定ID的文章
    // delete() - 执行删除操作
    // eq('id', id) - 添加 WHERE id = $1 条件
    const handleDelete = async (id: number) => {
        setDeletingIds((prev) => [...prev, id]);
        const { error } = await supabase.from('notes').delete().eq('id', id);

        if (error) {
            console.error('Error deleting note:', error);
        } else {
            // 成功删除后重新验证数据
            mutate(['notes', currentPage, ITEMS_PER_PAGE]);
            setSelectedNotes(selectedNotes.filter((noteId) => noteId !== id));
        }
        setDeletingIds((prev) => prev.filter((noteId) => noteId !== id));
    };

    // SQL: DELETE FROM notes WHERE id IN ($1, $2, ...)
    // 批量删除多个文章
    // delete() - 执行删除操作
    // in('id', selectedNotes) - 添加 WHERE id IN (...) 条件
    const handleBulkDelete = async () => {
        if (selectedNotes.length === 0) return;

        setBulkDeleting(true);
        const { error } = await supabase.from('notes').delete().in('id', selectedNotes);

        if (error) {
            console.error('Error deleting notes:', error);
        } else {
            // 成功删除后重新验证数据
            mutate(['notes', currentPage, ITEMS_PER_PAGE]);
            setSelectedNotes([]);
        }
        setBulkDeleting(false);
    };

    const handleSelectNote = (id: number) => {
        if (selectedNotes.includes(id)) {
            setSelectedNotes(selectedNotes.filter((noteId) => noteId !== id));
        } else {
            setSelectedNotes([...selectedNotes, id]);
        }
    };

    // 渲染加载状态
    if (isValidating && !data) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">文章列表</h1>
                    <div className="flex gap-2">
                        <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            管理文章
                        </button>
                        <button disabled className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            创建新文章
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="py-8">
                        <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-center mt-2 text-gray-600">加载中...</p>
                    </div>
                </div>
            </div>
        );
    }

    // 渲染错误状态
    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">加载失败! </strong>
                    <span className="block sm:inline">无法获取文章列表: {error.message}</span>
                    <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={() => mutate(['notes', currentPage, ITEMS_PER_PAGE])}>
                        重新加载
                    </button>
                </div>
            </div>
        );
    }

    // 使用SWR获取的数据
    const notes = data?.notes || [];
    const total = data?.total || 0;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">文章列表</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsManaging(!isManaging)} disabled={bulkDeleting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {isManaging ? '退出管理' : '管理文章'}
                    </button>
                    <button onClick={() => router.push('/posts/new')} disabled={isValidating} className={`px-4 py-2 rounded-md flex items-center ${isValidating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                        {isValidating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                跳转中...
                            </>
                        ) : (
                            '创建新文章'
                        )}
                    </button>
                </div>
            </header>

            <main>
                {isManaging && selectedNotes.length > 0 && (
                    <div className="mb-4 p-3 bg-red-100 rounded-md flex justify-between items-center">
                        <span>已选择 {selectedNotes.length} 项</span>
                        <button onClick={handleBulkDelete} disabled={bulkDeleting} className={`px-3 py-1 rounded-md flex items-center ${bulkDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                            {bulkDeleting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    删除中...
                                </>
                            ) : (
                                '批量删除'
                            )}
                        </button>
                    </div>
                )}

                <div className="flex flex-col items-center">
                    {notes.length > 0 ? (
                        <section className="w-full">
                            {notes.map((note: NoteObj) => (
                                <article key={note.id} className="w-full mb-4">
                                    <div className="bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors">
                                        {isManaging && (
                                            <div className="p-3 border-b border-gray-300 flex items-center">
                                                <input type="checkbox" checked={selectedNotes.includes(note.id)} onChange={() => handleSelectNote(note.id)} className="w-4 h-4 text-blue-600 rounded" disabled={deletingIds.includes(note.id) || bulkDeleting} />
                                                <button
                                                    onClick={() => handleDelete(note.id)}
                                                    disabled={deletingIds.includes(note.id) || bulkDeleting}
                                                    className={`ml-2 px-2 py-1 rounded-md text-sm flex items-center ${deletingIds.includes(note.id) || bulkDeleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                                >
                                                    {deletingIds.includes(note.id) ? (
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        '删除'
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        <Link href={`/posts/${note.id}`} className="block p-4">
                                            <h2 className="text-xl font-bold mb-2">{note.title}</h2>
                                            <hr className="border-gray-300 my-2" />
                                            <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{note.content}</p>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </section>
                    ) : (
                        <p className="text-gray-500 py-8">暂无文章</p>
                    )}

                    {/* 分页信息 */}
                    <div className="mt-6 text-center text-gray-600">
                        第 {currentPage} 页，共 {totalPages} 页，总计 {total} 条记录
                    </div>

                    {/* 分页按钮 */}
                    <div className="flex justify-center items-center mt-4">
                        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1 || bulkDeleting} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 mr-2">
                            上一页
                        </button>
                        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || bulkDeleting} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 ml-2">
                            下一页
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
