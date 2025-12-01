import { ThumbnailData } from '../types';

// Helper to parse a CSV line handling quotes
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// Helper to clean numeric strings (e.g., "12.5%" -> 12.5, "1,000" -> 1000)
const parseNumber = (str: string): number => {
  if (!str) return 0;
  // Remove %, $, commas, and whitespace
  const clean = str.replace(/[%$,\s]/g, '');
  return parseFloat(clean) || 0;
};

export const parseSheetCSV = (csvText: string): ThumbnailData[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  
  // Helper to find column index with multiple keywords (case-insensitive)
  const getIndex = (keywords: string[]) => 
    headers.findIndex(h => keywords.some(k => h.toLowerCase().includes(k.toLowerCase())));

  // Extended keywords for better matching with user's sheet
  const idxTitle = getIndex(['標題', 'Title', 'name', '影片', 'video']);
  const idxThumb = getIndex(['縮圖', '網址', 'Image', 'Thumbnail', 'url', '封面', '圖片', 'picture']);
  const idxCTR = getIndex(['CTR', '點擊率', '點閱率', 'Click', '點閱']); 
  const idxViews = getIndex(['觀看', 'Views', '流量', '次數']); 
  const idxRating = getIndex(['評鑑', 'Rating', 'Score', 'Grade', '演算法', '評級', '分數']);

  const data: ThumbnailData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    // Allow for rows that might have slightly fewer columns if trailing are empty
    if (cols.length === 0) continue;

    // Safe extraction with fallbacks
    const getCol = (idx: number) => (idx !== -1 && cols[idx]) ? cols[idx].replace(/^"|"$/g, '') : '';

    const title = getCol(idxTitle) || `Video ${i}`;
    const thumbRaw = getCol(idxThumb);
    const ctrRaw = getCol(idxCTR);
    const viewsRaw = getCol(idxViews);
    const ratingRaw = getCol(idxRating) || '-';

    // Strictly require a thumbnail URL or Title to consider it a valid row
    if (!thumbRaw && !title) continue;

    data.push({
      id: `row-${i}`,
      title,
      thumbnailUrl: thumbRaw,
      ctr: parseNumber(ctrRaw),
      views: parseNumber(viewsRaw),
      rating: ratingRaw,
      rawRow: headers.reduce((acc, h, idx) => {
        acc[h] = cols[idx] || '';
        return acc;
      }, {} as Record<string, string>)
    });
  }

  return data;
};

// Fallback data in case of CORS errors
export const getMockData = (): ThumbnailData[] => [
  {
    id: 'mock-1',
    title: '範例: 如何在10分鐘內學會 React',
    thumbnailUrl: 'https://picsum.photos/seed/react/320/180',
    ctr: 12.5,
    views: 15000,
    rating: 'S',
    rawRow: {}
  },
  {
    id: 'mock-2',
    title: '範例: 高 CTR 的秘密',
    thumbnailUrl: 'https://picsum.photos/seed/ctr/320/180',
    ctr: 8.2,
    views: 8500,
    rating: 'A',
    rawRow: {}
  },
  {
    id: 'mock-3',
    title: '範例: 日常 Vlog',
    thumbnailUrl: 'https://picsum.photos/seed/vlog/320/180',
    ctr: 3.5,
    views: 2000,
    rating: 'C',
    rawRow: {}
  },
  {
    id: 'mock-4',
    title: '範例: TypeScript 終極指南',
    thumbnailUrl: 'https://picsum.photos/seed/ts/320/180',
    ctr: 15.1,
    views: 32000,
    rating: 'S+',
    rawRow: {}
  },
    {
    id: 'mock-5',
    title: '範例: 為什麼你的程式碼很慢',
    thumbnailUrl: 'https://picsum.photos/seed/slow/320/180',
    ctr: 5.1,
    views: 4500,
    rating: 'B',
    rawRow: {}
  }
];