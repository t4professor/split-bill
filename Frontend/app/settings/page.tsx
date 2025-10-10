'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Cài đặt giao diện</h1>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Giao diện</div>
          <div className="text-xs text-muted-foreground">Chọn chế độ Sáng hoặc Tối</div>
        </div>
        <div>
          <Button onClick={toggle}>
            {theme === 'light' ? 'Chuyển sang Tối' : 'Chuyển sang Sáng'}
          </Button>
        </div>
      </div>
    </div>
  );
}