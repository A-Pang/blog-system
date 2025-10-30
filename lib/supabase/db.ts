import { createClient as createServerClient } from "./server";

/**
 * 获取 Supabase 数据库客户端实例
 * 用于服务端组件中进行数据库操作
 */
export async function getDbClient() {
  const supabase = await createServerClient();
  return supabase;
}

/**
 * 示例：获取文章列表
 * @param limit 限制返回的文章数量
 */
export async function getPosts(limit: number = 10) {
  const supabase = await getDbClient();
  
  // SQL: SELECT * FROM posts LIMIT $1
  // 查询文章列表并限制返回数量
  // select('*') - 选择所有字段
  // limit(limit) - 限制返回记录数
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .limit(limit);
    
  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  
  return data;
}

/**
 * 示例：根据ID获取单篇文章
 * @param id 文章ID
 */
export async function getPostById(id: number) {
  const supabase = await getDbClient();
  
  // SQL: SELECT * FROM posts WHERE id = $1 LIMIT 1
  // 查询指定ID的文章详情
  // select('*') - 选择所有字段
  // eq('id', id) - 添加 WHERE id = $1 条件
  // single() - 限制结果为单行记录
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * 示例：创建新文章
 * @param post 包含文章数据的对象
 */
export async function createPost(post: { title: string; content: string; author_id: string }) {
  const supabase = await getDbClient();
  
  // SQL: INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *
  // 创建新文章并返回插入的数据
  // insert(post) - 插入新记录
  // select() - 返回插入的记录数据
  // single() - 限制结果为单行记录
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  
  return data;
}

/**
 * 示例：更新文章
 * @param id 文章ID
 * @param updates 要更新的字段对象
 */
export async function updatePost(id: number, updates: Partial<{ title: string; content: string }>) {
  const supabase = await getDbClient();
  
  // SQL: UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *
  // 更新指定ID的文章内容
  // update(updates) - 更新指定字段
  // eq('id', id) - 添加 WHERE id = $3 条件
  // select() - 返回更新后的记录数据
  // single() - 限制结果为单行记录
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating post with id ${id}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * 示例：删除文章
 * @param id 文章ID
 */
export async function deletePost(id: number) {
  const supabase = await getDbClient();
  
  // SQL: DELETE FROM posts WHERE id = $1
  // 删除指定ID的文章
  // delete() - 执行删除操作
  // eq('id', id) - 添加 WHERE id = $1 条件
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting post with id ${id}:`, error);
    throw error;
  }
  
  return true;
}