// material-ui@v5 will come with input component supporting ref automatically (now its named inputRef)
// with the ref prop we won't need the custom focus login on TextFields components
export const handleFocus = (inputName: string) => () => {
    if (inputName === 'photo') {
        // @ts-ignore
        document.querySelector(`#cover`)?.focus();
    } else {
        // @ts-ignore
        document.querySelector(`[name="${inputName}"]`)?.focus();
    }
};
