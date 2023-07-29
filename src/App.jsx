import { useState, useEffect, useMemo } from 'react';
import { apiGetRemindList } from '@/api/base';

function App() {
    const now = new Date();

    const toDateStartTime = time => {
        if (!time) return time;
        time = new Date(time);

        time.setHours(0, 0, 0, 0);
        return time.valueOf();
    };
    const toMonthStartTime = time => {
        if (!time) return time;
        time = new Date(time);

        time.setDate(1);
        time.setHours(0, 0, 0, 0);
        return time.valueOf();
    };
    const formatDateString = time => {
        if (!time) return time;
        time = new Date(Number(time));
        const dayTable = {
            0: '日',
            1: '一',
            2: '二',
            3: '三',
            4: '四',
            5: '五',
            6: '六',
        };

        return { month: time.getMonth() + 1, day: dayTable[time.getDay()], date: time.getDate() };
    };
    const formatTimeString = time => {
        if (!time) return time;
        time = new Date(Number(time));

        const HH = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
        const MM = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
        return `${HH}:${MM}`;
    };

    const [list, setList] = useState([]);
    useEffect(() => {
        const fetchList = async () => {
            const res = await apiGetRemindList({ startTime: toDateStartTime(now), size: 7 });
            setList(res);
        };
        fetchList();
    }, []);
    const showList = useMemo(() => {
        const result = {};
        list.forEach(item => {
            const startMonthTime = toMonthStartTime(item.remindTime);
            const startDateTime = toDateStartTime(item.remindTime);
            if (!result[startMonthTime]) {
                result[startMonthTime] = {};
                if (!result[startMonthTime][startDateTime])
                    result[startMonthTime][startDateTime] = [item];
                else result[startMonthTime][startDateTime].push(item);
            } else {
                if (!result[startMonthTime][startDateTime])
                    result[startMonthTime][startDateTime] = [item];
                else result[startMonthTime][startDateTime].push(item);
            }
        });

        // 若無當月補足當月
        const thisMonthStart = toMonthStartTime(now);
        const thisDateStart = toDateStartTime(now);
        if (!result[thisMonthStart]) {
            result[thisMonthStart] = {};
            if (!result[thisMonthStart][thisDateStart])
                result[thisMonthStart][thisDateStart] = [{ content: '無待辦事項' }];
        } else {
            if (!result[thisMonthStart][thisDateStart])
                result[thisMonthStart][thisDateStart] = [{ content: '無待辦事項' }];
        }

        return result;
    }, [list]);

    const isToday = time => {
        return Number(time) === toDateStartTime(now);
    };

    return (
        <main className="p-4">
            {Object.entries(showList)
                .sort((a, b) => a[0] - b[0])
                .map(monthItem => {
                    return (
                        <section key={monthItem[0]}>
                            <div className="mb-2">{formatDateString(monthItem[0]).month}月</div>
                            {Object.entries(monthItem[1])
                                .sort((a, b) => a[0] - b[0])
                                .map(dateItem => {
                                    return (
                                        <div className="flex gap-2" key={dateItem}>
                                            <div
                                                className={`rounded-full p-1  w-10 h-10 text-xs flex items-center justify-center flex-col ${
                                                    isToday(dateItem[0])
                                                        ? 'text-white bg-blue-600'
                                                        : ''
                                                }`}
                                            >
                                                <div>{formatDateString(dateItem[0]).day}</div>
                                                <div className="text-sm">
                                                    {formatDateString(dateItem[0]).date}
                                                </div>
                                            </div>

                                            <div className="text-white flex-grow">
                                                {dateItem[1].map((timeItem, index) => {
                                                    return (
                                                        <div
                                                            className={`p-2 rounded-lg mb-1 ${
                                                                isToday(dateItem[0])
                                                                    ? 'bg-red-800'
                                                                    : 'bg-blue-500'
                                                            }`}
                                                            key={index}
                                                        >
                                                            <div>{timeItem.content}</div>
                                                            <div>
                                                                {formatTimeString(
                                                                    timeItem.remindTime,
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                        </section>
                    );
                })}
        </main>
    );
}

export default App;
