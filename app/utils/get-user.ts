// app/utils/get-user.ts

import { cache } from 'react';

// cache() تضمین می‌کند که اگر این تابع با همان آرگومان‌ها دوباره فراخوانی شود، نتیجه‌ی قبلی را بازمی‌گرداند بدون اینکه دوباره اجرا شود. این می‌تواند به بهبود عملکرد کمک کند، به خصوص اگر این تابع برای گرفتن داده‌های کاربر از یک منبع خارجی (مانند پایگاه داده یا API) استفاده شود.
// فقط یک بار به DB میزنه
export const getUser = cache(async (id: string) => {
    void id;
    // const user = await prisma.user.findUnique({ where: { id } });
    // return user;
})