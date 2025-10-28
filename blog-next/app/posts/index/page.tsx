import type { Metadata } from 'next';
import PostListClient from './page-client';

export const metadata: Metadata = {
    title: '文章列表 - 我的博客',
    description: '浏览所有博客文章，发现有趣的内容和见解',
};

export default function PostArray() {
    return <PostListClient />;
}
