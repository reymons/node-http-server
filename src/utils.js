export function removeEndSlashes(str) {
    let i;

    for (i = str.length; i > 1; i--) {
        if (str[i - 1] != '/') break;
    }

    return str.substring(0, i);
}
