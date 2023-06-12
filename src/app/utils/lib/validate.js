function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

function isEmpty (str) {
    return (!str || str.length === 0);
}

function checkEmptyForm(content, answerA, answerB, answerC, answerD) {
    var check = !isEmpty(content) && !isEmpty(answerA) && !isEmpty(answerB)
        && !isEmpty(answerC) && !isEmpty(answerD);

    return check;
}

function makeSlug(name) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;

    result += name.replace(" ","-");
    result += "-";

    while (counter < 9) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = {isEmpty,checkEmptyForm,makeSlug,isNumber}