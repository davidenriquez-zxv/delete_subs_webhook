const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const getValue = (object, keys) => {
    keys.forEach(element => {
        object = object[element]
    });
    if (typeof object === undefined) {
        throw "Invalid keys";
    }
    return object;
}

const buildResponse = (statusCode, res, keys) => {
    if (res.status === statusCode) {
        try {
            return {
                success: true,
                data: getValue(res.data, keys)
            };
        } catch (error) {
            return {
                success: false,
                data: error
            };
        }
    }
    return {
        success: false,
        data: res.data
    };
}

export {
    sleep,
    buildResponse
};
