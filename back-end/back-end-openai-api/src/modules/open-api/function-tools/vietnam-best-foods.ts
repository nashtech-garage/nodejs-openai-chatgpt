import * as path from 'path';
import * as fs from 'fs/promises'; // Sử dụng fs.promises để làm việc với async/await

export const vietnamBestFoods = async (count: number): Promise<string> => {
    const filePath = path.join(process.cwd(), './docs/100_vietnamese_dishes.txt');
    console.log('Số lượng: ', count);

    try {
        // Đọc toàn bộ nội dung file một lần
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // Tách nội dung thành từng dòng
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Nếu số lượng yêu cầu lớn hơn hoặc bằng số dòng hiện có, trả về tất cả các dòng
        if (count >= lines.length) {
            return lines.join('\n');
        }

        // Chọn ngẫu nhiên `count` dòng từ mảng `lines`
        const randomLines: string[] = [];
        const usedIndices: Set<number> = new Set();

        while (randomLines.length < count) {
            const randomIndex = Math.floor(Math.random() * lines.length);
            if (!usedIndices.has(randomIndex)) {
                randomLines.push(`- ${lines[randomIndex]}`);
                usedIndices.add(randomIndex);
            }
        }

        return randomLines.join('\n');
    } catch (err) {
        console.error('Lỗi:', err);
        throw err;
    }
};