import req from '@/config/request';
import { base } from '@/config/apiPath';

// 取得日記清單
export const apiGetRemindList = async params => {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const res = await req(`${base}/remind/list${query}`);
    if (res?.code === 200) return res.data;
    else return false;
};
