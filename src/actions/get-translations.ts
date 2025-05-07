"use server"

import fs from 'fs';
import path from 'path';

const translatedData = {
    languageCode: 'vi',
    data: {} as Record<string, string>,
    loadedAt: 0
};

export default async function getTranslations( languageCode: string ) {
    // Tôi muốn load dữ liệu từ các file json trong một thư mục ví dụ như 'languages' với các file name có dạng languageCode.json
    // Ví dụ: 'vi.json', 'en.json', 'jp.json'
    console.log(translatedData.languageCode, languageCode, translatedData.data)
    if (translatedData.languageCode !== languageCode || Object.keys(translatedData.data).length == 0 || translatedData.loadedAt < Date.now() - 1000 * 60 * 60) {
        translatedData.languageCode = languageCode;
        const languagesFolder = path.join(process.cwd(), 'src', 'languages');
        if (!fs.existsSync(path.join(languagesFolder))) {
            throw new Error('Languages folder not found');
        } else {
            if (!languageCode) {
                languageCode = 'vi';
            }
            const translationsPath = path.join(languagesFolder, `${languageCode}.json`)
            if (!fs.existsSync(translationsPath)) {
                throw new Error(`Language file ${languageCode}.json not found`);
            }
            // Đọc file json
            translatedData.data = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
            translatedData.loadedAt = Date.now();
            return translatedData.data;
        }
    } else {
        return translatedData.data;
    }

}