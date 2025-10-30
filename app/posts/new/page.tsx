import type { Metadata } from 'next';
import NewPostClient from './page-client';

export const metadata: Metadata = {
    title: '创建新文章 - 我的博客',
    description: '创建新的博客文章，分享你的想法和见解',
};

export default function NewPost() {
    return <NewPostClient />;
}
