"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import BottomNav from '@/app/components/BottomNav';

export default function ForumPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-16 bg-background">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">社区论坛</h1>
        
        <div className="mb-6 text-center">
          <p className="text-muted-foreground mb-4">
            该功能正在开发中，敬请期待...
          </p>
          
          <Button
            variant="default"
            onClick={() => router.push('/chat')}
            className="w-full max-w-xs mx-auto"
          >
            前往聊天区
          </Button>
        </div>
      </div>
      
      <BottomNav currentTab="chat" isDark={false} />
    </div>
  );
} 