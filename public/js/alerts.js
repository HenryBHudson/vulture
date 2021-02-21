/* eslint-disable */
export const hideAlert = () => {
    const el = document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el);
}

export const showAlert = (type, msg) => { //type = 'success' or' 'error'
    const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup) //afterbegin means after body, at the start.
    window.setTimeout(hideAlert, 3000);
}