const controllers = {};

const clear = (url, isCancelByRepeated) => {
    clearTimeout(controllers[url]?.timeout);
    delete controllers[url];
    if (isCancelByRepeated) throw new Error('isCancelByRepeated');
};

const request = async (url, options = {}, retryCount = 0) => {
    const {
        method = 'GET',
        headers,
        body,
        mode = 'cors',
        cache = 'default',
        retries = 2,
        retryDelay = 1000,
        timeout = 12000,
        cancelMsg,
    } = options;

    // Headers setting
    const defaultHeaders = {
        ...headers,
    };
    if (headers?.['Content-Type'] === undefined)
        defaultHeaders['Content-Type'] = 'application/json';
    else if (headers?.['Content-Type'] === '') delete defaultHeaders['Content-Type'];

    // is Repeated
    if (controllers[url] && retryCount === 0) {
        controllers[url].isRepeated = true;
        controllers[url].cancel.abort();
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Cancel setting
    const controller = new AbortController();
    controllers[url] = { ...controllers[url], cancel: controller };
    const signal = controller.signal;

    // Cancel old repeated
    if (retryCount !== 0 && controllers[url]?.isRepeated) {
        controllers[url].isRepeated = false;
        return false;
    }

    // setTimeout for cancel
    let timeoutId;
    if (timeout) {
        timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);
        controllers[url] = { ...controllers[url], timeout: timeoutId };
    }

    try {
        const res = await fetch(url, {
            method,
            headers: defaultHeaders,
            body,
            mode,
            cache,
            signal,
        });

        clear(url);

        // 401 403
        if (res?.status === 401 || res?.status === 403) {
            // setTimeout(() => {
            //     const homeUrl = import.meta.env.DEV
            //         ? `${import.meta.env.VITE_DOMAIN}/`
            //         : `${import.meta.env.VITE_DOMAIN}/${import.meta.env.VITE_BASE_URL}/`;
            //     window.location.href = homeUrl;
            // }, 300);
            return false;
        }

        // 500
        if (res?.status === 500) {
            return false;
        }

        // Data type
        let data;
        if (defaultHeaders['Content-Type'] === 'text/html') data = await res.text();
        else if (defaultHeaders['responseType'] === 'arraybuffer') data = await res.arrayBuffer();
        else if (res.headers.get('content-type') === 'application/zip') data = await res.blob();
        else data = await res.json();

        // not 200
        if (res?.status !== 200) {
            return false;
        }

        return data;
    } catch (error) {
        const isCancel = error instanceof DOMException && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';

        // return old repeated
        if (controllers[url]?.isRepeated) return clear(url, true);

        // Retry
        if ((isCancel || isNetworkError) && retryCount < retries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return request(url, options, retryCount + 1);
        }

        // Error msg
        clear(url);
        return false;
    }
};

export default request;
