exports.handler = async (event) => {
    let {name,title} = event;
    return {
        status: 200,
        msg: 'Welcome ' + title + ' ' + name + ' to the world of AWS version 1.0'
    }
};
