import { createClient } from '@/lib/supabase/server';

type NoteObj = {
  id: number;
  title: string;
  // 可以根据实际需要添加其他属性
};

export default async function PostArray() {
  const supabase =  await createClient();
  const { data: notes, error } = await supabase.from("notes").select();

  if (error) {
    console.error("Error fetching notes:", error);
  }

  return (
    <div>
      {notes && notes.map((note: NoteObj) => (
        <div className='h-[200px] w-full  bg-green-400 flex justify-center items-center rounded mb-4 mt-2' key={note.id}>
          {note.title}
        </div>
      ))}
    </div>
  );
}