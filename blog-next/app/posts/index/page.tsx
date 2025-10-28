import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

type NoteObj = {
    id: number;
    title: string;
    // 可以根据实际需要添加其他属性
};

export default async function PostArray() {
    const supabase = await createClient();
    const { data: notes, error } = await supabase.from('notes').select();

    if (error) {
        console.error('Error fetching notes:', error);
    }

    return (
        <>
            {/* <div className="text-[32px] text-center">我的博客</div> */}
            <div className="p-4 box-border w-full flex justify-center items-center flex-col">
                {notes &&
                    notes.map((note: NoteObj) => (
                        <div className=" w-[50%] h-[50px]  bg-gray-300 flex justify-center items-center rounded mb-4 mt-2" key={note.id}>
                            {note.title}
                        </div>
                    ))}
            </div>
            <div className="flex justify-center items-center">
                <button className="p-2 m-2 bg-yellow-100 inline-block rounded-sm">上一页</button>
                <button className="p-2 m-2 bg-yellow-100 inline-block rounded-sm">上一页</button>
            </div>

            <div className="flex justify-center items-center">
                <Link href="/posts/new" className="p-2 m-2 bg-yellow-100 inline-block rounded-sm m-[0 auto]">创建新文章</Link>
            </div>
        </>
    );
}