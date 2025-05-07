"use server";

import { cookies } from "next/headers";

export async function setLanguage(lang: string) {
    (await cookies()).set("lang", lang, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 365, // 1 năm
    });
}